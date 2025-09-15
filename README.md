# Multi-Tenant Shopify Data Ingestion & Insights Service

## Overview
This project is a multi-tenant data ingestion and insights service for Shopify stores. It allows enterprise retailers to onboard their Shopify stores, ingest customer, order, product, and event data, and visualize key business metrics in a dashboard.

## Tech Stack
- Backend & Frontend: Next.js (React)
- Database: MySQL with Prisma ORM
- Authentication: NextAuth (email/password)
- Charting: Recharts
- Deployment: Vercel

## Features
- Multi-tenant architecture with data isolation by tenant
- Shopify API integration for customers, orders, products, and custom events
- Webhook handlers for real-time data sync
- Bulk sync API for initial data ingestion
- Email/password authentication for tenants
- Dashboard with total customers, orders, revenue, orders by date, top customers by spend
- Basic tenant onboarding API with basic auth

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL database
- Shopify Partner account and development store

### Environment Variables
Create a `.env` file in the root with:

```
DATABASE_URL="mysql://user:password@host:port/dbname"
BASIC_AUTH_USER="admin"
BASIC_AUTH_PASS="yourpassword"
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret"
NEXTAUTH_SECRET="your_nextauth_secret"
```

### Install Dependencies
```bash
npm install
```

### Prisma Setup
```bash
npx prisma migrate dev --name init
```

### Run Development Server
```bash
npm run dev
```

### Shopify Setup
See [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md) for detailed instructions on creating a Shopify dev store, app, and onboarding tenants.

## API Endpoints

- `POST /api/onboard` - Tenant onboarding (basic auth)
- `POST /api/sync/[tenantId]` - Trigger bulk sync (basic auth)
- `POST /api/webhooks/shopify` - Shopify webhook handler
- `GET /api/dashboard/totals` - Get total customers, orders, revenue (auth required)
- `GET /api/dashboard/orders` - Get orders by date with optional date range (auth required)
- `GET /api/dashboard/revenue` - Get revenue by date with optional date range (auth required)
- `GET /api/dashboard/top-customers` - Get top 5 customers by spend (auth required)

## Database Schema
See `prisma/schema.prisma` for detailed schema with Tenant, User, Customer, Order, Product, Event models.

## Architecture Diagram
```
[Shopify Stores] <---> [Shopify Webhooks & API] <---> [Next.js Backend & API] <---> [MySQL Database]
                                         |
                                         v
                                [Dashboard Frontend]
```

## Next Steps to Productionize
- Implement OAuth flow for Shopify app installation
- Add scheduler for periodic sync or webhook registration automation
- Add more detailed error handling and logging
- Add unit and integration tests
- Improve UI/UX and add tenant onboarding UI
- Secure environment variables and secrets management
- Add monitoring and alerting

## Known Limitations
- Basic auth for onboarding and sync APIs (should be improved)
- No OAuth flow implemented yet
- Limited error handling and validation
- No tests included

## License
MIT
