<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
import type { Role } from '@/types'

interface MenuItem {
  label: string
  to: string
  roles: Role[]
}

const menu: MenuItem[] = [
  { label: '文档知识库', to: '/docs', roles: ['admin', 'editor', 'viewer'] },
]

const auth = useAuthStore()
const router = useRouter()
const { can } = usePermission()

const visibleMenu = computed(() => menu.filter((item) => can(item.roles)))

const roleLabel = computed(() => {
  switch (auth.user?.role) {
    case 'admin':
      return '管理员'
    case 'editor':
      return '编辑者'
    case 'viewer':
      return '只读'
    default:
      return ''
  }
})

function logout() {
  auth.logout()
  void router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">知识库</div>
      <nav class="menu">
        <RouterLink
          v-for="item in visibleMenu"
          :key="item.to"
          :to="item.to"
          class="menu-item"
          active-class="active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="spacer" />
        <div v-if="auth.user" class="user">
          <span class="avatar">{{ auth.user.name.slice(0, 1) }}</span>
          <span class="user-name">{{ auth.user.name }}</span>
          <span class="role">{{ roleLabel }}</span>
          <button class="logout" @click="logout">退出</button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.brand {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid var(--border);
}

.menu {
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  padding: 9px 12px;
  border-radius: 6px;
  color: var(--text-secondary);
}

.menu-item:hover {
  background: #f2f4f7;
  color: var(--text);
}

.menu-item.active {
  background: #eaf1ff;
  color: var(--primary);
  font-weight: 500;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.user-name {
  font-weight: 500;
}

.role {
  font-size: 12px;
  color: var(--text-secondary);
  background: #f2f4f7;
  padding: 1px 8px;
  border-radius: 999px;
}

.logout {
  margin-left: 8px;
  padding: 4px 10px;
  font-size: 13px;
}

.content {
  flex: 1;
  padding: 24px;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
}
</style>
