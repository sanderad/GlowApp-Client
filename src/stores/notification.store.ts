import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info'

export const useNotificationStore = defineStore('notification', () => {
  const isVisible = ref(false)
  const message = ref('')
  const type = ref<NotificationType>('info')
  const timeoutId = ref<number | null>(null)

  function showNotification(msg: string, notifType: NotificationType = 'info', duration = 3000) {
    message.value = msg
    type.value = notifType
    isVisible.value = true

    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }

    timeoutId.value = window.setTimeout(() => {
      hideNotification()
    }, duration)
  }

  function showSuccess(msg: string, duration = 3000) {
    showNotification(msg, 'success', duration)
  }

  function showError(msg: string, duration = 4000) {
    showNotification(msg, 'error', duration)
  }

  function showInfo(msg: string, duration = 3000) {
    showNotification(msg, 'info', duration)
  }

  function hideNotification() {
    isVisible.value = false
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }

  return {
    isVisible,
    message,
    type,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    hideNotification,
  }
})
