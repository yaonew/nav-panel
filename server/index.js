const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));  // Increase limit for Base64 images
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据
function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      users: [
        {
          id: 1,
          username: 'admin',
          password: bcrypt.hashSync('admin123', 10),
          role: 'admin'
        }
      ],
      navItems: [
        {
          id: 1,
          category: '搜索引擎',
          items: [
            { id: 1, name: 'Google', externalUrl: 'https://www.google.com', internalUrl: 'http://internal.google.com', icon: '🔍', description: '全球最大搜索引擎' },
            { id: 2, name: '百度', externalUrl: 'https://www.baidu.com', internalUrl: 'http://internal.baidu.com', icon: '🎯', description: '中文搜索引擎' },
            { id: 3, name: 'Bing', externalUrl: 'https://www.bing.com', internalUrl: 'http://internal.bing.com', icon: '🔎', description: '微软搜索引擎' }
          ]
        },
        {
          id: 2,
          category: '开发工具',
          items: [
            { id: 4, name: 'GitHub', externalUrl: 'https://github.com', internalUrl: 'http://internal.github.com', icon: '💻', description: '代码托管平台' },
            { id: 5, name: 'Stack Overflow', externalUrl: 'https://stackoverflow.com', internalUrl: 'http://internal.stackoverflow.com', icon: '❓', description: '开发者问答' },
            { id: 6, name: 'MDN', externalUrl: 'https://developer.mozilla.org', internalUrl: 'http://internal.mozilla.org', icon: '📚', description: 'Web开发文档' }
          ]
        },
        {
          id: 3,
          category: '在线工具',
          items: [
            { id: 7, name: 'Canva', externalUrl: 'https://www.canva.com', internalUrl: 'http://internal.canva.com', icon: '🎨', description: '在线设计工具' },
            { id: 8, name: 'Notion', externalUrl: 'https://www.notion.so', internalUrl: 'http://internal.notion.so', icon: '📝', description: '笔记协作工具' },
            { id: 9, name: 'Figma', externalUrl: 'https://www.figma.com', internalUrl: 'http://internal.figma.com', icon: '✏️', description: 'UI设计工具' }
          ]
        }
      ],
      settings: {
        siteName: 'Nav-Panel',
        siteIcon: 'data:image/x-icon;base64,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',
        backgroundImage: ''
      }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// 读取数据
function readData() {
  initData();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// 写入数据
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// JWT 验证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '令牌无效' });
    }
    req.user = user;
    next();
  });
}

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();

  const user = data.users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '48h' }
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// 获取导航项
app.get('/api/nav-items', (req, res) => {
  const data = readData();
  res.json(data.navItems);
});

// 添加导航项
app.post('/api/nav-items', authenticateToken, (req, res) => {
  const data = readData();
  const { name, externalUrl, internalUrl, icon, description, categoryId, category } = req.body;

  // 查找分类 - 支持categoryId或category名称
  let categoryObj = null;
  if (categoryId) {
    categoryObj = data.navItems.find(c => c.id === categoryId);
  } else if (category) {
    categoryObj = data.navItems.find(c => c.category === category);
    // 如果分类不存在，创建新分类
    if (!categoryObj) {
      categoryObj = {
        id: Date.now(),
        category: category,
        items: []
      };
      data.navItems.push(categoryObj);
    }
  }
  
  if (!categoryObj) {
    return res.status(404).json({ success: false, message: '分类不存在' });
  }

  // 添加新项
  const newItem = {
    id: Date.now(),
    name,
    externalUrl,
    internalUrl: internalUrl || '',
    icon: icon || '🔗',
    description: description || ''
  };

  categoryObj.items.push(newItem);
  writeData(data);

  res.json({ success: true, item: newItem });
});

// 更新导航项
app.put('/api/nav-items/:id', authenticateToken, (req, res) => {
  const data = readData();
  const itemId = parseInt(req.params.id);
  const { name, externalUrl, internalUrl, icon, description, category, categoryId } = req.body;

  // 查找原项目
  let found = false;
  for (let cat of data.navItems) {
    const itemIndex = cat.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      // 如果分类改变，需要移动项目
      if (categoryId && cat.id !== categoryId) {
        const newCategory = data.navItems.find(c => c.id === categoryId);
        if (newCategory) {
          const [item] = cat.items.splice(itemIndex, 1);
          item.name = name;
          item.externalUrl = externalUrl;
          item.internalUrl = internalUrl || '';
          item.icon = icon || '🔗';
          item.description = description || '';
          newCategory.items.push(item);
          
          // 如果原分类为空，删除它
          if (cat.items.length === 0) {
            data.navItems = data.navItems.filter(c => c.id !== cat.id);
          }
        }
      } else {
        // 更新项目
        cat.items[itemIndex] = {
          ...cat.items[itemIndex],
          name,
          externalUrl,
          internalUrl: internalUrl || '',
          icon: icon || '🔗',
          description: description || ''
        };
      }
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ success: false, message: '导航项不存在' });
  }

  writeData(data);
  res.json({ success: true });
});

