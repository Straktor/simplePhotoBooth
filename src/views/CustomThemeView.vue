<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PRESETS, GRADIENTS } from '@/themes'
import type { CustomThemeCfg } from '@/themes'

const { t } = useI18n()

const props = defineProps<{ cfg: CustomThemeCfg }>()
const emit = defineEmits<{
  update: [cfg: CustomThemeCfg]
  back: []
  apply: []
}>()

type BgMode = 'solid' | 'gradient' | 'url' | 'phone'

const bgMode = ref<BgMode>(
  !props.cfg.bgImage ? 'solid'
  : props.cfg.bgImage.startsWith('url("data:') ? 'phone'
  : props.cfg.bgImage.startsWith('url(') ? 'url'
  : 'gradient'
)
const urlDraft = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const local = ref<CustomThemeCfg>({ ...props.cfg })

const p = computed(() => local.value.primary)
const a = computed(() => local.value.accent)
const bg = computed(() => local.value.bg)
const border = computed(() => p.value + '30')

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length !== 6) return false
  const r = parseInt(c.slice(0,2), 16)
  const g = parseInt(c.slice(2,4), 16)
  const b = parseInt(c.slice(4,6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

const textColor = computed(() => isLightColor(bg.value) ? '#1a1a1a' : '#f0f0f0')
const muted = computed(() => isLightColor(bg.value) ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.42)')

const colorItems = computed(() => [
  { key: 'bg',      label: t('customTheme.bgColorLabel'),  desc: t('customTheme.bgColorDesc') },
  { key: 'primary', label: t('customTheme.primaryLabel'),  desc: t('customTheme.primaryDesc') },
  { key: 'accent',  label: t('customTheme.accentLabel'),   desc: t('customTheme.accentDesc') },
])

const bgTabs = computed(() => [
  ['solid',    t('customTheme.solid')],
  ['gradient', t('customTheme.gradient')],
  ['url',      t('customTheme.url')],
  ['phone',    t('customTheme.cameraRoll')],
] as [BgMode, string][])

function patch(partial: Partial<CustomThemeCfg>) {
  Object.assign(local.value, partial)
  emit('update', { ...local.value })
}

function applyUrl() {
  if (urlDraft.value.trim()) patch({ bgImage: `url("${urlDraft.value.trim()}")` })
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    patch({ bgImage: `url("${(ev.target as FileReader).result}")` })
    bgMode.value = 'phone'
  }
  reader.readAsDataURL(file)
}

function onApply() {
  emit('update', { ...local.value })
  emit('apply')
}
</script>

<template>
  <div class="custom-theme" :style="{ background: bg, color: textColor }">

    <!-- Header -->
    <div class="header" :style="{ borderBottom: `1px solid ${border}`, background: bg }">
      <button class="back-btn" :style="{ color: p }" @click="emit('back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <div>
        <div class="header-title">{{ t('customTheme.title') }}</div>
        <div class="header-sub" :style="{ color: p + '88' }">{{ t('customTheme.subtitle') }}</div>
      </div>
      <button class="apply-btn" :style="{ background: a, boxShadow: `0 2px 12px ${a}55` }" @click="onApply">{{ t('customTheme.apply') }}</button>
    </div>

    <!-- Live preview -->
    <div class="section-label" :style="{ color: p }">{{ t('customTheme.preview') }}</div>
    <div class="preview-wrap">
      <div
        class="preview-inner"
        :style="{
          border: `1.5px solid ${p}40`,
          background: local.bgImage ? undefined : bg,
          backgroundImage: local.bgImage ?? undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <div class="blob" :style="{ left:'15%', top:'25%', width:'110px', height:'110px', background: p + '55' }" />
        <div class="blob" :style="{ left:'58%', top:'10%', width:'85px',  height:'85px',  background: a + '55' }" />
        <div class="blob" :style="{ left:'68%', top:'58%', width:'95px',  height:'95px',  background: p + '44' }" />
        <div class="vignette" />
        <div class="focus-sq" />
        <div class="preview-topbar">
          <span
            class="preview-app-title"
            :style="{ backgroundImage: `linear-gradient(135deg,${p},${a})` }"
          >Photo Booth</span>
          <div class="preview-icons">
            <div class="preview-icon" /><div class="preview-icon" />
          </div>
        </div>
        <div class="preview-bottombar">
          <div class="preview-shutter" :style="{ background: a, boxShadow: `0 0 18px ${a}66` }">
            <div class="preview-shutter-inner" />
          </div>
        </div>
      </div>
    </div>

    <!-- Colors -->
    <div class="section-label" :style="{ color: p }">{{ t('customTheme.colors') }}</div>
    <div class="card" :style="{ border: `1px solid ${border}` }">
      <label
        v-for="(item, i) in colorItems"
        :key="item.key"
        class="color-row"
        :style="{ borderBottom: i < 2 ? `1px solid ${border}` : 'none' }"
      >
        <div class="color-swatch" :style="{ background: (local as any)[item.key], boxShadow: `0 2px 12px ${(local as any)[item.key]}55` }" />
        <div class="color-info">
          <div class="color-label">{{ item.label }}</div>
          <div class="color-desc" :style="{ color: muted }">{{ item.desc }}</div>
        </div>
        <div class="color-hex" :style="{ color: muted }">{{ (local as any)[item.key] }}</div>
        <input type="color" :value="(local as any)[item.key]" @input="(e) => patch({ [item.key]: (e.target as HTMLInputElement).value } as any)" class="hidden-color-input" />
      </label>
    </div>

    <!-- Copy from preset -->
    <div class="section-label" :style="{ color: p }">{{ t('customTheme.copyFromPreset') }}</div>
    <div class="presets-scroll">
      <button
        v-for="([k, pr]) in Object.entries(PRESETS)"
        :key="k"
        class="preset-swatch-btn"
        :title="pr.dark.label"
        @click="patch({ primary: pr.dark.primary, accent: pr.dark.accent, bg: pr.dark.bg })"
      >
        <div class="preset-swatch" :style="{ border: `1.5px solid ${border}` }">
          <div :style="{ width:'100%', height:'55%', background: pr.dark.primary }" />
          <div :style="{ width:'100%', height:'45%', background: pr.dark.accent }" />
        </div>
        <div>{{ pr.dark.emoji }}</div>
      </button>
    </div>

    <!-- Background Image -->
    <div class="section-label" :style="{ color: p }">{{ t('customTheme.bgImage') }}</div>
    <div class="bg-tabs">
      <button
        v-for="[mode, lbl] in bgTabs"
        :key="mode"
        class="bg-tab"
        :style="{
          border: `1.5px solid ${bgMode === mode ? a : border}`,
          background: bgMode === mode ? a + '22' : 'transparent',
          color: bgMode === mode ? a : muted,
        }"
        @click="bgMode = mode as BgMode"
      >{{ lbl }}</button>
    </div>

    <!-- Solid -->
    <div v-if="bgMode === 'solid'" class="card" :style="{ border: `1px solid ${border}` }">
      <label class="color-row" style="border-bottom:none">
        <div class="color-swatch" :style="{ background: local.bg }" />
        <div class="color-info">
          <div class="color-label">{{ t('customTheme.bgSolidLabel') }}</div>
          <div class="color-desc" :style="{ color: muted }">{{ t('customTheme.bgSolidDesc', { color: local.bg }) }}</div>
        </div>
        <input type="color" :value="local.bg" @input="(e) => patch({ bg: (e.target as HTMLInputElement).value, bgImage: null })" class="hidden-color-input" />
      </label>
    </div>

    <!-- Gradient -->
    <div v-else-if="bgMode === 'gradient'" class="gradient-grid">
      <button
        v-for="grad in GRADIENTS"
        :key="grad.label"
        class="grad-cell"
        :style="{ border: `2px solid ${local.bgImage === grad.value ? a : 'transparent'}` }"
        @click="patch({ bgImage: grad.value })"
      >
        <div class="grad-preview" :style="{ background: grad.value ?? local.bg, backgroundImage: grad.value ?? undefined, backgroundSize: 'cover' }" />
        <div class="grad-label">{{ grad.label }}</div>
      </button>
    </div>

    <!-- URL -->
    <div v-else-if="bgMode === 'url'" class="card" :style="{ border: `1px solid ${border}` }">
      <div class="url-input-row" :style="{ borderBottom: local.bgImage?.startsWith('url(&quot;http') ?? false ? `1px solid ${border}` : 'none' }">
        <div class="url-hint" :style="{ color: muted }">{{ t('customTheme.pasteUrl') }}</div>
        <div class="url-flex">
          <input
            v-model="urlDraft"
            placeholder="https://example.com/photo.jpg"
            class="url-input"
            :style="{ border: `1px solid ${border}`, color: '#fff' }"
            @keydown.enter="applyUrl"
          />
          <button class="url-load-btn" :style="{ background: a }" @click="applyUrl">{{ t('customTheme.load') }}</button>
        </div>
      </div>
      <div v-if="local.bgImage && local.bgImage.startsWith('url(&quot;http')" class="url-preview-row">
        <div class="url-thumb" :style="{ backgroundImage: local.bgImage, border: `1px solid ${border}` }" />
        <div class="url-loaded-text" :style="{ color: muted }">{{ t('customTheme.imageFromUrl') }}</div>
        <button class="url-remove-btn" @click="patch({ bgImage: null })">×</button>
      </div>
    </div>

    <!-- Phone -->
    <div v-else-if="bgMode === 'phone'" class="card" :style="{ border: `1px solid ${border}` }">
      <input ref="fileInput" type="file" accept="image/*" class="hidden-file" @change="handleFile" />
      <div v-if="local.bgImage?.startsWith('url(&quot;data:')" class="phone-loaded">
        <div class="phone-preview" :style="{ backgroundImage: local.bgImage, border: `1px solid ${border}` }" />
        <div class="phone-btns">
          <button class="phone-change-btn" :style="{ border: `1px solid ${border}` }" @click="fileInput?.click()">{{ t('customTheme.changePhoto') }}</button>
          <button class="phone-remove-btn" @click="patch({ bgImage: null })">{{ t('customTheme.remove') }}</button>
        </div>
      </div>
      <div v-else class="phone-empty">
        <div style="font-size:40px;line-height:1">📷</div>
        <div class="phone-title">{{ t('customTheme.chooseFromRoll') }}</div>
        <div class="phone-desc" :style="{ color: muted }">{{ t('customTheme.chooseFromRollDesc') }}</div>
        <button class="phone-browse-btn" :style="{ background: a, boxShadow: `0 4px 16px ${a}55` }" @click="fileInput?.click()">{{ t('customTheme.browsePhotos') }}</button>
      </div>
    </div>

    <div style="height:36px" />
  </div>
