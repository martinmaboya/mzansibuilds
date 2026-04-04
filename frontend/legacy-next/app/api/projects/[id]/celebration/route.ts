import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = store.projects.find((item) => item.id === params.id)

  if (!project || !project.completed) {
    return NextResponse.json({ error: 'Project is not on the Celebration Wall yet' }, { status: 404 })
  }

  return NextResponse.json({ project })
}
