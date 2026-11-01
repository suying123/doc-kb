import { onUnmounted } from 'vue'

export function usePolling(task: () => Promise<boolean>, interval = 2000) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let stopped = false

  async function tick() {
    if (stopped) return
    try {
      const done = await task()
      if (done) return
    } catch {
      // 单次请求失败不终止轮询，下一轮继续
    }
    if (!stopped) {
      timer = setTimeout(tick, interval)
    }
  }

  function start() {
    stop()
    stopped = false
    void tick()
  }

  function stop() {
    stopped = true
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(stop)

  return { start, stop }
}
