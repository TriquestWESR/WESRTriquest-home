import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from './supabase-server'

export async function requireAdmin(req: NextRequest) {
  const supa = supabaseService()
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i,'')
  if (!token) return NextResponse.json({error:'unauthorized'}, {status:401})
  
  const { data: { user }, error } = await supa.auth.getUser(token)
  if (error || !user) return NextResponse.json({error:'unauthorized'}, {status:401})
  
  const { data: roles } = await supa.from('roles').select('role').eq('user_id', user.id)
  if (!roles?.some(r => r.role === 'WESR_ADMIN')) {
    return NextResponse.json({error:'forbidden'}, {status:403})
  }
  
  return { supa, user }
}
