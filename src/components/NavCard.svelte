<script>
  import { createEventDispatcher } from 'svelte';

  export let item;
  export let isLoggedIn;
  export let isInternalNetwork;
  export let categoryId;
  export let index;

  const dispatch = createEventDispatcher();

  $: currentUrl = isInternalNetwork ? (item.internalUrl || item.externalUrl) : item.externalUrl;

  // Check if icon is an Iconify icon (contains :)
  $: isIconifyIcon = item.icon && item.icon.includes(':');

  let iconSvg = '';
  let iconLoaded = false;

  function renderIcon() {
    if (isIconifyIcon && window.Iconify) {
      try {
        iconSvg = window.Iconify.renderHTML(item.icon, { width: '1.4rem', height: '1.4rem' }) || '';
        iconLoaded = true;
      } catch (e) {
        iconSvg = '';
      }
    }
  }

  // 异步加载图标
  function loadIconAsync() {
    if (!isIconifyIcon) {
      iconLoaded = true;
      return;
    }
    
    // 如果 Iconify 还没准备好，延迟重试
    if (!window.Iconify) {
      setTimeout(loadIconAsync, 100);
      return;
    }
    
    // 异步加载图标数据
    window.Iconify.loadIcons([item.icon], () => {
      renderIcon();
    });
  }

  $: if (item.icon) {
    iconSvg = '';
    iconLoaded = false;
    // 异步加载，不阻塞渲染
    setTimeout(loadIconAsync, 0);
  }

  function handleEdit() {
    dispatch('edit', { item, categoryId });
  }

  function handleDelete() {
    dispatch('delete', { itemId: item.id, categoryId });
  }

  function handleDragStart(e) {
    e.target.style.opacity = '0.4';
    dispatch('dragstart', { item, categoryId, index });
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1';
    dispatch('dragend');
  }

  function handleDragOver(e) {
    e.preventDefault();
    dispatch('dragover', { item, categoryId, index });
  }

  function handleDrop(e) {
    e.preventDefault();
    dispatch('drop', { item, categoryId, index });
  }
</script>



<div 
  class="nav-card"
  class:draggable={isLoggedIn}
  draggable={isLoggedIn}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
>
  <a href={currentUrl} target="_blank" rel="noopener noreferrer" class="card-link">
    <div class="card-icon">
      {#if isIconifyIcon && iconLoaded}
        {@html iconSvg}
      {:else if isIconifyIcon && !iconLoaded}
        <!-- 加载中显示默认图标 -->
        🔗
      {:else}
        {item.icon}
      {/if}
    </div>
    <div class="card-label">{item.name}</div>
  </a>
  {#if isLoggedIn}
    <div class="card-actions">
      <button class="btn-edit" on:click|stopPropagation={handleEdit}>✏️</button>
      <button class="btn-delete" on:click|stopPropagation={handleDelete}>🗑️</button>
    </div>
  {/if}
</div>

<style>
  .nav-card {
    position: relative;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
    min-height: 70px;
  }

  .nav-card:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .nav-card.draggable {
    cursor: grab;
  }

  .nav-card.draggable:active {
    cursor: grabbing;
  }

  .card-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: inherit;
    width: 100%;
    height: 100%;
    gap: 4px;
  }

  .card-icon {
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
    transition: transform 0.2s ease;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    margin-bottom: 4px;
  }

  .card-icon :global(svg) {
    width: 1.6rem;
    height: 1.6rem;
  }

  .nav-card:hover .card-icon {
    transform: scale(1.1);
  }

  .card-label {
    font-size: 0.75rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }

  .card-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    gap: 3px;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: auto;
  }

  .nav-card:hover .card-actions {
    opacity: 1;
  }

  .btn-edit, .btn-delete {
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.7rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
  }

  .btn-edit {
    background: rgba(74, 144, 226, 0.85);
  }

  .btn-edit:hover {
    background: rgba(74, 144, 226, 1);
    transform: scale(1.1);
  }

  .btn-delete {
    background: rgba(255, 107, 107, 0.85);
  }

  .btn-delete:hover {
    background: rgba(255, 107, 107, 1);
    transform: scale(1.1);
  }
</style>
