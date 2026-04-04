import { NextResponse } from 'next/server'
import { isValidEmail, requireFields } from '@/lib/validation'

export async function POST(request: Request) {
  const body = await request.json()
  const validationError = requireFields(body, ['fullName', 'email', 'password'])

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: 'email is invalid' }, { status: 400 })
  }

  return NextResponse.json(
    {
      message: 'Developer account registered',
      user: {
        id: 'user_new',
        fullName: body.fullName,
        email: body.email,
      },
    },
    { status: 201 }
  )
}
