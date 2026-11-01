<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DocStatus from '@/components/DocStatus.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'
import DocForm from '@/components/DocForm.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { deleteDoc, getDoc, processDoc } from '@/api/documents'
import { usePolling } from '@/composables/usePolling'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { formatDate, formatFileSize } from '@/utils/format'
import type { Doc } from '@/types'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const { canEdit, canDelete } = usePermission()

const doc = ref<Doc | null>(null)
const loading = ref(true)
const error = ref('')
const starting = ref(false)
const showForm = ref(false)
const showDelete = ref(false)
const deleting = ref(false)

const docId = computed(() => String(route.params.id))

const { start: startPolling, stop: stopPolling } = usePolling(async () => {
  const next = await getDoc(docId.value)
  const finished = next.status !== 'processing'
  doc.value = next
  if (finished && next.status === 'ready') {
    toast.success('文档解析完成')
  }
  return finished
}, 1500)

const statusHint = computed(() => {
  switch (doc.value?.status) {
    case 'pending':
      return '文档尚未解析，点击「开始解析」将其加入处理队列。'
    case 'processing':
      return '正在解析文档，进度会自动刷新，无需手动操作。'
    case 'ready':
      return '解析完成，文档内容已可被检索。'
    case 'failed':
      return doc.value.errorMessage ?? '解析失败，请重试或检查文件格式。'
    default:
      return ''
  }
})

const processLabel = computed(() => {
  switch (doc.value?.status) {
    case 'ready':
      return '重新解析'
    case 'failed':
      return '重试解析'
    default:
      return '开始解析'
  }
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getDoc(docId.value)
    doc.value = data
    if (data.status === 'processing') {
      startPolling()
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function startProcess() {
  if (!doc.value || starting.value) return
  starting.value = true
  try {
    doc.value = await processDoc(doc.value.id)
    toast.success('已加入解析队列')
    startPolling()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败')
  } finally {
    starting.value = false
  }
}

function openEdit() {
  showForm.value = true
}

function onSaved(saved: Doc) {
  doc.value = saved
}

async function confirmDelete() {
  if (!doc.value || deleting.value) return
  deleting.value = true
  try {
    await deleteDoc(doc.value.id)
    toast.success('文档已删除')
    stopPolling()
    await router.push({ name: 'docs' })
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    deleting.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    stopPolling()
    void load()
  },
)

onMounted(() => {
  void load()
})
</script>

<template>
  <div>
    <div class="page-header">
      <div class="row">
        <button class="back" @click="router.push({ name: 'docs' })">← 返回列表</button>
      </div>
      <div v-if="doc" class="row">
        <button v-if="canEdit" @click="openEdit">编辑</button>
        <button v-if="canDelete" class="danger" @click="showDelete = true">删除</button>
        <button
          v-if="canEdit && doc.status !== 'processing'"
          class="primary"
          :disabled="starting"
          @click="startProcess"
        >
          {{ starting ? '提交中…' : processLabel }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="card state muted">加载中…</div>
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <EmptyState
      v-else-if="!doc"
      title="文档不存在"
      description="它可能已被删除。"
      action-text="返回列表"
      @action="router.push({ name: 'docs' })"
    />

    <template v-else>
      <div class="card detail">
        <div class="detail-head">
          <div>
            <h2>{{ doc.title }}</h2>
            <div class="muted file">{{ doc.fileName }} · {{ formatFileSize(doc.fileSize) }}</div>
          </div>
          <DocStatus :status="doc.status" :progress="doc.progress" show-progress />
        </div>

        <p class="hint" :class="doc.status">{{ statusHint }}</p>

        <dl class="meta">
          <div>
            <dt>所有者</dt>
            <dd>{{ doc.ownerName }}</dd>
          </div>
          <div>
            <dt>创建时间</dt>
            <dd>{{ formatDate(doc.createdAt) }}</dd>
          </div>
          <div>
            <dt>更新时间</dt>
            <dd>{{ formatDate(doc.updatedAt) }}</dd>
          </div>
          <div>
            <dt>文档 ID</dt>
            <dd>{{ doc.id }}</dd>
          </div>
        </dl>

        <div class="tags">
          <span class="muted">标签：</span>
          <template v-if="doc.tags.length">
            <span v-for="tag in doc.tags" :key="tag" class="tag">{{ tag }}</span>
          </template>
          <span v-else class="muted">暂无标签</span>
        </div>
      </div>

      <div v-if="doc.status === 'processing'" class="card progress-card">
        <div class="progress-label">
          <span>解析进度</span>
          <strong>{{ Math.min(100, Math.max(0, doc.progress)) }}%</strong>
        </div>
        <div class="bar">
          <div
            class="bar-inner"
            :style="{ width: `${Math.min(100, Math.max(0, doc.progress))}%` }"
          />
        </div>
        <p class="muted small">轮询间隔 1.5s，解析完成后自动停止。</p>
      </div>
    </template>

    <DocForm v-model:visible="showForm" :doc="doc" @saved="onSaved" />

    <ModalDialog
      v-model:visible="showDelete"
      title="删除文档"
      confirm-text="删除"
      danger
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <p class="confirm-text">确定要删除「{{ doc?.title }}」吗？此操作不可撤销。</p>
    </ModalDialog>
  </div>
</template>

<style scoped>
.back {
  border: none;
  background: transparent;
  padding: 4px 0;
  color: var(--text-secondary);
}

.back:hover {
  background: transparent;
  color: var(--text);
}

.state {
  padding: 48px;
  text-align: center;
}

.detail {
  padding: 24px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail-head h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.file {
  font-size: 13px;
}

.hint {
  margin: 18px 0;
  padding: 10px 14px;
  border-radius: 6px;
  background: #f2f4f7;
  font-size: 13px;
}

.hint.processing {
  background: #e8f0ff;
  color: var(--primary);
}

.hint.ready {
  background: #e6f7f1;
  color: var(--success);
}

.hint.failed {
  background: #fdf2f2;
  color: var(--danger);
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 0 0 18px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
}

.meta dt {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.meta dd {
  margin: 0;
  font-size: 14px;
}

.tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.tag {
  padding: 2px 10px;
  border-radius: 999px;
  background: #eef1f5;
  color: var(--text-secondary);
  font-size: 12px;
}

.progress-card {
  margin-top: 16px;
  padding: 20px 24px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.bar {
  height: 8px;
  border-radius: 4px;
  background: #eef1f5;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  background: var(--primary);
  transition: width 0.4s ease;
}

.small {
  font-size: 12px;
  margin: 10px 0 0;
}

.confirm-text {
  margin: 0;
  line-height: 1.7;
}
</style>
