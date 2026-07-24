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
  <div class="relative flex flex-col justify-center bg-white px-6 min-h-screen overflow-hidden">
    <div
      class="-top-10 -right-10 absolute bg-black opacity-5 blur-3xl rounded-full w-64 h-64"
    ></div>
    <div
      class="-bottom-10 -left-10 absolute bg-black opacity-5 blur-3xl rounded-full w-64 h-64"
    ></div>

    <div class="z-10 relative">
      <div class="mb-10 text-center">
        <h1
          class="mb-2 font-black text-black text-4xl tracking-tighter"
        >
          GlowYou
        </h1>
        <p class="text-gray-400 text-sm">Tus servicios de belleza, a un clic de distancia...</p>
        <p v-if="authStore.errLoginMsg" class="mt-2 text-red-500 text-sm">{{ authStore.errLoginMsg }}</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block mb-1 ml-1 font-bold text-gray-700 text-xs">Correo Electrónico</label>
          <div
            class="flex items-center bg-gray-50 px-4 py-3 border border-gray-100 focus-within:border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-black transition"
          >
            <i class="mr-3 text-gray-400 fa-regular fa-envelope"></i>
            <input
              v-model="email"
              type="email"
              placeholder="hola@ejemplo.com"
              class="bg-transparent focus:outline-none w-full font-medium text-gray-700 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block mb-1 ml-1 font-bold text-gray-700 text-xs">Contraseña</label>
          <div
            class="flex items-center bg-gray-50 px-4 py-3 border border-gray-100 focus-within:border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-black transition"
          >
            <i class="mr-3 text-gray-400 fa-solid fa-lock"></i>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="bg-transparent focus:outline-none w-full font-medium text-gray-700 text-sm"
            />
          </div>
        </div>

        <button
          @click="handleLogin"
          class="bg-gray-900 hover:bg-black shadow-lg py-4 rounded-2xl w-full font-bold text-white active:scale-[0.98] transition transform"
        >
          Iniciar Sesión
        </button>
      </div>

      <div class="space-y-3 pt-6 text-center">
        <p class="text-gray-500 text-sm">
          ¿Buscas servicios de belleza?
          <RouterLink to="/registro-cliente" class="font-bold text-black hover:underline"
            >Adquierelos aquí como cliente</RouterLink
          >
        </p>
        <div class="inline-block bg-gray-100 px-4 py-2 rounded-full">
          <p class="font-medium text-black text-xs">
            ¿Eres profesional?
            <RouterLink to="/registro-estilista" class="ml-1 font-bold underline"
              >Crea tu perfil como profesional de la belleza</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
