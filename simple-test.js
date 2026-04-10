// 简单HTTP测试
const http = require('http');

function testServer() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5555,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('状态码:', res.statusCode);
        console.log('响应头:', res.headers['content-type']);
        console.log('响应体:', data);
        resolve(data);
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
  console.log('测试服务器连接...');
  try {
    await testServer();
    console.log('✅ 服务器响应正常');
  } catch (error) {
    console.log('❌ 服务器无响应，可能未启动');
    console.log('请运行: node server-fixed.cjs');
  }
}

runTest();