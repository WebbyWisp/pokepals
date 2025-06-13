import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Pokemon } from '../types/pokemon'

export const usePokemonStore = defineStore('pokemon', () => {
  // State
  const currentPokemon = ref<Pokemon | null>(null)
  const currentAnimation = ref<string>('Idle')
  const isAnimating = ref<boolean>(false)

  // Getters
  const hasActivePokemon = computed(() => currentPokemon.value !== null)
  const pokemonMood = computed(() => currentPokemon.value?.mood || 'neutral')

  // Actions
  const updatePokemon = (pokemon: Pokemon) => {
    currentPokemon.value = pokemon
  }

  const triggerAnimation = (animationName: string) => {
    if (isAnimating.value && currentAnimation.value !== 'Idle') {
      // Don't interrupt important animations
      return
    }

    currentAnimation.value = animationName
    isAnimating.value = true

    // Auto-return to idle after animation
    if (animationName !== 'Idle') {
      setTimeout(() => {
        currentAnimation.value = 'Idle'
        isAnimating.value = false
      }, 2000) // 2 second animation duration
    }
  }

  const resetAnimation = () => {
    currentAnimation.value = 'Idle'
    isAnimating.value = false
  }

  return {
    // State
    currentPokemon,
    currentAnimation,
    isAnimating,

    // Getters
    hasActivePokemon,
    pokemonMood,

    // Actions
    updatePokemon,
    triggerAnimation,
    resetAnimation
  }
})
