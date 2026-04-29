import { reactive, readonly, watch } from 'vue'
import type { CustomThemeCfg } from '@/themes'

export interface AppSettings {
  activeThemeKey: string
  customThemeCfg: CustomThemeCfg
  appTitle: string
  countdownDuration: number
  mirrorPreview: boolean
  darkMode: boolean
  capturedPhotos: string[]
}

const STORAGE_KEY = 'photobooth-settings-v2'

const DEFAULT_SETTINGS: AppSettings = {
  activeThemeKey: 'light',
  customThemeCfg: { primary: '#7c6fff', accent: '#ff6b9d', bg: '#09090f', bgImage: null },
  appTitle: 'Simple Photo Booth',
  countdownDuration: 3,
  mirrorPreview: true,
  darkMode: false,
  capturedPhotos: [],
}

function loadFromStorage(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const stored = loadFromStorage()
const settings = reactive<AppSettings>({
  ...DEFAULT_SETTINGS,
  ...stored,
  customThemeCfg: { ...DEFAULT_SETTINGS.customThemeCfg, ...(stored.customThemeCfg ?? {}) },
})

watch(settings, (val) => {
  try {
    const toSave = { ...val, capturedPhotos: val.capturedPhotos.slice(-50) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // quota exceeded
  }
}, { deep: true })

export function useSettings() {
  function update(partial: Partial<AppSettings>) {
    Object.assign(settings, partial)
  }

  function updateCustomTheme(partial: Partial<CustomThemeCfg>) {
    Object.assign(settings.customThemeCfg, partial)
  }

  function addPhoto(dataUrl: string) {
    settings.capturedPhotos.push(dataUrl)
  }

  function reset() {
    Object.assign(settings, DEFAULT_SETTINGS)
    Object.assign(settings.customThemeCfg, DEFAULT_SETTINGS.customThemeCfg)
  }

  return { settings: readonly(settings), update, updateCustomTheme, addPhoto, reset }
}
