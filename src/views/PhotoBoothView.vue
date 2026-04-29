<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCamera } from '@/composables/useCamera'
import { useCountdown } from '@/composables/useCountdown'
import { useSettings } from '@/composables/useSettings'
import { resolveTheme, PRESETS } from '@/themes'
import type { CustomThemeCfg } from '@/themes'
import ThemeDecorations from '@/components/ThemeDecorations.vue'
import SettingsView from '@/views/SettingsView.vue'
import CustomThemeView from '@/views/CustomThemeView.vue'
import GalleryView from '@/views/GalleryView.vue'

type Screen = 'booth' | 'settings' | 'customTheme' | 'gallery'

const { settings, update, updateCustomTheme, addPhoto } = useSettings()

const screen = ref<Screen>('booth')
const isFullscreen = ref(false)
const flash = ref(false)
const previewDataUrl = ref<string | null>(null)
const showPreview = ref(false)
const isFront = ref(true)

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { isCameraReady, error, startCamera, flipCamera, capturePhoto } = useCamera(videoRef, canvasRef)
const { count: countdown, isRunning, start: startCountdown, cancel: cancelCountdown } = useCountdown()

const activeKey = computed(() => settings.activeThemeKey)
const customCfg = computed(() => settings.customThemeCfg)
const t = computed(() => resolveTheme(activeKey.value, customCfg.value))

const bgImage = computed(() =>
  activeKey.value === 'custom' ? customCfg.value.bgImage : null
)

const mirrorStyle = computed(() =>
  (settings.mirrorPreview && isFront.value) ? 'scaleX(-1)' : 'none'
)

onMounted(() => startCamera())

async function handleShoot() {
  if (isRunning.value) return
  try {
    await startCountdown(settings.countdownDuration)
  } catch {
    return // cancelled by user
  }
  flash.value = true
  const dataUrl = capturePhoto('jpeg', 0.92, settings.mirrorPreview && isFront.value)
  addPhoto(dataUrl)
  previewDataUrl.value = dataUrl
  showPreview.value = true
  setTimeout(() => { flash.value = false }, 400)
  setTimeout(() => { showPreview.value = false }, 3200)
}

function handleFlip() {
  isFront.value = !isFront.value
  flipCamera()
}

function handleSelectTheme(key: string) {
  update({ activeThemeKey: key })
}

function handleUpdateCustom(cfg: CustomThemeCfg) {
  updateCustomTheme(cfg)
}

function handleApplyCustom() {
  update({ activeThemeKey: 'custom' })
  screen.value = 'booth'
}

const galleryTheme = computed(() => t.value)
</script>

