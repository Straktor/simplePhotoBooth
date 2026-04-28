<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCamera } from '@/composables/useCamera'
import { useCountdown } from '@/composables/useCountdown'
import { useSettings } from '@/composables/useSettings'
import CountdownOverlay from '@/components/CountdownOverlay.vue'

const router = useRouter()
const { settings } = useSettings()

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { isCameraReady, error, lastPhoto, facingMode, startCamera, flipCamera, capturePhoto, downloadPhoto } = useCamera(videoRef, canvasRef)
const { count, isRunning, start } = useCountdown()

const showPreview = ref(false)

async function onTakePhoto() {
  if (!isCameraReady.value || isRunning.value) return
  await start(settings.countdownDuration)
  capturePhoto('jpeg', 0.92, settings.mirrorPreview)
  showPreview.value = true
}

function onRetake() {
  showPreview.value = false
  lastPhoto.value = null
}
</script>

<template>
  <div class="booth">
    <!-- Camera feed -->
    <video
      ref="videoRef"
      class="camera-feed"
      :class="{ mirrored: facingMode === 'user' && settings.mirrorPreview }"
      autoplay
      muted
      playsinline
      @click="onTakePhoto"
    />
    <canvas ref="canvasRef" class="capture-canvas" />

    <!-- Empty state / error -->
    <div v-if="!isCameraReady" class="camera-overlay">
      <div v-if="error" class="status-msg error">
        <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <p>{{ error }}</p>
      </div>
      <div v-else class="status-msg">
        <svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"/><path fill="currentColor" d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
        <p>Tap to start camera</p>
        <button class="btn-ghost" @click="startCamera">Start Camera</button>
      </div>
    </div>

    <!-- Top bar -->
    <div class="top-bar">
      <button class="icon-btn" @click="router.push('/')" aria-label="Back">
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <span class="timer-badge" v-if="isCameraReady">{{ settings.countdownDuration }}s</span>
    </div>

    <!-- Bottom controls -->
    <div v-if="isCameraReady" class="bottom-bar">
      <button class="icon-btn" @click="flipCamera" :disabled="isRunning" aria-label="Flip camera">
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><path fill="currentColor" d="M12.5 11.5v-2l-2.5 3 2.5 3v-2c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3H8c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5z" opacity=".9"/></svg>
      </button>

      <button
        class="shutter-btn"
        :class="{ running: isRunning }"
        @click="onTakePhoto"
        :disabled="isRunning"
        aria-label="Take photo"
      >
        <span class="shutter-inner" />
      </button>

      <div class="icon-btn" /><!-- spacer -->
    </div>

    <!-- Countdown -->
    <CountdownOverlay v-if="isRunning" :count="count" />

    <!-- Preview -->
    <Transition name="slide-up">
      <div v-if="showPreview && lastPhoto" class="preview-overlay">
        <img :src="lastPhoto" alt="Captured photo" class="preview-img" />
        <div class="preview-actions">
          <button class="btn-secondary" @click="onRetake">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            Retake
          </button>
          <button class="btn-primary" @click="downloadPhoto()">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Save
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.booth {
  position: fixed;
  inset: 0;
  background: #000;
  overflow: hidden;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

.camera-feed.mirrored {
  transform: scaleX(-1);
}

.capture-canvas {
  display: none;
}

/* Empty / error state */
.camera-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}

.status-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 2rem;
}

.status-msg p {
  margin: 0;
  font-size: 1rem;
}

.status-msg.error {
  color: #ff6b6b;
}

.btn-ghost {
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  padding: 0.6rem 1.8rem;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Top bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem;
  padding-top: calc(1rem + env(safe-area-inset-top));
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
  pointer-events: none;
}

.top-bar > * {
  pointer-events: auto;
}

.timer-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

/* Icon buttons */
.icon-btn {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.icon-btn:active {
  transform: scale(0.9);
}

/* Bottom bar */
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
}

/* Shutter button */
.shutter-btn {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition), background var(--transition);
}

.shutter-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.shutter-inner {
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition), background var(--transition);
}

.shutter-btn.running .shutter-inner {
  background: var(--color-accent);
  transform: scale(0.85);
}

/* Preview */
.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  z-index: 20;
}

.preview-img {
  max-width: 100%;
  max-height: 70dvh;
  border-radius: var(--radius);
  object-fit: contain;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
}

.preview-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.btn-secondary {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
