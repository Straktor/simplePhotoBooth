<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
    <span class="logo-icon">📷</span>
    <span class="logo-text">PhotoBooth</span>
    <button v-if="showInstall" class="install-btn" @click="install">
      ⬇ Install
    </button>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  padding-top: calc(0.6rem + env(safe-area-inset-top));
  background-color: var(--color-surface);
  border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.logo-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.logo-text {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
  flex: 1;
}

.install-btn {
  background-color: var(--color-primary);
  color: #fff;
  font-size: 0.8rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  white-space: nowrap;
}
</style>
