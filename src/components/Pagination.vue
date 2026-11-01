<script setup lang="ts">
import { computed } from 'vue'

const page = defineModel<number>('page', { required: true })

const props = withDefaults(
  defineProps<{
    total: number
    totalPages: number
    pageSize?: number
  }>(),
  { pageSize: 10 },
)

const pages = computed(() => {
  const total = props.totalPages
  const current = page.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) result.push('...')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < total - 1) result.push('...')
  result.push(total)

  return result
})

const rangeText = computed(() => {
  if (props.total === 0) return '共 0 条'
  const start = (page.value - 1) * props.pageSize + 1
  const end = Math.min(props.total, page.value * props.pageSize)
  return `第 ${start}-${end} 条，共 ${props.total} 条`
})

function go(target: number) {
  if (target < 1 || target > props.totalPages || target === page.value) return
  page.value = target
}
</script>

<template>
  <div class="pagination">
    <span class="range muted">{{ rangeText }}</span>
    <div class="controls">
      <button :disabled="page <= 1" @click="go(page - 1)">上一页</button>
      <template v-for="(item, index) in pages" :key="`${item}-${index}`">
        <span v-if="item === '...'" class="dots">…</span>
        <button v-else class="page-btn" :class="{ active: item === page }" @click="go(item)">
          {{ item }}
        </button>
      </template>
      <button :disabled="page >= totalPages" @click="go(page + 1)">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  flex-wrap: wrap;
}

.range {
  font-size: 13px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn {
  min-width: 32px;
  padding: 4px 8px;
}

.page-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.page-btn.active:hover {
  background: var(--primary-hover);
}

.dots {
  color: var(--text-secondary);
  padding: 0 2px;
}
</style>
