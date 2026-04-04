import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { requireFields } from '@/lib/validation'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const updates = store.progressUpdates.filter((item) => item.projectId === params.id)
  return NextResponse.json({ updates })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const validationError = requireFields(body, ['milestone', 'note'])

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const update = {
    id: `update_${store.progressUpdates.length + 1}`,
    projectId: params.id,
    authorId: 'user_1',
    milestone: body.milestone,
    note: body.note,
    createdAt: new Date().toISOString(),
  }

  store.progressUpdates.unshift(update)

  return NextResponse.json({ update }, { status: 201 })
}
