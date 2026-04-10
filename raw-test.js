// 原始HTTP连接测试
const net = require('net');

function testRawConnection() {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ port: 5555 }, () => {
      console.log('✅ 已连接到端口5555');

      // 发送HTTP GET请求到 /api/health
      const httpRequest = 'GET /api/health HTTP/1.1\r\n' +
                         'Host: localhost\r\n' +
                         'Connection: close\r\n' +
                         '\r\n';

      client.write(httpRequest);
    });

    let responseData = '';
    client.on('data', (data) => {
      responseData += data.toString();
    });

    client.on('end', () => {
      console.log('📨 收到响应:');
      console.log('--- 响应开始 ---');
      console.log(responseData.substring(0, 500)); // 只显示前500字符
      console.log('--- 响应结束 ---');

      // 分析响应
      if (responseData.includes('HTTP/1.1 200')) {
        console.log('✅ HTTP 200 OK 响应');
      }
      if (responseData.includes('Content-Type: application/json')) {
        console.log('✅ JSON 响应格式');
      }
      if (responseData.includes('{')) {
        console.log('✅ 包含JSON数据');
      }
      if (responseData.includes('<!DOCTYPE html>')) {
        console.log('❌ 返回的是HTML页面，不是Express服务器');
      }

      resolve(responseData);
    });

    client.on('error', (err) => {
      console.error('❌ 连接错误:', err.message);
      reject(err);
    });

    // 设置超时
    setTimeout(() => {
      client.destroy();
      reject(new Error('连接超时'));
    }, 5000);
  });
}

async function runTest() {
  console.log('🔌 测试原始TCP连接到端口5555...');
  try {
    await testRawConnection();
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

runTest();