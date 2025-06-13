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
            width: 300px;
            height: 300px;
            border-radius: 12px;
            margin: 0 auto 16px auto;
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
            height: 100%;
            overflow: hidden;
            background-image: url('${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'assets', 'background.png'))}');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }

        /* Pokémon sprite sheet */
        .pokemon-sprite {
            position: absolute;
            bottom: 15%;
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

        /* Pokemon info moved below image */
        .pokemon-info {
            text-align: center;
            margin-bottom: 16px;
            padding: 12px;
            background: var(--vscode-editor-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-widget-border);
        }

        .pokemon-name {
            font-size: 18px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            margin-bottom: 4px;
        }

        .pokemon-level {
            font-size: 14px;
            color: var(--vscode-foreground);
            opacity: 0.8;
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
            <!-- Pokémon Sprite -->
            <div class="pokemon-sprite" id="pokemonSprite" onclick="interactWithPokemon()"></div>
        </div>
    </div>

    <!-- Pokemon info moved below image -->
    <div class="pokemon-info">
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
        <button onclick="makePokemonSit()">Sit 💺</button>
        <button onclick="makePokemonLay()">Lay 😴</button>
        <button onclick="makePokemonSleep()">Sleep 🌙</button>
    </div>

    <div class="crystals">
        <div>💎 Code Crystals</div>
        <div class="crystal-count" id="crystalCount">0</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Generic Pokemon Animation System
        class PokemonAnimationSystem {
            constructor(pokemonName = 'sneasel') {
                this.pokemonName = pokemonName.toLowerCase();
                this.spriteBasePath = '${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'assets', 'sneasel'))}';
                
                // Animation state
                this.currentAnimation = 'Idle';
                this.currentFrame = 0;
                this.frameTimer = 0;
                this.lastUpdateTime = Date.now();
                this.isMoving = false;
                this.movementDirection = 1; // 1 = right, -1 = left
                this.position = 50; // percentage from left
                this.sleeping = false;
                this.sitting = false;
                this.autoAnimationTimer = 0;
                this.nextAutoAnimation = this.getRandomIdleTime();
                
                // Load animation data for current Pokemon
                this.loadAnimationData();
                
                // Start automatic behaviors
                this.startAutomaticBehaviors();
            }
            
                         loadAnimationData() {
                 // Animation data based on actual Sneasel AnimData.xml
                 this.animationData = {
                     'Idle': {
                         frameWidth: 32,
                         frameHeight: 56,
                         frameCount: 7,
                         durations: [40, 1, 2, 4, 2, 2, 1],
                         direction: 0, // Front-facing direction
                         loop: true,
                         priority: 1
                     },
                     'Walk': {
                         frameWidth: 32,
                         frameHeight: 48,
                         frameCount: 4,
                         durations: [8, 10, 8, 10],
                         direction: 0,
                         loop: true,
                         priority: 2
                     },
                     'Sleep': {
                         frameWidth: 24,
                         frameHeight: 40,
                         frameCount: 2,
                         durations: [30, 35],
                         direction: 0,
                         loop: true,
                         priority: 3
                     },
                     'Sit': {
                         frameWidth: 32,
                         frameHeight: 40,
                         frameCount: 3,
                         durations: [8, 8, 8],
                         direction: 0,
                         loop: true,
                         priority: 2
                     },
                     'Laying': {
                         frameWidth: 24,
                         frameHeight: 32,
                         frameCount: 1,
                         durations: [12],
                         direction: 0,
                         loop: true,
                         priority: 2
                     },
                     'Attack': {
                         frameWidth: 72,
                         frameHeight: 80,
                         frameCount: 10,
                         durations: [2, 6, 1, 1, 1, 2, 2, 2, 2, 2],
                         direction: 0,
                         loop: false,
                         priority: 5,
                         returnToIdle: true
                     },
                     'Eat': {
                         frameWidth: 32,
                         frameHeight: 40,
                         frameCount: 4,
                         durations: [6, 8, 6, 8],
                         direction: 0,
                         loop: false,
                         priority: 4,
                         returnToIdle: true,
                         repeatCount: 3
                     },
                     'Pose': {
                         frameWidth: 32,
                         frameHeight: 48,
                         frameCount: 3,
                         durations: [12, 2, 8],
                         direction: 0,
                         loop: false,
                         priority: 3,
                         returnToIdle: true
                     },
                     'Wake': {
                         frameWidth: 32,
                         frameHeight: 40,
                         frameCount: 5,
                         durations: [8, 6, 14, 4, 10],
                         direction: 0,
                         loop: false,
                         priority: 2,
                         returnToIdle: true
                     },
                     'Hurt': {
                         frameWidth: 64,
                         frameHeight: 64,
                         frameCount: 2,
                         durations: [2, 8],
                         direction: 0,
                         loop: false,
                         priority: 5,
                         returnToIdle: true
                     }
                 };
             }
            
                         startAutomaticBehaviors() {
                 // Delay the start of automatic behaviors to ensure everything is initialized
                 setTimeout(() => {
                     // Random idle animations every 10-30 seconds
                     setInterval(() => {
                         if (this.currentAnimation === 'Idle' && !this.sleeping && !this.sitting) {
                             const randomBehaviors = ['Wake', 'Pose', 'Walk'];
                             const behavior = randomBehaviors[Math.floor(Math.random() * randomBehaviors.length)];
                             
                             if (behavior === 'Walk') {
                                 this.startWalking();
                             } else {
                                 this.playAnimation(behavior);
                             }
                         }
                     }, this.getRandomIdleTime());
                     
                     // Occasional sleep cycle (every 2-5 minutes)
                     setInterval(() => {
                         if (this.currentAnimation === 'Idle' && !this.isMoving && Math.random() < 0.3) {
                             this.goToSleep();
                         }
                     }, 120000 + Math.random() * 180000); // 2-5 minutes
                 }, 1000); // Wait 1 second before starting automatic behaviors
             }
            
            getRandomIdleTime() {
                return 10000 + Math.random() * 20000; // 10-30 seconds
            }
            
                         playAnimation(animationName, options = {}) {
                 if (!this.animationData[animationName]) return false;
                 
                 const animation = this.animationData[animationName];
                 const currentPriority = this.animationData[this.currentAnimation]?.priority || 0;
                 
                 // Check if we can interrupt current animation
                 if (currentPriority > animation.priority && !options.force) {
                     return false;
                 }
                 
                 // Stop movement if switching away from walk animation
                 if (this.currentAnimation === 'Walk' && animationName !== 'Walk') {
                     this.stopMovement();
                 }
                 
                 this.currentAnimation = animationName;
                 this.currentFrame = 0;
                 this.frameTimer = 0;
                 this.updateSpriteDisplay();
                 
                 // Set up return to idle if specified
                 if (animation.returnToIdle) {
                     const totalDuration = animation.durations.reduce((sum, duration) => sum + duration, 0) * 100;
                     const repeatCount = animation.repeatCount || 1;
                     
                     setTimeout(() => {
                         if (this.currentAnimation === animationName) {
                             this.playAnimation('Idle');
                         }
                     }, totalDuration * repeatCount);
                 }
                 
                 return true;
             }
             
             stopMovement() {
                 if (this.isMoving) {
                     this.isMoving = false;
                     // Reset sprite flip to normal
                     const sprite = document.getElementById('pokemonSprite');
                     if (sprite) {
                         sprite.style.transform = 'translateX(-50%)';
                     }
                 }
             }
            
                         startWalking() {
                 if (this.isMoving) return;
                 
                 this.isMoving = true;
                 this.movementDirection = Math.random() < 0.5 ? 1 : -1;
                 this.playAnimation('Walk');
                 
                 // Walk for 2-5 seconds
                 const walkDuration = 2000 + Math.random() * 3000;
                 
                 const walkInterval = setInterval(() => {
                     // Only move if currently walking animation
                     if (this.currentAnimation === 'Walk') {
                         this.position += this.movementDirection * 0.5;
                         
                         // Bounce off edges
                         if (this.position <= 10) {
                             this.position = 10;
                             this.movementDirection = 1;
                         } else if (this.position >= 90) {
                             this.position = 90;
                             this.movementDirection = -1;
                         }
                         
                         const sprite = document.getElementById('pokemonSprite');
                         sprite.style.left = this.position + '%';
                         
                         // Flip sprite based on direction
                         sprite.style.transform = \`translateX(-50%) scaleX(\${this.movementDirection})\`;
                     }
                 }, 50);
                 
                 setTimeout(() => {
                     clearInterval(walkInterval);
                     this.isMoving = false;
                     this.playAnimation('Idle');
                     
                     // Reset sprite flip and ensure it stays in current position
                     const sprite = document.getElementById('pokemonSprite');
                     sprite.style.transform = 'translateX(-50%)';
                 }, walkDuration);
             }
            
                         goToSleep() {
                 this.sleeping = true;
                 this.playAnimation('Sleep', { force: true });
                 
                 // Wake up after 30-60 seconds
                 setTimeout(() => {
                     this.sleeping = false;
                     this.playAnimation('Wake');
                 }, 30000 + Math.random() * 30000);
             }
             
             sit() {
                 if (this.sleeping) return;
                 this.sitting = !this.sitting;
                 this.playAnimation(this.sitting ? 'Sit' : 'Idle', { force: true });
             }
             
             lay() {
                 if (this.sleeping) return;
                 this.playAnimation('Laying', { force: true });
                 
                 setTimeout(() => {
                     this.playAnimation('Idle');
                 }, 5000);
             }
            
                         updateSpriteDisplay() {
                 const animation = this.animationData[this.currentAnimation];
                 if (!animation) return;

                 const sprite = document.getElementById('pokemonSprite');
                 if (!sprite) return;
                 
                 // Calculate frame position
                 const xOffset = -(this.currentFrame * animation.frameWidth);
                 const yOffset = -(animation.direction || 0) * animation.frameHeight; // Use direction 0 (front-facing)
                 
                 const imageUrl = \`\${this.spriteBasePath}/\${this.currentAnimation}-Anim.png\`;
                 sprite.style.width = animation.frameWidth + 'px';
                 sprite.style.height = animation.frameHeight + 'px';
                 sprite.style.backgroundImage = \`url('\${imageUrl}')\`;
                 sprite.style.backgroundPosition = \`\${xOffset}px \${yOffset}px\`;
                 sprite.style.backgroundSize = 'auto';
                 sprite.style.display = 'block';
                 
                 console.log('Sprite frame info:', {
                     animation: this.currentAnimation,
                     frame: this.currentFrame,
                     xOffset: xOffset,
                     yOffset: yOffset,
                     imageUrl: imageUrl
                 });
             }
            
            update() {
                const now = Date.now();
                const deltaTime = now - this.lastUpdateTime;
                this.lastUpdateTime = now;

                const animation = this.animationData[this.currentAnimation];
                if (!animation) return;

                this.frameTimer += deltaTime;
                const frameDuration = animation.durations[this.currentFrame] * 100;

                if (this.frameTimer >= frameDuration) {
                    this.currentFrame = (this.currentFrame + 1) % animation.frameCount;
                    this.frameTimer = 0;
                    this.updateSpriteDisplay();
                }
            }
        }
        
        // Initialize animation system
        let pokemonAnimator;

        // Initialize when DOM is ready
        function initializePokemon() {
            console.log('Initializing Pokemon...');
            
            // Check if sprite element exists
            const sprite = document.getElementById('pokemonSprite');
            if (!sprite) {
                console.error('Pokemon sprite element not found!');
                return;
            }
            
            console.log('Sprite element found, creating animator...');
            pokemonAnimator = new PokemonAnimationSystem('sneasel');
            
            // Ensure sprite is visible and properly initialized
            setTimeout(() => {
                if (pokemonAnimator) {
                    pokemonAnimator.updateSpriteDisplay();
                    console.log('Pokemon initialized successfully');
                } else {
                    console.error('Pokemon animator not created');
                }
            }, 100);
        }

        // Legacy function for compatibility
        function setAnimation(animationName) {
            if (pokemonAnimator) {
                pokemonAnimator.playAnimation(animationName);
            }
        }

        function interactWithPokemon() {
            vscode.postMessage({ type: 'interact' });
            // Play attack animation briefly
            if (pokemonAnimator) {
                pokemonAnimator.playAnimation('Attack');
            }
        }

        function feedPokemon() {
            vscode.postMessage({ type: 'feed' });
            // Play eat animation
            if (pokemonAnimator) {
                pokemonAnimator.playAnimation('Eat');
            }
        }

        function playWithPokemon() {
            vscode.postMessage({ type: 'play' });
            // Start walking or play pose animation
            if (pokemonAnimator) {
                if (Math.random() < 0.5) {
                    pokemonAnimator.startWalking();
                } else {
                    pokemonAnimator.playAnimation('Pose');
                }
            }
        }

        // Additional interaction functions
        function makePokemonSit() {
            if (pokemonAnimator) {
                pokemonAnimator.sit();
            }
        }

        function makePokemonLay() {
            if (pokemonAnimator) {
                pokemonAnimator.lay();
            }
        }

        function makePokemonSleep() {
            if (pokemonAnimator) {
                pokemonAnimator.goToSleep();
            }
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
            
            // Initialize or update animator for different Pokemon
            if (!pokemonAnimator) {
                pokemonAnimator = new PokemonAnimationSystem(pokemon.sprite);
            } else if (pokemon.sprite !== pokemonAnimator.pokemonName) {
                pokemonAnimator = new PokemonAnimationSystem(pokemon.sprite);
            }
            
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
            
            // Trigger mood-based animations
            if (pokemon.mood === 'happy' || pokemon.mood === 'excited') {
                if (Math.random() < 0.3) pokemonAnimator.playAnimation('Pose');
            } else if (pokemon.mood === 'sad') {
                if (Math.random() < 0.2) pokemonAnimator.playAnimation('Wake');
            }
        }

        // Start animation loop
        setInterval(() => {
            if (pokemonAnimator) {
                pokemonAnimator.update();
            }
        }, 16); // ~60 FPS

        // Initialize when document is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializePokemon);
        } else {
            initializePokemon();
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
