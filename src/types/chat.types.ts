export interface ChatUser {
  id: number
  name: string
  photo: string
}

export interface ChatMessage {
  id: number | string
  text: string
  imageUrl?: string
  senderId?: number
  userId?: number
  sender?: { id: number; [key: string]: any }
  createdAt: string
  isRead: boolean
}

export interface ChatListItem {
  id: number
  user: ChatUser
  lastMessage: string | null
  lastImageUrl?: string | null
  lastSenderId?: number
  timestamp: string | null
  unreadCount: number
  isOnline: boolean
}
