<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useChatStore } from '@/stores/chat.store'

const chatStore = useChatStore()
</script>

<template>
  <div
    class="right-0 bottom-0 left-0 z-50 fixed bg-white/95 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] backdrop-blur-md mx-auto px-6 py-3 border-gray-100 border-t rounded-t-2xl w-full max-w-md"
  >
    <div class="flex justify-between items-center">
      <RouterLink
        to="/"
        class="group flex flex-col items-center transition"
        active-class="text-black"
        exact-active-class="text-black"
      >
        <template #default="{ isActive }">
          <div
            class="mb-1 p-1.5 rounded-xl transition"
            :class="isActive ? 'bg-gray-100 shadow-sm shadow-gray-200' : 'group-hover:bg-gray-50'"
          >
            <i class="text-lg fa-solid fa-house"></i>
          </div>
          <span
            class="text-[10px]"
            :class="isActive ? 'font-bold' : 'font-medium text-gray-400 group-hover:text-gray-600'"
            >Inicio</span
          >
        </template>
      </RouterLink>

      <RouterLink
        to="/favoritos"
        class="group flex flex-col items-center transition"
        active-class="text-black"
      >
        <template #default="{ isActive }">
          <div
            class="mb-1 p-1.5 rounded-xl transition"
            :class="isActive ? 'bg-gray-100 shadow-sm shadow-gray-200' : 'group-hover:bg-gray-50'"
          >
            <i class="text-lg fa-solid fa-heart"></i>
          </div>
          <span
            class="text-[10px]"
            :class="isActive ? 'font-bold' : 'font-medium text-gray-400 group-hover:text-gray-600'"
            >Favoritos</span
          >
        </template>
      </RouterLink>

      <RouterLink
        to="/chats"
        class="group flex flex-col items-center transition"
        active-class="text-vinotinto"
      >
        <template #default="{ isActive }">
          <div class="relative">
            <div
              class="mb-1 p-1.5 rounded-xl transition"
              :class="isActive ? 'bg-gray-100 shadow-sm shadow-gray-200' : 'group-hover:bg-gray-50'"
            >
              <i class="text-vinotinto/90 text-lg fa-solid fa-comment"></i>
            </div>
            <div
              v-if="chatStore.totalUnreadCount > 0"
              class="-top-1 -right-2 absolute flex justify-center items-center bg-vinotinto shadow-sm border-2 border-white rounded-full w-4 h-4 font-vinotinto text-[9px] text-white"
            >
              {{ chatStore.totalUnreadCount > 99 ? '99+' : chatStore.totalUnreadCount }}
            </div>
          </div>
          <span
            class="text-[10px]"
            :class="isActive ? 'font-bold' : 'font-medium text-vinotinto/60 group-hover:text-vinotinto/80'"
            >Chats</span
          >
        </template>
      </RouterLink>

      <RouterLink
        to="/perfil"
        class="group flex flex-col items-center transition"
        active-class="text-vinotinto"
      >
        <template #default="{ isActive }">
          <div
            class="mb-1 p-1.5 rounded-xl transition"
            :class="isActive ? 'bg-gray-100 shadow-sm shadow-gray-200' : 'group-hover:bg-gray-50'"
          >
            <i class="text-vinotinto/90 text-lg fa-solid fa-user"></i>
          </div>
          <span
            class="text-[10px]"
            :class="isActive ? 'font-bold' : 'font-medium text-vinotinto/60 group-hover:text-vinotinto/80'"
            >Perfil</span
          >
        </template>
      </RouterLink>
    </div>
  </div>
</template>
