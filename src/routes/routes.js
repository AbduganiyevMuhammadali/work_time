
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../page/Layaut/Dashbord.vue'
import Davomat from '../page/Davomat/davomat.vue'
import Kalendar from '../page/Kalendar/Kalendar.vue'
import Home from '../page/Layaut/Home.vue'
import Xodimlar from '../page/Xodimlar/xodimlar.vue'
import Oylik from '../page/Oylik/oylik.vue'
import Avanslar from '../page/Avanslar/avanslar.vue'
import Chat from '../page/Chat/chat.vue'
import Tatil from '../page/Tatil/tatil.vue'
import Sozlamalar from '../page/Sozlamalar/sozlamalar.vue'
import Login from '../page/Login/login.vue'
import Users from '../page/Users/users.vue'

const routes = [
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: { public: true }
  },
  {
    path: '/',
    component: Dashboard,
    name: 'dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/',
        component: Home,
        name: 'home'
      },
      {
        path: 'davomat',
        component: Davomat,
        name: 'davomat'
      },
      {
        path: 'kalendar',
        component: Kalendar,
        name: 'kalendar'
      },
      {
        path: 'xodimlar',
        component: Xodimlar,
        name: 'xodimlar'
      },
      {
        path: 'oylik',
        component: Oylik,
        name: 'oylik'
      },
      {
        path: 'avanslar',
        component: Avanslar,
        name: 'avanslar'
      },
      {
        path: 'tatil',
        component: Tatil,
        name: 'tatil'
      },
      {
        path: 'chat',
        component: Chat,
        name: 'chat'
      },
      {
        path: 'settings',
        component: Sozlamalar,
        name: 'settings'
      },
      {
        path: 'users',
        component: Users,
        name: 'users'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Auth guard ────────────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('wt_token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else if (to.name === 'login' && token) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
