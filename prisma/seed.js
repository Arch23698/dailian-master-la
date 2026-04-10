const { PrismaClient, Role, OrderStatus } = require('@prisma/client')

const prisma = new PrismaClient()

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

  // 创建测试用户
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
  ])

  console.log(`创建了 ${users.length} 个用户`)

  // 创建游戏
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
        name: '原神',
        icon: '🌍',
        description: '开放世界冒险游戏'
      },
    }),
    prisma.game.create({
      data: {
        name: '英雄联盟',
        icon: '⚔️',
        description: '5V5 MOBA游戏'
      },
    }),
    prisma.game.create({
      data: {
        name: '永劫无间',
        icon: '🗡️',
        description: '武侠吃鸡游戏'
      },
    }),
  ])

  console.log(`创建了 ${games.length} 个游戏`)

  // 创建测试订单
  const orders = []

  // 王者荣耀订单
  for (let i = 0; i < 3; i++) {
    orders.push(
      prisma.order.create({
        data: {
          orderNumber: `DL${Date.now()}${i.toString().padStart(3, '0')}`,
          gameId: games[0].id,
          region: ['微信区', 'QQ区', 'IOS微信区'][i % 3],
          currentRank: ['钻石Ⅰ', '星耀Ⅴ', '铂金Ⅰ'][i % 3],
          targetRank: ['星耀Ⅴ', '王者1星', '钻石Ⅴ'][i % 3],
          requirements: `需要连胜上分，每天至少完成3局，要求胜率60%以上。${i === 0 ? '需要提供录像回放。' : ''}`,
          price: [120.0, 200.0, 80.0][i % 3],
          securityDeposit: [240.0, 400.0, 160.0][i % 3],
          posterId: users[0].id,
          status: OrderStatus.PENDING,
        },
      })
    )
  }

  // 和平精英订单
  for (let i = 0; i < 2; i++) {
    orders.push(
      prisma.order.create({
        data: {
          orderNumber: `DL${Date.now()}${(i+3).toString().padStart(3, '0')}`,
          gameId: games[1].id,
          region: '微信区',
          currentRank: ['星钻Ⅴ', '皇冠Ⅴ'][i],
          targetRank: ['皇冠Ⅴ', '王牌'][i],
          requirements: `需要稳定上分，每局KD不低于2.0，${i === 0 ? '可以单排或双排。' : '需要配合队友。'}`,
          price: [150.0, 250.0][i],
          securityDeposit: [300.0, 500.0][i],
          posterId: users[2].id,
          status: OrderStatus.PENDING,
        },
      })
    )
  }

  // 原神订单
  for (let i = 0; i < 2; i++) {
    orders.push(
      prisma.order.create({
        data: {
          orderNumber: `DL${Date.now()}${(i+5).toString().padStart(3, '0')}`,
          gameId: games[2].id,
          region: '官服',
          currentRank: ['冒险等级45', '深渊9层'][i],
          targetRank: ['冒险等级50', '深渊12层满星'][i],
          requirements: `需要每日委托+树脂清空，${i === 0 ? '探索度提升。' : '深渊配队优化。'}`,
          price: [180.0, 300.0][i],
          securityDeposit: [360.0, 600.0][i],
          posterId: users[2].id,
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