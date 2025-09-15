import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || 'admin'
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS || 'password'

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Basic ')) {
    return unauthorized()
  }

  const base64Credentials = auth.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
  const [username, password] = credentials.split(':')

  if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASS) {
    return unauthorized()
  }

  const body = await req.json()
  const { name, shopifyDomain, accessToken } = body

  if (!name || !shopifyDomain || !accessToken) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopifyDomain,
        accessToken,
      },
    })
    return NextResponse.json({ success: true, tenantId: tenant.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