</template>

<style scoped>
.custom-theme {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  font-family: system-ui, sans-serif;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn { font-size: 22px; line-height: 1; }
.header-title { font-weight: 700; font-size: 17px; letter-spacing: -0.3px; }
.header-sub   { font-size: 11px; margin-top: 1px; }
.apply-btn    { margin-left: auto; padding: 8px 18px; border-radius: 20px; color: #fff; font-size: 13px; font-weight: 700; }

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  opacity: 0.75;
  padding: 18px 18px 10px;
}
.preview-wrap {
  padding: 0 18px;
}
.preview-inner {
  border-radius: 18px;
  overflow: hidden;
  height: 190px;
  position: relative;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(32px);
  transform: translate(-50%, -50%);
}
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.52) 100%);
}
.focus-sq {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 34px; height: 34px;
  border: 1.5px solid rgba(255,255,255,0.4);
  border-radius: 3px;
}
.preview-topbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45), transparent);
}
.preview-app-title {
  font-size: 13px;
  font-weight: 800;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.preview-icons {
  display: flex;
  gap: 4px;
}
.preview-icon {
  width: 24px; height: 24px;
  border-radius: 7px;
  background: rgba(0,0,0,0.32);
  border: 1px solid rgba(255,255,255,0.14);
}
.preview-bottombar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 8px 16px 12px;
  display: flex;
  justify-content: center;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
}
.preview-shutter {
  width: 42px; height: 42px;
  border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,0.85);
  display: flex; align-items: center; justify-content: center;
}
.preview-shutter-inner {
  width: 16px; height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
}

