# Docker 部署指南

本项目支持使用 Docker 和 Docker Compose 进行容器化部署。

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+

## 快速开始

### 使用 Docker Compose（推荐）

1. 构建并启动所有服务：
```bash
docker-compose up -d
```

2. 查看服务状态：
```bash
docker-compose ps
```

3. 查看日志：
```bash
docker-compose logs -f
```

4. 停止服务：
```bash
docker-compose down
```

5. 停止并删除数据卷：
```bash
docker-compose down -v
```

### 单独构建镜像

#### 构建前端镜像
```bash
cd nav-app
docker build -t nav-frontend .
```

#### 构建后端镜像
```bash
cd nav-app/server
docker build -t nav-backend .
```

### 单独运行容器

#### 运行后端
```bash
docker run -d \
  --name nav-backend \
  -p 3001:3001 \
  -v nav-data:/app/data \
  nav-backend
```

#### 运行前端
```bash
docker run -d \
  --name nav-frontend \
  -p 80:80 \
  --link nav-backend:backend \
  nav-frontend
```

## 访问应用

- 前端: http://localhost
- 后端 API: http://localhost:3001

## 环境变量

### 后端环境变量
- `NODE_ENV`: 运行环境 (production/development)
- `JWT_SECRET`: JWT 密钥（生产环境必须修改）

在 docker-compose.yml 中设置：
```yaml
environment:
  - JWT_SECRET=your-secret-key
```

## 数据持久化

后端数据存储在 Docker 数据卷 `nav-data` 中，位于容器内的 `/app/data` 目录。

查看数据卷：
```bash
docker volume ls
```

检查数据卷内容：
```bash
docker volume inspect nav-data
```

## 生产环境建议

1. **修改 JWT 密钥**：
   ```yaml
   environment:
     - JWT_SECRET=your-very-secure-secret-key
   ```

2. **使用 HTTPS**：
   - 配置反向代理（如 Traefik、Nginx）
   - 或使用 Let's Encrypt 证书

3. **资源限制**：
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

4. **健康检查**：
   - 后端已配置健康检查
   - 可通过 `docker ps` 查看健康状态

## 故障排查

### 查看容器日志
```bash
docker-compose logs frontend
docker-compose logs backend
```

### 进入容器
```bash
docker-compose exec frontend sh
docker-compose exec backend sh
```

### 重新构建镜像
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 架构说明

```
┌─────────────────┐
│   Frontend      │
│   (Nginx:80)    │
└────────┬────────┘
         │
         │ /api/* 代理
         │
┌────────▼────────┐
│   Backend       │
│   (Node:3001)   │
└─────────────────┘
```

- 前端使用 Nginx 提供静态文件服务
- Nginx 将 `/api/*` 请求代理到后端
- 后端使用 Node.js Express 提供API服务
- 数据持久化使用 Docker Volume

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

⚠️ **生产环境请务必修改默认密码！**
