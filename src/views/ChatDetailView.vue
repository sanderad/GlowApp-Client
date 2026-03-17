<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

const messagesContainer = ref<HTMLElement | null>(null)
const newMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)
const chatId = Number(route.params.id)

// Simulador del lado cliente para obtener los datos del estilista (en un real app el backend traería el recipientUser o se parsearía del chatsList)
const stylist = computed(() => {
  const chatInfo = chatStore.chatsList.find((c) => c.id === chatId)
  if (chatInfo)
    return {
      name: chatInfo.user.name,
      image: chatInfo.user.photo,
      isOnline: chatInfo.isOnline,
    }
  // Backup temporario si se entró directo sin cargar lista
  return {
    name: 'Chat',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    isOnline: false,
  }
})

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  chatStore.sendMessage(chatId, newMessage.value)
  newMessage.value = ''
  chatStore.emitTyping(chatId, false)
  scrollToBottom()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    isUploadingImage.value = true
    // Subir imagen vía API
    const imageUrl = await chatStore.uploadImage(chatId, file)

    // Enviar mensaje en blanco pero con imageUrl por Sockets
    chatStore.sendMessage(chatId, '', imageUrl)
    scrollToBottom()
  } catch (err) {
    console.error('Error uploading image', err)
    alert('No se pudo subir la imagen.')
  } finally {
    isUploadingImage.value = false
    // Limpiar el input file
    if (fileInput.value) fileInput.value.value = ''
  }
}

