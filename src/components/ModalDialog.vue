<script setup lang="ts">
const visible = defineModel<boolean>('visible', { default: false })
const props = withDefaults(
  defineProps<{
    title?: string
    width?: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
    loading?: boolean
  }>(),
  {
    title: '确认',
    width: '420px',
    confirmText: '确定',
    cancelText: '取消',
    danger: false,
    loading: false,
  },
)

const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="visible = false">
      <div class="dialog" :style="{ width: props.width }">
        <header class="dialog-header">
          <h3>{{ props.title }}</h3>
          <button class="close" @click="visible = false">×</button>
        </header>
        <div class="dialog-body">
          <slot />
        </div>
        <footer class="dialog-footer">
          <button :disabled="props.loading" @click="visible = false">{{ props.cancelText }}</button>
          <button
            class="primary"
            :class="{ danger: props.danger }"
            :disabled="props.loading"
            @click="emit('confirm')"
          >
            {{ props.loading ? '处理中…' : props.confirmText }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 20, 30, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
}

.close {
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  padding: 0 4px;
  color: var(--text-secondary);
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: #fafbfc;
}

.primary.danger {
  background: var(--danger);
  border-color: var(--danger);
}
</style>
