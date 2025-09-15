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
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  let whereClause = `tenantId = '${tenantId}'`
  if (start && end) {
    whereClause += ` AND createdAt >= '${start}' AND createdAt <= '${end}'`
  }

  try {
    const revenue = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, SUM(totalPrice) as revenue
      FROM Order
      WHERE ${whereClause}
      GROUP BY DATE(createdAt)
      ORDER BY date
    ` as { date: string, revenue: number }[]

    return NextResponse.json(revenue)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
