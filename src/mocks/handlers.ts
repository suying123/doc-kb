import { http, HttpResponse, delay } from 'msw'
import { docs, users } from './db'
import type { Doc, DocSort, SortOrder } from '@/types'

function ok<T>(data: T) {
  return HttpResponse.json({ code: 0, message: 'ok', data })
}

function fail(code: number, message: string, status = 400) {
  return HttpResponse.json({ code, message, data: null }, { status })
}

export const handlers = [
  http.post('/api/login', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { email?: string; password?: string }
    const user = users.find((u) => u.email === body.email)
    if (!user || body.password !== '123456') {
      return fail(401, '邮箱或密码错误', 401)
    }
    return ok({ token: `mock-token-${user.id}`, user })
  }),

  http.get('/api/docs', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const keyword = url.searchParams.get('keyword') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const sort = (url.searchParams.get('sort') ?? 'createdAt') as DocSort
    const order = (url.searchParams.get('order') ?? 'desc') as SortOrder

    let filtered = docs.filter((d) => {
      const matchKeyword = !keyword || d.title.includes(keyword) || d.fileName.includes(keyword)
      const matchStatus = !status || d.status === status
      return matchKeyword && matchStatus
    })

    filtered = [...filtered].sort((a, b) => {
      const av = a[sort]
      const bv = b[sort]
      if (typeof av === 'string' && typeof bv === 'string') {
        return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return order === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
    })

    const start = (page - 1) * pageSize
    return ok({
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/docs/:id', async ({ params }) => {
    await delay(200)
    const doc = docs.find((d) => d.id === params.id)
    if (!doc) return fail(404, '文档不存在', 404)

    // 模拟处理进度：每次轮询推进 25%
    if (doc.status === 'processing') {
      doc.progress = Math.min(100, doc.progress + 25)
      if (doc.progress >= 100) {
        doc.status = 'ready'
        doc.progress = 100
      }
    }

    return ok({ ...doc })
  }),

  http.post('/api/docs', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as Partial<Doc>
    const now = new Date().toISOString()
    const doc: Doc = {
      id: `d${Date.now()}`,
      title: body.title ?? '未命名',
      fileName: body.fileName ?? 'untitled.pdf',
      fileSize: body.fileSize ?? 1024,
      status: 'pending',
      progress: 0,
      tags: body.tags ?? [],
      ownerId: 'u1',
      ownerName: '张三',
      createdAt: now,
      updatedAt: now,
    }
    docs.unshift(doc)
    return ok(doc)
  }),

  http.patch('/api/docs/:id', async ({ params, request }) => {
    await delay(300)
    const doc = docs.find((d) => d.id === params.id)
    if (!doc) return fail(404, '文档不存在', 404)
    const body = (await request.json()) as Partial<Doc>
    Object.assign(doc, body, { updatedAt: new Date().toISOString() })
    return ok(doc)
  }),

  http.delete('/api/docs/:id', async ({ params }) => {
    await delay(300)
    const index = docs.findIndex((d) => d.id === params.id)
    if (index === -1) return fail(404, '文档不存在', 404)
    docs.splice(index, 1)
    return ok(null)
  }),

  http.post('/api/docs/:id/process', async ({ params }) => {
    await delay(300)
    const doc = docs.find((d) => d.id === params.id)
    if (!doc) return fail(404, '文档不存在', 404)
    doc.status = 'processing'
    doc.progress = 0
    doc.errorMessage = undefined
    return ok({ ...doc })
  }),
]
