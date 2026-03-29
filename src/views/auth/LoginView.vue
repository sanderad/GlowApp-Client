<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import RN from '@/router/routeNames'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  // Aquí iría la lógica real con Firebase/Node
  // Por ahora simulamos que entra como usuario normal
  const result = await authStore.login(email.value, password.value)
  if (result) {
    router.push({ name: RN.HOME })
  }
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col justify-center px-6 relative overflow-hidden">
    <div
      class="absolute -top-10 -right-10 w-64 h-64 bg-pink-500 rounded-full opacity-5 blur-3xl"
    ></div>
    <div
      class="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500 rounded-full opacity-5 blur-3xl"
    ></div>

    <div class="relative z-10">
      <div class="text-center mb-10">
        <h1
          class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 tracking-tighter mb-2"
        >
          GlowApp
        </h1>
        <p class="text-gray-400 text-sm">Tu belleza, a un clic de distancia.</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Correo Electrónico</label>
          <div
            class="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition"
          >
            <i class="fa-regular fa-envelope text-gray-400 mr-3"></i>
            <input
              v-model="email"
              type="email"
              placeholder="hola@ejemplo.com"
              class="bg-transparent w-full focus:outline-none text-sm font-medium text-gray-700"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Contraseña</label>
          <div
            class="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition"
          >
            <i class="fa-solid fa-lock text-gray-400 mr-3"></i>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="bg-transparent w-full focus:outline-none text-sm font-medium text-gray-700"
            />
          </div>
        </div>

        <button
          @click="handleLogin"
          class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition transform active:scale-[0.98]"
        >
          Iniciar Sesión
        </button>
      </div>

      <div class="text-center space-y-3 pt-6">
        <p class="text-sm text-gray-500">
          ¿No tienes cuenta?
          <RouterLink to="/registro-cliente" class="text-pink-600 font-bold hover:underline"
            >Regístrate aquí</RouterLink
          >
        </p>
        <div class="inline-block bg-purple-50 px-4 py-2 rounded-full">
          <p class="text-xs text-purple-600 font-medium">
            ¿Eres estilista?
            <RouterLink to="/registro-estilista" class="font-bold underline ml-1"
              >Crea tu perfil profesional</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