<template>
  <!-- Sub-screens -->
  <SettingsView
    v-if="screen === 'settings'"
    :active-key="activeKey"
    :custom-cfg="customCfg"
    :app-title="settings.appTitle"
    :countdown-duration="settings.countdownDuration"
    :mirror-preview="settings.mirrorPreview"
    @back="screen = 'booth'"
    @select-theme="handleSelectTheme"
    @edit-custom="screen = 'customTheme'"
    @update-title="(v) => update({ appTitle: v })"
    @update-countdown="(v) => update({ countdownDuration: v })"
    @update-mirror="(v) => update({ mirrorPreview: v })"
  />

  <CustomThemeView
    v-else-if="screen === 'customTheme'"
    :cfg="customCfg"
    @update="handleUpdateCustom"
    @back="screen = 'settings'"
    @apply="handleApplyCustom"
  />

  <GalleryView
    v-else-if="screen === 'gallery'"
    :photos="(settings.capturedPhotos as string[])"
    :theme="galleryTheme"
    @back="screen = 'booth'"
  />

  <!-- Booth -->
  <div
    v-else
    class="booth"
    :style="{ background: t.bg, fontFamily: t.font, color: t.text }"
  >
    <!-- Decorations -->
    <ThemeDecorations v-if="!isFullscreen" :theme-key="activeKey" />

    <!-- Top bar -->
    <div v-if="!isFullscreen" class="topbar">
      <div class="app-title-wrap">
        <span
          class="app-title"
          :style="{ backgroundImage: t.titleGradient }"
        >{{ settings.appTitle || 'Simple Photo Booth' }}</span>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" @click="handleFlip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
        <button class="icon-btn" @click="screen = 'settings'">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Viewfinder -->
    <div
      :class="isFullscreen ? 'vf-fullscreen' : 'vf-normal'"
    >
      <div
        :class="isFullscreen ? 'vf-inner-fs' : 'vf-inner'"
        :style="isFullscreen ? {} : {
          border: `1.5px solid ${t.viewfinderBorder}`,
          boxShadow: activeKey === 'neon' ? '0 0 40px rgba(124,111,255,0.1)' : '0 10px 36px rgba(0,0,0,0.3)',
        }"
        @click="!isCameraReady ? startCamera() : undefined"
      >
        <!-- Camera feed -->
        <div class="camera-bg" :style="{
          background: bgImage ? undefined : t.cameraBg,
          backgroundImage: bgImage ?? undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }">
          <!-- Blobs -->
          <template v-if="!bgImage">
            <div
              v-for="(color, i) in t.cameraBlobs"
              :key="i"
              class="camera-blob"
              :style="{
                left: ['20%','65%','45%','72%','12%'][i],
                top:  ['30%','20%','65%','70%','72%'][i],
                width:  ['220px','180px','160px','200px','130px'][i],
                height: ['220px','180px','160px','200px','130px'][i],
                background: color,
                animation: ['blob1 8s','blob2 10s','blob3 7s','blob1 12s reverse','blob2 9s reverse'][i] + ' ease-in-out infinite',
              }"
            />
          </template>
          <!-- Scanlines -->
          <div v-if="t.scanlines" class="scanlines" />
          <!-- Vignette -->
          <div class="vignette" />
          <!-- Focus ring -->
          <div class="focus-ring" />
          <!-- Live video -->
          <video
            ref="videoRef"
            class="camera-video"
            :style="{ transform: mirrorStyle }"
            autoplay
            playsinline
            muted
          />
        </div>

        <!-- Camera label -->
        <div class="cam-label">
          {{ isFront ? '● Front Camera' : '● Rear Camera' }}
        </div>

        <!-- Theme badge -->
        <div class="theme-badge" :style="{ color: t.accent, border: `1px solid ${t.accent}44` }">
          {{ (PRESETS[activeKey]?.emoji ?? '✏️') }} {{ PRESETS[activeKey]?.label ?? 'Custom' }}
        </div>

        <!-- Start camera overlay -->
        <div v-if="!isCameraReady && !error" class="start-overlay" @click="startCamera">
          <div class="start-btn" :style="{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>Start Camera</span>
          </div>
        </div>

        <!-- Error overlay -->
        <div v-if="error" class="error-overlay" :style="{ background: t.surface }">
          <div class="error-text" :style="{ color: t.textMuted }">{{ error }}</div>
          <button class="retry-btn" :style="{ background: t.accent }" @click="startCamera">Retry</button>
        </div>

        <!-- Fullscreen toggle -->
        <button class="fs-btn" @click="isFullscreen = !isFullscreen">
          <svg v-if="isFullscreen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>
            <path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
          </svg>
        </button>

        <!-- Countdown overlay -->
        <div v-if="isRunning" class="countdown-overlay" @click="cancelCountdown">
          <div
            :key="countdown"
            class="countdown-num"
            :style="{ color: t.countdownColor, textShadow: `0 0 50px ${t.countdownColor}90`, fontFamily: t.font }"
          >{{ countdown }}</div>
          <div class="countdown-hint">tap to cancel</div>
        </div>

        <!-- Flash -->
        <div v-if="flash" class="flash-overlay" />

        <!-- Preview -->
        <div v-if="showPreview && previewDataUrl" class="preview-wrap">
          <div class="preview-card">
            <img :src="previewDataUrl" class="preview-img" alt="captured" />
            <div class="preview-label">✓ Saved</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom controls (normal) -->
    <div v-if="!isFullscreen" class="bottom-controls">
      <button class="gallery-thumb-btn" @click="screen = 'gallery'">
        <div class="gallery-thumb" :style="{ border: `2px solid ${t.borderStrong}` }">
          <img v-if="previewDataUrl" :src="previewDataUrl" class="thumb-img" alt="last" />
          <div v-else class="thumb-empty" :style="{ background: t.surface }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="t.textMuted" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        </div>
      </button>

      <button
        class="shutter-btn"
        :style="{
          background: t.accent,
          boxShadow: t.shutterGlow,
          '--acc': t.accent,
          border: `3.5px solid ${activeKey === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.85)'}`,
        } as any"
        :disabled="!isCameraReady"
        @click="handleShoot"
      >
        <div class="shutter-inner" />
      </button>

      <div class="timer-stack">
        <button
          v-for="s in [3, 5, 10]"
          :key="s"
          class="timer-btn"
          :style="{
            background: settings.countdownDuration === s ? t.primary : t.surface,
            border: `1px solid ${settings.countdownDuration === s ? t.primary : t.border}`,
            color: settings.countdownDuration === s ? '#fff' : t.textMuted,
            fontFamily: t.font,
          }"
          @click="update({ countdownDuration: s })"
        >{{ s }}s</button>
      </div>
    </div>

    <!-- Bottom controls (fullscreen overlay) -->
    <div v-else class="bottom-controls-fs">
      <button class="gallery-thumb-btn" @click="screen = 'gallery'">
        <div class="gallery-thumb" style="border:2px solid rgba(255,255,255,0.3)">
          <img v-if="previewDataUrl" :src="previewDataUrl" class="thumb-img" alt="last" />
          <div v-else class="thumb-empty" style="background:rgba(255,255,255,0.12)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        </div>
      </button>

      <button
        class="shutter-btn"
        :style="{
          background: t.accent,
          boxShadow: t.shutterGlow,
          '--acc': t.accent,
          border: '3.5px solid rgba(255,255,255,0.85)',
        } as any"
        :disabled="!isCameraReady"
        @click="handleShoot"
      >
        <div class="shutter-inner" />
      </button>

      <div class="timer-stack">
        <button
          v-for="s in [3, 5, 10]"
          :key="s"
          class="timer-btn"
          :style="{
            background: settings.countdownDuration === s ? t.primary : 'rgba(255,255,255,0.15)',
            border: `1px solid ${settings.countdownDuration === s ? t.primary : 'rgba(255,255,255,0.2)'}`,
            color: settings.countdownDuration === s ? '#fff' : 'rgba(255,255,255,0.55)',
            fontFamily: t.font,
          }"
          @click="update({ countdownDuration: s })"
        >{{ s }}s</button>
      </div>
    </div>

    <!-- Hidden canvas for capture -->
    <canvas ref="canvasRef" style="display:none" />
  </div>
