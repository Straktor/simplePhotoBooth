<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home">
    <div class="glow" />

    <div class="hero">
      <div class="logo-ring">
        <svg viewBox="0 0 24 24" class="logo-icon">
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="currentColor"/>
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
        </svg>
      </div>

      <h1 class="title">PhotoBooth</h1>
      <p class="subtitle">Capture the moment</p>
    </div>

    <RouterLink to="/booth" class="btn-start">
      Open Booth
    </RouterLink>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 2.5rem;
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.glow {
  position: absolute;
  width: 60vmax;
  height: 60vmax;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 70%);
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-ring {
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 40%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.logo-icon {
  width: 3rem;
  height: 3rem;
}

.title {
  margin: 0;
  font-size: clamp(2.2rem, 8vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

.btn-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1rem 3rem;
  border-radius: 999px;
  letter-spacing: 0.01em;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 40%, transparent);
  transition: transform var(--transition), box-shadow var(--transition);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--color-primary) 50%, transparent);
}

.btn-start:active {
  transform: scale(0.96);
}
</style>
