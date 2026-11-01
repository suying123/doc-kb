import type { ApiResponse } from '@/types'

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public detail?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function onUnauthorized(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

interface RequestOptions extends RequestInit {
  timeout?: number
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 15000, ...init } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const token = localStorage.getItem('doc-kb-token')

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })

    if (res.status === 204) {
      return undefined as T
    }

    const body = (await res.json().catch(() => null)) as {
      code?: number | string
      message?: string
      data?: unknown
    } | null

    if (res.status === 401) {
      // 已登录状态下收到 401 才视为会话过期；登录接口本身的 401 只是账号密码错误
      const isLoginRequest = url.includes('/api/login')
      if (token && !isLoginRequest) {
        unauthorizedHandler?.()
        throw new HttpError(401, 'UNAUTHORIZED', '登录已过期，请重新登录', body)
      }
      throw new HttpError(
        401,
        body?.code != null ? String(body.code) : 'UNAUTHORIZED',
        body?.message ?? '邮箱或密码错误',
        body,
      )
    }

    if (!res.ok) {
      throw new HttpError(
        res.status,
        body?.code != null ? String(body.code) : 'UNKNOWN',
        body?.message ?? res.statusText,
        body,
      )
    }

    if (!body) {
      throw new HttpError(res.status, 'INVALID_RESPONSE', '响应格式错误')
    }

    const json = body as ApiResponse<T>
    if (json.code !== 0) {
      throw new HttpError(res.status, String(json.code), json.message, json)
    }

    return json.data
  } finally {
    clearTimeout(timer)
  }
}
