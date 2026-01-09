<script setup lang="ts">
import { ref } from 'vue'

// --- DATOS DEL USUARIO (Mock) ---
const user = ref({
  name: 'Laura Gómez',
  email: 'laura.gomez@gmail.com',
  image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  notifications: 3
})

// Función dummy para cerrar sesión
const logout = () => {
  alert('Cerrando sesión...')
  // Aquí iría la lógica real: localStorage.clear(), router.push('/login'), etc.
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-24">
    
    <div class="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 pb-24 pt-6 px-6 rounded-b-[3rem] shadow-lg shadow-purple-200">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-white font-bold text-xl">Mi Perfil</h1>
            <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition">
                <i class="fa-solid fa-gear text-lg"></i>
            </button>
        </div>
        
        <div class="flex flex-col items-center">
            <h2 class="text-white font-black text-2xl tracking-tight">{{ user.name }}</h2>
            <p class="text-purple-100 text-sm font-medium">{{ user.email }}</p>
        </div>
    </div>

    <div class="relative -mt-16 mb-6 flex justify-center">
        <div class="relative">
            <div class="w-32 h-32 rounded-full p-1 bg-white shadow-xl">
                <img :src="user.image" class="w-full h-full rounded-full object-cover">
            </div>
            <button class="absolute bottom-1 right-1 bg-gray-900 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md hover:scale-110 transition active:scale-95 cursor-pointer">
                <i class="fa-solid fa-camera text-xs"></i>
            </button>
        </div>
    </div>

    <main class="max-w-md mx-auto px-4 space-y-4">
        
        <div class="bg-white rounded-2xl p-2 shadow-sm shadow-gray-100 border border-gray-50">
            
            <button class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group">
                <div class="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center mr-4 group-hover:bg-pink-100 transition">
                    <i class="fa-solid fa-user-pen"></i>
                </div>
                <div class="flex-1 text-left">
                    <h3 class="font-bold text-gray-800 text-sm">Editar Datos Personales</h3>
                </div>
                <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
            </button>
            
            <div class="h-px bg-gray-50 mx-14"></div>

            <button class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group">
                <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mr-4 group-hover:bg-purple-100 transition">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="flex-1 text-left">
                    <h3 class="font-bold text-gray-800 text-sm">Notificaciones</h3>
                </div>
                <div v-if="user.notifications > 0" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 shadow-sm shadow-red-200">
                    {{ user.notifications }}
                </div>
                <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
            </button>
        </div>

        <div class="bg-white rounded-2xl p-2 shadow-sm shadow-gray-100 border border-gray-50">
            <button class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition">
                    <i class="fa-solid fa-circle-question"></i>
                </div>
                <div class="flex-1 text-left">
                    <h3 class="font-bold text-gray-800 text-sm">Ayuda y Soporte</h3>
                </div>
                <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
            </button>
            
            <div class="h-px bg-gray-50 mx-14"></div>

            <button class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group">
                <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mr-4 group-hover:bg-orange-100 transition">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="flex-1 text-left">
                    <h3 class="font-bold text-gray-800 text-sm">Privacidad</h3>
                </div>
                <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
            </button>
        </div>

        <button 
            @click="logout"
            class="w-full py-4 text-red-500 font-bold text-sm bg-white border border-red-50 rounded-2xl hover:bg-red-50 shadow-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
        >
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
        </button>

        <p class="text-center text-[10px] text-gray-400 mt-6 pb-4 font-medium">
            GlowApp v1.0.0 • Hecho con ❤️ en Cali
        </p>
    </main>
  </div>
</template>