import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePolling } from './usePolling'

function mountPolling(task: () => Promise<boolean>, interval = 1000) {
  const TestComponent = defineComponent({
    setup() {
      const { start, stop } = usePolling(task, interval)
      return { start, stop }
    },
    template: '<div />',
  })
  return mount(TestComponent)
}

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs immediately, then repeats at the given interval', async () => {
    const task = vi.fn().mockResolvedValue(false)
    const wrapper = mountPolling(task)

    wrapper.vm.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(task).toHaveBeenCalledTimes(2)

    wrapper.vm.stop()
    await vi.advanceTimersByTimeAsync(5000)
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('stops polling when the task reports completion', async () => {
    const task = vi.fn().mockResolvedValue(true)
    const wrapper = mountPolling(task)

    wrapper.vm.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(5000)
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('keeps polling after a single failure', async () => {
    const task = vi.fn().mockRejectedValueOnce(new Error('一次失败')).mockResolvedValue(false)
    const wrapper = mountPolling(task)

    wrapper.vm.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(task).toHaveBeenCalledTimes(2)
  })

  it('cleans up the timer on unmount', async () => {
    const task = vi.fn().mockResolvedValue(false)
    const wrapper = mountPolling(task)

    wrapper.vm.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(5000)
    expect(task).toHaveBeenCalledTimes(1)
  })
})
