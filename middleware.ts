import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/jwt"

const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/logout", "/admin/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.includes(pathname)) {
    if (!session || (session.role !== "admin" && session.role !== "support")) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
