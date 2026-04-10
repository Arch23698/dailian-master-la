import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 创建PostgreSQL连接池
const connectionString = process.env.DATABASE_URL || ''
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// 使用PostgreSQL适配器的Prisma客户端实例
export const prisma = new PrismaClient({ adapter })