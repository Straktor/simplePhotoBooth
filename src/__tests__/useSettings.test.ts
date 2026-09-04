import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { useSettings } from '../composables/useSettings'

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default settings', () => {
    const { settings } = useSettings()
    expect(settings.activeThemeKey).toBeDefined()
    expect(settings.countdownDuration).toBeGreaterThan(0)
    expect(settings.language).toBeDefined()
  })

  it('updates settings', () => {
    const { settings, update } = useSettings()
    update({ countdownDuration: 10, appTitle: 'Custom Booth' })
    expect(settings.countdownDuration).toBe(10)
    expect(settings.appTitle).toBe('Custom Booth')
  })

  it('resets settings to defaults', () => {
    const { settings, update, reset } = useSettings()
    update({ countdownDuration: 10, appTitle: 'Modified' })
    reset()
    expect(settings.countdownDuration).toBe(3)
    expect(settings.appTitle).toBe('Simple Photo Booth')
  })

  it('adds and removes photos', async () => {
    const { settings, addPhoto, removePhotos } = useSettings()
    const initialCount = settings.capturedPhotos.length
    await addPhoto('data:image/jpeg;base64,samplephoto1')
    expect(settings.capturedPhotos.length).toBe(initialCount + 1)
    expect(settings.capturedPhotos[settings.capturedPhotos.length - 1].url).toBe('data:image/jpeg;base64,samplephoto1')

    await removePhotos([settings.capturedPhotos.length - 1])
    expect(settings.capturedPhotos.length).toBe(initialCount)
  })
})
