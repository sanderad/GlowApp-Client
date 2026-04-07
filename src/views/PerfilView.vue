<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import apiClient from '@/apiClient'

const router = useRouter()
const authStore = useAuthStore()

const isUploadingPhoto = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// --- DATOS DEL USUARIO (Dinámicos) ---
const userProfile = computed(() => {
  const me = authStore.me as any
  const base = authStore.user

  return {
    name: me?.fullName || base?.name || 'Cargando...',
    email: me?.email || base?.email || '',
    image:
      me?.photoUrl ||
      base?.photo ||
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: me?.role || base?.role || 'client',
    stylistId: me?.stylistId || base?.stylistId || null,
  }
})

const isStylist = computed(() => userProfile.value.role?.toLowerCase() === 'stylist')

const isAdmin = computed(() => userProfile.value.role?.toLowerCase() === 'admin')

const isAccountExpired = computed(
  () =>
    userProfile.value.role?.toLowerCase() === 'stylist' &&
    (authStore.me as any)?.accountExpired === true,
)

const logout = () => {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    authStore.logout()
    window.location.href = '/login'
  }
}

const goToEdit = () => {
  router.push('/perfil/editar')
}

const goToAdmin = () => {
  router.push('/admin')
}

const goToPublicProfile = () => {
  if (userProfile.value.stylistId) {
    router.push(`/estilista/${userProfile.value.stylistId}`)
  } else {
    alert('Error: No se encontró el ID de tu perfil público.')
  }
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingPhoto.value = true
  const formData = new FormData()
  formData.append('file', file) // NOTA: Si el backend pide 'image' en vez de 'file', ajústalo aquí. Usamos /uploads/single como sugerido.

  try {
    const { data } = await apiClient.post('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (data.url) {
      // Actualizamos UI en tiempo real
      authStore.updateProfilePhoto(data.url)

      // Enviamos el PUT silencioso para asegurarnos de que el backend guarde el cambio en la entidad base
      await apiClient.put('/users/me', { photoUrl: data.url }) // Asumiendo que /users/me acepta parciales
    }
  } catch (error) {
    console.error('Error subiendo foto de perfil:', error)
    alert('Hubo un error al actualizar tu avatar.')
  } finally {
    isUploadingPhoto.value = false
    target.value = ''
  }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-24">
    <div
      class="relative bg-linear-to-r from-pink-500 via-purple-500 to-indigo-600 pb-24 pt-6 px-6 rounded-b-[3rem] shadow-lg shadow-purple-200"
    >
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-white font-bold text-xl">Mi Perfil</h1>
        <button
          class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition"
        >
          <i class="fa-solid fa-gear text-lg"></i>
        </button>
      </div>

      <div class="flex flex-col items-center">
        <h2 class="text-white font-black text-2xl tracking-tight">{{ userProfile.name }}</h2>
        <p class="text-purple-100 text-sm font-medium">{{ userProfile.email }}</p>
        <span
          v-if="isStylist"
          class="mt-2 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/30"
        >
          Cuenta Profesional
        </span>
        <span
          v-if="isAdmin"
          class="mt-2 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/30"
        >
          Cuenta Administrador
        </span>
      </div>
    </div>

    <div class="relative -mt-16 mb-6 flex justify-center">
      <div class="relative">
        <div class="w-32 h-32 rounded-full p-1 bg-white shadow-xl relative overflow-hidden group">
          <img :src="userProfile.image" class="w-full h-full rounded-full object-cover" />

          <div
            v-if="isUploadingPhoto"
            class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full z-10"
          >
            <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-3xl"></i>
          </div>
        </div>

        <button
          @click="fileInput?.click()"
          :disabled="isUploadingPhoto"
          class="absolute bottom-1 right-1 bg-gray-900 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md hover:scale-110 transition active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <i class="fa-solid fa-camera text-xs"></i>
        </button>

        <!-- Input file oculto -->
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept="image/*"
          @change="handlePhotoUpload"
        />
      </div>
    </div>

    <main class="max-w-md mx-auto px-4 space-y-4">
      <!-- Alerta de Cuenta Suspendida -->
      <div
        v-if="isAccountExpired"
        class="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm text-center mb-4"
      >
        <div
          class="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <i class="fa-solid fa-triangle-exclamation text-lg"></i>
        </div>
        <h3 class="font-bold text-red-800 text-sm mb-1">Cuenta Suspendida</h3>
        <p class="text-[11px] text-red-600 mb-4 px-2">
          Tu perfil público y chats están desactivados porque tu suscripción ha vencido.
        </p>
        <a
          :href="`https://wa.me/573128285881?text=${encodeURIComponent('Hola Dulfary, quiero renovar mi cuenta en GlowApp. Mi nombre es ' + (authStore.me?.fullName || ''))}`"
          target="_blank"
          class="inline-flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-md shadow-red-200 hover:bg-red-600 transition text-xs"
        >
          <i class="fa-brands fa-whatsapp text-sm"></i> Renovar ahora
        </a>
      </div>

      <!-- Panel de Opciones de Negocio (Solo Estilistas) -->
      <div
        v-if="isStylist"
        class="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-2 shadow-lg mb-4 text-white"
      >
        <button
          @click="goToEdit"
          class="w-full flex items-center p-3 hover:bg-white/10 rounded-xl transition group"
        >
          <div
            class="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mr-4 group-hover:bg-pink-500/30 transition border border-pink-500/20"
          >
            <i class="fa-solid fa-store"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-white text-sm">Administrar Mi Negocio</h3>
            <p class="text-xs text-gray-400">Servicios, Portafolio, Biografía</p>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-500 text-xs"></i>
        </button>

        <div class="h-px bg-white/10 mx-14"></div>

        <button
          @click="goToPublicProfile"
          class="w-full flex items-center p-3 hover:bg-white/10 rounded-xl transition group"
        >
          <div
            class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mr-4 group-hover:bg-blue-500/30 transition border border-blue-500/20"
          >
            <i class="fa-solid fa-eye"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-white text-sm">Ver Mi Perfil Público</h3>
            <p class="text-xs text-gray-400">Así te ven los clientes</p>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-500 text-xs"></i>
        </button>
      </div>

      <!-- Panel de Administración (Solo Admin) -->
      <div
        v-if="isAdmin"
        class="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-2 shadow-lg mb-4 text-white"
      >
        <button
          @click="goToAdmin"
          class="w-full flex items-center p-3 hover:bg-white/10 rounded-xl transition group"
        >
          <div
            class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mr-4 group-hover:bg-blue-500/30 transition border border-blue-500/20"
          >
            <i class="fa-solid fa-user-pen"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-white text-sm">Administrar Perfiles</h3>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-500 text-xs"></i>
        </button>
      </div>

      <div class="bg-white rounded-2xl p-2 shadow-sm shadow-gray-100 border border-gray-50">
        <button
          @click="goToEdit"
          class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group"
        >
          <div
            class="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center mr-4 group-hover:bg-pink-100 transition"
          >
            <i class="fa-solid fa-user-pen"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-gray-800 text-sm">Editar Datos Personales</h3>
            <p v-if="isStylist" class="text-[10px] text-gray-400">Nombre, Correo, Clave</p>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
        </button>
      </div>

      <div class="bg-white rounded-2xl p-2 shadow-sm shadow-gray-100 border border-gray-50">
        <button
          @click="router.push('/perfil/ayuda')"
          class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group"
        >
          <div
            class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition"
          >
            <i class="fa-solid fa-circle-question"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-gray-800 text-sm">Ayuda y Soporte</h3>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
        </button>

        <div class="h-px bg-gray-50 mx-14"></div>

        <button
          @click="router.push('/perfil/privacidad')"
          class="w-full flex items-center p-3 hover:bg-gray-50 rounded-xl transition group"
        >
          <div
            class="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mr-4 group-hover:bg-orange-100 transition"
          >
            <i class="fa-solid fa-shield"></i>
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
