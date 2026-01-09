<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div
    class="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 py-3 px-6 max-w-md mx-auto left-0 right-0 z-50 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]"
  >
    <div class="flex justify-between items-center">
      <RouterLink
        to="/"
        class="flex flex-col items-center transition group"
        active-class="text-pink-600"
        exact-active-class="text-pink-600"
      >
        <template #default="{ isActive }">
          <div
            class="p-1.5 mb-1 rounded-xl transition"
            :class="isActive ? 'bg-pink-50 shadow-sm shadow-pink-100' : 'group-hover:bg-gray-50'"
          >
            <i class="fa-solid fa-house text-lg"></i>
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
        class="flex flex-col items-center transition group"
        active-class="text-pink-600"
      >
        <template #default="{ isActive }">
          <div
            class="p-1.5 mb-1 rounded-xl transition"
            :class="isActive ? 'bg-pink-50 shadow-sm shadow-pink-100' : 'group-hover:bg-gray-50'"
          >
            <i class="fa-solid fa-heart text-lg"></i>
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
        class="flex flex-col items-center transition group"
        active-class="text-pink-600"
      >
        <template #default="{ isActive }">
          <div
            class="p-1.5 mb-1 rounded-xl transition"
            :class="isActive ? 'bg-pink-50 shadow-sm shadow-pink-100' : 'group-hover:bg-gray-50'"
          >
            <i class="fa-solid fa-comment text-lg"></i>
          </div>
          <span
            class="text-[10px]"
            :class="isActive ? 'font-bold' : 'font-medium text-gray-400 group-hover:text-gray-600'"
            >Chats</span
          >
        </template>
      </RouterLink>

      <RouterLink
        to="/perfil"
        class="flex flex-col items-center transition group"
        active-class="text-pink-600"
      >
        <template #default="{ isActive }">
          <div
            class="p-1.5 mb-1 rounded-xl transition"
            :class="isActive ? 'bg-pink-50 shadow-sm shadow-pink-100' : 'group-hover:bg-gray-50'"
          >
            <i class="fa-solid fa-user text-lg"></i>
          </div>
          <span
            class="text-[10px]"
            :class="isActive ? 'font-bold' : 'font-medium text-gray-400 group-hover:text-gray-600'"
            >Perfil</span
          >
        </template>
      </RouterLink>
    </div>
  </div>
</template>
