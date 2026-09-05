import { reactive, readonly, ref, watch } from 'vue'
import type { CustomThemeVariants } from '@/themes'
import { i18n } from '@/i18n'
import { getAllPhotos, addPhotoToDb, addPhotoToDbWithRetry, deletePhotoFromDb, getPhotoById, getThemeAsset, setThemeAsset, deleteThemeAsset } from '@/utils/db'

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

function sanitizeBg(bg: string | null | undefined): string | null {
  if (!bg || bg.startsWith('idb:')) return null
  return bg
}

function migrateCustomTheme(raw: any): CustomThemeVariants {
  const def = DEFAULT_SETTINGS.customThemeCfg
  if (!raw) return def
  if (!('dark' in raw)) {
    return {
      dark: { ...def.dark, ...raw, bgImage: sanitizeBg(raw.bgImage) },
      light: { ...def.light }
    }
  }
  return {
    dark:  { ...def.dark,  ...(raw.dark  ?? {}), bgImage: sanitizeBg(raw.dark?.bgImage) },
    light: { ...def.light, ...(raw.light ?? {}), bgImage: sanitizeBg(raw.light?.bgImage) },
  }
}

function isDataUrl(str: string | null | undefined): boolean {
  return typeof str === 'string' && (str.includes('data:') || str.startsWith('idb:'))
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

// Separate configuration settings from large photo collections in RAM
const configSettings = reactive({
  activeThemeKey: stored.activeThemeKey ?? DEFAULT_SETTINGS.activeThemeKey,
  customThemeCfg: migrateCustomTheme(stored.customThemeCfg),
  appTitle: stored.appTitle ?? DEFAULT_SETTINGS.appTitle,
  countdownDuration: stored.countdownDuration ?? DEFAULT_SETTINGS.countdownDuration,
  mirrorPreview: stored.mirrorPreview ?? DEFAULT_SETTINGS.mirrorPreview,
  darkMode: stored.darkMode ?? DEFAULT_SETTINGS.darkMode,
  fontFamily: stored.fontFamily ?? DEFAULT_SETTINGS.fontFamily,
  language: stored.language ?? DEFAULT_SETTINGS.language,
})

const capturedPhotos = ref<PhotoEntry[]>([])

// Unified reactive settings object matching AppSettings interface
const settings = reactive<AppSettings>({
  get activeThemeKey() { return configSettings.activeThemeKey },
  set activeThemeKey(v: string) { configSettings.activeThemeKey = v },

  get customThemeCfg() { return configSettings.customThemeCfg },
  set customThemeCfg(v: CustomThemeVariants) { configSettings.customThemeCfg = v },

  get appTitle() { return configSettings.appTitle },
  set appTitle(v: string) { configSettings.appTitle = v },

  get countdownDuration() { return configSettings.countdownDuration },
  set countdownDuration(v: number) { configSettings.countdownDuration = v },

  get mirrorPreview() { return configSettings.mirrorPreview },
  set mirrorPreview(v: boolean) { configSettings.mirrorPreview = v },

  get darkMode() { return configSettings.darkMode },
  set darkMode(v: boolean) { configSettings.darkMode = v },

  get fontFamily() { return configSettings.fontFamily },
  set fontFamily(v: string) { configSettings.fontFamily = v },

  get language() { return configSettings.language },
  set language(v: string) { configSettings.language = v },

  get capturedPhotos() { return capturedPhotos.value },
  set capturedPhotos(v: PhotoEntry[]) { capturedPhotos.value = v },
})

// Hydrate custom background images from IndexedDB (or migrate from localStorage)
Promise.all([
  getThemeAsset('custom_bg_dark'),
  getThemeAsset('custom_bg_light'),
]).then(async ([darkBg, lightBg]) => {
  const rawDark = stored.customThemeCfg?.dark?.bgImage
  const rawLight = stored.customThemeCfg?.light?.bgImage

  if (darkBg) {
    configSettings.customThemeCfg.dark.bgImage = darkBg
  } else if (typeof rawDark === 'string' && rawDark.includes('data:')) {
    await setThemeAsset('custom_bg_dark', rawDark)
    configSettings.customThemeCfg.dark.bgImage = rawDark
  }

  if (lightBg) {
    configSettings.customThemeCfg.light.bgImage = lightBg
  } else if (typeof rawLight === 'string' && rawLight.includes('data:')) {
    await setThemeAsset('custom_bg_light', rawLight)
    configSettings.customThemeCfg.light.bgImage = rawLight
  }
}).catch((err) => {
  console.error('Failed to load custom theme backgrounds from IndexedDB', err)
})

// Load photos asynchronously from IndexedDB and handle migration on startup
getAllPhotos().then(async (dbPhotos) => {
  // If there are migrated photos in localStorage, add them first
  const localPhotos = migratePhotos((stored as any).capturedPhotos)
  if (localPhotos.length > 0) {
    for (const photo of localPhotos) {
      try {
        const id = await addPhotoToDb({ url: photo.url, motion: photo.motion })
        capturedPhotos.value.push({ id, url: photo.url, motion: photo.motion })
      } catch (e) {
        console.error('Failed to migrate photo to IndexedDB', e)
        capturedPhotos.value.push({ url: photo.url, motion: photo.motion })
      }
    }
    // Clear capturedPhotos from localStorage to prevent re-migration
    try {
      const { capturedPhotos: _unused, ...cleanStored } = stored as any
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanStored))
    } catch {
      // ignore
    }
  }

  // Then add all photos from DB that aren't already there
  const newPhotos: PhotoEntry[] = []
  dbPhotos.forEach((p) => {
    if (!capturedPhotos.value.some((existing) => existing.id === p.id)) {
      newPhotos.push({
        id: p.id,
        url: p.url,
        motion: p.motion,
        hasVideo: !!p.videoBlob,
        createdAt: p.createdAt,
      })
    }
  })
  if (newPhotos.length > 0) {
    capturedPhotos.value.push(...newPhotos)
  }
}).catch((err) => {
  console.error('Failed to load photos from IndexedDB', err)
})

