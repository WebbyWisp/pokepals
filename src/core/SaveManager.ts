import * as vscode from "vscode";
import { GameState, SaveData } from "../models/GameState";

export class SaveManager {
  private static readonly saveKey = "pokepals.gameData";
  private static readonly backupKey = "pokepals.gameDataBackup";
  private context: vscode.ExtensionContext;
  private autoSaveTimer?: NodeJS.Timeout;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public async saveGame(gameState: GameState): Promise<boolean> {
    try {
      const saveData = gameState.toSaveData();

      // Save to global state (local storage)
      await this.context.globalState.update(SaveManager.saveKey, saveData);

      // Also save to workspace state as backup
      await this.context.workspaceState.update(SaveManager.backupKey, saveData);

      console.log("Game saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save game:", error);
      vscode.window.showErrorMessage("Failed to save Pokémon Pals progress");
      return false;
    }
  }

  public async loadGame(): Promise<GameState | null> {
    try {
      // Try to load from global state first
      let saveData = this.context.globalState.get<SaveData>(
        SaveManager.saveKey
      );

      // If not found, try backup from workspace state
      if (!saveData) {
        saveData = this.context.workspaceState.get<SaveData>(
          SaveManager.backupKey
        );
      }

      if (saveData) {
        const gameState = new GameState();
        if (gameState.validateSaveData(saveData)) {
          const loadedState = GameState.fromSaveData(saveData);
          console.log("Game loaded successfully");
          return loadedState;
        } else {
          console.warn("Invalid save data format");
          vscode.window.showWarningMessage(
            "Save data appears corrupted. Starting new game."
          );
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to load game:", error);
      vscode.window.showErrorMessage(
        "Failed to load Pokémon Pals progress. Starting new game."
      );
      return null;
    }
  }

  public async exportSave(): Promise<string | null> {
    try {
      const saveData = this.context.globalState.get<SaveData>(
        SaveManager.saveKey
      );
      if (saveData) {
        return JSON.stringify(saveData, null, 2);
      }
      return null;
    } catch (error) {
      console.error("Failed to export save:", error);
      return null;
    }
  }

  public async importSave(saveDataString: string): Promise<boolean> {
    try {
      const saveData = JSON.parse(saveDataString);
      const gameState = new GameState();

      if (gameState.validateSaveData(saveData)) {
        await this.context.globalState.update(SaveManager.saveKey, saveData);
        await this.context.workspaceState.update(
          SaveManager.backupKey,
          saveData
        );
        console.log("Save imported successfully");
        return true;
      } else {
        vscode.window.showErrorMessage("Invalid save data format");
        return false;
      }
    } catch (error) {
      console.error("Failed to import save:", error);
      vscode.window.showErrorMessage("Failed to import save data");
      return false;
    }
  }

  public async clearSave(): Promise<boolean> {
    try {
      await this.context.globalState.update(SaveManager.saveKey, undefined);
      await this.context.workspaceState.update(
        SaveManager.backupKey,
        undefined
      );
      console.log("Save data cleared");
      return true;
    } catch (error) {
      console.error("Failed to clear save:", error);
      return false;
    }
  }

  public async createBackup(): Promise<boolean> {
    try {
      const saveData = this.context.globalState.get<SaveData>(
        SaveManager.saveKey
      );
      if (saveData) {
        const timestampedBackupKey = `${SaveManager.backupKey}_${Date.now()}`;
        await this.context.globalState.update(timestampedBackupKey, saveData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create backup:", error);
      return false;
    }
  }

  public startAutoSave(
    gameState: GameState,
    intervalMinutes: number = 5
  ): void {
    this.stopAutoSave();

    this.autoSaveTimer = setInterval(async () => {
      if (gameState.isInitialized) {
        await this.saveGame(gameState);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-save started with ${intervalMinutes} minute interval`);
  }

  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
      console.log("Auto-save stopped");
    }
  }

  public async migrateData(
    oldVersion: string,
    newVersion: string,
    saveData: SaveData
  ): Promise<SaveData> {
    // Handle data migration between versions
    console.log(`Migrating data from ${oldVersion} to ${newVersion}`);

    // For now, just update the version number
    // In the future, add migration logic for breaking changes
    saveData.version = newVersion;

    return saveData;
  }

  public getSaveInfo(): {
    hasLocalSave: boolean;
    hasBackup: boolean;
    lastSaved?: string;
  } {
    const saveData = this.context.globalState.get<SaveData>(
      SaveManager.saveKey
    );
    const backupData = this.context.workspaceState.get<SaveData>(
      SaveManager.backupKey
    );

    return {
      hasLocalSave: !!saveData,
      hasBackup: !!backupData,
      lastSaved: saveData?.lastSaved,
    };
  }

  public dispose(): void {
    this.stopAutoSave();
  }
}
