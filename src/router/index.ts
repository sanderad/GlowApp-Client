import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RN from './routeNames'
import EditProfileView from '../views/EditProfileView.vue'
import HelpSupportView from '../views/HelpSupportView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RN.HOME,
      component: HomeView,
      meta: { showBottomNav: true },
    },
    {
      path: '/favoritos',
      name: RN.FAVORITOS,
      // Lazy loading: solo se carga cuando se visita
      component: () => import('../views/FavoritosView.vue'),
      meta: { showBottomNav: true },
    },
    {
      path: '/chats',
      name: RN.CHATS,
      component: () => import('../views/ChatsView.vue'),
      meta: { showBottomNav: true },
    },
    {
      path: '/perfil',
      name: RN.PERFIL,
      component: () => import('../views/PerfilView.vue'),
      meta: { showBottomNav: true },
    },
    {
      path: '/perfil/editar',
      name: 'edit-profile',
      component: EditProfileView,
      meta: { showBottomNav: false },
    },
    {
      path: '/perfil/ayuda',
      name: 'help-support',
      component: HelpSupportView,
      meta: { showBottomNav: false },
    },
    {
      path: '/perfil/privacidad',
      name: 'privacy',
      component: PrivacyView,
      meta: { showBottomNav: false },
    },
    {
      path: '/estilista/:id', // :id es el parámetro dinámico
      name: RN.STYLIST_DETAIL,
      component: () => import('../views/StylistDetailView.vue'),
      meta: { showBottomNav: false }, // Ocultamos la barra de abajo para dar foco
    },
    {
      path: '/chat/:id',
      name: RN.CHAT_DETAIL,
      component: () => import('../views/ChatDetailView.vue'),
      meta: { showBottomNav: false }, // Ocultamos la nav principal para dar foco al teclado
    },
    // LOGIN
    {
      path: '/login',
      name: RN.LOGIN,
      component: () => import('../views/auth/LoginView.vue'),
      meta: { showBottomNav: false },
    },
    // REGISTRO CLIENTE (Usuario normal)
    {
      path: '/registro-cliente',
      name: RN.CLIENT_REGISTER,
      component: () => import('../views/auth/ClientRegisterView.vue'),
      meta: { showBottomNav: false },
    },
    // REGISTRO ESTILISTA (Tu código adaptado)
    {
      path: '/registro-estilista',
      name: RN.STYLIST_REGISTER,
      component: () => import('../views/auth/StylistRegisterView.vue'),
      meta: { showBottomNav: false },
    },
    {
      path: '/admin',
      name: RN.ADMIN_DASHBOARD,
      component: () => import('../views/AdminView.vue'),
      meta: { showBottomNav: false },
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore()
        await authStore.getMe()
        const user = authStore.me
        console.log(user)
        if (user && user?.role?.toLowerCase() === 'admin') {
          next()
        } else {
          next('/')
        }
      },
    },
  ],
  // Esto hace que al cambiar de página, el scroll vuelva arriba
  scrollBehavior() {
    return { top: 0 }
  },
})

const publicRoutes = [RN.LOGIN, RN.CLIENT_REGISTER, RN.STYLIST_REGISTER, RN.HOME]

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Evitar bucles infinitos y proteger rutas privadas
  if (!publicRoutes.includes(to.name as any) && !authStore.isAuthenticated) {
    next({ name: RN.LOGIN })
  } else if (publicRoutes.includes(to.name as any) && authStore.isAuthenticated) {
    // Si ya está logueado y trata de ir al login o registro, lo mandamos al home
    next({ name: RN.HOME })
  } else {
    next() // Permitir navegación
  }
})

export default router
