import { ref, reactive, computed } from 'vue'
import { preparePhotoFiles } from '@/utils/exportPhoto'
import type { PhotoEntry } from '@/composables/useSettings'

export interface GoogleAlbum {
  id: string
  title: string
  productUrl?: string
}

export interface GooglePhotosState {
  clientId: string
  accessToken: string | null
  tokenExpiresAt: number | null
  selectedAlbumId: string | null
  selectedAlbumTitle: string | null
  autoBackup: boolean
  purgeLocalAfterUpload: boolean
  albums: GoogleAlbum[]
}

const STORAGE_KEY = 'photobooth-google-photos-v1'

const defaultState: GooglePhotosState = {
  clientId: '',
  accessToken: null,
  tokenExpiresAt: null,
  selectedAlbumId: null,
  selectedAlbumTitle: null,
  autoBackup: false,
  purgeLocalAfterUpload: false,
  albums: [],
}

function loadState(): GooglePhotosState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState }
  } catch {
    return { ...defaultState }
  }
}

const state = reactive<GooglePhotosState>(loadState())
const isUploading = ref(false)
const uploadProgress = ref<{ current: number; total: number } | null>(null)
const lastError = ref<string | null>(null)

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save Google Photos settings', err)
  }
}

export function useGooglePhotos() {
  const isConnected = computed(() => {
    if (!state.accessToken) return false
    if (state.tokenExpiresAt && Date.now() > state.tokenExpiresAt) return false
    return true
  })

  function updateConfig(partial: Partial<GooglePhotosState>) {
    Object.assign(state, partial)
    saveState()
  }

  function disconnect() {
    state.accessToken = null
    state.tokenExpiresAt = null
    state.selectedAlbumId = null
    state.selectedAlbumTitle = null
    state.albums = []
    saveState()
  }

  // Load Google Identity Services script on demand
  function loadGisScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve()
        return
      }
      const existing = document.getElementById('google-gsi-client')
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () => reject(new Error('Failed to load Google GIS script')))
        return
      }
      const script = document.createElement('script')
      script.id = 'google-gsi-client'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google GIS script'))
      document.head.appendChild(script)
    })
  }

  async function connect(): Promise<void> {
    lastError.value = null
    if (!state.clientId.trim()) {
      lastError.value = 'Please provide a Google Client ID.'
      throw new Error(lastError.value)
    }

    await loadGisScript()
    const google = (window as any).google
    if (!google?.accounts?.oauth2) {
      throw new Error('Google Identity Services unavailable.')
    }

    return new Promise((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: state.clientId.trim(),
          scope: 'https://www.googleapis.com/auth/photoslibrary.appendonly https://www.googleapis.com/auth/photoslibrary.sharing',
          callback: (response: any) => {
            if (response.error) {
              lastError.value = response.error
              reject(new Error(response.error))
              return
            }
            state.accessToken = response.access_token
            const expiresIn = Number(response.expires_in) || 3600
            state.tokenExpiresAt = Date.now() + expiresIn * 1000
            saveState()
            fetchAlbums().catch(() => {})
            resolve()
          },
          error_callback: (err: any) => {
            lastError.value = err?.message || 'Authentication failed'
            reject(err)
          },
        })
        client.requestAccessToken({ prompt: 'consent' })
      } catch (err: any) {
        lastError.value = err?.message || 'Failed to initiate Google sign in'
        reject(err)
      }
    })
  }

  async function fetchAlbums(): Promise<GoogleAlbum[]> {
    if (!state.accessToken) return []
    try {
      const res = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50', {
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
        },
      })
      if (!res.ok) {
        if (res.status === 401) disconnect()
        throw new Error(`Albums request failed: ${res.statusText}`)
      }
      const data = await res.json()
      const albumsList: GoogleAlbum[] = (data.albums || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        productUrl: a.productUrl,
      }))
      state.albums = albumsList
      saveState()
      return albumsList
    } catch (err: any) {
      lastError.value = err?.message || 'Failed to fetch albums'
      return []
    }
  }

  async function createAlbum(title: string): Promise<GoogleAlbum | null> {
    if (!state.accessToken || !title.trim()) return null
    try {
      const res = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ album: { title: title.trim() } }),
      })
      if (!res.ok) {
        throw new Error(`Create album failed: ${res.statusText}`)
      }
      const album = await res.json()
      const newAlbum: GoogleAlbum = { id: album.id, title: album.title, productUrl: album.productUrl }
      state.albums.unshift(newAlbum)
      state.selectedAlbumId = newAlbum.id
      state.selectedAlbumTitle = newAlbum.title
      saveState()
      return newAlbum
    } catch (err: any) {
      lastError.value = err?.message || 'Failed to create album'
      return null
    }
  }

  async function uploadRawFile(file: File, albumId?: string): Promise<boolean> {
    if (!state.accessToken) return false
    // Step 1: Upload binary data to obtain uploadToken
    const uploadRes = await fetch('https://photoslibrary.googleapis.com/v1/uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.accessToken}`,
        'Content-type': 'application/octet-stream',
        'X-Goog-Upload-Content-Type': file.type,
        'X-Goog-Upload-Protocol': 'raw',
      },
      body: file,
    })

    if (!uploadRes.ok) {
      throw new Error(`Binary upload failed: ${uploadRes.statusText}`)
    }

    const uploadToken = await uploadRes.text()

    // Step 2: Batch create media item and assign to album
    const targetAlbum = albumId ?? state.selectedAlbumId ?? undefined
    const createRes = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        albumId: targetAlbum,
        newMediaItems: [
          {
            description: 'Captured with Simple Photo Booth',
            simpleMediaItem: {
              fileName: file.name,
              uploadToken,
            },
          },
        ],
      }),
    })

    if (!createRes.ok) {
      throw new Error(`Media creation failed: ${createRes.statusText}`)
    }

    return true
  }

  async function backupPhoto(photo: PhotoEntry): Promise<boolean> {
    if (!isConnected.value) return false
    isUploading.value = true
    lastError.value = null
    try {
      const files = await preparePhotoFiles(photo)
      for (const file of files) {
        await uploadRawFile(file)
      }
      return true
    } catch (err: any) {
      lastError.value = err?.message || 'Backup failed'
      console.error('Google Photos upload error', err)
      return false
    } finally {
      isUploading.value = false
    }
  }

  async function backupAllPhotos(photos: PhotoEntry[]): Promise<{ uploaded: number; failed: number }> {
    if (!isConnected.value || photos.length === 0) return { uploaded: 0, failed: 0 }
    isUploading.value = true
    lastError.value = null
    uploadProgress.value = { current: 0, total: photos.length }

    let uploaded = 0
    let failed = 0

    for (let i = 0; i < photos.length; i++) {
      uploadProgress.value = { current: i + 1, total: photos.length }
      const success = await backupPhoto(photos[i])
      if (success) uploaded++
      else failed++
    }

    uploadProgress.value = null
    isUploading.value = false
    return { uploaded, failed }
  }

  return {
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
    backupPhoto,
    backupAllPhotos,
  }
}
