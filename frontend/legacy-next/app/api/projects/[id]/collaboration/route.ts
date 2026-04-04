import { NextResponse } from 'next/server'
import { store } from '@/lib/store'
import { requireFields } from '@/lib/validation'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const validationError = requireFields(body, ['message'])

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const requestItem = {
    id: `request_${store.collaborationRequests.length + 1}`,
    projectId: params.id,
    requesterId: 'user_1',
    message: body.message,
    status: 'Open' as const,
    createdAt: new Date().toISOString(),
  }

  store.collaborationRequests.unshift(requestItem)

  return NextResponse.json({ collaborationRequest: requestItem }, { status: 201 })
}
