import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { requireFields } from '@/lib/validation'
import { Project } from '@/lib/types'

export async function GET() {
  return NextResponse.json({ projects: store.projects })
}

export async function POST(request: Request) {
  const body = await request.json()
  const validationError = requireFields(body, ['title', 'description', 'stage', 'supportRequired'])

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const project: Project = {
    id: `project_${store.projects.length + 1}`,
    ownerId: 'user_1',
    ownerName: 'Martin Maboya',
    title: body.title,
    description: body.description,
    stage: body.stage,
    supportRequired: body.supportRequired,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  store.projects.unshift(project)

  return NextResponse.json({ project }, { status: 201 })
}
