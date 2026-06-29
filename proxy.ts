import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default async function proxy(request: NextRequest) {
  const session = await auth()
  const isAuth = !!session?.user
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")

  if (isAuthPage) {
    if (isAuth) return NextResponse.redirect(new URL("/dashboard", request.url))
    return NextResponse.next()
  }

  if (!isAuth) return NextResponse.redirect(new URL("/login", request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/topics", "/topics/:path*", "/login", "/register"],
}
