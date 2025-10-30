import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  
  // 1) Fetch class by code
  const { data: classData, error: classError } = await supabaseAdmin
    .from('classes')
    .select('*')
    .eq('code', code)
    .single()
  
  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }
  
  // 2) Fetch admin config for difficulty mix
  const { data: config } = await supabaseAdmin
    .from('admin_config')
    .select('difficulty_mix')
    .eq('id', true)
    .single()
  
  const mix = config?.difficulty_mix || { easy: 0.6, medium: 0.3, hard: 0.1 }
  
  // 3) Fetch TR sections in this class
  const { data: sections } = await supabaseAdmin
    .from('tr_sections')
    .select('*')
    .in('id', classData.selected_sections)
  
  if (!sections || sections.length === 0) {
    return NextResponse.json({ error: 'No sections found' }, { status: 404 })
  }
  
  // 4) Build blueprint: for each section, pick questions by difficulty mix
  const items: any[] = []
  const sectionsSummary = sections.map(s => ({
    id: s.id,
    title: s.title,
    count: s.question_count,
    mix
  }))
  
  for (const section of sections) {
    const totalCount = section.question_count
    const easyCount = Math.floor(totalCount * mix.easy)
    const mediumCount = Math.floor(totalCount * mix.medium)
    const hardCount = totalCount - easyCount - mediumCount
    
    // Fetch questions from pool (not retired, matching section tags)
    const { data: easyQ } = await supabaseAdmin
      .from('questions')
      .select('id, prompt, choices, type')
      .contains('section_tags', [section.id])
      .eq('difficulty', 1)
      .eq('retired', false)
      .limit(easyCount)
    
    const { data: mediumQ } = await supabaseAdmin
      .from('questions')
      .select('id, prompt, choices, type')
      .contains('section_tags', [section.id])
      .eq('difficulty', 2)
      .eq('retired', false)
      .limit(mediumCount)
    
    const { data: hardQ } = await supabaseAdmin
      .from('questions')
      .select('id, prompt, choices, type')
      .contains('section_tags', [section.id])
      .eq('difficulty', 3)
      .eq('retired', false)
      .limit(hardCount)
    
    const allQ = [...(easyQ || []), ...(mediumQ || []), ...(hardQ || [])]
    
    for (const q of allQ) {
      items.push({
        qId: q.id,
        sectionId: section.id,
        prompt: q.prompt,
        choices: q.choices,
        type: q.type
      })
    }
  }
  
  return NextResponse.json({ sections: sectionsSummary, items, timeLimit: null })
}
