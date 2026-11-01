import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types'

const vPermission: Directive<HTMLElement, Role[]> = {
  mounted(el, binding) {
    const auth = useAuthStore()
    if (!auth.user || !binding.value.includes(auth.user.role)) {
      el.parentNode?.removeChild(el)
    }
  },
}

export default vPermission
