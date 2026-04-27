<script setup lang="ts">
defineProps<{ count: number }>()
</script>

<template>
  <div class="countdown-overlay">
    <Transition name="pop" mode="out-in">
      <span :key="count" class="countdown-number">{{ count }}</span>
    </Transition>
  </div>
</template>

<style scoped>
.countdown-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100;
  pointer-events: none;
}

.countdown-number {
  font-size: clamp(6rem, 25vw, 14rem);
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 40px var(--color-accent), 0 4px 20px rgba(0, 0, 0, 0.5);
  line-height: 1;
  display: block;
}

.pop-enter-active {
  animation: pop-in 0.4s ease-out;
}

.pop-leave-active {
  animation: pop-out 0.3s ease-in;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(2);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pop-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>
