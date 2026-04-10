-- 种子数据填充脚本（PostgreSQL版本）
-- 假设数据库为空，ID从1开始自动递增

BEGIN;

-- 插入5个测试用户
INSERT INTO "User" ("phone", "role", "balance", "deposit", "createdAt", "updatedAt") VALUES
('13800138001', 'POSTER', 1000.0, 500.0, NOW(), NOW()),
('13800138002', 'ACCEPTER', 800.0, 1000.0, NOW(), NOW()),
('13800138003', 'BOTH', 1500.0, 2000.0, NOW(), NOW()),
('13800138004', 'ACCEPTER', 1200.0, 800.0, NOW(), NOW()),
('13800138005', 'POSTER', 2000.0, 1500.0, NOW(), NOW());

-- 插入3款游戏
INSERT INTO "Game" ("name", "icon", "description", "createdAt", "updatedAt") VALUES
('王者荣耀', '🎮', '5V5对战手游', NOW(), NOW()),
('和平精英', '🔫', '战术竞技手游', NOW(), NOW()),
('金铲铲', '♟️', '自走棋策略游戏', NOW(), NOW());

-- 插入10个测试订单
-- 王者荣耀订单（5个）
INSERT INTO "Order" ("orderNumber", "gameId", "region", "currentRank", "targetRank", "requirements", "price", "securityDeposit", "status", "posterId", "createdAt", "updatedAt") VALUES
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '001', 1, '微信区', '钻石Ⅰ', '星耀Ⅴ', '需要连胜上分，每天至少完成3局，要求胜率60%以上。需要提供录像回放。', 120.0, 240.0, 'PENDING', 1, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '002', 1, 'QQ区', '星耀Ⅴ', '王者1星', '需要连胜上分，每天至少完成3局，要求胜率60%以上。需要双排配合。', 200.0, 400.0, 'PENDING', 5, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '003', 1, 'IOS微信区', '铂金Ⅰ', '钻石Ⅴ', '需要连胜上分，每天至少完成3局，要求胜率60%以上。指定英雄上分。', 80.0, 160.0, 'PENDING', 1, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '004', 1, '安卓QQ区', '钻石Ⅴ', '星耀Ⅰ', '需要连胜上分，每天至少完成3局，要求胜率60%以上。需要沟通战术。', 150.0, 300.0, 'PENDING', 5, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '005', 1, '微信跨区', '星耀Ⅱ', '王者10星', '需要连胜上分，每天至少完成3局，要求胜率60%以上。要求效率优先。', 250.0, 500.0, 'PENDING', 1, NOW(), NOW());

-- 和平精英订单（3个）
INSERT INTO "Order" ("orderNumber", "gameId", "region", "currentRank", "targetRank", "requirements", "price", "securityDeposit", "status", "posterId", "createdAt", "updatedAt") VALUES
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '006', 2, '微信区', '星钻Ⅴ', '皇冠Ⅴ', '需要稳定上分，每局KD不低于2.0，可以单排或双排。', 150.0, 300.0, 'PENDING', 3, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '007', 2, '微信区', '皇冠Ⅴ', '王牌', '需要稳定上分，每局KD不低于2.0，需要配合队友。', 250.0, 500.0, 'PENDING', 3, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '008', 2, '微信区', '王牌', '战神', '需要稳定上分，每局KD不低于2.0，要求高端局经验。', 350.0, 700.0, 'PENDING', 3, NOW(), NOW());

-- 金铲铲订单（2个）
INSERT INTO "Order" ("orderNumber", "gameId", "region", "currentRank", "targetRank", "requirements", "price", "securityDeposit", "status", "posterId", "createdAt", "updatedAt") VALUES
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '009', 3, '微信区', '黄金Ⅰ', '铂金Ⅳ', '需要精通阵容搭配，熟悉版本强势阵容。', 100.0, 200.0, 'PENDING', 4, NOW(), NOW()),
('DL' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '010', 3, '微信区', '铂金Ⅳ', '钻石Ⅰ', '需要精通阵容搭配，需要冲分效率。', 180.0, 360.0, 'PENDING', 4, NOW(), NOW());

COMMIT;

-- 验证数据
SELECT '用户数量:' || COUNT(*) FROM "User";
SELECT '游戏数量:' || COUNT(*) FROM "Game";
SELECT '订单数量:' || COUNT(*) FROM "Order";