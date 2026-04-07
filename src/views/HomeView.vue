<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import StylistCard from '@/components/StylistCard.vue'
import { useStylistStore } from '@/stores/stylist.store'

const stylistStore = useStylistStore()
const localSearchQuery = ref(stylistStore.searchQuery)
const isTyping = ref(false)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

// Cargar al inicio
onMounted(() => {
  stylistStore.fetchStylists()
})

// Recargar cuando cambia la categoría
const selectCategory = (catName: string) => {
  if (catName === stylistStore.selectedCategory) return

  stylistStore.selectedCategory = catName
  stylistStore.fetchStylists()
}

// Observar el input local y aplicar el debounce de 0.5s
watch(localSearchQuery, (newValue) => {
  isTyping.value = true
  if (typingTimeout) clearTimeout(typingTimeout)

  typingTimeout = setTimeout(() => {
    stylistStore.searchQuery = newValue
    stylistStore.fetchStylists().finally(() => {
      isTyping.value = false
    })
  }, 500)
})
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
          v-model="localSearchQuery"
          type="text"
          placeholder="Buscar servicios, estilistas..."
          class="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition shadow-sm placeholder-gray-400"
        />
        <Transition name="fade">
          <i
            v-if="isTyping || stylistStore.isLoadingStylists"
            class="fa-solid fa-circle-notch fa-spin absolute right-4 top-3.5 text-pink-500 transition"
          ></i>
        </Transition>
      </div>
    </div>

    <main class="px-4">
      <div class="flex justify-between items-end mb-4">
        <h2 class="font-bold text-lg text-gray-900">Categorías</h2>
        <button
          v-if="stylistStore.selectedCategory !== 'Todas'"
          @click="selectCategory('Todas')"
          class="text-xs text-pink-600 font-bold hover:underline"
        >
          Borrar filtro
        </button>
      </div>

      <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1 mb-6">
        <div
          v-for="cat in stylistStore.categories"
          :key="cat.id"
          @click="selectCategory(cat.name)"
          class="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group"
        >
          <div
            class="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition transform"
            :class="[
              cat.gradient,
              cat.shadow,
              cat.name === stylistStore.selectedCategory ? 'shadow-2xl' : '',
            ]"
          >
            <i class="text-2xl fa-solid" :class="cat.icon"></i>
          </div>
          <span
            class="text-xs"
            :class="{
              'text-pink-500':
                cat.name === stylistStore.selectedCategory &&
                stylistStore.selectedCategory === 'Cabello',
              'text-purple-500':
                cat.name === stylistStore.selectedCategory &&
                stylistStore.selectedCategory === 'Uñas',
              'text-orange-500':
                cat.name === stylistStore.selectedCategory &&
                stylistStore.selectedCategory === 'Facial',
              'text-green-500':
                cat.name === stylistStore.selectedCategory &&
                stylistStore.selectedCategory === 'Corporal',
              'text-fuchsia-500':
                cat.name === stylistStore.selectedCategory &&
                stylistStore.selectedCategory === 'Maquillaje',
              'text-blue-500':
                cat.name === stylistStore.selectedCategory &&
                stylistStore.selectedCategory === 'Barbería',
              'text-gray-700': cat.name !== stylistStore.selectedCategory,
              'font-bold': cat.name === stylistStore.selectedCategory,
              'font-semibold': cat.name !== stylistStore.selectedCategory,
            }"
            >{{ cat.name }}</span
          >
        </div>
      </div>

      <h2 class="font-bold text-lg mb-4 text-gray-900">
        Top Estilistas <i class="fa-solid fa-fire text-orange-500 ml-1"></i>
      </h2>

      <div class="flex flex-col">
        <div v-if="stylistStore.isLoadingStylists" class="flex items-center justify-center">
          <i class="fa-solid fa-spinner animate-spin text-pink-500"></i>
        </div>
        <StylistCard
          v-if="!stylistStore.isLoadingStylists"
          v-for="stylist in stylistStore.stylists"
          :key="stylist!.id"
          v-bind="stylist"
        />
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
