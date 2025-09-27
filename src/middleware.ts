import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin-only routes
    if (pathname.startsWith("/admin")) {
      if (token?.role !== Role.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Alumni-only routes
    if (pathname.startsWith("/profile") || pathname.startsWith("/employment")) {
      if (token?.role !== Role.ALUMNI && token?.role !== Role.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Employer-only routes
    if (pathname.startsWith("/search") && token?.role === Role.EMPLOYER) {
      // Employers can access search but with limited data
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/api/auth"]
        const pathname = req.nextUrl.pathname
        
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
