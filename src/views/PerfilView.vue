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
    router.push('/login')
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
  <div class="bg-gray-50 pb-24 min-h-screen">
    <div
      class="relative bg-black shadow-gray-200 shadow-lg px-6 pt-6 pb-24 rounded-b-[3rem]"
    >
      <div class="flex justify-between items-center mb-6">
        <h1 class="font-bold text-white text-xl">Mi Perfil</h1>
      </div>

      <div class="flex flex-col items-center">
        <h2 class="font-black text-white text-2xl tracking-tight">{{ userProfile.name }}</h2>
        <p class="font-medium text-gray-500 text-sm">{{ userProfile.email }}</p>
        <span
          v-if="isStylist"
          class="bg-white/20 backdrop-blur-sm mt-2 px-3 py-1 border border-white/30 rounded-full font-bold text-[10px] text-white uppercase tracking-wider"
        >
          Cuenta Profesional
        </span>
        <span
          v-if="isAdmin"
          class="bg-white/20 backdrop-blur-sm mt-2 px-3 py-1 border border-white/30 rounded-full font-bold text-[10px] text-white uppercase tracking-wider"
        >
          Cuenta Administrador
        </span>
      </div>
    </div>

    <div class="relative flex justify-center -mt-16 mb-6">
      <div class="relative">
        <div class="group relative bg-white shadow-xl p-1 rounded-full w-32 h-32 overflow-hidden">
          <img :src="userProfile.image" class="rounded-full w-full h-full object-cover" />

          <div
            v-if="isUploadingPhoto"
            class="z-10 absolute inset-0 flex justify-center items-center bg-white/70 rounded-full"
          >
            <i class="text-black text-3xl fa-solid fa-circle-notch fa-spin"></i>
          </div>
        </div>

        <button
          @click="fileInput?.click()"
          :disabled="isUploadingPhoto"
          class="right-1 bottom-1 absolute flex justify-center items-center bg-gray-900 disabled:opacity-50 shadow-md border-2 border-white rounded-full w-8 h-8 text-white hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          <i class="text-xs fa-solid fa-camera"></i>
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

    <main class="space-y-4 mx-auto px-4 max-w-md">
      <!-- Alerta de Cuenta Suspendida -->
      <div
        v-if="isAccountExpired"
        class="bg-red-50 shadow-sm mb-4 p-4 border border-red-100 rounded-2xl text-center"
      >
        <div
          class="flex justify-center items-center bg-red-100 mx-auto mb-3 rounded-full w-10 h-10 text-red-500"
        >
          <i class="text-lg fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="mb-1 font-bold text-red-800 text-sm">Cuenta Suspendida</h3>
        <p class="mb-4 px-2 text-[11px] text-red-600">
          Tu perfil público y chats están desactivados porque tu suscripción ha vencido.
        </p>
        <a
          :href="`https://wa.me/573128285881?text=${encodeURIComponent('Hola Dulfary, quiero renovar mi cuenta en GlowYou. Mi nombre es ' + (authStore.me?.fullName || ''))}`"
          target="_blank"
          class="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-md shadow-red-200 px-4 py-2 rounded-xl font-bold text-white text-xs transition"
        >
          <i class="text-sm fa-brands fa-whatsapp"></i> Renovar ahora
        </a>
      </div>

      <!-- Panel de Opciones de Negocio (Solo Estilistas) -->
      <div
        v-if="isStylist"
        class="bg-gradient-to-r from-gray-900 to-black shadow-lg mb-4 p-2 rounded-2xl text-white"
      >
        <button
          @click="goToEdit"
          class="group flex items-center hover:bg-white/10 p-3 rounded-xl w-full transition"
        >
          <div
            class="flex justify-center items-center bg-blue-500/20 group-hover:bg-blue-500/30 mr-4 border border-black/20 rounded-xl w-10 h-10 text-blue-400 transition"
          >
            <i class="fa-solid fa-store"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-white text-sm">Administrar Mi Negocio</h3>
            <p class="text-gray-400 text-xs">Servicios, Portafolio, Biografía</p>
          </div>
          <i class="fa-chevron-right text-gray-500 text-xs fa-solid"></i>
        </button>

        <div class="bg-white/10 mx-14 h-px"></div>

        <button
          @click="goToPublicProfile"
          class="group flex items-center hover:bg-white/10 p-3 rounded-xl w-full transition"
        >
          <div
            class="flex justify-center items-center bg-blue-500/20 group-hover:bg-blue-500/30 mr-4 border border-blue-500/20 rounded-xl w-10 h-10 text-blue-400 transition"
          >
            <i class="fa-solid fa-eye"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-white text-sm">Ver Mi Perfil Público</h3>
            <p class="text-gray-400 text-xs">Así te ven los clientes</p>
          </div>
          <i class="fa-chevron-right text-gray-500 text-xs fa-solid"></i>
        </button>
      </div>

      <!-- Panel de Administración (Solo Admin) -->
      <div
        v-if="isAdmin"
        class="bg-gradient-to-r from-gray-900 to-black shadow-lg mb-4 p-2 rounded-2xl text-white"
      >
        <button
          @click="goToAdmin"
          class="group flex items-center hover:bg-white/10 p-3 rounded-xl w-full transition"
        >
          <div
            class="flex justify-center items-center bg-blue-500/20 group-hover:bg-blue-500/30 mr-4 border border-blue-500/20 rounded-xl w-10 h-10 text-blue-400 transition"
          >
            <i class="fa-solid fa-user-pen"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-white text-sm">Administrar Perfiles</h3>
          </div>
          <i class="fa-chevron-right text-gray-500 text-xs fa-solid"></i>
        </button>
      </div>

      <div class="bg-white shadow-gray-100 shadow-sm p-2 border border-gray-50 rounded-2xl">
        <button
          @click="goToEdit"
          class="group flex items-center hover:bg-gray-50 p-3 rounded-xl w-full transition"
        >
          <div
            class="flex justify-center items-center bg-gray-100 group-hover:bg-gray-100 mr-4 rounded-xl w-10 h-10 text-black transition"
          >
            <i class="fa-solid fa-user-pen"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-gray-800 text-sm">Editar Datos Personales</h3>
            <p v-if="isStylist" class="text-[10px] text-gray-400">Nombre, Correo, Clave</p>
          </div>
          <i class="fa-chevron-right text-gray-300 text-xs fa-solid"></i>
        </button>
      </div>

      <div class="bg-white shadow-gray-100 shadow-sm p-2 border border-gray-50 rounded-2xl">
        <button
          @click="router.push('/perfil/ayuda')"
          class="group flex items-center hover:bg-gray-50 p-3 rounded-xl w-full transition"
        >
          <div
            class="flex justify-center items-center bg-blue-50 group-hover:bg-blue-100 mr-4 rounded-xl w-10 h-10 text-blue-500 transition"
          >
            <i class="fa-solid fa-circle-question"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-gray-800 text-sm">Ayuda y Soporte</h3>
          </div>
          <i class="fa-chevron-right text-gray-300 text-xs fa-solid"></i>
        </button>

        <div class="bg-gray-50 mx-14 h-px"></div>

        <button
          @click="router.push('/perfil/privacidad')"
          class="group flex items-center hover:bg-gray-50 p-3 rounded-xl w-full transition"
        >
          <div
            class="flex justify-center items-center bg-orange-50 group-hover:bg-orange-100 mr-4 rounded-xl w-10 h-10 text-orange-500 transition"
          >
            <i class="fa-solid fa-shield"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-gray-800 text-sm">Privacidad</h3>
          </div>
          <i class="fa-chevron-right text-gray-300 text-xs fa-solid"></i>
        </button>
      </div>

      <button
        @click="logout"
        class="flex justify-center items-center gap-2 bg-white hover:bg-red-50 shadow-sm py-4 border border-red-50 rounded-2xl w-full font-bold text-red-500 text-sm active:scale-[0.98] transition"
      >
        <i class="fa-arrow-right-from-bracket fa-solid"></i> Cerrar Sesión
      </button>

      <p class="mt-6 pb-4 font-medium text-[10px] text-gray-400 text-center">
        GlowYou v1.0.0 • Hecho con ❤️ en Cali
      </p>
    </main>
  </div>
</template>
