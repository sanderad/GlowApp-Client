import axios, { type AxiosError } from 'axios'
import router from './router'
import RN from './router/routeNames'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Received final 401 from backend.')

      try {
        // TODO: Implement auth store, login and logout
        // const authStore = useAuthStore()
        // authStore.logout()
      } catch (error) {
        console.error('Failed to get auth store or call logout:', error)
        if (router.currentRoute.value.name !== RN.LOGIN) {
          router.push({ name: RN.LOGIN })
        }
      }
      return new Promise(() => {})
    }

    return Promise.reject(error)
  },
)

export default apiClient
