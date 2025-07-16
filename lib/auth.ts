import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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
          console.log("Login response:", data);

          if (res.status === 200 && data.user) {
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
              id: data.user._id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              email: data.user.email,
              roles: data.user.roles,
              employeeId: data.user.employeeId,
              token: data.token,
              department: data.user.department,
              position: data.user.position,
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
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Spread the existing token and add user properties
        return {
          ...token,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles,
          employeeId: user.employeeId,
          token: user.token,
          department: user.department,
          position: user.position,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Spread the existing session and update user properties
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          firstName: token.firstName,
          lastName: token.lastName,
          email: token.email,
          roles: token.roles,
          employeeId: token.employeeId,
          token: token.token,
          department: token.department,
          position: token.position,
        },
      };
    },
  },
};
