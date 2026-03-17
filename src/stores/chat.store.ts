import { defineStore } from 'pinia'
import apiClient, { API_BASE_URL } from '@/apiClient'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { ChatListItem, ChatMessage } from '@/types/chat.types'
import { useAuthStore } from './auth.store'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()

  // -- REST API STATE --
  const chatsList = ref<ChatListItem[]>([])
  const isLoadingChatsList = ref(false)
  const isAccountExpiredNoChats = ref(false)

  const activeChatMessages = ref<ChatMessage[]>([])
  const isLoadingMessages = ref(false)
  const activeChatId = ref<number | null>(null)

  // -- WEBSOCKET STATE --
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const isTypingDict = ref<Record<number, boolean>>({})
  const onlineUsersDict = ref<Record<number, boolean>>({})

  // -- COMPUTED --
  const totalUnreadCount = computed(() => {
    return chatsList.value.reduce((total, chat) => total + (chat.unreadCount || 0), 0)
  })

  // --------------------------------------------------------------------------
  // REST API Methods (Simulados hasta que el backend esté listo)
  // --------------------------------------------------------------------------

  async function fetchChatsList() {
    isLoadingChatsList.value = true
    isAccountExpiredNoChats.value = false
    try {
      const response = await apiClient.get<
        ChatListItem[] | { noChatsBecauseOfExpiredProfile: boolean }
      >('/chats')

      // Manejar el caso especial del backend cuando es estilista expirado y no tiene chats
      if (!Array.isArray(response.data) && 'noChatsBecauseOfExpiredProfile' in response.data) {
        if (response.data.noChatsBecauseOfExpiredProfile) {
          isAccountExpiredNoChats.value = true
        }
        chatsList.value = []
        return
      }

      chatsList.value = (response.data as ChatListItem[]).map((chat) => {
        const bufferedStatus = onlineUsersDict.value[chat.user.id]
        if (bufferedStatus !== undefined) {
          chat.isOnline = bufferedStatus
        }
        return {
          ...chat,
          unreadCount: chat.unreadCount || 0,
        }
      })
    } catch (err) {
      console.error(err)
    } finally {
      isLoadingChatsList.value = false
    }
  }

  async function fetchMessages(chatId: number) {
    isLoadingMessages.value = true
    try {
      const response = await apiClient.get<ChatMessage[]>(`/chats/${chatId}/messages`)
      activeChatMessages.value = response.data
    } catch (err) {
      console.error(err)
    } finally {
      isLoadingMessages.value = false
    }
  }

  async function findOrCreateChat(recipientUserId: number): Promise<number> {
    try {
      const response = await apiClient.post<{ chatId: number }>(`/chats/init/${recipientUserId}`)
      return response.data.chatId
    } catch (err: any) {
      console.error('Error finding or creating chat:', err)
      throw new Error('No se pudo iniciar el chat en este momento.')
    }
  }

  async function uploadImage(chatId: number, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    // Simulando el endpoint /chats/:chatId/upload
    const response = await apiClient.post<{ imageUrl: string }>(
      `/chats/${chatId}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return response.data.imageUrl
  }

  // --------------------------------------------------------------------------
  // WebSocket Methods
  // --------------------------------------------------------------------------

  function connect() {
    if (socket.value) return // Ya conectado

    // URL Real asumiendo el backend estándar.
    // Solo enviamos el token si es válido y no el mock por defecto,
    // de lo contrario, dejamos que el backend lo lea de las Cookies
    const tokenStr =
      localStorage.getItem('token') ||
      (authStore.token !== 'mock_token_123' ? authStore.token : null)

    const socketOptions: any = {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback a polling si WS puro falla
    }

    if (tokenStr) {
      socketOptions.auth = { token: tokenStr }
    }

    socket.value = io(API_BASE_URL, socketOptions)

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('[Socket.io] Conectado al namespace de chat')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('[Socket.io] Desconectado')
    })

    socket.value.on('connect_error', (error) => {
      console.error('[Socket.io] Error de conexión:', error)
    })

    socket.value.on('receive_message', (payload: ChatMessage & { chatId?: number }) => {
      // Por defecto si el backend manda el chatId, lo usamos, si no asumimos que pertenece al activo (Legacy)
      const msgChatId = payload.chatId || activeChatId.value

      // 1. Si estamos VIVOS en ese mismo chat en pantalla completa, empujarlo al hilo e informar Lectura
      if (msgChatId === activeChatId.value) {
        const exists = activeChatMessages.value.some((m) => m.id === payload.id)
        if (!exists) {
          activeChatMessages.value.push(payload)
          if (msgChatId != null) {
            markAsRead(msgChatId)
          }
        }
      }

      // 2. Si el mensaje nos llega globalmente, hay que actualizar el resumen visual del Inbox (ChatsView)
      if (msgChatId) {
        const chatItemIndex = chatsList.value.findIndex((c) => c.id === msgChatId)
        if (chatItemIndex !== -1) {
          const chatItem = chatsList.value[chatItemIndex]
          if (chatItem) {
            chatItem.lastMessage = payload.text
            chatItem.lastImageUrl = payload.imageUrl
            chatItem.timestamp = payload.createdAt

            // Si nos lo envió la OTRA persona y NO tenemos ese chat abierto ahora mismo = Nuevo no leído
            const sid = payload.senderId || payload.userId || payload.sender?.id
            chatItem.lastSenderId = sid

            const myId = authStore.user?.id || authStore.me?.id
            if (sid != myId && msgChatId !== activeChatId.value) {
              chatItem.unreadCount = (chatItem.unreadCount || 0) + 1
            }

            // Forzamos que este chat salte al primer puesto de "Mis Chats"
            chatsList.value.splice(chatItemIndex, 1)
            chatsList.value.unshift(chatItem)
          }
        } else if (msgChatId !== activeChatId.value) {
          // Si el chat ni siquiera estaba en la lista, forzamos un refetch HTTP
          fetchChatsList()
        }
      }
    })

    socket.value.on('message_read', (payload: { chatId: number; readBy: number }) => {
      // Todas las tildes del usuario se marcan leídas
      activeChatMessages.value.forEach((msg) => {
        const sid = msg.senderId || msg.userId || msg.sender?.id
        if (sid == authStore.user?.id) {
          msg.isRead = true
        }
      })
    })

    socket.value.on('typing', (payload: { chatId: number; userId: number; isTyping: boolean }) => {
      isTypingDict.value[payload.chatId] = payload.isTyping
    })

    socket.value.on(
      'user_status',
      (payload: { userId: number; isOnline: boolean; lastSeen: string }) => {
        // 1. Guardar en el buffer constante
        onlineUsersDict.value[payload.userId] = payload.isOnline

        // 2. Encontramos cualquier chat que contenga a este usuario y actualizamos su estado
        const chat = chatsList.value.find((c) => c.user.id == payload.userId)
        if (chat) {
          chat.isOnline = payload.isOnline
        }
      },
    )
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  // -- Eventos de Emisión (Frontend Emite hacia Backend) --

  function joinChat(chatId: number) {
    if (!isConnected.value) return
    activeChatId.value = chatId
    socket.value?.emit('join_chat', { chatId })
  }

  function leaveChat() {
    activeChatId.value = null
  }

  function emitTyping(chatId: number, isTyping: boolean) {
    if (!isConnected.value) return
    socket.value?.emit('typing', { chatId, isTyping })
  }

  function markAsRead(chatId: number) {
    if (!isConnected.value) return
    socket.value?.emit('mark_as_read', { chatId })
  }

  function sendMessage(chatId: number, text: string, imageUrl?: string) {
    if (!text.trim() && !imageUrl) return

    // Enviar por web socket. El backend ahora emite un "receive_message" devuelta que actualizará el array.
    if (socket.value?.connected) {
      socket.value.emit('send_message', { chatId, text, imageUrl })
    } else {
      console.warn('Socket no conectado, el mensaje no se pudo enviar.')
    }
  }

  return {
    chatsList,
    isLoadingChatsList,
    isAccountExpiredNoChats,
    activeChatMessages,
    isLoadingMessages,
    isConnected,
    isTypingDict,
    onlineUsersDict,
    totalUnreadCount,
    fetchChatsList,
    fetchMessages,
    findOrCreateChat,
    uploadImage,
    connect,
    disconnect,
    joinChat,
    leaveChat,
    emitTyping,
    markAsRead,
    sendMessage,
  }
})
