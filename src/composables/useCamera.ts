import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useCamera(
  videoRef: Ref<HTMLVideoElement | null>,
  canvasRef: Ref<HTMLCanvasElement | null>,
) {
  const stream = ref<MediaStream | null>(null)
  const isCameraReady = ref(false)
  const error = ref<string | null>(null)
  const lastPhoto = ref<string | null>(null)
  const facingMode = ref<'user' | 'environment'>('user')

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

  onUnmounted(stopCamera)

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
  }
}
