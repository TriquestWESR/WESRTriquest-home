import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  // List all TR sections
  const { data, error } = await supabaseAdmin
    .from('tr_sections')
    .select('*')
    .order('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // expects {id, title, version, disciplines, roles, question_count}
  const { data, error } = await supabaseAdmin
    .from('tr_sections')
    .upsert(body, { onConflict: 'id' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
