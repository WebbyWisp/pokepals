import * as vscode from 'vscode'
import type { GameManager } from '../core/GameManager'
import { PokemonSprite } from './PokemonSprite'

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'pokepals.sidebar'
  private _view?: vscode.WebviewView
  private gameManager: GameManager
  private pokemonSprite: PokemonSprite
  private animationTimer?: NodeJS.Timeout

  constructor(
    private readonly _extensionUri: vscode.Uri,
    gameManager: GameManager
  ) {
    this.gameManager = gameManager
    this.pokemonSprite = new PokemonSprite(_extensionUri, 'sneasel')
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
      localResourceRoots: [this._extensionUri, vscode.Uri.joinPath(this._extensionUri, 'src', 'assets')]
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

  private _getHtmlForWebview(webview: vscode.Webview): string {
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
            min-height: 300px;
            border-radius: 12px;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
            background: linear-gradient(to bottom, #87CEEB 0%, #98E4FF 50%, #90EE90 100%);
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }

        /* Cozy Pixel Art Background Scene */
        .scene {
            position: relative;
            width: 100%;
            height: 300px;
            overflow: hidden;
        }

        /* Sky gradient with clouds */
        .sky {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 60%;
            background: linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #F0F8FF 100%);
        }

        /* Pixel art clouds */
        .cloud {
            position: absolute;
            width: 40px;
            height: 20px;
            background: white;
            border-radius: 20px;
            opacity: 0.8;
            animation: float 6s ease-in-out infinite;
        }

        .cloud:before {
            content: '';
            position: absolute;
            top: -10px;
            left: 8px;
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
        }

        .cloud:after {
            content: '';
            position: absolute;
            top: -6px;
            right: 6px;
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
        }

        .cloud1 { top: 20px; left: 10%; animation-delay: 0s; }
        .cloud2 { top: 40px; right: 15%; animation-delay: -2s; }
        .cloud3 { top: 15px; left: 60%; animation-delay: -4s; }

        /* Ground with pixel grass pattern */
        .ground {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40%;
            background: linear-gradient(to bottom, #90EE90 0%, #228B22 50%, #006400 100%);
        }

        /* Grass blades using CSS */
        .grass {
            position: absolute;
            bottom: 30%;
            width: 100%;
            height: 20px;
            background-image: 
                linear-gradient(90deg, transparent 0px, transparent 3px, #32CD32 3px, #32CD32 4px, transparent 4px, transparent 8px),
                linear-gradient(90deg, transparent 2px, transparent 5px, #228B22 5px, #228B22 6px, transparent 6px, transparent 10px),
                linear-gradient(90deg, transparent 6px, transparent 9px, #32CD32 9px, #32CD32 10px, transparent 10px, transparent 14px);
            background-size: 12px 100%;
            animation: grassSway 3s ease-in-out infinite;
        }

        /* Pixel trees */
        .tree {
            position: absolute;
            bottom: 25%;
        }

        .tree-trunk {
            width: 8px;
            height: 30px;
            background: #8B4513;
            margin: 0 auto;
        }

        .tree-leaves {
            width: 24px;
            height: 24px;
            background: #228B22;
            border-radius: 50%;
            position: relative;
            top: -12px;
            left: -8px;
        }

        .tree1 { left: 5%; }
        .tree2 { right: 8%; }

        /* Small cozy house */
        .house {
            position: absolute;
            bottom: 30%;
            right: 20%;
            width: 40px;
            height: 30px;
        }

        .house-base {
            width: 100%;
            height: 20px;
            background: #DEB887;
            border: 1px solid #CD853F;
        }

        .house-roof {
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-bottom: 15px solid #DC143C;
            position: relative;
            top: -5px;
        }

        .house-door {
            width: 8px;
            height: 12px;
            background: #8B4513;
            position: absolute;
            bottom: 0;
            left: 16px;
        }

        .house-window {
            width: 6px;
            height: 6px;
            background: #87CEEB;
            border: 1px solid #4682B4;
            position: absolute;
            top: 4px;
            left: 6px;
        }

        /* Pokémon sprite sheet */
        .pokemon-sprite {
            position: absolute;
            bottom: 35%;
            left: 50%;
            transform: translateX(-50%);
            cursor: pointer;
            transition: transform 0.2s;
            z-index: 10;
            background-repeat: no-repeat;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }

        .pokemon-sprite:hover {
            transform: translateX(-50%) scale(1.1);
        }

        .pokemon-sprite.happy {
            filter: brightness(1.1);
        }

        .pokemon-sprite.excited {
            filter: brightness(1.2) saturate(1.2);
        }

        .pokemon-sprite.sad {
            filter: grayscale(0.3) brightness(0.8);
        }

        /* Biome variations */
        .biome-forest .sky {
            background: linear-gradient(to bottom, #4169E1 0%, #87CEEB 50%, #F0F8FF 100%);
        }

        .biome-forest .ground {
            background: linear-gradient(to bottom, #228B22 0%, #006400 50%, #004225 100%);
        }

        .biome-laboratory .sky {
            background: linear-gradient(to bottom, #9370DB 0%, #BA55D3 50%, #DDA0DD 100%);
        }

        .biome-laboratory .ground {
            background: linear-gradient(to bottom, #C0C0C0 0%, #808080 50%, #696969 100%);
        }

        .biome-library .sky {
            background: linear-gradient(to bottom, #DAA520 0%, #FFD700 50%, #FFFACD 100%);
        }

        .biome-library .ground {
            background: linear-gradient(to bottom, #D2B48C 0%, #CD853F 50%, #A0522D 100%);
        }

        .biome-cave .sky {
            background: linear-gradient(to bottom, #2F4F4F 0%, #696969 50%, #A9A9A9 100%);
        }

        .biome-cave .ground {
            background: linear-gradient(to bottom, #696969 0%, #2F4F4F 50%, #191970 100%);
        }

        /* Animations */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        @keyframes grassSway {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(1.1); }
        }

        /* Pokemon info overlay */
        .pokemon-info {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            z-index: 15;
        }

        .pokemon-name {
            font-size: 16px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            margin-bottom: 4px;
            background: rgba(0,0,0,0.3);
            padding: 4px 8px;
            border-radius: 12px;
        }

        .pokemon-level {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            background: rgba(0,0,0,0.3);
            padding: 2px 6px;
            border-radius: 8px;
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

        /* Biome indicator */
        .biome-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            text-transform: capitalize;
            z-index: 20;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
    </style>
</head>
<body>
    <div class="pokemon-container" id="pokemonContainer">
        <div class="biome-indicator" id="biomeIndicator">Forest</div>
        
        <div class="scene">
            <!-- Sky with clouds -->
            <div class="sky">
                <div class="cloud cloud1"></div>
                <div class="cloud cloud2"></div>
                <div class="cloud cloud3"></div>
            </div>
            
            <!-- Ground -->
            <div class="ground">
                <div class="grass"></div>
            </div>
            
            <!-- Trees -->
            <div class="tree tree1">
                <div class="tree-leaves"></div>
                <div class="tree-trunk"></div>
            </div>
            <div class="tree tree2">
                <div class="tree-leaves"></div>
                <div class="tree-trunk"></div>
            </div>
            
            <!-- Cozy house -->
            <div class="house">
                <div class="house-roof"></div>
                <div class="house-base">
                    <div class="house-window"></div>
                    <div class="house-door"></div>
                </div>
            </div>
            
            <!-- Pokémon Sprite -->
            <div class="pokemon-sprite" id="pokemonSprite" onclick="interactWithPokemon()"></div>
            
            <!-- Pokemon info overlay -->
            <div class="pokemon-info">
                <div class="pokemon-name" id="pokemonName">Pikachu</div>
                <div class="pokemon-level" id="pokemonLevel">Level 1</div>
            </div>
        </div>
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
        
        // Set the sprite base path
        window.spriteBasePath = '${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'assets', 'sneasel'))}';

        // Sprite animation state
        let currentAnimation = 'Idle';
        let currentFrame = 0;
        let frameTimer = 0;
        let lastUpdateTime = Date.now();
        
        // Animation data for Sneasel
        const animationData = {
            'Idle': {
                frameWidth: 32,
                frameHeight: 56,
                frameCount: 7,
                durations: [40, 1, 2, 4, 2, 2, 1],
                rows: 8, // Grid layout with 8 directions
                useRow: 0 // Use the first row (facing down/front)
            },
            'Walk': {
                frameWidth: 32,
                frameHeight: 48,
                frameCount: 4,
                durations: [8, 10, 8, 10],
                rows: 8,
                useRow: 0
            },
            'Attack': {
                frameWidth: 72,
                frameHeight: 80,
                frameCount: 10,
                durations: [2, 6, 1, 1, 1, 2, 2, 2, 2, 2],
                rows: 8,
                useRow: 0
            },
            'Sleep': {
                frameWidth: 24,
                frameHeight: 40,
                frameCount: 2,
                durations: [30, 35],
                rows: 1, // Horizontal layout
                useRow: 0
            },
            'Hurt': {
                frameWidth: 64,
                frameHeight: 64,
                frameCount: 2,
                durations: [2, 8],
                rows: 8,
                useRow: 0
            },
            'Eat': {
                frameWidth: 32,
                frameHeight: 40,
                frameCount: 4,
                durations: [6, 8, 6, 8],
                rows: 8,
                useRow: 0
            }
        };

        function setAnimation(animationName) {
            if (animationData[animationName] && currentAnimation !== animationName) {
                currentAnimation = animationName;
                currentFrame = 0;
                frameTimer = 0;
                updateSpriteDisplay();
            }
        }

        function updateSpriteDisplay() {
            const animation = animationData[currentAnimation];
            if (!animation) return;

            const sprite = document.getElementById('pokemonSprite');
            const xOffset = -(currentFrame * animation.frameWidth);
            const yOffset = -(animation.useRow * animation.frameHeight);
            
            sprite.style.width = animation.frameWidth + 'px';
            sprite.style.height = animation.frameHeight + 'px';
            sprite.style.backgroundImage = \`url('\${window.spriteBasePath}/\${currentAnimation}-Anim.png')\`;
            sprite.style.backgroundPosition = \`\${xOffset}px \${yOffset}px\`;
            sprite.style.backgroundSize = \`\${animation.frameWidth * animation.frameCount}px \${animation.frameHeight * animation.rows}px\`;
            
            // Debug logging
            console.log(\`Animation: \${currentAnimation}, Frame: \${currentFrame}/\${animation.frameCount}, Position: \${xOffset}px \${yOffset}px\`);
        }

        function updateAnimation() {
            const now = Date.now();
            const deltaTime = now - lastUpdateTime;
            lastUpdateTime = now;

            const animation = animationData[currentAnimation];
            if (!animation) return;

            frameTimer += deltaTime;

            // Duration is in game ticks, treating each tick as ~100ms for more reasonable timing
            const frameDuration = animation.durations[currentFrame] * 100;

            if (frameTimer >= frameDuration) {
                currentFrame = (currentFrame + 1) % animation.frameCount;
                frameTimer = 0;
                updateSpriteDisplay();
            }
        }

        function interactWithPokemon() {
            vscode.postMessage({ type: 'interact' });
            // Play attack animation briefly
            setAnimation('Attack');
            setTimeout(() => {
                setAnimation('Idle');
            }, 1000);
        }

        function feedPokemon() {
            vscode.postMessage({ type: 'feed' });
            // Play eat animation briefly
            setAnimation('Eat');
            setTimeout(() => {
                setAnimation('Idle');
            }, 2000);
        }

        function playWithPokemon() {
            vscode.postMessage({ type: 'play' });
            // Play walk animation briefly
            setAnimation('Walk');
            setTimeout(() => {
                setAnimation('Idle');
            }, 1500);
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

        // Start animation loop
        setInterval(updateAnimation, 16); // ~60 FPS

        // Initialize sprite display
        updateSpriteDisplay();

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
