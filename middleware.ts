import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check user roles
    const roles = token.roles as string[];
    const isEmployeeOnly = roles.length === 1 && roles.includes("employee");

    // If user is only an employee, deny access
    if (isEmployeeOnly) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;

        const roles = token.roles as string[];
        const isEmployeeOnly = roles.length === 1 && roles.includes("employee");

        // Allow access if user has admin, hr, or multiple roles (not just employee)
        return !isEmployeeOnly;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
