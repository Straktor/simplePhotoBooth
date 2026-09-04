import { createMotionPhoto } from '@/composables/useCamera'
import { getPhotoById } from '@/utils/db'
import type { PhotoEntry } from '@/composables/useSettings'

export async function preparePhotoFiles(photo: PhotoEntry, baseTimestamp = Date.now(), indexSuffix = ''): Promise<File[]> {
  const ts = baseTimestamp
  const suffix = indexSuffix ? `-${indexSuffix}` : ''
  let videoBlob: Blob | null = null

  if (photo.id && (photo.hasVideo || photo.motion)) {
    try {
      const dbEntry = await getPhotoById(photo.id)
      if (dbEntry?.videoBlob) {
        videoBlob = dbEntry.videoBlob
      }
    } catch (e) {
      console.error('Failed to load videoBlob from db', e)
    }
  }

  if (videoBlob) {
    if (videoBlob.type.includes('mp4')) {
      const motionBlob = await createMotionPhoto(photo.url, videoBlob)
      return [new File([motionBlob], `photo-${ts}${suffix}.jpg`, { type: 'image/jpeg' })]
    } else {
      const imgBlob = await fetch(photo.url).then(r => r.blob())
      const ext = videoBlob.type.includes('webm') ? 'webm' : 'mp4'
      return [
        new File([imgBlob], `photo-${ts}${suffix}.jpg`, { type: 'image/jpeg' }),
        new File([videoBlob], `photo-${ts}${suffix}.${ext}`, { type: videoBlob.type || 'video/webm' }),
      ]
    }
  }

  const imgBlob = await fetch(photo.url).then(r => r.blob())
  return [new File([imgBlob], `photo-${ts}${suffix}.jpg`, { type: 'image/jpeg' })]
}

export async function shareOrDownloadFiles(files: File[]): Promise<void> {
  if (files.length === 0) return

  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files })
      return
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      // fallback to downloading on share failure
    }
  }

  files.forEach((file, i) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000 * (i + 1))
  })
}

export async function exportPhoto(photo: PhotoEntry): Promise<void> {
  const files = await preparePhotoFiles(photo)
  await shareOrDownloadFiles(files)
}

export async function exportPhotos(photos: PhotoEntry[]): Promise<void> {
  const ts = Date.now()
  const allFiles: File[] = []
  for (let i = 0; i < photos.length; i++) {
    const files = await preparePhotoFiles(photos[i], ts, `${i + 1}`)
    allFiles.push(...files)
  }
  await shareOrDownloadFiles(allFiles)
}
