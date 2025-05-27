import * as vscode from 'vscode'
import type { GameManager } from '../core/GameManager'

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pokepals.sidebar'
  private _view?: vscode.WebviewView
  private gameManager: GameManager

  constructor(
    private readonly _extensionUri: vscode.Uri,
    gameManager: GameManager
  ) {
    this.gameManager = gameManager
    console.log('SidebarProvider constructor called')
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    // Note: context and token parameters are required by the WebviewViewProvider interface
    // but are not currently used in this implementation
    void context // Explicitly void unused parameter
    void token // Explicitly void unused parameter
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
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
    this.updateWebview()
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _getHtmlForWebview(_webview: vscode.Webview): string {
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
            overflow-x: hidden;
        }

        .pokemon-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 300px;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
        }

        .biome-forest {
            background: linear-gradient(135deg, #55a3ff 0%, #003d82 100%);
        }

        .biome-laboratory {
            background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
        }

        .biome-library {
            background: linear-gradient(135deg, #feca57 0%, #ff6b6b 100%);
        }

        .biome-cave {
            background: linear-gradient(135deg, #636e72 0%, #2d3436 100%);
        }

        .pokemon-sprite {
            width: 96px;
            height: 96px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            margin-bottom: 12px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            animation: bounce 2s infinite;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .pokemon-sprite:hover {
            transform: scale(1.1);
        }

        .pokemon-sprite.happy {
            animation: bounce 1.5s infinite, glow 2s infinite alternate;
        }

        .pokemon-sprite.excited {
            animation: bounce 1s infinite, spin 3s infinite linear;
        }

        .pokemon-sprite.sad {
            animation: sway 2s infinite;
            filter: grayscale(0.3);
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-15px);
            }
            60% {
                transform: translateY(-7px);
            }
        }

        @keyframes glow {
            from {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            }
            to {
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes sway {
            0%, 100% {
                transform: translateX(0);
            }
            50% {
                transform: translateX(-10px);
            }
        }

        .pokemon-name {
            font-size: 18px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin-bottom: 8px;
        }

        .pokemon-level {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 16px;
        }

        .stats-container {
            background: var(--vscode-editor-background);
            border-radius: 8px;
            padding: 16px;
            width: 100%;
            margin-bottom: 16px;
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .stat-label {
            font-size: 12px;
            color: var(--vscode-foreground);
        }

        .stat-value {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }

        .progress-bar {
            width: 100%;
            height: 6px;
            background: var(--vscode-progressBar-background);
            border-radius: 3px;
            overflow: hidden;
            margin-top: 4px;
        }

        .progress-fill {
            height: 100%;
            background: var(--vscode-progressBar-foreground);
            transition: width 0.3s ease;
        }

        .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }

        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-family: var(--vscode-font-family);
            transition: background-color 0.2s;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .crystals {
            text-align: center;
            margin-top: 16px;
            padding: 12px;
            background: var(--vscode-editor-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-widget-border);
        }

        .crystal-count {
            font-size: 16px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }

        .biome-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            color: white;
            text-transform: capitalize;
        }
    </style>
</head>
<body>
    <div class="pokemon-container" id="pokemonContainer">
        <div class="biome-indicator" id="biomeIndicator">Forest</div>
        <div class="pokemon-sprite" id="pokemonSprite" onclick="interactWithPokemon()">
            ⚡
        </div>
        <div class="pokemon-name" id="pokemonName">Pikachu</div>
        <div class="pokemon-level" id="pokemonLevel">Level 1</div>
    </div>

    <div class="stats-container">
        <div class="stat-row">
            <span class="stat-label">💖 Happiness</span>
            <span class="stat-value" id="happiness">100/100</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="happinessBar" style="width: 100%"></div>
        </div>

        <div class="stat-row">
            <span class="stat-label">🤝 Friendship</span>
            <span class="stat-value" id="friendship">0/100</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="friendshipBar" style="width: 0%"></div>
        </div>

        <div class="stat-row">
            <span class="stat-label">⭐ Experience</span>
            <span class="stat-value" id="experience">0/100</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="experienceBar" style="width: 0%"></div>
        </div>
    </div>

    <div class="actions">
        <button onclick="interactWithPokemon()">Pet 🤗</button>
        <button onclick="feedPokemon()" id="feedButton">Feed 🍎 (10💎)</button>
        <button onclick="playWithPokemon()">Play 🎮</button>
    </div>

    <div class="crystals">
        <div>💎 Code Crystals</div>
        <div class="crystal-count" id="crystalCount">0</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Pokemon sprite mapping
        const pokemonSprites = {
            'pikachu': '⚡',
            'charmander': '🔥',
            'squirtle': '💧',
            'bulbasaur': '🌱',
            'caterpie': '🐛',
            'pidgey': '🐦',
            'rattata': '🐭',
            'geodude': '🗿',
            'magikarp': '🐟',
            'psyduck': '🦆'
        };

        function interactWithPokemon() {
            vscode.postMessage({ type: 'interact' });
            // Add interaction animation
            const sprite = document.getElementById('pokemonSprite');
            sprite.style.transform = 'scale(1.2)';
            setTimeout(() => {
                sprite.style.transform = 'scale(1)';
            }, 200);
        }

        function feedPokemon() {
            vscode.postMessage({ type: 'feed' });
        }

        function playWithPokemon() {
            vscode.postMessage({ type: 'play' });
        }

        // Listen for updates from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'update') {
                updatePokemonDisplay(message);
            }
        });

        function updatePokemonDisplay(data) {
            const { pokemon, player, biome } = data;
            
            // Update pokemon sprite and info
            const sprite = document.getElementById('pokemonSprite');
            sprite.textContent = pokemonSprites[pokemon.sprite] || '⚡';
            sprite.className = \`pokemon-sprite \${pokemon.mood}\`;
            
            document.getElementById('pokemonName').textContent = pokemon.name;
            document.getElementById('pokemonLevel').textContent = \`Level \${pokemon.level}\`;
            
            // Update stats
            document.getElementById('happiness').textContent = \`\${pokemon.happiness}/100\`;
            document.getElementById('happinessBar').style.width = \`\${pokemon.happiness}%\`;
            
            document.getElementById('friendship').textContent = \`\${pokemon.friendship}/100\`;
            document.getElementById('friendshipBar').style.width = \`\${pokemon.friendship}%\`;
            
            document.getElementById('experience').textContent = \`\${pokemon.experience}/\${pokemon.experienceToNext}\`;
            const expPercent = (pokemon.experience / pokemon.experienceToNext) * 100;
            document.getElementById('experienceBar').style.width = \`\${expPercent}%\`;
            
            // Update crystals
            document.getElementById('crystalCount').textContent = player.crystals;
            
            // Update biome
            const container = document.getElementById('pokemonContainer');
            container.className = \`pokemon-container biome-\${biome}\`;
            document.getElementById('biomeIndicator').textContent = biome;
            
            // Update feed button availability
            const feedButton = document.getElementById('feedButton');
            feedButton.disabled = player.crystals < 10;
        }

        // Initial load
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`
  }

  public dispose(): void {
    // Clean up resources
  }
}
