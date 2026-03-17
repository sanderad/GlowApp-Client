import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/apiClient'

export interface AdminStylist {
  id: number
  businessName: string
  phone: string
  subscriptionEndsAt: string
  user: {
    fullName: string
    photoUrl: string
  }
}

export const useAdminStore = defineStore('admin', () => {
  const stylists = ref<AdminStylist[]>([])
  const isLoading = ref(false)
  const isRenewing = ref(false)

  const loadStylists = async () => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/admin/stylists')
      stylists.value = data
    } catch (error) {
      console.error('Error loading stylists:', error)
    } finally {
      isLoading.value = false
    }
  }

  const renewSubscription = async (
    stylistId: number,
    monthsToAdd: number,
    paymentMethod: 'nequi' | 'efectivo',
  ): Promise<boolean> => {
    isRenewing.value = true
    try {
      await apiClient.post(`/admin/stylists/${stylistId}/renew`, {
        monthsToAdd,
        paymentMethod,
      })
      // Reload the entire list to ensure data consistency
      await loadStylists()
      return true
    } catch (error) {
      console.error('Error renewing subscription:', error)
      return false
    } finally {
      isRenewing.value = false
    }
  }

  return {
    stylists,
    isLoading,
    isRenewing,
    loadStylists,
    renewSubscription,
  }
})
