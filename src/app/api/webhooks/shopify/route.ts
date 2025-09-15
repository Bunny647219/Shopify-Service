import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { upsertCustomer, upsertProduct, upsertOrder, createEvent } from '@/lib/shopify'

function verifyWebhook(req: NextRequest, body: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  const receivedHmac = req.headers.get('x-shopify-hmac-sha256')
  return receivedHmac === hmac
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET!

  if (!verifyWebhook(req, body, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = JSON.parse(body)
  const topic = req.headers.get('x-shopify-topic')
  const shopDomain = req.headers.get('x-shopify-shop-domain')

  const tenant = await prisma.tenant.findUnique({
    where: { shopifyDomain: shopDomain! }
  })

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  try {
    switch (topic) {
      case 'customers/create':
      case 'customers/update':
        await upsertCustomer(data, tenant.id)
        break
      case 'products/create':
      case 'products/update':
        await upsertProduct(data, tenant.id)
        break
      case 'orders/create':
      case 'orders/update':
        await upsertOrder(data, tenant.id)
        break
      case 'checkouts/create':
        // Assume if checkout not completed, it's abandoned
        if (!data.completed_at) {
          await createEvent('cart_abandoned', data, tenant.id)
        }
        break
      default:
        console.log(`Unhandled topic: ${topic}`)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
