<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PRESETS, FONTS, resolveTheme } from '@/themes'
import type { CustomThemeCfg } from '@/themes'
import ThemeIcon from '@/components/ThemeIcon.vue'

const { t } = useI18n()

const props = defineProps<{
  activeKey: string
  customCfg: CustomThemeCfg
  appTitle: string
  countdownDuration: number
  mirrorPreview: boolean
  darkMode: boolean
  fontFamily: string
  language: string
}>()

const emit = defineEmits<{
  back: []
  selectTheme: [key: string]
  editCustom: []
  updateTitle: [title: string]
  updateCountdown: [dur: number]
  updateMirror: [val: boolean]
  updateDarkMode: [val: boolean]
  updateFont: [key: string]
  updateLanguage: [lang: string]
  reset: []
}>()

const fontCss = computed(() => FONTS.find(f => f.key === props.fontFamily)?.css)
const t2 = computed(() => resolveTheme(props.activeKey, props.customCfg, props.darkMode, fontCss.value))
const mode = computed<'dark' | 'light'>(() => props.darkMode ? 'dark' : 'light')
const allThemes = computed(() => Object.entries(PRESETS))

const LANGUAGES = [
  { key: 'en', label: 'EN', name: 'English' },
  { key: 'fr', label: 'FR', name: 'Français' },
]
</script>

