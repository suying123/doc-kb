import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types'

export function usePermission() {
  const auth = useAuthStore()

  function can(roles: Role[]) {
    return !!auth.user && roles.includes(auth.user.role)
  }

  const canEdit = computed(() => can(['admin', 'editor']))
  const canDelete = computed(() => can(['admin']))

  return { can, canEdit, canDelete }
}
