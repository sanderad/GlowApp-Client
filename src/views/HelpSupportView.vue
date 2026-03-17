<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const faqs = [
  {
    question: '¿Cómo agendo una cita?',
    answer:
      'Busca a tu estilista favorito, entra a su perfil y envíale un mensaje directo por el chat de GlowApp para acordar la fecha y hora del servicio.',
  },
  {
    question: '¿Cómo sé el precio de un servicio?',
    answer:
      'Puedes ver los servicios y precios en el perfil de cada profesional. Si tienes dudas, contáctalo directamente por chat.',
  },
  {
    question: '¿Cómo se manejan los pagos?',
    answer:
      'GlowApp solo te conecta con el profesional. El pago se realiza directamente con el estilista en su local o por el método que acuerden por chat.',
  },
]
</script>

<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen">
    <nav
      class="bg-white sticky top-0 left-0 w-full z-30 px-4 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center h-14"
    >
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition p-1">
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </button>
      <h1 class="font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
        Ayuda y Soporte
      </h1>
      <div class="w-8"></div>
    </nav>

    <main class="max-w-md mx-auto p-4 space-y-6">
      <!-- Contacto Directo -->
      <section class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div
          class="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-3 text-pink-500"
        >
          <i class="fa-solid fa-headset text-3xl"></i>
        </div>
        <h2 class="font-black text-lg text-gray-900 mb-1">¿Necesitas ayuda humana?</h2>
        <p class="text-xs text-gray-500 mb-4 px-4">
          Hola, soy Dulfary, dueña de GlowApp. Estoy disponible para ayudarte si tienes dudas o
          inconvenientes.
        </p>

        <div class="flex flex-col gap-2">
          <a
            href="https://wa.me/573128285881"
            target="_blank"
            class="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition active:scale-95 shadow-sm shadow-green-200"
          >
            <i class="fa-brands fa-whatsapp text-lg"></i> Chat en WhatsApp
          </a>
        </div>
      </section>

      <!-- FAQs -->
      <section>
        <h3 class="font-black text-gray-900 text-sm mb-3 pl-1 uppercase tracking-wider">
          Preguntas Frecuentes
        </h3>
        <div class="space-y-3">
          <details
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 group overflow-hidden"
          >
            <summary
              class="font-bold text-sm text-gray-800 p-4 cursor-pointer select-none flex justify-between items-center list-none [&::-webkit-details-marker]:hidden"
            >
              {{ faq.question }}
              <i
                class="fa-solid fa-chevron-down text-gray-400 text-xs transition-transform duration-300 group-open:rotate-180"
              ></i>
            </summary>
            <div
              class="px-4 pb-4 pt-0 text-xs text-gray-500 leading-relaxed border-t border-gray-50 mt-2"
            >
              {{ faq.answer }}
            </div>
          </details>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
details[open] summary ~ * {
  animation: sweep 0.2s ease-in-out;
}

@keyframes sweep {
  0% {
    opacity: 0;
    margin-top: -10px;
  }
  100% {
    opacity: 1;
    margin-top: 8px;
  }
}
</style>
