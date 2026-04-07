<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
import apiClient from '@/apiClient'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const activeTab = ref<'account' | 'business'>('account')
const isSaving = ref(false)

// Estado del formulario de cuenta (Todos los usuarios)
const accountForm = ref({
  fullName: '',
  email: '',
  password: '', // Opcional, solo si quiere cambiarla
})

const businessForm = ref({
  businessName: '',
  phone: '',
  category: 'Uñas',
  bio: '',
  services: [] as Array<{ name: string; price: number; duration: string }>,
  portfolio: [] as string[],
})

const isStylist = computed(() => {
  const role = authStore.user?.role || authStore.me?.role
  return role?.toLowerCase() === 'stylist'
})

// Función para inicializar los datos desde el store
const isLoadingDetails = ref(false)

const loadData = async () => {
  if (authStore.me) {
    accountForm.value.fullName = authStore.me.fullName || ''
    accountForm.value.email = authStore.me.email || authStore.user?.email || ''

    // El payload de /me tiene el rol
    const role = authStore.me.role || authStore.user?.role
    const stylistId = authStore.me.stylistId || authStore.user?.stylistId

    if (role?.toLowerCase() === 'stylist' && stylistId) {
      isLoadingDetails.value = true
      try {
        const { data } = await apiClient.get(`/stylists/detailed/${stylistId}`)

        businessForm.value.businessName = data.businessName || ''
        businessForm.value.phone = data.phone || ''
        businessForm.value.category = data.category || 'Uñas'
        businessForm.value.bio = data.bio || ''

        if (data.services) {
          businessForm.value.services = data.services.map((s: any) => ({
            name: s.name,
            price: Number(s.price),
            duration: s.duration,
          }))
        }

        if (data.portfolio) {
          businessForm.value.portfolio = data.portfolio.map((p: any) => p.imageUrl)
        }
      } catch (error) {
        console.error('Error al cargar detalles del estilista:', error)
      } finally {
        isLoadingDetails.value = false
      }
    }
  } else if (authStore.user) {
    accountForm.value.email = authStore.user.email || ''
  }
}

onMounted(() => {
  loadData()
})

