'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

interface Totals {
  customers: number
  orders: number
  revenue: number
}

interface OrderData {
  date: string
  count: number
}

interface RevenueData {
  date: string
  revenue: number
}

interface TopCustomer {
  email: string
  totalSpent: number
}

interface TopProduct {
  title: string
  totalSold: number
}

interface Event {
  id: string
  type: string
  data: Record<string, unknown>
  createdAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [totals, setTotals] = useState<Totals | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [revenue, setRevenue] = useState<RevenueData[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchTotals()
    fetchOrders()
    fetchRevenue()
    fetchTopCustomers()
    fetchTopProducts()
    fetchEvents()
  }, [session, status])

  const fetchTotals = async () => {
    const res = await fetch('/api/dashboard/totals')
    if (res.ok) {
      const data = await res.json()
      setTotals(data)
    }
  }

  const fetchOrders = async () => {
    const res = await fetch(`/api/dashboard/orders?start=${startDate}&end=${endDate}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data)
    }
  }

  const fetchRevenue = async () => {
    const res = await fetch(`/api/dashboard/revenue?start=${startDate}&end=${endDate}`)
    if (res.ok) {
      const data = await res.json()
      setRevenue(data)
    }
  }

  const fetchTopCustomers = async () => {
    const res = await fetch('/api/dashboard/top-customers')
    if (res.ok) {
      const data = await res.json()
      setTopCustomers(data)
    }
  }

  const fetchTopProducts = async () => {
    const res = await fetch('/api/dashboard/products')
    if (res.ok) {
      const data = await res.json()
      setTopProducts(data)
    }
  }

  const fetchEvents = async () => {
    const res = await fetch('/api/dashboard/events')
    if (res.ok) {
      const data = await res.json()
      setEvents(data)
    }
  }

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return null

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Dashboard - {session.user.tenantName}</h1>

      <div className="mb-4">
        <label>Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-1"
        />
        <label className="ml-4">End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-1"
        />
      </div>

      {totals && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="text-xl">Total Customers</h2>
            <p className="text-2xl">{totals.customers}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h2 className="text-xl">Total Orders</h2>
            <p className="text-2xl">{totals.orders}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <h2 className="text-xl">Total Revenue</h2>
            <p className="text-2xl">${totals.revenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl mb-4">Orders Over Time</h2>
          <LineChart width={400} height={300} data={orders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>

        <div>
          <h2 className="text-xl mb-4">Revenue Over Time</h2>
          <LineChart width={400} height={300} data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-4">Top 5 Customers by Spend</h2>
        <BarChart width={600} height={300} data={topCustomers}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="email" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalSpent" fill="#ffc658" />
        </BarChart>
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-4">Top 5 Products by Sales</h2>
        <BarChart width={600} height={300} data={topProducts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalSold" fill="#82ca9d" />
        </BarChart>
      </div>

      <div className="mt-6">
        <h2 className="text-xl mb-4">Recent Events</h2>
        <ul className="list-disc pl-5">
          {events.map((event) => (
            <li key={event.id} className="mb-2">
              <strong>{event.type}</strong> - {new Date(event.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
