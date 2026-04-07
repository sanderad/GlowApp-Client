<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import RN from '@/router/routeNames'

// --- ESTADO GENERAL ---
const adminStore = useAdminStore()
const authStore = useAuthStore()
const searchQuery = ref('')
const isModalOpen = ref(false)

// Estado para el modal de pago
const selectedStylist = ref<any>(null)
const subscriptionType = ref('Mensual ($20.000)')
const paymentMethod = ref<'nequi' | 'efectivo'>('nequi')

onMounted(() => {
  adminStore.loadStylists()
})

// --- COMPUTADAS ---
const stylists = computed(() => {
  return adminStore.stylists.map((s) => {
    const endDate = new Date(s.subscriptionEndsAt)
    const now = new Date()
    const isExpired = endDate < now

    return {
      id: s.id,
      name: s.businessName || s.user?.fullName || 'Estilista',
      image: s.user?.photoUrl || 'https://via.placeholder.com/100',
      status: isExpired ? 'expired' : 'active',
      statusText: isExpired ? 'Suscripción Vencida' : 'Activo',
      plan: 'Plan Profesional',
      expirationDate: endDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      phone: s.phone,
      subscriptionEndsAt: s.subscriptionEndsAt,
    }
  })
})

const activeCount = computed(() => stylists.value.filter((s) => s.status === 'active').length)
const pendingCount = computed(() => stylists.value.filter((s) => s.status === 'expired').length)

// Filtrar estilistas por la barra de búsqueda
const filteredStylists = computed(() => {
  if (!searchQuery.value) return stylists.value
  return stylists.value.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// --- FUNCIONES DEL MODAL ---
const openModal = (stylist: any) => {
  selectedStylist.value = stylist
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedStylist.value = null
  }, 200) // Limpiar después de la animación
}

// Bloquear el scroll del body cuando el modal está abierto
watch(isModalOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const newExpirationDate = computed(() => {
  if (!selectedStylist.value) return ''
  const currentEnd = new Date(selectedStylist.value.subscriptionEndsAt)
  const now = new Date()
  const baseDate = currentEnd < now ? now : currentEnd

  const monthsToAdd = subscriptionType.value.includes('Mensual') ? 1 : 3

  const newDate = new Date(baseDate)
  newDate.setMonth(newDate.getMonth() + monthsToAdd)

  return newDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
})

// Acción simulada de renovar
const confirmRenewal = async () => {
  if (!selectedStylist.value) return

  const monthsToAdd = subscriptionType.value.includes('Mensual') ? 1 : 3
  const success = await adminStore.renewSubscription(
    selectedStylist.value.id,
    monthsToAdd,
    paymentMethod.value,
  )

  if (success) {
    alert(
      `Renovación exitosa para ${selectedStylist.value.name}. Nueva fecha: ${newExpirationDate.value}`,
    )
    closeModal()
  } else {
    alert('Error al renovar la suscripción. Por favor intenta de nuevo.')
  }
}

const logout = () => {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    authStore.logout()
    router.push({ name: RN.LOGIN })
  }
}

const goToProfile = () => {
  router.push({ name: RN.PERFIL })
}
</script>

