import { NextRequest, NextResponse } from 'next/server'
import { syncTenant } from '@/lib/sync'

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

export async function POST(req: NextRequest, { params }: { params: { tenantId: string } }) {
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

  const { tenantId } = params

  try {
    await syncTenant(tenantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
