import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  addPhotoToDb,
  getAllPhotos,
  getPhotoById,
  deletePhotoFromDb,
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
})
