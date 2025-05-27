import * as vscode from "vscode";
import { GameState } from "../models/GameState";
import { Pokemon } from "../models/Pokemon";
import { SaveManager } from "./SaveManager";

export class GameManager {
  private static instance: GameManager;
  private gameState: GameState;
  private saveManager: SaveManager;
  private context: vscode.ExtensionContext;
  private gameLoopTimer?: NodeJS.Timeout;
  private isRunning: boolean = false;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.gameState = new GameState();
    this.saveManager = new SaveManager(context);
  }

  public static getInstance(context?: vscode.ExtensionContext): GameManager {
    if (!GameManager.instance && context) {
      GameManager.instance = new GameManager(context);
    }
    return GameManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Try to load existing save
      const loadedState = await this.saveManager.loadGame();
      if (loadedState) {
        this.gameState = loadedState;
        // Process any idle time since last save
        const idleMinutes = this.gameState.processIdleTime();
        if (idleMinutes > 0) {
          this.showIdleProgressNotification(idleMinutes);
        }
      } else {
        // Initialize new game
        this.gameState.initialize();
        await this.saveManager.saveGame(this.gameState);
        this.showWelcomeNotification();
      }

      // Start game systems
      this.startGameLoop();
      this.startAutoSave();

      // Set context variable for UI visibility
      await vscode.commands.executeCommand(
        "setContext",
        "pokepals.active",
        true
      );

      console.log("Pokémon Pals initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Pokémon Pals:", error);
      vscode.window.showErrorMessage("Failed to initialize Pokémon Pals");
    }
  }

  private startGameLoop(): void {
    if (this.gameLoopTimer) {
      clearInterval(this.gameLoopTimer);
    }

    // Run game loop every 30 seconds
    this.gameLoopTimer = setInterval(() => {
      this.updateGame();
    }, 30000);

    this.isRunning = true;
  }

  private updateGame(): void {
    if (!this.gameState.isInitialized) {
      return;
    }

    const activePokemon = this.gameState.getActivePokemon();
    if (activePokemon) {
      // Generate crystals
      const crystalsGenerated = activePokemon.generateCrystals(0.5); // 30 seconds = 0.5 minutes
      if (crystalsGenerated > 0) {
        this.gameState.player.addCodeCrystals(crystalsGenerated);
      }

      // Update mood
      activePokemon.updateMood();

      // Small friendship gain for active time
      activePokemon.increaseFriendship(0.1);
    }

    // Update activity timestamp
    this.gameState.updateActivity();
  }

  private startAutoSave(): void {
    if (this.gameState.settings.autoSave) {
      this.saveManager.startAutoSave(
        this.gameState,
        this.gameState.settings.autoSaveInterval
      );
    }
  }

  public async handleTextDocumentChange(
    document: vscode.TextDocument
  ): Promise<void> {
    if (!this.gameState.isInitialized) {
      return;
    }

    // Update current biome based on file type
    const biome = this.getBiomeFromFileType(document.fileName);
    this.gameState.updateCurrentBiome(biome);

    // Track coding activity
    this.gameState.player.trackCodingActivity(1, 0.1);

    // Give XP to active Pokemon
    const activePokemon = this.gameState.getActivePokemon();
    if (activePokemon) {
      const xpGained = Math.floor(Math.random() * 3) + 1; // 1-3 XP per keystroke
      const evolved = activePokemon.gainExperience(xpGained);
      this.gameState.player.addExperience(xpGained);

      if (evolved && activePokemon.canEvolve()) {
        this.showEvolutionNotification(activePokemon);
      }
    }

    // Random encounter chance
    if (Math.random() < this.gameState.settings.encounterRate / 60) {
      // Per-second chance
      await this.triggerWildEncounter(biome);
    }
  }

  public async handleFileSave(document: vscode.TextDocument): Promise<void> {
    if (!this.gameState.isInitialized) {
      return;
    }

    // Bonus XP and crystals for saving
    const activePokemon = this.gameState.getActivePokemon();
    if (activePokemon) {
      const bonusXp = 10;
      activePokemon.gainExperience(bonusXp);
      this.gameState.player.addExperience(bonusXp);

      // Bonus crystals
      const bonusCrystals = 5;
      this.gameState.player.addCodeCrystals(bonusCrystals);

      // Happiness boost
      activePokemon.stats.happiness = Math.min(
        100,
        activePokemon.stats.happiness + 2
      );
    }
  }

  public async handleFileCreate(): Promise<void> {
    if (!this.gameState.isInitialized) {
      return;
    }

    this.gameState.player.trackFileCreated();

    // Bonus for file creation
    const activePokemon = this.gameState.getActivePokemon();
    if (activePokemon) {
      activePokemon.gainExperience(25);
      activePokemon.increaseFriendship(1);
    }
  }

  private getBiomeFromFileType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
      case "py":
      case "java":
      case "cpp":
      case "c":
      case "cs":
      case "go":
      case "rs":
        return "forest";
      case "test":
      case "spec":
        return "laboratory";
      case "md":
      case "txt":
      case "doc":
      case "pdf":
        return "library";
      case "json":
      case "yaml":
      case "yml":
      case "toml":
      case "xml":
      case "config":
        return "cave";
      case "css":
      case "scss":
      case "sass":
      case "less":
      case "html":
        return "garden";
      case "sql":
      case "db":
      case "sqlite":
        return "ocean";
      default:
        return "forest";
    }
  }

  private async triggerWildEncounter(biome: string): Promise<void> {
    // For now, just log the encounter - will implement proper encounter system later
    console.log(`Wild encounter in ${biome}!`);
    this.gameState.player.recordEncounter(biome, false);
  }

  private showWelcomeNotification(): void {
    const activePokemon = this.gameState.getActivePokemon();
    if (activePokemon) {
      vscode.window.showInformationMessage(
        `Welcome to Pokémon Pals! Your companion ${activePokemon.getDisplayName()} is ready to code with you! 🎮`
      );
    }
  }

  private showIdleProgressNotification(idleMinutes: number): void {
    const activePokemon = this.gameState.getActivePokemon();
    if (activePokemon && idleMinutes >= 60) {
      vscode.window.showInformationMessage(
        `Welcome back! ${activePokemon.getDisplayName()} generated ${Math.floor(
          idleMinutes
        )} Code Crystals while you were away! ✨`
      );
    }
  }

  private showEvolutionNotification(pokemon: Pokemon): void {
    vscode.window.showInformationMessage(
      `🎉 ${pokemon.getDisplayName()} is ready to evolve! (Level ${
        pokemon.stats.level
      })`
    );
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public async saveGame(): Promise<boolean> {
    return await this.saveManager.saveGame(this.gameState);
  }

  public async resetGame(): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
      "Are you sure you want to reset your Pokémon Pals progress? This cannot be undone.",
      "Reset",
      "Cancel"
    );

    if (confirm === "Reset") {
      await this.saveManager.clearSave();
      this.gameState.reset();
      await this.saveManager.saveGame(this.gameState);
      vscode.window.showInformationMessage(
        "Pokémon Pals progress has been reset"
      );
    }
  }

  public dispose(): void {
    if (this.gameLoopTimer) {
      clearInterval(this.gameLoopTimer);
    }
    this.saveManager.dispose();
    this.isRunning = false;
  }
}
