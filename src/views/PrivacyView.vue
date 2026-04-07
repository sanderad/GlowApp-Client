<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen">
    <!-- Header Fijo -->
    <nav
      class="bg-white sticky top-0 left-0 w-full z-30 px-4 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center h-14"
    >
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition p-1">
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </button>
      <h1 class="font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
        Privacidad
      </h1>
      <div class="w-8"></div>
    </nav>

    <main class="max-w-md mx-auto p-6 space-y-6">
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500"
        >
          <i class="fa-solid fa-shield text-3xl"></i>
        </div>
        <h2 class="font-black text-2xl text-gray-900">Políticas de Privacidad</h2>
        <p class="text-xs text-gray-500 mt-1">Última actualización: Marzo 2026</p>
      </div>

      <section
        class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 prose prose-sm text-gray-600"
      >
        <h3 class="font-bold border-b border-gray-100 pb-2 mb-3 text-gray-900">
          1. Información que Recopilamos
        </h3>
        <p class="text-xs leading-relaxed mb-4">
          Recolectamos la información que nos proporcionas directamente cuando creas una cuenta o
          utilizas nuestros servicios. Esto incluye nombre, correo electrónico, y datos de
          facturación (si aplica). Como profesional, recopilamos descripciones de servicios,
          horarios y fotografías del portafolio.
        </p>

        <h3 class="font-bold border-b border-gray-100 pb-2 mb-3 mt-6 text-gray-900">
          2. Uso de tu Información
        </h3>
        <ul class="text-xs space-y-2 list-disc pl-4 mb-4">
          <li>Para proveer, mantener y mejorar nuestros servicios.</li>
          <li>Para procesar transacciones y enviar información relacionada.</li>
          <li>Para enviarte alertas técnicas, de soporte y comunicados administrativos.</li>
          <li>Para personalizar tu experiencia dentro la aplicación.</li>
        </ul>

        <h3 class="font-bold border-b border-gray-100 pb-2 mb-3 mt-6 text-gray-900">
          3. Compartir Información
        </h3>
        <p class="text-xs leading-relaxed mb-4">
          No compartimos tu información personal con terceros de manera que se revele tu identidad,
          excepto a través de las funciones propias de tu perfil público si decides ser un
          profesional activo. Cierta información analítica es anonimizada.
        </p>

        <h3 class="font-bold border-b border-gray-100 pb-2 mb-3 mt-6 text-gray-900">
          4. Tus Derechos
        </h3>
        <p class="text-xs leading-relaxed">
          Puedes acceder a tu información personal entrando a "Editar Perfil". Si deseas eliminar
          permanentemente tu cuenta y toda la data asociada, por favor contacta a
          <a href="mailto:privacidad@glowapp.co" class="text-pink-500 font-bold"
            >privacidad@glowapp.co</a
          >.
        </p>
      </section>

      <p class="text-center text-[10px] text-gray-400 mt-6 pb-6">
        GlowYou Inc. 2026 - Todos los derechos reservados.
      </p>
    </main>
  </div>
</template>
