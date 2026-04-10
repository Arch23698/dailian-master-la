// 直接导入Prisma生成的TypeScript文件，避免CommonJS问题
import { PrismaClient } from '../node_modules/.prisma/client/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma