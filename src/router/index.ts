import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/booth',
    component: () => import('@/views/PhotoBoothView.vue'),
  },
  {
    path: '/settings',
    component: () => import('@/views/SettingsView.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})
