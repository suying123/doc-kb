import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Role } from '@/types'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: Role[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/docs' },
      {
        path: 'docs',
        name: 'docs',
        component: () => import('@/views/DocListView.vue'),
        meta: { title: '文档', roles: ['admin', 'editor', 'viewer'] },
      },
      {
        path: 'docs/:id',
        name: 'doc-detail',
        component: () => import('@/views/DocDetailView.vue'),
        meta: { title: '文档详情', roles: ['admin', 'editor', 'viewer'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return { name: 'not-found' }
  }

  document.title = to.meta.title ? `${to.meta.title} · 知识库` : '知识库'
  return true
})

export default router
