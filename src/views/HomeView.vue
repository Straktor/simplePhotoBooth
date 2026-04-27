<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home">
    <div class="hero">
      <div class="hero-icon">📷</div>
      <h1 class="hero-title">Simple Photo Booth</h1>
      <p class="hero-subtitle">Strike a pose and capture the moment</p>
    </div>

    <nav class="menu">
      <RouterLink to="/booth" class="menu-card">
        <span class="card-icon">🎬</span>
        <div class="card-body">
          <h2>Photo Booth</h2>
          <p>Take photos with a countdown timer</p>
        </div>
        <span class="card-arrow">→</span>
      </RouterLink>

      <RouterLink to="/settings" class="menu-card">
        <span class="card-icon">⚙️</span>
        <div class="card-body">
          <h2>Settings</h2>
          <p>Customize theme, countdown, and more</p>
        </div>
        <span class="card-arrow">→</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem 1rem;
  gap: 3rem;
}

.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.hero-icon {
  font-size: 4rem;
  line-height: 1;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.8rem, 6vw, 3rem);
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.hero-subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 480px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background-color: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
  border-radius: var(--radius);
  color: var(--color-text);
  text-decoration: none;
  transition: background-color var(--transition), border-color var(--transition), transform var(--transition);
}

.menu-card:hover {
  background-color: color-mix(in srgb, var(--color-surface) 80%, var(--color-primary));
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
}

.card-body h2 {
  margin: 0 0 0.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.card-body p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.card-arrow {
  color: var(--color-primary);
  font-size: 1.25rem;
  flex-shrink: 0;
}
</style>
