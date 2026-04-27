<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const deferredPrompt = ref<Event | null>(null)
const showInstall = ref(false)

function onBeforeInstall(e: Event) {
  e.preventDefault()
  deferredPrompt.value = e
  showInstall.value = true
}

async function install() {
  if (!deferredPrompt.value) return
  const promptEvent = deferredPrompt.value as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> }
  promptEvent.prompt()
  const { outcome } = await promptEvent.userChoice
  if (outcome === 'accepted') showInstall.value = false
  deferredPrompt.value = null
}

onMounted(() => window.addEventListener('beforeinstallprompt', onBeforeInstall))
onUnmounted(() => window.removeEventListener('beforeinstallprompt', onBeforeInstall))
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="logo">
      <span class="logo-icon">📷</span>
      <span class="logo-text">PhotoBooth</span>
    </RouterLink>

    <nav class="nav">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/booth" class="nav-link">Booth</RouterLink>
      <RouterLink to="/settings" class="nav-link">Settings</RouterLink>
    </nav>

    <button v-if="showInstall" class="install-btn" @click="install">
      Install App
    </button>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  margin-right: auto;
}

.logo-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  transition: color var(--transition), background-color var(--transition);
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
  background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.nav-link.router-link-exact-active {
  color: var(--color-primary);
}

.install-btn {
  background-color: var(--color-primary);
  color: #fff;
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  white-space: nowrap;
}
</style>
