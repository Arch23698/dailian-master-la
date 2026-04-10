// 测试 /api/test-connection 端点
const http = require('http');

function testConnectionEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5555,
      path: '/api/test-connection',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log('状态码:', res.statusCode);
      console.log('响应头:', JSON.stringify(res.headers, null, 2));

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('响应体:', data);
        try {
          const jsonData = JSON.parse(data);
          console.log('解析后的JSON:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (e) {
          console.log('响应不是有效的JSON');
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('请求失败:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('请求超时');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function runTest() {
  console.log('测试 /api/test-connection 端点...');
  try {
    const result = await testConnectionEndpoint();
    if (result && result.success) {
      console.log('✅ /api/test-connection 测试成功！');
      console.log(`   数据库连接正常，用户数量: ${result.userCount}`);
    } else {
      console.log('❌ /api/test-connection 返回失败');
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

runTest();