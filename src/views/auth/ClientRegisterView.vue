<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')

const handleRegister = () => {
    // Lógica de registro...
    router.push('/') // Va al home
}
</script>

<template>
  <div class="bg-white min-h-screen p-6 flex flex-col justify-center relative">
    
    <button @click="router.back()" class="absolute top-6 left-6 text-gray-400">
        <i class="fa-solid fa-arrow-left text-xl"></i>
    </button>

    <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900 mb-2">Crear Cuenta</h1>
        <p class="text-gray-500">Únete para agendar tus citas de belleza.</p>
    </div>

    <div class="space-y-4">
        <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Nombre Completo</label>
            <input v-model="name" type="text" placeholder="Tu nombre" class="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium">
        </div>
        <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Correo</label>
            <input type="email" placeholder="tucorreo@ejemplo.com" class="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium">
        </div>
        <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Contraseña</label>
            <input type="password" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium">
        </div>
    </div>

    <button @click="handleRegister" class="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 mt-8 hover:bg-pink-700 transition">
        Registrarme
    </button>

    <p class="text-center text-xs text-gray-400 mt-6">
        Al registrarte aceptas nuestros <a href="#" class="underline">Términos y Condiciones</a>.
    </p>

  </div>
</template>