// 独立测试脚本 - 验证完整业务流程
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 开始测试代练平台业务流程\n');

// 1. 检查测试数据
db.all('SELECT * FROM User', (err, users) => {
  if (err) throw err;
  console.log('📊 用户数据:');
  users.forEach(user => {
    console.log(`  ID: ${user.id}, 手机: ${user.phone}, 角色: ${user.role}, 余额: ${user.balance}, 保证金: ${user.deposit}`);
  });
});

db.all('SELECT * FROM Game', (err, games) => {
  if (err) throw err;
  console.log('\n🎮 游戏数据:');
  games.forEach(game => {
    console.log(`  ID: ${game.id}, 名称: ${game.name}, 描述: ${game.description}`);
  });
});

db.all('SELECT o.*, g.name as gameName FROM "Order" o JOIN Game g ON o.gameId = g.id', (err, orders) => {
  if (err) throw err;
  console.log('\n📝 订单数据（当前状态）:');
  orders.forEach(order => {
    console.log(`  ID: ${order.id}, 订单号: ${order.orderNumber}, 游戏: ${order.gameName}`);
    console.log(`     状态: ${order.status}, 发布者: ${order.posterId}, 接单者: ${order.accepterId || '无'}`);
    console.log(`     价格: ¥${order.price}, 保证金: ¥${order.securityDeposit}`);
  });

  // 2. 模拟用户A发布新订单
  console.log('\n--- 模拟用户A（ID=1）发布新订单 ---');
  const newOrderNumber = `TEST${Date.now()}`;
  const newOrder = {
    orderNumber: newOrderNumber,
    gameId: 1,
    region: '微信区',
    currentRank: '钻石Ⅱ',
    targetRank: '星耀Ⅴ',
    requirements: '测试订单：需要每天完成5局，胜率60%以上',
    price: 180.0,
    securityDeposit: 360.0,
    posterId: 1,
    status: 'PENDING'
  };

  const insertSql = `
    INSERT INTO "Order" (orderNumber, gameId, region, currentRank, targetRank,
                         requirements, price, securityDeposit, posterId, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `;

  db.run(insertSql, [
    newOrder.orderNumber, newOrder.gameId, newOrder.region, newOrder.currentRank,
    newOrder.targetRank, newOrder.requirements, newOrder.price, newOrder.securityDeposit,
    newOrder.posterId, newOrder.status
  ], function(err) {
    if (err) {
      console.error('发布订单失败:', err.message);
      return;
    }

    const newOrderId = this.lastID;
    console.log(`✅ 用户A发布订单成功！订单ID: ${newOrderId}, 订单号: ${newOrder.orderNumber}`);

    // 3. 模拟用户B查看订单列表
    console.log('\n--- 用户B（ID=2）查看待接单订单 ---');
    db.all('SELECT o.*, g.name as gameName FROM "Order" o JOIN Game g ON o.gameId = g.id WHERE o.status = "PENDING"', (err, pendingOrders) => {
      if (err) throw err;
      console.log(`发现 ${pendingOrders.length} 个待接单订单:`);
      pendingOrders.forEach(order => {
        console.log(`  [ID:${order.id}] ${order.gameName} - ${order.currentRank}→${order.targetRank} - ¥${order.price}`);
      });

      // 4. 模拟用户B接单
      console.log('\n--- 用户B接取新发布的订单 ---');
      const targetOrderId = newOrderId;

      // 检查用户B是否有足够保证金
      db.get('SELECT deposit FROM User WHERE id = 2', (err, userB) => {
        if (err) throw err;

        db.get('SELECT securityDeposit FROM "Order" WHERE id = ?', [targetOrderId], (err, order) => {
          if (err) throw err;

          console.log(`用户B保证金: ¥${userB.deposit}, 订单要求保证金: ¥${order.securityDeposit}`);

          if (userB.deposit >= order.securityDeposit) {
            // 更新订单状态
            const updateSql = 'UPDATE "Order" SET status = "IN_PROGRESS", accepterId = 2, updatedAt = datetime("now") WHERE id = ?';
            db.run(updateSql, [targetOrderId], function(err) {
              if (err) {
                console.error('接单失败:', err.message);
                return;
              }

              console.log('✅ 用户B接单成功！订单状态已更新为"进行中"');

              // 5. 验证订单状态
              db.get('SELECT o.*, g.name as gameName FROM "Order" o JOIN Game g ON o.gameId = g.id WHERE o.id = ?', [targetOrderId], (err, finalOrder) => {
                if (err) throw err;

                console.log('\n📋 最终订单状态:');
                console.log(`  订单号: ${finalOrder.orderNumber}`);
                console.log(`  游戏: ${finalOrder.gameName} (${finalOrder.region})`);
                console.log(`  状态: ${finalOrder.status}`);
                console.log(`  发布者: 用户${finalOrder.posterId}, 接单者: 用户${finalOrder.accepterId}`);
                console.log(`  段位: ${finalOrder.currentRank} → ${finalOrder.targetRank}`);
                console.log(`  价格: ¥${finalOrder.price}, 保证金: ¥${finalOrder.securityDeposit}`);

                console.log('\n🎉 业务流程测试完成！');
                console.log('用户A发布订单 → 用户B查看订单 → 用户B接单 → 订单状态更新');

                db.close();
              });
            });
          } else {
            console.log('❌ 用户B保证金不足，无法接单');
            db.close();
          }
        });
      });
    });
  });
});