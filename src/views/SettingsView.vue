<script setup lang="ts">
import { computed } from 'vue'
import { PRESETS, resolveTheme } from '@/themes'
import type { CustomThemeCfg } from '@/themes'

const props = defineProps<{
  activeKey: string
  customCfg: CustomThemeCfg
  appTitle: string
  countdownDuration: number
  mirrorPreview: boolean
}>()

const emit = defineEmits<{
  back: []
  selectTheme: [key: string]
  editCustom: []
  updateTitle: [title: string]
  updateCountdown: [dur: number]
  updateMirror: [val: boolean]
}>()

const t = computed(() => resolveTheme(props.activeKey, props.customCfg))

const coreThemes = computed(() => Object.entries(PRESETS).filter(([, p]) => p.group === 'Core'))
const holidayThemes = computed(() => Object.entries(PRESETS).filter(([, p]) => p.group === 'Holidays'))
</script>

<template>
  <div class="settings" :style="{ background: t.bg, color: t.text, fontFamily: t.font }">
    <!-- Header -->
    <div class="header" :style="{ background: t.bg, borderBottom: `1px solid ${t.border}` }">
      <button class="back-btn" :style="{ color: t.primary }" @click="emit('back')">←</button>
      <span class="title">Settings</span>
    </div>

    <!-- App Title -->
    <div class="s-section">
      <div class="s-section-label" :style="{ color: t.primary }">App Title</div>
      <div class="s-card" :style="{ background: t.surface, backdropFilter: t.glassBlur, border: `1px solid ${t.border}` }">
        <div class="s-input-wrap">
          <input
            :value="appTitle"
            placeholder="Photo Booth"
            class="title-input"
            :style="{ color: t.text, fontFamily: t.font }"
            @input="emit('updateTitle', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <!-- Core Themes -->
    <div class="s-section">
      <div class="s-section-label" :style="{ color: t.primary }">Core Themes</div>
      <div class="theme-row">
        <div
          v-for="[k, p] in coreThemes"
          :key="k"
          class="theme-card"
          :style="{ border: `2px solid ${activeKey === k ? p.accent : 'rgba(255,255,255,0.08)'}` }"
          @click="emit('selectTheme', k)"
        >
          <div class="tc-preview" :style="{ background: p.cameraBg || p.bg }">
            <div class="tc-swatches">
              <div v-for="(c, i) in [p.bg, p.primary, p.accent]" :key="i" class="tc-swatch" :style="{ background: c }" />
            </div>
            <div class="tc-lens" :style="{ background: p.primary + '33', border: `1px solid ${p.primary}44` }">
              <div class="tc-lens-dot" :style="{ background: p.accent }" />
            </div>
          </div>
          <div class="tc-footer" :style="{ background: p.surfaceSolid || p.bg, borderTop: `1px solid ${p.border}` }">
            <div>{{ p.emoji }}</div>
            <div class="tc-label" :style="{ color: p.text }">{{ p.label }}</div>
          </div>
          <div v-if="activeKey === k" class="tc-check" :style="{ background: p.accent }">
            <svg width="7" height="5" viewBox="0 0 8 6"><polyline points="1,3 3,5 7,1" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Holiday Themes -->
    <div class="s-section">
      <div class="s-section-label" :style="{ color: t.primary }">Holiday Themes</div>
      <div class="theme-row">
        <div
          v-for="[k, p] in holidayThemes"
          :key="k"
          class="theme-card"
          :style="{ border: `2px solid ${activeKey === k ? p.accent : 'rgba(255,255,255,0.08)'}` }"
          @click="emit('selectTheme', k)"
        >
          <div class="tc-preview" :style="{ background: p.cameraBg || p.bg }">
            <div class="tc-swatches">
              <div v-for="(c, i) in [p.bg, p.primary, p.accent]" :key="i" class="tc-swatch" :style="{ background: c }" />
            </div>
            <div class="tc-lens" :style="{ background: p.primary + '33', border: `1px solid ${p.primary}44` }">
              <div class="tc-lens-dot" :style="{ background: p.accent }" />
            </div>
          </div>
          <div class="tc-footer" :style="{ background: p.surfaceSolid || p.bg, borderTop: `1px solid ${p.border}` }">
            <div>{{ p.emoji }}</div>
            <div class="tc-label" :style="{ color: p.text }">{{ p.label }}</div>
          </div>
          <div v-if="activeKey === k" class="tc-check" :style="{ background: p.accent }">
            <svg width="7" height="5" viewBox="0 0 8 6"><polyline points="1,3 3,5 7,1" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>

        <!-- Custom card -->
        <div
          class="theme-card"
          :style="{ border: `2px solid ${activeKey === 'custom' ? t.accent : 'rgba(255,255,255,0.1)'}` }"
          @click="emit('editCustom')"
        >
          <div
            class="tc-preview"
            :style="{
              background: customCfg.bgImage ? undefined : customCfg.bg,
              backgroundImage: customCfg.bgImage ?? undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }"
          >
            <div class="tc-pencil" :style="{ background: customCfg.primary + '55', border: `1.5px solid ${customCfg.accent}` }">✏️</div>
          </div>
          <div class="tc-footer" style="background:#1a1a2e;border-top:1px solid rgba(255,255,255,0.08)">
            <div class="tc-label" style="color:#ddd;font-size:8px">Custom</div>
            <div style="font-size:7px;color:rgba(255,255,255,0.4)">tap to edit</div>
          </div>
          <div v-if="activeKey === 'custom'" class="tc-check" :style="{ background: customCfg.accent }">
            <svg width="7" height="5" viewBox="0 0 8 6"><polyline points="1,3 3,5 7,1" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera -->
    <div class="s-section">
      <div class="s-section-label" :style="{ color: t.primary }">Camera</div>
      <div class="s-card" :style="{ background: t.surface, backdropFilter: t.glassBlur, border: `1px solid ${t.border}` }">
        <div class="s-row" style="border-bottom:none">
          <span class="s-row-label">Mirror selfie</span>
          <div
            class="toggle"
            :style="{ background: mirrorPreview ? t.accent : 'rgba(120,120,130,0.28)' }"
            @click="emit('updateMirror', !mirrorPreview)"
          >
            <div class="toggle-knob" :style="{ left: mirrorPreview ? '23px' : '3px' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Countdown -->
    <div class="s-section">
      <div class="s-section-label" :style="{ color: t.primary }">Countdown</div>
      <div class="s-card" :style="{ background: t.surface, backdropFilter: t.glassBlur, border: `1px solid ${t.border}` }">
        <div class="countdown-btns">
          <button
            v-for="s in [3, 5, 10]"
            :key="s"
            class="countdown-btn"
            :style="{
              border: `1.5px solid ${countdownDuration === s ? t.accent : t.border}`,
              background: countdownDuration === s ? t.accent + '22' : 'transparent',
              color: countdownDuration === s ? t.accent : t.textMuted,
              fontFamily: t.font,
            }"
            @click="emit('updateCountdown', s)"
          >{{ s }}s</button>
        </div>
      </div>
    </div>

    <div style="height:30px" />
  </div>
