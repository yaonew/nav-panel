# 导航页 - Nav-Panel
[![Github](https://img.shields.io/badge/Github-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/yaonew/nav-panel)
[![Gitee](https://img.shields.io/badge/Gitee-C71D23?style=flat-square&logo=gitee&logoColor=white)](https://gitee.com/yaonew/nav-panel)
[![docker](https://img.shields.io/badge/docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://hub.docker.com/r/yaonew/nav-panel)


[![Stars](https://img.shields.io/github/stars/yaonew/nav-panel?style=flat-square&logo=github&label=stars&color=yellow)](https://github.com/yaonew/nav-panel/stargazers)
[![Downloads](https://img.shields.io/github/downloads/yaonew/nav-panel/total?style=flat-square&logo=github&label=downloads&color=green)](https://github.com/yaonew/nav-panel/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/yaonew/nav-panel?style=flat-square&logo=docker&label=docker%20pulls&color=blue)](https://hub.docker.com/r/yaonew/nav-panel)

一个基于 Svelte 构建的现代化导航页面应用，支持登录后编辑、添加、删除导航项。

## 功能特性

- 🎨 现代化渐变设计风格
- 🔍 实时搜索导航项
- 🔐 简单的登录认证系统
- ➕ 添加新导航项
- ✏️ 编辑现有导航项
- 🗑️ 删除导航项
- 📱 响应式设计，支持移动端
- 💾 本地存储数据持久化

## 快速开始

### 安装依赖

```bash
cd nav-app
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用说明

### 登录

- 默认账号: `admin`
- 默认密码: `admin123`

### 功能操作

1. **搜索**: 在搜索框中输入关键词，实时过滤导航项
2. **添加**: 登录后点击"添加导航"按钮，填写信息后保存
3. **编辑**: 登录后鼠标悬停在导航卡片上，点击编辑图标
4. **删除**: 登录后鼠标悬停在导航卡片上，点击删除图标

## 项目结构

```
nav-app/
├── src/
│   ├── components/
│   │   ├── Login.svelte      # 登录组件
│   │   ├── NavCard.svelte    # 导航卡片组件
│   │   └── NavModal.svelte   # 添加/编辑模态框
│   ├── App.svelte            # 主应用组件
│   └── main.js               # 应用入口
├── index.html                # HTML 模板
├── vite.config.js            # Vite 配置
└── package.json              # 项目配置
```

## 技术栈

- **Svelte 3** - 前端框架
- **Vite 4** - 构建工具
- **LocalStorage** - 数据持久化

## 自定义配置

### 修改默认导航数据

在 `src/App.svelte` 中修改 `navItems` 数组：

```javascript
let navItems = [
  {
    id: 1,
    category: '分类名称',
    items: [
      {
        id: 1,
        name: '导航名称',
        url: 'https://example.com',
        icon: '🔗',
        description: '描述'
      }
    ]
  }
];
```

### 修改登录验证

在 `src/components/Login.svelte` 中修改 `handleLogin` 函数以接入后端 API。

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## License

MIT
