<script setup lang="ts">
defineProps<{ themeKey: string; primary: string; accent: string; size?: number }>()
</script>

<template>
  <!-- neon: sparkle star -->
  <svg v-if="themeKey === 'neon'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" :stroke="primary" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="2.5" :fill="accent" stroke="none"/>
  </svg>

  <!-- retro: film strip -->
  <svg v-else-if="themeKey === 'retro'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 24 24" fill="none" :stroke="primary" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.5"/>
    <rect x="7" y="7" width="10" height="10" rx="1.5" :stroke="accent"/>
    <line x1="2" y1="8"  x2="4.5" y2="8"/>
    <line x1="2" y1="12" x2="4.5" y2="12"/>
    <line x1="2" y1="16" x2="4.5" y2="16"/>
    <line x1="19.5" y1="8"  x2="22" y2="8"/>
    <line x1="19.5" y1="12" x2="22" y2="12"/>
    <line x1="19.5" y1="16" x2="22" y2="16"/>
  </svg>

  <!-- light: sun -->
  <svg v-else-if="themeKey === 'light'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 24 24" fill="none" :stroke="primary" stroke-width="1.5" stroke-linecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2"   x2="12" y2="5"/>
    <line x1="12" y1="19"  x2="12" y2="22"/>
    <line x1="2"  y1="12"  x2="5"  y2="12"/>
    <line x1="19" y1="12"  x2="22" y2="12"/>
    <line x1="4.93" y1="4.93"  x2="7.05" y2="7.05"/>
    <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
    <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/>
    <line x1="16.95" y1="7.05"  x2="19.07" y2="4.93"/>
    <circle cx="12" cy="12" r="1.5" :fill="accent" stroke="none"/>
  </svg>

  <!-- halloween: pumpkin -->
  <svg v-else-if="themeKey === 'halloween'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 32 30" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="16" cy="19" rx="6.5" ry="8" :fill="primary" opacity="0.25" :stroke="primary" stroke-width="1.5"/>
    <ellipse cx="8"  cy="19" rx="5.5" ry="7.5" :fill="primary" opacity="0.18" :stroke="primary" stroke-width="1.5"/>
    <ellipse cx="24" cy="19" rx="5.5" ry="7.5" :fill="primary" opacity="0.18" :stroke="primary" stroke-width="1.5"/>
    <rect x="14.5" y="10" width="3" height="5" rx="1.5" fill="#2ecc71" stroke="none"/>
    <path d="M11 20 L12.5 23.5 L16 20" :fill="accent" stroke="none"/>
    <path d="M21 20 L19.5 23.5 L16 20" :fill="accent" stroke="none"/>
    <path d="M10.5 24.5 Q16 28 21.5 24.5" :stroke="accent" stroke-width="1.5" fill="none"/>
  </svg>

  <!-- christmas: snowflake -->
  <svg v-else-if="themeKey === 'christmas'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 30 30" fill="none" stroke-linecap="round">
    <template v-for="a in [0, 60, 120]" :key="a">
      <line :x1="15" :y1="15" :x2="15 + 12 * Math.cos(a * Math.PI / 180)" :y2="15 + 12 * Math.sin(a * Math.PI / 180)" :stroke="primary" stroke-width="1.8"/>
      <line :x1="15" :y1="15" :x2="15 - 12 * Math.cos(a * Math.PI / 180)" :y2="15 - 12 * Math.sin(a * Math.PI / 180)" :stroke="primary" stroke-width="1.8"/>
      <line
        :x1="(15 + 15 + 12 * Math.cos(a * Math.PI / 180)) / 2"
        :y1="(15 + 15 + 12 * Math.sin(a * Math.PI / 180)) / 2"
        :x2="(15 + 15 + 12 * Math.cos(a * Math.PI / 180)) / 2 + 3.5 * Math.cos((a + 90) * Math.PI / 180)"
        :y2="(15 + 15 + 12 * Math.sin(a * Math.PI / 180)) / 2 + 3.5 * Math.sin((a + 90) * Math.PI / 180)"
        :stroke="accent" stroke-width="1.3"
      />
      <line
        :x1="(15 + 15 + 12 * Math.cos(a * Math.PI / 180)) / 2"
        :y1="(15 + 15 + 12 * Math.sin(a * Math.PI / 180)) / 2"
        :x2="(15 + 15 + 12 * Math.cos(a * Math.PI / 180)) / 2 - 3.5 * Math.cos((a + 90) * Math.PI / 180)"
        :y2="(15 + 15 + 12 * Math.sin(a * Math.PI / 180)) / 2 - 3.5 * Math.sin((a + 90) * Math.PI / 180)"
        :stroke="accent" stroke-width="1.3"
      />
    </template>
    <circle cx="15" cy="15" r="2.8" :fill="accent" stroke="none"/>
  </svg>

  <!-- valentine: heart -->
  <svg v-else-if="themeKey === 'valentine'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 30 28" fill="none">
    <path d="M15 25 C15 25 2 16 2 9 C2 5.1 5.1 2 9 2 C11.2 2 13.2 3 15 5 C16.8 3 18.8 2 21 2 C24.9 2 28 5.1 28 9 C28 16 15 25 15 25Z" :fill="primary" opacity="0.3" :stroke="primary" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="9.5" cy="9" rx="3" ry="4" :fill="accent" opacity="0.4" stroke="none" transform="rotate(-20 9.5 9)"/>
  </svg>

  <!-- newyear: firework -->
  <svg v-else-if="themeKey === 'newyear'" :width="size ?? 26" :height="size ?? 26" viewBox="0 0 30 30" fill="none" stroke-linecap="round">
    <template v-for="(a, i) in [0, 45, 90, 135, 180, 225, 270, 315]" :key="a">
      <line x1="15" y1="15" :x2="15 + (10 + (i % 3) * 2) * Math.cos(a * Math.PI / 180)" :y2="15 + (10 + (i % 3) * 2) * Math.sin(a * Math.PI / 180)" :stroke="i % 2 === 0 ? primary : accent" stroke-width="1.8"/>
    </template>
    <circle cx="15" cy="15" r="3" :fill="primary" stroke="none"/>
  </svg>

  <!-- easter: egg -->
  <svg v-else-if="themeKey === 'easter'" :width="size ?? 26" :height="(size ?? 26) * 30/22" viewBox="0 0 22 30" fill="none">
    <ellipse cx="11" cy="17" rx="9" ry="12" :fill="primary" opacity="0.25" :stroke="primary" stroke-width="1.5"/>
    <path d="M2.5 16 Q11 9 19.5 16" :fill="accent" opacity="0.5" stroke="none"/>
    <line x1="2" y1="13" x2="20" y2="13" :stroke="accent" stroke-width="1.5" stroke-linecap="round"/>
  </svg>

  <!-- stpatrick: shamrock -->
  <svg v-else-if="themeKey === 'stpatrick'" :width="size ?? 26" :height="(size ?? 26) * 38/30" viewBox="0 0 30 38" fill="none">
    <circle cx="11" cy="13" r="8" :fill="primary" opacity="0.3" :stroke="primary" stroke-width="1.5"/>
    <circle cx="19" cy="13" r="8" :fill="primary" opacity="0.3" :stroke="primary" stroke-width="1.5"/>
    <circle cx="15" cy="6"  r="8" :fill="accent"  opacity="0.35" :stroke="accent"  stroke-width="1.5"/>
    <rect x="14" y="21" width="2.5" height="13" rx="1.25" :fill="primary" stroke="none"/>
    <ellipse cx="12" cy="34" rx="5" ry="2" :fill="primary" opacity="0.4" stroke="none"/>
  </svg>

  <!-- birthday: balloon -->
  <svg v-else-if="themeKey === 'birthday'" :width="(size ?? 26) * 30/46" :height="size ?? 26" viewBox="0 0 30 46" fill="none">
    <ellipse cx="15" cy="14" rx="12" ry="13.5" :fill="primary" opacity="0.3" :stroke="primary" stroke-width="1.5"/>
    <ellipse cx="10" cy="9" rx="4.5" ry="5.5" :fill="accent" opacity="0.35" stroke="none"/>
    <path d="M15 27 L12 33 L18 33 Z" :fill="primary" stroke="none"/>
    <path d="M15 33 Q10 39 15 45" :stroke="primary" stroke-width="1.3" stroke-linecap="round" fill="none"/>
  </svg>

  <!-- custom: pencil/edit -->
  <svg v-else :width="size ?? 26" :height="size ?? 26" viewBox="0 0 24 24" fill="none" :stroke="primary" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" :stroke="accent"/>
  </svg>
</template>
