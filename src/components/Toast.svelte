<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let message = '';
  export let duration = 2000;

  const dispatch = createEventDispatcher();

  onMount(() => {
    setTimeout(() => {
      dispatch('close');
    }, duration);
  });
</script>

<div class="toast">
  {message}
</div>

<style>
  .toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 0.95rem;
    z-index: 2000;
    animation: slideDown 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
