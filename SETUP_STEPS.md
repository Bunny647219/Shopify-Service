# Step-by-Step Setup and Deployment Guide (From Basic)

## Prerequisites
- Node.js 18+ installed (download from https://nodejs.org/)
- Git installed (download from https://git-scm.com/)
- A GitHub account
- A Shopify Partner account (sign up at https://partners.shopify.com/)

## 1. Set Up GitHub Repository
- Go to GitHub.com and create a new repository (e.g., "shopify-service")
- Make it public
- Copy the repository URL

## 2. Clone the Repository
Open your terminal/command prompt and run:
```bash
git clone <your-github-repo-url>
cd shopify-service
```

## 3. Install Dependencies
```bash
npm install
```

## 4. Set Up MySQL Database
### Option A: Local MySQL
- Download and install MySQL from https://dev.mysql.com/downloads/mysql/
- Create a database named "shopify_service"
- Note your MySQL username and password

### Option B: Cloud MySQL (Recommended for Vercel)
- Sign up for PlanetScale (https://planetscale.com/) - free tier available
- Create a new database
- Get the connection string (it will look like: mysql://user:pass@host/dbname)

## 5. Set Up Environment Variables
Create a `.env` file in the root directory:
```
DATABASE_URL="mysql://user:password@host:port/dbname"
BASIC_AUTH_USER="admin"
BASIC_AUTH_PASS="yourpassword"
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret"
NEXTAUTH_SECRET="your_nextauth_secret"
```
- For DATABASE_URL, use your MySQL connection string
- For SHOPIFY_WEBHOOK_SECRET, generate a random string (you'll set this in Shopify later)
- For NEXTAUTH_SECRET, generate a random string

## 6. Initialize Database
```bash
npx prisma migrate dev --name init
```
This creates the database tables.

## 7. Shopify Setup
### Create Development Store
- Go to https://partners.shopify.com/
- Click "Stores" > "Add store" > "Development store"
- Fill in details and create the store
- Add dummy data: Go to your store admin > Products, Customers, Orders

### Create Shopify App
- In Partner dashboard, go to "Apps" > "Create app manually"
- Name: "Shopify Data Service"
- App URL: Leave blank for now
- Redirect URLs: Add https://your-app-url/api/auth/shopify/callback (update later)
- Webhook subscriptions: Add topics:
  - customers/create
  - customers/update
  - orders/create
  - orders/update
  - products/create
  - products/update
  - checkouts/create
- Set webhook URL to https://your-app-url/api/webhooks/shopify
- Install the app in your dev store
- Get the Admin API access token from app settings

## 8. Update Environment Variables
- Set SHOPIFY_WEBHOOK_SECRET to the secret from Shopify app settings
- Update .env with the access token if needed

## 9. Run Development Server
```bash
npm run dev
```
- Open http://localhost:3000 in your browser
- The app should load (though login won't work yet without users)

## 10. Onboard Tenant
Use a tool like Postman or curl to call the onboarding API:
```bash
curl -X POST http://localhost:3000/api/onboard \
  -H "Authorization: Basic YWRtaW46eW91cnBhc3N3b3Jk" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Store","shopifyDomain":"your-store.myshopify.com","accessToken":"shpat_..."}'
```
Replace the base64 string with base64 of "admin:yourpassword"

## 11. Create User for Login
- Connect to your MySQL database
- Insert a user into the User table:
```sql
INSERT INTO User (id, email, password, tenantId) VALUES ('user1', 'admin@store.com', '$2b$10$...', 'tenant-id-from-step-10');
```
- Use bcrypt to hash the password (you can use an online tool or Node.js script)

## 12. Sync Data
```bash
curl -X POST http://localhost:3000/api/sync/<tenantId> \
  -H "Authorization: Basic YWRtaW46eW91cnBhc3N3b3Jk"
```

## 13. Test the App
- Go to http://localhost:3000/login
- Login with the user email and password
- View the dashboard with metrics and charts

## 14. Deploy to Vercel
- Commit and push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```
- Go to https://vercel.com/
- Connect your GitHub repo
- Set environment variables in Vercel dashboard
- Deploy
- Update Shopify app URL and webhook URL to the Vercel URL

## 15. Final Testing
- Test login and dashboard on Vercel
- Make changes in Shopify and verify data syncs
- Record your demo video

---

This guide covers everything from scratch. If you get stuck on any step, provide the error message and I'll help troubleshoot!
