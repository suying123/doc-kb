<script setup lang="ts">
import { computed } from 'vue'
import type { DocStatus } from '@/types'

const props = defineProps<{
  status: DocStatus
  progress?: number
  showProgress?: boolean
}>()

const labels: Record<DocStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  ready: '已完成',
  failed: '处理失败',
}

const label = computed(() => labels[props.status])

const progressValue = computed(() => Math.min(100, Math.max(0, props.progress ?? 0)))
</script>

<template>
  <div class="doc-status">
    <span class="badge" :class="status">{{ label }}</span>
    <div v-if="showProgress && status === 'processing'" class="progress">
      <div class="progress-bar" :style="{ width: `${progressValue}%` }" />
      <span class="progress-text">{{ progressValue }}%</span>
    </div>
  </div>
</template>

<style scoped>
.doc-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.badge.pending {
  background: #eef1f5;
  color: #5c6570;
}

.badge.processing {
  background: #e8f0ff;
  color: var(--primary);
}

.badge.ready {
  background: #e6f7f1;
  color: var(--success);
}

.badge.failed {
  background: #fdf2f2;
  color: var(--danger);
}

.progress {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
}

.progress-bar {
  height: 4px;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  width: 32px;
}
</style>
