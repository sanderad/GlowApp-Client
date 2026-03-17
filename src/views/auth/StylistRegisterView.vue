<script setup lang="ts">
import apiClient from '@/apiClient'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { StylistRegister } from '@/types/auth.types'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const currentStep = ref(1)

const isStep1Valid = computed(() => {
  return (
    stylistForm.value.fullName.trim() !== '' &&
    stylistForm.value.email.trim() !== '' &&
    stylistForm.value.password.trim() !== ''
  )
})

const isStep2Valid = computed(() => {
  return (
    stylistForm.value.phone.trim() !== '' &&
    stylistForm.value.businessName.trim() !== '' &&
    stylistForm.value.category.trim() !== '' &&
    stylistForm.value.bio.trim() !== '' &&
    (stylistForm.value.photoUrl || '').trim() !== ''
  )
})

const isStep3Valid = computed(() => {
  return stylistForm.value.services.length > 0
})

const isStep4Valid = computed(() => {
  return true // El portafolio no es obligatorio por ahora
})

// Datos del formulario
const stylistForm = ref<StylistRegister>({
  // PASO 1: CUENTA
  fullName: '', // Nombre real de la persona
  email: '',
  password: '',
  phone: '',

  businessName: '',
  category: 'Uñas',
  bio: '',
  services: [
    { name: 'Uñas Acrílicas', duration: '2 horas', price: 85000 },
    { name: 'Semipermanente', duration: '45 min', price: 45000 },
  ],
  portfolio: [],
  yearsOfExperience: 1,
  colorTheme: 'purple',
  speciality: 'Profesional en Uñas',
  photoUrl: '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

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
      stylistForm.value.photoUrl = data.url
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
  stylistForm.value.photoUrl = ''
}

// 1. Función "Control Remoto": Activa el click del input oculto
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handlePortfolioUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files // Obtenemos TODOS los archivos, no solo el [0]

  if (!files || files.length === 0) return

  // A. Validación: Máximo 5 fotos en total
  if (stylistForm.value.portfolio.length + files.length > 5) {
    alert('Solo puedes tener un máximo de 5 fotos en tu portafolio.')
    target.value = '' // Limpiar selección
    return
  }

  isUploading.value = true
  const formData = new FormData()

  // B. Agregar todos los archivos al FormData
  // La clave 'files' debe coincidir con upload.array('files') del Backend
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (file) formData.append('files', file)
  }

  try {
    // C. Enviar al endpoint MÚLTIPLE
    const { data } = await apiClient.post('/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // D. El backend devuelve { urls: [...] }. Las agregamos al array.
    if (data.urls) {
      stylistForm.value.portfolio.push(...data.urls)
    }
  } catch (error) {
    console.error('Error subiendo fotos:', error)
    alert('Hubo un error al subir las imágenes.')
  } finally {
    isUploading.value = false
    target.value = '' // Limpiamos el input para permitir subir más si quiere
  }
}

// 4. ELIMINAR FOTO (Por si se arrepiente)
const removePhoto = (index: number) => {
  stylistForm.value.portfolio.splice(index, 1)
}

const isRegistering = ref(false)

const finish = async (): Promise<boolean> => {
  try {
    isRegistering.value = true
    // Enviamos todo el JSON gigante al endpoint de registro
    console.log('finish')
    const success = await authStore.registerStylist(stylistForm.value)
    return success // Éxito
  } catch (error: any) {
    // Manejo de errores
    notificationStore.showError(
      error.message || 'Ocurrió un error inesperado al registrar el perfil.',
    )
    return false // Fallo
  } finally {
    isRegistering.value = false
  }
}

const goToDashboard = () => {
  window.location.href = '/'
}

// Estado para nuevo servicio
const newService = ref({ name: '', price: '', duration: '' })

// Funciones de navegación
const nextStep = async () => {
  if (currentStep.value === 4) {
    console.log('nextStep - attempt finish')
    const success = await finish()
    console.log('success', success)
    if (!success) return // Detiene el avance si falla el registro
  }
  if (currentStep.value < 5) currentStep.value++
}
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}
// Lógica de Servicios
const addService = () => {
  if (newService.value.name && newService.value.price) {
    stylistForm.value.services.push({
      name: newService.value.name,
      price: parseInt(newService.value.price),
      duration: newService.value.duration || 'N/A',
    })
    newService.value = { name: '', price: '', duration: '' } // Reset
  }
}