watch(() => configSettings.language, (lang) => {
  i18n.global.locale = lang as any
}, { immediate: true })

// Only deeply watches configuration settings, preventing massive memory traversing on settings change
watch(configSettings, (toSave) => {
  try {
    const safeCustomCfg = {
      dark: {
        ...toSave.customThemeCfg.dark,
        bgImage: isDataUrl(toSave.customThemeCfg.dark.bgImage) ? 'idb:custom_bg_dark' : toSave.customThemeCfg.dark.bgImage,
      },
      light: {
        ...toSave.customThemeCfg.light,
        bgImage: isDataUrl(toSave.customThemeCfg.light.bgImage) ? 'idb:custom_bg_light' : toSave.customThemeCfg.light.bgImage,
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...toSave, customThemeCfg: safeCustomCfg }))
  } catch (e) {
    console.error('Failed to save settings to localStorage', e)
  }
}, { deep: true })

export function useSettings() {
  function update(partial: Partial<AppSettings>) {
    const { capturedPhotos: p, ...configOnly } = partial
    if (p !== undefined) {
      capturedPhotos.value = p
    }
    Object.assign(configSettings, configOnly)
  }

  async function updateCustomTheme(variants: CustomThemeVariants) {
    Object.assign(configSettings.customThemeCfg.dark,  variants.dark)
    Object.assign(configSettings.customThemeCfg.light, variants.light)

    // Persist custom background image to IndexedDB if data URL
    if (typeof variants.dark.bgImage === 'string' && variants.dark.bgImage.includes('data:')) {
      await setThemeAsset('custom_bg_dark', variants.dark.bgImage).catch(() => {})
    } else if (!variants.dark.bgImage || !variants.dark.bgImage.includes('data:')) {
      await deleteThemeAsset('custom_bg_dark').catch(() => {})
    }

    if (typeof variants.light.bgImage === 'string' && variants.light.bgImage.includes('data:')) {
      await setThemeAsset('custom_bg_light', variants.light.bgImage).catch(() => {})
    } else if (!variants.light.bgImage || !variants.light.bgImage.includes('data:')) {
      await deleteThemeAsset('custom_bg_light').catch(() => {})
    }
  }

  async function pruneOldestPhotos(keepCount = 15) {
    if (capturedPhotos.value.length <= keepCount) return
    const countToDelete = capturedPhotos.value.length - keepCount
    const indices = Array.from({ length: countToDelete }, (_, i) => i)
    await removePhotos(indices)
  }

  async function addPhoto(
    url: string,
    motion?: boolean,
    videoBlob?: Blob | null,
    options?: { maxLocalPhotos?: number },
  ) {
    if (options?.maxLocalPhotos && capturedPhotos.value.length >= options.maxLocalPhotos) {
      await pruneOldestPhotos(Math.max(0, options.maxLocalPhotos - 1))
    }

    const createdAt = Date.now()
    const dbData = { url, motion, videoBlob: videoBlob ?? null, createdAt }
    try {
      const id = await addPhotoToDbWithRetry(dbData)
      capturedPhotos.value.push({ id, url, motion, hasVideo: !!videoBlob, createdAt })
    } catch (e) {
      console.error('Failed to save photo to IndexedDB', e)
      capturedPhotos.value.push({ url, motion, hasVideo: !!videoBlob, createdAt })
    }
  }

  async function removePhotos(indices: number[]) {
    const toRemove = new Set(indices)
    for (let i = capturedPhotos.value.length - 1; i >= 0; i--) {
      if (toRemove.has(i)) {
        const photo = capturedPhotos.value[i]
        if (photo.id !== undefined) {
          try {
            await deletePhotoFromDb(photo.id)
          } catch (e) {
            console.error('Failed to delete photo from IndexedDB', e)
          }
        }
      }
    }
    capturedPhotos.value = capturedPhotos.value.filter((_, i) => !toRemove.has(i))
  }

  function reset() {
    Object.assign(configSettings, {
      activeThemeKey: DEFAULT_SETTINGS.activeThemeKey,
      appTitle: DEFAULT_SETTINGS.appTitle,
      countdownDuration: DEFAULT_SETTINGS.countdownDuration,
      mirrorPreview: DEFAULT_SETTINGS.mirrorPreview,
      darkMode: DEFAULT_SETTINGS.darkMode,
      fontFamily: DEFAULT_SETTINGS.fontFamily,
      language: DEFAULT_SETTINGS.language,
    })
    Object.assign(configSettings.customThemeCfg.dark,  DEFAULT_SETTINGS.customThemeCfg.dark)
    Object.assign(configSettings.customThemeCfg.light, DEFAULT_SETTINGS.customThemeCfg.light)
  }

  return { settings: readonly(settings), update, updateCustomTheme, addPhoto, removePhotos, pruneOldestPhotos, reset }
}
