<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettings } from '@/composables/useSettings'
import { resolveTheme, FONTS } from '@/themes'
import type { CustomThemeVariants } from '@/themes'
import ThemeDecorations from '@/components/ThemeDecorations.vue'
import SettingsView from '@/views/SettingsView.vue'
import CustomThemeView from '@/views/CustomThemeView.vue'
import GalleryView from '@/views/GalleryView.vue'
import GooglePhotosView from '@/views/GooglePhotosView.vue'

type Screen = 'home' | 'settings' | 'customTheme' | 'gallery' | 'googlePhotos'

const { t } = useI18n()
const { settings, update, updateCustomTheme, removePhotos, reset } = useSettings()

const screen = ref<Screen>('home')
const devices = ref<MediaDeviceInfo[]>([])
const selectedDeviceId = ref('')

const activeKey = computed(() => settings.activeThemeKey)
const customCfg = computed(() => settings.customThemeCfg)
const fontCss = computed(() => FONTS.find(f => f.key === settings.fontFamily)?.css)
const theme = computed(() => resolveTheme(activeKey.value, customCfg.value, settings.darkMode, fontCss.value))

const bgImage = computed(() => {
  if (activeKey.value !== 'custom') return null
  const variant = settings.darkMode ? customCfg.value.dark : customCfg.value.light
  return variant.bgImage ?? null
})

const iconBtnStyle = computed(() => theme.value.darkFrame
  ? { background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)' }
  : { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.75)' }
)

const secondaryBtnStyle = computed(() => theme.value.darkFrame
  ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.92)' }
  : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.85)' }
)

async function enumerateDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) return
  try {
    const all = await navigator.mediaDevices.enumerateDevices()
    devices.value = all.filter(d => d.kind === 'videoinput')
  } catch (err) {
    console.error('Error enumerating devices:', err)
  }
}

onMounted(() => {
  enumerateDevices()
})

function handleSelectTheme(key: string) {
  update({ activeThemeKey: key })
}

function handleUpdateCustom(cfg: CustomThemeVariants) {
  updateCustomTheme(cfg)
}

function handleApplyCustom() {
  update({ activeThemeKey: 'custom' })
  screen.value = 'home'
}
</script>

