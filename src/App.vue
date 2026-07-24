<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, onUnmounted, watch, ref } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
import GlobalNotification from '@/components/GlobalNotification.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'
import router from './router'
import { Preferences } from '@capacitor/preferences'
import RN from './router/routeNames'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App as CapacitorApp } from '@capacitor/app'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()


watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      chatStore.connect()
      chatStore.fetchChatsList()
    } else {
      chatStore.disconnect()
    }
  },
)

const handleBack = (event: PopStateEvent) => {
  event.preventDefault()
  router.back()
}

const setTopBarColor = async () => {
  try {
    await StatusBar.setBackgroundColor({color: '#ffffff'})

    await StatusBar.setStyle({style: Style.Light})
  } catch (error) {
    console.error('StatusBar is not available on web:', error);
  }
}

onMounted(async () => {
  // setTopBarColor()
  const { value: token } = await Preferences.get({key: 'auth_token'})
  if (token) {
    authStore.token = token


    try {
      await authStore.getMe()
      
    } catch (error) {
      console.error('Error al obtener el usuario en onMounted:', error)
      await Preferences.remove({key: 'auth_token'})
      authStore.logout()
      router.push({ name: RN.LOGIN })
    }
  }

  window.addEventListener('popstate', handleBack)

  const appHistory = ref<string[]>([])

  const rootRoutes = [
    RN.HOME,
    RN.FAVORITOS,
    RN.CHATS,
    RN.PERFIL,
    RN.LOGIN,
    RN.ADMIN_DASHBOARD
  ]

  router.afterEach((to) => {
    if (rootRoutes.includes(to.name as any)) {
      appHistory.value = [to.fullPath]
    } else if (appHistory.value.length > 1 && to.fullPath === appHistory.value[appHistory.value.length - 2]) {
      appHistory.value.pop()
    } else {
      appHistory.value.push(to.fullPath)
    }
  })

  CapacitorApp.addListener('backButton', () => {
    if (rootRoutes.includes(route.name as any)) {
      CapacitorApp.exitApp()
    } else {
      if (appHistory.value.length > 1) {
        const prev = appHistory.value[appHistory.value.length - 2]
        if (prev) {
          router.replace(prev)
        } else {
          router.replace({ name: RN.HOME })
        }
      } else {
        router.replace({ name: RN.HOME })
      }
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('popstate', handleBack)
})

</script>

<template>
  <div
    class="bg-gray-50 min-h-screen font-sans text-gray-800 relative overflow-x-hidden"
    :class="{ 'pb-24': route.meta.showBottomNav }"
  >
    <GlobalNotification />
    <RouterView v-slot="{ Component }">
      <Transition name="fade-slide">
        <component :is="Component" :key="route.path" class="w-full absolute-during-transition" />
      </Transition>
    </RouterView>

    <BottomNav v-if="route.meta.showBottomNav" class="z-50" />
  </div>
</template>

<style>
/* --- ESTILO DE TRANSICIÓN SIMULTÁNEA (SIN SALTOS) --- */

/* Duración de la animación */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

/* La página que ENTRA */
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px); /* Entra desde la derecha */
}

/* La página que SALE (Truco del Absolute) */
/* Al poner absolute, deja de ocupar espacio y la nueva sube inmediatamente */
.fade-slide-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1; /* Se va por detrás para no tapar la nueva */
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px); /* Sale hacia la izquierda */
}
</style>
