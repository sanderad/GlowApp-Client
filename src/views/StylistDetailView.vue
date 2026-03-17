<script setup lang="ts">
import RN from '@/router/routeNames'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStylistStore } from '@/stores/stylist.store'
import { useNotificationStore } from '@/stores/notification.store'
import { useChatStore } from '@/stores/chat.store'

const router = useRouter()
const route = useRoute()
const stylistStore = useStylistStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()

// 1. ESTADO
const loading = ref(true)
const activeTab = ref<'services' | 'gallery' | 'reviews'>('services')

// 1.5 FAVORITOS
const toggleFavorite = async () => {
  if (!stylistStore.stylistDetailed) return

  // Optimistic update
  stylistStore.stylistDetailed.isFavorite = !stylistStore.stylistDetailed.isFavorite

  try {
    await stylistStore.toggleFavorite(stylistStore.stylistDetailed.id)
    if (stylistStore.stylistDetailed.isFavorite) {
      notificationStore.showSuccess('Añadido a favoritos ❤')
    } else {
      notificationStore.showInfo('Eliminado de favoritos')
    }
  } catch (error: any) {
    // Rollback if error
    stylistStore.stylistDetailed.isFavorite = !stylistStore.stylistDetailed.isFavorite
    notificationStore.showError(error.message)
  }
}

const goBack = () => router.back()

const isStartingChat = ref(false)

const goToChat = async () => {
  if (!stylistStore.stylistDetailed) return
  isStartingChat.value = true
  try {
    const chatId = await chatStore.findOrCreateChat(stylistStore.stylistDetailed.user.id)
    router.push({ name: RN.CHAT_DETAIL, params: { id: chatId } })
  } catch (err: any) {
    notificationStore.showError('No pudimos crear el chat temporalmente.')
  } finally {
    isStartingChat.value = false
  }
}

// 2. LÓGICA DE ÍCONOS INTELIGENTES (Frontend Magic 🪄)
const getServiceVisuals = (serviceName: string) => {
  const name = serviceName.toLowerCase()

  if (name.includes('uña') || name.includes('acrílica') || name.includes('semi'))
    return { icon: 'fa-wand-magic-sparkles', color: 'bg-pink-50 text-pink-500' }

  if (name.includes('manicure') || name.includes('pedicure') || name.includes('rus'))
    return { icon: 'fa-hand-sparkles', color: 'bg-purple-50 text-purple-500' }

  if (name.includes('retiro') || name.includes('limpieza'))
    return { icon: 'fa-soap', color: 'bg-blue-50 text-blue-500' }

  if (name.includes('corte') || name.includes('cabello') || name.includes('cepillado'))
    return { icon: 'fa-scissors', color: 'bg-orange-50 text-orange-500' }

  if (name.includes('barba') || name.includes('cerquillo'))
    return { icon: 'fa-user-tie', color: 'bg-gray-100 text-gray-700' }

  if (name.includes('maquillaje') || name.includes('pestaña') || name.includes('ceja'))
    return { icon: 'fa-eye', color: 'bg-rose-50 text-rose-500' }

  return { icon: 'fa-star', color: 'bg-yellow-50 text-yellow-500' }
}

// 3. COMPUTADA: Unimos los datos del Store con los Íconos Visuales
const servicesWithIcons = computed(() => {
  if (!stylistStore.stylistDetailed?.services) return []

  return stylistStore.stylistDetailed.services.map((service) => ({
    ...service,
    ...getServiceVisuals(service.name), // Inyectamos icon y color aquí
  }))
})

// 4. COMPUTADA: Precio mínimo para el footer
const minPrice = computed(() => {
  if (!stylistStore.stylistDetailed?.services.length) return 0
  return Math.min(...stylistStore.stylistDetailed.services.map((s) => Number(s.price)))
})

