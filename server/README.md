# 导航页后端服务

基于 Express.js 的导航页后端 API 服务。

## 功能

- 用户认证（JWT）
- 导航项 CRUD 操作
- 数据持久化（JSON 文件）

## 安装

```bash
cd server
npm install
```

## 运行

```bash
npm start
```

服务器将运行在 http://localhost:3001

## API 接口

### 认证

#### 登录
- **POST** `/api/login`
- 请求体:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- 响应:
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
  ```

### 导航项

#### 获取所有导航项
- **GET** `/api/nav-items`
- 无需认证

#### 添加导航项
- **POST** `/api/nav-items`
- 需要认证（Bearer Token）
- 请求体:
  ```json
  {
    "name": "网站名称",
    "externalUrl": "https://example.com",
    "internalUrl": "http://internal.example.com",
    "icon": "🔗",
    "description": "描述",
    "category": "分类名称"
  }
  ```

#### 更新导航项
- **PUT** `/api/nav-items/:id`
- 需要认证
- 请求体同添加

#### 删除导航项
- **DELETE** `/api/nav-items/:id`
- 需要认证

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 数据存储

数据存储在 `data.json` 文件中，包括：
- 用户信息
- 导航项数据

## 技术栈

- Express.js 4.18
- JWT (jsonwebtoken)
- bcryptjs (密码加密)
- CORS (跨域支持)
