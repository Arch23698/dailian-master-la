# Vercel 部署指南

## ✅ 已完成的前期准备

你的项目已经完成以下部署准备：

1. **数据库迁移完成**：从 SQLite 迁移到 PostgreSQL (Neon)
2. **环境变量配置**：`.env` 文件已包含正确的 `DATABASE_URL`
3. **Prisma 配置更新**：使用 PostgreSQL 适配器，支持云数据库
4. **数据验证通过**：5个用户、3款游戏、10个订单已成功插入
5. **API 路由就绪**：Next.js API 路由已配置使用正确的 Prisma 客户端

## 🚀 部署到 Vercel 步骤

### 步骤 1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `dailian-master` (或你喜欢的名称)
   - Description: "游戏代练接单平台"
   - 选择 Public (公开) 或 Private (私有)
   - 不要初始化 README、.gitignore 或 license

### 步骤 2：上传代码到 GitHub

在本地项目目录中执行以下命令：

```bash
# 初始化 Git (如果尚未初始化)
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "初始化代练平台项目"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名称.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3：创建 Vercel 项目

1. 访问 [Vercel](https://vercel.com) 并登录（支持 GitHub 登录）
2. 点击 "Add New..." → "Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Next.js (自动检测)
   - **Build Command**: `npm run build` (默认)
   - **Output Directory**: `.next` (默认)
   - **Install Command**: `npm install` (默认)

### 步骤 4：配置环境变量

在 Vercel 项目设置中配置环境变量：

1. 进入项目 → Settings → Environment Variables
2. 添加以下环境变量：

```
DATABASE_URL=postgresql://neondb_owner:npg_LT1oH8rbIRvg@ep-misty-bar-an9hxwpc-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
```

3. 点击 "Save"

### 步骤 5：部署项目

1. 返回项目概览页面
2. 点击 "Deploy"
3. Vercel 将自动构建和部署你的项目
4. 部署完成后，你会获得一个类似 `https://你的项目.vercel.app` 的域名

### 步骤 6：运行数据库迁移

在 Vercel 部署后，需要运行数据库迁移：

**方法 A：使用 Vercel CLI（推荐）**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目目录中运行
vercel env pull  # 拉取环境变量到本地 .env 文件
npx prisma db push  # 执行数据库迁移
```

**方法 B：手动执行（通过 SSH）**
1. 在 Vercel 项目设置中启用 "Production SSH"
2. 使用 SSH 连接到部署的实例
3. 执行 `npx prisma db push`

**方法 C：使用 Prisma Migrate（高级）**
```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 在 Vercel 部署时自动运行
# 在 package.json 的 "scripts" 中添加：
# "postinstall": "prisma generate",
# "vercel-build": "prisma generate && prisma migrate deploy && next build"
```

## 🔧 部署后验证

### 1. 验证网站可访问
访问你的 Vercel 域名，确认网站正常加载。

### 2. 验证 API 端点
访问以下端点，确认 API 正常工作：

```
GET  https://你的项目.vercel.app/api/orders
POST https://你的项目.vercel.app/api/orders
POST https://你的项目.vercel.app/api/orders/accept
```

### 3. 验证数据库连接
创建一个简单的测试页面或使用 API 端点验证数据库连接。

## 🐛 常见问题排查

### 问题 1：数据库连接失败
**症状**: API 返回 500 错误，日志显示数据库连接错误
**解决方案**:
1. 检查 Vercel 环境变量 `DATABASE_URL` 是否正确
2. 确认 Neon 数据库 IP 白名单设置
3. 在 Neon 控制台检查数据库连接状态

### 问题 2：Prisma 客户端错误
**症状**: 构建失败，Prisma 相关错误
**解决方案**:
1. 确保 `package.json` 中 Prisma 版本为 `7.3.0`
2. 检查 `lib/prisma.ts` 配置正确
3. 运行 `npx prisma generate` 重新生成客户端

### 问题 3：构建失败
**症状**: Vercel 构建过程中失败
**解决方案**:
1. 检查构建日志中的具体错误
2. 确保所有依赖项已正确安装
3. 确认 Node.js 版本兼容性（推荐 18.x 或 20.x）

### 问题 4：CORS 错误
**症状**: 前端无法访问 API
**解决方案**:
1. 确保 API 路由正确配置
2. 检查前端请求的域名是否正确
3. 在 API 响应中添加 CORS 头（如果需要）

## 📁 项目结构说明

```
dailian_master/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── orders/        # 订单相关 API
│   ├── orders/            # 订单页面
│   └── page.tsx           # 首页
├── lib/                   # 工具函数
│   └── prisma.ts          # Prisma 客户端配置
├── prisma/                # 数据库配置
│   ├── schema.prisma      # 数据库模型
│   └── seed-postgres.sql  # 种子数据
├── public/                # 静态资源
└── package.json           # 项目依赖
```

## 🔒 安全注意事项

1. **保护数据库凭证**: `DATABASE_URL` 包含敏感信息，不要提交到公开仓库
2. **环境变量**: 所有敏感配置都应通过环境变量设置
3. **API 验证**: 在生产环境中添加身份验证和授权
4. **输入验证**: 确保所有 API 端点都有输入验证

## 📞 获取帮助

如果遇到问题：

1. **检查日志**: Vercel 部署日志包含详细错误信息
2. **Prisma 文档**: https://www.prisma.io/docs
3. **Next.js 文档**: https://nextjs.org/docs
4. **Vercel 文档**: https://vercel.com/docs
5. **Neon 文档**: https://neon.tech/docs

## 🎉 恭喜！

你的游戏代练平台现已准备好部署到 Vercel。按照上述步骤操作，你的应用将在几分钟内上线并可供所有人访问。

部署成功后，你可以：
- 分享链接给朋友测试
- 收集用户反馈
- 根据需求添加新功能
- 监控应用性能和用户行为