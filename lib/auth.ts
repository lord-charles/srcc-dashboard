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
              registrationStatus: data.user.registrationStatus,
              phoneNumber: data.user.phoneNumber,
              nationalId: data.user.nationalId,
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
        // On initial sign-in, `user` is the object from `authorize`
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.roles = user.roles;
        token.employeeId = user.employeeId;
        token.department = user.department;
        token.position = user.position;
        token.accessToken = user.token; // Store the raw backend token
        token.registrationStatus = user.registrationStatus;
        token.phoneNumber = user.phoneNumber;
        token.nationalId = user.nationalId;
      }
      return token;
    },
    async session({ session, token }) {
      // The `session` object is what the client sees.
      // We populate it from the `token` object.
      if (token && session.user) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.email = token.email;
        session.user.roles = token.roles;
        session.user.employeeId = token.employeeId;
        session.user.department = token.department;
        session.user.position = token.position;
        session.user.token = token.accessToken;
        session.user.registrationStatus = token.registrationStatus;
        session.user.phoneNumber = token.phoneNumber;
        session.user.nationalId = token.nationalId;
      }
      return session;
    },
  },
};
