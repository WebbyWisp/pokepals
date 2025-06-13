<template>
  <div class="pokemon-info card text-center">
    <div class="pokemon-name font-bold text-primary mb-1">{{ pokemon.name }}</div>
    <div class="pokemon-level text-small">Level {{ pokemon.level }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Pokemon } from '../../types/pokemon'

interface Props {
  pokemon: Pokemon
}

defineProps<Props>()
</script>

<style scoped>
.pokemon-info {
  margin-bottom: 16px;
}

.pokemon-name {
  font-size: 18px;
}

.pokemon-level {
  opacity: 0.8;
}
</style>
