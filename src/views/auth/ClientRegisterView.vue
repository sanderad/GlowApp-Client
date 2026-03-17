<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ClientRegister } from '@/types/auth.types'
import { useAuthStore } from '@/stores/auth.store'

import apiClient from '@/apiClient'

const authStore = useAuthStore()
const router = useRouter()

const form = ref<ClientRegister>({
  fullName: '',
  email: '',
  password: '',
  photoUrl: '',
})

const profilePhotoInput = ref<HTMLInputElement | null>(null)
const isUploadingProfilePhoto = ref(false)

const triggerProfilePhotoInput = () => {
  profilePhotoInput.value?.click()
}

const handleProfilePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  isUploadingProfilePhoto.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await apiClient.post('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (data.url) {
      form.value.photoUrl = data.url
    }
  } catch (error) {
    console.error('Error subiendo foto de perfil:', error)
    alert('Hubo un error al subir la imagen de perfil.')
  } finally {
    isUploadingProfilePhoto.value = false
    target.value = ''
  }
}

const removeProfilePhoto = () => {
  form.value.photoUrl = ''
}

const handleRegister = async () => {
  const result = await authStore.registerClient(form.value)
  if (result) {
    window.location.href = '/'
  }
}
</script>

<template>
  <div class="bg-white h-screen w-full p-6 flex flex-col justify-start relative overflow-hidden">
    <button
      @click="router.back()"
      class="absolute top-6 left-6 text-gray-400 z-10 hover:text-gray-600 transition"
    >
      <i class="fa-solid fa-arrow-left text-xl"></i>
    </button>

    <div class="mt-20 w-full max-w-sm mx-auto">
      <div class="mb-4">
        <h1 class="text-3xl font-black text-gray-900 mb-2">Crear Cuenta</h1>
        <p class="text-gray-500">Únete para agendar tus citas de belleza.</p>
      </div>

      <!-- Avatar Upload Section -->
      <div class="flex justify-center mb-6">
        <div
          v-if="!form.photoUrl"
          @click="triggerProfilePhotoInput"
          class="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 transition relative"
        >
          <div
            v-if="isUploadingProfilePhoto"
            class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full z-10"
          >
            <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-xl"></i>
          </div>
          <i class="fa-solid fa-camera text-xl mb-1"></i>
          <span class="text-[10px] font-bold">Subir Foto</span>
        </div>

        <div v-else class="w-24 h-24 rounded-full relative group shadow-sm border border-gray-100">
          <img :src="form.photoUrl" class="w-full h-full object-cover rounded-full" />
          <button
            @click.stop="removeProfilePhoto"
            class="absolute top-0 right-0 bg-black/50 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition z-20"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <input
          type="file"
          ref="profilePhotoInput"
          class="hidden"
          accept="image/*"
          @change="handleProfilePhotoUpload"
        />
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Nombre Completo</label>
          <input
            v-model="form.fullName"
            type="text"
            placeholder="Tu nombre"
            class="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium transition"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Correo</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            class="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium transition"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium transition"
          />
        </div>
      </div>

      <button
        @click="handleRegister"
        class="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 mt-8 hover:bg-pink-700 transition transform active:scale-[0.98]"
      >
        Registrarme
      </button>

      <p class="text-center text-xs text-gray-400 mt-6">
        Al registrarte aceptas nuestros
        <a href="#" class="underline hover:text-pink-600">Términos y Condiciones</a>.
      </p>
    </div>
  </div>
</template>
