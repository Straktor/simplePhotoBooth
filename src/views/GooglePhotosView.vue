<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResolvedTheme } from '@/themes'
import type { PhotoEntry } from '@/composables/useSettings'
import { useGooglePhotos } from '@/composables/useGooglePhotos'
import { preparePhotoFiles, shareOrDownloadFiles } from '@/utils/exportPhoto'
import GooglePhotosLogo from '@/components/GooglePhotosLogo.vue'

const { t } = useI18n()

const props = defineProps<{
  theme: ResolvedTheme
  photos: readonly PhotoEntry[]
}>()

const emit = defineEmits<{
  back: []
}>()

const {
  state,
  isConnected,
  isUploading,
  uploadProgress,
  lastError,
  updateConfig,
  connect,
  disconnect,
  fetchAlbums,
  createAlbum,
  backupAllPhotos,
} = useGooglePhotos()

const isConnecting = ref(false)
const newAlbumTitle = ref('')
const isCreatingAlbum = ref(false)
const syncSuccess = ref<string | null>(null)
const isSharingToApp = ref(false)

onMounted(() => {
  if (isConnected.value) {
    fetchAlbums().catch(() => {})
  }
})

async function handleConnect() {
  isConnecting.value = true
  try {
    await connect()
  } catch {
    // error is captured in lastError
  } finally {
    isConnecting.value = false
  }
}

async function handleCreateAlbum() {
  if (!newAlbumTitle.value.trim() || isCreatingAlbum.value) return
  isCreatingAlbum.value = true
  try {
    await createAlbum(newAlbumTitle.value.trim())
    newAlbumTitle.value = ''
  } finally {
    isCreatingAlbum.value = false
  }
}

async function handleSyncAll() {
  syncSuccess.value = null
  const result = await backupAllPhotos([...props.photos])
  if (result.uploaded > 0) {
    syncSuccess.value = `${result.uploaded} photo(s) backed up successfully!`
  }
}

async function handleSendToApp() {
  if (props.photos.length === 0 || isSharingToApp.value) return
  isSharingToApp.value = true
  try {
    const allFiles: File[] = []
    for (const photo of props.photos) {
      const files = await preparePhotoFiles(photo)
      allFiles.push(...files)
    }
    await shareOrDownloadFiles(allFiles)
  } finally {
    isSharingToApp.value = false
  }
}
</script>

