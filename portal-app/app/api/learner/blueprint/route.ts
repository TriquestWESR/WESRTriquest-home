import { NextRequest, NextResponse } from 'next/server'
import { buildBlueprintByCode } from '@/lib/blueprint'

export async function POST(req: NextRequest) {
  try {
    const { code, locale } = await req.json()
    if (!code) return NextResponse.json({error:'missing_code'}, {status:400})
    const bp = await buildBlueprintByCode(code, locale || 'en')
    return NextResponse.json(bp)
  } catch (e:any) {
    return NextResponse.json({error: e.message || 'blueprint_error'}, {status:400})
  }
}
 
