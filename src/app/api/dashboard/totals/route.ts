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
    const customerCount = await prisma.customer.count({ where: { tenantId } })
    const orderCount = await prisma.order.count({ where: { tenantId } })
    const revenue = await prisma.order.aggregate({
      where: { tenantId },
      _sum: { totalPrice: true },
    })

    return NextResponse.json({
      customers: customerCount,
      orders: orderCount,
      revenue: revenue._sum.totalPrice || 0,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
