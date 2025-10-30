import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'
import type { AdminConfig, Question } from '@/lib/types'
import crypto from 'crypto'

type AnswerIn = { qId:string; choiceIndexes:number[] }  // for multi, list indices; for mcq, single-element list

function eqSet(a:number[], b:number[]) {
  if (a.length !== b.length) return false
  const sa = new Set(a), sb = new Set(b)
  for (const x of sa) if (!sb.has(x)) return false
  return true
}

export async function POST(req: NextRequest) {
  const supa = supabaseService()
  const body = await req.json()
  const { code, userIdentifier, answers } = body as { code:string; userIdentifier:string; answers:AnswerIn[] }
  if (!code || !userIdentifier || !Array.isArray(answers)) {
    return NextResponse.json({error:'missing_fields'}, {status:400})
  }

  // Load class + admin config
  const { data: klass, error: cErr } = await supa.from('classes').select('*').eq('code', code).limit(1).single()
  if (cErr || !klass) return NextResponse.json({error:'class_not_found'}, {status:404})
  const { data: cfg, error: aErr } = await supa.from('admin_config').select('*').limit(1).single()
  if (aErr || !cfg) return NextResponse.json({error:'config_error'}, {status:500})

  const selected: string[] = klass.selected_sections
  const passThresh = (cfg as AdminConfig).pass_threshold ?? 0.80
  const expMonths  = (cfg as AdminConfig).expiry_months ?? 24

  // Fetch all questions referenced in answers
  const qIds = answers.map(a=>a.qId)
  const { data: qrows, error: qErr } = await supa.from('questions').select('*').in('id', qIds)
  if (qErr) return NextResponse.json({error:qErr.message}, {status:500})
  const qmap = new Map<string, Question>((qrows||[]).map((q:any)=>[q.id, q]))

  // Score per section
  const perSectionTotals: Record<string, { total:number; correct:number }> = {}
  const itemResults: { qId:string; sectionId:string; ok:boolean }[] = []

  for (const a of answers) {
    const q = qmap.get(a.qId)
    if (!q) continue
    // Only count if question belongs to a selected section
    const sectionId = selected.find(s => q.section_tags.includes(s))
    if (!sectionId) continue
    const key = (q.answer_key||[]).sort((x,y)=>x-y)
    const choice = (a.choiceIndexes||[]).sort((x,y)=>x-y)
    const ok = q.type === 'multi' ? eqSet(key, choice) : (key.length===1 && choice.length===1 && key[0]===choice[0])

    perSectionTotals[sectionId] = perSectionTotals[sectionId] || { total:0, correct:0 }
    perSectionTotals[sectionId].total += 1
    perSectionTotals[sectionId].correct += ok ? 1 : 0

    itemResults.push({ qId: a.qId, sectionId, ok })
  }

  // Compute scores and endorsements
  const sectionScores: Record<string, number> = {}
  const endorsementsAwarded: { sectionId:string; version:string; grantedAt:string; expiresAt:string }[] = []
  const now = new Date()
  const expires = new Date(now); expires.setMonth(expires.getMonth() + expMonths)

  for (const s of selected) {
    const t = perSectionTotals[s] || { total: 0, correct: 0 }
    const score = t.total > 0 ? t.correct / t.total : 0
    sectionScores[s] = Math.round(score * 100) / 100
    if (score >= passThresh) {
      const version = (klass.version_lock || {})[s] || '1.0.0'
      endorsementsAwarded.push({
        sectionId: s,
        version,
        grantedAt: now.toISOString(),
        expiresAt: expires.toISOString()
      })
    }
  }

  // Insert attempt
  const { data: attemptIns, error: attErr } = await supa.from('attempts').insert({
    user_identifier: userIdentifier,
    class_id: klass.id,
    items: itemResults,
    section_scores: sectionScores,
    endorsements_awarded: endorsementsAwarded.map(e=>e.sectionId)
  }).select('id').limit(1).single()
  if (attErr) return NextResponse.json({error:attErr.message}, {status:500})

  // Upsert certificate (append new endorsements, keep existing ones)
  const { data: existingCert } = await supa.from('certificates').select('*').eq('user_identifier', userIdentifier).limit(1).single()
  let certId = existingCert?.id
  let endorsements = existingCert?.endorsements || []
  const existingKey = new Set(endorsements.map((e:any)=>`${e.sectionId}#${e.version}`))
  for (const e of endorsementsAwarded) {
    const key = `${e.sectionId}#${e.version}`
    if (!existingKey.has(key)) { endorsements.push(e) }
  }

  if (existingCert) {
    const { error: uErr } = await supa.from('certificates').update({ endorsements }).eq('id', existingCert.id)
    if (uErr) return NextResponse.json({error:uErr.message}, {status:500})
  } else {
    const verify_hash = crypto.randomBytes(16).toString('hex')
    const { data: newCert, error: cErr2 } = await supa.from('certificates').insert({
      user_identifier: userIdentifier,
      endorsements,
      verify_hash
    }).select('id').limit(1).single()
    if (cErr2) return NextResponse.json({error:cErr2.message}, {status:500})
    certId = newCert?.id
  }

  // Billing usage (per participant per class at first issuance)
  if (endorsementsAwarded.length > 0) {
    try {
      await supa.from('billing_usage').insert({
        provider_id: klass.provider_id,
        class_id: klass.id,
        user_identifier: userIdentifier
      })
    } catch {}
  }

  /* EMAIL: certificate issued */
  try {
    const verifyHashRes = await supa.from('certificates').select('verify_hash').eq('user_identifier', userIdentifier).limit(1).single()
    const verifyHash = (verifyHashRes.data?.verify_hash)||''
  const verifyUrl = `${process.env.NEXT_PUBLIC_PORTAL_BASE ?? ''}/verify/${verifyHash}`
    const to = (userIdentifier.includes('@') ? userIdentifier : null)
    if (to) {
      const { sendMail } = await import('@/lib/email')
      const { auditLog } = await import('@/lib/audit')
      await sendMail(to, 'WESR Certificate issued', `<p>Your WESR endorsements have been issued.</p><p>Verify here: <a href="${verifyUrl}">${verifyUrl}</a></p>`)
      await auditLog({ action:'email_certificate_issued', target_table:'certificates', meta:{ userIdentifier, verifyUrl } })
    }
  } catch {}

  return NextResponse.json({
    ok: true,
    attemptId: attemptIns?.id,
    sectionScores,
    endorsementsAwarded
  })
}
