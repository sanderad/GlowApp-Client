<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification.store'
import { computed } from 'vue'

const store = useNotificationStore()

const containerClasses = computed(() => {
  switch (store.type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'info':
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
})

const iconClasses = computed(() => {
  switch (store.type) {
    case 'success':
      return 'fa-solid fa-circle-check text-green-500'
    case 'error':
      return 'fa-solid fa-circle-exclamation text-red-500'
    case 'info':
    default:
      return 'fa-solid fa-circle-info text-blue-500'
  }
})
</script>

<template>
  <div
    class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm pointer-events-none flex justify-center"
  >
    <Transition name="toast">
      <div
        v-if="store.isVisible"
        class="border shadow-lg rounded-2xl p-4 flex items-center justify-between gap-3 transform transition-all duration-300 w-full pointer-events-auto"
        :class="containerClasses"
      >
        <div class="flex items-center gap-3">
          <i :class="iconClasses" class="text-xl"></i>
          <p class="text-sm font-medium">{{ store.message }}</p>
        </div>
        <button
          @click="store.hideNotification()"
          class="text-gray-400 hover:text-gray-600 transition p-1 bg-white/50 rounded-full w-6 h-6 flex items-center justify-center shrink-0"
        >
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