<template>
  <div class="bg-gray-100 text-gray-800 font-sans min-h-screen pb-20">
    <nav class="bg-gray-900 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-2xl relative z-10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="goToProfile"
            class="w-10 h-10 shrink-0 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-inner hover:bg-gray-700 transition cursor-pointer"
          >
            <i class="fa-solid fa-arrow-left text-white text-sm"></i>
          </button>
          <div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest"
              >Modo Administrador</span
            >
            <h1 class="text-xl font-black max-w-[250px]">Hola, Dulfary 👋</h1>
          </div>
        </div>
        <button
          @click="logout"
          class="w-10 h-10 shrink-0 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-inner hover:bg-gray-700 transition cursor-pointer"
        >
          <i class="fa-solid fa-power-off text-red-400 text-sm"></i>
        </button>
      </div>

      <div class="relative">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-gray-500"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar estilista por nombre..."
          class="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition shadow-inner"
        />
      </div>
    </nav>

    <main class="max-w-md mx-auto px-4 -mt-10 relative z-20 space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-2xl shadow-lg border-b-4 border-green-500">
          <div class="flex justify-between items-start mb-2">
            <div
              class="bg-green-100 w-8 h-8 rounded-lg flex items-center justify-center text-green-600"
            >
              <i class="fa-solid fa-users"></i>
            </div>
            <span class="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold"
              >+12%</span
            >
          </div>
          <p class="text-gray-500 text-xs font-medium uppercase">Socios Activos</p>
          <p class="text-2xl font-black text-gray-900">{{ activeCount }}</p>
        </div>

        <div
          class="bg-white p-4 rounded-2xl shadow-lg border-b-4 border-red-500 relative overflow-hidden"
        >
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full opacity-50"></div>
          <div class="flex justify-between items-start mb-2 relative">
            <div
              class="bg-red-100 w-8 h-8 rounded-lg flex items-center justify-center text-red-600"
            >
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <p class="text-gray-500 text-xs font-medium uppercase">Pagos Pendientes</p>
          <p class="text-2xl font-black text-red-500">{{ pendingCount }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between items-end px-2">
          <h2 class="font-bold text-gray-800 text-lg">Gestión de Suscripciones</h2>
          <button class="text-xs text-pink-600 font-bold hover:underline">
            <i class="fa-solid fa-filter mr-1"></i>Filtrar
          </button>
        </div>

        <div v-if="filteredStylists.length === 0" class="text-center py-8 text-gray-500">
          No se encontraron estilistas con ese nombre.
        </div>

        <div
          v-for="stylist in filteredStylists"
          :key="stylist.id"
          class="bg-white p-4 rounded-2xl shadow-sm border relative overflow-hidden group"
          :class="
            stylist.status === 'expired'
              ? 'border-red-100 shadow-md flex flex-col gap-3'
              : 'border-gray-100 flex items-center justify-between'
          "
        >
          <div
            v-if="stylist.status === 'expired'"
            class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"
          ></div>

          <div class="flex justify-between items-start w-full">
            <div class="flex gap-3 items-center">
              <div class="relative">
                <img
                  :src="stylist.image"
                  class="w-12 h-12 rounded-xl object-cover"
                  :class="{ grayscale: stylist.status === 'expired' }"
                />
                <div
                  class="absolute -bottom-1 -right-1 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                  :class="stylist.status === 'expired' ? 'bg-red-500' : 'bg-green-500 w-4 h-4'"
                >
                  <span v-if="stylist.status === 'expired'">!</span>
                  <i v-else class="fa-solid fa-check text-[8px]"></i>
                </div>
              </div>

              <div>
                <h3
                  class="font-bold text-gray-900"
                  :class="{ 'font-black': stylist.status === 'expired' }"
                >
                  {{ stylist.name }}
                </h3>
                <p
                  class="text-xs font-medium flex items-center gap-1"
                  :class="
                    stylist.status === 'expired' ? 'text-red-500 font-bold' : 'text-green-600'
                  "
                >
                  <i class="fa-solid fa-circle text-[6px]"></i> {{ stylist.statusText }}
                </p>
                <p class="text-[10px] text-gray-400 mt-0.5" v-if="stylist.status === 'expired'">
                  {{ stylist.plan }}
                </p>
                <p class="text-[10px] text-gray-400" v-else>Vence: {{ stylist.expirationDate }}</p>
              </div>
            </div>

            <button v-if="stylist.status === 'expired'" class="text-gray-300 hover:text-gray-600">
              <i class="fa-solid fa-ellipsis-vertical px-2"></i>
            </button>
            <a
              v-else
              :href="stylist.phone ? `https://wa.me/57${stylist.phone.replace(/\\D/g, '')}` : '#'"
              target="_blank"
              class="w-8 h-8 rounded-full hover:bg-green-100 flex items-center justify-center text-gray-400 hover:text-green-600 transition"
            >
              <i class="fa-brands fa-whatsapp md:text-lg"></i>
            </a>
          </div>

          <button
            v-if="stylist.status === 'expired'"
            @click="openModal(stylist)"
            class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition flex justify-center items-center gap-2 border border-red-200 mt-2"
          >
            <i class="fa-solid fa-rotate"></i> Registrar Renovación
          </button>
        </div>
      </div>
    </main>

    <div
      class="fixed w-full h-full top-0 left-0 flex items-center justify-center z-50 px-4 transition-all duration-300"
      :class="isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'"
    >
      <div
        @click="closeModal"
        class="absolute w-full h-full bg-black/60 backdrop-blur-sm cursor-pointer"
      ></div>

      <div
        class="bg-white w-full max-w-sm mx-auto rounded-3xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300"
        :class="isModalOpen ? 'scale-100' : 'scale-95'"
      >
        <div
          class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center"
        >
          <h3 class="font-bold text-lg text-gray-900">Registrar Pago</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="p-6 space-y-4" v-if="selectedStylist">
          <div class="flex items-center gap-3 mb-2">
            <img :src="selectedStylist.image" class="w-12 h-12 rounded-full object-cover" />
            <div>
              <p class="text-xs text-gray-500">Renovando a:</p>
              <p class="font-bold text-lg leading-none">{{ selectedStylist.name }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Tipo de Suscripción</label>
            <select
              v-model="subscriptionType"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
            >
              <option>Mensual ($20.000)</option>
              <option>Trimestral ($50.000)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Método de Pago</label>
            <div class="flex gap-2">
              <button
                @click="paymentMethod = 'nequi'"
                class="flex-1 py-2 rounded-lg text-xs transition shadow-sm"
                :class="
                  paymentMethod === 'nequi'
                    ? 'bg-pink-50 border border-pink-200 text-pink-600 font-bold'
                    : 'bg-white border border-gray-200 text-gray-500 font-medium hover:bg-gray-50'
                "
              >
                Nequi
              </button>
              <button
                @click="paymentMethod = 'efectivo'"
                class="flex-1 py-2 rounded-lg text-xs transition shadow-sm"
                :class="
                  paymentMethod === 'efectivo'
                    ? 'bg-pink-50 border border-pink-200 text-pink-600 font-bold'
                    : 'bg-white border border-gray-200 text-gray-500 font-medium hover:bg-gray-50'
                "
              >
                Efectivo
              </button>
            </div>
          </div>

          <div class="bg-green-50 p-3 rounded-xl flex gap-2 items-center">
            <i class="fa-solid fa-calendar-check text-green-500"></i>
            <div>
              <p class="text-[10px] text-green-600 font-bold uppercase">
                Nueva Fecha de Vencimiento
              </p>
              <p class="text-sm font-bold text-gray-800">{{ newExpirationDate }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100">
          <button
            @click="confirmRenewal"
            :disabled="adminStore.isRenewing"
            class="w-full bg-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-gray-800 transition active:scale-95 transform duration-150 flex justify-center items-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': adminStore.isRenewing }"
          >
            <span v-if="!adminStore.isRenewing">Confirmar Renovación</span>
            <i v-else class="fa-solid fa-circle-notch fa-spin"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
