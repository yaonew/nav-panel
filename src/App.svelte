<script>
  import { onMount, tick } from 'svelte';
  import Login from './components/Login.svelte';
  import NavCard from './components/NavCard.svelte';
  import NavModal from './components/NavModal.svelte';
  import Toast from './components/Toast.svelte';
  import UserModal from './components/UserModal.svelte';

  // Use environment variable or default
  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

  let isLoggedIn = false;
  let showModal = false;
  let editingItem = null;
  let searchQuery = '';
  let isInternalNetwork = false;
  let showLoginModal = false;
  let showUserModal = false;
  let toastMessage = '';
  let showToast = false;
  let navItems = [];
  let loading = false;
  let currentTime = '';
  let showSearchEngineDropdown = false;
  let selectedSearchEngine = 'baidu';
  let showScrollToTop = false;
  let siteSettings = {
    siteName: 'Nav-Panel',
    siteIcon: 'data:image/x-icon;base64,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',
    backgroundImage: ''
  };

  // 搜索引擎配置
  const searchEngines = [
    { id: 'google', name: 'Google', icon: 'material-icon-theme:google', url: 'https://www.google.com/search?q=' },
    { id: 'baidu', name: '百度', icon: 'simple-icons:baidu', url: 'https://www.baidu.com/s?wd=' },
    { id: 'bing', name: 'Bing', icon: 'cib:bing', url: 'https://www.bing.com/search?q=' }
  ];

  // Check if icon is Iconify icon
  function isIconifyIcon(icon) {
    return icon && icon.includes(':');
  }

  // 拖拽状态
  let draggedItem = null;
  let draggedCategory = null;
  let draggedIndex = null;

  // 滚动到顶部
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // 监听滚动事件
  function handleScroll() {
    showScrollToTop = window.scrollY > 300;
  }

  async function loadSettings() {
    try {
      const response = await fetch(`${API_BASE}/settings`);
      if (response.ok) {
        const data = await response.json();
        siteSettings = { ...siteSettings, ...data };
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  onMount(async () => {
    // 更新时间
    updateTime();
    setInterval(updateTime, 1000);

    // 监听滚动
    window.addEventListener('scroll', handleScroll);

    // 从本地存储加载网络状态
    const savedNetwork = localStorage.getItem('isInternalNetwork');
    if (savedNetwork) {
      isInternalNetwork = JSON.parse(savedNetwork);
    }

    const savedLogin = localStorage.getItem('isLoggedIn');
    if (savedLogin) {
      isLoggedIn = JSON.parse(savedLogin);
    }

    // 加载保存的搜索引擎选择
    const savedSearchEngine = localStorage.getItem('selectedSearchEngine');
    if (savedSearchEngine) {
      selectedSearchEngine = savedSearchEngine;
    }

    // 加载设置
    await loadSettings();

    // 加载导航数据
    await loadNavItems();
  });

  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    currentTime = `${hours}:${minutes} | ${month}-${day} 星期${weekday}`;
  }

  async function loadNavItems() {
    try {
      loading = true;
      const response = await fetch(`${API_BASE}/nav-items`);
      if (response.ok) {
        navItems = await response.json();
      } else {
        navItems = getDefaultNavItems();
      }
    } catch (error) {
      console.error('加载导航数据失败:', error);
      navItems = getDefaultNavItems();
    } finally {
      loading = false;
    }
  }

  function getDefaultNavItems() {
    return [
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
          { id: 5, name: 'Stack Overflow', externalUrl: 'https://stackoverflow.com', internalUrl: 'http://internal.stackoverflow.com', icon: '❓', description: '开发者问答' }
        ]
      }
    ];
  }

  function showNotification(message) {
    toastMessage = message;
    showToast = true;
  }

  function handleLogin(status) {
    isLoggedIn = status;
    showLoginModal = false;
    localStorage.setItem('isLoggedIn', JSON.stringify(status));
  }

  function handleLogout() {
    isLoggedIn = false;
    showUserModal = false;
    localStorage.setItem('isLoggedIn', JSON.stringify(false));
    localStorage.removeItem('token');
  }

  // 处理令牌失效
  function handleTokenExpired() {
    handleLogout();
    showNotification('登录已过期，请重新登录', 'error');
  }

  async function handleChangePassword(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        showNotification('密码修改成功');
      } else {
        showNotification(result.message || '密码修改失败');
      }
    } catch (error) {
      showNotification('密码修改失败');
    }
  }

  async function handleSaveSettings(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        await loadSettings();
        showNotification('设置保存成功');
      } else {
        showNotification('设置保存失败');
      }
    } catch (error) {
      showNotification('设置保存失败');
    }
  }

  async function handleAddCategory(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        navItems = [...navItems, { ...result.category, items: [] }];
        showNotification('分组添加成功');
      } else {
        showNotification('分组添加失败');
      }
    } catch (error) {
      showNotification('分组添加失败');
    }
  }

  async function handleUpdateCategory(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/categories/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: data.name })
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        navItems = navItems.map(cat => 
          cat.id === data.id ? { ...cat, category: data.name } : cat
        );
        showNotification('分组更新成功');
      } else {
        showNotification('分组更新失败');
      }
    } catch (error) {
      showNotification('分组更新失败');
    }
  }

  async function handleDeleteCategory(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/categories/${data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        navItems = navItems.filter(cat => cat.id !== data.id);
        showNotification('分组删除成功');
      } else {
        showNotification('分组删除失败');
      }
    } catch (error) {
      showNotification('分组删除失败');
    }
  }

  async function handleDelete(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/nav-items/${data.itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        // Update local state
        navItems = navItems.map(cat => {
          if (cat.id === data.categoryId) {
            return {
              ...cat,
              items: cat.items.filter(item => item.id !== data.itemId)
            };
          }
          return cat;
        });
        showNotification('导航删除成功');
      } else {
        showNotification('导航删除失败');
      }
    } catch (error) {
      showNotification('导航删除失败');
    }
  }

  async function handleReorderCategory(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/categories/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        // Reorder categories locally
        const sourceIndex = navItems.findIndex(c => c.id === data.sourceId);
        const targetIndex = navItems.findIndex(c => c.id === data.targetId);
        
        if (sourceIndex !== -1 && targetIndex !== -1) {
          const newNavItems = [...navItems];
          const [removed] = newNavItems.splice(sourceIndex, 1);
          newNavItems.splice(targetIndex, 0, removed);
          navItems = newNavItems;
        }
        
        showNotification('分类顺序已更新');
      } else {
        showNotification('分类排序失败');
      }
    } catch (error) {
      showNotification('分类排序失败');
    }
  }
  
  async function handleRestoreData(data) {
    try {
      const token = localStorage.getItem('token');
      
      // Clear existing data first
      const clearResponse = await fetch(`${API_BASE}/clear-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const clearResult = await clearResponse.json();
      if (!clearResult.success && clearResult.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (!clearResponse.ok) {
        throw new Error('清空数据失败');
      }
      
      // Create mapping for old category IDs to new ones
      const categoryIdMap = {};
      
      // Restore categories and build ID mapping
      for (const category of data.categories) {
        const oldId = category.id;
        const response = await fetch(`${API_BASE}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(category)
        });
        
        if (response.ok) {
          const result = await response.json();
          categoryIdMap[oldId] = result.category.id;
        } else {
          console.error('Failed to restore category:', category.category);
        }
      }
      
      // Restore nav items - navItems is array of categories with items inside
      for (const categoryData of data.navItems) {
        // Each categoryData has: { id, category, items: [...] }
        const oldCategoryId = categoryData.id;
        const newCategoryId = categoryIdMap[oldCategoryId];
        
        if (!newCategoryId) {
          console.error('Category ID mapping not found for:', oldCategoryId);
          continue;
        }
        
        for (const item of categoryData.items) {
          const itemResponse = await fetch(`${API_BASE}/nav-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: item.name,
              externalUrl: item.externalUrl,
              internalUrl: item.internalUrl,
              icon: item.icon,
              description: item.description,
              categoryId: newCategoryId
            })
          });
          
          if (!itemResponse.ok) {
            console.error('Failed to restore item:', item.name);
          }
        }
      }
      
      // Restore settings
      if (data.siteSettings) {
        await fetch(`${API_BASE}/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data.siteSettings)
        });
      }
      
      // Reload data
      await loadNavItems();
      await loadSettings();
      showNotification('数据恢复成功！');
    } catch (error) {
      console.error('Restore error:', error);
      showNotification('数据恢复失败：' + error.message);
    }
  }

  async function handleAddNav(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/nav-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        await loadNavItems();
        showNotification('导航添加成功');
      } else {
        showNotification('导航添加失败');
      }
    } catch (error) {
      showNotification('导航添加失败');
    }
  }

  async function handleUpdateNav(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/nav-items/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        await loadNavItems();
        showNotification('导航更新成功');
      } else {
        showNotification('导航更新失败');
      }
    } catch (error) {
      showNotification('导航更新失败');
    }
  }

  function toggleNetwork() {
    isInternalNetwork = !isInternalNetwork;
    localStorage.setItem('isInternalNetwork', JSON.stringify(isInternalNetwork));
    showNotification(isInternalNetwork ? '已切换到内网模式' : '已切换到外网模式');
  }

  function openAddModal() {
    editingItem = null;
    showModal = true;
  }

  function openEditModal(item, categoryId) {
    editingItem = { ...item, categoryId };
    showModal = true;
  }

  function openAddModalWithCategory(categoryId) {
    // Find category name from categoryId
    const category = navItems.find(c => c.id === categoryId);
    if (category) {
      // Set editingItem to null for new item, but pass category info
      editingItem = null;
      showModal = true;
      // We'll pass the category info through a different mechanism
      // Store it temporarily
      window._preSelectedCategory = { id: categoryId, name: category.category };
    }
  }

  async function handleSave(data) {
    try {
      const token = localStorage.getItem('token');
      const url = editingItem ? `${API_BASE}/nav-items/${editingItem.id}` : `${API_BASE}/nav-items`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        showModal = false;
        editingItem = null;
        return;
      }
      if (response.ok) {
        await loadNavItems();
        showNotification(editingItem ? '导航已更新' : '导航已添加');
      } else {
        showNotification('操作失败，请重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      showNotification('保存失败，请检查网络连接');
    }

    showModal = false;
    editingItem = null;
  }

  // 处理搜索框回车 - 跳转到搜索引擎
  function handleSearchKeydown(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const engine = searchEngines.find(e => e.id === selectedSearchEngine);
      if (engine) {
        window.open(`${engine.url}${encodeURIComponent(searchQuery.trim())}`, '_blank');
      }
    }
  }

  // 切换搜索引擎下拉菜单
  async function toggleSearchEngineDropdown(e) {
    showSearchEngineDropdown = !showSearchEngineDropdown;
    
    if (showSearchEngineDropdown) {
      // 等待 DOM 更新
      await tick();
      
      // 计算下拉菜单位置
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdown = document.querySelector('.engine-dropdown');
      if (dropdown) {
        dropdown.style.top = `${rect.bottom + 10}px`;
        dropdown.style.left = `${rect.left}px`;
      }
    }
  }

  // 选择搜索引擎
  async function selectSearchEngine(engineId) {
    selectedSearchEngine = engineId;
    showSearchEngineDropdown = false;
    // 保存到本地存储
    localStorage.setItem('selectedSearchEngine', engineId);
    
    // Wait for DOM to update, then re-render Iconify icons
    await tick();
    
    // Try multiple approaches to ensure icon renders
    if (typeof window !== 'undefined') {
      // Approach 1: Use Iconify.scan()
      if (window.Iconify) {
        window.Iconify.scan();
      }
      
      // Approach 2: Manually render icon after a small delay
      setTimeout(() => {
        if (window.Iconify) {
          window.Iconify.scan();
        }
      }, 50);
    }
  }

  // 点击外部关闭下拉菜单
  function handleClickOutside(e) {
    if (showSearchEngineDropdown && !e.target.closest('.search-engine-selector')) {
      showSearchEngineDropdown = false;
    }
  }

  // 拖拽处理函数
  function handleDragStart(e) {
    draggedItem = e.detail.item;
    draggedCategory = e.detail.categoryId;
    draggedIndex = e.detail.index;
  }

  function handleDragEnd() {
    draggedItem = null;
    draggedCategory = null;
    draggedIndex = null;
  }

  async function handleDrop(e) {
    const targetItem = e.detail.item;
    const targetCategory = e.detail.categoryId;
    const targetIndex = e.detail.index;

    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const sourceCategoryIndex = navItems.findIndex(c => c.id === draggedCategory);
    const targetCategoryIndex = navItems.findIndex(c => c.id === targetCategory);

    if (sourceCategoryIndex === -1 || targetCategoryIndex === -1) return;

    const newNavItems = JSON.parse(JSON.stringify(navItems));
    const [removed] = newNavItems[sourceCategoryIndex].items.splice(draggedIndex, 1);
    newNavItems[targetCategoryIndex].items.splice(targetIndex, 0, removed);
    navItems = newNavItems;

    await saveOrder();
  }

  async function handleDropToEmptyCategory(targetCategoryId) {
    if (!draggedItem) return;

    const sourceCategoryIndex = navItems.findIndex(c => c.id === draggedCategory);
    const targetCategoryIndex = navItems.findIndex(c => c.id === targetCategoryId);

    if (sourceCategoryIndex === -1 || targetCategoryIndex === -1) return;

    const newNavItems = JSON.parse(JSON.stringify(navItems));
    const [removed] = newNavItems[sourceCategoryIndex].items.splice(draggedIndex, 1);
    newNavItems[targetCategoryIndex].items.push(removed);
    navItems = newNavItems;

    await saveOrder();
  }

  async function saveOrder() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/nav-items/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(navItems)
      });

      const result = await response.json();
      if (!result.success && result.message === '令牌无效') {
        handleTokenExpired();
        return;
      }
      if (response.ok) {
        showNotification('顺序已保存');
      } else {
        showNotification('保存顺序失败: ' + (result.message || '未知错误'));
        await loadNavItems();
      }
    } catch (error) {
      console.error('保存顺序失败:', error);
      showNotification('保存顺序失败');
      await loadNavItems();
    }
  }

  $: filteredNavItems = searchQuery.trim() === '' 
    ? navItems 
    : navItems.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0);

  // Load Bing daily background
  async function loadBingBackground() {
    try {
      const response = await fetch(`${API_BASE}/bing-background`);
      const data = await response.json();
      if (data.success && data.imageUrl) {
        document.body.style.backgroundImage = `url(${data.imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      }
    } catch (error) {
      console.error('Failed to load Bing background:', error);
    }
  }

  // Apply background image
  $: if (siteSettings.useBingBackground) {
    if (typeof document !== 'undefined') {
      loadBingBackground();
    }
  } else if (siteSettings.backgroundImage) {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundImage = `url(${siteSettings.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }

  // Apply favicon
  $: if (siteSettings.siteIcon) {
    if (typeof document !== 'undefined') {
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = siteSettings.siteIcon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }
</script>

<svelte:head>
  <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
</svelte:head>

<svelte:window on:click={handleClickOutside} />

<main>
  <div class="container">
    <header>
      <div class="header-top">
        <h1>{siteSettings.siteName || 'NAV-PANEL'}</h1>
        <div class="time">{currentTime}</div>
      </div>
      
      <div class="search-container">
        <div class="search-box">
          <div class="search-engine-selector" on:click|stopPropagation={toggleSearchEngineDropdown}>
            {#key selectedSearchEngine}
              <div class="selected-engine">
                {#if isIconifyIcon(searchEngines.find(e => e.id === selectedSearchEngine)?.icon)}
                  <span class="iconify" data-icon={searchEngines.find(e => e.id === selectedSearchEngine)?.icon} data-width="1.5rem"></span>
                {:else}
                  {searchEngines.find(e => e.id === selectedSearchEngine)?.icon || '🔍'}
                {/if}
              </div>
            {/key}
          </div>
          <input 
            type="text" 
            placeholder="请输入搜索内容" 
            bind:value={searchQuery}
            on:keydown={handleSearchKeydown}
          />
          {#if searchQuery}
            <button class="clear-btn" on:click={() => searchQuery = ''} title="清空搜索">
              ✕
            </button>
          {/if}
          <div class="search-hint">回车搜索</div>
        </div>
      </div>
    </header>

    <!-- 搜索引擎下拉菜单 - 移到顶层 -->
    {#if showSearchEngineDropdown}
      <div class="engine-dropdown">
        {#each searchEngines as engine (engine.id)}
          <button 
            class="engine-option"
            class:selected={engine.id === selectedSearchEngine}
            on:click|stopPropagation={() => selectSearchEngine(engine.id)}
          >
            <span class="engine-icon">
              {#if isIconifyIcon(engine.icon)}
                <span class="iconify" data-icon={engine.icon} data-width="1.2rem"></span>
              {:else}
                {engine.icon}
              {/if}
            </span>
            <span class="engine-name">{engine.name}</span>
          </button>
        {/each}
      </div>
    {/if}

    {#if loading}
      <div class="loading">加载中...</div>
    {:else}
      <div class="nav-grid">
        {#each filteredNavItems as category (category.id)}
          <section class="category-section">
            <h2 class="category-title">{category.category}</h2>
            <div 
              class="items-grid"
              class:empty={category.items.length === 0}
              on:dragover={(e) => {
                if (isLoggedIn && category.items.length === 0) {
                  e.preventDefault();
                }
              }}
              on:drop={(e) => {
                if (isLoggedIn && category.items.length === 0) {
                  e.preventDefault();
                  handleDropToEmptyCategory(category.id);
                }
              }}
            >
              {#if category.items.length === 0 && !isLoggedIn}
                <div class="empty-drop-zone">
                  暂无导航项
                </div>
              {:else}
                {#each category.items as item, index (item.id)}
                  <NavCard 
                    {item} 
                    {isLoggedIn}
                    {isInternalNetwork}
                    categoryId={category.id}
                    {index}
                    on:edit={(e) => openEditModal(e.detail.item, e.detail.categoryId)}
                    on:delete={(e) => handleDelete(e.detail)}
                    on:dragstart={handleDragStart}
                    on:dragend={handleDragEnd}
                    on:drop={handleDrop}
                  />
                {/each}
              {/if}
              
              {#if isLoggedIn}
                <button 
                  class="add-nav-btn" 
                  on:click|stopPropagation={() => openAddModalWithCategory(category.id)}
                  title="添加导航"
                >
                  +
                </button>
              {/if}
            </div>
          </section>
        {/each}
      </div>
    {/if}

    {#if showModal}
      <NavModal 
        {editingItem}
        categories={navItems.map(c => ({ id: c.id, name: c.category }))}
        on:save={(e) => handleSave(e.detail)}
        on:close={() => showModal = false}
      />
    {/if}

    {#if showLoginModal}
      <Login 
        on:login={(e) => handleLogin(e.detail)} 
        on:close={() => showLoginModal = false}
      />
    {/if}

    {#if showUserModal}
      <UserModal
        {isLoggedIn}
        {siteSettings}
        {navItems}
        categories={navItems.map(c => ({ id: c.id, name: c.category }))}
        on:logout={handleLogout}
        on:close={() => showUserModal = false}
        on:changePassword={(e) => handleChangePassword(e.detail)}
        on:saveSettings={(e) => handleSaveSettings(e.detail)}
        on:addCategory={(e) => handleAddCategory(e.detail)}
        on:updateCategory={(e) => handleUpdateCategory(e.detail)}
        on:deleteCategory={(e) => handleDeleteCategory(e.detail)}
        on:addNav={(e) => handleAddNav(e.detail)}
        on:updateNav={(e) => handleUpdateNav(e.detail)}
        on:deleteNav={(e) => handleDelete(e.detail)}
        on:reorderCategory={(e) => handleReorderCategory(e.detail)}
        on:restoreData={(e) => handleRestoreData(e.detail)}
        on:toast={(e) => showNotification(e.detail.message)}
      />
    {/if}

    {#if showToast}
      <Toast 
        message={toastMessage}
        on:close={() => showToast = false}
      />
    {/if}
  </div>

  <!-- 浮动按钮组 -->
  <div class="floating-buttons">
    {#if showScrollToTop}
      <button class="floating-btn scroll-btn" on:click={scrollToTop} title="回到顶部">
        ⬆️
      </button>
    {/if}
    
    <button 
      class="floating-btn network-btn" 
      class:internal={isInternalNetwork}
      on:click={toggleNetwork}
      title={isInternalNetwork ? '切换到外网' : '切换到内网'}
    >
      {#if isInternalNetwork}
        🏠
      {:else}
        🌐
      {/if}
    </button>

    {#if isLoggedIn}
      <button class="floating-btn user-btn" on:click={() => showUserModal = true} title="用户中心">
        👤
      </button>
    {:else}
      <button class="floating-btn login-btn" on:click={() => showLoginModal = true} title="登录">
        🔐
      </button>
    {/if}
  </div>

  <footer class="footer">
    <div class="footer-content">
      Powered By <a href="https://github.com/yaonew/nav-panel" target="_blank" rel="noopener noreferrer">Nav-Panel</a>
    </div>
  </footer>
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: white;
  }

  main {
    min-height: 100vh;
    padding: 20px 15px 80px;
  }

  .container {
    max-width: 1600px;
    margin: 0 auto;
    padding-bottom: 60px;
  }

  header {
    margin-bottom: 25px;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .time {
    font-size: 0.9rem;
    opacity: 0.9;
    font-weight: 300;
  }

  .search-container {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  .search-box {
    position: relative;
    width: 100%;
    max-width: 600px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    border-radius: 40px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .search-box:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .search-box:focus-within {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
  }

  .search-engine-selector {
    position: relative;
    cursor: pointer;
  }

  .selected-engine {
    font-size: 1.1rem;
    opacity: 0.8;
    transition: all 0.2s ease;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
  }

  .selected-engine:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  .engine-dropdown {
    position: fixed;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 8px;
    min-width: 150px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .engine-option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #333;
    font-size: 0.95rem;
  }

  .engine-option:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .engine-option.selected {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
    font-weight: 600;
  }

  .engine-icon {
    font-size: 1.2rem;
  }

  .engine-name {
    flex: 1;
    text-align: left;
  }

  .search-icon {
    font-size: 1.5rem;
    opacity: 0.8;
  }

  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.9rem;
    color: white;
    font-weight: 300;
    padding: 4px 0;
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .search-hint {
    font-size: 0.7rem;
    opacity: 0.4;
    white-space: nowrap;
  }

  .clear-btn {
    position: absolute;
    right: 70px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 1;
    padding: 0;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
  }

  .nav-grid {
    display: grid;
    gap: 14px;
  }

  .category-section {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(1px);
    border-radius: 12px;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .category-title {
    font-size: 0.95rem;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    font-weight: 600;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.95);
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 8px;
    min-height: 40px;
  }

  .items-grid.empty {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 100px;
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
    padding: 12px;
  }

  .items-grid.empty:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.1);
  }

  .add-nav-btn {
    aspect-ratio: 1;
    background: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    border: 2px dashed rgba(255, 255, 255, 0.25);
    border-radius: 8px;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70px;
    opacity: 0.7;
  }

  .add-nav-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
    opacity: 1;
  }



  .empty-drop-zone {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    text-align: center;
    padding: 20px;
  }

  /* 浮动按钮样式 */
  .floating-buttons {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 999;
  }

  .floating-btn {
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floating-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .network-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .network-btn.internal {
    background: rgba(255, 107, 107, 0.3);
    border-color: rgba(255, 107, 107, 0.5);
  }

  .login-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .add-btn {
    background: rgba(16, 185, 129, 0.3);
    color: white;
    border: 2px solid rgba(16, 185, 129, 0.5);
  }

  .logout-btn {
    background: rgba(107, 114, 128, 0.3);
    color: white;
    border: 2px solid rgba(107, 114, 128, 0.5);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.4rem;
    }

    .header-top {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }

    .items-grid {
      grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
      gap: 6px;
    }

    .category-section {
      padding: 10px;
    }

    .floating-buttons {
      bottom: 15px;
      right: 15px;
    }

    .floating-btn {
      width: 42px;
      height: 42px;
    }
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /*background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px); */
    padding: 15px 0;
    text-align: center;
    z-index: 10;
  }

  .footer-content {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }

  .footer-content a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
  }

  .footer-content a:hover {
    color: #764ba2;
    text-decoration: underline;
  }
</style>
