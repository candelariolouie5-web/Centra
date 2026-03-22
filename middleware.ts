import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const pathname = req.nextUrl.pathname

  // Allow public access to admin login
  if (pathname === '/adminlogin') {
    return NextResponse.next()
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/adminlogin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/adminlogin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}

