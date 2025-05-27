export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  progress: number
  maxProgress: number
  isUnlocked: boolean
}

export interface PlayerStats {
  totalCodeCrystals: number
  totalCrystalsGenerated: number
  totalExperienceGained: number
  totalCodingTime: number // in minutes
  totalLinesWritten: number
  totalFilesCreated: number
  totalCommits: number
  startDate: Date
  lastActiveDate: Date
}

export interface BiomeProgress {
  biomeId: string
  biomeName: string
  timeSpent: number // in minutes
  encountersTotal: number
  pokemonCaught: number
  isUnlocked: boolean
}

export class Player {
  public playerId: string
  public stats: PlayerStats
  public achievements: Achievement[]
  public biomes: Map<string, BiomeProgress>
  public activePokemonId?: string
  public settings: {
    enableAnimations: boolean
    enableSounds: boolean
    showInStatusBar: boolean
    enableNotifications: boolean
  }

  constructor() {
    this.playerId = this.generatePlayerId()
    this.achievements = []
    this.biomes = new Map()

    // Initialize stats
    this.stats = {
      totalCodeCrystals: 0,
      totalCrystalsGenerated: 0,
      totalExperienceGained: 0,
      totalCodingTime: 0,
      totalLinesWritten: 0,
      totalFilesCreated: 0,
      totalCommits: 0,
      startDate: new Date(),
      lastActiveDate: new Date()
    }

    // Initialize settings
    this.settings = {
      enableAnimations: true,
      enableSounds: false,
      showInStatusBar: true,
      enableNotifications: true
    }

    // Initialize basic biomes
    this.initializeBiomes()
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeBiomes(): void {
    const basicBiomes = [
      { id: 'forest', name: 'Forest', unlocked: true },
      { id: 'cave', name: 'Cave', unlocked: false },
      { id: 'ocean', name: 'Ocean', unlocked: false },
      { id: 'laboratory', name: 'Laboratory', unlocked: false },
      { id: 'library', name: 'Library', unlocked: false },
      { id: 'garden', name: 'Garden', unlocked: false }
    ]

    basicBiomes.forEach((biome) => {
      this.biomes.set(biome.id, {
        biomeId: biome.id,
        biomeName: biome.name,
        timeSpent: 0,
        encountersTotal: 0,
        pokemonCaught: 0,
        isUnlocked: biome.unlocked
      })
    })
  }

  public addCodeCrystals(amount: number): void {
    this.stats.totalCodeCrystals += amount
    this.stats.totalCrystalsGenerated += amount
    this.updateLastActive()
  }

  public spendCodeCrystals(amount: number): boolean {
    if (this.stats.totalCodeCrystals >= amount) {
      this.stats.totalCodeCrystals -= amount
      this.updateLastActive()
      return true
    }
    return false
  }

  public addExperience(amount: number): void {
    this.stats.totalExperienceGained += amount
    this.updateLastActive()
  }

  public trackCodingActivity(linesWritten: number = 0, timeSpent: number = 0): void {
    this.stats.totalLinesWritten += linesWritten
    this.stats.totalCodingTime += timeSpent
    this.updateLastActive()
  }

  public trackFileCreated(): void {
    this.stats.totalFilesCreated++
    this.updateLastActive()
  }

  public trackCommit(): void {
    this.stats.totalCommits++
    this.updateLastActive()
  }

  public trackBiomeActivity(biomeId: string, timeSpent: number = 1): void {
    const biome = this.biomes.get(biomeId)
    if (biome) {
      biome.timeSpent += timeSpent
      this.biomes.set(biomeId, biome)
    }
    this.updateLastActive()
  }

  public recordEncounter(biomeId: string, caught: boolean = false): void {
    const biome = this.biomes.get(biomeId)
    if (biome) {
      biome.encountersTotal++
      if (caught) {
        biome.pokemonCaught++
      }
      this.biomes.set(biomeId, biome)
    }
    this.updateLastActive()
  }

  public unlockBiome(biomeId: string): boolean {
    const biome = this.biomes.get(biomeId)
    if (biome && !biome.isUnlocked) {
      biome.isUnlocked = true
      this.biomes.set(biomeId, biome)
      return true
    }
    return false
  }

  public addAchievement(achievement: Achievement): boolean {
    const existing = this.achievements.find((a) => a.id === achievement.id)
    if (!existing) {
      achievement.unlockedAt = new Date()
      achievement.isUnlocked = true
      this.achievements.push(achievement)
      return true
    }
    return false
  }

  public updateAchievementProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements.find((a) => a.id === achievementId)
    if (achievement) {
      achievement.progress = Math.min(progress, achievement.maxProgress)
      if (achievement.progress >= achievement.maxProgress && !achievement.isUnlocked) {
        achievement.isUnlocked = true
        achievement.unlockedAt = new Date()
      }
    }
  }

  public getUnlockedBiomes(): BiomeProgress[] {
    return Array.from(this.biomes.values()).filter((biome) => biome.isUnlocked)
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.isUnlocked)
  }

  public getTotalPlayTime(): number {
    return Math.floor((Date.now() - this.stats.startDate.getTime()) / (1000 * 60))
  }

  private updateLastActive(): void {
    this.stats.lastActiveDate = new Date()
  }

  public toJSON(): Record<string, unknown> {
    return {
      playerId: this.playerId,
      stats: {
        ...this.stats,
        startDate: this.stats.startDate.toISOString(),
        lastActiveDate: this.stats.lastActiveDate.toISOString()
      },
      achievements: this.achievements.map((a) => ({
        ...a,
        unlockedAt: a.unlockedAt?.toISOString()
      })),
      biomes: Array.from(this.biomes.entries()),
      activePokemonId: this.activePokemonId,
      settings: this.settings
    }
  }

  public static fromJSON(data: Record<string, unknown>): Player {
    const player = new Player()
    player.playerId = data.playerId as string

    // Restore stats
    const stats = data.stats as Record<string, unknown>
    player.stats = {
      ...stats,
      startDate: new Date(stats.startDate as string),
      lastActiveDate: new Date(stats.lastActiveDate as string)
    } as PlayerStats

    // Restore achievements
    const achievements = data.achievements as Array<Record<string, unknown>>
    player.achievements = achievements.map(
      (a) =>
        ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt as string) : undefined
        }) as Achievement
    )

    // Restore biomes
    const biomes = data.biomes as Array<[string, BiomeProgress]>
    player.biomes = new Map(biomes)

    player.activePokemonId = data.activePokemonId as string | undefined
    player.settings = { ...player.settings, ...(data.settings as Record<string, boolean>) }

    return player
  }
}