.card {
  margin: 0 18px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255,255,255,0.06);
}
.color-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  position: relative;
}
.color-swatch {
  width: 42px; height: 42px;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
}
.color-info { flex: 1; min-width: 0; }
.color-label { font-size: 15px; font-weight: 600; }
.color-desc  { font-size: 11px; margin-top: 1px; }
.color-hex   { font-size: 11px; font-family: monospace; letter-spacing: 0.4px; }
.hidden-color-input { opacity: 0; width: 0; height: 0; position: absolute; }

.presets-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 18px 4px;
}
.preset-swatch-btn {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 2px;
}
.preset-swatch {
  width: 44px; height: 44px;
  border-radius: 10px;
  overflow: hidden;
}

.bg-tabs {
  display: flex;
  gap: 6px;
  padding: 0 18px 14px;
}
.bg-tab {
  flex: 1;
  padding: 8px 2px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.18s;
}

.gradient-grid {
  margin: 0 18px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.grad-cell {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
  position: relative;
}
.grad-preview {
  width: 100%;
  height: 100%;
}
.grad-label {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 3px 4px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
}

.url-input-row { padding: 14px 16px; }
.url-hint { font-size: 12px; margin-bottom: 8px; }
.url-flex { display: flex; gap: 8px; }
.url-input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 10px 12px;
  font-family: monospace;
  font-size: 11px;
  outline: none;
}
.url-load-btn { padding: 0 14px; border-radius: 10px; color: #fff; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.url-preview-row {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.url-thumb {
  width: 40px; height: 40px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.url-loaded-text {
  flex: 1;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.url-remove-btn { color: rgba(255,100,100,0.7); font-size: 20px; padding: 0 4px; }

.hidden-file { display: none; }
.phone-loaded {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.phone-preview {
  width: 100%; height: 120px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
}
.phone-btns { display: flex; gap: 10px; }
.phone-change-btn {
  padding: 9px 20px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  font-size: 13px;
}
.phone-remove-btn {
  padding: 9px 20px;
  border-radius: 20px;
  background: rgba(255,60,60,0.15);
  border: 1px solid rgba(255,80,80,0.3);
  color: rgba(255,110,110,0.9);
  font-size: 13px;
}
.phone-empty {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.phone-title { font-size: 14px; font-weight: 700; }
.phone-desc  { font-size: 12px; max-width: 220px; }
.phone-browse-btn {
  padding: 12px 28px;
  border-radius: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
</style>
