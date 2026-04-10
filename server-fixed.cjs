// CommonJS版本的Express服务器（已修复，使用适配器）
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// 手动加载.env文件
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^([^=]+)="([^"]+)"$/);
    if (match) {
      const [, key, value] = match;
      process.env[key] = value;
    }
  }
}

const app = express();
const port = 5555;

// 中间件
app.use(cors());
app.use(express.json());

// 创建PostgreSQL连接池和适配器
const connectionString = process.env.DATABASE_URL || '';
console.log('使用数据库连接:', connectionString ? '已设置' : '未设置');

let prisma;

try {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log('✅ Prisma客户端初始化成功');
} catch (error) {
  console.error('❌ Prisma客户端初始化失败:', error.message);
  process.exit(1);
}

// 定义枚举（与Prisma schema一致）
const OrderStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const Role = {
  POSTER: 'POSTER',
  ACCEPTER: 'ACCEPTER',
  BOTH: 'BOTH'
};

// 数据库连接测试端点
app.get('/api/test-connection', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      success: true,
      message: '数据库连接正常',
      userCount
    });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// GET /api/orders - 获取订单大厅列表或单个订单
app.get('/api/orders', async (req, res) => {
  try {
    const { orderId, gameId, sortBy = 'createdAt', order = 'desc' } = req.query;

    // 如果提供了orderId，返回单个订单（包装在数组中保持兼容性）
    if (orderId) {
      const orderData = await prisma.order.findUnique({
        where: { id: parseInt(String(orderId)) },
        include: {
          game: true,
          poster: {
            select: {
              id: true,
              phone: true
            }
          },
          accepter: {
            select: {
              id: true,
              phone: true
            }
          }
        }
      });

      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      return res.json({
        success: true,
        data: [orderData] // 包装在数组中保持前端兼容性
      });
    }

    // 否则返回订单列表
    // 构建查询条件
    const where = {
      status: OrderStatus.PENDING // 只显示待接单订单
    };

    if (gameId) {
      where.gameId = parseInt(String(gameId));
    }

    // 构建排序条件
    const orderBy = {};
    if (sortBy === 'price') {
      orderBy.price = String(order);
    } else {
      orderBy.createdAt = String(order);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        game: true,
        poster: {
          select: {
            id: true,
            phone: true
          }
        }
      },
      orderBy
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('获取订单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单失败',
      error: error.message
    });
  }
});

// POST /api/orders - 发布新订单
app.post('/api/orders', async (req, res) => {
  try {
    const body = req.body;

    // 验证必要字段
    const requiredFields = ['gameId', 'region', 'currentRank', 'targetRank', 'requirements', 'price', 'securityDeposit', 'posterId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({
          success: false,
          message: `缺少必要字段: ${field}`
        });
      }
    }

    // 检查发布者是否存在且有足够余额
    const poster = await prisma.user.findUnique({
      where: { id: body.posterId }
    });

    if (!poster) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户角色
    if (poster.role !== Role.POSTER && poster.role !== Role.BOTH) {
      return res.status(403).json({
        success: false,
        message: '用户没有发布订单的权限'
      });
    }

    // 生成订单号
    const orderNumber = `DL${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNumber,
        gameId: parseInt(String(body.gameId)),
        region: String(body.region),
        currentRank: String(body.currentRank),
        targetRank: String(body.targetRank),
        requirements: String(body.requirements),
        price: parseFloat(String(body.price)),
        securityDeposit: parseFloat(String(body.securityDeposit)),
        posterId: body.posterId,
        status: OrderStatus.PENDING
      },
      include: {
        game: true
      }
    });

    res.status(201).json({
      success: true,
      data: order,
      message: '订单发布成功'
    });
  } catch (error) {
    console.error('发布订单失败:', error);
    res.status(500).json({
      success: false,
      message: '发布订单失败',
      error: error.message
    });
  }
});

// POST /api/orders/accept - 接单
app.post('/api/orders/accept', async (req, res) => {
  try {
    const body = req.body;

    // 验证必要字段
    const requiredFields = ['orderId', 'accepterId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({
          success: false,
          message: `缺少必要字段: ${field}`
        });
      }
    }

    const { orderId, accepterId } = body;

    // 检查订单是否存在且状态为待接单
    const order = await prisma.order.findUnique({
      where: { id: parseInt(String(orderId)) },
      include: {
        game: true,
        poster: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: '订单已被接取或已完成'
      });
    }

    // 检查接单者是否存在
    const accepter = await prisma.user.findUnique({
      where: { id: String(accepterId) }
    });

    if (!accepter) {
      return res.status(404).json({
        success: false,
        message: '接单者不存在'
      });
    }

    // 检查用户角色
    if (accepter.role !== Role.ACCEPTER && accepter.role !== Role.BOTH) {
      return res.status(403).json({
        success: false,
        message: '用户没有接单的权限'
      });
    }

    // 检查接单者是否有足够的保证金
    if (accepter.deposit < order.securityDeposit) {
      return res.status(400).json({
        success: false,
        message: '保证金不足',
        requiredDeposit: order.securityDeposit,
        currentDeposit: accepter.deposit
      });
    }

    // 检查接单者是否是自己发布的订单
    if (String(order.posterId) === String(accepterId)) {
      return res.status(400).json({
        success: false,
        message: '不能接取自己发布的订单'
      });
    }

    // 更新订单状态和接单者
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(String(orderId)) },
      data: {
        status: OrderStatus.IN_PROGRESS,
        accepterId: String(accepterId)
      },
      include: {
        game: true,
        poster: {
          select: {
            id: true,
            phone: true
          }
        },
        accepter: {
          select: {
            id: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: '接单成功'
    });
  } catch (error) {
    console.error('接单失败:', error);
    res.status(500).json({
      success: false,
      message: '接单失败',
      error: error.message
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
const server = app.listen(port, () => {
  console.log(`✅ Express API服务器运行在 http://localhost:${port}`);
  console.log(`API端点:`);
  console.log(`  GET  http://localhost:${port}/api/health`);
  console.log(`  GET  http://localhost:${port}/api/test-connection`);
  console.log(`  GET  http://localhost:${port}/api/orders`);
  console.log(`  POST http://localhost:${port}/api/orders`);
  console.log(`  POST http://localhost:${port}/api/orders/accept`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Prisma客户端已断开连接');
    process.exit(0);
  });
});