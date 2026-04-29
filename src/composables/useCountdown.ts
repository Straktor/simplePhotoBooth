import { ref, onUnmounted } from 'vue'

export function useCountdown() {
  const count = ref(0)
  const isRunning = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null
  let rejectFn: (() => void) | null = null

  function cancel() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
    count.value = 0
    if (rejectFn) { rejectFn(); rejectFn = null }
  }

  function start(duration: number): Promise<void> {
    cancel()
    return new Promise<void>((resolve, reject) => {
      rejectFn = reject
      count.value = duration
      isRunning.value = true
      intervalId = setInterval(() => {
        count.value--
        if (count.value <= 0) {
          if (intervalId !== null) { clearInterval(intervalId); intervalId = null }
          isRunning.value = false
          rejectFn = null
          resolve()
        }
      }, 1000)
    })
  }

  onUnmounted(cancel)

  return { count, isRunning, start, cancel }
}
