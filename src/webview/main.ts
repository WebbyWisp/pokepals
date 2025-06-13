import type { VSCodeAPI } from '@/types/global'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.css'

// VS Code API setup
declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI
  }
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Mount the app
app.mount('#app')

console.log('Vue 3 Pokémon Pals app initialized!')
