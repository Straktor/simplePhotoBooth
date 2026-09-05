<script setup lang="ts">
withDefaults(defineProps<{
  size?: number | string
}>(), {
  size: 32,
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 350 350"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="display: inline-block; flex-shrink: 0;"
  >
    <defs>
      <radialGradient id="gp_grad_green" cx="173.161" cy="178.716" fx="239.836" fy="36.176" r="170.886" gradientTransform="matrix(1 0 0 1.041 0 -7.272)" gradientUnits="userSpaceOnUse">
        <stop offset=".469" stop-color="#7acaff"/>
        <stop offset=".828" stop-color="#00b054"/>
      </radialGradient>
      <radialGradient id="gp_grad_yellow" cx="173.161" cy="178.716" fx="239.836" fy="36.176" r="170.886" gradientTransform="matrix(0 1 -1.041 0 357.272 0)" gradientUnits="userSpaceOnUse">
        <stop offset=".545" stop-color="#fded1c"/>
        <stop offset=".828" stop-color="#feca01"/>
      </radialGradient>
      <radialGradient id="gp_grad_red" cx="173.161" cy="178.716" fx="239.836" fy="36.176" r="170.886" gradientTransform="matrix(-1 0 0 -1.041 350 357.272)" gradientUnits="userSpaceOnUse">
        <stop offset=".469" stop-color="#ff81d0"/>
        <stop offset=".828" stop-color="#ff4041"/>
      </radialGradient>
      <radialGradient id="gp_grad_blue" cx="173.161" cy="178.716" fx="239.836" fy="36.176" r="170.886" gradientTransform="matrix(0 -1 1.041 0 -7.272 350)" gradientUnits="userSpaceOnUse">
        <stop offset=".469" stop-color="#aaa7ff"/>
        <stop offset=".828" stop-color="#2f89ff"/>
      </radialGradient>
    </defs>
    <!-- Bottom-left (Green) -->
    <path d="M79.6 262.5c0-48.3 39.2-87.5 87.5-87.5h7.9v167.1c0 4.4-3.6 7.9-7.9 7.9-48.3 0-87.5-39.2-87.5-87.5z" fill="url(#gp_grad_green)"/>
    <!-- Top-left (Yellow) -->
    <path d="M87.5 79.6c48.3 0 87.5 39.2 87.5 87.5v7.9H7.9c-4.4 0-7.9-3.6-7.9-7.9 0-48.3 39.2-87.5 87.5-87.5z" fill="url(#gp_grad_yellow)"/>
    <!-- Top-right (Red) -->
    <path d="M270.4 87.5c0 48.3-39.2 87.5-87.5 87.5H175V7.9c0-4.4 3.6-7.9 7.9-7.9 48.3 0 87.5 39.2 87.5 87.5z" fill="url(#gp_grad_red)"/>
    <!-- Bottom-right (Blue) -->
    <path d="M262.5 270.4c-48.3 0-87.5-39.2-87.5-87.5V175h167.1c4.4 0 7.9 3.6 7.9 7.9 0 48.3-39.2 87.5-87.5 87.5z" fill="url(#gp_grad_blue)"/>
  </svg>
</template>
