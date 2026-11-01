import { ref, computed, type Ref } from 'vue'

type Paginated<Q> = Q & { page: number; pageSize: number }

interface UseTableOptions<T, Q> {
  fetcher: (query: Paginated<Q>) => Promise<{ items: T[]; total: number }>
  initialQuery: Q
  pageSize?: number
}

export function useTable<T, Q extends object>(options: UseTableOptions<T, Q>) {
  const { fetcher, initialQuery, pageSize = 10 } = options

  const list = ref([]) as Ref<T[]>
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const query = ref({ ...initialQuery }) as Ref<Q>

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
  const isEmpty = computed(() => !loading.value && !error.value && list.value.length === 0)

  let requestId = 0

  async function load() {
    const current = ++requestId
    loading.value = true
    error.value = null
    try {
      const res = await fetcher({ ...query.value, page: page.value, pageSize } as Paginated<Q>)
      if (current !== requestId) return
      list.value = res.items
      total.value = res.total
    } catch (e) {
      if (current !== requestId) return
      error.value = e instanceof Error ? e.message : '加载失败'
      list.value = []
      total.value = 0
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  function search() {
    page.value = 1
    void load()
  }

  function reset() {
    query.value = { ...initialQuery }
    page.value = 1
    void load()
  }

  function setPage(p: number) {
    if (p < 1 || p > totalPages.value) return
    page.value = p
    void load()
  }

  return {
    list,
    total,
    page,
    pageSize,
    loading,
    error,
    query,
    totalPages,
    isEmpty,
    load,
    search,
    reset,
    setPage,
  }
}
