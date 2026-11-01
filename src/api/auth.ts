import { request } from './http'
import type { LoginResult } from '@/types'

export function login(email: string, password: string) {
  return request<LoginResult>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
