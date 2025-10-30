import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
export async function POST(req: NextRequest) {
  const body = await req.json()
  // expects {providerId, selectedSections: string[], disciplines: string[], roles: string[], versionLock: Record<string,string>}
  const code = 'WTRQ-' + (body.disciplines?.[0]||'GEN').toString().substring(0,3).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase()
  return NextResponse.json({code})
}