<template>
  <!-- Sub-screens -->
  <SettingsView
    v-if="screen === 'settings'"
    :active-key="activeKey"
    :custom-cfg="customCfg"
    :app-title="settings.appTitle"
    :countdown-duration="settings.countdownDuration"
    :mirror-preview="settings.mirrorPreview"
    :dark-mode="settings.darkMode"
    :font-family="settings.fontFamily"
    :language="settings.language"
    :devices="devices"
    :selected-device-id="selectedDeviceId"
    @back="screen = 'home'"
    @select-theme="handleSelectTheme"
    @edit-custom="screen = 'customTheme'"
    @open-google-photos="screen = 'googlePhotos'"
    @update-title="(v) => update({ appTitle: v })"
    @update-countdown="(v) => update({ countdownDuration: v })"
    @update-mirror="(v) => update({ mirrorPreview: v })"
    @update-dark-mode="(v) => update({ darkMode: v })"
    @update-font="(v) => update({ fontFamily: v })"
    @update-language="(v) => update({ language: v })"
    @update-device-id="(id) => selectedDeviceId = id"
    @reset="reset"
  />

  <CustomThemeView
    v-else-if="screen === 'customTheme'"
    :cfg="customCfg"
    @update="handleUpdateCustom"
    @back="screen = 'settings'"
    @apply="handleApplyCustom"
  />

  <GooglePhotosView
    v-else-if="screen === 'googlePhotos'"
    :theme="theme"
    :photos="settings.capturedPhotos"
    @back="screen = 'settings'"
  />

  <GalleryView
    v-else-if="screen === 'gallery'"
    :photos="settings.capturedPhotos"
    :theme="theme"
    @back="screen = 'home'"
    @delete-photos="removePhotos"
  />

  <!-- Landing Screen -->
  <div
    v-else
    class="home"
    :style="{
      background: bgImage ? undefined : theme.bg,
      backgroundImage: bgImage ?? undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: theme.text,
      fontFamily: theme.font,
    }"
  >
    <!-- Theme Animated Decorations -->
    <ThemeDecorations :theme-key="activeKey" :dark-mode="settings.darkMode" />

    <!-- Ambient Blobs -->
    <template v-if="!bgImage">
      <div
        v-for="(color, i) in theme.cameraBlobs.slice(0, 3)"
        :key="i"
        class="home-blob"
        :style="{
          left: ['25%','75%','50%'][i],
          top: ['30%','25%','70%'][i],
          width: ['280px','240px','300px'][i],
          height: ['280px','240px','300px'][i],
          background: color,
          animation: ['blob1 9s','blob2 11s','blob3 8s'][i] + ' ease-in-out infinite',
        }"
      />
    </template>

    <!-- Scanlines -->
    <div v-if="theme.scanlines" class="scanlines" />

    <!-- Topbar actions -->
    <div class="topbar">
      <div class="theme-tag" :style="{ color: theme.accent }">
        <span class="theme-dot" :style="{ background: theme.accent }" />
        {{ theme.label }}
      </div>
      <div class="topbar-actions">
        <!-- Dark / Light mode toggle -->
        <button
          class="icon-btn"
          :style="iconBtnStyle"
          :aria-label="settings.darkMode ? t('settings.light') : t('settings.dark')"
          @click="update({ darkMode: !settings.darkMode })"
        >
          <svg v-if="settings.darkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>

        <!-- Settings button -->
        <button
          class="icon-btn"
          :style="iconBtnStyle"
          :aria-label="t('settings.title')"
          @click="screen = 'settings'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Hero -->
    <div class="hero">
      <div
        class="logo-ring"
        :style="{
          background: theme.surface,
          border: `2px solid ${theme.borderStrong}`,
          boxShadow: theme.shutterGlow,
          color: theme.primary,
        }"
      >
        <svg viewBox="0 0 24 24" class="logo-icon">
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="currentColor"/>
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
        </svg>
      </div>

      <h1
        class="title"
        :style="{
          backgroundImage: theme.titleGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }"
      >
        {{ settings.appTitle || t('home.title') }}
      </h1>

      <p class="subtitle" :style="{ color: theme.textMuted }">
        {{ t('home.subtitle') }}
      </p>
    </div>

    <!-- Actions Area -->
    <div class="actions-group">
      <RouterLink
        to="/booth"
        class="btn-start"
        :style="{
          background: theme.accent,
          boxShadow: theme.shutterGlow,
          border: `1.5px solid ${theme.darkFrame ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span>{{ t('home.start') }}</span>
      </RouterLink>

      <div class="secondary-actions">
        <button
          class="btn-secondary"
          :style="secondaryBtnStyle"
          @click="screen = 'settings'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="10" cy="18" r="2" fill="currentColor"/>
          </svg>
          <span>{{ t('home.settings') }}</span>
        </button>

        <button
          class="btn-secondary"
          :style="secondaryBtnStyle"
          @click="screen = 'gallery'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>{{ t('home.gallery') }}</span>
          <span
            v-if="settings.capturedPhotos.length > 0"
            class="badge"
            :style="{ background: theme.accent }"
          >
            {{ settings.capturedPhotos.length }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 16px 20px 36px;
  box-sizing: border-box;
}

/* Ambient Blobs */
.home-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(65px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.65;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
  pointer-events: none;
}

/* Topbar */
.topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  position: relative;
}

.theme-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 4px 10px;
}

.theme-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.icon-btn:active {
  transform: scale(0.92);
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.2rem;
  z-index: 10;
  position: relative;
  margin: auto 0;
}

.logo-ring {
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(16px);
  transition: transform 0.25s ease;
}

.logo-ring:hover {
  transform: scale(1.04);
}

.logo-icon {
  width: 3.2rem;
  height: 3.2rem;
}

.title {
  margin: 0;
  font-size: clamp(2.2rem, 8vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  text-align: center;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Actions */
.actions-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 320px;
  z-index: 10;
  position: relative;
}

.btn-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  padding: 1.05rem 2rem;
  border-radius: 999px;
  letter-spacing: 0.01em;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-start:hover {
  transform: translateY(-2px);
}

.btn-start:active {
  transform: scale(0.97);
}

.secondary-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.btn-secondary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 600;
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: transform 0.18s ease;
}

.btn-secondary:active {
  transform: scale(0.96);
}

.badge {
  font-size: 10px;
  color: #fff;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
  line-height: 1.3;
}
</style>
