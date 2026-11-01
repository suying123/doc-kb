import type { Doc, DocStatus, User } from '@/types'

export const users: User[] = [
  { id: 'u1', name: '张三', email: 'admin@demo.com', role: 'admin' },
  { id: 'u2', name: '李四', email: 'editor@demo.com', role: 'editor' },
  { id: 'u3', name: '王五', email: 'viewer@demo.com', role: 'viewer' },
]

const statuses: DocStatus[] = ['pending', 'processing', 'ready', 'failed']

function makeDocs(count: number): Doc[] {
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length]!
    const createdAt = new Date(Date.now() - i * 86400000).toISOString()
    return {
      id: `d${i + 1}`,
      title: `产品需求文档 v${i + 1}`,
      fileName: `prd-${i + 1}.pdf`,
      fileSize: 1024 * (50 + i * 37),
      status,
      progress: status === 'ready' ? 100 : status === 'failed' ? 42 : 0,
      tags: i % 3 === 0 ? ['产品', '需求'] : i % 3 === 1 ? ['技术'] : [],
      ownerId: 'u1',
      ownerName: '张三',
      createdAt,
      updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      errorMessage: status === 'failed' ? '文件格式不支持' : undefined,
    }
  })
}

export const docs: Doc[] = makeDocs(43)
