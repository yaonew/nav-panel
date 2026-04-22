<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let editingItem = null;
  export let categories = [];

  const dispatch = createEventDispatcher();

  let name = editingItem?.name || '';
  let externalUrl = editingItem?.externalUrl || '';
  let internalUrl = editingItem?.internalUrl || '';
  let icon = editingItem?.icon || '🔗';
  let description = editingItem?.description || '';
  let category = '';
  if (editingItem?.categoryName) {
    category = editingItem.categoryName;
  } else if (editingItem) {
    const foundCategory = categories.find(c => c.id === editingItem.categoryId);
    category = foundCategory?.name || '';
  }
  let showIconLibrary = false;

  function isIconifyIcon(iconStr) {
    return iconStr && iconStr.includes(':');
  }

  let iconPreview = '';
  let exampleIcons = {};

  function renderIcon(iconName, width = '1.5rem') {
    if (window.Iconify && isIconifyIcon(iconName)) {
      const svg = window.Iconify.renderSVG(iconName, { width, height: width });
      if (svg) return svg.outerHTML;
      const html = window.Iconify.renderHTML(iconName, { width, height: width });
      if (html) return html;
    }
    return null;
  }

  function updateIconPreview() {
    if (isIconifyIcon(icon)) {
      // 先确保图标数据加载完成，再渲染
      window.Iconify.loadIcons([icon], () => {
        iconPreview = renderIcon(icon, '1.4rem') || '';
      });
    } else {
      iconPreview = '';
    }
  }

  async function initIcons() {
    if (!window.Iconify) return;
    
    const iconList = ['mdi:home', 'mdi:github', 'fa:google', 'carbon:logo-twitter'];
    if (isIconifyIcon(icon)) {
      iconList.push(icon);
    }
    
    window.Iconify.loadIcons(iconList, () => {
      iconList.forEach(name => {
        const svg = renderIcon(name, '1rem');
        if (svg) exampleIcons[name] = svg;
      });
      updateIconPreview();
    });
  }

  onMount(() => {
    if (!editingItem && window._preSelectedCategory) {
      category = window._preSelectedCategory.name;
      delete window._preSelectedCategory;
    }
    // Wait for Iconify to be ready
    const checkIconify = setInterval(() => {
      if (window.Iconify) {
        clearInterval(checkIconify);
        initIcons();
      }
    }, 100);
    // Also try immediately in case Iconify is already loaded
    if (window.Iconify) {
      clearInterval(checkIconify);
      initIcons();
    }
  });

  const emojiOptions = ['🔗', '🔍', '🎯', '💻', '📱', '💬', '🎬', '📚', '🎨', '📝', '✏️', '❓', '🛠️', '🌐', '📊', '🎵', '📷', '🎮', '💼', '🌟'];

  function handleSave() {
    if (!name.trim() || !externalUrl.trim() || !category.trim()) {
      alert('请填写完整信息！(外网地址为必填项)');
      return;
    }
    const categoryObj = categories.find(c => c.name === category.trim());
    const categoryId = categoryObj ? categoryObj.id : null;
    dispatch('save', {
      name: name.trim(),
      externalUrl: externalUrl.trim(),
      internalUrl: internalUrl.trim(),
      icon,
      description: description.trim(),
      category: category.trim(),
      categoryId: categoryId || editingItem?.categoryId
    });
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<div class="modal-overlay" on:click={handleClose}>
  <div class="modal" on:click|stopPropagation>
    <div class="modal-header">
      <h2>{editingItem ? '编辑导航' : '添加导航'}</h2>
      <button class="btn-close" on:click={handleClose}>✕</button>
    </div>

    <div class="modal-body">
      <div class="form-group">
        <label>名称 *</label>
        <input type="text" bind:value={name} placeholder="例如: Google" />
      </div>

      <div class="form-group">
        <label>外网地址 *</label>
        <input type="url" bind:value={externalUrl} placeholder="https://www.example.com" />
      </div>

      <div class="form-group">
        <label>内网地址</label>
        <input type="url" bind:value={internalUrl} placeholder="http://internal.example.com" />
        <span class="hint">选填，用于内网环境访问</span>
      </div>

      <div class="form-group">
        <label>分类 *</label>
        <input 
          type="text" 
          bind:value={category} 
          placeholder="输入新分类或选择已有分类"
          list="categories"
        />
        <datalist id="categories">
          {#each categories as cat}
            <option value={cat.name} />
          {/each}
        </datalist>
      </div>

      <div class="form-group">
        <label>图标</label>
        <div class="emoji-grid">
          {#each emojiOptions as emoji}
            <button 
              class="emoji-btn" 
              class:selected={icon === emoji}
              on:click={() => { icon = emoji; updateIconPreview(); }}
            >
              {emoji}
            </button>
          {/each}
        </div>
        <div class="icon-input-section">
          <input 
            type="text" 
            bind:value={icon} 
            on:input={updateIconPreview}
            placeholder="输入图标或使用在线图标库" 
            class="icon-input"
          />
          <div class="icon-preview">
            {#if isIconifyIcon(icon)}
              {@html iconPreview}
            {:else}
              {icon}
            {/if}
          </div>
          <button 
            type="button" 
            class="icon-library-btn" 
            on:click={() => showIconLibrary = !showIconLibrary}
          >
            🎨 在线图标库
          </button>
        </div>
        {#if showIconLibrary}
          <div class="icon-library-help">
            <p class="help-title">使用 Iconify 在线图标库：</p>
            <p class="help-text">1. 访问 <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer">https://icon-sets.iconify.design/</a></p>
            <p class="help-text">2. 搜索并选择图标</p>
            <p class="help-text">3. 复制图标代码，例如：<code>mdi:home</code> 或 <code>fa:github</code></p>
            <p class="help-text">4. 粘贴到上方输入框中</p>
            <div class="icon-examples">
              <span class="example-label">常用图标示例：</span>
              <button class="example-btn" on:click={() => { icon = 'mdi:home'; updateIconPreview(); }}>
                <span class="example-icon">{@html exampleIcons['mdi:home'] || 'mdi:home'}</span>
                <span>mdi:home</span>
              </button>
              <button class="example-btn" on:click={() => { icon = 'mdi:github'; updateIconPreview(); }}>
                <span class="example-icon">{@html exampleIcons['mdi:github'] || 'mdi:github'}</span>
                <span>mdi:github</span>
              </button>
              <button class="example-btn" on:click={() => { icon = 'fa:google'; updateIconPreview(); }}>
                <span class="example-icon">{@html exampleIcons['fa:google'] || 'fa:google'}</span>
                <span>fa:google</span>
              </button>
              <button class="example-btn" on:click={() => { icon = 'carbon:logo-twitter'; updateIconPreview(); }}>
                <span class="example-icon">{@html exampleIcons['carbon:logo-twitter'] || 'carbon:logo-twitter'}</span>
                <span>carbon:logo-twitter</span>
              </button>
            </div>
          </div>
        {/if}
      </div>

      <div class="form-group">
        <label>描述</label>
        <input type="text" bind:value={description} placeholder="简短描述" />
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-cancel" on:click={handleClose}>取消</button>
      <button class="btn-save" on:click={handleSave}>保存</button>
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
  }

  h2 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f5f5f5;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .btn-close:hover {
    background: #e0e0e0;
  }

  .modal-body {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  .hint {
    display: block;
    margin-top: 4px;
    font-size: 0.8rem;
    color: #999;
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 6px;
  }

  .emoji-btn {
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emoji-btn:hover {
    border-color: #4a90e2;
    transform: scale(1.05);
  }

  .emoji-btn.selected {
    border-color: #4a90e2;
    background: rgba(74, 144, 226, 0.1);
  }

  .icon-input-section {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .icon-input {
    flex: 1;
  }

  .icon-preview {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1.2rem;
  }

  .icon-preview :global(svg) {
    width: 1.4rem;
    height: 1.4rem;
  }

  .icon-library-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
    transition: all 0.3s;
  }

  .icon-library-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .icon-library-help {
    margin-top: 15px;
    padding: 15px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(102, 126, 234, 0.2);
  }

  .help-title {
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }

  .help-text {
    color: #666;
    font-size: 0.9rem;
    margin: 5px 0;
    line-height: 1.5;
  }

  .help-text a {
    color: #667eea;
    text-decoration: none;
  }

  .help-text a:hover {
    text-decoration: underline;
  }

  .help-text code {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    color: #764ba2;
  }

  .icon-examples {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .example-label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }

  .example-btn {
    padding: 4px 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    font-family: monospace;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .example-icon {
    display: flex;
    align-items: center;
  }

  .example-btn:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }


  .modal-footer {
    display: flex;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #e0e0e0;
  }

  .btn-cancel, .btn-save {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-cancel {
    background: #f5f5f5;
    color: #666;
  }

  .btn-cancel:hover {
    background: #e0e0e0;
  }

  .btn-save {
    background: #4a90e2;
    color: white;
  }

  .btn-save:hover {
    background: #357abd;
  }

  @media (max-width: 768px) {
    .emoji-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }
</style>