</template>

<style scoped>
.booth {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top bar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.app-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.app-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.topbar-actions { display: flex; gap: 8px; }
.icon-btn {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: rgba(0,0,0,0.28);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Viewfinder containers */
.vf-normal {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 22px;
  min-height: 0;
  position: relative;
  z-index: 5;
}
.vf-fullscreen {
  position: absolute;
  inset: 0;
  z-index: 20;
}
.vf-inner {
  width: 100%;
  aspect-ratio: 3/4;
  max-height: 100%;
  position: relative;
  border-radius: 22px;
  overflow: hidden;
}
.vf-inner-fs {
  position: absolute;
  inset: 0;
  border-radius: 0;
  overflow: hidden;
}

/* Camera background */
.camera-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.camera-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(55px);
  transform: translate(-50%, -50%);
}
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
  animation: grain 0.5s steps(1) infinite;
  pointer-events: none;
}
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.62) 100%);
  pointer-events: none;
}
.focus-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 52px; height: 52px;
  border: 1.5px solid rgba(255,255,255,0.4);
  border-radius: 4px;
  animation: focus-ring 1.5s ease-out forwards;
  pointer-events: none;
}
.camera-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Overlaid labels */
.cam-label {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 3px 12px;
  color: rgba(255,255,255,0.75);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  z-index: 5;
}
.theme-badge {
  position: absolute;
  top: 12px; right: 12px;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  z-index: 5;
}
.fs-btn {
  position: absolute;
  bottom: 14px; right: 14px;
  z-index: 15;
  width: 34px; height: 34px;
  border-radius: 9px;
  background: rgba(0,0,0,0.38);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.88);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Start / error overlays */
.start-overlay, .error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
  cursor: pointer;
}
.start-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 32px;
  border-radius: 20px;
  backdrop-filter: blur(16px);
  font-size: 15px;
  font-weight: 600;
}
.error-text { font-size: 14px; text-align: center; padding: 0 24px; }
.retry-btn { padding: 10px 24px; border-radius: 20px; color: #fff; font-weight: 700; font-size: 14px; }

/* Countdown */
.countdown-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}
.countdown-num {
  font-size: 110px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -6px;
  animation: countdown-pop 0.85s ease-out forwards;
}
.countdown-hint { color: rgba(255,255,255,0.45); font-size: 12px; }

.flash-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: #fff;
  animation: flash-anim 0.4s ease-out forwards;
  pointer-events: none;
}

/* Preview */
.preview-wrap {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  animation: preview-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
.preview-card {
  width: 140px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 36px rgba(0,0,0,0.5);
  border: 2px solid rgba(255,255,255,0.18);
}
.preview-img {
  width: 100%;
  height: 175px;
  object-fit: cover;
  display: block;
}
.preview-label {
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 10px;
  text-align: center;
  padding: 5px;
}

/* Bottom controls */
.bottom-controls {
  padding: 10px 26px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 12px;
  position: relative;
  z-index: 10;
}
.bottom-controls-fs {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 21;
  background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%);
  padding: 16px 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.gallery-thumb-btn { background: none; border: none; padding: 0; }
.gallery-thumb {
  width: 50px; height: 50px;
  border-radius: 12px;
  overflow: hidden;
}
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-empty {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shutter-btn {
  width: 70px; height: 70px;
  border-radius: 50%;
  animation: shutter-pulse 2.5s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.shutter-inner {
  width: 27px; height: 27px;
  border-radius: 50%;
  background: rgba(255,255,255,0.28);
  backdrop-filter: blur(4px);
}

.timer-stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}
.timer-btn {
  width: 36px; height: 20px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.18s;
}
</style>
