import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession } from "next-auth";
import type { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import { StaffRole } from "@/generated/prisma";

const allowedEntries = (() => {
  const raw = process.env.ALLOWED_EMAILS;
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean);
    }
  } catch (error) {
    console.warn("Failed to parse ALLOWED_EMAILS env value", error);
  }
  return [] as string[];
})();

function matchesWhitelist(email: string) {
  if (allowedEntries.length === 0) return true; // allow all if list empty
  return allowedEntries.some((entry) => {
    if (entry.startsWith("@")) {
      return email.endsWith(entry);
    }
    return email === entry;
  });
}

export async function isEmailAllowed(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  if (matchesWhitelist(normalized)) return true;

  const existingTutor = await prisma.tutor.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  return !!existingTutor;
}

export function isSessionAllowed(session: Session | null | undefined) {
  return !!session?.user?.allowed;
}

export function isSessionStaff(session: Session | null | undefined) {
  return session?.user?.role === StaffRole.STAFF;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = await isEmailAllowed(user?.email);
      if (!allowed) {
        console.warn("Unauthorized email attempted login", user?.email);
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = session.user.email ?? user.email ?? null;
        session.user.allowed = await isEmailAllowed(session.user.email);
        if (session.user.email) {
          const tutor = await prisma.tutor.findFirst({
            where: { email: { equals: session.user.email, mode: "insensitive" } },
            select: { role: true },
          });
          session.user.role = tutor?.role ?? null;
        } else {
          session.user.role = null;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
