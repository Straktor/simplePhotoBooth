const DB_NAME = 'photobooth-db'
const DB_VERSION = 3
const STORE_NAME = 'photos'
const THEME_STORE_NAME = 'theme_assets'

export interface DbPhoto {
  id?: number
  url: string
  motion?: boolean
  videoBlob?: Blob | null
  createdAt?: number
}

export interface DbThemeAsset {
  key: string
  dataUrl: string
}

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(THEME_STORE_NAME)) {
        db.createObjectStore(THEME_STORE_NAME, { keyPath: 'key' })
      }
    }
  })
}

export async function getAllPhotos(): Promise<DbPhoto[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getPhotoById(id: number): Promise<DbPhoto | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addPhotoToDb(photo: Omit<DbPhoto, 'id'>): Promise<number> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add({ ...photo, createdAt: photo.createdAt ?? Date.now() })
    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function deletePhotoFromDb(id: number): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllPhotosFromDb(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getThemeAsset(key: string): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(THEME_STORE_NAME, 'readonly')
    const store = transaction.objectStore(THEME_STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result?.dataUrl ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function setThemeAsset(key: string, dataUrl: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(THEME_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(THEME_STORE_NAME)
    const request = store.put({ key, dataUrl })
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteThemeAsset(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(THEME_STORE_NAME, 'readwrite')
    const store = transaction.objectStore(THEME_STORE_NAME)
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
