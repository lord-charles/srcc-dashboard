import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      roles: string[];
      employeeId: string;
      token: string;
      department: string;
      position: string;
    };
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    employeeId: string;
    token: string;
    department: string;
    position: string;
  }
}
