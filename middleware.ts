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
      const permissions: Record<string, string[] | undefined> =
        (token as any).permissions || {};
      const userType = (token as any).type; // Check user type (organization or user)

      // Helper: determine if user has access to a given path based on permissions map
      const hasAccess = (path: string) => {
        // Exact or prefix match against keys in permissions (e.g., '/projects')
        let allowed: string[] | undefined;
        let longestMatchLen = -1;
        for (const key of Object.keys(permissions)) {
          if (
            path === key ||
            path.startsWith(key + "/") ||
            (key !== "/" && path === key)
          ) {
            if (key.length > longestMatchLen) {
              longestMatchLen = key.length;
              allowed = permissions[key];
            }
          }
        }
        return Array.isArray(allowed) && allowed.length > 0;
      };

      // Check if user is an organization (type-based, not role-based)
      const isOrganization = userType === "organization";

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

      // Allow /users with project context regardless of role
      if (isProjectContext) {
        return NextResponse.next();
      }

      // Handle organization access separately
      if (isOrganization) {
        // Organizations always have access to analytics (prevent redirect loop)
        if (pathname === "/analytics" || pathname.startsWith("/analytics")) {
          return NextResponse.next();
        }

        // Organizations can access their own organization pages
        if (
          pathname.startsWith("/organizations/") ||
          pathname.startsWith("/organization/")
        ) {
          return NextResponse.next();
        }

        // Check permissions for other routes
        if (hasAccess(pathname)) {
          return NextResponse.next();
        }

        // Redirect to analytics for any unauthorized route
        const redirectUrl = new URL("/analytics", req.url);
        return NextResponse.redirect(redirectUrl);
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

      let unauthorized = false;

      // Check permissions map
      if (permissions && Object.keys(permissions).length > 0) {
        const permitted = hasAccess(pathname);
        if (!permitted) {
          // Block regular consultants from blocked roots
          if (
            isRegularConsultant &&
            blockedRoots.some(
              (root) => pathname === root || pathname.startsWith(root + "/"),
            )
          ) {
            unauthorized = true;
          } else {
            // For other users without permission, also block
            unauthorized = true;
          }
        }
      } else if (isRegularConsultant) {
        // No permissions map: block regular consultants from blocked roots
        if (
          blockedRoots.some(
            (root) => pathname === root || pathname.startsWith(root + "/"),
          )
        ) {
          unauthorized = true;
        }
      }

      if (unauthorized) {
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