<template>
  <div class="settings" :style="{ background: t2.bg, color: t2.text, fontFamily: t2.font }">

    <!-- Header -->
    <div class="hdr" :style="{ background: t2.bg, borderBottom: `1px solid ${t2.border}` }">
      <button class="back-btn" :style="{ color: t2.accent }" @click="emit('back')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ t('settings.back') }}
      </button>
      <span class="hdr-title">{{ t('settings.title') }}</span>
      <div style="width:64px" />
    </div>

    <div class="content">

      <!-- APPEARANCE -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.appearance') }}</div>
      <div class="group" :style="{ background: t2.surface, border: `1px solid ${t2.border}` }">
        <!-- Mode -->
        <div class="row">
          <span class="row-label">{{ t('settings.mode') }}</span>
          <div class="seg" :style="{ background: props.darkMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)' }">
            <button
              class="seg-btn"
              :style="{
                background: !darkMode ? t2.accent : 'transparent',
                color: !darkMode ? '#fff' : t2.textMuted,
              }"
              @click="emit('updateDarkMode', false)"
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
                background: darkMode ? t2.accent : 'transparent',
                color: darkMode ? '#fff' : t2.textMuted,
              }"
              @click="emit('updateDarkMode', true)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              {{ t('settings.dark') }}
            </button>
          </div>
        </div>

        <div class="divider" :style="{ background: t2.border }" />

        <!-- Font -->
        <div class="row">
          <span class="row-label">{{ t('settings.font') }}</span>
          <div class="seg font-seg" :style="{ background: props.darkMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)' }">
            <button
              v-for="f in FONTS"
              :key="f.key"
              class="seg-btn font-seg-btn"
              :style="{
                background: fontFamily === f.key ? t2.accent : 'transparent',
                color: fontFamily === f.key ? '#fff' : t2.textMuted,
                fontFamily: f.css,
              }"
              @click="emit('updateFont', f.key)"
            >{{ f.label }}</button>
          </div>
        </div>
      </div>

      <!-- APP -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.app') }}</div>
      <div class="group" :style="{ background: t2.surface, border: `1px solid ${t2.border}` }">
        <div class="row">
          <span class="row-label">{{ t('settings.appTitle') }}</span>
          <input
            :value="appTitle"
            :placeholder="t('settings.appTitlePlaceholder')"
            class="inline-input"
            :style="{ color: t2.text, fontFamily: t2.font }"
            @input="emit('updateTitle', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- THEME -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.theme') }}</div>
      <div class="theme-scroll">
        <div
          v-for="[k, p] in allThemes"
          :key="k"
          class="theme-card"
          :style="{
            border: `2px solid ${activeKey === k ? p[mode].accent : t2.border}`,
            background: activeKey === k ? p[mode].accent + '12' : t2.surface,
          }"
          @click="emit('selectTheme', k)"
        >
          <div class="tc-top" :style="{ background: p[mode].cameraBg || p[mode].bg }">
            <ThemeIcon :theme-key="k" :primary="p[mode].primary" :accent="p[mode].accent" :size="26" />
          </div>
          <div class="tc-bottom" :style="{ borderTop: `1px solid ${p[mode].border}` }">
            <div class="tc-dots">
              <div class="tc-dot" :style="{ background: p[mode].primary }" />
              <div class="tc-dot" :style="{ background: p[mode].accent }" />
            </div>
            <div class="tc-name" :style="{ color: activeKey === k ? p[mode].accent : p[mode].text }">{{ p[mode].label }}</div>
          </div>
          <div v-if="activeKey === k" class="tc-check" :style="{ background: p[mode].accent }">
            <svg width="7" height="5" viewBox="0 0 8 6"><polyline points="1,3 3,5 7,1" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>

        <!-- Custom card -->
        <div
          class="theme-card"
          :style="{
            border: `2px solid ${activeKey === 'custom' ? customCfg.accent : t2.border}`,
            background: activeKey === 'custom' ? customCfg.accent + '12' : t2.surface,
          }"
          @click="emit('editCustom')"
        >
          <div
            class="tc-top"
            :style="{
              background: customCfg.bgImage ? undefined : customCfg.bg,
              backgroundImage: customCfg.bgImage ?? undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
          >
            <div class="tc-custom-icon" :style="{ background: customCfg.primary + '44', border: `1.5px solid ${customCfg.accent}` }">
              <ThemeIcon theme-key="custom" :primary="customCfg.primary" :accent="customCfg.accent" :size="16" />
            </div>
          </div>
          <div class="tc-bottom" :style="{ borderTop: `1px solid rgba(255,255,255,0.08)`, background: '#1a1a2e' }">
            <div class="tc-name" style="color:#ccc">{{ t('settings.themeCustom') }}</div>
            <div class="tc-edit-hint">{{ t('settings.themeEdit') }}</div>
          </div>
          <div v-if="activeKey === 'custom'" class="tc-check" :style="{ background: customCfg.accent }">
            <svg width="7" height="5" viewBox="0 0 8 6"><polyline points="1,3 3,5 7,1" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>

      <!-- CAMERA -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.camera') }}</div>
      <div class="group" :style="{ background: t2.surface, border: `1px solid ${t2.border}` }">
        <div class="row">
          <span class="row-label">{{ t('settings.mirrorSelfie') }}</span>
          <div
            class="toggle"
            :style="{ background: mirrorPreview ? t2.accent : (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)') }"
            @click="emit('updateMirror', !mirrorPreview)"
          >
            <div class="toggle-knob" :style="{ transform: mirrorPreview ? 'translateX(20px)' : 'translateX(0)' }" />
          </div>
        </div>
      </div>

      <!-- COUNTDOWN -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.countdown') }}</div>
      <div class="group" :style="{ background: t2.surface, border: `1px solid ${t2.border}` }">
        <div class="row">
          <span class="row-label">{{ t('settings.duration') }}</span>
          <div class="seg" :style="{ background: props.darkMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)' }">
            <button
              v-for="s in [3, 5, 10]"
              :key="s"
              class="seg-btn"
              :style="{
                background: countdownDuration === s ? t2.accent : 'transparent',
                color: countdownDuration === s ? '#fff' : t2.textMuted,
              }"
              @click="emit('updateCountdown', s)"
            >{{ s }}s</button>
          </div>
        </div>
      </div>

      <!-- LANGUAGE -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.language') }}</div>
      <div class="group" :style="{ background: t2.surface, border: `1px solid ${t2.border}` }">
        <div class="row">
          <div class="lang-options">
            <button
              v-for="lang in LANGUAGES"
              :key="lang.key"
              class="lang-btn"
              :style="{
                border: `1.5px solid ${language === lang.key ? t2.accent : t2.border}`,
                background: language === lang.key ? t2.accent + '18' : 'transparent',
                color: language === lang.key ? t2.accent : t2.text,
              }"
              @click="emit('updateLanguage', lang.key)"
            >
              <span class="lang-code">{{ lang.label }}</span>
              <span class="lang-name" :style="{ color: language === lang.key ? t2.accent : t2.textMuted }">{{ lang.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- RESET -->
      <div class="section-label" :style="{ color: t2.textMuted }">{{ t('settings.dangerZone') }}</div>
      <div class="group" :style="{ background: t2.surface, border: `1px solid ${t2.border}` }">
        <button
          class="reset-row"
          :style="{ color: '#e05555', fontFamily: t2.font }"
          @click="emit('reset')"
        >
          {{ t('settings.resetDefaults') }}
        </button>
      </div>

      <div style="height: 40px" />
    </div>
  </div>
</template>

<style scoped>
.settings {
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
  width: 64px;
}
.back-btn svg {
  display: block;
  flex-shrink: 0;
}
.hdr-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

/* ── Content ── */
.content {
  padding: 8px 16px 0;
}

/* ── Section label ── */
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

/* ── Inline title input ── */
.inline-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 400;
  text-align: right;
  min-width: 0;
}
.inline-input::placeholder {
  opacity: 0.3;
}

/* ── Segmented control ── */
.seg {
  display: flex;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
}
.seg-btn {
  display: flex;
  align-items: center;
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
.font-seg {
  gap: 2px;
}
.font-seg-btn {
  padding: 6px 10px;
  font-size: 13px;
}

/* ── Toggle ── */
.toggle {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  position: relative;
}
.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Language ── */
.lang-options {
  display: flex;
  gap: 10px;
  width: 100%;
}
.lang-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
}
.lang-code {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.lang-name {
  font-size: 11px;
  font-weight: 500;
}

/* ── Reset row ── */
.reset-row {
  width: 100%;
  padding: 15px 16px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.reset-row:active { opacity: 0.5; }

/* ── Theme scroll ── */
.theme-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.theme-scroll::-webkit-scrollbar { display: none; }

/* ── Theme card ── */
.theme-card {
  flex-shrink: 0;
  width: 78px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
  scroll-snap-align: start;
  position: relative;
}
.theme-card:active { transform: scale(0.95); }
.tc-top {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tc-bottom {
  padding: 6px 6px 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.tc-dots {
  display: flex;
  gap: 4px;
}
.tc-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.tc-name {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: color 0.15s;
}
.tc-edit-hint {
  font-size: 7px;
  opacity: 0.4;
  color: #ddd;
}
.tc-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tc-custom-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
