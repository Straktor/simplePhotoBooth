import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGooglePhotos } from '../composables/useGooglePhotos'

describe('useGooglePhotos', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('provides default state and is not connected by default', () => {
    const { state, isConnected } = useGooglePhotos()
    expect(state.clientId).toBeDefined()
    expect(state.accessToken).toBeNull()
    expect(isConnected.value).toBe(false)
    expect(state.albums).toEqual([])
  })

  it('updates configuration and persists to state', () => {
    const { state, updateConfig } = useGooglePhotos()
    updateConfig({
      clientId: 'test-client-id.apps.googleusercontent.com',
      autoBackup: true,
      purgeLocalAfterUpload: true,
    })
    expect(state.clientId).toBe('test-client-id.apps.googleusercontent.com')
    expect(state.autoBackup).toBe(true)
    expect(state.purgeLocalAfterUpload).toBe(true)
  })

  it('computes isConnected correctly based on token expiration', () => {
    const { isConnected, updateConfig } = useGooglePhotos()

    updateConfig({
      accessToken: 'valid-token',
      tokenExpiresAt: Date.now() + 3600 * 1000,
    })
    expect(isConnected.value).toBe(true)

    updateConfig({
      tokenExpiresAt: Date.now() - 1000,
    })
    expect(isConnected.value).toBe(false)
  })

  it('disconnects and resets auth/album state', () => {
    const { state, updateConfig, disconnect } = useGooglePhotos()
    updateConfig({
      accessToken: 'mock-token',
      tokenExpiresAt: Date.now() + 3600 * 1000,
      selectedAlbumId: 'album-123',
      selectedAlbumTitle: 'Vacation',
      albums: [{ id: 'album-123', title: 'Vacation' }],
    })

    disconnect()

    expect(state.accessToken).toBeNull()
    expect(state.tokenExpiresAt).toBeNull()
    expect(state.selectedAlbumId).toBeNull()
    expect(state.selectedAlbumTitle).toBeNull()
    expect(state.albums).toEqual([])
  })

  it('fetches albums via Google API', async () => {
    const { updateConfig, fetchAlbums, state } = useGooglePhotos()
    updateConfig({
      accessToken: 'mock-token',
      tokenExpiresAt: Date.now() + 3600 * 1000,
    })

    const mockAlbums = [
      { id: 'alb-1', title: 'Party 2026', productUrl: 'https://photos.google.com/1' },
      { id: 'alb-2', title: 'Wedding', productUrl: 'https://photos.google.com/2' },
    ]

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ albums: mockAlbums }),
    }))

    const albums = await fetchAlbums()
    expect(albums).toHaveLength(2)
    expect(albums[0].title).toBe('Party 2026')
    expect(state.albums).toEqual(mockAlbums)
  })

  it('creates an album and selects it', async () => {
    const { updateConfig, createAlbum, state } = useGooglePhotos()
    updateConfig({
      accessToken: 'mock-token',
      tokenExpiresAt: Date.now() + 3600 * 1000,
    })

    const createdAlbum = { id: 'new-alb', title: 'PhotoBooth Fun' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => createdAlbum,
    }))

    const result = await createAlbum('PhotoBooth Fun')
    expect(result).not.toBeNull()
    expect(result?.id).toBe('new-alb')
    expect(state.selectedAlbumId).toBe('new-alb')
    expect(state.selectedAlbumTitle).toBe('PhotoBooth Fun')
    expect(state.albums[0].id).toBe('new-alb')
  })

  it('returns early when not connected during backupPhoto', async () => {
    const { disconnect, backupPhoto } = useGooglePhotos()
    disconnect()

    const success = await backupPhoto({
      url: 'data:image/png;base64,123',
      createdAt: Date.now(),
    })
    expect(success).toBe(false)
  })
})
