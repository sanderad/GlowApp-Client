<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const messagesContainer = ref<HTMLElement | null>(null)
const newMessage = ref('')

// --- DATOS MOCK ---
const stylist = ref({
  id: 1,
  name: 'Ana María P.',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  isOnline: true
})

const messages = ref([
  { id: 1, text: 'Hola Ana, ¿tienes espacio para hoy?', isMe: true, time: '10:30 AM', read: true },
  { id: 2, text: '¡Hola Dulfary! Déjame revisar mi agenda un momento 💅', isMe: false, time: '10:32 AM' },
  { id: 3, text: 'Sí, tengo un espacio libre a las 3:00 PM. ¿Te sirve?', isMe: false, time: '10:33 AM' },
  { id: 4, text: 'Perfecto, resérvame ese espacio por favor.', isMe: true, time: '10:35 AM', read: true },
  { id: 5, text: 'Listo! Ya quedó agendado. Te veo a las 3.', isMe: false, time: '10:36 AM' },
  // Agregué más mensajes para probar el scroll
])

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  messages.value.push({
    id: Date.now(),
    text: newMessage.value,
    isMe: true,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false
  })
  
  newMessage.value = ''
  scrollToBottom()

  setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      text: '¡Perfecto! Quedas agendada. Nos vemos 😉',
      isMe: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }, 2000)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const goBack = () => router.back()

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="h-screen relative bg-chat-pattern font-sans">
    
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 px-4 flex items-center gap-3 shadow-sm z-30 border-b border-gray-100 h-16 max-w-md mx-auto">
      <button @click="goBack" class="text-gray-500 hover:text-pink-600 transition p-1 mr-1">
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </button>

      <div class="relative">
        <img :src="stylist.image" class="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm">
        <div v-if="stylist.isOnline" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>

      <div class="flex-1 leading-tight">
        <h3 class="font-bold text-gray-900 text-sm">{{ stylist.name }}</h3>
        <p class="text-xs text-green-600 font-medium" v-if="stylist.isOnline">En línea</p>
        <p class="text-xs text-gray-400" v-else>Ausente</p>
      </div>
      
      </header>

    <main 
      ref="messagesContainer" 
      class="flex flex-col h-full overflow-y-auto p-4 pt-20 pb-24 space-y-4"
    >
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="flex flex-col max-w-[85%]"
          :class="msg.isMe ? 'self-end items-end' : 'self-start items-start'"
        >
            <div 
              class="px-4 py-2.5 rounded-2xl text-sm relative group shadow-sm"
              :class="msg.isMe 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'"
            >
              {{ msg.text }}
            </div>

            <div class="flex items-center gap-1 mt-1 px-1">
               <span class="text-[10px] text-gray-400 font-medium">{{ msg.time }}</span>
               <i v-if="msg.isMe" class="fa-solid fa-check-double text-[10px]" :class="msg.read ? 'text-pink-500' : 'text-gray-300'"></i>
            </div>
        </div>
    </main>

    <footer class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-3 px-4 border-t border-gray-100 z-30 max-w-md mx-auto">
      <div class="flex items-center gap-2 bg-gray-50 rounded-3xl px-2 py-2 border border-gray-100 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 focus-within:bg-white transition shadow-sm">
        
        <button class="text-gray-400 hover:text-pink-500 transition p-2 flex items-center justify-center">
          <i class="fa-solid fa-paperclip text-lg"></i>
        </button>

        <input 
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="Escribe un mensaje..." 
          class="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 h-9 px-2"
        >

        <button 
          @click="sendMessage"
          class="w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm shrink-0"
          :class="newMessage.trim() ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-pink-200 transform active:scale-95' : 'bg-gray-200 text-gray-400 cursor-default'"
          :disabled="!newMessage.trim()"
        >
          <i class="fa-solid fa-paper-plane text-sm ml-0.5"></i>
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
</style>