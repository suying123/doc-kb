import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from './usePermission'
import type { Role } from '@/types'

function loginAs(role: Role) {
  const auth = useAuthStore()
  auth.token = 'test-token'
  auth.user = { id: 'u-test', name: '测试', email: 'test@demo.com', role }
}

describe('usePermission', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('allows admin to edit and delete', () => {
    loginAs('admin')
    const { canEdit, canDelete, can } = usePermission()

    expect(canEdit.value).toBe(true)
    expect(canDelete.value).toBe(true)
    expect(can(['admin', 'editor'])).toBe(true)
  })

  it('allows editor to edit but not delete', () => {
    loginAs('editor')
    const { canEdit, canDelete, can } = usePermission()

    expect(canEdit.value).toBe(true)
    expect(canDelete.value).toBe(false)
    expect(can(['admin'])).toBe(false)
  })

  it('denies viewer all write permissions', () => {
    loginAs('viewer')
    const { canEdit, canDelete } = usePermission()

    expect(canEdit.value).toBe(false)
    expect(canDelete.value).toBe(false)
  })

  it('denies everything when not logged in', () => {
    const { canEdit, canDelete, can } = usePermission()

    expect(canEdit.value).toBe(false)
    expect(canDelete.value).toBe(false)
    expect(can(['admin', 'editor', 'viewer'])).toBe(false)
  })
})
