<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import { useSettings } from '@/composables/useSettings'

const { settings } = useSettings()

const fontMap: Record<string, string> = {
  system: 'system-ui, -apple-system, sans-serif',
  mono: '"Courier New", Courier, monospace',
  serif: 'Georgia, "Times New Roman", serif',
}

const cssVars = computed(() => ({
  '--color-primary': settings.primaryColor,
  '--color-accent': settings.accentColor,
  '--color-bg': settings.backgroundColor,
  '--font-family': fontMap[settings.fontFamily],
  '--bg-image': settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
}))
</script>

<template>
  <div class="app-layout" :style="cssVars">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: var(--color-text);
  font-family: var(--font-family);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* reserve space for the fixed bottom nav (~60px + safe area) */
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
}
</style>
