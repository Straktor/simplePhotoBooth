<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PhotoEntry } from '@/composables/useSettings'
import { getPhotoById } from '@/composables/useSettings'
import type { ResolvedTheme } from '@/themes'

const { t } = useI18n()

const props = defineProps<{
  photos: readonly PhotoEntry[]
  initialIndex: number
  theme: ResolvedTheme
}>()

const emit = defineEmits<{
  close: []
  delete: [index: number]
}>()

const currentIndex = ref(props.initialIndex)
const photo = computed(() => props.photos[currentIndex.value])
const total = computed(() => props.photos.length)

// Video playback
const videoUrl = ref<string | null>(null)
const isLoadingVideo = ref(false)
const isPlayingVideo = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)

// Swipe state
const containerRef = ref<HTMLElement | null>(null)

const isDragging = ref(false)
const dragStartX = ref(0)
const dragDelta = ref(0)
const swipeTransition = ref('')

// Pinch-to-zoom
const scale = ref(1)
const originX = ref(0)
const originY = ref(0)
const panX = ref(0)
const panY = ref(0)
const isPinching = ref(false)
const initialPinchDist = ref(0)
const initialScale = ref(1)
const lastPanX = ref(0)
const lastPanY = ref(0)

// Close animation
const isClosing = ref(false)

function resetZoom() {
  scale.value = 1
  panX.value = 0
  panY.value = 0
  originX.value = 0
  originY.value = 0
}

function cleanupVideo() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }
  isPlayingVideo.value = false
  isLoadingVideo.value = false
}

function goTo(index: number) {
  if (index < 0 || index >= total.value) return
  cleanupVideo()
  resetZoom()
  currentIndex.value = index
}

function handlePrev() { goTo(currentIndex.value - 1) }
function handleNext() { goTo(currentIndex.value + 1) }

async function playVideo() {
  const p = photo.value
  if (!p?.id || !p.hasVideo) return
  isLoadingVideo.value = true
  try {
    const dbPhoto = await getPhotoById(p.id)
    if (dbPhoto?.videoBlob) {
      videoUrl.value = URL.createObjectURL(dbPhoto.videoBlob)
      isPlayingVideo.value = true
      await nextTick()
      videoRef.value?.play().catch(() => {})
    }
  } catch (e) {
    console.error('Failed to load video', e)
  } finally {
    isLoadingVideo.value = false
  }
}

function handleVideoEnded() {
  cleanupVideo()
}

function handleClose() {
  isClosing.value = true
  setTimeout(() => {
    cleanupVideo()
    emit('close')
  }, 200)
}

function handleDelete() {
  const idx = currentIndex.value
  cleanupVideo()
  emit('delete', idx)
  if (total.value <= 1) {
    emit('close')
  } else if (currentIndex.value >= total.value - 1) {
    currentIndex.value = total.value - 2
  }
}

async function handleShare() {
  const p = photo.value
  if (!p) return
  try {
    const blob = await fetch(p.url).then(r => r.blob())
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] })
      return
    }
  } catch { /* fall through */ }
  // Fallback: download
  handleDownload()
}

function handleDownload() {
  const p = photo.value
  if (!p) return
  const a = document.createElement('a')
  a.href = p.url
  a.download = `photo-${Date.now()}.jpg`
  a.click()
}

