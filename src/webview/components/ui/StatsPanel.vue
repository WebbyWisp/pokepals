<template>
  <div class="stats-panel card">
    <div class="stat-row">
      <span class="stat-label">💖 Happiness</span>
      <span class="stat-value font-bold text-primary">{{ pokemon.happiness }}/100</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${pokemon.happiness}%` }"></div>
    </div>

    <div class="stat-row mt-2">
      <span class="stat-label">🤝 Friendship</span>
      <span class="stat-value font-bold text-primary">{{ pokemon.friendship }}/100</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${pokemon.friendship}%` }"></div>
    </div>

    <div class="stat-row mt-2">
      <span class="stat-label">⭐ Experience</span>
      <span class="stat-value font-bold text-primary">{{ pokemon.experience }}/{{ pokemon.experienceToNext }}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${(pokemon.experience / pokemon.experienceToNext) * 100}%` }"></div>
    </div>
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
.stats-panel {
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
}

.stat-value {
  font-size: 12px;
}
</style>
