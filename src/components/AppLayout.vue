<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}
</style>
