<script setup lang="ts">
import { ref, onMounted } from 'vue' // Importamos onMounted
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 1. ESTADO DE CARGA
const loading = ref(true)
const activeTab = ref<'services' | 'gallery' | 'reviews'>('services')

// Inicializamos vacío o con null, los datos llegarán después
const stylist = ref<any>(null)

const goBack = () => router.back()

const goToChat = () => {
  // Navegamos a la ruta del chat pasando el ID del estilista
  router.push({ name: 'chat-detail', params: { id: stylist.value.id } })
}

// 2. SIMULACIÓN DE LLAMADA AL BACKEND
onMounted(async () => {
  // Simulamos 1.5 segundos de "red"
  loading.value = true

  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Aquí "llegaron" los datos del API
  stylist.value = {
    id: 1,
    name: 'Ana María P.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    rating: 4.9,
    reviewsCount: 120,
    specialty: 'Especialista en uñas acrílicas y diseño a mano alzada.',
    description:
      'Me encanta crear arte en tus manos. Utilizo productos de alta calidad para cuidar la salud de tus uñas. 💅✨',
    stats: { exp: '3+', distance: '5km', citas: '350+' },
    services: [
      {
        name: 'Uñas Acrílicas Full Set',
        duration: '2 horas',
        price: 85000,
        icon: 'fa-wand-magic-sparkles',
        color: 'bg-pink-50 text-pink-500',
      },
      {
        name: 'Semipermanente',
        duration: '45 min',
        price: 45000,
        icon: 'fa-bottle-droplet',
        color: 'bg-purple-50 text-purple-500',
      },
      {
        name: 'Retiro de Uñas',
        duration: '30 min',
        price: 15000,
        icon: 'fa-hand-sparkles',
        color: 'bg-blue-50 text-blue-500',
      },
      {
        name: 'Manicure Rusa',
        duration: '1 hora',
        price: 60000,
        icon: 'fa-gem',
        color: 'bg-orange-50 text-orange-500',
      },
      {
        name: 'Decoración / Nail Art',
        duration: 'Por uña',
        price: 5000,
        icon: 'fa-paintbrush',
        color: 'bg-yellow-50 text-yellow-500',
      },
    ],
    gallery: [
      {
        id: 1,
        url: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=400',
        title: 'Diseño Dark',
      },
      {
        id: 2,
        url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 3,
        url: 'https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 4,
        url: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 5,
        url: 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
    reviews: [
      {
        id: 1,
        name: 'Laura G.',
        date: 'Hace 2 días',
        rating: 5,
        comment: '¡Me encantaron mis uñas! Ana es súper delicada y detallista.',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      },
      {
        id: 2,
        name: 'María Paula',
        date: 'Hace 1 semana',
        rating: 4,
        comment: 'Muy buen servicio y puntualidad.',
        avatar: null,
      },
    ],
  }

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
        class="pointer-events-auto w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-50 transition shadow-lg border border-gray-200"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div class="flex gap-3 pointer-events-auto">
        <button
          class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-50 transition shadow-lg border border-gray-200"
        >
          <i class="fa-regular fa-heart"></i>
        </button>
        <button
          class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-50 transition shadow-lg border border-gray-200"
        >
          <i class="fa-solid fa-share-nodes"></i>
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

        <div class="flex justify-between bg-gray-50 rounded-2xl p-4 mb-8 h-20"></div>

        <div class="flex gap-6 mb-8 border-b border-gray-100 pb-2">
          <div class="h-4 bg-gray-200 w-20 rounded"></div>
          <div class="h-4 bg-gray-100 w-20 rounded"></div>
          <div class="h-4 bg-gray-100 w-20 rounded"></div>
        </div>

        <div class="space-y-4">
          <div v-for="n in 3" :key="n" class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gray-100 rounded-2xl"></div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-100 w-32 rounded"></div>
                <div class="h-3 bg-gray-50 w-20 rounded"></div>
              </div>
            </div>
            <div class="h-4 bg-gray-100 w-16 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="animate-fade-in">
      <div class="relative h-80 w-full">
        <img :src="stylist.image" class="w-full h-full object-cover" />
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

      <div class="relative -mt-6 bg-white rounded-t-[2rem] px-6 pt-8 pb-4 z-20">
        <div class="flex justify-between items-start mb-2">
          <h1 class="text-2xl font-black text-gray-900 flex items-center gap-2">
            {{ stylist.name }}
            <i class="fa-solid fa-circle-check text-blue-500 text-lg"></i>
          </h1>
          <div
            class="bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5"
          >
            <i class="fa-solid fa-star text-orange-500 text-xs"></i>
            <span class="font-bold text-gray-800 text-sm">{{ stylist.rating }}</span>
            <span class="text-[10px] text-gray-400">({{ stylist.reviewsCount }})</span>
          </div>
        </div>

        <p class="text-gray-500 text-sm leading-relaxed mb-6">
          {{ stylist.specialty }}
          <span class="block mt-1">{{ stylist.description }}</span>
        </p>

        <div class="flex justify-between bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
          <div class="text-center w-1/3 border-r border-gray-200">
            <p class="text-lg font-black text-gray-900">{{ stylist.stats.exp }}</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Años Exp.</p>
          </div>
          <div class="text-center w-1/3 border-r border-gray-200">
            <p class="text-lg font-black text-gray-900">{{ stylist.stats.distance }}</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Distancia</p>
          </div>
          <div class="text-center w-1/3">
            <p class="text-lg font-black text-gray-900">{{ stylist.stats.citas }}</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Citas</p>
          </div>
        </div>

        <div class="flex border-b border-gray-100 mb-6">
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
            Galería ({{ stylist.gallery.length }})
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
          <div class="space-y-4">
            <div
              v-for="(service, i) in stylist.services"
              :key="i"
              class="flex items-center justify-between group cursor-pointer bg-white rounded-xl hover:bg-gray-50 transition p-2 -mx-2"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm"
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
                <p class="font-extrabold text-pink-600 text-base">
                  ${{ service.price.toLocaleString() }}
                </p>
                <i class="fa-solid fa-chevron-right text-gray-300 text-[10px]"></i>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'gallery'" class="animate-fade-in">
          <div class="columns-2 gap-3 space-y-3 px-1">
            <div
              v-for="(img, index) in stylist.gallery"
              :key="index"
              class="break-inside-avoid rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer"
            >
              <img
                :src="img.url"
                class="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500 block"
              />
              <div
                v-if="img.title"
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition"
              >
                <p class="text-white text-[10px] font-bold">{{ img.title }}</p>
              </div>
            </div>
          </div>
          <button
            class="w-full text-center text-pink-500 font-bold text-sm mt-6 py-3 hover:bg-pink-50 rounded-xl transition"
          >
            Ver todas las fotos
          </button>
        </div>

        <div v-if="activeTab === 'reviews'" class="animate-fade-in space-y-6">
          <div class="bg-gray-50 p-4 rounded-2xl flex gap-4 items-center border border-gray-100">
            <div class="text-center">
              <span class="text-3xl font-black text-gray-900">4.9</span>
              <div class="flex text-orange-400 text-xs gap-0.5 justify-center mt-1">
                <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i
                ><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i
                ><i class="fa-solid fa-star-half-stroke"></i>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">120 Reseñas</p>
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">5</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-400 w-[90%] rounded-full"></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">4</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-400 w-[10%] rounded-full"></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500 w-2">3</span>
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-400 w-[0%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="review in stylist.reviews"
              :key="review.id"
              class="border-b border-gray-50 pb-4 last:border-0"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <img
                    v-if="review.avatar"
                    :src="review.avatar"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold ring-2 ring-white shadow-sm"
                  >
                    {{ review.name.substring(0, 2).toUpperCase() }}
                  </div>

                  <div>
                    <h4 class="font-bold text-sm text-gray-900">{{ review.name }}</h4>
                    <p class="text-[10px] text-gray-400">{{ review.date }}</p>
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
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Desde</span
          ><span class="text-2xl font-black text-gray-900">$45.000</span>
        </div>
        <button
          @click="goToChat"
          class="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-pink-300 transition transform active:scale-95 flex items-center gap-2 text-sm"
        >
          <i class="fa-brands fa-whatsapp text-lg"></i> Chatear y Agendar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Clase para animar la entrada del contenido una vez cargado */
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
