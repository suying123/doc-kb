import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { onUnauthorized } from './api/http'
import { useAuthStore } from './stores/auth'
import vPermission from './directives/permission'
import './style.css'

async function bootstrap() {
  if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass' })
  }

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.directive('permission', vPermission)

  onUnauthorized(() => {
    const auth = useAuthStore(pinia)
    auth.logout()
    const current = router.currentRoute.value
    void router.push({
      name: 'login',
      query: current.name === 'login' ? undefined : { redirect: current.fullPath },
    })
  })

  app.mount('#app')
}

void bootstrap()
