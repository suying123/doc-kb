import { request } from './http'
import type { Doc, DocListQuery, DocPayload, PageResult } from '@/types'

export function listDocs(query: DocListQuery) {
  const params = new URLSearchParams()
  params.set('page', String(query.page))
  params.set('pageSize', String(query.pageSize))
  if (query.keyword) params.set('keyword', query.keyword)
  if (query.status) params.set('status', query.status)
  if (query.sort) params.set('sort', query.sort)
  if (query.order) params.set('order', query.order)

  return request<PageResult<Doc>>(`/api/docs?${params.toString()}`)
}

export function getDoc(id: string) {
  return request<Doc>(`/api/docs/${id}`)
}

export function createDoc(payload: DocPayload) {
  return request<Doc>('/api/docs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateDoc(id: string, payload: Partial<DocPayload>) {
  return request<Doc>(`/api/docs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteDoc(id: string) {
  return request<null>(`/api/docs/${id}`, { method: 'DELETE' })
}

export function processDoc(id: string) {
  return request<Doc>(`/api/docs/${id}/process`, { method: 'POST' })
}
