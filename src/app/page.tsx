export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Shopify Data Ingestion & Insights Service</h1>
        <p className="text-lg mb-8">Multi-tenant platform for Shopify store data management and analytics.</p>
        <div className="space-x-4">
          <a href="/login" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Login
          </a>
          <a href="/register" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Register
          </a>
        </div>
        <div className="mt-8">
          <a href="/onboard" className="text-blue-500 underline">
            Onboard a new tenant
          </a>
        </div>
      </div>
    </div>
  )
}
