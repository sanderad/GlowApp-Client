<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
</script>

<template>
  <div class="bg-gray-50 min-h-screen font-sans pb-24 text-gray-800 relative overflow-x-hidden">
    <RouterView v-slot="{ Component }">
      <Transition name="fade-slide">
        <component :is="Component" :key="route.path" class="w-full absolute-during-transition" />
      </Transition>
    </RouterView>

    <BottomNav v-if="route.meta.showBottomNav" class="z-50" />
  </div>
</template>

<style>
/* --- ESTILO DE TRANSICIÓN SIMULTÁNEA (SIN SALTOS) --- */

/* Duración de la animación */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

/* La página que ENTRA */
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px); /* Entra desde la derecha */
}

/* La página que SALE (Truco del Absolute) */
/* Al poner absolute, deja de ocupar espacio y la nueva sube inmediatamente */
.fade-slide-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1; /* Se va por detrás para no tapar la nueva */
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px); /* Sale hacia la izquierda */
}
</style>
