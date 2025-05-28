import * as vscode from 'vscode'

export interface AnimationFrame {
  duration: number
  index: number
}

export interface AnimationData {
  name: string
  index: number
  frameWidth: number
  frameHeight: number
  frameCount: number
  durations: number[]
  rushFrame?: number
  hitFrame?: number
  returnFrame?: number
}

export interface PokemonAnimations {
  [animationName: string]: AnimationData
}

export class PokemonSprite {
  private extensionUri: vscode.Uri
  private pokemonName: string
  private animationData: PokemonAnimations
  private currentAnimation: string = 'Idle'
  private currentFrame: number = 0
  private frameTimer: number = 0
  private lastUpdateTime: number = 0

  constructor(extensionUri: vscode.Uri, pokemonName: string) {
    this.extensionUri = extensionUri
    this.pokemonName = pokemonName.toLowerCase()
    this.animationData = {}
    this.loadAnimationData()
  }

  private async loadAnimationData(): Promise<void> {
    try {
      // For now, we'll define Sneasel's animation data directly
      // In the future, this could parse the AnimData.xml file
      this.animationData = {
        Idle: {
          name: 'Idle',
          index: 7,
          frameWidth: 32,
          frameHeight: 56,
          frameCount: 7,
          durations: [40, 1, 2, 4, 2, 2, 1]
        },
        Walk: {
          name: 'Walk',
          index: 0,
          frameWidth: 32,
          frameHeight: 48,
          frameCount: 4,
          durations: [8, 10, 8, 10]
        },
        Attack: {
          name: 'Attack',
          index: 1,
          frameWidth: 72,
          frameHeight: 80,
          frameCount: 10,
          durations: [2, 6, 1, 1, 1, 2, 2, 2, 2, 2],
          rushFrame: 1,
          hitFrame: 3,
          returnFrame: 6
        },
        Sleep: {
          name: 'Sleep',
          index: 5,
          frameWidth: 24,
          frameHeight: 40,
          frameCount: 2,
          durations: [30, 35]
        },
        Hurt: {
          name: 'Hurt',
          index: 6,
          frameWidth: 64,
          frameHeight: 64,
          frameCount: 2,
          durations: [2, 8]
        },
        Eat: {
          name: 'Eat',
          index: 15,
          frameWidth: 32,
          frameHeight: 40,
          frameCount: 4,
          durations: [6, 8, 6, 8]
        }
      }
    } catch (error) {
      console.error('Failed to load animation data:', error)
    }
  }

  public setAnimation(animationName: string): void {
    if (this.animationData[animationName] && this.currentAnimation !== animationName) {
      this.currentAnimation = animationName
      this.currentFrame = 0
      this.frameTimer = 0
    }
  }

  public update(deltaTime: number): boolean {
    const animation = this.animationData[this.currentAnimation]
    if (!animation) return false

    this.frameTimer += deltaTime

    // Check if we should advance to the next frame
    // Duration is in game ticks, we'll treat each tick as ~50ms
    const frameDuration = animation.durations[this.currentFrame] * 50

    if (this.frameTimer >= frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % animation.frameCount
      this.frameTimer = 0
      return true // Frame changed
    }

    return false
  }

  public getSpriteImageUri(): vscode.Uri {
    return vscode.Uri.joinPath(
      this.extensionUri,
      'src',
      'assets',
      this.pokemonName,
      `${this.currentAnimation}-Anim.png`
    )
  }

  public getCurrentFrame(): number {
    return this.currentFrame
  }

  public getCurrentAnimation(): AnimationData | null {
    return this.animationData[this.currentAnimation] || null
  }

  public getAvailableAnimations(): string[] {
    return Object.keys(this.animationData)
  }

  public getCurrentAnimationName(): string {
    return this.currentAnimation
  }

  // Generate CSS for the current frame
  public generateSpriteCSS(elementId: string): string {
    const animation = this.animationData[this.currentAnimation]
    if (!animation) return ''

    const spriteUri = this.getSpriteImageUri()
    const xOffset = -(this.currentFrame * animation.frameWidth)

    return `
      #${elementId} {
        width: ${animation.frameWidth}px;
        height: ${animation.frameHeight}px;
        background-image: url('${spriteUri}');
        background-position: ${xOffset}px 0px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      }
    `
  }
}
