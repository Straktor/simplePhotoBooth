<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GRADIENTS } from '@/themes'
import type { CustomThemeVariants } from '@/themes'

const { t } = useI18n()

const props = defineProps<{ cfg: CustomThemeVariants }>()
const emit = defineEmits<{
  update: [cfg: CustomThemeVariants]
  back: []
  apply: []
}>()

type BgMode = 'solid' | 'gradient' | 'url' | 'phone'
type Variant = 'light' | 'dark'

const editingVariant = ref<Variant>('light')

const local = ref<CustomThemeVariants>({
  dark:  { ...props.cfg.dark },
  light: { ...props.cfg.light },
})

const cur = computed(() => local.value[editingVariant.value])

const p = computed(() => cur.value.primary)
const a = computed(() => cur.value.accent)
const bg = computed(() => cur.value.bg)

function bgModeFromCfg(bgImage: string | null): BgMode {
  if (!bgImage) return 'solid'
  if (bgImage.startsWith('url("data:')) return 'phone'
  if (bgImage.startsWith('url(')) return 'url'
  return 'gradient'
}

const bgMode = ref<BgMode>(bgModeFromCfg(cur.value.bgImage))

watch(editingVariant, (v) => {
  bgMode.value = bgModeFromCfg(local.value[v].bgImage)
})

const urlDraft = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length !== 6) return false
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

const textColor = computed(() => isLightColor(bg.value) ? '#1a1a1a' : '#f0f0f0')
const textMuted  = computed(() => isLightColor(bg.value) ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.42)')
const surface    = computed(() => isLightColor(bg.value) ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)')
const borderClr  = computed(() => isLightColor(bg.value) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)')
const segBg      = computed(() => isLightColor(bg.value) ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.25)')

const colorItems = computed(() => [
  { key: 'primary', label: t('customTheme.primaryLabel'), desc: t('customTheme.primaryDesc') },
  { key: 'accent',  label: t('customTheme.accentLabel'),  desc: t('customTheme.accentDesc') },
])

const bgTabs = computed(() => [
  ['solid',    t('customTheme.solid')],
  ['gradient', t('customTheme.gradient')],
  ['url',      t('customTheme.url')],
  ['phone',    t('customTheme.cameraRoll')],
] as [BgMode, string][])

function patch(partial: Partial<typeof cur.value>) {
  Object.assign(local.value[editingVariant.value], partial)
  emit('update', { dark: { ...local.value.dark }, light: { ...local.value.light } })
}

function setBgMode(mode: BgMode) {
  bgMode.value = mode
  if (mode === 'solid') patch({ bgImage: null })
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
  emit('update', { dark: { ...local.value.dark }, light: { ...local.value.light } })
  emit('apply')
}
</script>

