<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="code">404</div>
    <h2>页面不存在</h2>
    <p class="muted">链接可能已失效，或者你没有访问该页面的权限。</p>
    <div class="row">
      <button @click="router.back()">返回上一页</button>
      <button class="primary" @click="router.push({ name: 'docs' })">回到文档列表</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.code {
  font-size: 64px;
  font-weight: 700;
  color: #d7dce3;
  line-height: 1;
}

h2 {
  margin: 12px 0 6px;
}

p {
  margin: 0 0 20px;
}
</style>