// --- Lógica del Portafolio ---
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handlePortfolioUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  if (businessForm.value.portfolio.length + files.length > 5) {
    alert('Solo puedes tener un máximo de 5 fotos en tu portafolio.')
    target.value = ''
    return
  }

  isUploading.value = true
  const formData = new FormData()

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (file) formData.append('files', file)
  }

  try {
    const { data } = await apiClient.post('/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (data.urls) {
      businessForm.value.portfolio.push(...data.urls)
    }
  } catch (error) {
    console.error('Error subiendo fotos:', error)
    alert('Hubo un error al subir las imágenes.')
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

const removePhoto = (index: number) => {
  businessForm.value.portfolio.splice(index, 1)
}

// --- Lógica de Servicios ---
const newService = ref({ name: '', price: '', duration: '' })

const addService = () => {
  if (newService.value.name && newService.value.price) {
    businessForm.value.services.push({
      name: newService.value.name,
      price: parseInt(newService.value.price),
      duration: newService.value.duration || 'N/A',
    })
    newService.value = { name: '', price: '', duration: '' }
  }
}

const removeService = (index: number) => {
  businessForm.value.services.splice(index, 1)
}

// --- Lógica de Guardado ---
const saveChanges = async () => {
  isSaving.value = true

  try {
    if (activeTab.value === 'account') {
      // 1. Guardar datos básicos
      const payload: any = {
        fullName: accountForm.value.fullName,
        email: accountForm.value.email,
      }
      if (accountForm.value.password.trim() !== '') {
        payload.password = accountForm.value.password
      }

      const success = await authStore.updateUser(payload)
      if (!success) throw new Error('Fallo al actualizar tu cuenta')
      accountForm.value.password = '' // Limpiar contraseña por seguridad
    } else if (activeTab.value === 'business' && isStylist.value) {
      // 2. Guardar datos de negocio
      const success = await authStore.updateStylistProfile(businessForm.value)
      if (!success) throw new Error('Fallo al actualizar el perfil de negocio')
    }

    notificationStore.showSuccess('¡Cambios guardados con éxito!')
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    notificationStore.showError(error.message || 'Error al guardar los cambios.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen pb-24">
    <!-- Header Fijo -->
    <nav
      class="bg-white sticky top-0 left-0 w-full z-30 px-4 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center h-14"
    >
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition p-1">
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </button>
      <h1 class="font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
        Editar Perfil
      </h1>
      <button
        @click="saveChanges"
        :disabled="isSaving"
        class="text-pink-600 font-bold text-sm bg-pink-50 px-3 py-1.5 rounded-lg active:scale-95 transition flex items-center gap-2"
        :class="{ 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-100': isSaving }"
      >
        <span v-if="!isSaving">Guardar</span>
        <i v-else class="fa-solid fa-circle-notch fa-spin"></i>
      </button>
    </nav>

    <!-- Tabs (Solo si es Estilista) -->
    <div v-if="isStylist" class="flex p-1 bg-gray-200 mt-4 mx-4 rounded-xl">
      <button
        @click="activeTab = 'account'"
        class="flex-1 py-1.5 text-sm font-bold rounded-lg transition"
        :class="
          activeTab === 'account'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Mi Cuenta
      </button>
      <button
        @click="activeTab = 'business'"
        class="flex-1 py-1.5 text-sm font-bold rounded-lg transition"
        :class="
          activeTab === 'business'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Mi Negocio
      </button>
    </div>

    <main class="max-w-md mx-auto px-4 pt-6 space-y-6">
      <!-- PESTAÑA: CUENTA -->
      <div v-if="activeTab === 'account' || !isStylist" class="animate-fade-in space-y-4">
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 class="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 mb-3">
            Datos Personales
          </h2>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Nombre Completo</label>
            <input
              v-model="accountForm.fullName"
              type="text"
              class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
              >Correo Electrónico</label
            >
            <input
              v-model="accountForm.email"
              type="email"
              class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
            />
          </div>
        </div>

        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 class="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 mb-3">
            Seguridad
          </h2>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Nueva Contraseña</label>
            <input
              v-model="accountForm.password"
              type="password"
              placeholder="Deja en blanco para no cambiarla"
              class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
            />
          </div>
        </div>
      </div>

      <!-- PESTAÑA: NEGOCIO (Solo estilistas) -->
      <div v-if="activeTab === 'business' && isStylist" class="animate-fade-in space-y-6">
        <div v-if="isLoadingDetails" class="flex justify-center items-center py-10">
          <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-3xl"></i>
        </div>

        <template v-else>
          <!-- Info Principal -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 class="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 mb-3">
              Información del Negocio
            </h2>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                >Nombre Artístico / Negocio</label
              >
              <input
                v-model="businessForm.businessName"
                type="text"
                class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                >Teléfono Celular (WhatsApp)</label
              >
              <div class="relative flex items-center">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 3 2"
                    class="w-5 h-auto mr-1.5 rounded-[1px] shadow-sm"
                  >
                    <path fill="#fcd116" d="M0 0h3v2H0z" />
                    <path fill="#003893" d="M0 1h3v1H0z" />
                    <path fill="#ce1126" d="M0 1.5h3v.5H0z" />
                  </svg>
                  <span class="text-sm font-bold text-gray-600 border-r border-gray-300 pr-2 mr-2"
                    >+57</span
                  >
                </div>
                <input
                  v-model="businessForm.phone"
                  @input="businessForm.phone = businessForm.phone.replace(/[\\s-]/g, '')"
                  type="tel"
                  placeholder="3001234567"
                  class="w-full bg-gray-50 border border-gray-200 p-3 pl-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
                />
              </div>
              <p class="text-[10px] text-gray-400 mt-1.5 ml-1">
                Escríbelo sin espacios ni guiones.
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
                >Categoría Principal</label
              >
              <select
                v-model="businessForm.category"
                class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
              >
                <option value="Uñas">Uñas</option>
                <option value="Cabello">Cabello</option>
                <option value="Barbería">Barbería</option>
                <option value="Facial">Facial</option>
                <option value="Corporal">Corporal</option>
                <option value="Maquillaje">Maquillaje</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Biografía</label>
              <textarea
                v-model="businessForm.bio"
                rows="3"
                class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Portafolio -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 mb-3">
              Portafolio
            </h2>

            <div v-if="businessForm.portfolio.length > 0" class="grid grid-cols-3 gap-3 mb-4">
              <div
                v-for="(url, index) in businessForm.portfolio"
                :key="index"
                class="aspect-square rounded-xl overflow-hidden relative group shadow-sm border border-gray-100"
              >
                <img :src="url" class="w-full h-full object-cover" />
                <button
                  @click.stop="removePhoto(index)"
                  class="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition shadow-sm"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <button
              @click="triggerFileInput"
              :disabled="isUploading"
              class="w-full bg-pink-50 border border-pink-200 text-pink-600 font-bold py-3 rounded-xl text-sm transition flex justify-center items-center h-12"
              :class="
                isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-100 active:scale-95'
              "
            >
              <span v-if="!isUploading"><i class="fa-solid fa-plus mr-1"></i> Añadir Foto</span>
              <i v-else class="fa-solid fa-circle-notch fa-spin text-lg"></i>
            </button>
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              multiple
              accept="image/*"
              @change="handlePortfolioUpload"
            />
          </div>

          <!-- Servicios -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 mb-3">
              Tus Servicios
            </h2>

            <div class="space-y-2 mb-4">
              <div
                v-for="(serv, index) in businessForm.services"
                :key="index"
                class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h4 class="font-bold text-sm text-gray-800">{{ serv.name }}</h4>
                  <p class="text-xs text-gray-500">
                    {{ serv.duration }} • ${{ Number(serv.price).toLocaleString() }}
                  </p>
                </div>
                <button
                  @click="removeService(index)"
                  class="text-gray-400 hover:text-red-500 transition p-2 border border-transparent hover:bg-white hover:border-red-100 rounded-lg"
                >
                  <i class="fa-solid fa-trash-can shadow-none"></i>
                </button>
              </div>
            </div>

            <div class="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
              <h3 class="font-bold text-xs text-gray-500 mb-2">Añadir Nuevo Servicio</h3>
              <div class="space-y-2">
                <input
                  v-model="newService.name"
                  type="text"
                  placeholder="Nombre (ej: Manicure)"
                  class="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm"
                />
                <div class="flex gap-2">
                  <input
                    v-model="newService.price"
                    type="number"
                    placeholder="Precio ($)"
                    class="w-2/3 bg-white border border-gray-200 p-2.5 rounded-lg text-sm"
                  />
                  <input
                    v-model="newService.duration"
                    type="text"
                    placeholder="Tiempo"
                    class="w-1/3 bg-white border border-gray-200 p-2.5 rounded-lg text-sm text-center"
                  />
                </div>
                <button
                  @click="addService"
                  :disabled="!newService.name || !newService.price"
                  class="w-full font-bold py-2 rounded-lg text-xs transition"
                  :class="
                    newService.name && newService.price
                      ? 'bg-gray-800 text-white hover:bg-black'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  "
                >
                  Agregar a la lista
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Ocultar flechas numéricas */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
