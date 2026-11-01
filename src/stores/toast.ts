import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])
  let seed = 0

  function push(type: ToastType, message: string) {
    const id = ++seed
    items.value.push({ id, type, message })
    setTimeout(() => {
      items.value = items.value.filter((t) => t.id !== id)
    }, 3000)
  }

  return {
    items,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  }
})
