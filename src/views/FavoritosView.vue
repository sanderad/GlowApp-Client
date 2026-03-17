<script setup lang="ts">
import { onMounted } from 'vue'
import { useStylistStore } from '@/stores/stylist.store'
import StylistCard from '@/components/StylistCard.vue'

const stylistStore = useStylistStore()

onMounted(() => {
  stylistStore.fetchFavoriteStylists()
})
</script>

<template>
  <div class="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
    <!-- Header sticky matching mockup -->
    <div
      class="bg-white px-4 py-4 rounded-b-3xl shadow-sm mb-6 sticky top-0 z-40 flex justify-between items-center"
    >
      <h1 class="text-2xl font-black">
        <span class="text-gray-900">Mis</span>
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 ml-1"
          >Favoritos</span
        >
        <span class="ml-1 text-red-500 text-xl">❤️</span>
      </h1>

      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition shadow-sm border border-gray-100"
        >
          <i class="fa-solid fa-bell text-xs"></i>
        </div>
        <div
          class="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 overflow-hidden"
        >
          <i class="fa-solid fa-user text-xs"></i>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <main class="px-4">
      <div v-if="stylistStore.isLoadingFavorites" class="flex items-center justify-center py-20">
        <i class="fa-solid fa-circle-notch fa-spin text-pink-500 text-3xl"></i>
      </div>

      <div
        v-else-if="stylistStore.favoriteStylists.length === 0"
        class="text-center py-20 animate-fade-in"
      >
        <div
          class="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-pink-100"
        >
          <i class="fa-regular fa-heart text-3xl text-pink-300"></i>
        </div>
        <h3 class="font-bold text-gray-900 text-lg mb-1">Sin favoritos aún</h3>
        <p class="text-gray-500 text-sm px-8">
          Explora increíbles estilistas en el inicio y guárdalos aquí.
        </p>
      </div>

      <div v-else class="flex flex-col animate-fade-in">
        <StylistCard
          v-for="stylist in stylistStore.favoriteStylists"
          :key="stylist.id"
          v-bind="stylist"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
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
