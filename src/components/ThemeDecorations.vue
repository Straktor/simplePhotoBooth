<script setup lang="ts">
import { computed } from 'vue'
import { THEME_DECOS } from '@/themes'
import type { DecoDef } from '@/themes'

const props = defineProps<{ themeKey: string }>()

const decos = computed<DecoDef[]>(() => THEME_DECOS[props.themeKey] ?? [])
</script>

<template>
  <div class="decos">
    <div
      v-for="(d, i) in decos"
      :key="i"
      class="deco-item"
      :style="{
        left: d.x + '%',
        top: d.y + '%',
        animation: d.anim,
        animationDelay: d.delay ?? '0s',
        opacity: d.opacity ?? 1,
        transform: d.rotate ? `rotate(${d.rotate}deg)` : undefined,
      }"
    >
      <!-- balloon -->
      <svg v-if="d.type === 'balloon'" :width="d.size" :height="d.size * 1.55" viewBox="0 0 30 46" fill="none">
        <ellipse cx="15" cy="14" rx="12" ry="13.5" :fill="d.color"/>
        <ellipse cx="10" cy="9" rx="4.5" ry="5.5" :fill="d.extra?.highlightColor ?? 'rgba(255,255,255,0.28)'"/>
        <path d="M15 27 L12 33 L18 33 Z" :fill="d.color"/>
        <path d="M15 33 Q10 39 15 45" :stroke="d.color" stroke-width="1.3" stroke-linecap="round"/>
      </svg>

      <!-- snowflake -->
      <svg v-else-if="d.type === 'snowflake'" :width="d.size" :height="d.size" viewBox="0 0 30 30">
        <template v-for="a in [0, 60, 120]" :key="a">
          <line :x1="15" :y1="15" :x2="15 + 11 * Math.cos(a * Math.PI / 180)" :y2="15 + 11 * Math.sin(a * Math.PI / 180)" :stroke="d.color" stroke-width="2" stroke-linecap="round"/>
          <line :x1="15" :y1="15" :x2="15 - 11 * Math.cos(a * Math.PI / 180)" :y2="15 - 11 * Math.sin(a * Math.PI / 180)" :stroke="d.color" stroke-width="2" stroke-linecap="round"/>
          <line
            :x1="(15 + 15 + 11 * Math.cos(a * Math.PI / 180)) / 2 - 0.5"
            :y1="(15 + 15 + 11 * Math.sin(a * Math.PI / 180)) / 2 - 0.5"
            :x2="(15 + 15 + 11 * Math.cos(a * Math.PI / 180)) / 2 + 3 * Math.cos((a + 90) * Math.PI / 180)"
            :y2="(15 + 15 + 11 * Math.sin(a * Math.PI / 180)) / 2 + 3 * Math.sin((a + 90) * Math.PI / 180)"
            :stroke="d.color" stroke-width="1.3" stroke-linecap="round"
          />
          <line
            :x1="(15 + 15 + 11 * Math.cos(a * Math.PI / 180)) / 2 - 0.5"
            :y1="(15 + 15 + 11 * Math.sin(a * Math.PI / 180)) / 2 - 0.5"
            :x2="(15 + 15 + 11 * Math.cos(a * Math.PI / 180)) / 2 - 3 * Math.cos((a + 90) * Math.PI / 180)"
            :y2="(15 + 15 + 11 * Math.sin(a * Math.PI / 180)) / 2 - 3 * Math.sin((a + 90) * Math.PI / 180)"
            :stroke="d.color" stroke-width="1.3" stroke-linecap="round"
          />
        </template>
        <circle cx="15" cy="15" r="2.5" :fill="d.color"/>
      </svg>

      <!-- heart -->
      <svg v-else-if="d.type === 'heart'" :width="d.size" :height="d.size * 0.95" viewBox="0 0 30 28">
        <path d="M15 25 C15 25 2 16 2 9 C2 5.1 5.1 2 9 2 C11.2 2 13.2 3 15 5 C16.8 3 18.8 2 21 2 C24.9 2 28 5.1 28 9 C28 16 15 25 15 25Z" :fill="d.color"/>
        <ellipse cx="9.5" cy="9" rx="3" ry="4" fill="rgba(255,255,255,0.22)" transform="rotate(-20 9.5 9)"/>
      </svg>

      <!-- bat -->
      <svg v-else-if="d.type === 'bat'" :width="d.size * 1.9" :height="d.size" viewBox="0 0 56 28">
        <path d="M28 14 C22 9 11 4 1 7 C5 10 8 14 8 14 C5 14 2 16 0 21 C5 19 9 18 13 19 C15 21 19 23 28 23 C37 23 41 21 43 19 C47 18 51 19 56 21 C54 16 51 14 48 14 C48 14 51 10 55 7 C45 4 34 9 28 14Z" :fill="d.color"/>
        <circle cx="28" cy="14" r="3.5" :fill="d.color"/>
        <circle cx="24.5" cy="12" r="1.2" fill="rgba(255,80,80,0.8)"/>
        <circle cx="31.5" cy="12" r="1.2" fill="rgba(255,80,80,0.8)"/>
      </svg>

      <!-- star -->
      <svg v-else-if="d.type === 'star'" :width="d.size" :height="d.size" viewBox="0 0 30 30">
        <polygon points="15,2 18.5,11.5 28.5,11.5 20.5,17.5 23.5,27 15,21.5 6.5,27 9.5,17.5 1.5,11.5 11.5,11.5" :fill="d.color"/>
      </svg>

      <!-- shamrock -->
      <svg v-else-if="d.type === 'shamrock'" :width="d.size" :height="d.size * 1.25" viewBox="0 0 30 38">
        <circle cx="11" cy="13" r="8" :fill="d.color"/>
        <circle cx="19" cy="13" r="8" :fill="d.color"/>
        <circle cx="15" cy="6"  r="8" :fill="d.color"/>
        <rect   x="14" y="21"  width="2.5" height="13" rx="1" :fill="d.color"/>
        <ellipse cx="12" cy="34" rx="5" ry="2" :fill="d.color"/>
      </svg>

      <!-- egg -->
      <svg v-else-if="d.type === 'egg'" :width="d.size * 0.72" :height="d.size" viewBox="0 0 22 30">
        <ellipse cx="11" cy="17" rx="9" ry="12" :fill="d.color"/>
        <path d="M2.5 16 Q11 9 19.5 16" :fill="d.extra?.stripe ?? 'rgba(255,255,255,0.3)'"/>
        <line x1="2" y1="13" x2="20" y2="13" stroke="rgba(255,255,255,0.4)" stroke-width="1.8"/>
      </svg>

      <!-- firework -->
      <svg v-else-if="d.type === 'firework'" :width="d.size" :height="d.size" viewBox="0 0 30 30">
        <template v-for="(a, ai) in [0, 45, 90, 135, 180, 225, 270, 315]" :key="a">
          <line x1="15" y1="15" :x2="15 + (10 + (ai % 3) * 2) * Math.cos(a * Math.PI / 180)" :y2="15 + (10 + (ai % 3) * 2) * Math.sin(a * Math.PI / 180)" :stroke="d.color" stroke-width="1.8" stroke-linecap="round"/>
        </template>
        <circle cx="15" cy="15" r="3" :fill="d.color"/>
      </svg>

      <!-- pumpkin -->
      <svg v-else-if="d.type === 'pumpkin'" :width="d.size" :height="d.size" viewBox="0 0 32 30">
        <ellipse cx="16" cy="19" rx="6.5" ry="8" :fill="d.color"/>
        <ellipse cx="8"  cy="19" rx="5.5" ry="7.5" :fill="d.color"/>
        <ellipse cx="24" cy="19" rx="5.5" ry="7.5" :fill="d.color"/>
        <rect x="14.5" y="10" width="3" height="5" rx="1" fill="#2ecc71"/>
        <path d="M11 20 L12.5 23.5 L16 20" fill="rgba(0,0,0,0.55)"/>
        <path d="M21 20 L19.5 23.5 L16 20" fill="rgba(0,0,0,0.55)"/>
        <path d="M10.5 24.5 Q16 28 21.5 24.5" stroke="rgba(0,0,0,0.55)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>

      <!-- ornament -->
      <svg v-else-if="d.type === 'ornament'" :width="d.size" :height="d.size * 1.22" viewBox="0 0 24 29">
        <rect x="10.5" y="0" width="3" height="5" rx="1.5" :fill="d.extra?.capColor ?? 'rgba(255,255,255,0.5)'"/>
        <circle cx="12" cy="18" r="10" :fill="d.color"/>
        <ellipse cx="8" cy="13" rx="3.5" ry="5.5" fill="rgba(255,255,255,0.22)" transform="rotate(-30 8 13)"/>
      </svg>

      <!-- confetti -->
      <svg v-else-if="d.type === 'confetti'" :width="d.size" :height="d.size * 0.6" viewBox="0 0 12 7">
        <rect x="0" y="0" width="12" height="7" rx="2" :fill="d.color"/>
      </svg>

      <!-- particle / film / default -->
      <svg v-else-if="d.type === 'particle'" :width="d.size" :height="d.size" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4.5" :fill="d.color"/>
      </svg>

      <svg v-else-if="d.type === 'film'" :width="d.size" :height="d.size" viewBox="0 0 22 22">
        <rect x="0" y="0" width="22" height="22" rx="3" fill="rgba(0,0,0,0.45)" :stroke="d.color" stroke-width="1.5"/>
        <rect x="4" y="4" width="14" height="14" rx="2" :fill="d.color" opacity="0.18"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.decos {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.deco-item {
  position: absolute;
  pointer-events: none;
}
</style>
