// Pokemon types for the Vue application

export interface Pokemon {
  name: string
  level: number
  happiness: number
  friendship: number
  experience: number
  experienceToNext: number
  mood: 'happy' | 'excited' | 'sad' | 'neutral'
  sprite: string
}

export interface GameState {
  biome: string
  crystals: number
}

export interface Player {
  crystals: number
  totalPokemon: number
}

export interface UpdateMessage {
  type: 'update'
  pokemon: Pokemon
  player: Player
  biome: string
}

export interface WebviewMessage {
  type: 'interact' | 'feed' | 'play' | 'sit' | 'lay' | 'sleep' | 'ready'
  data?: unknown
}
