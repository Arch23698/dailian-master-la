import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 创建全局Prisma实例以避免热重载时的重复创建
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 构建时或开发时：如果DATABASE_URL不存在，创建不带适配器的客户端
let prisma: PrismaClient

if (process.env.DATABASE_URL) {
  // 生产环境或开发环境：使用PostgreSQL适配器
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
} else {
  // 构建环境或DATABASE_URL未设置：创建基础客户端
  prisma = globalForPrisma.prisma ?? new PrismaClient()
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
