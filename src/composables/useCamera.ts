import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { i18n } from '@/i18n'

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

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer()
  }
  if (typeof Response !== 'undefined') {
    return new Response(blob).arrayBuffer()
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}

// Combine a JPEG and an MP4 into a single file that Google Photos
// recognises as a Motion Photo (MicroVideo v1 format).
export async function createMotionPhoto(jpegDataUrl: string, mp4Blob: Blob): Promise<Blob> {
  const [jpegBuf, videoBuf] = await Promise.all([
    fetch(jpegDataUrl).then(r => r.arrayBuffer()),
    blobToArrayBuffer(mp4Blob),
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

function getCandidateMimeTypes(stream: MediaStream): string[] {
  const hasAudio = stream.getAudioTracks().length > 0
  const hasVideo = stream.getVideoTracks().length > 0

  if (hasVideo && hasAudio) {
    return [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ]
  } else if (hasVideo) {
    return [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ]
  } else if (hasAudio) {
    return [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/webm',
    ]
  }
  return []
}

const supportedMimeCache = new Map<string, string>()

function getSupportedVideoMime(stream: MediaStream | null): string {
  if (typeof MediaRecorder === 'undefined' || !stream) return ''
  const hasAudio = stream.getAudioTracks().length > 0
  const hasVideo = stream.getVideoTracks().length > 0
  const key = `${hasVideo}-${hasAudio}`

  if (supportedMimeCache.has(key)) {
    return supportedMimeCache.get(key)!
  }

  const types = getCandidateMimeTypes(stream)
  for (const mime of types) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) {
        supportedMimeCache.set(key, mime)
        return mime
      }
    } catch {
      // ignore
    }
  }
  supportedMimeCache.set(key, '')
  return ''
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

  const devices = ref<MediaDeviceInfo[]>([])
  const selectedDeviceId = ref<string>('')

  async function enumerateDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      devices.value = allDevices.filter(d => d.kind === 'videoinput')
    } catch (err) {
      console.error('Error enumerating devices:', err)
    }
  }

  async function startCamera() {
    error.value = null
    isCameraReady.value = false
    stopCamera()

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = i18n.global.t('booth.errors.unsupported')
      return
    }

    try {
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }

      if (selectedDeviceId.value) {
        videoConstraints.deviceId = { exact: selectedDeviceId.value }
      } else {
        videoConstraints.facingMode = facingMode.value
      }

      try {
        stream.value = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true,
        })
      } catch (audioErr) {
        console.warn('Audio capture failed or was denied, falling back to video only:', audioErr)
        stream.value = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        })
      }

      const video = videoRef.value
      if (!video) return

      video.srcObject = stream.value
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve()
      })
      await video.play()
      isCameraReady.value = true

      // Fetch the full device list (with labels, now that permission is granted)
      await enumerateDevices()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        error.value = i18n.global.t('booth.errors.denied')
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        error.value = i18n.global.t('booth.errors.notFound')
      } else {
        error.value = i18n.global.t('booth.errors.generic')
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
    selectedDeviceId.value = '' // Clear selected device to toggle front/back
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    await startCamera()
  }

  async function updateDeviceId(id: string) {
    selectedDeviceId.value = id
    await startCamera()
  }

  function capturePhoto(
    format: 'jpeg' | 'png' = 'jpeg',
    quality = 0.92,
    mirror = false,
    targetAspect: number | null = 3 / 4,
  ): string {
    const video = videoRef.value!
    const canvas = canvasRef.value!
    const videoW = video.videoWidth || 1920
    const videoH = video.videoHeight || 1080

    let cropX = 0
    let cropY = 0
    let cropW = videoW
    let cropH = videoH

    if (targetAspect && targetAspect > 0) {
      const currentAspect = videoW / videoH
      if (currentAspect > targetAspect) {
        cropH = videoH
        cropW = Math.round(videoH * targetAspect)
        cropX = Math.round((videoW - cropW) / 2)
        cropY = 0
      } else {
        cropW = videoW
        cropH = Math.round(videoW / targetAspect)
        cropX = 0
        cropY = Math.round((videoH - cropH) / 2)
      }
    }

    canvas.width = cropW
    canvas.height = cropH
    const ctx = canvas.getContext('2d')!
    if (mirror) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
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
    recordingChunks.length = 0
    try {
      const mime = getSupportedVideoMime(stream.value)
      const options = mime ? { mimeType: mime } : undefined
      const rec = new MediaRecorder(stream.value, options)
      rec.ondataavailable = (e) => { if (e.data.size > 0) recordingChunks.push(e.data) }
      rec.start(250)
      mediaRecorder.value = rec
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err)
      mediaRecorder.value = null
    }
  }

  function stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const rec = mediaRecorder.value
      if (!rec || rec.state === 'inactive') { resolve(null); return }
      
      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(null)
        }
      }, 2500)

      rec.onstop = () => {
        if (resolved) return
        resolved = true
        clearTimeout(timeout)
        const blob = recordingChunks.length ? new Blob(recordingChunks, { type: rec.mimeType }) : null
        recordingChunks.length = 0
        mediaRecorder.value = null
        resolve(blob)
      }
      try {
        try { rec.requestData() } catch { /* ignore */ }
        rec.stop()
      } catch { 
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          resolve(null)
        }
      }
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
    devices,
    selectedDeviceId,
    startCamera,
    stopCamera,
    flipCamera,
    updateDeviceId,
    enumerateDevices,
    capturePhoto,
    downloadPhoto,
    savePhoto,
    startRecording,
    stopRecording,
  }
}
