<script>
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  
  // Import version from package.json
  import pkg from '../../package.json';
  const appVersion = pkg.version;
  
  export let isLoggedIn = false;
  export let siteSettings = {};
  export let categories = [];
  export let navItems = [];
  
  const dispatch = createEventDispatcher();
  
  let activeMenu = 'info';
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let siteName = siteSettings.siteName || 'Nav-Panel';
  let siteIcon = siteSettings.siteIcon || '';
  let backgroundImage = siteSettings.backgroundImage || '';
  let siteIconFile = null;
  let backgroundImageFile = null;
  let useBingBackground = siteSettings.useBingBackground || false;
  let isMaximized = false;
  let editingCategory = null;
  let newCategoryName = '';
  let showAddCategory = false;
  let showAddNav = false;
  let editingNav = null;
  let draggedCategory = null;
  let isMenuCollapsed = false;
  let isMobile = false;
  
  // 检测是否为移动端
  function checkMobile() {
    isMobile = window.innerWidth <= 768;
    // 移动端自动收起菜单
    if (isMobile) {
      isMenuCollapsed = true;
    }
  }
  
  // 切换菜单展开/收起
  function toggleMenu() {
    isMenuCollapsed = !isMenuCollapsed;
  }
  
  // 点击菜单项
  function handleMenuClick(menuId) {
    activeMenu = menuId;
    // 移动端点击菜单后自动收起菜单
    if (isMobile) {
      isMenuCollapsed = true;
    }
  }
  
  // 组件挂载时检测屏幕尺寸
  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });
  let newNavData = {
    name: '',
    icon: '🔗',
    externalUrl: '',
    internalUrl: '',
    description: '',
    categoryId: ''
  };
  
  // 菜单项
  const menuItems = [
    { id: 'info', name: '我的信息', icon: '👤' },
    { id: 'categories', name: '分类管理', icon: '📁' },
    { id: 'navigation', name: '导航管理', icon: '🔗' },
    { id: 'settings', name: '全局设置', icon: '⚙️' },
    { id: 'backup', name: '备份恢复', icon: '💾' },
    { id: 'about', name: '关于', icon: 'ℹ️' }
  ];
  
  // 软件信息
  const aboutInfo = {
    version: appVersion,
    website: 'https://github.com/yaonew/nav-panel',
    author: '疯狂的企鹅',
    contact: 'QQ1群: 837828880 QQ2群: 821963608',
    description: '一个现代化的导航页面管理系统'
  };
  
  function handleLogout() {
    dispatch('logout');
  }
  
  function handleIconUpload(e) {
    const file = e.target.files[0];
    if (file) {
      siteIconFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        siteIcon = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  function handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (file) {
      backgroundImageFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        backgroundImage = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  function handleClearIcon() {
    siteIcon = '';
    siteIconFile = null;
  }
  
  function handleClearBackground() {
    backgroundImage = '';
    backgroundImageFile = null;
  }
  
  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      dispatch('toast', { message: '请填写所有密码字段', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      dispatch('toast', { message: '新密码两次输入不一致', type: 'error' });
      return;
    }
    dispatch('changePassword', { currentPassword, newPassword });
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
  }
  
  function handleSaveSettings() {
    dispatch('saveSettings', { siteName, siteIcon, backgroundImage, useBingBackground });
  }
  
  function handleAddCategory() {
    if (!newCategoryName.trim()) {
      dispatch('toast', { message: '请输入分组名称', type: 'error' });
      return;
    }
    dispatch('addCategory', { name: newCategoryName });
    newCategoryName = '';
    showAddCategory = false;
  }
  
  function handleEditCategory(category) {
    editingCategory = category;
    newCategoryName = category.name;
  }
  
  function handleSaveCategory() {
    if (!newCategoryName.trim()) {
      dispatch('toast', { message: '请输入分组名称', type: 'error' });
      return;
    }
    dispatch('updateCategory', { id: editingCategory.id, name: newCategoryName });
    editingCategory = null;
    newCategoryName = '';
  }
  
  function handleDeleteCategory(categoryId) {
    if (confirm('确定要删除这个分组吗？分组下的所有导航项也会被删除。')) {
      dispatch('deleteCategory', { id: categoryId });
    }
  }
  
  function handleAddNav() {
    if (!newNavData.name.trim() || !newNavData.categoryId) {
      dispatch('toast', { message: '请填写导航名称和选择分类', type: 'error' });
      return;
    }
    dispatch('addNav', { ...newNavData, categoryId: parseInt(newNavData.categoryId) });
    newNavData = {
      name: '',
      icon: '🔗',
      externalUrl: '',
      internalUrl: '',
      description: '',
      categoryId: ''
    };
    showAddNav = false;
  }
  
  function handleEditNav(item, categoryId) {
    editingNav = { ...item, categoryId };
    newNavData = {
      name: item.name,
      icon: item.icon || '🔗',
      externalUrl: item.externalUrl || '',
      internalUrl: item.internalUrl || '',
      description: item.description || '',
      categoryId: categoryId
    };
    showAddNav = true;
  }
  
  function handleSaveNav() {
    if (!newNavData.name.trim() || !newNavData.categoryId) {
      dispatch('toast', { message: '请填写导航名称和选择分类', type: 'error' });
      return;
    }
    dispatch('updateNav', { 
      id: editingNav.id, 
      ...newNavData, 
      categoryId: parseInt(newNavData.categoryId) 
    });
    editingNav = null;
    newNavData = {
      name: '',
      icon: '🔗',
      externalUrl: '',
      internalUrl: '',
      description: '',
      categoryId: ''
    };
  }
  
  function handleDeleteNav(itemId, categoryId) {
    if (confirm('确定要删除这个导航项吗？')) {
      dispatch('deleteNav', { itemId, categoryId });
    }
  }
  
  function toggleMaximize() {
    isMaximized = !isMaximized;
  }
  
  // 分类拖拽功能
  function handleCategoryDragStart(e, category) {
    draggedCategory = category;
    e.target.style.opacity = '0.4';
  }
  
  function handleCategoryDragEnd(e) {
    e.target.style.opacity = '1';
    draggedCategory = null;
  }
  
  function handleCategoryDragOver(e) {
    e.preventDefault();
  }
  
  function handleCategoryDrop(e, targetCategory) {
    e.preventDefault();
    if (draggedCategory && draggedCategory.id !== targetCategory.id) {
      dispatch('reorderCategory', { 
        sourceId: draggedCategory.id, 
        targetId: targetCategory.id 
      });
    }
  }
  
  function handleClose() {
    dispatch('close');
  }
  
  // 备份功能
  function handleBackup() {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        categories: categories,
        navItems: navItems,
        siteSettings: siteSettings
      }
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nav-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    dispatch('showToast', { message: '备份成功！', type: 'success' });
  }
  
  // 恢复功能
  function handleRestore(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        if (!backupData.version || !backupData.data) {
          throw new Error('无效的备份文件');
        }
        
        dispatch('restoreData', backupData.data);
      } catch (error) {
        dispatch('showToast', { message: '恢复失败：' + error.message, type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
</script>

<div class="modal-overlay" on:click={handleClose}>
  <div class="modal-content" class:maximized={isMaximized} on:click|stopPropagation>
    <div class="modal-header">
      <div class="header-left">
        <button class="menu-toggle-btn" on:click={toggleMenu} title={isMenuCollapsed ? '展开菜单' : '收起菜单'}>
          {isMenuCollapsed ? '☰' : '✕'}
        </button>
        <h2>用户中心</h2>
      </div>
      <div class="header-buttons">
        <button class="maximize-btn" on:click={toggleMaximize} title={isMaximized ? '还原' : '最大化'}>
          {isMaximized ? '❐' : '⬜'}
        </button>
        <button class="close-btn" on:click={handleClose}>✕</button>
      </div>
    </div>
    
    <div class="modal-body">
      <!-- 左侧菜单 -->
      <div class="menu-sidebar" class:collapsed={isMenuCollapsed}>
        {#each menuItems as item (item.id)}
          <div 
            class="menu-item" 
            class:active={activeMenu === item.id}
            on:click={() => handleMenuClick(item.id)}
          >
            <span class="menu-icon">{item.icon}</span>
            <span class="menu-name">{item.name}</span>
          </div>
        {/each}
        
        <div class="menu-divider"></div>
        
        <div class="menu-item logout" on:click={handleLogout}>
          <span class="menu-icon">🚪</span>
          <span class="menu-name">退出登录</span>
        </div>
      </div>
      
      <!-- 右侧内容 -->
      <div class="content-area" class:expanded={isMenuCollapsed}>
        <!-- 我的信息 -->
        {#if activeMenu === 'info'}
          <div class="section">
            <h3>个人信息</h3>
            <div class="info-card">
              <div class="info-row">
                <label>用户名：</label>
                <span>admin</span>
              </div>
            </div>
            
            <h3>修改密码</h3>
            <div class="form-group">
              <label>当前密码</label>
              <input type="password" bind:value={currentPassword} placeholder="请输入当前密码" />
            </div>
            <div class="form-group">
              <label>新密码</label>
              <input type="password" bind:value={newPassword} placeholder="请输入新密码" />
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" bind:value={confirmPassword} placeholder="请再次输入新密码" />
            </div>
            <button class="btn-primary" on:click={handleChangePassword}>修改密码</button>
          </div>
        {/if}
        
        <!-- 导航分组管理 -->
        {#if activeMenu === 'categories'}
          <div class="section">
            <div class="section-header">
              <h3>导航分组管理</h3>
              <button class="btn-add" on:click={() => showAddCategory = true}>+ 新增分组</button>
            </div>
            
            {#if showAddCategory}
              <div class="inline-form">
                <input type="text" bind:value={newCategoryName} placeholder="输入分组名称" />
                <button class="btn-primary" on:click={handleAddCategory}>保存</button>
                <button class="btn-secondary" on:click={() => { showAddCategory = false; newCategoryName = ''; }}>取消</button>
              </div>
            {/if}
            
            <div class="category-list">
              {#each categories as category (category.id)}
                <div 
                  class="category-item"
                  draggable="true"
                  on:dragstart={(e) => handleCategoryDragStart(e, category)}
                  on:dragend={handleCategoryDragEnd}
                  on:dragover={handleCategoryDragOver}
                  on:drop={(e) => handleCategoryDrop(e, category)}
                >
                  {#if editingCategory && editingCategory.id === category.id}
                    <input type="text" bind:value={newCategoryName} />
                    <button class="btn-small" on:click={handleSaveCategory}>保存</button>
                    <button class="btn-small" on:click={() => { editingCategory = null; newCategoryName = ''; }}>取消</button>
                  {:else}
                    <span class="category-name">☰ {category.name}</span>
                    <div class="category-actions">
                      <button class="btn-icon" on:click={() => handleEditCategory(category)}>✏️</button>
                      <button class="btn-icon" on:click={() => handleDeleteCategory(category.id)}>🗑️</button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- 全局设置 -->
        {#if activeMenu === 'settings'}
          <div class="section">
            <h3>全局设置</h3>
            <div class="form-group">
              <label>站点名称</label>
              <input type="text" bind:value={siteName} placeholder="请输入站点名称" />
            </div>
            <div class="form-group">
              <label>站点图标</label>
              <div class="file-upload">
                <input type="file" accept="image/*" on:change={handleIconUpload} />
                {#if siteIcon}
                  <div class="image-preview-container">
                    <img src={siteIcon} alt="站点图标" class="preview-image" />
                    <button class="clear-btn" on:click={handleClearIcon}>✕</button>
                  </div>
                {/if}
              </div>
            </div>
            <div class="form-group">
              <label>背景图片</label>
              <div class="file-upload">
                <input type="file" accept="image/*" on:change={handleBackgroundUpload} />
                {#if backgroundImage}
                  <div class="image-preview-container">
                    <img src={backgroundImage} alt="背景图片" class="preview-image background-preview" />
                    <button class="clear-btn" on:click={handleClearBackground}>✕</button>
                  </div>
                {/if}
              </div>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={useBingBackground} />
                  <span>同步 Bing 每日背景图</span>
                </label>
                <p class="hint-text">勾选后将自动使用 Bing 网站每日更新的背景图</p>
              </div>
            </div>
            <button class="btn-primary" on:click={handleSaveSettings}>保存设置</button>
          </div>
        {/if}
        
        <!-- 导航管理 -->
        {#if activeMenu === 'navigation'}
          <div class="section">
            <div class="section-header">
              <h3>导航管理</h3>
              <button class="btn-add" on:click={() => showAddNav = true}>+ 新增导航</button>
            </div>
            
            {#if showAddNav || editingNav}
              <div class="nav-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>名称 *</label>
                    <input type="text" bind:value={newNavData.name} placeholder="导航名称" />
                  </div>
                  <div class="form-group">
                    <label>图标</label>
                    <input type="text" bind:value={newNavData.icon} placeholder="图标" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>分类 *</label>
                    <select bind:value={newNavData.categoryId}>
                      <option value="">请选择分类</option>
                      {#each navItems as cat (cat.id)}
                        <option value={cat.id}>{cat.category}</option>
                      {/each}
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>外网地址</label>
                    <input type="text" bind:value={newNavData.externalUrl} placeholder="https://..." />
                  </div>
                  <div class="form-group">
                    <label>内网地址</label>
                    <input type="text" bind:value={newNavData.internalUrl} placeholder="http://..." />
                  </div>
                </div>
                <div class="form-group">
                  <label>描述</label>
                  <input type="text" bind:value={newNavData.description} placeholder="描述信息" />
                </div>
                <div class="form-actions">
                  {#if editingNav}
                    <button class="btn-primary" on:click={handleSaveNav}>保存</button>
                  {:else}
                    <button class="btn-primary" on:click={handleAddNav}>添加</button>
                  {/if}
                  <button class="btn-secondary" on:click={() => { 
                    showAddNav = false; 
                    editingNav = null;
                    newNavData = { name: '', icon: '🔗', externalUrl: '', internalUrl: '', description: '', categoryId: '' };
                  }}>取消</button>
                </div>
              </div>
            {/if}
            
            <div class="nav-table">
              <table>
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>图标</th>
                    <th>分类</th>
                    <th>外网地址</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {#each navItems as cat (cat.id)}
                    {#each cat.items as item (item.id)}
                      <tr>
                        <td>{item.name}</td>
                        <td>{item.icon}</td>
                        <td>{cat.category}</td>
                        <td class="url-cell">{item.externalUrl}</td>
                        <td>
                          <button class="btn-icon" on:click={() => handleEditNav(item, cat.id)}>✏️</button>
                          <button class="btn-icon" on:click={() => handleDeleteNav(item.id, cat.id)}>🗑️</button>
                        </td>
                      </tr>
                    {/each}
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}
        
        <!-- 备份恢复 -->
        {#if activeMenu === 'backup'}
          <div class="section backup-section">
            <h3>备份恢复</h3>
            <div class="backup-card">
              <div class="backup-item">
                <h4>数据备份</h4>
                <p class="backup-desc">将当前网站的所有数据（分类、导航、设置）导出为JSON文件</p>
                <button class="backup-btn" on:click={handleBackup}>
                  <span class="btn-icon">💾</span>
                  <span>备份数据</span>
                </button>
              </div>
              
              <div class="backup-divider"></div>
              
              <div class="backup-item">
                <h4>数据恢复</h4>
                <p class="backup-desc">从备份文件恢复数据，将覆盖当前所有数据</p>
                <label class="restore-btn">
                  <span class="btn-icon">📂</span>
                  <span>恢复数据</span>
                  <input type="file" accept=".json" on:change={handleRestore} style="display: none;" />
                </label>
                <p class="warning-text">⚠️ 恢复操作将覆盖当前数据，请谨慎操作</p>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- 关于 -->
        {#if activeMenu === 'about'}
          <div class="section about-section">
            <div class="about-container">
              <!-- Logo & Title -->
              <div class="about-header">
                <div class="about-logo">N</div>
                <h2 class="about-title">Nav-Panel</h2>
                <div class="about-version">
                  <span class="version-label">v</span>
                  <span class="version-number">{aboutInfo.version}</span>
                </div>
                <a href={aboutInfo.website} target="_blank" class="check-update">检查新版本</a>
              </div>
              
              <!-- Divider -->
              <div class="about-divider">
                <div class="divider-line"></div>
                <div class="divider-dot"></div>
              </div>
              
              <!-- Project Info -->
              <div class="about-info">
                <div class="info-item">
                  <span class="info-label">网站:</span>
                  <a href={aboutInfo.website} target="_blank" class="info-link">{aboutInfo.website}</a>
                </div>
                <div class="info-item">
                  <span class="info-label">作者:</span>
                  <span class="info-value"><a href="https://blog.nsoft.vip" target="_blank" class="info-link">{aboutInfo.author}</a></span>
                </div>
                <div class="info-item">
                  <span class="info-label">交流群:</span>
                  <span class="info-value">{aboutInfo.contact}</span>
                </div>
                <div class="info-item github-item">
                  <span class="info-label"></span>
                  <div class="github-link">
                    <svg t="1775897127267" class="github-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2740" width="200" height="200"><path d="M960 512c0 97.76-28.704 185.216-85.664 263.264-56.96 78.016-130.496 131.84-220.64 161.856-10.304 1.824-18.368 0.448-22.848-4.032a22.4 22.4 0 0 1-7.2-17.504v-122.88c0-37.632-10.304-65.44-30.464-82.912a409.856 409.856 0 0 0 59.616-10.368 222.752 222.752 0 0 0 54.72-22.816c18.848-10.784 34.528-23.36 47.104-38.592 12.544-15.232 22.848-35.904 30.912-61.44 8.096-25.568 12.128-54.688 12.128-87.904 0-47.072-15.232-86.976-46.208-120.16 14.368-35.456 13.024-74.912-4.48-118.848-10.752-3.616-26.432-1.344-47.072 6.272s-38.56 16.16-53.824 25.568l-21.984 13.888c-36.32-10.304-73.536-15.232-112.096-15.232s-75.776 4.928-112.096 15.232a444.48 444.48 0 0 0-24.672-15.68c-10.336-6.272-26.464-13.888-48.896-22.432-21.952-8.96-39.008-11.232-50.24-8.064-17.024 43.936-18.368 83.424-4.032 118.848-30.496 33.632-46.176 73.536-46.176 120.608 0 33.216 4.032 62.336 12.128 87.456 8.032 25.12 18.368 45.76 30.496 61.44 12.544 15.68 28.224 28.704 47.072 39.04 18.848 10.304 37.216 17.92 54.72 22.816a409.6 409.6 0 0 0 59.648 10.368c-15.712 13.856-25.12 34.048-28.704 60.064a99.744 99.744 0 0 1-26.464 8.512 178.208 178.208 0 0 1-33.184 2.688c-13.024 0-25.568-4.032-38.144-12.544-12.544-8.512-23.296-20.64-32.256-36.32a97.472 97.472 0 0 0-28.256-30.496c-11.232-8.064-21.088-12.576-28.704-13.92l-11.648-1.792c-8.096 0-13.92 0.928-17.056 2.688-3.136 1.792-4.032 4.032-2.688 6.72s3.136 5.408 5.376 8.096 4.928 4.928 7.616 7.168l4.032 2.688c8.544 4.032 17.056 11.232 25.568 21.984 8.544 10.752 14.368 20.64 18.4 29.6l5.824 13.44c4.928 14.816 13.44 26.912 25.568 35.872 12.096 8.992 25.088 14.816 39.008 17.504 13.888 2.688 27.36 4.032 40.352 4.032s23.776-0.448 32.288-2.24l13.472-2.24c0 14.784 0 32.288 0.416 52.032 0 19.744 0.48 30.496 0.48 31.392a22.624 22.624 0 0 1-7.648 17.472c-4.928 4.48-12.992 5.824-23.296 4.032-90.144-30.048-163.68-83.84-220.64-161.888C92.256 697.216 64 609.312 64 512c0-81.152 20.192-156.064 60.096-224.672s94.176-122.88 163.232-163.232C355.936 84.192 430.816 64 512 64s156.064 20.192 224.672 60.096 122.88 94.176 163.232 163.232C939.808 355.488 960 430.848 960 512" fill="#000000" p-id="2741"></path></svg>
                    <a href="https://github.com/yaonew/nav-panel" target="_blank" class="github-text">Github</a>
                  </div>
                  <div class="github-link">
                    <svg t="1775897185508" class="github-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3705" width="200" height="200"><path d="M512 960A448 448 0 1 1 512 64a448 448 0 0 1 0 896z m226.752-497.792H484.352a22.144 22.144 0 0 0-22.144 22.144v55.296c0 12.224 9.92 22.144 22.08 22.144h154.88c12.288 0 22.144 9.92 22.144 22.08v11.072c0 36.672-29.696 66.368-66.368 66.368H384.768a22.144 22.144 0 0 1-22.08-22.08V429.056c0-36.672 29.696-66.368 66.304-66.368h309.76c12.16 0 22.08-9.92 22.08-22.144v-55.296a22.144 22.144 0 0 0-22.08-22.144h-309.76a165.888 165.888 0 0 0-165.888 165.952v309.696c0 12.224 9.92 22.144 22.144 22.144h326.272a149.312 149.312 0 0 0 149.376-149.312V484.352a22.144 22.144 0 0 0-22.144-22.144z" fill="#C71D23" p-id="3706"></path></svg>
                    <a href="https://gitee.com/yaonew/nav-panel" target="_blank" class="github-text">Gitee</a>
                  </div>
                  <div class="github-link">
                    <svg t="1775897259547" class="github-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4784" width="200" height="200"><path d="M0 0m184.32 0l655.36 0q184.32 0 184.32 184.32l0 655.36q0 184.32-184.32 184.32l-655.36 0q-184.32 0-184.32-184.32l0-655.36q0-184.32 184.32-184.32Z" fill="#458EE6" p-id="4785"></path><path d="M433.152 413.696m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4786"></path><path d="M524.288 413.696m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4787"></path><path d="M615.424 413.696m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4788"></path><path d="M342.016 413.696m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4789"></path><path d="M250.88 413.696m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4790"></path><path d="M433.152 327.68m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4791"></path><path d="M524.288 327.68m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4792"></path><path d="M342.016 327.68m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4793"></path><path d="M525.312 241.664m3.072 0l73.216 0q3.072 0 3.072 3.072l0 67.584q0 3.072-3.072 3.072l-73.216 0q-3.072 0-3.072-3.072l0-67.584q0-3.072 3.072-3.072Z" fill="#FFFFFF" p-id="4794"></path><path d="M205.9264 499.82464s-20.5824 3.46112-20.24448 13.1072c-4.57728 26.624-29.40928 253.32736 218.91072 272.64 342.54848 28.96896 417.97632-257.30048 417.97632-257.30048s93.32736 2.32448 115.7632-70.22592c-3.47136-9.216-35.47136-34.73408-100.096-25.01632 0.79872-35.328-44.81024-84.11136-59.2384-84.11136s-57.87648 58.63424-19.95776 139.42784c-1.024 2.9696-21.97504 9.69728-63.77472 11.48928z" fill="#FFFFFF" p-id="4795"></path></svg>
                    <a href="https://hub.docker.com/r/yaonew/nav-panel" target="_blank" class="github-text">Docker</a>
                  </div>
                  
                </div>
              </div>
              
              <!-- Description -->
              <div class="about-description-box">
                <p>{aboutInfo.description}</p>
              </div>
              
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    width: 900px;
    max-width: 90vw;
    height: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .modal-content.maximized {
    width: 95vw;
    height: 95vh;
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .menu-toggle-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 5px;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .menu-toggle-btn:hover {
    color: #000;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .header-buttons {
    display: flex;
    gap: 10px;
  }
  
  .maximize-btn {
    background: none;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    color: #666;
    padding: 5px;
    transition: color 0.3s;
  }
  
  .maximize-btn:hover {
    color: #000;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 5px;
    transition: color 0.3s;
  }
  
  .close-btn:hover {
    color: #000;
  }
  
  .modal-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .menu-sidebar {
    width: 200px;
    background: rgba(0, 0, 0, 0.03);
    padding: 20px 0;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease, opacity 0.3s ease;
  }
  
  .menu-sidebar.collapsed {
    width: 0;
    opacity: 0;
    overflow: hidden;
    border-right: none;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.3s;
    color: #555;
  }
  
  .menu-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .menu-item.active {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-left: 3px solid #667eea;
  }
  
  .menu-item.logout {
    color: #e74c3c;
  }
  
  .menu-item.logout:hover {
    background: rgba(231, 76, 60, 0.1);
  }
  
  .menu-icon {
    font-size: 1.2rem;
    margin-right: 10px;
  }
  
  .menu-name {
    font-size: 0.95rem;
  }
  
  .menu-divider {
    flex: 1;
  }
  
  .content-area {
    flex: 1;
    padding: 25px;
    overflow-y: auto;
    transition: all 0.3s ease;
  }
  
  .content-area.expanded {
    width: 100%;
  }
  
  .section h3 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .info-card {
    background: rgba(0, 0, 0, 0.03);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 25px;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .info-row label {
    font-weight: 600;
    color: #555;
    min-width: 80px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.3s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #667eea;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }
  
  .btn-secondary {
    background: rgba(0, 0, 0, 0.1);
    color: #555;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.3s;
  }
  
  .btn-secondary:hover {
    background: rgba(0, 0, 0, 0.15);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .btn-add {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
  }
  
  .btn-add:hover {
    background: #5a6fd6;
  }
  
  .inline-form {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .inline-form input {
    flex: 1;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }
  
  .category-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .category-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 15px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    cursor: grab;
    transition: all 0.3s;
  }
  
  .category-item:hover {
    background: rgba(0, 0, 0, 0.06);
  }
  
  .category-item:active {
    cursor: grabbing;
  }
  
  .category-name {
    font-size: 0.95rem;
    color: #333;
  }
  
  .category-actions {
    display: flex;
    gap: 8px;
  }
  
  .btn-icon {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.3s;
  }
  
  .btn-icon:hover {
    transform: scale(1.1);
  }
  
  .btn-small {
    background: #667eea;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    margin-left: 5px;
  }
  
  .nav-form {
    background: rgba(0, 0, 0, 0.03);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
  }
  
  .form-row .form-group {
    flex: 1;
    margin-bottom: 0;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .nav-table {
    overflow-x: auto;
  }
  
  .nav-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  
  .nav-table th,
  .nav-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .nav-table th {
    background: rgba(0, 0, 0, 0.05);
    font-weight: 600;
    color: #333;
  }
  
  .nav-table td {
    color: #555;
  }
  
  .url-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .backup-section {
    max-width: 600px;
  }
  
  .backup-card {
    background: rgba(0, 0, 0, 0.03);
    padding: 30px;
    border-radius: 10px;
  }
  
  .backup-item {
    margin-bottom: 20px;
  }
  
  .backup-item:last-child {
    margin-bottom: 0;
  }
  
  .backup-item h4 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .backup-desc {
    color: #666;
    font-size: 0.9rem;
    margin: 0 0 20px 0;
  }
  
  .backup-btn,
  .restore-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .backup-btn:hover,
  .restore-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  .btn-icon {
    font-size: 1.2rem;
  }
  
  .backup-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: 20px 0;
  }
  
  .warning-text {
    color: #e74c3c;
    font-size: 0.85rem;
    margin: 15px 0 0 0;
    padding: 10px;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 5px;
  }
  
  .about-section {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  
  .about-container {
    max-width: 480px;
    width: 100%;
    text-align: center;
    padding: 40px 20px;
  }
  
  .about-header {
    margin-bottom: 10px;
  }
  
  .about-logo {
    width: 80px;
    height: 80px;
    margin: 0 auto 15px;
    background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: bold;
    color: white;
    box-shadow: 0 10px 30px rgba(0, 184, 148, 0.3);
  }
  
  .about-title {
    margin: 0 0 10px 0;
    font-size: 2rem;
    font-weight: bold;
    color: #2d3436;
  }
  
  .about-version {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    margin-bottom: 10px;
  }
  
  .version-label {
    font-size: 0.9rem;
    color: #636e72;
  }
  
  .version-number {
    font-size: 0.9rem;
    color: #636e72;
    font-weight: 500;
  }
  
  .check-update {
    display: inline-block;
    color: #0984e3;
    text-decoration: underline;
    font-size: 0.9rem;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .check-update:hover {
    color: #0652DD;
  }
  
  .about-divider {
    position: relative;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .divider-line {
    width: 100%;
    height: 1px;
    background: #dfe6e9;
  }
  
  .divider-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #2d3436;
    border-radius: 50%;
  }
  
  .about-info {
    text-align: left;
    margin-bottom: 25px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  
  .info-label {
    color: #636e72;
    min-width: 80px;
    font-weight: 500;
  }
  
  .info-value {
    color: #2d3436;
  }
  
  .info-link {
    color: #0984e3;
    text-decoration: underline;
    transition: color 0.3s;
  }
  
  .info-link:hover {
    color: #0652DD;
  }
  
  .github-item {
    display: flex;
    align-items: center;
  }
  
  .github-link {
    display: flex;
    align-items: center;
    margin-left: 10px;
    gap: 8px;
  }
  
  .github-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    vertical-align: middle;
  }
  
  .github-text {
    color: #0984e3;
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.3s;
    vertical-align: middle;
  }
  
  .github-text:hover {
    color: #0652DD;
    text-decoration: underline;
  }
  
  .about-description-box {
    text-align: left;
    padding: 15px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    margin-bottom: 25px;
  }
  
  .about-description-box p {
    margin: 0;
    color: #636e72;
    line-height: 1.6;
    font-size: 0.9rem;
  }
  
  .build-info {
    display: inline-block;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 6px;
    font-size: 0.8rem;
    color: #b2bec3;
  }
  
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-size: 0.95rem;
    background: white;
    cursor: pointer;
  }
  
  select:focus {
    outline: none;
    border-color: #667eea;
  }
  
  .file-upload {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .file-upload input[type="file"] {
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    cursor: pointer;
  }
  
  .image-preview-container {
    position: relative;
    display: inline-block;
  }
  
  .clear-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(231, 76, 60, 0.9);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
  
  .clear-btn:hover {
    background: #e74c3c;
    transform: scale(1.1);
  }
  
  .preview-image {
    max-width: 100px;
    max-height: 100px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .background-preview {
    max-width: 200px;
    max-height: 150px;
  }
  
  .checkbox-group {
    margin-top: 15px;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    color: #333;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .hint-text {
    margin: 5px 0 0 26px;
    font-size: 0.85rem;
    color: #888;
  }
  
  /* 移动端响应式样式 */
  @media (max-width: 768px) {
    .modal-content {
      width: 95vw;
      max-width: 95vw;
      height: 90vh;
      max-height: 90vh;
    }
    
    .modal-header {
      padding: 15px 20px;
    }
    
    .header-left h2 {
      font-size: 1.2rem;
    }
    
    .menu-toggle-btn {
      font-size: 1.3rem;
    }
    
    /* 移动端：菜单收起时，右侧内容始终显示 */
    .content-area {
      width: 100%;
    }
    
    /* 移动端：菜单展开时，右侧内容隐藏 */
    .modal-body {
      position: relative;
    }
    
    .menu-sidebar:not(.collapsed) {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 200px;
      z-index: 10;
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .menu-sidebar:not(.collapsed) + .content-area {
      opacity: 0;
      pointer-events: none;
    }
    
    .content-area.expanded {
      opacity: 1;
      pointer-events: auto;
    }
    
    /* 移动端表单优化 */
    .form-row {
      flex-direction: column;
      gap: 10px;
    }
    
    .nav-table {
      font-size: 0.85rem;
    }
    
    .nav-table th,
    .nav-table td {
      padding: 8px 5px;
    }
    
    .url-cell {
      max-width: 120px;
    }
  }
  
  /* PC端：右侧内容始终显示 */
  @media (min-width: 769px) {
    .content-area {
      opacity: 1;
      pointer-events: auto;
    }
  }
</style>
