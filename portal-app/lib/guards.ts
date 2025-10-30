import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from './supabase-server'

export async function requireProvider(req: NextRequest) {
  const supa = supabaseService()
  const hdr = req.headers.get('authorization') || ''
  const token = hdr.replace(/^Bearer\s+/i,'')
  if (!token) return NextResponse.json({error:'unauthorized'}, {status:401})
  const { data: { user }, error } = await supa.auth.getUser(token)
  if (error || !user) return NextResponse.json({error:'unauthorized'}, {status:401})
  // Must have global PROVIDER role
  const { data: roles } = await supa.from('roles').select('role').eq('user_id', user.id)
  const isProvider = roles?.some(r => r.role === 'PROVIDER')
  if (!isProvider) return NextResponse.json({error:'forbidden'}, {status:403})
  // Map to provider_id
  const { data: pu } = await supa.from('provider_users').select('provider_id').eq('user_id', user.id).limit(1)
  if (!pu || pu.length === 0) return NextResponse.json({error:'no_provider_mapping'}, {status:403})
  return { supa, user, providerId: pu[0].provider_id }
}
