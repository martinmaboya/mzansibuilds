import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { requireFields } from '@/lib/validation'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const comments = store.comments.filter((item) => item.projectId === params.id)
  return NextResponse.json({ comments })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const validationError = requireFields(body, ['message'])

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const comment = {
    id: `comment_${store.comments.length + 1}`,
    projectId: params.id,
    authorId: 'user_1',
    message: body.message,
    createdAt: new Date().toISOString(),
  }

  store.comments.unshift(comment)
  return NextResponse.json({ comment }, { status: 201 })
}
