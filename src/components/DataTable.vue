<script setup lang="ts">
import { computed } from 'vue'
import type { Doc, DocSort, SortOrder } from '@/types'
import DocStatus from '@/components/DocStatus.vue'
import { formatDate, formatFileSize } from '@/utils/format'

const props = defineProps<{
  rows: Doc[]
  selectedIds: Set<string>
  sort: DocSort
  order: SortOrder
}>()

const emit = defineEmits<{
  select: [id: string, checked: boolean]
  selectAll: [checked: boolean]
  sort: [field: DocSort]
  open: [doc: Doc]
}>()

const sortableColumns: { key: DocSort; label: string }[] = [
  { key: 'title', label: '文档' },
  { key: 'fileSize', label: '大小' },
  { key: 'createdAt', label: '创建时间' },
]

const allChecked = computed(
  () => props.rows.length > 0 && props.rows.every((row) => props.selectedIds.has(row.id)),
)
const someChecked = computed(
  () => props.rows.some((row) => props.selectedIds.has(row.id)) && !allChecked.value,
)

function arrow(field: DocSort) {
  if (props.sort !== field) return ''
  return props.order === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="col-check">
            <input
              type="checkbox"
              :checked="allChecked"
              :indeterminate="someChecked"
              @change="emit('selectAll', ($event.target as HTMLInputElement).checked)"
            />
          </th>
          <th v-for="col in sortableColumns" :key="col.key">
            <button class="sort-btn" @click="emit('sort', col.key)">
              {{ col.label }}
              <span class="arrow">{{ arrow(col.key) }}</span>
            </button>
          </th>
          <th>状态</th>
          <th>所有者</th>
          <th class="col-actions">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in rows" :key="doc.id" class="row" @click="emit('open', doc)">
          <td class="col-check" @click.stop>
            <input
              type="checkbox"
              :checked="selectedIds.has(doc.id)"
              @change="emit('select', doc.id, ($event.target as HTMLInputElement).checked)"
            />
          </td>
          <td>
            <div class="doc-title">{{ doc.title }}</div>
            <div class="doc-file">{{ doc.fileName }}</div>
          </td>
          <td>{{ formatFileSize(doc.fileSize) }}</td>
          <td>{{ formatDate(doc.createdAt) }}</td>
          <td>
            <DocStatus :status="doc.status" :progress="doc.progress" show-progress />
          </td>
          <td>{{ doc.ownerName }}</td>
          <td class="col-actions" @click.stop>
            <button class="link-btn" @click="emit('open', doc)">查看</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

th {
  background: #fafbfc;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 13px;
}

tbody tr {
  cursor: pointer;
  transition: background 0.12s;
}

tbody tr:hover {
  background: #fafbfc;
}

.col-check {
  width: 44px;
  padding-right: 0;
}

.col-actions {
  width: 80px;
  text-align: right;
}

.sort-btn {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sort-btn:hover {
  background: transparent;
  color: var(--text);
}

.arrow {
  font-size: 12px;
  color: var(--primary);
}

.doc-title {
  font-weight: 500;
  color: var(--text);
}

.doc-file {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.link-btn {
  border: none;
  background: transparent;
  color: var(--primary);
  padding: 2px 6px;
  font-size: 13px;
}

.link-btn:hover {
  background: #eaf1ff;
}
</style>
