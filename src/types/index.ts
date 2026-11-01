export type Role = 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}

export type DocStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface Doc {
  id: string
  title: string
  fileName: string
  fileSize: number
  status: DocStatus
  progress: number
  tags: string[]
  ownerId: string
  ownerName: string
  createdAt: string
  updatedAt: string
  errorMessage?: string
}

export type DocSort = 'createdAt' | 'title' | 'fileSize'
export type SortOrder = 'asc' | 'desc'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface LoginResult {
  token: string
  user: User
}

export interface DocListQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: DocStatus | ''
  sort?: DocSort
  order?: SortOrder
}

export interface DocFilter {
  keyword: string
  status: DocStatus | ''
  sort: DocSort
  order: SortOrder
}

export interface DocPayload {
  title: string
  fileName: string
  fileSize: number
  tags: string[]
}
