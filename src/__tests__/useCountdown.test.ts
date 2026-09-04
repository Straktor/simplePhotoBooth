import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from '../composables/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with count 0 and isRunning false', () => {
    const { count, isRunning } = useCountdown()
    expect(count.value).toBe(0)
    expect(isRunning.value).toBe(false)
  })

  it('runs countdown and resolves after duration', async () => {
    const { count, isRunning, start } = useCountdown()
    const promise = start(3)

    expect(count.value).toBe(3)
    expect(isRunning.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(count.value).toBe(2)

    vi.advanceTimersByTime(1000)
    expect(count.value).toBe(1)

    vi.advanceTimersByTime(1000)
    expect(count.value).toBe(0)
    expect(isRunning.value).toBe(false)

    await expect(promise).resolves.toBeUndefined()
  })

  it('cancels countdown on cancel() and rejects promise', async () => {
    const { count, isRunning, start, cancel } = useCountdown()
    const promise = start(5)

    expect(count.value).toBe(5)
    expect(isRunning.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(count.value).toBe(4)

    cancel()
    expect(count.value).toBe(0)
    expect(isRunning.value).toBe(false)

    await expect(promise).rejects.toBeUndefined()
  })
})