// Touch handlers for swipe + pinch
function getTouchDist(e: TouchEvent): number {
  const [a, b] = [e.touches[0], e.touches[1]]
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function getTouchMid(e: TouchEvent): { x: number; y: number } {
  const [a, b] = [e.touches[0], e.touches[1]]
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
}

function onTouchStart(e: TouchEvent) {
  if (isPlayingVideo.value) return
  if (e.touches.length === 2) {
    // Pinch start
    isPinching.value = true
    isDragging.value = false
    initialPinchDist.value = getTouchDist(e)
    initialScale.value = scale.value
    const mid = getTouchMid(e)
    lastPanX.value = mid.x
    lastPanY.value = mid.y
    e.preventDefault()
  } else if (e.touches.length === 1 && scale.value <= 1) {
    // Swipe start (only when not zoomed)
    isDragging.value = true
    dragStartX.value = e.touches[0].clientX
    dragDelta.value = 0
    swipeTransition.value = ''
  } else if (e.touches.length === 1 && scale.value > 1) {
    // Pan when zoomed
    isDragging.value = true
    lastPanX.value = e.touches[0].clientX
    lastPanY.value = e.touches[0].clientY
  }
}

function onTouchMove(e: TouchEvent) {
  if (isPlayingVideo.value) return
  if (isPinching.value && e.touches.length === 2) {
    e.preventDefault()
    const dist = getTouchDist(e)
    const newScale = Math.max(1, Math.min(5, initialScale.value * (dist / initialPinchDist.value)))
    scale.value = newScale

    const mid = getTouchMid(e)
    panX.value += mid.x - lastPanX.value
    panY.value += mid.y - lastPanY.value
    lastPanX.value = mid.x
    lastPanY.value = mid.y
  } else if (isDragging.value && e.touches.length === 1) {
    if (scale.value > 1) {
      // Panning zoomed image
      e.preventDefault()
      const dx = e.touches[0].clientX - lastPanX.value
      const dy = e.touches[0].clientY - lastPanY.value
      panX.value += dx
      panY.value += dy
      lastPanX.value = e.touches[0].clientX
      lastPanY.value = e.touches[0].clientY
    } else {
      // Horizontal swipe
      dragDelta.value = e.touches[0].clientX - dragStartX.value
    }
  }
}

function onTouchEnd(_e: TouchEvent) {
  if (isPlayingVideo.value) return
  if (isPinching.value) {
    isPinching.value = false
    if (scale.value <= 1.05) {
      resetZoom()
    }
    return
  }
  if (!isDragging.value) return
  isDragging.value = false

  if (scale.value > 1) return // Was panning, not swiping

  const threshold = 60
  swipeTransition.value = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)'
  if (dragDelta.value < -threshold && currentIndex.value < total.value - 1) {
    handleNext()
  } else if (dragDelta.value > threshold && currentIndex.value > 0) {
    handlePrev()
  }
  dragDelta.value = 0
}

// Double-tap to zoom
let lastTapTime = 0
function onDoubleTap(ev: TouchEvent | MouseEvent) {
  const now = Date.now()
  if (now - lastTapTime < 300) {
    if (scale.value > 1) {
      resetZoom()
    } else {
      scale.value = 2.5
      // Center zoom on tap position
      const rect = containerRef.value?.getBoundingClientRect()
      if (rect) {
        const clientX = 'touches' in ev ? (ev as TouchEvent).touches[0]?.clientX ?? rect.left + rect.width / 2 : (ev as MouseEvent).clientX
        const clientY = 'touches' in ev ? (ev as TouchEvent).touches[0]?.clientY ?? rect.top + rect.height / 2 : (ev as MouseEvent).clientY
        originX.value = ((clientX - rect.left) / rect.width) * 100
        originY.value = ((clientY - rect.top) / rect.height) * 100
      }
    }
  }
  lastTapTime = now
}

// Keyboard navigation
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') handlePrev()
  else if (e.key === 'ArrowRight') handleNext()
  else if (e.key === 'Escape') handleClose()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  cleanupVideo()
})

// Relative time helper
function relativeTime(ts?: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return t('gallery.viewer.justNow')
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  return `${day}d`
}

const photoTime = computed(() => relativeTime(photo.value?.createdAt))
</script>

