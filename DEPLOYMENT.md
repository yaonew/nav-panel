# 导航页项目 - Docker 容器化部署

## 项目概述

本项目是一个完整的全栈导航页应用，包含前端（Svelte + Vite）和后端（Express.js），已完全容器化，支持 Docker 部署。

## 项目结构

```
nav-app/
├── src/                    # 前端源代码
│   ├── components/         # Svelte 组件
│   ├── App.svelte         # 主应用
│   └── main.js            # 入口文件
├── server/                 # 后端服务
│   ├── index.js           # Express 服务器
│   ├── Dockerfile         # 后端 Dockerfile
│   └── .dockerignore      # Docker 忽略文件
├── Dockerfile             # 前端 Dockerfile
├── docker-compose.yml     # Docker Compose 配置
├── nginx.conf             # Nginx 配置
├── .dockerignore          # Docker 忽略文件
└── DOCKER_README.md       # Docker 部署指南
```

## Docker 配置说明

### 前端 Dockerfile

- **多阶段构建**：第一阶段构建应用，第二阶段使用 Nginx 提供静态文件
- **基础镜像**：node:16-alpine (构建), nginx:alpine (生产)
- **端口**：80
- **特性**：
  - Gzip 压缩
  - 静态资源缓存
  - API 请求代理到后端

### 后端 Dockerfile

- **基础镜像**：node:16-alpine
- **端口**：3001
- **特性**：
  - 生产依赖安装
  - 健康检查
  - 数据持久化

### Docker Compose 配置

- **服务**：
  - `frontend`: 前端容器，端口 80
  - `backend`: 后端容器，端口 3001
- **网络**：bridge 网络 `nav-network`
- **数据卷**：`nav-data` 用于数据持久化
- **重启策略**：unless-stopped

## 部署步骤

### 1. 安装 Docker

#### Windows
下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

#### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### macOS
下载并安装 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)

### 2. 验证安装

```bash
docker --version
docker compose version
```

### 3. 构建镜像

```bash
cd nav-app
docker compose build
```

或使用旧版命令：
```bash
docker-compose build
```

### 4. 启动服务

```bash
docker compose up -d
```

### 5. 查看服务状态

```bash
docker compose ps
```

### 6. 查看日志

```bash
# 查看所有日志
docker compose logs -f

# 查看前端日志
docker compose logs -f frontend

# 查看后端日志
docker compose logs -f backend
```

### 7. 访问应用

- **前端**: http://localhost
- **后端 API**: http://localhost:3001

### 8. 停止服务

```bash
docker compose down
```

## 生产环境配置

### 1. 修改 JWT 密钥

编辑 `docker-compose.yml`：

```yaml
backend:
  environment:
    - JWT_SECRET=your-very-secure-secret-key-here
```

### 2. 修改默认密码

启动后，登录系统修改默认管理员密码：
- 默认用户名: `admin`
- 默认密码: `admin123`

### 3. 配置 HTTPS

#### 使用 Nginx 反向代理

创建 `nginx-proxy.conf`：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 使用 Traefik

在 `docker-compose.yml` 中添加标签：

```yaml
frontend:
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
    - "traefik.http.routers.frontend.tls=true"
```

### 4. 资源限制

在 `docker-compose.yml` 中添加：

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```

## 数据管理

### 数据持久化

数据存储在 Docker 数据卷 `nav-data` 中：

```bash
# 查看数据卷
docker volume ls

# 检查数据卷详情
docker volume inspect nav-data

# 备份数据
docker run --rm -v nav-data:/data -v $(pwd):/backup alpine tar czf /backup/nav-backup.tar.gz /data

# 恢复数据
docker run --rm -v nav-data:/data -v $(pwd):/backup alpine tar xzf /backup/nav-backup.tar.gz -C /
```

### 数据迁移

```bash
# 导出数据
docker compose exec backend cat /app/data/data.json > backup.json

# 导入数据
docker compose exec backend sh -c 'echo "your-json-data" > /app/data/data.json'
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker compose logs

# 检查容器状态
docker compose ps

# 进入容器调试
docker compose exec backend sh
```

### 网络问题

```bash
# 检查网络
docker network ls
docker network inspect nav-network

# 重建网络
docker compose down
docker compose up -d
```

### 性能问题

```bash
# 查看资源使用
docker stats

# 查看容器进程
docker compose top
```

## 更新部署

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose build --no-cache
docker compose up -d
```

### 滚动更新

```bash
# 逐步更新服务
docker compose up -d --no-deps --build frontend
docker compose up -d --no-deps --build backend
```

## 监控和日志

### 健康检查

后端已配置健康检查：

```bash
# 查看健康状态
docker compose ps

# 手动健康检查
curl http://localhost:3001/api/nav-items
```

### 日志管理

```bash
# 实时查看日志
docker compose logs -f --tail=100

# 导出日志
docker compose logs > app.log
```

## 安全建议

1. **修改默认密码**：首次登录后立即修改
2. **使用 HTTPS**：生产环境必须使用 HTTPS
3. **定期备份**：定期备份数据卷
4. **更新镜像**：定期更新基础镜像
5. **限制资源**：设置容器资源限制
6. **网络隔离**：使用 Docker 网络隔离服务

## 常用命令速查

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 重启
docker compose restart

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f

# 进入容器
docker compose exec backend sh

# 重新构建
docker compose build --no-cache

# 清理
docker compose down -v --rmi all
```

## 技术栈

- **前端**: Svelte 3 + Vite 4 + Nginx
- **后端**: Express.js 4.18 + Node.js 16
- **认证**: JWT + bcryptjs
- **容器**: Docker + Docker Compose
- **数据**: JSON 文件存储

## 许可证

MIT
