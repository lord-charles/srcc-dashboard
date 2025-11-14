import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        try {
          // console.log(
          //   "Attempting login with URL:",
          //   `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          //   credentials?.type
          // );

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
              type: credentials?.type,
            }
          );

          const data = res.data;

          // Store token in cookie
          const cookieStore = await cookies();
          cookieStore.set("token", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(Date.now() + 12 * 60 * 60 * 1000), // 24 hours
          });

          if (res.status === 200 && data?.user) {
            if (data.type === "organization") {
              return {
                id: data.user?._id,
                email: data.user?.businessEmail,
                phoneNumber: data.user?.businessPhone,
                token: data.token,
                type: data.type,
                roles: ["consultant"],
                registrationStatus: data.user?.registrationStatus,
                organizationId: data.user?.organizationId,
                status: data.user?.status,
                companyName: data.user?.companyName,
                businessEmail: data.user?.businessEmail,
                businessPhone: data.user?.businessPhone,
                permissions: data.user?.permissions,
              };
            }

            return {
              id: data.user?._id,
              firstName: data.user?.firstName,
              lastName: data.user?.lastName,
              email: data.user?.email,
              roles: data.user?.roles,
              employeeId: data.user?.employeeId,
              token: data.token,
              department: data.user?.department,
              position: data.user?.position,
              registrationStatus: data.user?.registrationStatus,
              phoneNumber: data.user?.phoneNumber,
              status: data.user?.status,
              nationalId: data.user?.nationalId,
              type: data.type,
              permissions: data.user?.permissions,
            };
          }
          console.log("Login failed: Invalid response", {
            status: res.status,
            data,
          });
          return null;
        } catch (error: any) {
          // Check for our custom verification error from the backend
          if (error.response?.data?.code === "VERIFICATION_REQUIRED") {
            // Pass the whole error object to the client by stringifying it.
            // The client will parse this to identify the specific error.
            throw new Error(JSON.stringify(error.response.data));
          }

          // Handle all other errors
          const errorMessage =
            error.response?.data?.message || "An unexpected error occurred.";
          console.error("Auth error:", {
            message: errorMessage,
            status: error.response?.status,
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          });
          throw new Error(errorMessage);
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
        token.id = user?.id;
        token.email = user?.email;
        token.roles = user?.roles;
        token.accessToken = user?.token;
        token.registrationStatus = user?.registrationStatus;
        token.phoneNumber = user?.phoneNumber;
        token.type = user?.type;

        if (user?.type === "organization") {
          token.organizationId = user?.organizationId;
          token.companyName = user?.companyName;
          token.businessEmail = user?.businessEmail;
          token.businessPhone = user?.businessPhone;
          token.permissions = user?.permissions;
          token.status = user?.status;
          token.registrationStatus = user?.registrationStatus;
        } else {
          token.firstName = user?.firstName;
          token.lastName = user?.lastName;
          token.employeeId = user?.employeeId;
          token.department = user?.department;
          token.position = user?.position;
          token.nationalId = user?.nationalId;
          token.status = user?.status;
          token.registrationStatus = user?.registrationStatus;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // The `session` object is what the client sees.
      // We populate it from the `token` object.
      if (token && session?.user) {
        session.user.id = token?.id;
        session.user.email = token?.email;
        session.user.roles = token?.roles;
        session.user.token = token?.accessToken;
        session.user.registrationStatus = token?.registrationStatus;
        session.user.phoneNumber = token?.phoneNumber;
        session.user.type = token?.type;

        if (token?.type === "organization") {
          session.user.organizationId = token?.organizationId;
          session.user.companyName = token?.companyName;
          session.user.businessEmail = token?.businessEmail;
          session.user.businessPhone = token?.businessPhone;
          session.user.permissions = token?.permissions;
          session.user.status = token?.status;
          session.user.registrationStatus = token?.registrationStatus;
        } else {
          session.user.firstName = token?.firstName;
          session.user.lastName = token?.lastName;
          session.user.employeeId = token?.employeeId;
          session.user.department = token?.department;
          session.user.position = token?.position;
          session.user.nationalId = token?.nationalId;
          session.user.permissions = token?.permissions;
          session.user.status = token?.status;
          session.user.registrationStatus = token?.registrationStatus;
        }
      }
      return session;
    },
  },
};
