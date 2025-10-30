import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-guard'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const { email, role } = await req.json() // role in WESR_ADMIN|PROVIDER|INSTRUCTOR|LEARNER
  if (!email || !role) return NextResponse.json({error:'email and role required'}, {status:400})
  
  const supa = supabaseService()
  const { data: users, error: e1 } = await supa.auth.admin.listUsers()
  if (e1) return NextResponse.json({error:e1.message}, {status:500})
  
  const user = users.users?.find(u => u.email === email)
  if (!user) return NextResponse.json({error:'user not found'}, {status:404})
  
  const { error: e2 } = await supa.from('roles').insert({ user_id: user.id, role })
  if (e2) return NextResponse.json({error:e2.message}, {status:500})
  
  return NextResponse.json({ok:true, user_id:user.id})
}