// 5. RESEÑAS DINÁMICAS Y FORMULARIO
const getReviewPercentage = (starsIndex: '1' | '2' | '3' | '4' | '5') => {
  const summary = stylistStore.stylistDetailed?.reviewsSummary
  const total = stylistStore.stylistDetailed?.reviewsCount || 0
  if (!summary || total === 0) return '0%'
  const count = summary[starsIndex] || 0
  return `${(count / total) * 100}%`
}

const isWritingReview = ref(false)
const newReviewRating = ref(0)
const newReviewComment = ref('')

const handleReviewSubmit = async () => {
  if (newReviewRating.value === 0 || newReviewComment.value.trim() === '') {
    notificationStore.showError('Por favor selecciona una calificación y escribe un comentario.')
    return
  }

  try {
    const stylistId = Number(route.params.id)
    await stylistStore.submitReview(stylistId, newReviewRating.value, newReviewComment.value)
    notificationStore.showSuccess('¡Reseña publicada con éxito!')
    isWritingReview.value = false
    newReviewRating.value = 0
    newReviewComment.value = ''
  } catch (error: any) {
    notificationStore.showError(error.message || 'No se pudo publicar la reseña.')
  }
}

// 6. LLAMADA AL BACKEND
onMounted(async () => {
  loading.value = true
  await stylistStore.fetchStylistByUserId(route.params.id as string)
  loading.value = false
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen relative">
    <div
      class="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none max-w-md mx-auto"
    >
      <button
        @click="goBack"
        class="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition shadow-sm border border-gray-200/50"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div class="flex gap-3 pointer-events-auto">
        <button
          @click="toggleFavorite"
          class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition shadow-sm border border-gray-200/50"
        >
          <i
            class="fa-heart transition-colors duration-300"
            :class="
              stylistStore.stylistDetailed?.isFavorite ? 'fa-solid text-red-500' : 'fa-regular'
            "
          ></i>
        </button>
      </div>
    </div>

    <div v-if="loading" class="animate-pulse">
      <div class="h-80 w-full bg-gray-300"></div>
      <div class="relative -mt-6 bg-white rounded-t-[2rem] px-6 pt-8 pb-24 z-20">
        <div class="flex justify-between items-start mb-4">
          <div class="h-8 bg-gray-200 rounded-lg w-48"></div>
          <div class="h-8 bg-gray-200 rounded-lg w-16"></div>
        </div>
        <div class="space-y-2 mb-8">
          <div class="h-4 bg-gray-100 rounded w-full"></div>
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <div v-else class="animate-fade-in">
      <div class="relative h-80 w-full">
        <img
          :src="stylistStore.stylistDetailed?.user.photoUrl || 'https://via.placeholder.com/400'"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"
        ></div>

        <div class="absolute bottom-10 left-6 flex items-center gap-2 z-10">
          <div class="relative">
            <div
              class="w-3 h-3 bg-green-500 rounded-full border-2 border-white relative z-10"
            ></div>
            <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span class="text-white text-sm font-bold drop-shadow-md">Disponible ahora</span>
        </div>
      </div>

      <div class="relative -mt-6 bg-white rounded-t-[2rem] px-6 pt-8 pb-24 z-20">
        <div class="flex justify-between items-start mb-2">
          <h1 class="text-2xl font-black text-gray-900 flex items-center gap-2">
            {{
              stylistStore.stylistDetailed?.businessName ||
              stylistStore.stylistDetailed?.user.fullName
            }}
            <i class="fa-solid fa-circle-check text-blue-500 text-lg"></i>
          </h1>
          <div
            class="bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5"
          >
            <i class="fa-solid fa-star text-orange-500 text-xs"></i>
            <span class="font-bold text-gray-800 text-sm">
              {{ stylistStore.stylistDetailed?.rating }}
            </span>
            <span class="text-[10px] text-gray-400">
              ({{ stylistStore.stylistDetailed?.reviewsCount }})
            </span>
          </div>
        </div>

        <p class="text-gray-500 text-sm leading-relaxed mb-6">
          {{ stylistStore.stylistDetailed?.bio }}
        </p>

        <div class="flex border-b border-gray-100 mb-6 sticky top-0 bg-white z-30 pt-2">
          <button
            @click="activeTab = 'services'"
            class="pb-3 px-2 mr-6 text-base transition-colors relative"
            :class="
              activeTab === 'services'
                ? 'text-pink-600 font-bold'
                : 'text-gray-400 font-medium hover:text-gray-600'
            "
          >
            Servicios
            <span
              v-if="activeTab === 'services'"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600 rounded-t-full"
            ></span>
          </button>

          <button
            @click="activeTab = 'gallery'"
            class="pb-3 px-2 mr-6 text-base transition-colors relative"
            :class="
              activeTab === 'gallery'
                ? 'text-pink-600 font-bold'
                : 'text-gray-400 font-medium hover:text-gray-600'
            "
          >
            Galería ({{ stylistStore.stylistDetailed?.portfolio.length || 0 }})
            <span
              v-if="activeTab === 'gallery'"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600 rounded-t-full"
            ></span>
          </button>

          <button
            @click="activeTab = 'reviews'"
            class="pb-3 px-2 text-base transition-colors relative"
            :class="
              activeTab === 'reviews'
                ? 'text-pink-600 font-bold'
                : 'text-gray-400 font-medium hover:text-gray-600'
            "
          >
            Reseñas
            <span
              v-if="activeTab === 'reviews'"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600 rounded-t-full"
            ></span>
          </button>
        </div>

        <div v-if="activeTab === 'services'" class="animate-fade-in">
          <h3 class="font-bold text-gray-900 text-lg mb-4">Menú de Precios</h3>

          <div v-if="servicesWithIcons.length === 0" class="text-center py-8 text-gray-400 text-sm">
            Este estilista aún no ha cargado servicios.
          </div>

          <div class="space-y-4">
            <div
              v-for="(service, i) in servicesWithIcons"
              :key="i"
              class="flex items-center justify-between group cursor-pointer bg-white rounded-xl hover:bg-gray-50 transition p-2 -mx-2 border border-transparent hover:border-gray-100"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110"
                  :class="service.color"
                >
                  <i class="fa-solid" :class="service.icon"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-base mb-0.5">{{ service.name }}</h4>
                  <p class="text-xs text-gray-400 font-medium">Duración: {{ service.duration }}</p>
                </div>
              </div>
              <div class="text-right flex items-center gap-3">
                <p
                  class="font-extrabold text-gray-900 text-base bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"
                >
                  ${{ Number(service.price).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'gallery'" class="animate-fade-in">
          <div
            v-if="!stylistStore.stylistDetailed?.portfolio.length"
            class="text-center py-10 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200"
          >
            <i class="fa-regular fa-images text-2xl text-gray-300 mb-2"></i>
            <p class="text-xs text-gray-400">Sin fotos en el portafolio</p>
          </div>

          <div v-else class="columns-2 gap-3 space-y-3 px-1">
            <div
              v-for="(img, index) in stylistStore.stylistDetailed.portfolio"
              :key="index"
              class="break-inside-avoid rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer"
            >
              <img
                :src="img.imageUrl"
                class="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500 block"
              />
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'reviews'" class="animate-fade-in space-y-6">
          <div class="bg-gray-50 p-4 rounded-2xl flex gap-4 items-center border border-gray-100">
            <div class="text-center">
              <span class="text-3xl font-black text-gray-900">{{
                stylistStore.stylistDetailed?.rating
              }}</span>
              <div class="flex text-orange-400 text-xs gap-0.5 justify-center mt-1">
                <i
                  v-for="n in 5"
                  :key="n"
                  class="fa-star"
                  :class="
                    n <= (stylistStore.stylistDetailed?.rating || 0) ? 'fa-solid' : 'fa-regular'
                  "
                ></i>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">
                {{ stylistStore.stylistDetailed?.reviewsCount }} Reseñas
              </p>
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">5</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-400 rounded-full transition-all duration-1000"
                    :style="{ width: getReviewPercentage('5') }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">4</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-400 rounded-full transition-all duration-1000"
                    :style="{ width: getReviewPercentage('4') }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">3</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-400 rounded-full transition-all duration-1000"
                    :style="{ width: getReviewPercentage('3') }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">2</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-400 rounded-full transition-all duration-1000"
                    :style="{ width: getReviewPercentage('2') }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">1</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-400 rounded-full transition-all duration-1000"
                    :style="{ width: getReviewPercentage('1') }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="!isWritingReview"
            @click="isWritingReview = true"
            class="w-full bg-pink-50 text-pink-600 font-bold py-3 rounded-xl border border-pink-100 hover:bg-pink-100 transition"
          >
            Escribir una reseña
          </button>

          <div
            v-if="isWritingReview"
            class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-fade-in"
          >
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-bold text-gray-900 text-sm">Tu Calificación</h4>
              <button @click="isWritingReview = false" class="text-gray-400 hover:text-gray-600">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="flex gap-2 text-2xl text-gray-200 mb-4 justify-center">
              <i
                v-for="star in 5"
                :key="star"
                @click="newReviewRating = star"
                class="fa-star cursor-pointer transition-colors"
                :class="
                  star <= newReviewRating
                    ? 'fa-solid text-orange-400'
                    : 'fa-solid hover:text-orange-200'
                "
              ></i>
            </div>

            <textarea
              v-model="newReviewComment"
              rows="3"
              placeholder="¿Qué tal te pareció el servicio?"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none focus:bg-white transition mb-3 resize-none"
            ></textarea>

            <button
              @click="handleReviewSubmit"
              :disabled="stylistStore.isSubmittingReview"
              class="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-3 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center relative"
            >
              <span :class="{ 'opacity-0': stylistStore.isSubmittingReview }">Publicar Reseña</span>
              <i
                v-if="stylistStore.isSubmittingReview"
                class="fa-solid fa-circle-notch fa-spin absolute text-lg"
              ></i>
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-if="!stylistStore.stylistDetailed?.reviews.length"
              class="text-center text-sm text-gray-400 py-4"
            >
              Aún no hay reseñas.
            </div>

            <div
              v-for="review in stylistStore.stylistDetailed?.reviews"
              :key="review.id"
              class="border-b border-gray-50 pb-4 last:border-0"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <img
                    v-if="review.user?.photoUrl"
                    :src="review.user.photoUrl"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold ring-2 ring-white shadow-sm"
                  >
                    {{ review.user.fullName.substring(0, 2).toUpperCase() }}
                  </div>

                  <div>
                    <h4 class="font-bold text-sm text-gray-900">{{ review.user.fullName }}</h4>
                    <p class="text-[10px] text-gray-400">
                      {{ new Date(review.date).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
                <div class="flex text-orange-400 text-[10px]">
                  <i
                    v-for="n in 5"
                    :key="n"
                    class="fa-star"
                    :class="n <= review.rating ? 'fa-solid' : 'fa-regular'"
                  ></i>
                </div>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg p-4 pb-6 border-t border-gray-100 flex items-center justify-between z-50 max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.05)]"
      >
        <div class="flex flex-col pl-2">
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider"
            >Servicios desde</span
          >
          <span class="text-2xl font-black text-gray-900"> ${{ minPrice.toLocaleString() }} </span>
        </div>
        <button
          @click="goToChat"
          :disabled="isStartingChat"
          class="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-pink-300 transition transform active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <span v-if="!isStartingChat" class="flex items-center gap-2"
            ><i class="fa-solid fa-comment-dots text-lg"></i> Chatear y Agendar</span
          >
          <i v-else class="fa-solid fa-circle-notch fa-spin text-lg"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
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
