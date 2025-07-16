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
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          const data = res.data;
          console.log("data", data);

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
            const isEmployeeOnly =
              data.user.roles.length === 1 &&
              data.user.roles.includes("employee");

            // Deny access if user is employee only
            if (isEmployeeOnly) {
              return null;
            }

            // Return the raw data from the API. This will be passed as the `user` object
            // to the `jwt` callback on initial sign-in.
            return data;
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
      console.log("user", user, token);
      // On initial sign-in, `user` contains the response from the `authorize` function.
      // We save the enriched accessToken from the backend into the NextAuth token.
      if (user) {
        const apiResponse = user as any;
        token.accessToken = apiResponse.token;
      }

      // On every request, decode the accessToken to populate the token object.
      // This ensures the session is always up-to-date.
      if (token.accessToken) {
        try {
          const decoded = JSON.parse(
            Buffer.from(
              (token.accessToken as string).split(".")[1],
              "base64"
            ).toString()
          );
          token.id = decoded.sub;
          token.email = decoded.email;
          token.roles = decoded.roles;
          token.firstName = decoded.firstName;
          token.lastName = decoded.lastName;
          token.employeeId = decoded.employeeId;
          token.department = decoded.department;
          token.position = decoded.position;
          token.registrationStatus = decoded.registrationStatus;
          token.phoneNumber = decoded.phoneNumber;
          token.nationalId = decoded.nationalId;
        } catch (error) {
          console.error("Error decoding token:", error);
          return { ...token, error: "InvalidAccessToken" };
        }
      }

      return token;
    },
    async session({ session, token }) {
      // The session object is populated from the token object.
      // We add checks to ensure the properties exist before assigning them.
      if (token && session.user) {
        if (token.id) session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        if (token.roles) session.user.roles = token.roles;
        if (token.firstName) session.user.firstName = token.firstName;
        if (token.lastName) session.user.lastName = token.lastName;
        if (token.employeeId) session.user.employeeId = token.employeeId;
        if (token.department) session.user.department = token.department;
        if (token.position) session.user.position = token.position;
        if (token.registrationStatus)
          session.user.registrationStatus = token.registrationStatus;
        if (token.phoneNumber) session.user.phoneNumber = token.phoneNumber;
        if (token.nationalId) session.user.nationalId = token.nationalId;
        if (token.accessToken) session.user.token = token.accessToken;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
