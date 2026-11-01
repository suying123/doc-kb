<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { createDoc, updateDoc } from '@/api/documents'
import { useToastStore } from '@/stores/toast'
import type { Doc, DocPayload } from '@/types'

const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  doc?: Doc | null
}>()

const emit = defineEmits<{ saved: [doc: Doc] }>()

const toast = useToastStore()
const submitting = ref(false)
const errors = reactive<{ title?: string; fileName?: string; fileSize?: string }>({})

const form = reactive({
  title: '',
  fileName: '',
  fileSizeKb: 1024,
  tags: '',
})

const isEdit = () => !!props.doc

function resetForm() {
  const doc = props.doc
  form.title = doc?.title ?? ''
  form.fileName = doc?.fileName ?? ''
  form.fileSizeKb = doc ? Math.max(1, Math.round(doc.fileSize / 1024)) : 1024
  form.tags = doc?.tags.join('，') ?? ''
  errors.title = undefined
  errors.fileName = undefined
  errors.fileSize = undefined
}

watch(
  () => [visible.value, props.doc] as const,
  () => {
    if (visible.value) resetForm()
  },
  { immediate: true },
)

function validate(): boolean {
  errors.title = form.title.trim() ? undefined : '请输入文档标题'
  errors.fileName = form.fileName.trim() ? undefined : '请输入文件名'
  errors.fileSize =
    Number.isFinite(form.fileSizeKb) && form.fileSizeKb > 0 ? undefined : '请输入大于 0 的大小'
  return !errors.title && !errors.fileName && !errors.fileSize
}

async function submit() {
  if (submitting.value) return
  if (!validate()) return

  const payload: DocPayload = {
    title: form.title.trim(),
    fileName: form.fileName.trim(),
    fileSize: Math.round(form.fileSizeKb * 1024),
    tags: form.tags
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
  }

  submitting.value = true
  try {
    const doc = props.doc ? await updateDoc(props.doc.id, payload) : await createDoc(payload)
    toast.success(isEdit() ? '文档已更新' : '文档已创建')
    emit('saved', doc)
    visible.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ModalDialog
    v-model:visible="visible"
    :title="isEdit() ? '编辑文档' : '新建文档'"
    width="520px"
    confirm-text="保存"
    :loading="submitting"
    @confirm="submit"
  >
    <div class="field">
      <label for="doc-title">文档标题</label>
      <input
        id="doc-title"
        v-model="form.title"
        :class="{ error: errors.title }"
        placeholder="例如：产品需求文档"
      />
      <div v-if="errors.title" class="error-text">{{ errors.title }}</div>
    </div>

    <div class="field">
      <label for="doc-file">文件名</label>
      <input
        id="doc-file"
        v-model="form.fileName"
        :class="{ error: errors.fileName }"
        placeholder="例如：prd.pdf"
      />
      <div v-if="errors.fileName" class="error-text">{{ errors.fileName }}</div>
    </div>

    <div class="field">
      <label for="doc-size">文件大小（KB）</label>
      <input
        id="doc-size"
        v-model.number="form.fileSizeKb"
        type="number"
        min="1"
        :class="{ error: errors.fileSize }"
      />
      <div v-if="errors.fileSize" class="error-text">{{ errors.fileSize }}</div>
    </div>

    <div class="field">
      <label for="doc-tags">标签（用逗号分隔）</label>
      <input id="doc-tags" v-model="form.tags" placeholder="产品，需求" />
    </div>

    <p v-if="!isEdit()" class="hint muted">新建后文档处于“待处理”状态，可在详情页触发解析。</p>
  </ModalDialog>
</template>

<style scoped>
.hint {
  margin: 0;
  font-size: 12px;
}
</style>