// 删除导航项
app.delete('/api/nav-items/:id', authenticateToken, (req, res) => {
  const data = readData();
  const itemId = parseInt(req.params.id);

  for (let i = 0; i < data.navItems.length; i++) {
    const cat = data.navItems[i];
    const itemIndex = cat.items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      cat.items.splice(itemIndex, 1);
      
      // 如果分类为空，删除它
      if (cat.items.length === 0) {
        data.navItems.splice(i, 1);
      }
      
      writeData(data);
      return res.json({ success: true });
    }
  }

  res.status(404).json({ success: false, message: '导航项不存在' });
});

// 重新排序导航项
app.post('/api/nav-items/reorder', authenticateToken, (req, res) => {
  const newOrder = req.body;
  
  if (!Array.isArray(newOrder)) {
    return res.status(400).json({ success: false, message: '无效的数据格式' });
  }

  const data = readData();
  data.navItems = newOrder;
  writeData(data);

  res.json({ success: true });
});

// 修改密码
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const data = readData();
  
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ success: false, message: '当前密码错误' });
  }
  
  user.password = bcrypt.hashSync(newPassword, 10);
  writeData(data);
  res.json({ success: true, message: '密码修改成功' });
});

// 获取设置
app.get('/api/settings', (req, res) => {
  const data = readData();
  res.json(data.settings || {});
});

// 保存设置
app.post('/api/settings', authenticateToken, (req, res) => {
  const data = readData();
  data.settings = { ...data.settings, ...req.body };
  writeData(data);
  res.json({ success: true, settings: data.settings });
});

// 添加分类
app.post('/api/categories', authenticateToken, (req, res) => {
  const data = readData();
  const { name } = req.body;
  
  const newCategory = {
    id: Date.now(),
    category: name,
    items: []
  };
  
  data.navItems.push(newCategory);
  writeData(data);
  res.json({ success: true, category: newCategory });
});

// 更新分类
app.put('/api/categories/:id', authenticateToken, (req, res) => {
  const data = readData();
  const categoryId = parseInt(req.params.id);
  const { name } = req.body;
  
  const category = data.navItems.find(cat => cat.id === categoryId);
  if (!category) {
    return res.status(404).json({ success: false, message: '分类不存在' });
  }
  
  category.category = name;
  writeData(data);
  res.json({ success: true, category });
});

// 重排分类顺序
app.post('/api/categories/reorder', authenticateToken, (req, res) => {
  const data = readData();
  const { sourceId, targetId } = req.body;
  
  const sourceIndex = data.navItems.findIndex(cat => cat.id === sourceId);
  const targetIndex = data.navItems.findIndex(cat => cat.id === targetId);
  
  if (sourceIndex === -1 || targetIndex === -1) {
    return res.status(404).json({ success: false, message: '分类不存在' });
  }
  
  const [removed] = data.navItems.splice(sourceIndex, 1);
  data.navItems.splice(targetIndex, 0, removed);
  
  writeData(data);
  res.json({ success: true });
});

// 删除分类
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  const data = readData();
  const categoryId = parseInt(req.params.id);
  
  const index = data.navItems.findIndex(cat => cat.id === categoryId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: '分类不存在' });
  }
  
  data.navItems.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

// 获取Bing每日背景图
app.get('/api/bing-background', async (req, res) => {
  try {
    const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1');
    const data = await response.json();
    if (data.images && data.images[0]) {
      const imageUrl = `https://www.bing.com${data.images[0].url}`;
      res.json({ success: true, imageUrl });
    } else {
      res.status(404).json({ success: false, message: '未找到Bing背景图' });
    }
  } catch (error) {
    console.error('获取Bing背景失败:', error);
    res.status(500).json({ success: false, message: '获取Bing背景失败' });
  }
});

// 清空所有数据
app.post('/api/clear-all', authenticateToken, (req, res) => {
  const data = readData();
  data.categories = [];
  data.navItems = [];
  writeData(data);
  res.json({ success: true });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
  initData();
  console.log('数据已初始化');
});
