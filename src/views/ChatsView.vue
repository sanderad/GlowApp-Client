<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- DATOS MOCK (Simulando la respuesta del API) ---
const chats = ref([
  {
    id: 1,
    name: 'Ana María P.',
    image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: '¡Claro! Tengo espacio a las 3pm 💅',
    time: '10:42 AM',
    unread: 2, // Si es > 0, se pinta rosa
    online: true,
    grayscale: false
  },
  {
    id: 2,
    name: 'Valentina Nails',
    image: 'https://images.pexels.com/photos/3385634/pexels-photo-3385634.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: '¿Te confirmamos la cita para mañana?',
    time: '09:15 AM',
    unread: 1,
    online: true,
    grayscale: false
  },
  {
    id: 3,
    name: 'Carlos Barber',
    image: 'https://images.pexels.com/photos/2040189/pexels-photo-2040189.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Listo el corte, nos vemos crack.',
    time: 'Ayer',
    unread: 0,
    online: false,
    readReceipt: true, // Doble check azul
    grayscale: false
  },
  {
    id: 4,
    name: 'Camilo Estilista',
    image: 'https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'El tinte quedó genial, gracias!',
    time: 'Mar 12',
    unread: 0,
    online: false,
    readReceipt: true,
    grayscale: false
  },
  {
    id: 5,
    name: 'Sofía G.',
    image: 'https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Gracias por tu calificación ⭐',
    time: 'Lunes',
    unread: 0,
    online: false,
    readReceipt: true,
    grayscale: false
  },
  {
    id: 6,
    name: 'Jessica Makeup',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Te envié las fotos del maquillaje.',
    time: 'Dom 10',
    unread: 0,
    online: false,
    readReceipt: false, // Doble check gris
    grayscale: true // Para simular la foto en blanco y negro del diseño original
  }
])

// Navegar al chat individual
const openChat = (id: number) => {
  router.push({ name: 'chat-detail', params: { id } })
}
</script>

<template>
  <div class="bg-white min-h-screen pb-24">
    
    <header class="bg-white sticky top-0 z-30 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
      <h1 class="text-2xl font-black text-gray-900 tracking-tight">
        Mis <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Chats</span>
        <i class="fa-solid fa-comment-dots text-gray-300 ml-1 text-xl"></i>
      </h1>
      <div class="flex gap-3">
        <button class="text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-magnifying-glass text-lg"></i>
        </button>
        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <i class="fa-regular fa-bell"></i>
        </div>
      </div>
    </header>

    <main class="max-w-md mx-auto pt-2">
      
      <div 
        v-for="chat in chats" 
        :key="chat.id"
        @click="openChat(chat.id)"
        class="p-4 border-b border-gray-100 flex gap-4 cursor-pointer transition relative group"
        :class="chat.unread > 0 ? 'bg-pink-50/40 hover:bg-pink-50' : 'bg-white hover:bg-gray-50'"
      >
          <div v-if="chat.unread > 0" class="absolute left-0 top-0 bottom-0 w-1.5 bg-pink-500 rounded-r-md"></div>

          <div class="relative">
              <img 
                :src="chat.image" 
                class="w-14 h-14 rounded-full object-cover shadow-sm"
                :class="[
                  chat.unread > 0 ? 'ring-2 ring-white' : '',
                  chat.grayscale ? 'grayscale opacity-80' : ''
                ]"
              >
              <div v-if="chat.online" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>

          <div class="flex-1 min-w-0 flex flex-col justify-center">
              
              <div class="flex justify-between items-baseline mb-1">
                  <h3 class="text-base truncate" :class="chat.unread > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-900'">
                    {{ chat.name }}
                  </h3>
                  <span class="text-xs" :class="chat.unread > 0 ? 'text-pink-600 font-bold' : 'text-gray-400'">
                    {{ chat.time }}
                  </span>
              </div>

              <div class="flex justify-between items-center">
                  <p class="text-sm truncate pr-2" :class="chat.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'">
                    {{ chat.lastMessage }}
                  </p>
                  
                  <div v-if="chat.unread > 0" class="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-pink-200 shrink-0">
                    {{ chat.unread }}
                  </div>

                  <i v-else class="fa-solid fa-check-double text-xs shrink-0" :class="chat.readReceipt ? 'text-blue-400' : 'text-gray-300'"></i>
              </div>

          </div>
      </div>

    </main>
  </div>
</template>