import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import type { GameManager } from '../core/GameManager'

export class VueSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pokepals.sidebar'
  private _view?: vscode.WebviewView
  private gameManager: GameManager

  constructor(
    private readonly _extensionUri: vscode.Uri,
    gameManager: GameManager
  ) {
    this.gameManager = gameManager
    console.log('VueSidebarProvider constructor called')
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    void context // Explicitly void unused parameter
    void token // Explicitly void unused parameter
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview'),
        vscode.Uri.joinPath(this._extensionUri, 'src', 'assets')
      ]
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    // Handle messages from the Vue webview
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case 'ready':
          console.log('Vue app is ready')
          this.updateWebview()
          break
        case 'interact':
          this.handlePokemonInteraction()
          break
        case 'feed':
          this.handleFeedPokemon()
          break
        case 'play':
          this.handlePlayWithPokemon()
          break
      }
    })

    // Update webview when game state changes
    this.startUpdating()
  }

  private startUpdating(): void {
    // Update every 5 seconds
    setInterval(() => {
      if (this._view) {
        this.updateWebview()
      }
    }, 5000)

    // Initial update
    setTimeout(() => {
      this.updateWebview()
    }, 1000)
  }

  private updateWebview(): void {
    if (!this._view) {
      return
    }

    const gameState = this.gameManager.getGameState()
    const activePokemon = gameState.getActivePokemon()

    if (activePokemon) {
      this._view.webview.postMessage({
        type: 'update',
        pokemon: {
          name: activePokemon.getDisplayName(),
          level: activePokemon.stats.level,
          happiness: activePokemon.stats.happiness,
          friendship: activePokemon.stats.friendship,
          experience: activePokemon.stats.experience,
          experienceToNext: activePokemon.stats.experienceToNext,
          mood: activePokemon.mood,
          sprite: activePokemon.species.name.toLowerCase()
        },
        player: {
          crystals: gameState.player.stats.totalCodeCrystals,
          totalPokemon: gameState.getTotalPokemonCount()
        },
        biome: gameState.currentBiome
      })
    }
  }

  private handlePokemonInteraction(): void {
    const gameState = this.gameManager.getGameState()
    const activePokemon = gameState.getActivePokemon()

    if (activePokemon) {
      activePokemon.increaseFriendship(2)
      activePokemon.stats.happiness = Math.min(100, activePokemon.stats.happiness + 5)
      vscode.window.showInformationMessage(`${activePokemon.getDisplayName()} enjoyed the interaction! 💖`)
      this.updateWebview()
    }
  }

  private handleFeedPokemon(): void {
    const gameState = this.gameManager.getGameState()
    const activePokemon = gameState.getActivePokemon()

    if (activePokemon && gameState.player.stats.totalCodeCrystals >= 10) {
      gameState.player.spendCodeCrystals(10)
      activePokemon.stats.happiness = Math.min(100, activePokemon.stats.happiness + 15)
      activePokemon.increaseFriendship(3)
      vscode.window.showInformationMessage(`${activePokemon.getDisplayName()} loved the treat! 🍎`)
      this.updateWebview()
    } else {
      vscode.window.showWarningMessage('Not enough Code Crystals! You need 10 crystals to feed your Pokémon.')
    }
  }

  private handlePlayWithPokemon(): void {
    const gameState = this.gameManager.getGameState()
    const activePokemon = gameState.getActivePokemon()

    if (activePokemon) {
      activePokemon.increaseFriendship(1)
      activePokemon.stats.happiness = Math.min(100, activePokemon.stats.happiness + 3)
      activePokemon.gainExperience(5)
      vscode.window.showInformationMessage(`${activePokemon.getDisplayName()} had fun playing! 🎮`)
      this.updateWebview()
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Try to load the built Vue app
    const webviewDistPath = path.join(this._extensionUri.fsPath, 'dist', 'webview')
    const indexHtmlPath = path.join(webviewDistPath, 'index.html')

    if (fs.existsSync(indexHtmlPath)) {
      // Load the built Vue app
      let html = fs.readFileSync(indexHtmlPath, 'utf8')

      // Convert relative paths to webview URIs
      const webviewUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview'))
      html = html.replace(/href="\/([^"]+)"/g, `href="${webviewUri}/$1"`)
      html = html.replace(/src="\/([^"]+)"/g, `src="${webviewUri}/$1"`)

      return html
    } else {
      // Fallback HTML if Vue app isn't built yet
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokémon Pals</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 16px;
            text-align: center;
        }
        .loading {
            padding: 32px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="loading">
        <h3>🚀 Vue 3 Migration in Progress</h3>
        <p>Building Vue application...</p>
        <p>Run <code>npm run build:webview</code> to build the Vue app.</p>
    </div>
</body>
</html>`
    }
  }

  public dispose(): void {
    // Clean up resources
  }
}
