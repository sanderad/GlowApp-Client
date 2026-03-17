import { defineStore } from 'pinia'
import apiClient from '@/apiClient'
import { ref } from 'vue'
import type { ClientRegister, StylistRegister } from '@/types/auth.types'
import type { User } from '@/types/stylist.types'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<any>(null)
  const token = ref<string>('')
  const me = ref<User | null>(null)

  // REHYDRATION INICIAL
  const storedToken = localStorage.getItem('token')
  if (storedToken && storedToken !== 'mock_token_123') {
    try {
      const payloadBase64 = storedToken.split('.')[1]
      if (payloadBase64) {
        const decoded = JSON.parse(atob(payloadBase64))
        user.value = { id: decoded.id, ...decoded }
        token.value = storedToken
        isAuthenticated.value = true
      }
    } catch (e) {
      console.error('Failed to parse token on startup', e)
    }
  }

  // Función auxiliar para extraer el user del JWT o del payload
  const extractUserFromData = (data: any) => {
    if (data.user) {
      user.value = data.user
    } else if (data.token) {
      localStorage.setItem('token', data.token)
      token.value = data.token
      try {
        const payloadBase64 = data.token.split('.')[1]
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64))
          user.value = { id: decoded.id, ...decoded }
        }
      } catch (e) {
        console.error('Error parseando token', e)
      }
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      if (response.status === 401 || response.status === 500)
        throw new Error('Error al iniciar sesión')

      const data = response.data
      extractUserFromData(data)
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async function registerClient(client: ClientRegister): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/register/client', client)
      const data = response.data
      extractUserFromData(data)
      isAuthenticated.value = true
      return true
    } catch (error: any) {
      console.error(error)
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Error al registrar cliente')
    }
  }

  async function registerStylist(stylist: StylistRegister): Promise<boolean> {
    try {
      console.log('registerStylist')
      const response = await apiClient.post('/auth/register/stylist', stylist)
      const data = response.data
      extractUserFromData(data)
      isAuthenticated.value = true
      return true
    } catch (error: any) {
      console.error(error)
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Error al registrar estilista')
    }
  }

  async function getMe(): Promise<boolean> {
    try {
      const response = await apiClient.get<User>('/auth/me')
      if (response.status === 401 || response.status === 500)
        throw new Error('Error al obtener usuario')

      me.value = response.data
      console.log(me.value)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  function logout() {
    localStorage.removeItem('token')
    token.value = ''
    user.value = null
    me.value = null
    isAuthenticated.value = false
  }

  function updateProfilePhoto(url: string) {
    if (me.value) me.value.photoUrl = url
    if (user.value) user.value.photo = url
  }

  async function updateUser(data: any): Promise<boolean> {
    try {
      const response = await apiClient.put('/users/me', data)
      if (me.value) Object.assign(me.value, response.data)
      return true
    } catch (error) {
      console.error('Error updating base user info', error)
      return false
    }
  }

  async function updateStylistProfile(data: any): Promise<boolean> {
    try {
      // Usaremos el me.value actualizado o devolvermos success si el endpoint PUT responde bien
      await apiClient.put('/stylists/me', data)
      // Como el perfil incluye servicios y portfolio complejos, optamos por recargar /auth/me
      await getMe()
      return true
    } catch (error) {
      console.error('Error updating stylist profile', error)
      return false
    }
  }

  return {
    isAuthenticated,
    user,
    token,
    login,
    registerClient,
    registerStylist,
    getMe,
    logout,
    updateProfilePhoto,
    updateUser,
    updateStylistProfile,
    me,
  }
})
