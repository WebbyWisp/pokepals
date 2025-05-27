import * as vscode from "vscode";
import { GameManager } from "../core/GameManager";
import { Pokemon } from "../models/Pokemon";

export class StatusBarProvider {
  private statusBarItem: vscode.StatusBarItem;
  private gameManager: GameManager;
  private updateTimer?: NodeJS.Timeout;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = "pokepals.showPokemon";
    this.statusBarItem.show();

    this.startUpdating();
  }

  private startUpdating(): void {
    // Update status bar every 10 seconds
    this.updateTimer = setInterval(() => {
      this.updateStatusBar();
    }, 10000);

    // Initial update
    this.updateStatusBar();
  }

  private updateStatusBar(): void {
    const gameState = this.gameManager.getGameState();
    if (!gameState.isInitialized) {
      this.statusBarItem.text = "$(loading~spin) Pokémon Pals Loading...";
      this.statusBarItem.tooltip = "Pokémon Pals is initializing";
      return;
    }

    const activePokemon = gameState.getActivePokemon();
    if (!activePokemon) {
      this.statusBarItem.text = "$(question) No Pokémon";
      this.statusBarItem.tooltip = "No active Pokémon companion";
      return;
    }

    const moodEmoji = this.getMoodEmoji(activePokemon);
    const crystals = gameState.player.stats.totalCodeCrystals;

    this.statusBarItem.text = `${moodEmoji} ${activePokemon.getDisplayName()} Lv.${
      activePokemon.stats.level
    } | ✨${crystals}`;
    this.statusBarItem.tooltip = this.generateTooltip(
      activePokemon,
      gameState.player.stats.totalCodeCrystals
    );
  }

  private getMoodEmoji(pokemon: Pokemon): string {
    switch (pokemon.mood) {
      case "excited":
        return "😄";
      case "happy":
        return "😊";
      case "neutral":
        return "😐";
      case "sad":
        return "😔";
      default:
        return "🐾";
    }
  }

  private generateTooltip(pokemon: Pokemon, crystals: number): string {
    const lines = [
      `🐾 ${pokemon.getDisplayName()}`,
      `📊 Level ${pokemon.stats.level} (${pokemon.stats.experience}/${pokemon.stats.experienceToNext} XP)`,
      `💖 Happiness: ${pokemon.stats.happiness}/100`,
      `🤝 Friendship: ${pokemon.stats.friendship}/100`,
      `✨ Code Crystals: ${crystals}`,
      `⚡ Generation Rate: ${pokemon.stats.crystallGenerationRate}/min`,
      "",
      "Click to view your Pokémon!",
    ];

    return lines.join("\n");
  }

  public forceUpdate(): void {
    this.updateStatusBar();
  }

  public hide(): void {
    this.statusBarItem.hide();
  }

  public show(): void {
    this.statusBarItem.show();
  }

  public dispose(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.statusBarItem.dispose();
  }
}
