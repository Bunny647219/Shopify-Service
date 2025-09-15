# Shopify Setup Guide

## 1. Create Shopify Development Store
- Go to https://partners.shopify.com/
- Sign up or log in to your Partner account.
- Click "Stores" > "Add store" > "Development store".
- Fill in the details and create the store.
- Add dummy data:
  - Products: Create 5-10 products with prices.
  - Customers: Add 10-20 customers with emails.
  - Orders: Create orders for customers.

## 2. Create Shopify App
- In Partner dashboard, go to "Apps" > "Create app" > "Create app manually".
- App name: "Shopify Data Ingestion Service"
- App URL: Leave blank for now (will update after deployment).
- Redirect URLs: Add your app's URL + /api/auth/shopify/callback (e.g., https://your-app.vercel.app/api/auth/shopify/callback)
- For webhooks: Configure the following topics to point to your app's webhook endpoint (e.g., https://your-app.vercel.app/api/webhooks/shopify):
  - customers/create
  - customers/update
  - orders/create
  - orders/update
  - products/create
  - products/update
  - checkouts/create (for cart abandoned events)
  - app/uninstalled (optional)

## 3. Install App in Dev Store
- In the app settings, click "Test your app" > Select your dev store.
- Install the app.
- Get the Admin API access token from the app's API credentials section.

## 4. Onboard Tenant in Your Service
- Use the onboarding API (POST /api/onboard) with basic auth (username: admin, password: as set in env).
- Body: { "name": "Store Name", "shopifyDomain": "your-store.myshopify.com", "accessToken": "shpat_..." }

## Notes
- For production, use Shopify's OAuth flow for app installation.
- Ensure the app has necessary scopes: read_customers, read_orders, read_products, etc.
