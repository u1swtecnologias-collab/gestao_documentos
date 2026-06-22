import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow access to the password page
  if (request.nextUrl.pathname.startsWith('/site-password')) {
    return NextResponse.next()
  }

  const sitePasswordCookie = request.cookies.get('site_access_token')

  if (sitePasswordCookie?.value !== 'granted') {
    return NextResponse.redirect(new URL('/site-password', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
