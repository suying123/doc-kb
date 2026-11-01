<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import DocForm from '@/components/DocForm.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { listDocs, deleteDoc } from '@/api/documents'
import { useTable } from '@/composables/useTable'
import { useDebounceFn } from '@/composables/useDebounceFn'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import type { Doc, DocFilter, DocSort, DocStatus } from '@/types'

const router = useRouter()
const toast = useToastStore()
const { canEdit, canDelete } = usePermission()

const {
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
} = useTable<Doc, DocFilter>({
  fetcher: listDocs,
  initialQuery: { keyword: '', status: '', sort: 'createdAt', order: 'desc' },
  pageSize: 10,
})

const statusOptions: { value: DocStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'ready', label: '已完成' },
  { value: 'failed', label: '处理失败' },
]

const selectedIds = ref<Set<string>>(new Set())
const showForm = ref(false)
const editingDoc = ref<Doc | null>(null)
const showDelete = ref(false)
const deleting = ref(false)

const selectedCount = computed(() => selectedIds.value.size)

watch(list, () => {
  selectedIds.value = new Set()
})

const debouncedSearch = useDebounceFn(() => {
  void search()
}, 350)

function onKeywordInput() {
  debouncedSearch()
}

function onStatusChange() {
  void search()
}

function onSort(field: DocSort) {
  if (query.value.sort === field) {
    query.value.order = query.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    query.value.sort = field
    query.value.order = field === 'title' ? 'asc' : 'desc'
  }
  void search()
}

function onSelect(id: string, checked: boolean) {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

function onSelectAll(checked: boolean) {
  selectedIds.value = checked ? new Set(list.value.map((doc) => doc.id)) : new Set()
}

function openCreate() {
  editingDoc.value = null
  showForm.value = true
}

function openDetail(doc: Doc) {
  void router.push({ name: 'doc-detail', params: { id: doc.id } })
}

function onSaved() {
  void load()
}

function askBatchDelete() {
  if (selectedIds.value.size === 0) {
    toast.info('请先选择要删除的文档')
    return
  }
  showDelete.value = true
}

const deleteMessage = computed(
  () => `确定要删除选中的 ${selectedCount.value} 篇文档吗？此操作不可撤销。`,
)

async function confirmDelete() {
  if (deleting.value) return
  deleting.value = true
  try {
    const ids = [...selectedIds.value]
    await Promise.all(ids.map((id) => deleteDoc(id)))
    toast.success(`已删除 ${ids.length} 篇文档`)
    showDelete.value = false
    await load()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h2>文档列表</h2>
        <p class="muted subtitle">共 {{ total }} 篇文档，按状态追踪解析进度</p>
      </div>
      <div class="row">
        <button v-if="canDelete && selectedCount > 0" class="danger" @click="askBatchDelete">
          删除选中（{{ selectedCount }}）
        </button>
        <button v-if="canEdit" class="primary" @click="openCreate">新建文档</button>
      </div>
    </div>

    <div class="card filters">
      <input
        v-model="query.keyword"
        class="search"
        placeholder="搜索标题或文件名…"
        @input="onKeywordInput"
        @keyup.enter="search()"
      />
      <select v-model="query.status" class="status" @change="onStatusChange">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <button @click="reset">重置</button>
    </div>

    <div class="card table-card">
      <div v-if="loading" class="state muted">加载中…</div>
      <ErrorState v-else-if="error" :message="error" @retry="load" />
      <EmptyState v-else-if="isEmpty" @action="reset" />
      <template v-else>
        <DataTable
          :rows="list"
          :selected-ids="selectedIds"
          :sort="query.sort"
          :order="query.order"
          @select="onSelect"
          @select-all="onSelectAll"
          @sort="onSort"
          @open="openDetail"
        />
        <Pagination
          :page="page"
          :total="total"
          :total-pages="totalPages"
          :page-size="pageSize"
          @update:page="setPage"
        />
      </template>
    </div>

    <p class="actions-hint muted">提示：点击行进入详情，编辑与解析在详情页完成。</p>

    <DocForm v-model:visible="showForm" :doc="editingDoc" @saved="onSaved" />

    <ModalDialog
      v-model:visible="showDelete"
      title="删除文档"
      confirm-text="删除"
      danger
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <p class="confirm-text">{{ deleteMessage }}</p>
    </ModalDialog>
  </div>
</template>

<style scoped>
.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
}

.filters {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.search {
  flex: 1;
  max-width: 360px;
}

.status {
  width: 150px;
}

.table-card {
  overflow: hidden;
}

.state {
  padding: 48px;
  text-align: center;
}

.actions-hint {
  margin-top: 14px;
  font-size: 13px;
}

.confirm-text {
  margin: 0;
  line-height: 1.7;
}
</style>