<template>
  <Transition name="viewer">
    <div
      class="viewer"
      :class="{ 'viewer--closing': isClosing }"
      @touchstart.passive="onDoubleTap"
    >
      <!-- Header -->
      <div class="viewer-header">
        <button class="viewer-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div class="viewer-title">
          <span class="viewer-index">{{ currentIndex + 1 }} / {{ total }}</span>
          <span v-if="photoTime" class="viewer-time">{{ photoTime }}</span>
        </div>
        <div style="width: 40px" />
      </div>

      <!-- Image area with swipe + pinch -->
      <div
        ref="containerRef"
        class="viewer-content"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="viewer-slide"
          :style="{
            transform: `translateX(${dragDelta}px)`,
            transition: isDragging ? 'none' : swipeTransition,
          }"
        >
          <img
            :src="photo?.url"
            class="viewer-img"
            :style="{
              transform: `scale(${scale}) translate(${panX / scale}px, ${panY / scale}px)`,
              transformOrigin: scale > 1 ? `${originX}% ${originY}%` : 'center center',
              transition: isPinching || isDragging ? 'none' : 'transform 0.25s ease-out',
            }"
            alt=""
            draggable="false"
          />
        </div>

        <!-- Video player overlay -->
        <div v-if="isPlayingVideo && videoUrl" class="video-overlay">
          <video
            ref="videoRef"
            class="viewer-video"
            :src="videoUrl"
            autoplay
            playsinline
            @ended="handleVideoEnded"
            @click="cleanupVideo"
          />
        </div>

        <!-- Play button for motion photos -->
        <button
          v-if="photo?.hasVideo && !isPlayingVideo"
          class="play-btn"
          :class="{ 'play-btn--loading': isLoadingVideo }"
          @click="playVideo"
        >
          <svg v-if="!isLoadingVideo" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
            <polygon points="6 3 20 12 6 21"/>
          </svg>
          <div v-else class="play-spinner" />
          <span class="play-label">{{ isLoadingVideo ? '...' : t('gallery.viewer.playVideo') }}</span>
        </button>

        <!-- Motion badge (no video available) -->
        <div v-if="photo?.motion && !photo?.hasVideo && !isPlayingVideo" class="no-video-badge">
          {{ t('gallery.viewer.videoUnavailable') }}
        </div>

        <!-- Swipe arrows (desktop) -->
        <button v-if="currentIndex > 0 && scale <= 1" class="nav-arrow nav-arrow--left" @click="handlePrev">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button v-if="currentIndex < total - 1 && scale <= 1" class="nav-arrow nav-arrow--right" @click="handleNext">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- Bottom actions -->
      <div class="viewer-actions">
        <button class="action-btn" @click="handleShare">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          <span>{{ t('gallery.viewer.share') }}</span>
        </button>
        <button class="action-btn" @click="handleDownload">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>{{ t('gallery.viewer.download') }}</span>
        </button>
        <button class="action-btn action-btn--danger" @click="handleDelete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          <span>{{ t('gallery.viewer.delete') }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.96);
  display: flex;
  flex-direction: column;
  animation: viewer-in 0.25s ease-out;
  touch-action: none;
  user-select: none;
}
.viewer--closing {
  animation: viewer-out 0.2s ease-in forwards;
}

@keyframes viewer-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes viewer-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

/* Header */
.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  flex-shrink: 0;
  z-index: 10;
}
.viewer-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.viewer-btn:hover { background: rgba(255, 255, 255, 0.18); }

.viewer-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.viewer-index {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
}
.viewer-time {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 500;
}

/* Content area */
.viewer-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  will-change: transform;
  pointer-events: none;
}

/* Video overlay */
.video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 15;
  animation: fade-in 0.2s ease-out;
}
.viewer-video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

/* Play button */
.play-btn {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px 10px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: background 0.15s, transform 0.15s;
}
.play-btn:hover { background: rgba(0, 0, 0, 0.75); }
.play-btn:active { transform: translateX(-50%) scale(0.96); }
.play-btn--loading { pointer-events: none; opacity: 0.7; }

.play-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.play-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.no-video-badge {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
}

/* Nav arrows (desktop) */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: background 0.15s;
}
.nav-arrow:hover { background: rgba(255, 255, 255, 0.16); }
.nav-arrow--left { left: 12px; }
.nav-arrow--right { right: 12px; }
@media (hover: hover) and (pointer: fine) {
  .nav-arrow { display: flex; }
}

/* Bottom actions */
.viewer-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 8px 20px;
  flex-shrink: 0;
  z-index: 10;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  transition: background 0.15s;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.action-btn:hover { background: rgba(255, 255, 255, 0.08); }
.action-btn--danger { color: #e05555; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