<template>
  <div class="ct" :style="{ background: bg, color: textColor }">

    <!-- Header -->
    <div class="hdr" :style="{ background: bg, borderBottom: `1px solid ${borderClr}` }">
      <button class="back-btn" :style="{ color: a }" @click="emit('back')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ t('settings.back') }}
      </button>
      <span class="hdr-title">{{ t('customTheme.title') }}</span>
      <button class="apply-btn" :style="{ background: a, boxShadow: `0 2px 14px ${a}55` }" @click="onApply">
        {{ t('customTheme.apply') }}
      </button>
    </div>

    <div class="content">

      <!-- VARIANT TOGGLE -->
      <div class="section-label" :style="{ color: textMuted }">{{ t('customTheme.subtitle') }}</div>
      <div class="group" :style="{ background: surface, border: `1px solid ${borderClr}` }">
        <div class="row">
          <div class="seg" :style="{ background: segBg }">
            <button
              class="seg-btn"
              :style="{
                background: editingVariant === 'light' ? a : 'transparent',
                color: editingVariant === 'light' ? '#fff' : textMuted,
              }"
              @click="editingVariant = 'light'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              {{ t('settings.light') }}
            </button>
            <button
              class="seg-btn"
              :style="{
                background: editingVariant === 'dark' ? a : 'transparent',
                color: editingVariant === 'dark' ? '#fff' : textMuted,
              }"
              @click="editingVariant = 'dark'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              {{ t('settings.dark') }}
            </button>
          </div>
        </div>
      </div>

      <!-- PREVIEW -->
      <div class="section-label" :style="{ color: textMuted }">{{ t('customTheme.preview') }}</div>
      <div
        class="preview"
        :style="{
          border: `1px solid ${borderClr}`,
          background: cur.bgImage ? undefined : bg,
          backgroundImage: cur.bgImage ?? undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <div class="blob" :style="{ left:'15%', top:'25%', width:'110px', height:'110px', background: p + '55' }" />
        <div class="blob" :style="{ left:'60%', top:'8%',  width:'90px',  height:'90px',  background: a + '55' }" />
        <div class="blob" :style="{ left:'68%', top:'58%', width:'95px',  height:'95px',  background: p + '44' }" />
        <div class="vignette" />
        <div class="focus-sq" />
        <div class="preview-top">
          <span class="preview-title" :style="{ backgroundImage: `linear-gradient(135deg,${p},${a})` }">Photo Booth</span>
          <div class="preview-icons">
            <div class="preview-icon" /><div class="preview-icon" />
          </div>
        </div>
        <div class="preview-bottom">
          <div class="preview-shutter" :style="{ background: a, boxShadow: `0 0 18px ${a}66` }">
            <div class="preview-shutter-inner" />
          </div>
        </div>
      </div>

      <!-- COLORS -->
      <div class="section-label" :style="{ color: textMuted }">{{ t('customTheme.colors') }}</div>
      <div class="group" :style="{ background: surface, border: `1px solid ${borderClr}` }">
        <label
          v-for="(item, i) in colorItems"
          :key="item.key"
          class="row color-row"
          :style="{ borderBottom: i < colorItems.length - 1 ? `1px solid ${borderClr}` : 'none' }"
        >
          <span class="row-label">{{ item.label }}</span>
          <div class="color-right">
            <span class="color-hex" :style="{ color: textMuted }">{{ (cur as any)[item.key] }}</span>
            <div class="color-swatch" :style="{ background: (cur as any)[item.key], boxShadow: `0 2px 8px ${(cur as any)[item.key]}66` }" />
          </div>
          <input
            type="color"
            :value="(cur as any)[item.key]"
            class="hidden-color-input"
            @input="(e) => patch({ [item.key]: (e.target as HTMLInputElement).value } as any)"
          />
        </label>
      </div>

      <!-- BACKGROUND -->
      <div class="section-label" :style="{ color: textMuted }">{{ t('customTheme.bgImage') }}</div>
      <div class="group" :style="{ background: surface, border: `1px solid ${borderClr}` }">

        <!-- Type selector -->
        <div class="row" style="border-bottom: none">
          <div class="bg-seg" :style="{ background: segBg }">
            <button
              v-for="[mode, lbl] in bgTabs"
              :key="mode"
              class="bg-seg-btn"
              :style="{
                background: bgMode === mode ? a : 'transparent',
                color: bgMode === mode ? '#fff' : textMuted,
              }"
              @click="setBgMode(mode as BgMode)"
            >{{ lbl }}</button>
          </div>
        </div>

        <div class="divider" :style="{ background: borderClr }" />

        <!-- Solid -->
        <label v-if="bgMode === 'solid'" class="row color-row" style="border-bottom:none">
          <span class="row-label">{{ t('customTheme.bgSolidLabel') }}</span>
          <div class="color-right">
            <span class="color-hex" :style="{ color: textMuted }">{{ cur.bg }}</span>
            <div class="color-swatch" :style="{ background: cur.bg }" />
          </div>
          <input
            type="color"
            :value="cur.bg"
            class="hidden-color-input"
            @input="(e) => patch({ bg: (e.target as HTMLInputElement).value, bgImage: null })"
          />
        </label>

        <!-- Gradient -->
        <div v-else-if="bgMode === 'gradient'" class="grad-grid">
          <button
            v-for="grad in GRADIENTS"
            :key="grad.label"
            class="grad-cell"
            :style="{ outline: `2px solid ${cur.bgImage === grad.value ? a : 'transparent'}` }"
            @click="patch({ bgImage: grad.value })"
          >
            <div class="grad-preview" :style="{ background: grad.value ?? cur.bg, backgroundImage: grad.value ?? undefined }" />
            <div class="grad-label">{{ grad.label }}</div>
          </button>
        </div>

        <!-- URL -->
        <div v-else-if="bgMode === 'url'" class="url-section">
          <div class="url-hint" :style="{ color: textMuted }">{{ t('customTheme.pasteUrl') }}</div>
          <div class="url-row">
            <input
              v-model="urlDraft"
              placeholder="https://example.com/photo.jpg"
              class="url-input"
              :style="{ border: `1px solid ${borderClr}`, background: surface, color: textColor }"
              @keydown.enter="applyUrl"
            />
            <button class="url-load-btn" :style="{ background: a }" @click="applyUrl">
              {{ t('customTheme.load') }}
            </button>
          </div>
          <div v-if="cur.bgImage && cur.bgImage.startsWith('url(&quot;http')" class="url-loaded-row">
            <div class="url-thumb" :style="{ backgroundImage: cur.bgImage }" />
            <span class="url-loaded-text" :style="{ color: textMuted }">{{ t('customTheme.imageFromUrl') }}</span>
            <button class="remove-btn" @click="patch({ bgImage: null })">×</button>
          </div>
        </div>

        <!-- Camera Roll -->
        <div v-else-if="bgMode === 'phone'" class="phone-section">
          <input ref="fileInput" type="file" accept="image/*" class="hidden-file" @change="handleFile" />
          <div v-if="cur.bgImage?.startsWith('url(&quot;data:')" class="phone-loaded">
            <div class="phone-thumb" :style="{ backgroundImage: cur.bgImage }" />
            <div class="phone-actions">
              <button
                class="phone-change-btn"
                :style="{ border: `1px solid ${borderClr}`, color: textColor }"
                @click="fileInput?.click()"
              >{{ t('customTheme.changePhoto') }}</button>
              <button class="phone-remove-btn" @click="patch({ bgImage: null })">{{ t('customTheme.remove') }}</button>
            </div>
          </div>
          <div v-else class="phone-empty">
            <div class="phone-icon">📷</div>
            <div class="phone-title" :style="{ color: textColor }">{{ t('customTheme.chooseFromRoll') }}</div>
            <div class="phone-desc" :style="{ color: textMuted }">{{ t('customTheme.chooseFromRollDesc') }}</div>
            <button class="phone-browse-btn" :style="{ background: a, boxShadow: `0 4px 16px ${a}55` }" @click="fileInput?.click()">
              {{ t('customTheme.browsePhotos') }}
            </button>
          </div>
        </div>

      </div>

      <div style="height: 40px" />
    </div>
  </div>
