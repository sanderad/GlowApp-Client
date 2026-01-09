<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: number
  name: string
  image: string
  rating: number
  specialty: string
  yearsExp: string
  tags: string[]
  // Nuevo: Para controlar el color (purple, blue, orange, pink)
  colorTheme: 'purple' | 'blue' | 'orange' | 'pink'
}>()

// Mapeo de colores para las etiquetas (Tags)
// Esto asegura que Tailwind detecte las clases completas
const tagClasses = computed(() => {
  const colors = {
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
  }
  return colors[props.colorTheme] || colors.pink
})
</script>

<template>
  <RouterLink :to="{ name: 'stylist-detail', params: { id } }">
    <div
      class="bg-white p-3 rounded-2xl shadow-md shadow-gray-100 border border-gray-50 flex gap-3 mb-4 hover:shadow-lg transition cursor-pointer"
    >
      <div class="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden shrink-0 relative">
        <img :src="image" :alt="name" class="w-full h-full object-cover" />
        <div
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1"
        >
          <p class="text-[10px] text-white text-center font-medium">Disponible</p>
        </div>
      </div>

      <div class="flex-1 flex flex-col justify-between py-1">
        <div>
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-gray-900 text-lg leading-tight">
              {{ name }}
              <i class="fa-solid fa-circle-check text-blue-400 text-xs ml-1"></i>
            </h3>
            <div class="flex items-center gap-1 bg-yellow-100 px-1.5 py-0.5 rounded-lg">
              <i class="fa-solid fa-star text-orange-500 text-[10px]"></i>
              <span class="text-xs font-bold text-orange-700">{{ rating }}</span>
            </div>
          </div>

          <p class="text-xs text-gray-500 font-medium mt-1">{{ specialty }} • {{ yearsExp }}</p>
        </div>

        <div class="flex gap-2 mt-2">
          <span
            v-for="(tag, index) in tags"
            :key="index"
            class="text-[10px] font-semibold px-2.5 py-1 rounded-lg border"
            :class="tagClasses"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
