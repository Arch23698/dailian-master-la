// 直接从生成的客户端文件导入
import { PrismaClient } from '../node_modules/.prisma/client/client'
import { Role, OrderStatus } from '../node_modules/.prisma/client/enums'

const prisma = new PrismaClient({})

async function main() {
  console.log('开始填充测试数据...')

  // 检查是否已有数据
  const existingUsers = await prisma.user.count()
  const existingGames = await prisma.game.count()
  const existingOrders = await prisma.order.count()

  if (existingUsers > 0 || existingGames > 0 || existingOrders > 0) {
    console.log('数据库已有数据，跳过填充测试数据。')
    console.log(`现有数据: ${existingUsers} 用户, ${existingGames} 游戏, ${existingOrders} 订单`)
    return
  }

  // 创建5个测试用户
  const users = await Promise.all([
    prisma.user.create({
      data: {
        phone: '13800138001',
        role: Role.POSTER,
        balance: 1000.0,
        deposit: 500.0,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800138002',
        role: Role.ACCEPTER,
        balance: 800.0,
        deposit: 1000.0,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800138003',
        role: Role.BOTH,
        balance: 1500.0,
        deposit: 2000.0,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800138004',
        role: Role.ACCEPTER,
        balance: 1200.0,
        deposit: 800.0,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800138005',
        role: Role.POSTER,
        balance: 2000.0,
        deposit: 1500.0,
      },
    }),
  ])

  console.log(`创建了 ${users.length} 个用户`)

  // 创建3款游戏：王者荣耀、和平精英、金铲铲
  const games = await Promise.all([
    prisma.game.create({
      data: {
        name: '王者荣耀',
        icon: '🎮',
        description: '5V5对战手游'
      },
    }),
    prisma.game.create({
      data: {
        name: '和平精英',
        icon: '🔫',
        description: '战术竞技手游'
      },
    }),
    prisma.game.create({
      data: {
        name: '金铲铲',
        icon: '♟️',
        description: '自走棋策略游戏'
      },
    }),
  ])

  console.log(`创建了 ${games.length} 个游戏`)

  // 创建10个测试订单
  const orders = []

  // 王者荣耀订单（5个）
  for (let i = 0; i < 5; i++) {
    orders.push(
      prisma.order.create({
        data: {
          orderNumber: `DL${Date.now()}${i.toString().padStart(3, '0')}`,
          gameId: games[0].id,
          region: ['微信区', 'QQ区', 'IOS微信区', '安卓QQ区', '微信跨区'][i % 5],
          currentRank: ['钻石Ⅰ', '星耀Ⅴ', '铂金Ⅰ', '钻石Ⅴ', '星耀Ⅱ'][i % 5],
          targetRank: ['星耀Ⅴ', '王者1星', '钻石Ⅴ', '星耀Ⅰ', '王者10星'][i % 5],
          requirements: `需要连胜上分，每天至少完成3局，要求胜率60%以上。${i === 0 ? '需要提供录像回放。' : i === 1 ? '需要双排配合。' : i === 2 ? '指定英雄上分。' : i === 3 ? '需要沟通战术。' : '要求效率优先。'}`,
          price: [120.0, 200.0, 80.0, 150.0, 250.0][i % 5],
          securityDeposit: [240.0, 400.0, 160.0, 300.0, 500.0][i % 5],
          posterId: users[i % 2 === 0 ? 0 : 4].id, // 使用发单者用户
          status: OrderStatus.PENDING,
        },
      })
    )
  }

  // 和平精英订单（3个）
  for (let i = 0; i < 3; i++) {
    orders.push(
      prisma.order.create({
        data: {
          orderNumber: `DL${Date.now()}${(i+5).toString().padStart(3, '0')}`,
          gameId: games[1].id,
          region: '微信区',
          currentRank: ['星钻Ⅴ', '皇冠Ⅴ', '王牌'][i],
          targetRank: ['皇冠Ⅴ', '王牌', '战神'][i],
          requirements: `需要稳定上分，每局KD不低于2.0，${i === 0 ? '可以单排或双排。' : i === 1 ? '需要配合队友。' : '要求高端局经验。'}`,
          price: [150.0, 250.0, 350.0][i],
          securityDeposit: [300.0, 500.0, 700.0][i],
          posterId: users[2].id, // BOTH用户
          status: OrderStatus.PENDING,
        },
      })
    )
  }

  // 金铲铲订单（2个）
  for (let i = 0; i < 2; i++) {
    orders.push(
      prisma.order.create({
        data: {
          orderNumber: `DL${Date.now()}${(i+8).toString().padStart(3, '0')}`,
          gameId: games[2].id,
          region: '微信区',
          currentRank: ['黄金Ⅰ', '铂金Ⅳ'][i],
          targetRank: ['铂金Ⅳ', '钻石Ⅰ'][i],
          requirements: `需要精通阵容搭配，${i === 0 ? '熟悉版本强势阵容。' : '需要冲分效率。'}`,
          price: [100.0, 180.0][i],
          securityDeposit: [200.0, 360.0][i],
          posterId: users[3].id, // ACCEPTER用户（也可以发单）
          status: OrderStatus.PENDING,
        },
      })
    )
  }

  const createdOrders = await Promise.all(orders)
  console.log(`创建了 ${createdOrders.length} 个订单`)

  console.log('测试数据填充完成！')
}

main()
  .catch((e) => {
    console.error('填充测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })