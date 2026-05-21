<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResolvedTheme } from '@/themes'
import type { PhotoEntry } from '@/composables/useSettings'
import PhotoViewer from '@/components/PhotoViewer.vue'

const { t } = useI18n()

const props = defineProps<{
  photos: readonly PhotoEntry[]
  theme: ResolvedTheme
}>()

const emit = defineEmits<{
  back: []
  deletePhotos: [indices: number[]]
}>()

const selectMode = ref(false)
const selected = ref(new Set<number>())
const viewerIndex = ref<number | null>(null)

const displayPhotos = computed(() =>
  props.photos.map((p, i) => ({ ...p, origIndex: i })).reverse()
)

const selectedCount = computed(() => selected.value.size)
const allSelected = computed(() => selectedCount.value === props.photos.length && props.photos.length > 0)

// Long-press handling
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let longPressTriggered = false

function onPointerDown(origIndex: number) {
  longPressTriggered = false
  longPressTimer = setTimeout(() => {
    longPressTriggered = true
    if (!selectMode.value) {
      selectMode.value = true
      selected.value = new Set([origIndex])
    } else {
      toggleItem(origIndex)
    }
  }, 400)
}

function onPointerUp(origIndex: number) {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  if (longPressTriggered) return
  // Regular tap
  if (selectMode.value) {
    toggleItem(origIndex)
  } else {
    // Open viewer — find the index in the original (non-reversed) array
    viewerIndex.value = origIndex
  }
}

function onPointerLeave() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function exitSelect() {
  selectMode.value = false
  selected.value = new Set()
}

function toggleItem(origIndex: number) {
  const s = new Set(selected.value)
  s.has(origIndex) ? s.delete(origIndex) : s.add(origIndex)
  selected.value = s
  if (s.size === 0) exitSelect()
}

function toggleAll() {
  selected.value = allSelected.value
    ? new Set()
    : new Set(props.photos.map((_, i) => i))
}

async function saveSelected() {
  const entries = displayPhotos.value.filter(p => selected.value.has(p.origIndex))
  const ts = Date.now()
  const files: File[] = []
  for (const [i, entry] of entries.entries()) {
    const blob = await fetch(entry.url).then(r => r.blob())
    files.push(new File([blob], `photo-${ts}-${i + 1}.jpg`, { type: 'image/jpeg' }))
  }
  try {
    if (navigator.canShare?.({ files })) {
      await navigator.share({ files })
    } else throw new Error()
  } catch {
    files.forEach((file, i) => {
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000 * (i + 1))
    })
  }
}

function deleteSelected() {
  emit('deletePhotos', [...selected.value])
  exitSelect()
}

function handleViewerDelete(origIndex: number) {
  emit('deletePhotos', [origIndex])
  // If no photos left, close viewer
  if (props.photos.length <= 1) {
    viewerIndex.value = null
  } else if (origIndex >= props.photos.length - 1) {
    viewerIndex.value = props.photos.length - 2
  }
}

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
</script>

