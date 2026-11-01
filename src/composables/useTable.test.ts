import { describe, expect, it, vi } from 'vitest'
import { useTable } from './useTable'

interface Row {
  id: number
}

type Query = { keyword: string }

function createTable(
  fetcher: (query: Query & { page: number }) => Promise<{ items: Row[]; total: number }>,
) {
  return useTable<Row, Query>({
    fetcher,
    initialQuery: { keyword: '' },
    pageSize: 1,
  })
}

describe('useTable', () => {
  it('loads the first page and computes pagination state', async () => {
    const fetcher = vi.fn(async (query: Query & { page: number }) => ({
      items: [{ id: query.page }],
      total: 3,
    }))
    const table = createTable(fetcher)

    await table.load()

    expect(fetcher).toHaveBeenCalledWith({ keyword: '', page: 1, pageSize: 1 })
    expect(table.list.value).toEqual([{ id: 1 }])
    expect(table.total.value).toBe(3)
    expect(table.totalPages.value).toBe(3)
    expect(table.loading.value).toBe(false)
  })

  it('resets to page 1 when searching', async () => {
    const fetcher = vi.fn(async (query: Query & { page: number }) => ({
      items: [{ id: query.page }],
      total: 3,
    }))
    const table = createTable(fetcher)

    await table.load()
    table.setPage(2)
    await vi.waitFor(() => {
      expect(table.page.value).toBe(2)
      expect(fetcher).toHaveBeenLastCalledWith({ keyword: '', page: 2, pageSize: 1 })
    })

    table.query.value.keyword = 'vue'
    await table.search()

    expect(table.page.value).toBe(1)
    expect(fetcher).toHaveBeenLastCalledWith({ keyword: 'vue', page: 1, pageSize: 1 })
  })

  it('ignores stale responses (race protection)', async () => {
    const resolvers: Array<(value: { items: Row[]; total: number }) => void> = []
    const fetcher = vi.fn(
      () =>
        new Promise<{ items: Row[]; total: number }>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const table = createTable(fetcher)

    const first = table.load()
    const second = table.load()

    resolvers[1]?.({ items: [{ id: 2 }], total: 1 })
    await second
    expect(table.list.value).toEqual([{ id: 2 }])

    // 慢请求后返回，不能覆盖第二次的结果
    resolvers[0]?.({ items: [{ id: 1 }], total: 99 })
    await first

    expect(table.list.value).toEqual([{ id: 2 }])
    expect(table.total.value).toBe(1)
    expect(table.loading.value).toBe(false)
  })

  it('stores the error message and clears the list on failure', async () => {
    const table = createTable(vi.fn().mockRejectedValue(new Error('网络异常')))

    await table.load()

    expect(table.error.value).toBe('网络异常')
    expect(table.list.value).toEqual([])
    expect(table.total.value).toBe(0)
    expect(table.loading.value).toBe(false)
  })
})
