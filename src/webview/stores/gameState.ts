import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameState } from '../types/pokemon'

export const useGameStateStore = defineStore('gameState', () => {
  const biome = ref<string>('forest')
  const crystals = ref<number>(0)
  const totalPokemon = ref<number>(0)

  const updateState = (state: Partial<GameState & { totalPokemon?: number }>) => {
    if (state.biome !== undefined) {
      biome.value = state.biome
    }
    if (state.crystals !== undefined) {
      crystals.value = state.crystals
    }
    if (state.totalPokemon !== undefined) {
      totalPokemon.value = state.totalPokemon
    }
  }

  return {
    biome,
    crystals,
    totalPokemon,
    updateState
  }
})
