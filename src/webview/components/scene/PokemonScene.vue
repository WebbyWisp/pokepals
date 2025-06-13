<template>
  <div class="pokemon-scene" :class="`biome-${biome}`">
    <div class="biome-indicator">{{ biome }}</div>

    <div class="scene-container">
      <!-- Background -->
      <div class="background-image"></div>

      <!-- Pokemon Sprite -->
      <div
        v-if="pokemon"
        class="pokemon-sprite pixel-art"
        :class="[`mood-${pokemon.mood}`, { clickable: true }]"
        @click="$emit('pokemon-click')"
      >
        <!-- Placeholder for now - will be replaced with actual sprite system -->
        <div class="sprite-placeholder">
          {{ pokemon.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pokemon } from '@/types/pokemon'

interface Props {
  pokemon: Pokemon | null
  biome: string
}

defineProps<Props>()

defineEmits<{
  'pokemon-click': []
}>()
</script>

<style scoped>
.pokemon-scene {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  margin: 0 auto 16px auto;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #87ceeb 0%, #98e4ff 50%, #90ee90 100%);
}

.biome-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  text-transform: capitalize;
  z-index: 20;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.scene-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  /* Background image will be set via CSS custom property from parent */
}

.pokemon-sprite {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}

.pokemon-sprite.clickable:hover {
  transform: translateX(-50%) scale(1.1);
}

.pokemon-sprite.mood-happy {
  filter: brightness(1.1);
}

.pokemon-sprite.mood-excited {
  filter: brightness(1.2) saturate(1.2);
}

.pokemon-sprite.mood-sad {
  filter: grayscale(0.3) brightness(0.8);
}

.sprite-placeholder {
  background: var(--button-background);
  color: var(--button-foreground);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  min-width: 60px;
}

/* Biome variations */
.biome-forest {
  background: linear-gradient(to bottom, #87ceeb 0%, #98e4ff 40%, #90ee90 100%);
}

.biome-mountain {
  background: linear-gradient(to bottom, #b0c4de 0%, #d3d3d3 50%, #a0a0a0 100%);
}

.biome-beach {
  background: linear-gradient(to bottom, #87ceeb 0%, #f0e68c 70%, #f4a460 100%);
}
</style>
