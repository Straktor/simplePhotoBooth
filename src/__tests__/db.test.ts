import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  addPhotoToDb,
  addPhotoToDbWithRetry,
  getAllPhotos,
  getPhotoById,
  deletePhotoFromDb,
  deleteOldestPhotos,
  clearAllPhotosFromDb,
  setThemeAsset,
  getThemeAsset,
  deleteThemeAsset,
} from '../utils/db'

describe('IndexedDB operations (db.ts)', () => {
  beforeEach(async () => {
    await clearAllPhotosFromDb().catch(() => {})
  })

  it('adds and retrieves photos from db', async () => {
    const id = await addPhotoToDb({
      url: 'data:image/jpeg;base64,test1234',
      motion: true,
      videoBlob: null,
    })

    expect(typeof id).toBe('number')

    const photo = await getPhotoById(id)
    expect(photo).toBeDefined()
    expect(photo?.url).toBe('data:image/jpeg;base64,test1234')
    expect(photo?.motion).toBe(true)

    const all = await getAllPhotos()
    expect(all.length).toBeGreaterThanOrEqual(1)
  })

  it('deletes photo by id', async () => {
    const id = await addPhotoToDb({
      url: 'data:image/jpeg;base64,deleteMe',
      motion: false,
    })

    await deletePhotoFromDb(id)
    const photo = await getPhotoById(id)
    expect(photo).toBeUndefined()
  })

  it('stores and retrieves theme assets', async () => {
    await setThemeAsset('custom_bg_dark', 'url("data:image/png;base64,samplebg")')
    const asset = await getThemeAsset('custom_bg_dark')
    expect(asset).toBe('url("data:image/png;base64,samplebg")')

    await deleteThemeAsset('custom_bg_dark')
    const deleted = await getThemeAsset('custom_bg_dark')
    expect(deleted).toBeNull()
  })

  it('deletes oldest photos from db when requested', async () => {
    await addPhotoToDb({ url: 'photo1', createdAt: 1000 })
    await addPhotoToDb({ url: 'photo2', createdAt: 2000 })
    await addPhotoToDb({ url: 'photo3', createdAt: 3000 })

    const deletedCount = await deleteOldestPhotos(2)
    expect(deletedCount).toBe(2)

    const remaining = await getAllPhotos()
    expect(remaining.length).toBe(1)
    expect(remaining[0].url).toBe('photo3')
  })

  it('adds photo with retry support', async () => {
    const id = await addPhotoToDbWithRetry({ url: 'photo_retry', createdAt: 4000 })
    expect(typeof id).toBe('number')
    const retrieved = await getPhotoById(id)
    expect(retrieved?.url).toBe('photo_retry')
  })
})
