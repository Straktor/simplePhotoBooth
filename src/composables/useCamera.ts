import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

// Inject an XMP APP1 segment immediately after the JPEG SOI marker
function injectXmp(jpeg: Uint8Array, xmpStr: string): Uint8Array {
  const ns = 'http://ns.adobe.com/xap/1.0/\0'
  const payload = new TextEncoder().encode(ns + xmpStr)
  const segLen = 2 + payload.length       // JPEG length field includes its own 2 bytes
  const app1  = new Uint8Array(4 + payload.length)
  app1[0] = 0xFF; app1[1] = 0xE1         // APP1 marker
  app1[2] = (segLen >> 8) & 0xFF
  app1[3] =  segLen       & 0xFF
  app1.set(payload, 4)
  const out = new Uint8Array(jpeg.length + app1.length)
  out.set(jpeg.slice(0, 2))              // SOI (FF D8)
  out.set(app1, 2)
  out.set(jpeg.slice(2), 2 + app1.length)
  return out
}

// Combine a JPEG and an MP4 into a single file that Google Photos
// recognises as a Motion Photo (MicroVideo v1 format).
export async function createMotionPhoto(jpegDataUrl: string, mp4Blob: Blob): Promise<Blob> {
  const [jpegBuf, videoBuf] = await Promise.all([
    fetch(jpegDataUrl).then(r => r.arrayBuffer()),
    mp4Blob.arrayBuffer(),
  ])
  const jpeg  = new Uint8Array(jpegBuf)
  const video = new Uint8Array(videoBuf)

  const xmp = [
    `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>`,
    `<x:xmpmeta xmlns:x="adobe:ns:meta/">`,
    `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">`,
    `<rdf:Description rdf:about=""`,
    ` xmlns:Camera="http://ns.google.com/photos/1.0/camera/"`,
    ` Camera:MotionPhoto="1"`,
    ` Camera:MotionPhotoVersion="1"`,
    ` Camera:MotionPhotoPresentationTimestampUs="-1"`,
    ` Camera:MicroVideo="1"`,
    ` Camera:MicroVideoVersion="1"`,
    ` Camera:MicroVideoOffset="${video.length}"`,
    ` Camera:MicroVideoPresentationTimestampUs="-1"`,
    `/>`,
    `</rdf:RDF></x:xmpmeta>`,
    `<?xpacket end="w"?>`,
  ].join('')

  const jpegWithXmp = injectXmp(jpeg, xmp)
  const combined = new Uint8Array(jpegWithXmp.length + video.length)
  combined.set(jpegWithXmp, 0)
  combined.set(video, jpegWithXmp.length)
  return new Blob([combined], { type: 'image/jpeg' })
}

function getSupportedVideoMime(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const types = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]
  return types.find(t => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } }) ?? ''
}

export function useCamera(
  videoRef: Ref<HTMLVideoElement | null>,
  canvasRef: Ref<HTMLCanvasElement | null>,
) {
  const stream = ref<MediaStream | null>(null)
  const isCameraReady = ref(false)
  const error = ref<string | null>(null)
  const lastPhoto = ref<string | null>(null)
  const facingMode = ref<'user' | 'environment'>('user')
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const recordingChunks: Blob[] = []

  async function startCamera() {
    error.value = null
    isCameraReady.value = false
    stopCamera()

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'Camera not supported on this device or requires HTTPS.'
      return
    }

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode.value, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })

      const video = videoRef.value
      if (!video) return

      video.srcObject = stream.value
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve()
      })
      await video.play()
      isCameraReady.value = true
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        error.value = 'Camera permission denied. Please allow camera access and try again.'
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        error.value = 'No camera found on this device.'
      } else {
        error.value = 'Could not access camera.'
      }
    }
  }

  function stopCamera() {
    stream.value?.getTracks().forEach((t) => t.stop())
    stream.value = null
    isCameraReady.value = false
    if (videoRef.value) videoRef.value.srcObject = null
  }

  async function flipCamera() {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    await startCamera()
  }

  function capturePhoto(format: 'jpeg' | 'png', quality: number, mirror: boolean): string {
    const video = videoRef.value!
    const canvas = canvasRef.value!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    if (mirror) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL(`image/${format}`, quality)
    lastPhoto.value = dataUrl
    return dataUrl
  }

  function downloadPhoto(filename?: string) {
    if (!lastPhoto.value) return
    const ext = lastPhoto.value.includes('image/png') ? 'png' : 'jpg'
    const name = filename ?? `photobooth-${Date.now()}.${ext}`
    const a = document.createElement('a')
    a.href = lastPhoto.value
    a.download = name
    a.click()
  }

  async function savePhoto(dataUrl: string): Promise<void> {
    const filename = `photobooth-${Date.now()}.jpg`
    if (navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], filename, { type: 'image/jpeg' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] })
          return
        }
      } catch {
        // user cancelled or API unsupported — fall through
      }
    }
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }

  function startRecording() {
    if (!stream.value) return
    const mimeType = getSupportedVideoMime()
    if (!mimeType) return
    recordingChunks.length = 0
    try {
      const rec = new MediaRecorder(stream.value, { mimeType })
      rec.ondataavailable = (e) => { if (e.data.size > 0) recordingChunks.push(e.data) }
      rec.start(100)
      mediaRecorder.value = rec
    } catch {
      mediaRecorder.value = null
    }
  }

  function stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const rec = mediaRecorder.value
      if (!rec || rec.state === 'inactive') { resolve(null); return }
      rec.onstop = () => {
        const blob = recordingChunks.length ? new Blob(recordingChunks, { type: rec.mimeType }) : null
        recordingChunks.length = 0
        mediaRecorder.value = null
        resolve(blob)
      }
      try { rec.stop() } catch { resolve(null) }
    })
  }

  onUnmounted(() => {
    if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
      try { mediaRecorder.value.stop() } catch { /* ignore */ }
    }
    stopCamera()
  })

  return {
    stream,
    isCameraReady,
    error,
    lastPhoto,
    facingMode,
    startCamera,
    stopCamera,
    flipCamera,
    capturePhoto,
    downloadPhoto,
    savePhoto,
    startRecording,
    stopRecording,
  }
}
