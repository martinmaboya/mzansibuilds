import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { requireFields } from '@/lib/validation'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = store.projects.find((item) => item.id === params.id)

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const project = store.projects.find((item) => item.id === params.id)

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const body = await request.json()
  const validationError = requireFields(body, ['title', 'description', 'stage', 'supportRequired'])

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  project.title = body.title
  project.description = body.description
  project.stage = body.stage
  project.supportRequired = body.supportRequired
  project.updatedAt = new Date().toISOString()

  return NextResponse.json({ project })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const projectIndex = store.projects.findIndex((item) => item.id === params.id)

  if (projectIndex === -1) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const [removedProject] = store.projects.splice(projectIndex, 1)

  return NextResponse.json({ project: removedProject })
}
