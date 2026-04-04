import { NextResponse } from 'next/server'
import { feedItems } from '@/lib/challenge-data'

export async function GET() {
  return NextResponse.json({ feed: feedItems })
}
