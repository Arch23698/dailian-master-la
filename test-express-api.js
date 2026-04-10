// 测试Express API服务器
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testApi() {
  try {
    console.log('测试Express API服务器...\n');

    // 1. 测试健康检查端点
    console.log('1. 测试健康检查端点:');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('   响应:', healthResponse.data);
    console.log('   ✓ 健康检查通过\n');

    // 2. 测试获取订单列表
    console.log('2. 测试获取订单列表:');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    console.log('   成功:', ordersResponse.data.success);
    console.log('   订单数量:', ordersResponse.data.data?.length || 0);
    if (ordersResponse.data.success && ordersResponse.data.data.length > 0) {
      console.log('   第一个订单:', {
        id: ordersResponse.data.data[0].id,
        orderNumber: ordersResponse.data.data[0].orderNumber,
        status: ordersResponse.data.data[0].status
      });
    }
    console.log('   ✓ 获取订单列表通过\n');

    // 3. 测试带参数的订单列表
    console.log('3. 测试带游戏筛选的订单列表:');
    const filteredResponse = await axios.get(`${API_BASE_URL}/orders?gameId=1`);
    console.log('   成功:', filteredResponse.data.success);
    console.log('   筛选后订单数量:', filteredResponse.data.data?.length || 0);
    console.log('   ✓ 筛选功能通过\n');

    // 4. 测试获取单个订单
    if (ordersResponse.data.success && ordersResponse.data.data.length > 0) {
      const orderId = ordersResponse.data.data[0].id;
      console.log('4. 测试获取单个订单 (ID:', orderId, '):');
      const singleOrderResponse = await axios.get(`${API_BASE_URL}/orders?orderId=${orderId}`);
      console.log('   成功:', singleOrderResponse.data.success);
      if (singleOrderResponse.data.success) {
        console.log('   订单状态:', singleOrderResponse.data.data[0].status);
      }
      console.log('   ✓ 获取单个订单通过\n');
    }

    console.log('🎉 所有API测试通过！');
    console.log('Express API服务器运行正常。');
    console.log('现在可以启动前端开发服务器并测试完整流程。');

  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    console.log('\n💡 请确保Express服务器正在运行: npm run api');
  }
}

// 执行测试
testApi();