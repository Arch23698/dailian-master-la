const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// 创建PostgreSQL连接池
const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 使用PostgreSQL适配器的Prisma客户端实例
const prisma = new PrismaClient({ adapter });

async function verifyData() {
  try {
    console.log('Verifying database data...');

    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    const orderCount = await prisma.order.count();

    console.log(`用户数量: ${userCount}`);
    console.log(`游戏数量: ${gameCount}`);
    console.log(`订单数量: ${orderCount}`);

    if (userCount > 0 && gameCount > 0 && orderCount > 0) {
      console.log('✅ 数据验证成功！');

      // 显示一些示例数据
      const sampleUser = await prisma.user.findFirst();
      const sampleGame = await prisma.game.findFirst();
      const sampleOrder = await prisma.order.findFirst({
        include: {
          game: true,
          poster: true
        }
      });

      console.log('\n示例用户:', { id: sampleUser.id, phone: sampleUser.phone, role: sampleUser.role });
      console.log('示例游戏:', { id: sampleGame.id, name: sampleGame.name });
      console.log('示例订单:', {
        orderNumber: sampleOrder.orderNumber,
        game: sampleOrder.game.name,
        status: sampleOrder.status,
        price: sampleOrder.price
      });
    } else {
      console.log('❌ 数据验证失败：某些表为空');
    }

  } catch (error) {
    console.error('验证过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();