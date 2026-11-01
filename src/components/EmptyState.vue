<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    actionText?: string
  }>(),
  {
    title: '暂无数据',
    description: '试着调整筛选条件，或者新建一条记录。',
    actionText: '重置筛选',
  },
)

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty">
    <div class="empty-icon">∅</div>
    <h3>{{ title }}</h3>
    <p class="muted">{{ description }}</p>
    <button @click="emit('action')">{{ actionText }}</button>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eef1f5;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
}

.empty h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.empty p {
  margin: 0 0 16px;
}
</style>
