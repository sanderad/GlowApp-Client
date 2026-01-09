import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { showBottomNav: true },
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      // Lazy loading: solo se carga cuando se visita
      component: () => import('../views/FavoritosView.vue'),
      meta: { showBottomNav: true },
    },
    {
      path: '/chats',
      name: 'chats',
      component: () => import('../views/ChatsView.vue'),
      meta: { showBottomNav: true },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/PerfilView.vue'),
      meta: { showBottomNav: true },
    },
    {
      path: '/estilista/:id', // :id es el parámetro dinámico
      name: 'stylist-detail',
      component: () => import('../views/StylistDetailView.vue'),
      meta: { showBottomNav: false }, // Ocultamos la barra de abajo para dar foco
    },
    {
      path: '/chat/:id',
      name: 'chat-detail',
      component: () => import('../views/ChatDetailView.vue'),
      meta: { showBottomNav: false } // Ocultamos la nav principal para dar foco al teclado
    },
    // LOGIN
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { showBottomNav: false }
    },
    // REGISTRO CLIENTE (Usuario normal)
    {
      path: '/registro-cliente',
      name: 'client-register',
      component: () => import('../views/auth/ClientRegisterView.vue'),
      meta: { showBottomNav: false }
    },
    // REGISTRO ESTILISTA (Tu código adaptado)
    {
      path: '/registro-estilista',
      name: 'stylist-register',
      component: () => import('../views/auth/StylistRegisterView.vue'),
      meta: { showBottomNav: false }
    },
  ],
  // Esto hace que al cambiar de página, el scroll vuelva arriba
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