<template>
  <div class="gp-view" :style="{ background: theme.bg, color: theme.text, fontFamily: theme.font }">
    <!-- Header -->
    <div class="hdr" :style="{ background: theme.bg, borderBottom: `1px solid ${theme.border}` }">
      <button class="back-btn" :style="{ color: theme.primary }" @click="emit('back')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ t('settings.back') }}
      </button>
      <span class="hdr-title" :style="{ color: theme.primary }">{{ t('googlePhotos.title') }}</span>
      <div style="width:64px" />
    </div>

    <div class="content">
      <!-- Hero / Explanation Card -->
      <div class="hero-card" :style="{ background: theme.surface, border: `1px solid ${theme.border}` }">
        <div class="hero-icon-wrap">
          <GooglePhotosLogo :size="48" />
        </div>
        <h2 class="hero-title">{{ t('googlePhotos.heroTitle') }}</h2>
        <p class="hero-desc" :style="{ color: theme.textMuted }">
          {{ t('googlePhotos.heroDesc') }}
        </p>

        <div class="feature-bullets">
          <div class="bullet-item">
            <span class="bullet-icon">☁️</span>
            <span>{{ t('googlePhotos.bulletUnlimited') }}</span>
          </div>
          <div class="bullet-item">
            <span class="bullet-icon">🎞️</span>
            <span>{{ t('googlePhotos.bulletMotion') }}</span>
          </div>
          <div class="bullet-item">
            <span class="bullet-icon">📁</span>
            <span>{{ t('googlePhotos.bulletAlbums') }}</span>
          </div>
        </div>
      </div>

      <!-- OPTION 1: Installed Device App (Zero Setup) -->
      <div class="section-label" :style="{ color: theme.textMuted }">{{ t('googlePhotos.nativeAppTitle') }}</div>
      <div class="group" :style="{ background: theme.surface, border: `1px solid ${theme.border}` }">
        <div class="row row--col" style="gap: 8px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.45;" :style="{ color: theme.textMuted }">
            {{ t('googlePhotos.nativeAppDesc') }}
          </p>
        </div>
        <div class="divider" :style="{ background: theme.border }" />
        <div class="row row--center">
          <button
            class="sync-btn"
            :style="{ background: theme.accent, color: '#fff' }"
            :disabled="photos.length === 0 || isSharingToApp"
            @click="handleSendToApp"
          >
            <span v-if="isSharingToApp">...</span>
            <span v-else>{{ t('googlePhotos.sendToApp', { count: photos.length }) }}</span>
          </button>
        </div>
      </div>

      <!-- OPTION 2: Direct Cloud Connection -->
      <div class="section-label" :style="{ color: theme.textMuted }">{{ t('googlePhotos.cloudApiTitle') }}</div>
      <div class="group" :style="{ background: theme.surface, border: `1px solid ${theme.border}` }">
        <template v-if="!isConnected">
          <div class="row row--center">
            <button
              class="connect-btn"
              :style="{ background: theme.accent, boxShadow: theme.shutterGlow }"
              :disabled="isConnecting"
              @click="handleConnect"
            >
              <span v-if="isConnecting">{{ t('googlePhotos.connecting') }}</span>
              <span v-else>{{ t('googlePhotos.connectGoogle') }}</span>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="row">
            <div class="status-wrap">
              <span class="status-dot" />
              <span class="status-text">{{ t('googlePhotos.connected') }}</span>
            </div>
            <button class="disconnect-btn" @click="disconnect">
              {{ t('googlePhotos.disconnect') }}
            </button>
          </div>
        </template>
      </div>

      <div v-if="lastError" class="error-banner">
        {{ lastError }}
      </div>

      <!-- Albums Section (When Connected) -->
      <template v-if="isConnected">
        <div class="section-label" :style="{ color: theme.textMuted }">{{ t('googlePhotos.destinationAlbum') }}</div>
        <div class="group" :style="{ background: theme.surface, border: `1px solid ${theme.border}` }">
          <!-- Create New Album Row -->
          <div class="row row--new-album">
            <input
              v-model="newAlbumTitle"
              class="text-input"
              :placeholder="t('googlePhotos.newAlbumPlaceholder')"
              :style="{ color: theme.text, borderColor: theme.border, background: 'rgba(0,0,0,0.1)' }"
              @keydown.enter="handleCreateAlbum"
            />
            <button
              class="create-album-btn"
              :style="{ background: theme.primary }"
              :disabled="!newAlbumTitle.trim() || isCreatingAlbum"
              @click="handleCreateAlbum"
            >
              {{ isCreatingAlbum ? '...' : t('googlePhotos.create') }}
            </button>
          </div>

          <div class="divider" :style="{ background: theme.border }" />

          <!-- Album Picker -->
          <div class="row">
            <span class="row-label">{{ t('googlePhotos.chooseAlbum') }}</span>
            <select
              class="album-select"
              :value="state.selectedAlbumId ?? ''"
              :style="{ color: theme.text, fontFamily: theme.font }"
              @change="(e) => {
                const id = (e.target as HTMLSelectElement).value
                const found = state.albums.find(a => a.id === id)
                updateConfig({ selectedAlbumId: id || null, selectedAlbumTitle: found?.title || null })
              }"
            >
              <option value="">{{ t('googlePhotos.libraryNoAlbum') }}</option>
              <option v-for="alb in state.albums" :key="alb.id" :value="alb.id">
                {{ alb.title }}
              </option>
            </select>
          </div>
        </div>
      </template>

      <!-- Automation Settings -->
      <div class="section-label" :style="{ color: theme.textMuted }">{{ t('googlePhotos.backupOptions') }}</div>
      <div class="group" :style="{ background: theme.surface, border: `1px solid ${theme.border}` }">
        <div class="row">
          <div class="option-text">
            <span class="row-label">{{ t('googlePhotos.autoBackup') }}</span>
            <span class="option-desc" :style="{ color: theme.textMuted }">{{ t('googlePhotos.autoBackupDesc') }}</span>
          </div>
          <div
            class="toggle"
            :style="{ background: state.autoBackup ? theme.accent : 'rgba(120,120,128,0.3)' }"
            @click="updateConfig({ autoBackup: !state.autoBackup })"
          >
            <div class="toggle-knob" :style="{ transform: state.autoBackup ? 'translateX(20px)' : 'translateX(0)' }" />
          </div>
        </div>

        <div class="divider" :style="{ background: theme.border }" />

        <div class="row">
          <div class="option-text">
            <span class="row-label">{{ t('googlePhotos.freeUpSpace') }}</span>
            <span class="option-desc" :style="{ color: theme.textMuted }">{{ t('googlePhotos.freeUpSpaceDesc') }}</span>
          </div>
          <div
            class="toggle"
            :style="{ background: state.purgeLocalAfterUpload ? theme.accent : 'rgba(120,120,128,0.3)' }"
            @click="updateConfig({ purgeLocalAfterUpload: !state.purgeLocalAfterUpload })"
          >
            <div class="toggle-knob" :style="{ transform: state.purgeLocalAfterUpload ? 'translateX(20px)' : 'translateX(0)' }" />
          </div>
        </div>
      </div>

      <!-- Manual Backup Button (When Cloud Connected) -->
      <template v-if="isConnected">
        <div class="section-label" :style="{ color: theme.textMuted }">{{ t('googlePhotos.manualSync') }}</div>
        <div class="group" :style="{ background: theme.surface, border: `1px solid ${theme.border}` }">
          <div class="row row--sync">
            <button
              class="sync-btn"
              :style="{ background: theme.primary }"
              :disabled="isUploading || photos.length === 0"
              @click="handleSyncAll"
            >
              <span v-if="isUploading">
                {{ t('googlePhotos.syncing') }} ({{ uploadProgress?.current }} / {{ uploadProgress?.total }})
              </span>
              <span v-else>
                {{ t('googlePhotos.syncAll', { count: photos.length }) }}
              </span>
            </button>
            <p v-if="syncSuccess" class="sync-success">{{ syncSuccess }}</p>
          </div>
        </div>
      </template>

      <div style="height: 48px" />
    </div>
  </div>