const sendTypingEvent = () => {
  if (newMessage.value.trim().length > 0) {
    chatStore.emitTyping(chatId, true)
  } else {
    chatStore.emitTyping(chatId, false)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Escuchar cambios nuevos en los mensajes para hacer auto-scroll down
watch([() => chatStore.activeChatMessages.length, () => chatStore.isTypingDict[chatId]], () => {
  scrollToBottom()
  chatStore.markAsRead(chatId)
})

const isMine = (msg: any) => {
  const myId = authStore.me?.id
  if (!myId) return false

  // Soporte universal para distintos tipos de Backend DTOs
  const senderId = msg.senderId || msg.sender?.id || msg.userId

  // Loose equality (==) para que { id: 2 } funcione con "2" si la BD lo envía como string
  return senderId == myId
}

const goBack = () => router.back()

const formatTime = (isoStr: string) => {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const shouldShowDateSeparator = (index: number) => {
  if (index === 0) return true
  const currentMsg = chatStore.activeChatMessages[index]
  const previousMsg = chatStore.activeChatMessages[index - 1]

  if (!currentMsg || !previousMsg) return false

  const currentMsgDate = new Date(currentMsg.createdAt)
  const previousMsgDate = new Date(previousMsg.createdAt)
  return !isSameDay(currentMsgDate, previousMsgDate)
}

const getSeparatorDateText = (isoStr: string) => {
  const date = new Date(isoStr)
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  return format(date, "EEEE, d 'de' MMMM", { locale: es })
}

const quickReplies = [
  '¡Hola!',
  '¿Cómo estás?',
  '¿Tienes citas disponibles?',
  'Te confirmo mi asistencia.',
  '¡Muchas gracias!',
]

const sendReply = (text: string) => {
  chatStore.sendMessage(chatId, text)
  scrollToBottom()
}

onMounted(async () => {
  // 1. Cargamos el historial
  if (!chatStore.chatsList.find((c) => c.id === chatId)) {
    await chatStore.fetchChatsList()
  }
  await chatStore.fetchMessages(chatId)

  // 2. Nos unimos a la sala de sockets para escuchar los eventos en "vivo" de este chat
  chatStore.joinChat(chatId)
  chatStore.markAsRead(chatId)

  scrollToBottom()
})

onUnmounted(() => {
  chatStore.leaveChat()
})
</script>

<template>
  <div class="h-screen relative bg-chat-pattern font-sans">
    <header
      class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 px-4 flex items-center gap-3 shadow-sm z-30 border-b border-gray-100 h-16 max-w-md mx-auto"
    >
      <button @click="goBack" class="text-gray-500 hover:text-pink-600 transition p-1 mr-1">
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </button>

      <div class="relative">
        <img
          :src="stylist.image"
          class="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
        />
        <div
          v-if="stylist.isOnline"
          class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
        ></div>
      </div>

      <div class="flex-1 leading-tight">
        <h3 class="font-bold text-gray-900 text-sm">{{ stylist.name }}</h3>
        <p class="text-xs text-green-600 font-medium" v-if="stylist.isOnline">En línea</p>
        <p class="text-xs text-gray-400" v-else>Ausente</p>
      </div>
    </header>

    <main
      ref="messagesContainer"
      class="flex flex-col h-full overflow-y-auto p-4 pt-20 pb-36 space-y-4"
    >
      <div v-if="chatStore.isLoadingMessages" class="flex justify-center items-center h-full">
        <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-3xl"></i>
      </div>

      <template v-else>
        <template v-for="(msg, index) in chatStore.activeChatMessages" :key="msg.id">
          <!-- Separador de Fecha -->
          <div v-if="shouldShowDateSeparator(index)" class="flex justify-center my-3 opacity-90">
            <span
              class="bg-gray-200/50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm"
            >
              {{ getSeparatorDateText(msg.createdAt) }}
            </span>
          </div>

          <!-- Mensaje -->
          <div
            class="flex flex-col max-w-[85%]"
            :class="isMine(msg) ? 'self-end items-end' : 'self-start items-start'"
          >
            <div
              class="px-4 py-2.5 rounded-2xl text-sm relative group shadow-sm flex flex-col gap-2"
              :class="
                isMine(msg)
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              "
            >
              <!-- Renderizado dinámico de imagen -->
              <img
                v-if="msg.imageUrl"
                :src="msg.imageUrl"
                class="w-full max-w-[200px] h-auto rounded-xl object-cover"
                alt="Adjunto"
                @load="scrollToBottom"
              />
              <span v-if="msg.text">{{ msg.text }}</span>
            </div>

            <div class="flex items-center gap-1 mt-1 px-1">
              <span class="text-[10px] text-gray-400 font-medium">{{
                formatTime(msg.createdAt)
              }}</span>
              <i
                v-if="isMine(msg)"
                class="fa-solid fa-check-double text-[10px]"
                :class="msg.isRead ? 'text-pink-500' : 'text-gray-300'"
              ></i>
            </div>
          </div>
        </template>

        <!-- Indicador de "Escribiendo..." animado si está en el diccionario -->
        <div
          v-if="chatStore.isTypingDict[chatId]"
          class="self-start items-start flex flex-col max-w-[85%] mt-2 animate-pulse"
        >
          <div
            class="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-bl-none flex items-center gap-1 w-16"
          >
            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
            <div
              class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
              style="animation-delay: 0.4s"
            ></div>
          </div>
        </div>
      </template>
    </main>

    <footer
      class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-4 pb-3 pt-2 border-t border-gray-100 z-30 max-w-md mx-auto shadow-[0_-5px_20px_rgba(0,0,0,0.03)]"
    >
      <!-- Quick Replies (Chips horizontales) -->
      <div class="flex overflow-x-auto gap-2 pb-3 mb-1 hide-scrollbar -mx-4 px-4">
        <button
          v-for="(reply, idx) in quickReplies"
          :key="idx"
          @click="sendReply(reply)"
          class="whitespace-nowrap px-3 py-1.5 bg-pink-50 text-pink-600 border border-pink-100/50 rounded-full text-xs font-semibold hover:bg-pink-100 active:scale-95 transition-transform"
        >
          {{ reply }}
        </button>
      </div>

      <div
        class="flex items-center gap-2 bg-gray-50 rounded-3xl px-2 py-2 border border-gray-100 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 focus-within:bg-white transition shadow-sm"
      >
        <button
          @click="fileInput?.click()"
          :disabled="isUploadingImage"
          class="text-gray-400 hover:text-pink-500 transition p-2 flex items-center justify-center transform active:scale-90"
        >
          <i v-if="!isUploadingImage" class="fa-solid fa-paperclip text-lg"></i>
          <i v-else class="fa-solid fa-circle-notch fa-spin text-lg text-pink-500"></i>
        </button>

        <!-- Input invisible de archivo -->
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />

        <input
          v-model="newMessage"
          @input="sendTypingEvent"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 h-9 px-2"
        />

        <button
          @click="sendMessage"
          class="w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm shrink-0"
          :class="
            newMessage.trim()
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-pink-200 transform active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-default'
          "
          :disabled="!newMessage.trim()"
        >
          <i
            class="fa-solid fa-paper-plane text-sm ml-0.5"
            :class="!newMessage.trim() && 'opacity-60'"
          ></i>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Aplicamos el fondo a la clase contenedora */
.bg-chat-pattern {
  background-color: #f2f4f6; /* Color base gris claro */
  /* Patrón de puntitos sutil */
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Ocultar barra de desplazamiento en chips */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
