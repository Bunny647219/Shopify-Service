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
    const topProducts = await prisma.$queryRaw`
      SELECT p.id, p.title, p.price, SUM(oi.quantity) as totalSold, SUM(oi.quantity * oi.price) as totalRevenue
      FROM Product p
      JOIN OrderItem oi ON p.id = oi.productId
      WHERE p.tenantId = ${tenantId}
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT 5
    ` as { id: string, title: string, price: number, totalSold: number, totalRevenue: number }[]

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
