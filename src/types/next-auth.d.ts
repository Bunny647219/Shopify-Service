import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    tenantId: string
    tenantName: string
  }

  interface Session {
    user: {
      tenantId: string
      tenantName: string
    } & DefaultSession['user']
  }
}
