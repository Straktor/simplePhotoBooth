import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { preparePhotoFiles } from '../utils/exportPhoto'
import { addPhotoToDb, clearAllPhotosFromDb } from '../utils/db'

// Sample minimal JPEG data URL (1x1 pixel)
const SAMPLE_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='

describe('exportPhoto utility', () => {
  beforeEach(async () => {
    await clearAllPhotosFromDb().catch(() => {})
  })

  it('prepares single static JPEG file when no video exists', async () => {
    const photo = {
      url: SAMPLE_JPEG,
      motion: false,
    }
    const files = await preparePhotoFiles(photo, 123456)
    expect(files.length).toBe(1)
    expect(files[0].name).toBe('photo-123456.jpg')
    expect(files[0].type).toBe('image/jpeg')
  })

  it('prepares motion photo when MP4 videoBlob is stored in DB', async () => {
    const videoBlob = new Blob(['fake mp4 video data'], { type: 'video/mp4' })
    const id = await addPhotoToDb({
      url: SAMPLE_JPEG,
      motion: true,
      videoBlob,
    })

    const photo = {
      id,
      url: SAMPLE_JPEG,
      motion: true,
      hasVideo: true,
    }

    const files = await preparePhotoFiles(photo, 123456)
    expect(files.length).toBe(1)
    expect(files[0].name).toBe('photo-123456.jpg')
    expect(files[0].type).toBe('image/jpeg')
    // Size should be larger than original JPEG because video + XMP metadata is appended
    expect(files[0].size).toBeGreaterThan(videoBlob.size)
  })

  it('prepares photo and companion video when WebM videoBlob is stored', async () => {
    const videoBlob = new Blob(['fake webm video data'], { type: 'video/webm' })
    const id = await addPhotoToDb({
      url: SAMPLE_JPEG,
      motion: true,
      videoBlob,
    })

    const photo = {
      id,
      url: SAMPLE_JPEG,
      motion: true,
      hasVideo: true,
    }

    const files = await preparePhotoFiles(photo, 123456, '1')
    expect(files.length).toBe(2)
    expect(files[0].name).toBe('photo-123456-1.jpg')
    expect(files[1].name).toBe('photo-123456-1.webm')
  })
})
