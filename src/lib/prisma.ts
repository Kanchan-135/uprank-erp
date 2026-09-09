import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatasourceUrl() {
  let url = process.env.DATABASE_URL || "file:./dev.db";
  // Ensure connection string uses postgresql:// for Prisma engine compatibility
  if (url.startsWith("postgres://")) {
    url = url.replace(/^postgres:\/\//, "postgresql://");
  }
  // Ensure pgbouncer=true is enabled when connecting to Supabase Transaction Pooler (port 6543)
  if (url.includes(":6543") && !url.includes("pgbouncer=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}pgbouncer=true`;
  }
  if (url.startsWith("file:")) {
    const rawPath = url.replace("file:", "");
    if (!path.isAbsolute(rawPath)) {
      // Check if file exists in prisma/dev.db or ./dev.db
      const rootDb = path.resolve(process.cwd(), rawPath);
      const prismaDb = path.resolve(process.cwd(), "prisma", path.basename(rawPath));
      if (fs.existsSync(prismaDb)) {
        return `file:${prismaDb}`;
      }
      return `file:${rootDb}`;
    }
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatasourceUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
