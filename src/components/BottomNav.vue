<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="tab">
      <svg viewBox="0 0 24 24" class="tab-icon"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/></svg>
      <span class="tab-label">Home</span>
    </RouterLink>

    <RouterLink to="/booth" class="tab tab--center">
      <div class="shutter-tab">
        <svg viewBox="0 0 24 24" class="shutter-icon"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="currentColor"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/></svg>
      </div>
      <span class="tab-label">Booth</span>
    </RouterLink>

    <RouterLink to="/settings" class="tab">
      <svg viewBox="0 0 24 24" class="tab-icon"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/></svg>
      <span class="tab-label">Settings</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  background: rgba(9, 9, 15, 0.85);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.7rem 0.5rem;
  text-decoration: none;
  color: var(--color-text-muted);
  transition: color var(--transition);
}

.tab.router-link-exact-active {
  color: var(--color-primary);
}

.tab-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.tab-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Centre camera tab raised above nav */
.tab--center {
  position: relative;
  padding-top: 0;
  padding-bottom: 0.7rem;
}

.shutter-tab {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  margin-top: -1rem;
  box-shadow: 0 0 0 3px var(--color-bg), 0 4px 16px color-mix(in srgb, var(--color-primary) 50%, transparent);
  transition: transform var(--transition), box-shadow var(--transition);
}

.tab--center.router-link-exact-active .shutter-tab {
  background: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-bg), 0 4px 20px color-mix(in srgb, var(--color-accent) 60%, transparent);
}

.tab--center:active .shutter-tab {
  transform: scale(0.92);
}

.shutter-icon {
  width: 1.4rem;
  height: 1.4rem;
  color: #fff;
}
</style>
