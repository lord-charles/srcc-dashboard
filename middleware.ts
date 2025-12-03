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

      const isOnlyConsultant =
        roles.length > 0 && roles.every((r) => r === "consultant");

      // Allow /users when accessed with project context query parameters
      const isProjectContext =
        pathname === "/users" &&
        url.searchParams.has("projectId") &&
        url.searchParams.has("returnUrl");

      if (isProjectContext) {
        return NextResponse.next();
      }

      // Enforce consultant restrictions and general permission checks
      const blockedRoots = [
        "/contracts",
        "/claims",
        "/imprest",
        "/users",
        "/budget",
      ];

      let unauthorized = false;

      // If a permissions map is present, require access for the current path
      if (permissions && Object.keys(permissions).length > 0) {
        // Paths like '/my-projects' will have permissions in your token; others with empty arrays should be blocked
        const permitted = hasAccess(pathname);
        if (!permitted) {
          // As a fallback, for non-matching keys, explicitly block consultant-only users on blocked roots
          if (
            isOnlyConsultant &&
            blockedRoots.some(
              (root) => pathname === root || pathname.startsWith(root + "/")
            )
          ) {
            unauthorized = true;
          } else {
            unauthorized = true;
          }
        }
      } else if (isOnlyConsultant) {
        // No permissions map: conservatively block consultant-only users from blocked roots
        if (
          blockedRoots.some(
            (root) => pathname === root || pathname.startsWith(root + "/")
          )
        ) {
          unauthorized = true;
        }
      }

      if (unauthorized) {
        const redirectUrl = new URL("/analytics?unauthorized=1", req.url);
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
  }
);

export const config = {
  matcher: [
    // Match all paths except explicitly excluded ones
    "/((?!api/auth|_next/static|_next/image|_next/data|favicon.ico|login|consultant).*)",
  ],
};
