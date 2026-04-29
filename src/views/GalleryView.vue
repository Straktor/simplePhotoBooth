<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ResolvedTheme } from '@/themes'

const { t } = useI18n()

const props = defineProps<{
  photos: string[]
  theme: ResolvedTheme
}>()

const emit = defineEmits<{ back: [] }>()

const t2 = props.theme

function downloadPhoto(dataUrl: string, index: number) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `photo-booth-${index + 1}.jpg`
  a.click()
}
</script>

<template>
  <div class="gallery" :style="{ background: t2.bg, color: t2.text, fontFamily: t2.font }">
    <div class="header" :style="{ borderBottom: `1px solid ${t2.border}`, background: t2.bg }">
      <button class="back-btn" :style="{ color: t2.primary }" @click="emit('back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <span class="title">{{ t('gallery.title') }}</span>
      <span class="count" :style="{ color: t2.textMuted }">{{ t('gallery.photoCount', photos.length) }}</span>
    </div>

    <div class="grid-wrap">
      <div v-if="photos.length === 0" class="empty" :style="{ color: t2.textMuted }">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" :stroke="t2.textMuted" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p>{{ t('gallery.empty') }}</p>
      </div>

      <div v-else class="grid">
        <div
          v-for="(photo, i) in [...photos].reverse()"
          :key="i"
          class="thumb"
          @click="downloadPhoto(photo, photos.length - 1 - i)"
        >
          <img :src="photo" :alt="`Photo ${i + 1}`" />
          <div class="dl-hint">↓</div>
        </div>
      </div>
    </div>
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
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 12px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  font-size: 22px;
  line-height: 1;
  padding: 0;
}
.title {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.3px;
}
.count {
  margin-left: auto;
  font-size: 13px;
}
.grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 60px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}
.thumb {
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.dl-hint {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  opacity: 0;
  transition: opacity 0.18s;
}
.thumb:hover .dl-hint,
.thumb:active .dl-hint {
  opacity: 1;
}
</style>