</template>

<style scoped>
.settings {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
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
.back-btn  { font-size: 22px; line-height: 1; }
.title     { font-weight: 700; font-size: 18px; letter-spacing: -0.3px; }

.s-section { margin: 16px 16px 0; }
.s-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  opacity: 0.75;
  padding: 0 2px 10px;
}
.s-card {
  border-radius: 14px;
  overflow: hidden;
}
.s-input-wrap { padding: 10px 16px; }
.title-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 600;
  padding: 2px 0;
}
.s-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 16px;
}
.s-row-label { font-size: 15px; }

.theme-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.theme-card {
  flex-shrink: 0;
  width: 76px;
  cursor: pointer;
  border-radius: 11px;
  overflow: hidden;
  transition: all 0.18s;
  position: relative;
}
.tc-preview {
  height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 4px;
  gap: 3px;
}
.tc-swatches { display: flex; gap: 3px; }
.tc-swatch   { flex: 1; height: 5px; border-radius: 3px; }
.tc-lens {
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tc-lens-dot { width: 7px; height: 7px; border-radius: 50%; }
.tc-footer {
  padding: 4px 3px;
  text-align: center;
}
.tc-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.2px;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tc-check {
  position: absolute;
  top: 3px; right: 3px;
  width: 13px; height: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tc-pencil {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.toggle {
  width: 48px; height: 28px;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-knob {
  position: absolute;
  top: 3px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  transition: left 0.2s;
}

.countdown-btns {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}
.countdown-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.18s;
}
</style>
