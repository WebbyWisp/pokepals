import * as vscode from "vscode";
import { GameManager } from "./core/GameManager";
import { SidebarProvider } from "./ui/SidebarProvider";
import { StatusBarProvider } from "./ui/StatusBarProvider";

let gameManager: GameManager;
let statusBarProvider: StatusBarProvider;
let sidebarProvider: SidebarProvider;

export async function activate(context: vscode.ExtensionContext) {
  console.log("Pokémon Pals extension is activating...");

  try {
    // Initialize game manager
    gameManager = GameManager.getInstance(context);
    await gameManager.initialize();

    await vscode.commands.executeCommand("setContext", "pokepals.active", true);

    // Initialize UI
    statusBarProvider = new StatusBarProvider(gameManager);
    sidebarProvider = new SidebarProvider(context.extensionUri, gameManager);

    // Register webview provider
    const provider = vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    );
    context.subscriptions.push(provider);

    // Register commands
    registerCommands(context);

    // Register event listeners
    registerEventListeners(context);

    console.log("Pokémon Pals extension activated successfully!");
  } catch (error) {
    console.error("Failed to activate Pokémon Pals:", error);
    vscode.window.showErrorMessage("Failed to activate Pokémon Pals extension");
  }
}

function registerCommands(context: vscode.ExtensionContext) {
  // Show Pokemon command
  const showPokemonCommand = vscode.commands.registerCommand(
    "pokepals.showPokemon",
    () => {
      const gameState = gameManager.getGameState();
      const activePokemon = gameState.getActivePokemon();

      if (activePokemon) {
        const message = [
          `🐾 ${activePokemon.getDisplayName()} (Level ${
            activePokemon.stats.level
          })`,
          `💖 Happiness: ${activePokemon.stats.happiness}/100`,
          `🤝 Friendship: ${activePokemon.stats.friendship}/100`,
          `⭐ Experience: ${activePokemon.stats.experience}/${activePokemon.stats.experienceToNext}`,
          `✨ Code Crystals: ${gameState.player.stats.totalCodeCrystals}`,
          `🏞️ Current Biome: ${gameState.currentBiome}`,
          `📊 Total Pokémon: ${gameState.getTotalPokemonCount()}`,
        ].join("\n");

        vscode.window.showInformationMessage(message);
      } else {
        vscode.window.showWarningMessage("No active Pokémon companion");
      }
    }
  );

  // Reset game command
  const resetGameCommand = vscode.commands.registerCommand(
    "pokepals.resetGame",
    async () => {
      await gameManager.resetGame();
      statusBarProvider.forceUpdate();
    }
  );

  // Save game command
  const saveGameCommand = vscode.commands.registerCommand(
    "pokepals.saveGame",
    async () => {
      const success = await gameManager.saveGame();
      if (success) {
        vscode.window.showInformationMessage("Game saved successfully!");
      } else {
        vscode.window.showErrorMessage("Failed to save game");
      }
    }
  );

  // Add commands to context
  context.subscriptions.push(showPokemonCommand);
  context.subscriptions.push(resetGameCommand);
  context.subscriptions.push(saveGameCommand);
}

function registerEventListeners(context: vscode.ExtensionContext) {
  // Track text document changes (typing)
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(
    async (event: vscode.TextDocumentChangeEvent) => {
      if (event.document && event.contentChanges.length > 0) {
        await gameManager.handleTextDocumentChange(event.document);
        statusBarProvider.forceUpdate();
      }
    }
  );

  // Track file saves
  const fileSaveListener = vscode.workspace.onDidSaveTextDocument(
    async (document: vscode.TextDocument) => {
      await gameManager.handleFileSave(document);
      statusBarProvider.forceUpdate();
    }
  );

  // Track file creation
  const fileCreateListener = vscode.workspace.onDidCreateFiles(
    async (event: vscode.FileCreateEvent) => {
      if (event.files.length > 0) {
        await gameManager.handleFileCreate();
        statusBarProvider.forceUpdate();
      }
    }
  );

  // Add listeners to context
  context.subscriptions.push(textChangeListener);
  context.subscriptions.push(fileSaveListener);
  context.subscriptions.push(fileCreateListener);
}

export function deactivate() {
  console.log("Pokémon Pals extension is deactivating...");

  // Clean up resources
  if (statusBarProvider) {
    statusBarProvider.dispose();
  }

  if (sidebarProvider) {
    sidebarProvider.dispose();
  }

  if (gameManager) {
    gameManager.dispose();
  }

  console.log("Pokémon Pals extension deactivated");
}
