<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'
import { formatRelative } from 'date-fns'
import { es } from 'date-fns/locale'

const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

onMounted(() => {
  chatStore.fetchChatsList()
})

const getRelativeTime = (isoString: string | null | undefined) => {
  // 1. Añadimos 'undefined' al tipo para que acepte cualquier caso vacío sin quejarse
  if (!isoString) return ''

  const date = new Date(isoString)
  const relativeText = formatRelative(date, new Date(), { locale: es })

  // 2. Extraemos la primera parte del split y le ponemos el '!'
  // Esto le jura a TypeScript que siempre habrá un string ahí (lo cual es verdad)
  const shortText = relativeText.split(' a las')[0]!

  return shortText.replace(
    'hoy',
    new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  )
}
// Navegar al chat individual
const openChat = (id: number) => {
  router.push({ name: 'chat-detail', params: { id } })
}
</script>

<template>
  <div class="bg-white min-h-screen pb-24">
    <header
      class="bg-white sticky top-0 z-30 px-4 py-3 border-b border-gray-100 flex justify-between items-center"
    >
      <h1 class="text-2xl font-black text-gray-900 tracking-tight">
        Mis
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600"
          >Chats</span
        >
        <i class="fa-solid fa-comment-dots text-gray-300 ml-1 text-xl"></i>
      </h1>
    </header>

    <main class="max-w-md mx-auto pt-2">
      <div v-if="chatStore.isLoadingChatsList" class="flex justify-center py-10">
        <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-2xl"></i>
      </div>

      <template v-else-if="chatStore.chatsList.length === 0">
        <!-- Stylist Expired -->
        <div v-if="chatStore.isAccountExpiredNoChats" class="p-6 text-center mt-10">
          <div
            class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-2">Cuenta Suspendida</h2>
          <p class="text-sm text-gray-500 mb-6">
            No tienes acceso a los chats porque tu suscripción está vencida. Por favor, comunícate
            con la administradora para renovarla.
          </p>
          <a
            :href="`https://wa.me/573128285881?text=${encodeURIComponent('Hola Dulfary, quiero renovar mi cuenta en GlowApp. Mi nombre es ' + (authStore.me?.fullName || ''))}`"
            target="_blank"
            class="inline-flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition"
          >
            <i class="fa-brands fa-whatsapp text-lg"></i> Contactar Administradora
          </a>
        </div>

        <!-- Active Stylist -->
        <div
          v-else-if="authStore.me?.role?.toLowerCase() === 'stylist'"
          class="p-6 text-center mt-10"
        >
          <div
            class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fa-solid fa-comment-slash text-2xl"></i>
          </div>
          <p class="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            No tienes chats porque ningún cliente ha iniciado una conversación contigo o no has
            iniciado conversación con algún otro estilista.
          </p>
        </div>

        <!-- Normal Client -->
        <div v-else class="p-6 text-center mt-10">
          <div
            class="w-16 h-16 bg-pink-50 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fa-solid fa-comments text-2xl"></i>
          </div>
          <p class="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            No tienes chats porque no has iniciado conversación con ningún estilista.
          </p>
        </div>
      </template>

      <div
        v-else
        v-for="chat in chatStore.chatsList"
        :key="chat.id"
        @click="openChat(chat.id)"
        class="p-4 border-b border-gray-100 flex gap-4 cursor-pointer transition relative group"
        :class="
          chat.unreadCount > 0 ? 'bg-pink-50/40 hover:bg-pink-50' : 'bg-white hover:bg-gray-50'
        "
      >
        <div
          v-if="chat.unreadCount > 0"
          class="absolute left-0 top-0 bottom-0 w-1.5 bg-pink-500 rounded-r-md"
        ></div>

        <div class="relative">
          <img
            :src="chat.user.photo"
            class="w-14 h-14 rounded-full object-cover shadow-sm"
            :class="[chat.unreadCount > 0 ? 'ring-2 ring-white' : '']"
          />
          <div
            v-if="chat.isOnline"
            class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"
          ></div>
        </div>

        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <div class="flex justify-between items-baseline mb-1">
            <h3
              class="text-base truncate"
              :class="chat.unreadCount > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-900'"
            >
              {{ chat.user.name }}
            </h3>
            <span
              class="text-xs capitalize"
              :class="chat.unreadCount > 0 ? 'text-pink-600 font-bold' : 'text-gray-400'"
            >
              {{ getRelativeTime(chat.timestamp) }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <p
              class="text-sm truncate pr-2 flex items-center"
              :class="chat.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'"
            >
              <template v-if="chat.lastMessage">
                {{ chat.lastMessage }}
              </template>
              <template v-else-if="chat.lastImageUrl || chat.lastMessage === ''">
                <i class="fa-solid fa-camera mr-1.5 opacity-80"></i> Imagen
              </template>
            </p>

            <div
              v-if="chat.unreadCount > 0"
              class="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-pink-200 shrink-0"
            >
              {{ chat.unreadCount }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
