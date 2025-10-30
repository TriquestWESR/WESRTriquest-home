import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { code } = await req.json()
  // Fetch class by code, build blueprint from locked difficulty + admin question counts
  // Return shape: { sections:[{id,title,count,mix}], items:[{qId, sectionId, choicesWithoutAnswers}], timeLimit:null }
  return NextResponse.json({ sections:[], items:[] })
}
