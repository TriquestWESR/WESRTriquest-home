import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { code, userId, answers } = await req.json()
  // Score per section, award endorsements for >=0.80, insert attempts + billing_usage (first issuance only), create certificate or append endorsements (24 mo expiry)
  return NextResponse.json({ sectionScores:{}, endorsementsAwarded:[] })
}
