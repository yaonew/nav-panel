<script>
  import { createEventDispatcher } from 'svelte';

  // 开发环境使用完整URL，生产环境使用相对路径
  const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';
  const dispatch = createEventDispatcher();
  
  let username = '';
  let password = '';
  let loading = false;

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      alert('请输入用户名和密码');
      return;
    }

    try {
      loading = true;
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        dispatch('login', true);
        username = '';
        password = '';
      } else {
        alert(data.message || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，无法连接到服务器');
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<div class="login-modal" on:click|self={handleClose}>
  <div class="login-form" on:click|stopPropagation>
    <div class="modal-header">
      <h2>登录</h2>
      <button class="btn-close" on:click={handleClose}>✕</button>
    </div>
    <div class="form-group">
      <label>用户名</label>
      <input 
        type="text" 
        bind:value={username}
        placeholder="请输入用户名"
        disabled={loading}
      />
    </div>
    <div class="form-group">
      <label>密码</label>
      <input 
        type="password" 
        bind:value={password}
        placeholder="请输入密码"
        disabled={loading}
        on:keydown={(e) => e.key === 'Enter' && !loading && handleLogin()}
      />
    </div>
    <button class="btn-login" on:click={handleLogin} disabled={loading}>
      {loading ? '登录中...' : '登录'}
    </button>
    <p class="hint">默认账号: admin / admin123</p>
  </div>
</div>

<style>
  .login-modal {
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

  .login-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    min-width: 400px;
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
    margin-bottom: 20px;
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

  input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .btn-login {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: #4a90e2;
    color: white;
    transition: all 0.2s ease;
    margin-top: 10px;
  }

  .btn-login:hover:not(:disabled) {
    background: #357abd;
  }

  .btn-login:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .hint {
    text-align: center;
    margin-top: 16px;
    color: #999;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .login-form {
      min-width: 90%;
      padding: 25px;
    }
  }
</style>
