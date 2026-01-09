<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentStep = ref(1)

// Datos del formulario
const form = ref({
  name: '',
  category: 'Uñas',
  bio: '',
  services: [
    { name: 'Uñas Acrílicas', duration: '2 horas', price: 85000 },
    { name: 'Semipermanente', duration: '45 min', price: 45000 }
  ]
})

// Estado para nuevo servicio
const newService = ref({ name: '', price: '', duration: '' })

// Funciones de navegación
const nextStep = () => { if (currentStep.value < 4) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
const finish = () => router.push('/') // Ir al dashboard/home

// Lógica de Servicios
const addService = () => {
  if (newService.value.name && newService.value.price) {
    form.value.services.push({
      name: newService.value.name,
      price: parseInt(newService.value.price),
      duration: newService.value.duration || 'N/A'
    })
    newService.value = { name: '', price: '', duration: '' } // Reset
  }
}

const removeService = (index: number) => {
  form.value.services.splice(index, 1)
}
</script>

<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen pb-10">

    <nav class="bg-white sticky top-0 z-50 px-6 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center">
        <button @click="router.back()" class="text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 class="font-bold text-lg">Crear Perfil Profesional</h1>
        <div class="w-6"></div> 
    </nav>

    <main class="max-w-md mx-auto px-6 pt-6">

        <div class="flex justify-between items-center mb-8 relative" v-if="currentStep < 4">
            <div class="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
            
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
              :class="currentStep >= 1 ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-gray-200 text-gray-500'"
            >1</div>
            
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
              :class="currentStep >= 2 ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-gray-200 text-gray-500'"
            >2</div>
            
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
              :class="currentStep >= 3 ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-gray-200 text-gray-500'"
            >3</div>
        </div>

        <div v-if="currentStep === 1" class="animate-fade-in">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-black text-gray-900 mb-2">¿Quién eres? ✨</h2>
                <p class="text-gray-500 text-sm">Cuéntanos sobre ti para que los clientes te conozcan.</p>
            </div>

            <div class="flex justify-center mb-6">
                <div class="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 transition relative">
                    <i class="fa-solid fa-camera text-2xl mb-1"></i>
                    <span class="text-[10px] font-bold">Subir Foto</span>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Nombre Artístico</label>
                    <input v-model="form.name" type="text" placeholder="Ej: Ana María Nails" class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-sm">
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Categoría Principal</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button 
                          v-for="cat in ['Uñas', 'Cabello', 'Barbería', 'Facial']" :key="cat"
                          @click="form.category = cat"
                          class="border py-3 rounded-xl text-xs transition font-bold"
                          :class="form.category === cat ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-gray-200 bg-white text-gray-500'"
                        >{{ cat }}</button>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1 ml-1">Biografía Corta</label>
                    <textarea v-model="form.bio" rows="3" class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none"></textarea>
                </div>
            </div>

            <button @click="nextStep" class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg mt-8">
                Siguiente Paso <i class="fa-solid fa-arrow-right ml-2"></i>
            </button>
        </div>

        <div v-if="currentStep === 2" class="animate-fade-in">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-black text-gray-900 mb-2">Tus Servicios 💰</h2>
                <p class="text-gray-500 text-sm">Agrega lo que ofreces y tus precios estimados.</p>
            </div>

            <div class="space-y-3 mb-6">
                <div v-for="(serv, index) in form.services" :key="index" class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-sm text-gray-800">{{ serv.name }}</h4>
                        <p class="text-xs text-gray-400">{{ serv.duration }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-pink-600 text-sm">${{ Number(serv.price).toLocaleString() }}</span>
                        <button @click="removeService(index)" class="text-gray-300 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>

            <div class="bg-gray-100 p-4 rounded-2xl border border-dashed border-gray-300">
                <h3 class="font-bold text-xs uppercase text-gray-500 mb-3">Nuevo Servicio</h3>
                <div class="space-y-3">
                    <input v-model="newService.name" type="text" placeholder="Nombre (ej: Manicure)" class="w-full bg-white border-0 p-3 rounded-xl text-sm shadow-sm">
                    <div class="flex gap-3">
                        <input v-model="newService.price" type="number" placeholder="Precio ($)" class="w-2/3 bg-white border-0 p-3 rounded-xl text-sm shadow-sm">
                        <input v-model="newService.duration" type="text" placeholder="Tiempo" class="w-1/3 bg-white border-0 p-3 rounded-xl text-sm shadow-sm text-center">
                    </div>
                    <button @click="addService" class="w-full bg-white border-2 border-pink-500 text-pink-600 font-bold py-2 rounded-xl text-sm hover:bg-pink-50 transition">
                        <i class="fa-solid fa-plus mr-1"></i> Agregar a la lista
                    </button>
                </div>
            </div>

            <div class="flex gap-3 mt-8">
                <button @click="prevStep" class="w-1/3 bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl">Atrás</button>
                <button @click="nextStep" class="w-2/3 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg">Siguiente <i class="fa-solid fa-arrow-right ml-2"></i></button>
            </div>
        </div>

        <div v-if="currentStep === 3" class="animate-fade-in">
             <div class="text-center mb-6">
                <h2 class="text-2xl font-black text-gray-900 mb-2">Tu Portafolio 📸</h2>
                <p class="text-gray-500 text-sm">Sube tus mejores fotos.</p>
            </div>
            
            <div class="bg-pink-50 border-2 border-dashed border-pink-300 rounded-3xl p-8 text-center mb-6">
                <div class="w-16 h-16 bg-white text-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <i class="fa-solid fa-cloud-arrow-up text-2xl"></i>
                </div>
                <h3 class="font-bold text-pink-900">Toca para subir fotos</h3>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <label class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked class="mt-1">
                    <p class="text-xs text-gray-500 leading-snug">
                        Declaro que soy el autor original de estas fotos.
                    </p>
                </label>
            </div>

            <div class="flex gap-3 mt-4">
                <button @click="prevStep" class="w-1/3 bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl">Atrás</button>
                <button @click="nextStep" class="w-2/3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg">¡Publicar Perfil! 🚀</button>
            </div>
        </div>

        <div v-if="currentStep === 4" class="animate-fade-in text-center pt-10">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-bounce">
                <i class="fa-solid fa-check text-4xl"></i>
            </div>
            
            <h2 class="text-3xl font-black text-gray-900 mb-2">¡Perfil Creado! 🎉</h2>
            <p class="text-gray-500 text-sm mb-8 px-6">Tu perfil ya es visible.</p>

            <button @click="finish" class="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition">
                Ir a mi Panel
            </button>
        </div>

    </main>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>