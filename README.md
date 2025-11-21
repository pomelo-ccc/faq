# FAQ 管理系统

一个基于 Angular 19 和 Express 的常见问题管理系统,用于展示和管理技术问题的解决方案。

## 项目特性

- ✅ **Angular 19** - 使用最新的 Angular 框架
- ✅ **Express 后端** - 提供 RESTful API
- ✅ **TypeScript** - 全栈 TypeScript 支持
- ✅ **热模块替换 (HMR)** - 开发时自动刷新
- ✅ **响应式设计** - 支持多种设备

## 技术栈

### 前端
- Angular 19.x
- TypeScript 5.6.x
- RxJS 7.8.x
- Zone.js 0.15.x

### 后端
- Node.js (>= 18.19.1)
- Express 4.x
- TypeScript
- CORS 支持

## 环境要求

- **Node.js**: >= 18.19.1 (推荐使用 fnm 管理版本)
- **npm**: >= 9.x

## 快速开始

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

### 2. 启动项目

#### 使用 fnm (推荐)

如果你使用 fnm 管理 Node.js 版本:

```bash
# 切换到正确的 Node.js 版本
fnm use 18.19.1

# 启动后端服务器 (端口 3000)
npm run server

# 启动前端开发服务器 (端口 4200)
fnm exec --using=18.19.1 npm start
```

#### 不使用 fnm

```bash
# 启动后端服务器 (端口 3000)
npm run server

# 启动前端开发服务器 (端口 4200)
npm start
```

### 3. 访问应用

- **前端应用**: http://localhost:4200
- **后端 API**: http://localhost:3000/api/faqs

## 可用脚本

- `npm start` - 启动 Angular 开发服务器
- `npm run server` - 启动 Express 后端服务器
- `npm run build` - 构建生产版本
- `npm run watch` - 监听模式构建
- `npm test` - 运行测试

## API 端点

### 获取所有 FAQ
```
GET http://localhost:3000/api/faqs
```

### 获取单个 FAQ
```
GET http://localhost:3000/api/faqs/:id
```

### 创建 FAQ (管理员)
```
POST http://localhost:3000/api/faqs
```

### 更新 FAQ (管理员)
```
PUT http://localhost:3000/api/faqs/:id
```

### 删除 FAQ (管理员)
```
DELETE http://localhost:3000/api/faqs/:id
```

## 项目结构

```
faq/
├── src/                    # Angular 源代码
│   ├── app.component.ts   # 根组件
│   ├── app.routes.ts      # 路由配置
│   └── ...
├── server.ts              # Express 服务器
├── index.tsx              # Angular 引导文件
├── index.html             # HTML 模板
├── angular.json           # Angular 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 常见问题

### Node.js 版本错误

如果遇到 "Node.js version detected" 错误,请确保使用 Node.js >= 18.19.1:

```bash
fnm use 18.19.1
```

### 依赖安装失败

如果遇到依赖冲突,使用 `--legacy-peer-deps` 标志:

```bash
npm install --legacy-peer-deps
```

### 端口冲突

- 前端默认端口: 4200
- 后端默认端口: 3000

如需修改端口,请编辑 `angular.json` (前端) 或 `server.ts` (后端)。

## 开发说明

### 修改后端数据

编辑 `server.ts` 文件中的 `FAQS` 数组来修改初始数据。

### 添加新路由

在 `src/app.routes.ts` 中添加新的路由配置。

## License

MIT
