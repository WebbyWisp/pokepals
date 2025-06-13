<template>
  <div class="pokemon-pals-app">
    <div class="container">
      <!-- Pokemon Scene -->
      <PokemonScene :pokemon="currentPokemon" :biome="currentBiome" @pokemon-click="handlePokemonClick" />

      <!-- Pokemon Info -->
      <PokemonInfo v-if="currentPokemon" :pokemon="currentPokemon" />

      <!-- Stats Panel -->
      <StatsPanel v-if="currentPokemon" :pokemon="currentPokemon" />

      <!-- Action Buttons -->
      <ActionButtons
        :disabled="!currentPokemon"
        :crystals="playerCrystals"
        @interact="handleInteract"
        @feed="handleFeed"
        @play="handlePlay"
        @sit="handleSit"
        @lay="handleLay"
        @sleep="handleSleep"
      />

      <!-- Crystals Display -->
      <div class="card text-center">
        <div class="text-small mb-1">💎 Code Crystals</div>
        <div class="font-bold text-primary">{{ playerCrystals }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PokemonScene from '@/components/scene/PokemonScene.vue'
import ActionButtons from '@/components/ui/ActionButtons.vue'
import PokemonInfo from '@/components/ui/PokemonInfo.vue'
import StatsPanel from '@/components/ui/StatsPanel.vue'
import { useWebviewMessaging } from '@/composables/useWebviewMessaging'
import { useGameStateStore } from '@/stores/gameState'
import { usePokemonStore } from '@/stores/pokemon'
import type { Pokemon } from '@/types/pokemon'
import { onMounted, ref } from 'vue'

// Reactive data
const currentPokemon = ref<Pokemon | null>(null)
const currentBiome = ref<string>('forest')
const playerCrystals = ref<number>(0)

// Stores
const pokemonStore = usePokemonStore()
const gameStateStore = useGameStateStore()

// Webview messaging
const { sendMessage, onMessage } = useWebviewMessaging()

// Event handlers
const handlePokemonClick = () => {
  handleInteract()
}

const handleInteract = () => {
  sendMessage({ type: 'interact' })
  pokemonStore.triggerAnimation('Attack')
}

const handleFeed = () => {
  if (playerCrystals.value >= 10) {
    sendMessage({ type: 'feed' })
    pokemonStore.triggerAnimation('Eat')
  }
}

const handlePlay = () => {
  sendMessage({ type: 'play' })
  if (Math.random() < 0.5) {
    pokemonStore.triggerAnimation('Walk')
  } else {
    pokemonStore.triggerAnimation('Pose')
  }
}

const handleSit = () => {
  pokemonStore.triggerAnimation('Sit')
}

const handleLay = () => {
  pokemonStore.triggerAnimation('Laying')
}

const handleSleep = () => {
  pokemonStore.triggerAnimation('Sleep')
}

// Initialize
onMounted(() => {
  console.log('Vue App mounted!')

  // Listen for messages from extension
  onMessage((message) => {
    console.log('Received message:', message)

    if (message.type === 'update') {
      const { pokemon, player, biome } = message

      // Update local state
      currentPokemon.value = pokemon
      currentBiome.value = biome
      playerCrystals.value = player.crystals

      // Update stores
      pokemonStore.updatePokemon(pokemon)
      gameStateStore.updateState({ biome, crystals: player.crystals })
    }
  })

  // Send ready message to extension
  sendMessage({ type: 'ready' })
})
</script>

<style scoped>
.pokemon-pals-app {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.container {
  padding: 0;
}
</style>
