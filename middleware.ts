import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all paths except explicitly excluded ones
    "/((?!api/auth|_next/static|_next/image|_next/data|favicon.ico|login|consultant).*)",
  ],
};
