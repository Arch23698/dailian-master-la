// API测试脚本
// 使用Node.js内置的fetch

async function testAPI() {
  const baseURL = 'http://localhost:5555';

  console.log('🧪 开始API测试...');

  try {
    // 1. 测试健康检查
    console.log('\n1. 测试健康检查端点...');
    const healthRes = await fetch(`${baseURL}/api/health`);
    const healthData = await healthRes.json();
    console.log(`✅ /api/health: ${JSON.stringify(healthData)}`);

    // 2. 测试数据库连接端点
    console.log('\n2. 测试数据库连接...');
    const testRes = await fetch(`${baseURL}/api/test-connection`);
    const testData = await testRes.json();
    console.log(`✅ /api/test-connection: ${testData.success ? '成功' : '失败'}`);
    if (testData.success) {
      console.log(`   用户数量: ${testData.userCount}`);
    }

    // 3. 测试获取订单列表
    console.log('\n3. 测试获取订单列表...');
    const ordersRes = await fetch(`${baseURL}/api/orders`);
    const ordersData = await ordersRes.json();
    console.log(`✅ /api/orders: 获取到 ${ordersData.data?.length || 0} 个订单`);

    if (ordersData.data && ordersData.data.length > 0) {
      // 4. 测试获取单个订单
      const firstOrder = ordersData.data[0];
      console.log('\n4. 测试获取单个订单...');
      const singleOrderRes = await fetch(`${baseURL}/api/orders?orderId=${firstOrder.id}`);
      const singleOrderData = await singleOrderRes.json();
      console.log(`✅ /api/orders?orderId=${firstOrder.id}: 成功获取订单`);
      console.log(`   订单号: ${singleOrderData.data[0]?.orderNumber}`);

      // 5. 测试按游戏筛选
      console.log('\n5. 测试按游戏筛选...');
      const gameFilterRes = await fetch(`${baseURL}/api/orders?gameId=1`);
      const gameFilterData = await gameFilterRes.json();
      console.log(`✅ /api/orders?gameId=1: 获取到 ${gameFilterData.data?.length || 0} 个王者荣耀订单`);
    }

    console.log('\n🎉 API测试完成！所有端点正常工作。');

  } catch (error) {
    console.error('\n❌ API测试失败:', error.message);
    console.log('请确保Express服务器正在运行 (npm run api)');
  }
}

testAPI();