</template>

<style scoped>
.gp-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Header */
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

.hdr-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.content {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Hero card */
.hero-card {
  border-radius: 18px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  backdrop-filter: blur(12px);
}

.hero-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.4px;
  margin: 0;
}

.hero-desc {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  max-width: 320px;
}

.feature-bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
  margin-top: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
}

.bullet-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  padding: 16px 4px 4px;
}

.group {
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  min-height: 52px;
  gap: 12px;
}

.row--col {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.row--center {
  justify-content: center;
  padding: 16px;
}

.row--help {
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px 14px;
}

.row--new-album {
  gap: 10px;
}

.row--sync {
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
}

.text-input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid;
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.connect-btn, .sync-btn {
  width: 100%;
  padding: 12px 24px;
  border-radius: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.create-album-btn {
  padding: 10px 18px;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
}

.status-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ecc71;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
}

.disconnect-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 60, 60, 0.15);
  color: #e74c3c;
  border: none;
  cursor: pointer;
}

.album-select {
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 600;
  text-align-last: right;
  max-width: 60%;
  cursor: pointer;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-desc {
  font-size: 11px;
}

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

.divider {
  height: 1px;
  margin: 0 16px;
}

.error-banner {
  padding: 10px 14px;
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 10px;
  color: #e74c3c;
  font-size: 12px;
}

.sync-success {
  font-size: 12px;
  color: #2ecc71;
  font-weight: 600;
  margin: 0;
}
</style>