</template>

<style scoped>
.ct {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── Header ── */
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.back-btn {
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
.back-btn svg { display: block; flex-shrink: 0; }
.hdr-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.apply-btn {
  padding: 8px 16px;
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  min-width: 64px;
  text-align: center;
  cursor: pointer;
}

/* ── Content ── */
.content { padding: 8px 16px 0; }

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  padding: 20px 4px 6px;
}

/* ── Group card ── */
.group {
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ── Row ── */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-height: 52px;
  gap: 12px;
}
.row-label {
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
}
.divider {
  height: 1px;
  margin: 0 16px;
}

/* ── Segmented control ── */
.seg {
  display: flex;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
  width: 100%;
}
.seg-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.seg-btn svg { display: block; flex-shrink: 0; }

/* ── Preview ── */
.preview {
  border-radius: 16px;
  overflow: hidden;
  height: 180px;
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
.preview-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45), transparent);
}
.preview-title {
  font-size: 13px;
  font-weight: 800;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.preview-icons { display: flex; gap: 4px; }
.preview-icon {
  width: 24px; height: 24px;
  border-radius: 7px;
  background: rgba(0,0,0,0.32);
  border: 1px solid rgba(255,255,255,0.14);
}
.preview-bottom {
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

/* ── Color rows ── */
.color-row { cursor: pointer; position: relative; }
.color-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-hex {
  font-size: 13px;
  font-family: monospace;
  letter-spacing: 0.3px;
}
.color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
}
.hidden-color-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

/* ── Background type segmented ── */
.bg-seg {
  display: flex;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
  width: 100%;
}
.bg-seg-btn {
  flex: 1;
  padding: 6px 4px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  text-align: center;
}

/* ── Gradient grid ── */
.grad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px 16px;
}
.grad-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  outline-offset: 2px;
}
.grad-preview {
  width: 100%;
  height: 100%;
  background-size: cover;
}
.grad-label {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 3px 4px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  text-align: center;
}

/* ── URL section ── */
.url-section { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.url-hint { font-size: 12px; }
.url-row { display: flex; gap: 8px; }
.url-input {
  flex: 1;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: monospace;
  font-size: 11px;
  outline: none;
}
.url-load-btn {
  padding: 0 14px;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  cursor: pointer;
}
.url-loaded-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.url-thumb {
  width: 36px; height: 36px;
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
.remove-btn {
  font-size: 20px;
  color: rgba(255, 80, 80, 0.7);
  padding: 0 4px;
  background: none;
  border: none;
  cursor: pointer;
}

/* ── Phone / Camera Roll ── */
.phone-section { padding: 14px 16px; }
.hidden-file { display: none; }
.phone-loaded { display: flex; flex-direction: column; gap: 10px; }
.phone-thumb {
  width: 100%;
  height: 110px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
}
.phone-actions { display: flex; gap: 8px; }
.phone-change-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
}
.phone-remove-btn {
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255, 60, 60, 0.12);
  border: 1px solid rgba(255, 80, 80, 0.25);
  color: rgba(255, 100, 100, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.phone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0 6px;
  text-align: center;
}
.phone-icon { font-size: 36px; line-height: 1; }
.phone-title { font-size: 14px; font-weight: 700; }
.phone-desc { font-size: 12px; max-width: 220px; }
.phone-browse-btn {
  padding: 11px 28px;
  border-radius: 22px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
</style>
