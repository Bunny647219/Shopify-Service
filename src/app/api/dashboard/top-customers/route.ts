import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = session.user.tenantId

  try {
    const topCustomers = await prisma.$queryRaw`
      SELECT c.id, c.email, c.firstName, c.lastName, SUM(o.totalPrice) as totalSpent
      FROM Customer c
      JOIN Order o ON c.id = o.customerId
      WHERE c.tenantId = ${tenantId}
      GROUP BY c.id
      ORDER BY totalSpent DESC
      LIMIT 5
    ` as { id: string, email: string, firstName: string, lastName: string, totalSpent: number }[]

    return NextResponse.json(topCustomers)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
