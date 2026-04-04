import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    user: {
      id: 'user_1',
      fullName: 'Martin Maboya',
      email: 'martin@example.com',
      bio: 'Backend-first builder preparing the MzansiBuilds assessment submission.',
    },
  })
}
