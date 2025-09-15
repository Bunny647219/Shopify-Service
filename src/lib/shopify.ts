import { prisma } from './prisma'

export async function upsertCustomer(data: unknown, tenantId: string) {
  await prisma.customer.upsert({
    where: { shopifyId: data.id.toString() },
    update: {
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
    },
    create: {
      shopifyId: data.id.toString(),
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      tenantId,
    },
  })
}

export async function upsertProduct(data: unknown, tenantId: string) {
  await prisma.product.upsert({
    where: { shopifyId: data.id.toString() },
    update: {
      title: data.title,
      price: parseFloat(data.variants[0]?.price || 0),
    },
    create: {
      shopifyId: data.id.toString(),
      title: data.title,
      price: parseFloat(data.variants[0]?.price || 0),
      tenantId,
    },
  })
}

export async function upsertOrder(data: unknown, tenantId: string) {
  // First, ensure customer exists
  if (data.customer) {
    await upsertCustomer(data.customer, tenantId)
  }

  const customerId = data.customer ? await prisma.customer.findUnique({
    where: { shopifyId: data.customer.id.toString() },
    select: { id: true }
  }).then(c => c?.id) : null

  const order = await prisma.order.upsert({
    where: { shopifyId: data.id.toString() },
    update: {
      customerId,
      totalPrice: parseFloat(data.total_price),
    },
    create: {
      shopifyId: data.id.toString(),
      customerId,
      totalPrice: parseFloat(data.total_price),
      tenantId,
    },
  })

  // Upsert order items
  for (const item of data.line_items) {
    const product = await prisma.product.findUnique({
      where: { shopifyId: item.product_id.toString() },
      select: { id: true }
    })
    if (product) {
      await prisma.orderItem.upsert({
        where: { id: `${order.id}-${item.id}` }, // composite key or use cuid
        update: {
          quantity: item.quantity,
          price: parseFloat(item.price),
        },
        create: {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: parseFloat(item.price),
        },
      })
    }
  }
}

export async function createEvent(type: string, data: unknown, tenantId: string) {
  await prisma.event.create({
    data: {
      type,
      data,
      tenantId,
    },
  })
}
