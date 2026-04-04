import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const project = store.projects.find((item) => item.id === params.id)

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  project.completed = true
  project.stage = 'Completed'
  project.updatedAt = new Date().toISOString()

  return NextResponse.json({ project })
}
