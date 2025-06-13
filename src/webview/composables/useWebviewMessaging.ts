import type { VSCodeAPI, WindowWithVSCode } from '@/types/global'
import type { UpdateMessage, WebviewMessage } from '@/types/pokemon'
import { onUnmounted, ref } from 'vue'

// VS Code API
let vscode: VSCodeAPI | undefined = undefined

if (typeof window !== 'undefined' && 'acquireVsCodeApi' in window) {
  vscode = (window as WindowWithVSCode).acquireVsCodeApi()
}

export function useWebviewMessaging() {
  const isConnected = ref(false)

  // Message listeners
  const messageListeners = new Set<(message: UpdateMessage) => void>()

  // Send message to extension
  const sendMessage = (message: WebviewMessage) => {
    if (vscode) {
      console.log('Sending message to extension:', message)
      vscode.postMessage(message)
    } else {
      console.warn('VS Code API not available')
    }
  }

  // Listen for messages from extension
  const onMessage = (callback: (message: UpdateMessage) => void) => {
    messageListeners.add(callback)

    // Return cleanup function
    return () => {
      messageListeners.delete(callback)
    }
  }

  // Setup message listener
  const handleMessage = (event: MessageEvent) => {
    const message = event.data
    console.log('Received message from extension:', message)

    // Notify all listeners
    messageListeners.forEach((listener) => {
      try {
        listener(message)
      } catch (error) {
        console.error('Error in message listener:', error)
      }
    })
  }

  // Initialize
  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage)
    isConnected.value = !!vscode
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', handleMessage)
    }
    messageListeners.clear()
  })

  return {
    sendMessage,
    onMessage,
    isConnected: isConnected
  }
}
