import { ref, onUnmounted } from 'vue'

export function useCountdown() {
  const count = ref(0)
  const isRunning = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function cancel() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  function start(duration: number): Promise<void> {
    cancel()
    return new Promise((resolve) => {
      count.value = duration
      isRunning.value = true
      intervalId = setInterval(() => {
        count.value--
        if (count.value <= 0) {
          cancel()
          resolve()
        }
      }, 1000)
    })
  }

  onUnmounted(cancel)

  return { count, isRunning, start, cancel }
}
