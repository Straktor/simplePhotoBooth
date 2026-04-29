import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/PhotoBoothView.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})
