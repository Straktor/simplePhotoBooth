import { reactive, readonly, watch } from 'vue'
import type { CustomThemeVariants } from '@/themes'
import { i18n } from '@/i18n'
import { getAllPhotos, addPhotoToDb, deletePhotoFromDb, getPhotoById } from '@/utils/db'

export interface PhotoEntry {
  id?: number
  url: string
  motion?: boolean
  hasVideo?: boolean
  createdAt?: number
}

export { getPhotoById }

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
  capturedPhotos: [], // start empty, load from IndexedDB asynchronously
})

// Load photos asynchronously from IndexedDB and handle migration on startup
getAllPhotos().then(async (dbPhotos) => {
  // If there are migrated photos in localStorage, add them first
  const localPhotos = migratePhotos((stored as any).capturedPhotos)
  if (localPhotos.length > 0) {
    for (const photo of localPhotos) {
      try {
        const id = await addPhotoToDb({ url: photo.url, motion: photo.motion })
        settings.capturedPhotos.push({ id, url: photo.url, motion: photo.motion })
      } catch (e) {
        console.error('Failed to migrate photo to IndexedDB', e)
        settings.capturedPhotos.push({ url: photo.url, motion: photo.motion })
      }
    }
    // Clear capturedPhotos from localStorage to prevent re-migration
    try {
      const { capturedPhotos, ...cleanStored } = stored as any
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanStored))
    } catch {
      // ignore
    }
  }

  // Then add all photos from DB that aren't already there
  dbPhotos.forEach((p) => {
    if (!settings.capturedPhotos.some((existing) => existing.id === p.id)) {
      settings.capturedPhotos.push({
        id: p.id,
        url: p.url,
        motion: p.motion,
        hasVideo: !!p.videoBlob,
        createdAt: p.createdAt,
      })
    }
  })
}).catch((err) => {
  console.error('Failed to load photos from IndexedDB', err)
})

watch(() => settings.language, (lang) => {
  i18n.global.locale = lang as any
}, { immediate: true })

watch(settings, (val) => {
  try {
    // Exclude capturedPhotos from localStorage watch serialization
    const { capturedPhotos, ...toSave } = val
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

  async function addPhoto(url: string, motion?: boolean, videoBlob?: Blob | null) {
    const createdAt = Date.now()
    const dbData = { url, motion, videoBlob: videoBlob ?? null, createdAt }
    try {
      const id = await addPhotoToDb(dbData)
      settings.capturedPhotos.push({ id, url, motion, hasVideo: !!videoBlob, createdAt })
    } catch (e) {
      console.error('Failed to save photo to IndexedDB', e)
      settings.capturedPhotos.push({ url, motion, hasVideo: !!videoBlob, createdAt })
    }
  }

  async function removePhotos(indices: number[]) {
    const toRemove = new Set(indices)
    // Go backwards to avoid index shift
    for (let i = settings.capturedPhotos.length - 1; i >= 0; i--) {
      if (toRemove.has(i)) {
        const photo = settings.capturedPhotos[i]
        if (photo.id !== undefined) {
          try {
            await deletePhotoFromDb(photo.id)
          } catch (e) {
            console.error('Failed to delete photo from IndexedDB', e)
          }
        }
        settings.capturedPhotos.splice(i, 1)
      }
    }
  }

  function reset() {
    Object.assign(settings, { ...DEFAULT_SETTINGS, capturedPhotos: settings.capturedPhotos })
    Object.assign(settings.customThemeCfg.dark,  DEFAULT_SETTINGS.customThemeCfg.dark)
    Object.assign(settings.customThemeCfg.light, DEFAULT_SETTINGS.customThemeCfg.light)
  }

  return { settings: readonly(settings), update, updateCustomTheme, addPhoto, removePhotos, reset }
}
