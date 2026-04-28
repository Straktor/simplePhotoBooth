<script setup lang="ts">
import { ref } from 'vue'
import { useCamera } from '@/composables/useCamera'
import { useCountdown } from '@/composables/useCountdown'
import { useSettings } from '@/composables/useSettings'
import CountdownOverlay from '@/components/CountdownOverlay.vue'

const { settings } = useSettings()

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { isCameraReady, error, lastPhoto, facingMode, startCamera, flipCamera, capturePhoto, downloadPhoto } = useCamera(videoRef, canvasRef)
const { count, isRunning, start } = useCountdown()

const showPreview = ref(false)

async function onTakePhoto() {
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
    <div
      class="camera-container"
      :class="{ clickable: isCameraReady && !isRunning }"
      @click="isCameraReady && !isRunning && onTakePhoto()"
    >
      <video
        ref="videoRef"
        class="camera-feed"
        :class="{ mirrored: facingMode === 'user' && settings.mirrorPreview }"
        autoplay
        muted
        playsinline
      />
      <canvas ref="canvasRef" class="capture-canvas" />

      <div v-if="!isCameraReady && !error" class="camera-placeholder">
        <span class="placeholder-icon">📷</span>
        <p>Camera not started</p>
      </div>

      <div v-if="error" class="camera-error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
      </div>

      <CountdownOverlay v-if="isRunning" :count="count" />
    </div>

    <div class="controls">
      <button v-if="!isCameraReady" class="btn-primary" @click="startCamera">
        Start Camera
      </button>

      <template v-else>
        <button class="btn-flip" @click="flipCamera" :disabled="isRunning" title="Flip camera">
          🔄
        </button>
        <button class="btn-capture" @click="onTakePhoto" :disabled="isRunning">
          {{ isRunning ? 'Get ready...' : 'Take Photo' }}
        </button>
      </template>
    </div>

    <Transition name="fade">
      <div v-if="showPreview && lastPhoto" class="preview-overlay" @click.self="onRetake">
        <div class="preview-card">
          <img :src="lastPhoto" alt="Captured photo" class="preview-img" />
          <div class="preview-actions">
            <button class="btn-download" @click="downloadPhoto()">
              Download
            </button>
            <button class="btn-retake" @click="onRetake">
              Retake
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.booth {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0;
}

.camera-container {
  position: relative;
  flex: 1;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50dvh;
  overflow: hidden;
}

.camera-container.clickable {
  cursor: pointer;
}

.camera-container.clickable:active .camera-feed {
  filter: brightness(1.3);
  transition: filter 0.1s ease;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-feed.mirrored {
  transform: scaleX(-1);
}

.capture-canvas {
  display: none;
}

.camera-placeholder,
.camera-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-text-muted);
}

.placeholder-icon,
.error-icon {
  font-size: 3rem;
}

.camera-error {
  color: #ff6b6b;
}

.camera-error p {
  margin: 0;
  text-align: center;
  padding: 0 1rem;
  max-width: 320px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 1rem;
  background-color: var(--color-surface);
  border-top: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  padding: 0.75rem 2rem;
  border-radius: var(--radius);
  font-weight: 600;
}

.btn-capture {
  background-color: var(--color-accent);
  color: #fff;
  font-size: 1rem;
  padding: 0.75rem 2.5rem;
  border-radius: 999px;
  font-weight: 700;
  min-width: 160px;
}

.btn-flip {
  background-color: var(--color-surface-2);
  color: var(--color-text);
  font-size: 1.25rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preview-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 640px;
  width: 100%;
}

.preview-img {
  width: 100%;
  border-radius: var(--radius);
  display: block;
  max-height: 70dvh;
  object-fit: contain;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-download {
  background-color: var(--color-primary);
  color: #fff;
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: var(--radius);
  flex: 1;
  max-width: 200px;
}

.btn-retake {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-text-muted);
  padding: 0.75rem 2rem;
  border-radius: var(--radius);
  flex: 1;
  max-width: 200px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
