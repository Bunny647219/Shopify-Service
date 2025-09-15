'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Onboard() {
  const [name, setName] = useState('')
  const [shopifyDomain, setShopifyDomain] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const credentials = btoa('admin:password') // Basic auth credentials

    const res = await fetch('/api/onboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({ name, shopifyDomain, accessToken }),
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess('Tenant onboarded successfully! Tenant ID: ' + data.tenantId)
      setTimeout(() => router.push('/register'), 2000)
    } else {
      setError(data.error || 'Onboarding failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-4">Onboard Tenant</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <input
          type="text"
          placeholder="Tenant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="text"
          placeholder="Shopify Domain (e.g., mystore.myshopify.com)"
          value={shopifyDomain}
          onChange={(e) => setShopifyDomain(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="password"
          placeholder="Shopify Access Token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2">
          Onboard
        </button>
      </form>
    </div>
  )
}
