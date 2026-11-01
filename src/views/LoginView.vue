<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({ email: 'admin@demo.com', password: '123456' })
const loading = ref(false)
const error = ref('')

const demoAccounts = [
  { email: 'admin@demo.com', name: '张三', role: '管理员（可增删改）' },
  { email: 'editor@demo.com', name: '李四', role: '编辑者（可增改）' },
  { email: 'viewer@demo.com', name: '王五', role: '只读（仅查看）' },
]

function fill(email: string) {
  form.email = email
  form.password = '123456'
  error.value = ''
}

async function submit() {
  if (loading.value) return
  error.value = ''

  if (!form.email.trim() || !form.password) {
    error.value = '请输入邮箱和密码'
    return
  }

  loading.value = true
  try {
    await auth.login(form.email.trim(), form.password)
    toast.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/docs'
    await router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card card">
      <h1>文档知识库</h1>
      <p class="muted subtitle">Vue 3 + TypeScript 实战项目</p>

      <form @submit.prevent="submit">
        <div class="field">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="username"
            placeholder="admin@demo.com"
          />
        </div>
        <div class="field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="123456"
          />
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <button class="primary submit" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>

      <div class="demo">
        <div class="demo-title muted">演示账号（密码均为 123456）</div>
        <button
          v-for="item in demoAccounts"
          :key="item.email"
          class="demo-item"
          type="button"
          @click="fill(item.email)"
        >
          <span class="demo-name">{{ item.name }}</span>
          <span class="demo-email">{{ item.email }}</span>
          <span class="demo-role">{{ item.role }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #f2f5fa 0%, #e9eef7 100%);
}

.login-card {
  width: 420px;
  max-width: 100%;
  padding: 32px;
}

h1 {
  margin: 0;
  font-size: 22px;
}

.subtitle {
  margin: 6px 0 24px;
  font-size: 13px;
}

.submit {
  width: 100%;
  padding: 9px;
  margin-top: 4px;
}

.demo {
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px dashed var(--border);
}

.demo-title {
  font-size: 12px;
  margin-bottom: 8px;
}

.demo-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  text-align: left;
  font-size: 13px;
}

.demo-name {
  font-weight: 500;
}

.demo-email {
  color: var(--text-secondary);
}

.demo-role {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
