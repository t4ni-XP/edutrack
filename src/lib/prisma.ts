import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;

const shouldUseNeonAdapter = (() => {
  if (!databaseUrl) return false;
  const flag = process.env.USE_NEON_ADAPTER?.toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return /neon\.(tech|db\.net)/.test(databaseUrl);
})();

const adapter = shouldUseNeonAdapter ? new PrismaNeon({ connectionString: databaseUrl }) : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter ?? null,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
