import { reactive, readonly, watch } from 'vue'

export interface AppSettings {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  backgroundImage: string
  countdownDuration: number
  fontFamily: 'system' | 'mono' | 'serif'
  mirrorPreview: boolean
}

const STORAGE_KEY = 'photobooth-settings'

const DEFAULT_SETTINGS: AppSettings = {
  primaryColor: '#6c63ff',
  accentColor: '#ff6584',
  backgroundColor: '#1a1a2e',
  backgroundImage: '',
  countdownDuration: 3,
  fontFamily: 'system',
  mirrorPreview: true,
}

function loadFromStorage(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const settings = reactive<AppSettings>({ ...DEFAULT_SETTINGS, ...loadFromStorage() })

watch(settings, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch {
    // localStorage quota exceeded (likely large backgroundImage)
  }
}, { deep: true })

export function useSettings() {
  function update(partial: Partial<AppSettings>) {
    Object.assign(settings, partial)
  }

  function reset() {
    Object.assign(settings, DEFAULT_SETTINGS)
  }

  return { settings: readonly(settings), update, reset }
}
