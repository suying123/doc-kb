<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    retryText?: string
  }>(),
  {
    message: '加载失败，请稍后重试。',
    retryText: '重试',
  },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="error-state">
    <div class="error-icon">!</div>
    <h3>出了点问题</h3>
    <p class="muted">{{ message }}</p>
    <button class="primary" @click="emit('retry')">{{ retryText }}</button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.error-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fdf2f2;
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 12px;
}

.error-state h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.error-state p {
  margin: 0 0 16px;
  max-width: 420px;
}
</style>