const removeService = (index: number) => {
  stylistForm.value.services.splice(index, 1)
}
</script>

<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen pb-10">
    <nav
      class="bg-white fixed top-0 left-0 w-full z-50 px-6 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center"
    >
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600">
        <i class="fa-solid fa-arrow-left text-xl"></i>
      </button>
      <h1 class="font-bold text-lg">Crear Perfil Profesional</h1>
      <div class="w-6"></div>
    </nav>

    <main class="max-w-md mx-auto px-6 pt-24">
      <div class="flex justify-between items-center mb-8 relative" v-if="currentStep < 5">
        <div class="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>

        <div
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
          :class="
            currentStep >= 1
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
              : 'bg-gray-200 text-gray-500'
          "
        >
          1
        </div>

        <div
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
          :class="
            currentStep >= 2
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
              : 'bg-gray-200 text-gray-500'
          "
        >
          2
        </div>

        <div
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
          :class="
            currentStep >= 3
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
              : 'bg-gray-200 text-gray-500'
          "
        >
          3
        </div>

        <div
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
          :class="
            currentStep >= 4
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
              : 'bg-gray-200 text-gray-500'
          "
        >
          4
        </div>
      </div>

      <div v-if="currentStep === 1" class="animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-gray-900 mb-2">Datos de Acceso 🔐</h2>
          <p class="text-gray-500 text-sm">
            Primero, crea tus credenciales para administrar tu negocio.
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
              >Nombre Completo (Tu nombre real)</label
            >
            <input
              v-model="stylistForm.fullName"
              type="text"
              placeholder="Ej: Laura Gómez"
              class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
              >Correo Electrónico</label
            >
            <input
              v-model="stylistForm.email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Contraseña</label>
            <input
              v-model="stylistForm.password"
              type="password"
              placeholder="••••••••"
              class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
            />
          </div>
        </div>

        <button
          @click="nextStep"
          :disabled="!isStep1Valid"
          class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg mt-8 transition"
          :class="!isStep1Valid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'"
        >
          Siguiente Paso <i class="fa-solid fa-arrow-right ml-2"></i>
        </button>

        <p class="text-center text-xs text-gray-400 mt-6">
          Al continuar aceptas nuestros términos de uso para profesionales.
        </p>
      </div>

      <div v-if="currentStep === 2" class="animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-gray-900 mb-2">¿Quién eres? ✨</h2>
          <p class="text-gray-500 text-sm">Cuéntanos sobre ti para que los clientes te conozcan.</p>
        </div>

        <div class="flex justify-center mb-6">
          <div
            v-if="!stylistForm.photoUrl"
            @click="triggerProfilePhotoInput"
            class="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 transition relative"
          >
            <div
              v-if="isUploadingProfilePhoto"
              class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full z-10"
            >
              <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-2xl"></i>
            </div>
            <i class="fa-solid fa-camera text-2xl mb-1"></i>
            <span class="text-[10px] font-bold">Subir Foto</span>
          </div>

          <div
            v-else
            class="w-28 h-28 rounded-full relative group shadow-sm border border-gray-100"
          >
            <img :src="stylistForm.photoUrl" class="w-full h-full object-cover rounded-full" />
            <button
              @click.stop="removeProfilePhoto"
              class="absolute top-0 right-0 bg-black/50 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs transition z-20"
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
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
              >Nombre Artístico / Negocio</label
            >
            <input
              v-model="stylistForm.businessName"
              type="text"
              placeholder="Ej: Ana María Nails"
              class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
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
                v-model="stylistForm.phone"
                @input="stylistForm.phone = stylistForm.phone.replace(/[\\s-]/g, '')"
                type="tel"
                placeholder="3001234567"
                class="w-full bg-white border border-gray-200 p-3 pl-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm"
              />
            </div>
            <p class="text-[10px] text-gray-400 mt-1.5 ml-1">Escríbelo sin espacios ni guiones.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1"
              >Categoría Principal</label
            >
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="cat in ['Uñas', 'Cabello', 'Barbería', 'Facial']"
                :key="cat"
                @click="stylistForm.category = cat"
                class="border py-3 rounded-xl text-xs transition font-bold"
                :class="
                  stylistForm.category === cat
                    ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500'
                "
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Biografía Corta</label>
            <textarea
              v-model="stylistForm.bio"
              rows="3"
              class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none"
              placeholder="Ej: Experta en acrilicas y diseño a mano alzada con 3 años de experiencia..."
            ></textarea>
          </div>
        </div>

        <div class="mt-6 mb-4 flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <i class="fa-solid fa-lightbulb text-blue-500 mt-0.5"></i>
          <p class="text-xs text-blue-700 leading-snug">
            <strong>Tip:</strong> No te preocupes si no tienes la biografía perfecta ahora. Podrás
            editar todos estos datos más adelante desde tu perfil.
          </p>
        </div>

        <div class="flex gap-3 mt-2">
          <button
            @click="prevStep"
            class="w-1/3 bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl"
          >
            Atrás
          </button>
          <button
            @click="nextStep"
            :disabled="!isStep2Valid"
            class="w-2/3 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg transition"
            :class="!isStep2Valid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'"
          >
            Siguiente <i class="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>

      <div v-if="currentStep === 3" class="animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-gray-900 mb-2">Tus Servicios 💰</h2>
          <p class="text-gray-500 text-sm">Agrega lo que ofreces y tus precios estimados.</p>
        </div>

        <div class="space-y-3 mb-6">
          <div
            v-for="(serv, index) in stylistForm.services"
            :key="index"
            class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center"
          >
            <div>
              <h4 class="font-bold text-sm text-gray-800">{{ serv.name }}</h4>
              <p class="text-xs text-gray-400">{{ serv.duration }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold text-pink-600 text-sm"
                >${{ Number(serv.price).toLocaleString() }}</span
              >
              <button @click="removeService(index)" class="text-gray-300 hover:text-red-500">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-gray-100 p-4 rounded-2xl border border-dashed border-gray-300">
          <h3 class="font-bold text-xs uppercase text-gray-500 mb-3">Nuevo Servicio</h3>
          <div class="space-y-3">
            <input
              v-model="newService.name"
              type="text"
              placeholder="Nombre (ej: Manicure)"
              class="w-full bg-white border-0 p-3 rounded-xl text-sm shadow-sm"
            />
            <div class="flex gap-3">
              <input
                v-model="newService.price"
                type="number"
                placeholder="Precio ($)"
                class="w-2/3 bg-white border-0 p-3 rounded-xl text-sm shadow-sm"
              />
              <input
                v-model="newService.duration"
                type="text"
                placeholder="Tiempo"
                class="w-1/3 bg-white border-0 p-3 rounded-xl text-sm shadow-sm text-center"
              />
            </div>
            <button
              @click="addService"
              class="w-full bg-white border-2 border-pink-500 text-pink-600 font-bold py-2 rounded-xl text-sm hover:bg-pink-50 transition"
            >
              <i class="fa-solid fa-plus mr-1"></i> Agregar a la lista
            </button>
          </div>
        </div>

        <div class="mt-6 mb-4 flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <i class="fa-solid fa-clock text-blue-500 mt-0.5"></i>
          <p class="text-xs text-blue-700 leading-snug">
            <strong>¿Tienes prisa?</strong> Agrega solo tus servicios principales por ahora. Podrás
            añadir el resto de tu lista de precios con calma cuando quieras.
          </p>
        </div>

        <div class="flex gap-3 mt-2">
          <button
            @click="prevStep"
            class="w-1/3 bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl"
          >
            Atrás
          </button>
          <button
            @click="nextStep"
            :disabled="!isStep3Valid"
            class="w-2/3 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg transition"
            :class="!isStep3Valid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'"
          >
            Siguiente <i class="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>

      <div v-if="currentStep === 4" class="animate-fade-in">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-gray-900 mb-2">Tu Portafolio 📸</h2>
          <p class="text-gray-500 text-sm">Sube tus mejores fotos. ¡Esto es lo que vende!</p>
        </div>

        <div
          @click="triggerFileInput"
          class="bg-pink-50 border-2 border-dashed border-pink-300 rounded-3xl p-8 text-center mb-6 cursor-pointer hover:bg-pink-100 transition group relative"
        >
          <div
            v-if="isUploading"
            class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-3xl z-10"
          >
            <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-2xl"></i>
          </div>

          <div
            class="w-16 h-16 bg-white text-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition"
          >
            <i class="fa-solid fa-cloud-arrow-up text-2xl"></i>
          </div>
          <h3 class="font-bold text-pink-900">Toca para subir fotos</h3>
          <p class="text-xs text-pink-400 mt-1">Soporta JPG, PNG (Máx 5)</p>
        </div>

        <input
          type="file"
          ref="fileInput"
          class="hidden"
          multiple
          accept="image/*"
          @change="handlePortfolioUpload"
        />

        <div
          v-if="stylistForm.portfolio.length > 0"
          class="grid grid-cols-3 gap-3 mb-6 animate-fade-in"
        >
          <div
            v-for="(url, index) in stylistForm.portfolio"
            :key="index"
            class="aspect-square rounded-xl overflow-hidden relative group shadow-sm border border-gray-100"
          >
            <img :src="url" class="w-full h-full object-cover" />

            <button
              @click.stop="removePhoto(index)"
              class="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <label class="flex items-start gap-3 cursor-pointer">
            <div class="relative flex items-center">
              <input
                type="checkbox"
                checked
                class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:bg-pink-500 checked:border-pink-500 focus:ring-2 focus:ring-pink-300"
              />
              <i
                class="fa-solid fa-check text-white absolute left-1 top-1 text-xs opacity-0 peer-checked:opacity-100 pointer-events-none"
              ></i>
            </div>
            <p class="text-xs text-gray-500 leading-snug select-none">
              Declaro que soy el autor original de estas fotos y libero a
              <span class="font-bold text-gray-700">GlowApp</span> de cualquier reclamo por derechos
              de autor.
              <a href="#" class="text-pink-600 underline">Leer términos legales.</a>
            </p>
          </label>
        </div>

        <div class="mt-6 mb-4 flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <i class="fa-solid fa-camera-rotate text-blue-500 mt-0.5"></i>
          <p class="text-xs text-blue-700 leading-snug">
            <strong>Tip:</strong> Puedes empezar con una sola foto. Después podrás subir más y
            organizar tu galería desde tu perfil.
          </p>
        </div>

        <div class="flex gap-3 mt-4">
          <button
            @click="prevStep"
            :disabled="isRegistering"
            class="w-1/3 bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl disabled:opacity-50"
          >
            Atrás
          </button>
          <button
            @click="nextStep"
            :disabled="!isStep4Valid || isRegistering"
            class="w-2/3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg transition flex items-center justify-center relative"
            :class="
              !isStep4Valid || isRegistering ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            "
          >
            <span :class="{ 'opacity-0': isRegistering }">¡Publicar Perfil! 🚀</span>
            <i v-if="isRegistering" class="fa-solid fa-circle-notch fa-spin absolute text-xl"></i>
          </button>
        </div>
      </div>

      <div v-if="currentStep === 5" class="animate-fade-in text-center pt-10">
        <div
          class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-bounce"
        >
          <i class="fa-solid fa-check text-4xl"></i>
        </div>

        <h2 class="text-3xl font-black text-gray-900 mb-2">¡Perfil Creado! 🎉</h2>
        <p class="text-gray-500 text-sm mb-8 px-6">
          Tu perfil ya es visible para cientos de clientes en tu zona.
        </p>

        <div
          class="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white shadow-xl mx-2 relative overflow-hidden mb-8"
        >
          <div
            class="absolute -top-10 -right-10 w-42 h-32 bg-pink-500 rounded-full opacity-30 blur-2xl"
          ></div>

          <h3 class="text-lg font-bold mb-1">Plan Profesional</h3>
          <div class="text-3xl font-black text-pink-400 mb-2">
            $0 <span class="text-sm text-gray-400 font-normal">/primer mes</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed mb-4">
            Disfruta de **30 Días Gratis** de visibilidad total. Aprovecha para conseguir tus
            primeros clientes sin costo.
          </p>
          <div
            class="bg-white/10 rounded-lg p-2 text-[10px] text-center text-gray-300 border border-white/10"
          >
            Tu prueba vence el: <span class="text-white font-bold">13 Enero 2026</span>
          </div>
        </div>

        <button
          @click="goToDashboard"
          class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition"
        >
          Ir a mi Panel
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
