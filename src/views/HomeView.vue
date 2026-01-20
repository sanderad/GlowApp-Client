<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StylistCard from '@/components/StylistCard.vue'

// --- DATOS DE CATEGORÍAS (Con sus degradados específicos) ---
const categories = ref([
  {
    id: 1,
    name: 'Cabello',
    icon: 'fa-scissors',
    gradient: 'from-pink-500 to-rose-600',
    shadow: 'shadow-pink-200',
  },
  {
    id: 2,
    name: 'Uñas',
    icon: 'fa-hand-sparkles',
    gradient: 'from-purple-500 to-indigo-600',
    shadow: 'shadow-purple-200',
  },
  {
    id: 3,
    name: 'Facial',
    icon: 'fa-spa',
    gradient: 'from-orange-400 to-red-500',
    shadow: 'shadow-orange-200',
  },
  {
    id: 4,
    name: 'Barbería',
    icon: 'fa-pump-soap',
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-200',
  },
])

const selectedCategory = ref('Todas')

// --- DATOS DE ESTILISTAS (Con el colorTheme correcto) ---
const isLoading = ref(true)
const error = ref('')

interface Stylist {
  id: number
  name: string
  image: string
  rating: number
  specialty: string
  yearsExp: string
  colorTheme: string
  tags: string[]
}

const stylists = ref([
  {
    id: 1,
    name: 'Ana María P.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    rating: 4.9,
    specialty: 'Manicurista Pro',
    yearsExp: '3 años exp.',
    tags: ['Uñas Acrílicas', 'Pedicure'],
    colorTheme: 'purple' as const, // Forzamos el tipo para TS
  },
  {
    id: 2,
    name: 'Carlos Barber',
    image:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    rating: 5.0,
    specialty: 'Barbería Clásica',
    yearsExp: '5 años exp.',
    tags: ['Corte Caballero', 'Barba'],
    colorTheme: 'blue' as const,
  },
  {
    id: 3,
    name: 'Sofía G.',
    image:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    rating: 4.8,
    specialty: 'Cuidado Facial',
    yearsExp: '2 años exp.',
    tags: ['Limpieza', 'Hidratación'],
    colorTheme: 'orange' as const,
  },
])

// Función para obtener datos del Backend
const fetchStylists = async () => {
  try {
    isLoading.value = true
    
    // Construir URL con filtros
    let url = 'http://localhost:5000/stylists'
    if (selectedCategory.value !== 'Todas') {
      url += `?category=${selectedCategory.value}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Error cargando estilistas')
    
    const data = await response.json()
    
    // TRANSFORMACIÓN DE DATOS (Backend -> Frontend)
    // El backend no devuelve "tags", así que creamos tags 
    // basados en la categoría o servicios si los tuviéramos
    stylists.value = data.map((item: any) => ({
      id: item.id,
      name: item.businessName, // Mostramos el nombre del negocio, no el personal
      image: item.photoUrl || 'https://via.placeholder.com/150', // Fallback si no hay foto
      rating: item.rating,
      specialty: item.category, // La categoría principal
      yearsExp: `${item.yearsOfExperience} años exp.`,
      colorTheme: item.colorTheme,
      
      // Generamos tags visuales
      tags: [item.category, 'Domicilio'] 
    }))

  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar los estilistas.'
  } finally {
    isLoading.value = false
  }
}

// Cargar al inicio
onMounted(() => {
  fetchStylists()
})

// Recargar cuando cambia la categoría
const selectCategory = (catName: string) => {
  selectedCategory.value = catName
  fetchStylists()
}
</script>

<template>
  <div class="max-w-md mx-auto bg-gray-50 min-h-screen">
    <div class="bg-white px-4 pb-6 pt-2 rounded-b-3xl shadow-sm mb-6 sticky top-0 z-40">
      <nav class="flex justify-between items-center mb-4">
        <h1
          class="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
        >
          GlowApp
        </h1>
        <div
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
        >
          <i class="fa-regular fa-bell"></i>
        </div>
      </nav>

      <h2 class="text-xl font-bold mb-3 text-gray-800">
        Hola, <span class="text-pink-500">¿Qué te harás hoy?</span> ✨
      </h2>

      <div class="relative group">
        <i
          class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-pink-400 group-focus-within:text-pink-600 transition"
        ></i>
        <input
          type="text"
          placeholder="Buscar servicios, estilistas..."
          class="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition shadow-sm placeholder-gray-400"
        />
      </div>
    </div>

    <main class="px-4">
      <div class="flex justify-between items-end mb-4">
        <h2 class="font-bold text-lg text-gray-900">Categorías</h2>
        <button class="text-xs text-pink-600 font-bold hover:underline">Ver todas</button>
      </div>

      <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1 mb-6">
        <div
          v-for="cat in categories"
          :key="cat.id"
          @click="selectCategory(cat.name)"
          class="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group"
        >
          <div
            class="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition transform"
            :class="[cat.gradient, cat.shadow]"
          >
            <i class="text-2xl fa-solid" :class="cat.icon"></i>
          </div>
          <span class="text-xs font-semibold text-gray-700">{{ cat.name }}</span>
        </div>
      </div>

      <h2 class="font-bold text-lg mb-4 text-gray-900">
        Top Estilistas <i class="fa-solid fa-fire text-orange-500 ml-1"></i>
      </h2>

      <div class="flex flex-col">
        <div v-if="isLoading" class="flex items-center justify-center">
          <i class="fa-solid fa-spinner animate-spin text-pink-500"></i>
        </div>
        <StylistCard v-if="!isLoading" v-for="stylist in stylists" :key="stylist!.id" v-bind="stylist" />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Utilidad para ocultar scrollbar pero permitir scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
