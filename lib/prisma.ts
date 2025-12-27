import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use your environment variable
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? 
  new PrismaClient({ 
    adapter, // THIS IS THE KEY REQUIREMENT IN V7
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;