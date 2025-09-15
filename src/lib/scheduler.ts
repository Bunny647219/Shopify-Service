import cron from 'node-cron'
import { prisma } from './prisma'
import { syncTenant } from './sync'

export function startScheduler() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily sync for all tenants')

    try {
      const tenants = await prisma.tenant.findMany()

      for (const tenant of tenants) {
        try {
          await syncTenant(tenant.id)
          console.log(`Synced data for tenant ${tenant.name}`)
        } catch (error) {
          console.error(`Failed to sync tenant ${tenant.name}:`, error)
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error)
    }
  })

  console.log('Scheduler started')
}
