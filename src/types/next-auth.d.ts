import NextAuth from "next-auth";
import { StaffRole } from "@/generated/prisma";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: StaffRole | null;
      allowed?: boolean;
    };
  }

  interface User {
    id: string;
    email?: string | null;
  }
}
