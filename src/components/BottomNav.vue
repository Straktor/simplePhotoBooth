<script setup lang="ts">
import { RouterLink } from 'vue-router'

const tabs = [
  { to: '/',         icon: '🏠', label: 'Home'     },
  { to: '/booth',    icon: '📷', label: 'Booth'    },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
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
  background-color: var(--color-surface);
  border-top: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.6rem 0.5rem;
  text-decoration: none;
  color: var(--color-text-muted);
  transition: color var(--transition);
  position: relative;
}

.tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 0 0 2px 2px;
  transition: width var(--transition);
}

.tab.router-link-exact-active {
  color: var(--color-primary);
}

.tab.router-link-exact-active::before {
  width: 40%;
}

.tab-icon {
  font-size: 1.4rem;
  line-height: 1;
  transition: transform var(--transition);
}

.tab.router-link-exact-active .tab-icon {
  transform: scale(1.1);
}

.tab-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
