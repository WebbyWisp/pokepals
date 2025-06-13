<template>
  <div class="action-buttons card">
    <div class="btn-group">
      <button class="btn btn-small" @click="$emit('interact')" :disabled="disabled">Pet 🤗</button>
      <button class="btn btn-small" @click="$emit('feed')" :disabled="disabled || crystals < 10">Feed 🍎 (10💎)</button>
      <button class="btn btn-small" @click="$emit('play')" :disabled="disabled">Play 🎮</button>
    </div>

    <div class="btn-group mt-2">
      <button class="btn btn-small" @click="$emit('sit')" :disabled="disabled">Sit 💺</button>
      <button class="btn btn-small" @click="$emit('lay')" :disabled="disabled">Lay 😴</button>
      <button class="btn btn-small" @click="$emit('sleep')" :disabled="disabled">Sleep 🌙</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  disabled: boolean
  crystals: number
}

defineProps<Props>()

defineEmits<{
  interact: []
  feed: []
  play: []
  sit: []
  lay: []
  sleep: []
}>()
</script>

<style scoped>
.action-buttons {
  margin-bottom: 16px;
}
</style>
