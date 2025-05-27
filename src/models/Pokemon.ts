export interface PokemonSpecies {
  id: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evolutionLevel?: number;
  evolutionTarget?: number;
  spriteUrl?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  biomes: string[];
}

export interface PokemonStats {
  level: number;
  experience: number;
  experienceToNext: number;
  happiness: number;
  friendship: number;
  totalCodeCrystalsGenerated: number;
  crystallGenerationRate: number;
}

export class Pokemon {
  public id: string;
  public species: PokemonSpecies;
  public stats: PokemonStats;
  public nickname?: string;
  public caughtAt: Date;
  public isActive: boolean;
  public mood: "happy" | "neutral" | "sad" | "excited";

  constructor(species: PokemonSpecies, nickname?: string) {
    this.id = this.generateId();
    this.species = species;
    this.nickname = nickname;
    this.caughtAt = new Date();
    this.isActive = false;
    this.mood = "happy";

    // Initialize stats
    this.stats = {
      level: 1,
      experience: 0,
      experienceToNext: this.calculateExperienceToNext(1),
      happiness: 100,
      friendship: 0,
      totalCodeCrystalsGenerated: 0,
      crystallGenerationRate: 1,
    };
  }

  private generateId(): string {
    return `pokemon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateExperienceToNext(level: number): number {
    // Simple quadratic experience curve
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  public gainExperience(amount: number): boolean {
    this.stats.experience += amount;

    while (this.stats.experience >= this.stats.experienceToNext) {
      this.stats.experience -= this.stats.experienceToNext;
      this.levelUp();
    }

    return this.checkEvolution();
  }

  private levelUp(): void {
    this.stats.level++;
    this.stats.experienceToNext = this.calculateExperienceToNext(
      this.stats.level
    );

    // Increase crystal generation rate
    this.stats.crystallGenerationRate = Math.floor(1 + this.stats.level * 0.1);

    // Boost happiness
    this.stats.happiness = Math.min(100, this.stats.happiness + 5);
  }

  private checkEvolution(): boolean {
    if (
      this.species.evolutionLevel &&
      this.stats.level >= this.species.evolutionLevel
    ) {
      return true;
    }
    return false;
  }

  public canEvolve(): boolean {
    return this.checkEvolution();
  }

  public updateMood(): void {
    if (this.stats.happiness >= 80) {
      this.mood = "excited";
    } else if (this.stats.happiness >= 60) {
      this.mood = "happy";
    } else if (this.stats.happiness >= 30) {
      this.mood = "neutral";
    } else {
      this.mood = "sad";
    }
  }

  public generateCrystals(timeMultiplier: number = 1): number {
    const baseRate = this.stats.crystallGenerationRate;
    const happinessMultiplier = this.stats.happiness / 100;
    const friendshipBonus = Math.floor(this.stats.friendship / 10) * 0.1;

    const crystalsGenerated = Math.floor(
      baseRate * happinessMultiplier * (1 + friendshipBonus) * timeMultiplier
    );

    this.stats.totalCodeCrystalsGenerated += crystalsGenerated;
    return crystalsGenerated;
  }

  public increaseFriendship(amount: number = 1): void {
    this.stats.friendship = Math.min(100, this.stats.friendship + amount);
  }

  public getDisplayName(): string {
    return this.nickname || this.species.name;
  }

  public toJSON(): any {
    return {
      id: this.id,
      species: this.species,
      stats: this.stats,
      nickname: this.nickname,
      caughtAt: this.caughtAt.toISOString(),
      isActive: this.isActive,
      mood: this.mood,
    };
  }

  public static fromJSON(data: any): Pokemon {
    const pokemon = new Pokemon(data.species, data.nickname);
    pokemon.id = data.id;
    pokemon.stats = data.stats;
    pokemon.caughtAt = new Date(data.caughtAt);
    pokemon.isActive = data.isActive;
    pokemon.mood = data.mood;
    return pokemon;
  }
}
