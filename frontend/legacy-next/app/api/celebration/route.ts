import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET() {
  const completedProjects = store.projects.filter((item) => item.completed)
  return NextResponse.json({ completedProjects })
}
