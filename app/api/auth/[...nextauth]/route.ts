import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log(
            "Attempting login with URL:",
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
          );

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          const data = res.data;

          if (res.status === 200 && data.user) {
            // Store token in cookie
            const cookieStore = await cookies();
            cookieStore.set("token", data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              expires: new Date(Date.now() + 12 * 60 * 60 * 1000), // 24 hours
            });

            // Check if user has appropriate roles
            const hasAdminRole = data.user.roles.includes("admin");
            const hasHrRole = data.user.roles.includes("hr");
            const isEmployeeOnly =
              data.user.roles.length === 1 &&
              data.user.roles.includes("employee");

            // Deny access if user is employee only
            if (isEmployeeOnly) {
              console.log("Access denied: User is employee only");
              return null;
            }

            return {
              id: data.user.id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              email: data.user.email,
              roles: data.user.roles,
              employeeId: data.user.employeeId,
              department: data.user.department,
              position: data.user.position,
              token: data.user.accessToken,
            };
          }

          console.log("Login failed: Invalid response", {
            status: res.status,
            data,
          });
          return null;
        } catch (error: any) {
          console.error("Auth error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          });
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.roles = user.roles;
        token.employeeId = user.employeeId;
        token.department = user.department;
        token.position = user.position;
        token.accessToken = user.token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.email = token.email as string;
        session.user.roles = token.roles as string[];
        session.user.employeeId = token.employeeId as string;
        session.user.department = token.department as string;
        session.user.position = token.position as string;
        session.user.token = token.accessToken as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
