import { PrismaClient } from "@prisma/client"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

console.log("Initializing Prisma Client... adapter-pg")
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
    console.log("Saving prisma to globalThis")
    globalForPrisma.prisma = prisma
}
