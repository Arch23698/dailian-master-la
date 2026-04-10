// 简单的数据库连接测试
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  // 读取.env文件
  const envPath = path.join(__dirname, '.env');
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL="([^"]+)"/);
    if (match) {
      connectionString = match[1];
    }
  }

  if (!connectionString) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    console.log('请检查 .env 文件中的 DATABASE_URL 配置');
    console.log('当前工作目录:', __dirname);
    return;
  }

  console.log('🔗 测试数据库连接...');
  console.log('连接字符串:', connectionString.replace(/:[^:@]*@/, ':****@')); // 隐藏密码

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功！');

    // 测试查询
    const result = await client.query('SELECT COUNT(*) as user_count FROM "User"');
    console.log(`📊 用户数量: ${result.rows[0].user_count}`);

    const gamesResult = await client.query('SELECT COUNT(*) as game_count FROM "Game"');
    console.log(`📊 游戏数量: ${gamesResult.rows[0].game_count}`);

    const ordersResult = await client.query('SELECT COUNT(*) as order_count FROM "Order"');
    console.log(`📊 订单数量: ${ordersResult.rows[0].order_count}`);

    await client.end();
    console.log('✅ 连接测试完成！');

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n⚠️  可能的原因:');
    console.log('1. IP地址被Neon数据库阻止');
    console.log('2. 连接字符串格式错误');
    console.log('3. 网络连接问题');
    console.log('\n🔧 解决方案:');
    console.log('1. 登录 Neon Console: https://console.neon.tech');
    console.log('2. 进入你的数据库项目');
    console.log('3. 找到 "IP Allow List" 设置');
    console.log('4. 添加你的当前IP地址到白名单');
    console.log('5. 或者设置为 "Allow all" (仅用于测试)');
  }
}

testConnection();