<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, watch } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
import GlobalNotification from '@/components/GlobalNotification.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()

onMounted(async () => {
  // 1. Esperamos a que el authStore verifique la sesión
  const isAuthenticated = await authStore.getMe()

  // 2. Si la sesión es válida (true), conectamos sockets y chats
  if (isAuthenticated) {
    chatStore.connect()
    chatStore.fetchChatsList()
  } else {
    // 3. Opcional: Si tienes una variable global de "Cargando App",
    // asegúrate de apagarla aquí.
    // appStore.isLoadingGlobal = false;
  }
})

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
</script>

<template>
  <div class="bg-gray-50 min-h-screen font-sans pb-24 text-gray-800 relative overflow-x-hidden">
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
