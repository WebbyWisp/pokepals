/**
 * Example test file for Pokémon Pals VS Code extension
 * This demonstrates how to write tests using Vitest
 */

import { beforeEach, describe, expect, it } from 'vitest'
import type { PokemonSpecies } from '../models/Pokemon'
import { Pokemon } from '../models/Pokemon'

describe('Pokemon Model Tests', () => {
  let testSpecies: PokemonSpecies

  beforeEach(() => {
    testSpecies = {
      id: 25,
      name: 'Pikachu',
      types: ['Electric'],
      rarity: 'common',
      baseStats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90
      },
      biomes: ['forest', 'city'],
      spriteUrl: 'pikachu.png'
    }
  })

  it('should create a new Pokemon with correct initial values', () => {
    const pokemon = new Pokemon(testSpecies, 'Sparky')

    expect(pokemon.species).toEqual(testSpecies)
    expect(pokemon.nickname).toBe('Sparky')
    expect(pokemon.stats.level).toBe(1)
    expect(pokemon.stats.happiness).toBe(100)
    expect(pokemon.isActive).toBe(false)
    expect(pokemon.mood).toBe('happy')
    expect(pokemon.id).toBeDefined()
    expect(pokemon.caughtAt).toBeInstanceOf(Date)
  })

  it('should generate unique IDs for different Pokemon', () => {
    const pokemon1 = new Pokemon(testSpecies)
    const pokemon2 = new Pokemon(testSpecies)

    expect(pokemon1.id).not.toBe(pokemon2.id)
  })

  it('should update mood based on happiness', () => {
    const pokemon = new Pokemon(testSpecies)

    pokemon.stats.happiness = 90
    pokemon.updateMood()
    expect(pokemon.mood).toBe('excited')

    pokemon.stats.happiness = 70
    pokemon.updateMood()
    expect(pokemon.mood).toBe('happy')

    pokemon.stats.happiness = 40
    pokemon.updateMood()
    expect(pokemon.mood).toBe('neutral')

    pokemon.stats.happiness = 20
    pokemon.updateMood()
    expect(pokemon.mood).toBe('sad')
  })

  it('should gain experience and level up correctly', () => {
    const pokemon = new Pokemon(testSpecies)
    const initialLevel = pokemon.stats.level
    const initialExp = pokemon.stats.experience

    // Gain some experience
    pokemon.gainExperience(50)

    expect(pokemon.stats.experience).toBeGreaterThan(initialExp)
    expect(pokemon.stats.level).toBeGreaterThanOrEqual(initialLevel)
  })

  it('should serialize and deserialize correctly', () => {
    const originalPokemon = new Pokemon(testSpecies, 'TestMon')
    originalPokemon.stats.level = 5
    originalPokemon.stats.happiness = 80

    const serialized = originalPokemon.toJSON()
    const deserialized = Pokemon.fromJSON(serialized)

    expect(deserialized.id).toBe(originalPokemon.id)
    expect(deserialized.nickname).toBe(originalPokemon.nickname)
    expect(deserialized.stats.level).toBe(originalPokemon.stats.level)
    expect(deserialized.stats.happiness).toBe(originalPokemon.stats.happiness)
    expect(deserialized.species.name).toBe(originalPokemon.species.name)
  })
})

describe('VS Code Integration Tests', () => {
  it('should handle VS Code API calls gracefully', async () => {
    // This test demonstrates how to test VS Code extension functionality
    // The vscode module is mocked using jest-mock-vscode

    // Import vscode - this will automatically use our mock
    const vscode = await import('vscode')

    expect(vscode).toBeDefined()
    expect(vscode.commands).toBeDefined()
    expect(vscode.window).toBeDefined()
    expect(vscode.workspace).toBeDefined()

    // Test that we can call VS Code API methods
    expect(typeof vscode.commands.registerCommand).toBe('function')
    expect(typeof vscode.window.showInformationMessage).toBe('function')
  })
})
