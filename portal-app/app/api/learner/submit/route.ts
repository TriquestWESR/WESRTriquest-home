import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { code, userId, answers } = await req.json()
  // answers: [{qId, selectedIndexes: number[]}]
  
  // 1) Fetch class
  const { data: classData } = await supabaseAdmin
    .from('classes')
    .select('*')
    .eq('code', code)
    .single()
  
  if (!classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }
  
  // 2) Fetch admin config
  const { data: config } = await supabaseAdmin
    .from('admin_config')
    .select('pass_threshold, expiry_months')
    .eq('id', true)
    .single()
  
  const passThreshold = config?.pass_threshold || 0.8
  const expiryMonths = config?.expiry_months || 24
  
  // 3) Score answers
  const items: any[] = []
  const sectionScores: Record<string, { correct: number; total: number }> = {}
  
  for (const ans of answers) {
    const { data: q } = await supabaseAdmin
      .from('questions')
      .select('answer_key, section_tags')
      .eq('id', ans.qId)
      .single()
    
    if (!q) continue
    
    const correct = JSON.stringify(q.answer_key.sort()) === JSON.stringify((ans.selectedIndexes || []).sort())
    const sectionId = q.section_tags[0] // assume first tag
    
    if (!sectionScores[sectionId]) sectionScores[sectionId] = { correct: 0, total: 0 }
    sectionScores[sectionId].total++
    if (correct) sectionScores[sectionId].correct++
    
    items.push({ qId: ans.qId, sectionId, ok: correct })
  }
  
  // 4) Award endorsements
  const endorsementsAwarded: string[] = []
  const endorsements: any[] = []
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + expiryMonths)
  
  for (const [sectionId, score] of Object.entries(sectionScores)) {
    const pct = score.correct / score.total
    if (pct >= passThreshold) {
      endorsementsAwarded.push(sectionId)
      endorsements.push({
        sectionId,
        version: classData.version_lock[sectionId] || '1.0.0',
        grantedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      })
    }
  }
  
  // 5) Insert attempt
  await supabaseAdmin.from('attempts').insert({
    user_identifier: userId,
    class_id: classData.id,
    items,
    section_scores: sectionScores,
    endorsements_awarded: endorsementsAwarded
  })
  
  // 6) Billing usage (first issuance only)
  if (endorsementsAwarded.length > 0) {
    await supabaseAdmin.from('billing_usage').insert({
      provider_id: classData.provider_id,
      class_id: classData.id,
      user_identifier: userId
    }).select().single() // on conflict do nothing (unique constraint)
  }
  
  // 7) Create or update certificate
  const verifyHash = crypto.randomBytes(16).toString('hex')
  const { data: existingCert } = await supabaseAdmin
    .from('certificates')
    .select('*')
    .eq('user_identifier', userId)
    .single()
  
  if (existingCert) {
    // Append endorsements
    const merged = [...existingCert.endorsements, ...endorsements]
    await supabaseAdmin
      .from('certificates')
      .update({ endorsements: merged })
      .eq('id', existingCert.id)
  } else {
    // Create new
    await supabaseAdmin.from('certificates').insert({
      user_identifier: userId,
      endorsements,
      verify_hash: verifyHash
    })
  }
  
  return NextResponse.json({ sectionScores, endorsementsAwarded, verifyHash })
}
