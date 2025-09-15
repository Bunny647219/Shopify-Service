import Shopify from 'shopify-api-node'
import { prisma } from './prisma'
import { upsertCustomer, upsertProduct, upsertOrder } from './shopify'

export async function syncTenant(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw new Error('Tenant not found')

  const shopify = new Shopify({
    shopName: tenant.shopifyDomain.replace('.myshopify.com', ''),
    accessToken: tenant.accessToken,
  })

  // Sync customers
  const customers = await shopify.customer.list()
  for (const c of customers) {
    await upsertCustomer(c, tenantId)
  }

  // Sync products
  const products = await shopify.product.list()
  for (const p of products) {
    await upsertProduct(p, tenantId)
  }

  // Sync orders
  const orders = await shopify.order.list()
  for (const o of orders) {
    await upsertOrder(o, tenantId)
  }
}
