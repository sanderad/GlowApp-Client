import type { Stylist, StylistDetailed } from '@/types/stylist.types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/apiClient'

export const useStylistStore = defineStore('stylist', () => {
  const categories = ref([
    {
      id: 1,
      name: 'Cabello',
      icon: 'fa-scissors',
      gradient: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-200',
    },
    {
      id: 2,
      name: 'Uñas',
      icon: 'fa-hand-sparkles',
      gradient: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-purple-200',
    },
    {
      id: 3,
      name: 'Facial',
      icon: 'fa-spa',
      gradient: 'from-orange-400 to-red-500',
      shadow: 'shadow-orange-200',
    },
    {
      id: 4,
      name: 'Barbería',
      icon: 'fa-pump-soap',
      gradient: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-200',
    },
    {
      id: 5,
      name: 'Corporal',
      icon: 'fa-leaf',
      gradient: 'from-emerald-400 to-green-500',
      shadow: 'shadow-green-200',
    },
    {
      id: 6,
      name: 'Maquillaje',
      icon: 'fa-eye',
      gradient: 'from-fuchsia-400 to-pink-500',
      shadow: 'shadow-fuchsia-200',
    },
  ])

  const stylists = ref<Stylist[]>([])
  const isLoadingStylists = ref(false)
  const errorStylists = ref('')
  const selectedCategory = ref('Todas')
  const searchQuery = ref('')

  async function fetchStylists() {
    try {
      isLoadingStylists.value = true

      // Construir URL con filtros
      const params = new URLSearchParams()
      if (selectedCategory.value && selectedCategory.value !== 'Todas') {
        params.append('category', selectedCategory.value)
      }
      if (searchQuery.value && searchQuery.value.trim() !== '') {
        params.append('search', searchQuery.value.trim())
      }

      const queryString = params.toString()
      const url = queryString ? `/stylists?${queryString}` : '/stylists'

      const response = await apiClient.get<Stylist[]>(url)
      if (response.status === 401 || response.status === 500)
        throw new Error('Error cargando estilistas')

      const data = response.data

      // TRANSFORMACIÓN DE DATOS (Backend -> Frontend)
      // El backend no devuelve "tags", así que creamos tags
      // basados en la categoría o servicios si los tuviéramos
      stylists.value = data.map((stylist: Stylist) => ({
        id: stylist.id,
        businessName: stylist.businessName, // Mostramos el nombre del negocio, no el personal
        category: stylist.category,
        rating: stylist.rating,
        reviewsCount: stylist.reviewsCount,
        yearsOfExperience: stylist.yearsOfExperience,
        colorTheme: stylist.colorTheme,
        speciality: stylist.speciality,

        // Generamos tags visuales
        user: stylist.user,
        services: stylist.services,
      }))
    } catch (err) {
      console.error(err)
      errorStylists.value = 'No se pudieron cargar los estilistas.'
    } finally {
      isLoadingStylists.value = false
    }
  }

  const favoriteStylists = ref<Stylist[]>([])
  const isLoadingFavorites = ref(false)

  async function fetchFavoriteStylists() {
    try {
      isLoadingFavorites.value = true
      const response = await apiClient.get<Stylist[]>('/stylists/favorites/me')
      favoriteStylists.value = response.data
    } catch (err) {
      console.error(err)
    } finally {
      isLoadingFavorites.value = false
    }
  }

  const stylistDetailed = ref<StylistDetailed | null>(null)
  const isLoadingStylistDetailed = ref(false)
  const errorStylistDetailed = ref('')

  async function fetchStylistByUserId(userId: string) {
    try {
      isLoadingStylistDetailed.value = true

      const response = await apiClient.get<StylistDetailed>(`/stylists/detailed/${userId}`)
      if (response.status === 401 || response.status === 500)
        throw new Error('Error cargando estilista')

      const data = response.data

      // TRANSFORMACIÓN DE DATOS (Backend -> Frontend)
      // El backend no devuelve "tags", así que creamos tags
      // basados en la categoría o servicios si los tuviéramos
      stylistDetailed.value = data
    } catch (err) {
      console.error(err)
      errorStylistDetailed.value = 'No se pudo cargar el estilista.'
    } finally {
      isLoadingStylistDetailed.value = false
    }
  }

  const isSubmittingReview = ref(false)

  async function submitReview(
    stylistId: number,
    rating: number,
    comment: string,
  ): Promise<boolean> {
    try {
      isSubmittingReview.value = true
      await apiClient.post(`/stylists/${stylistId}/reviews`, { rating, comment })

      // Optamos por recargar la info del estilista para que traiga la reseña nueva y el promedio actualizado
      console.log(stylistDetailed.value)
      console.log(stylistId)
      await fetchStylistByUserId(stylistId.toString())

      return true
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(
          Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : err.response.data.message,
        )
      }
      throw new Error('Error al enviar la reseña.')
    } finally {
      isSubmittingReview.value = false
    }
  }

  async function toggleFavorite(stylistId: number): Promise<boolean> {
    try {
      await apiClient.post(`/stylists/${stylistId}/favorite`)
      return true
    } catch (err: any) {
      console.error(err)
      throw new Error('No se pudo añadir a favoritos.')
    }
  }

  return {
    categories,
    stylists,
    isLoadingStylists,
    errorStylists,
    selectedCategory,
    searchQuery,
    fetchStylists,
    stylistDetailed,
    isLoadingStylistDetailed,
    errorStylistDetailed,
    fetchStylistByUserId,
    isSubmittingReview,
    submitReview,
    toggleFavorite,
    favoriteStylists,
    isLoadingFavorites,
    fetchFavoriteStylists,
  }
})