<template>
  <div class="gallery" :style="{ background: theme.bg, color: theme.text, fontFamily: theme.font }">

    <!-- Header -->
    <div class="hdr" :style="{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }">
      <template v-if="!selectMode">
        <button class="hdr-btn" :style="{ color: theme.primary }" @click="emit('back')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ t('settings.back') }}
        </button>
        <div class="hdr-center">
          <span class="hdr-title" :style="{ color: theme.primary }">{{ t('gallery.title') }}</span>
          <span v-if="photos.length > 0" class="hdr-subtitle" :style="{ color: theme.textMuted }">{{ photos.length }} {{ photos.length === 1 ? 'photo' : 'photos' }}</span>
        </div>
        <button class="hdr-btn hdr-btn--right" :style="{ color: theme.primary }" @click="selectMode = true">
          {{ t('gallery.select') }}
        </button>
      </template>
      <template v-else>
        <button class="hdr-btn" :style="{ color: theme.primary }" @click="exitSelect">
          {{ t('gallery.cancel') }}
        </button>
        <div class="hdr-center">
          <span class="hdr-title">
            {{ selectedCount > 0 ? t('gallery.nSelected', selectedCount) : t('gallery.title') }}
          </span>
        </div>
        <button class="hdr-btn hdr-btn--right" :style="{ color: theme.primary }" @click="toggleAll">
          {{ allSelected ? t('gallery.none') : t('gallery.all') }}
        </button>
      </template>
    </div>

    <!-- Hint banner -->
    <div v-if="photos.length > 0 && !selectMode" class="hint-banner" :style="{ color: theme.textMuted }">
      {{ t('gallery.longPressHint') }}
    </div>

    <!-- Grid -->
    <div class="grid-wrap" :class="{ 'grid-wrap--bar': selectMode && selectedCount > 0 }">
      <div v-if="photos.length === 0" class="empty" :style="{ color: theme.textMuted }">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" :stroke="theme.textMuted" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p>{{ t('gallery.empty') }}</p>
      </div>

      <div v-else class="grid">
        <div
          v-for="item in displayPhotos"
          :key="item.origIndex"
          class="thumb"
          :class="{ 'thumb--selected': selectMode && selected.has(item.origIndex) }"
          @pointerdown.prevent="onPointerDown(item.origIndex)"
          @pointerup="onPointerUp(item.origIndex)"
          @pointerleave="onPointerLeave"
          @contextmenu.prevent
        >
          <img :src="item.url" alt="" loading="lazy" />

          <!-- Motion badge -->
          <div v-if="item.motion || item.hasVideo" class="motion-badge">
            <svg width="7" height="7" viewBox="0 0 10 10" fill="white">
              <polygon points="2,1 9,5 2,9"/>
            </svg>
          </div>

          <!-- Timestamp -->
          <div v-if="item.createdAt" class="thumb-time">
            {{ relativeTime(item.createdAt) }}
          </div>

          <!-- Select overlay -->
          <Transition name="sel">
            <div v-if="selectMode" class="sel-overlay">
              <div
                class="check"
                :style="selected.has(item.origIndex)
                  ? { background: theme.accent, borderColor: theme.accent }
                  : { background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.9)' }"
              >
                <svg v-if="selected.has(item.origIndex)" width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <polyline points="1,4 4,7 9,1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Action bar -->
    <Transition name="bar">
      <div
        v-if="selectMode && selectedCount > 0"
        class="action-bar"
        :style="{ background: theme.surface, borderTop: `1px solid ${theme.border}` }"
      >
        <button class="action-btn" :style="{ color: theme.primary }" @click="saveSelected">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ t('gallery.save', selectedCount) }}
        </button>
        <div class="action-sep" :style="{ background: theme.border }" />
        <button class="action-btn action-btn--danger" @click="deleteSelected">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          {{ t('gallery.delete', selectedCount) }}
        </button>
      </div>
    </Transition>

    <!-- Full-screen viewer -->
    <PhotoViewer
      v-if="viewerIndex !== null"
      :photos="photos"
      :initial-index="viewerIndex"
      :theme="theme"
      @close="viewerIndex = null"
      @delete="handleViewerDelete"
    />
  </div>
</template>

<style scoped>
.gallery {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.hdr-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  min-width: 64px;
}
.hdr-btn--right {
  justify-content: flex-end;
  font-weight: 600;
}
.hdr-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.hdr-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.hdr-subtitle {
  font-size: 12px;
  font-weight: 500;
}

/* ── Hint ── */
.hint-banner {
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  padding: 0 16px 8px;
  opacity: 0.6;
}

/* ── Grid ── */
.grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 3px;
  transition: padding-bottom 0.25s;
}
.grid-wrap--bar {
  padding-bottom: 76px;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 80px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}

/* ── Thumbnail ── */
.thumb {
  aspect-ratio: 3/4;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.12s;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}
.thumb--selected {
  transform: scale(0.94);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

/* ── Motion badge ── */
.motion-badge {
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 1px;
}

/* ── Timestamp ── */
.thumb-time {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 1px 6px;
  line-height: 1.4;
}

/* ── Select overlay ── */
.sel-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 6px;
  background: rgba(0,0,0,0.08);
}
.check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, border-color 0.12s;
  flex-shrink: 0;
}

/* ── Action bar ── */
.action-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: stretch;
  height: 64px;
  z-index: 20;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}
.action-btn--danger { color: #e05555; }
.action-sep {
  width: 1px;
  margin: 12px 0;
  flex-shrink: 0;
}

/* ── Transitions ── */
.sel-enter-active, .sel-leave-active { transition: opacity 0.15s; }
.sel-enter-from, .sel-leave-to { opacity: 0; }

.bar-enter-active, .bar-leave-active { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
.bar-enter-from, .bar-leave-to { transform: translateY(100%); }
</style>
