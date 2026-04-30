import { reactive, readonly, watch } from 'vue'
import type { CustomThemeVariants } from '@/themes'
import { i18n } from '@/i18n'

export interface PhotoEntry {
  url: string
  motion?: boolean
}

export interface AppSettings {
  activeThemeKey: string
  customThemeCfg: CustomThemeVariants
  appTitle: string
  countdownDuration: number
  mirrorPreview: boolean
  darkMode: boolean
  fontFamily: string
  language: string
  capturedPhotos: PhotoEntry[]
}

const STORAGE_KEY = 'photobooth-settings-v2'

const DEFAULT_SETTINGS: AppSettings = {
  activeThemeKey: 'light',
  customThemeCfg: {
    dark:  { primary: '#7c6fff', accent: '#ff6b9d', bg: '#09090f', bgImage: null },
    light: { primary: '#7c6fff', accent: '#ff6b9d', bg: '#f5f5f5', bgImage: null },
  },
  appTitle: 'Simple Photo Booth',
  countdownDuration: 3,
  mirrorPreview: true,
  darkMode: false,
  fontFamily: 'system',
  language: 'en',
  capturedPhotos: [],
}

function migrateCustomTheme(raw: any): CustomThemeVariants {
  const def = DEFAULT_SETTINGS.customThemeCfg
  if (!raw) return def
  if (!('dark' in raw)) {
    return { dark: { ...def.dark, ...raw }, light: { ...def.light } }
  }
  return {
    dark:  { ...def.dark,  ...(raw.dark  ?? {}) },
    light: { ...def.light, ...(raw.light ?? {}) },
  }
}

function migratePhotos(raw: any): PhotoEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.map(item => typeof item === 'string' ? { url: item } : item)
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
  customThemeCfg: migrateCustomTheme(stored.customThemeCfg),
  capturedPhotos: migratePhotos((stored as any).capturedPhotos),
})

watch(() => settings.language, (lang) => {
  i18n.global.locale = lang as any
}, { immediate: true })

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

  function updateCustomTheme(variants: CustomThemeVariants) {
    Object.assign(settings.customThemeCfg.dark,  variants.dark)
    Object.assign(settings.customThemeCfg.light, variants.light)
  }

  function addPhoto(url: string, motion?: boolean) {
    settings.capturedPhotos.push({ url, motion })
  }

  function removePhotos(indices: number[]) {
    const toRemove = new Set(indices)
    for (let i = settings.capturedPhotos.length - 1; i >= 0; i--) {
      if (toRemove.has(i)) settings.capturedPhotos.splice(i, 1)
    }
  }

  function reset() {
    Object.assign(settings, { ...DEFAULT_SETTINGS, capturedPhotos: settings.capturedPhotos })
    Object.assign(settings.customThemeCfg.dark,  DEFAULT_SETTINGS.customThemeCfg.dark)
    Object.assign(settings.customThemeCfg.light, DEFAULT_SETTINGS.customThemeCfg.light)
  }

  return { settings: readonly(settings), update, updateCustomTheme, addPhoto, removePhotos, reset }
}
