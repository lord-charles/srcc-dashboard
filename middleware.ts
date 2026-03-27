import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Authorization by permissions
    try {
      const url = req.nextUrl;
      const pathname = url.pathname;
      const roles: any[] = (token as any).roles || [];
      const userType = (token as any).type; // Check user type (organization or user)

      // Check if user has admin privileges (multiple roles beyond just consultant)
      const hasAdminRole = roles.some(
        (r) => r === "admin" || r === "super_admin",
      );

      // Regular consultant (user type) with only consultant role - limited access
      const isRegularConsultant =
        userType === "user" &&
        roles.length === 1 &&
        roles[0] === "consultant" &&
        !hasAdminRole;

      // Allow /users when accessed with project context query parameters
      const isProjectContext =
        pathname === "/users" &&
        url.searchParams.has("projectId") &&
        url.searchParams.has("returnUrl");

      // Check if accessing /users without project context - require admin role
      if (pathname === "/users" && !isProjectContext && !hasAdminRole) {
        const redirectUrl = new URL("/analytics?unauthorized=1", req.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if accessing /settings - require admin role
      if (
        (pathname === "/settings" || pathname.startsWith("/settings/")) &&
        !hasAdminRole
      ) {
        const redirectUrl = new URL("/analytics?unauthorized=1", req.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Allow /projects for all authenticated users
      if (pathname === "/projects" || pathname.startsWith("/projects/")) {
        return NextResponse.next();
      }

      // Allow /users with project context regardless of role
      if (isProjectContext) {
        return NextResponse.next();
      }

      // Handle regular users (non-organizations)
      // Users with admin roles have full access
      if (hasAdminRole) {
        return NextResponse.next();
      }

      // For regular consultants, ensure they can always access analytics (prevent redirect loop)
      if (pathname === "/analytics" || pathname.startsWith("/analytics")) {
        return NextResponse.next();
      }

      // For consultant-only users (no admin role), enforce restrictions
      const blockedRoots = ["/contracts", "/claims", "/imprest", "/budget"];

      if (
        isRegularConsultant &&
        blockedRoots.some(
          (root) => pathname === root || pathname.startsWith(root + "/"),
        )
      ) {
        const redirectUrl = new URL("/analytics", req.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch {
      // On any error, fail-closed for consultant-only users on blocked roots
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
  },
);

export const config = {
  matcher: [
    // Match all paths except explicitly excluded ones
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|login|consultant).*)",
  ],
};
