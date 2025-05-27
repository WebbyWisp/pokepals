import { Player } from "./Player";
import { Pokemon } from "./Pokemon";

export interface SaveData {
  version: string;
  player: any;
  pokemon: any[];
  gameSettings: GameSettings;
  lastSaved: string;
}

export interface GameSettings {
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  enableIdleProgression: boolean;
  encounterRate: number; // encounters per minute of coding
  crystalGenerationRate: number; // base crystals per minute
  experienceRate: number; // XP multiplier
}

export class GameState {
  public player: Player;
  public pokemon: Map<string, Pokemon>;
  public settings: GameSettings;
  public isInitialized: boolean;
  public currentBiome: string;
  public lastActivityTime: Date;
  private saveVersion: string = "1.0.0";

  constructor() {
    this.player = new Player();
    this.pokemon = new Map();
    this.isInitialized = false;
    this.currentBiome = "forest"; // Default biome
    this.lastActivityTime = new Date();

    // Initialize game settings
    this.settings = {
      autoSave: true,
      autoSaveInterval: 5,
      enableIdleProgression: true,
      encounterRate: 0.1, // 1 encounter per 10 minutes of coding
      crystalGenerationRate: 1.0,
      experienceRate: 1.0,
    };
  }

  public initialize(): void {
    if (!this.isInitialized) {
      // Create starter Pokemon if no active Pokemon
      if (!this.player.activePokemonId || this.pokemon.size === 0) {
        this.createStarterPokemon();
      }
      this.isInitialized = true;
    }
  }

  private createStarterPokemon(): void {
    // For now, create a basic starter - this will be replaced with proper data loading later
    const starterSpecies = {
      id: 25, // Pikachu as example
      name: "Pikachu",
      types: ["Electric"],
      baseStats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
      evolutionLevel: 16,
      evolutionTarget: 26, // Raichu
      rarity: "common" as const,
      biomes: ["forest", "laboratory"],
    };

    const starter = new Pokemon(starterSpecies);
    starter.isActive = true;
    this.addPokemon(starter);
    this.player.activePokemonId = starter.id;
  }

  public addPokemon(pokemon: Pokemon): void {
    this.pokemon.set(pokemon.id, pokemon);
  }

  public removePokemon(pokemonId: string): boolean {
    const pokemon = this.pokemon.get(pokemonId);
    if (pokemon && !pokemon.isActive) {
      this.pokemon.delete(pokemonId);
      return true;
    }
    return false;
  }

  public getActivePokemon(): Pokemon | undefined {
    if (this.player.activePokemonId) {
      return this.pokemon.get(this.player.activePokemonId);
    }
    return undefined;
  }

  public setActivePokemon(pokemonId: string): boolean {
    const pokemon = this.pokemon.get(pokemonId);
    if (pokemon) {
      // Deactivate current active Pokemon
      if (this.player.activePokemonId) {
        const currentActive = this.pokemon.get(this.player.activePokemonId);
        if (currentActive) {
          currentActive.isActive = false;
        }
      }

      // Activate new Pokemon
      pokemon.isActive = true;
      this.player.activePokemonId = pokemonId;
      return true;
    }
    return false;
  }

  public getAllPokemon(): Pokemon[] {
    return Array.from(this.pokemon.values());
  }

  public getPokemonBySpecies(speciesId: number): Pokemon[] {
    return Array.from(this.pokemon.values()).filter(
      (p) => p.species.id === speciesId
    );
  }

  public updateCurrentBiome(biomeId: string): void {
    if (this.currentBiome !== biomeId) {
      this.currentBiome = biomeId;
      this.player.trackBiomeActivity(biomeId);
    }
  }

  public processIdleTime(): number {
    const now = new Date();
    const timeDifference = now.getTime() - this.lastActivityTime.getTime();
    const minutesIdle = Math.floor(timeDifference / (1000 * 60));

    if (minutesIdle > 0 && this.settings.enableIdleProgression) {
      const activePokemon = this.getActivePokemon();
      if (activePokemon) {
        // Generate crystals based on idle time
        const crystalsGenerated = activePokemon.generateCrystals(
          minutesIdle * this.settings.crystalGenerationRate
        );
        this.player.addCodeCrystals(crystalsGenerated);

        // Small friendship gain for idle time
        activePokemon.increaseFriendship(Math.floor(minutesIdle / 10));

        // Update mood
        activePokemon.updateMood();
      }
    }

    this.lastActivityTime = now;
    return minutesIdle;
  }

  public updateActivity(): void {
    this.lastActivityTime = new Date();
  }

  public getTotalPokemonCount(): number {
    return this.pokemon.size;
  }

  public getUniqueSpeciesCount(): number {
    const uniqueSpecies = new Set();
    for (const pokemon of this.pokemon.values()) {
      uniqueSpecies.add(pokemon.species.id);
    }
    return uniqueSpecies.size;
  }

  public toSaveData(): SaveData {
    return {
      version: this.saveVersion,
      player: this.player.toJSON(),
      pokemon: Array.from(this.pokemon.values()).map((p) => p.toJSON()),
      gameSettings: this.settings,
      lastSaved: new Date().toISOString(),
    };
  }

  public static fromSaveData(saveData: SaveData): GameState {
    const gameState = new GameState();

    // Restore player
    gameState.player = Player.fromJSON(saveData.player);

    // Restore Pokemon
    saveData.pokemon.forEach((pokemonData) => {
      const pokemon = Pokemon.fromJSON(pokemonData);
      gameState.pokemon.set(pokemon.id, pokemon);
    });

    // Restore settings
    gameState.settings = { ...gameState.settings, ...saveData.gameSettings };

    // Set initialized flag
    gameState.isInitialized = true;

    return gameState;
  }

  public validateSaveData(saveData: any): boolean {
    try {
      return (
        saveData &&
        typeof saveData.version === "string" &&
        saveData.player &&
        Array.isArray(saveData.pokemon) &&
        saveData.gameSettings &&
        typeof saveData.lastSaved === "string"
      );
    } catch (error) {
      return false;
    }
  }

  public reset(): void {
    this.player = new Player();
    this.pokemon.clear();
    this.isInitialized = false;
    this.currentBiome = "forest";
    this.lastActivityTime = new Date();
    this.initialize();
  }
}
