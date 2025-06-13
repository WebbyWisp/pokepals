# 🎮 Pokémon Pals - VS Code Extension

_A cozy, pixel-art Tamagotchi-style Pokémon companion for developers_

## 🌟 Vision

Pokémon Pals transforms your coding experience into a delightful journey with virtual Pokémon companions. As you write code, create files, and develop projects, your Pokémon friends grow, evolve, and accompany you on your development adventures. The extension emphasizes a relaxing, non-intrusive experience that enhances productivity rather than distracting from it.

## ✨ Core Features

### 🐾 Pokémon Companion System

- **Random Starter**: Begin with a randomly assigned basic Pokémon (no evolutions, legendaries, or mythicals)
- **Sidebar Display**: A cozy pixel-art companion in the Explorer sidebar, like the Timeline view
- **Mood System**: Your Pokémon's happiness level affects their animations and productivity
- **Idle Automation**: Your Pokémon automatically cares for itself and helps with progression while you code

### 🎯 Activity-Based Interactions

- **Code Writing**: Typing code generates experience points and random encounters
- **File Operations**: Creating, saving, and organizing files triggers special events
- **Git Actions**: Commits, pushes, and merges reward your Pokémon with treats
- **Time-Based Events**: Pokémon may get hungry or sleepy based on real-time
- **Milestone Celebrations**: Completing large tasks triggers special animations

### 🌍 Exploration & Discovery

- **Wild Encounters**: Random Pokémon appear while coding, with simple click-to-catch mechanics
- **File-Based Biomes**: Different file types create unique environments (tests, docs, configs, main files)
- **Rare Spawns**: Special Pokémon appear during significant coding achievements and high progression scores
- **Pokédex**: Track discovered and caught Pokémon with beautiful pixel art

### 📈 Progression System

- **Code Crystals**: Idle currency automatically generated while coding, boosted by Pokémon efficiency
- **Experience Gain**: Pokémon level up through your coding activities and crystal generation
- **Evolution**: Pokémon evolve at certain levels, making them more efficient crystal generators
- **Friendship System**: Build bonds with your Pokémon through consistent coding sessions
- **Achievement Unlocks**: Progression milestones unlock new biomes, rarer spawns, and special Pokémon

### 🎨 Visual Design

- **Pixel Art Style**: Charming 16-bit inspired graphics
- **Cozy Palette**: Warm, soft colors that don't strain the eyes
- **Subtle Animations**: Gentle movements and expressions
- **Theme Integration**: Adapts to VS Code's light/dark themes
- **Minimal UI**: Clean, unobtrusive interface elements

### 💾 Data Persistence

- **Cloud Sync**: Save progress to VS Code Settings Sync or GitHub
- **Local Backup**: Fallback local storage for offline work
- **Cross-Device**: Access your Pokémon on any device with VS Code
- **Export/Import**: Backup and restore functionality

## 🏗️ Technical Architecture

### Extension Structure

```
pokepals/
├── src/
│   ├── extension.ts              # Main extension entry point
│   ├── core/
│   │   ├── GameManager.ts        # Central game state management
│   │   ├── PokemonManager.ts     # Pokémon collection and idle automation
│   │   ├── ActivityTracker.ts    # VS Code activity monitoring
│   │   ├── ProgressionEngine.ts  # Code Crystal generation and idle mechanics
│   │   └── SaveManager.ts        # Data persistence and sync
│   ├── models/
│   │   ├── Pokemon.ts            # Pokémon data structure
│   │   ├── Player.ts             # Player progress, crystals, and achievements
│   │   └── GameState.ts          # Overall game state
│   ├── ui/
│   │   ├── SidebarProvider.ts    # Explorer sidebar panel (main view)
│   │   ├── NotificationManager.ts # Event notifications
│   │   └── WebviewProvider.ts    # Rich UI components
│   ├── data/
│   │   ├── pokemon-data.json     # Pokémon species information (basic forms only)
│   │   ├── file-biomes.json      # File extension to biome mapping
│   │   └── achievements.json     # Achievement definitions
│   └── assets/
│       ├── sprites/              # Pixel art Pokémon sprites
│       ├── icons/                # UI icons and elements
│       └── sounds/               # Optional ambient sounds
├── media/                        # Webview assets
├── package.json                  # Extension manifest
└── README.md                     # This file
```

### Key Technologies

- **TypeScript**: Type-safe development
- **VS Code Extension API**: Deep editor integration
- **Webview API**: Rich UI components
- **Settings Sync**: Cross-device data persistence
- **SVG/CSS**: Scalable pixel art rendering

## 🎮 Gameplay Mechanics

### 💎 Code Crystal System (Idle Progression)

Like Cookie Clicker, but for coding! Code Crystals are the heart of progression:

- **Auto-Generation**: Crystals accumulate automatically while you type and work
- **Pokémon Efficiency**: Higher level Pokémon generate crystals faster
- **Happiness Multipliers**: Happy Pokémon are more productive crystal generators
- **Milestone Rewards**: Reaching crystal thresholds unlocks achievements and rare spawns
- **Evolution Currency**: Spend crystals to evolve Pokémon or unlock new features

### 🏞️ File-Based Biome System

Your current file type creates different environments:

- **Main Code Files** (`.js`, `.ts`, `.py`): Forest biome - common Pokémon like Pidgey, Rattata
- **Test Files** (`.test.js`, `.spec.ts`): Laboratory biome - smart Pokémon like Alakazam, Mewtwo
- **Documentation** (`.md`, `.txt`): Library biome - wise Pokémon like Hoothoot, Alakazam
- **Config Files** (`.json`, `.yaml`, `.toml`): Cave biome - rock/steel types like Geodude, Magnemite
- **Style Files** (`.css`, `.scss`): Garden biome - colorful Pokémon like Roselia, Butterfree
- **Database Files** (`.sql`, `.db`): Ocean biome - water types like Magikarp, Psyduck

### Activity Mapping

| VS Code Action       | Game Event                                          |
| -------------------- | --------------------------------------------------- |
| Typing code          | Code Crystal generation, XP gain, random encounters |
| Saving files         | Crystal bonus, happiness boost                      |
| Creating files       | Biome exploration, potential wild spawns            |
| Git commits          | Achievement progress, crystal multiplier            |
| File type changes    | Biome transitions, new Pokémon availability         |
| Long coding sessions | Friendship growth, evolution opportunities          |

### Idle Progression Mechanics

- **Code Crystals**: Automatically generated while coding, rate increases with Pokémon level and happiness
- **File Biomes**: Current file type determines available wild Pokémon encounters
- **Auto-Care**: Pokémon maintain themselves through coding activity (no manual feeding required)
- **Background Evolution**: Pokémon evolve automatically when conditions are met

### Evolution Conditions

- **Level-based**: Traditional XP thresholds reached through coding
- **Crystal-based**: Spending accumulated Code Crystals on evolution
- **Friendship-based**: Long-term coding companionship
- **Achievement-based**: Unlocked through progression milestones

## 🎯 User Experience Principles

### Non-Intrusive Design

- **Fully Automated**: Runs completely in background while you code
- **Minimal Clicks**: Only occasional click-to-catch wild Pokémon
- **Passive Progression**: Everything happens automatically through normal coding
- **No Commands**: Zero need to remember commands or complex interactions

### Accessibility

- **Color-Blind Friendly**: Meaningful iconography beyond color
- **Reduced Motion**: Respect system preferences
- **Screen Reader**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full functionality without mouse

## 🚀 Development Roadmap

The detailed development roadmap with phases, milestones, and timelines has been moved to **[ROADMAP.md](./ROADMAP.md)** for better organization and maintenance.

**Quick Overview:**

- **Phase 1-2**: Foundation & Core Gameplay (Weeks 1-4)
- **Phase 3-4**: Visual Polish & Advanced Features (Weeks 5-8)
- **Phase 5-6**: Enhancement & Release (Weeks 9-12)

See the [full roadmap](./ROADMAP.md) for detailed deliverables, checkpoints, and development guidelines.

## 🤝 Contributing

This extension will be developed with community input and feedback. Key areas for contribution:

- **Pixel Art**: Pokémon sprites and UI elements
- **Game Balance**: XP rates, evolution requirements
- **Feature Ideas**: New interactions and mechanics
- **Testing**: Cross-platform compatibility
- **Accessibility**: Inclusive design improvements

## 📝 Technical Considerations

### Performance

- **Lazy Loading**: Sprites and data loaded on demand
- **Efficient Polling**: Minimal VS Code API calls
- **Background Processing**: Non-blocking operations
- **Memory Management**: Proper cleanup and disposal

### Security

- **Safe Data Storage**: No sensitive information exposure
- **Secure Sync**: Encrypted cloud storage
- **Permission Minimal**: Only necessary VS Code permissions
- **Sandbox Compliance**: Webview security best practices

### Compatibility

- **VS Code Versions**: Support for latest stable and insiders
- **Operating Systems**: Windows, macOS, Linux
- **Themes**: Light, dark, and high contrast themes
- **Extensions**: Compatible with popular dev extensions

## 🎊 Success Metrics

- **User Engagement**: Daily active users and session length
- **Retention**: Weekly and monthly user return rates
- **Community**: Downloads, ratings, and reviews
- **Performance**: Extension load time and resource usage
- **Feedback**: User satisfaction and feature requests

---

_Let's make coding a more delightful and companionable experience, one Pokémon at a time! 🌟_

## 🚀 Current Status

**Phase 3 Complete + Vue 3 Migration In Progress**

- ✅ **Core Gameplay**: Full Pokemon companion system with stats, leveling, and interactions
- ✅ **Advanced Animations**: Complete sprite animation system with walking, sitting, sleeping
- ✅ **Activity Tracking**: XP gain from coding activities (typing, saving, file creation)
- ✅ **Visual Polish**: Pixel-art sprites, background scenes, theme integration
- 🚧 **Vue 3 Migration**: Modern frontend architecture (Phase 1 complete)

## 🎮 How to Use

### Installation & Setup

```bash
# Use correct Node version
nvm use

# Install dependencies
npm install

# Build the extension
npm run compile

# Build Vue webview (for Vue 3 version)
npm run build:webview
```

### Running the Extension

1. Open this project in VS Code
2. Press `F5` to launch Extension Development Host
3. Look for the Pokémon Pals panel in the Explorer sidebar
4. Start coding to earn XP and Code Crystals!

### Interactions

- **Pet** 🤗: Increase happiness and friendship
- **Feed** 🍎: Spend 10 Code Crystals to boost happiness significantly
- **Play** 🎮: Interactive play session for XP and happiness
- **Sit** 💺: Make your Pokémon sit down
- **Lay** 😴: Make your Pokémon lay down for a rest
- **Sleep** 🌙: Put your Pokémon to sleep

## 🏗️ Architecture

### Current Implementation (Stable)

- **Extension Core**: TypeScript-based VS Code extension
- **Game Logic**: Complete Pokemon, Player, and GameState management
- **UI**: HTML-in-TypeScript webview with advanced animation system
- **Persistence**: JSON-based save system with backup

### Vue 3 Migration (In Progress)

- **Frontend**: Vue 3 + TypeScript + Vite
- **State Management**: Pinia stores for reactive state
- **Components**: Modular Vue components for better maintainability
- **Build System**: Vite for fast development and optimized builds

## 📁 Project Structure

```
pokepals/
├── src/
│   ├── core/                   # Game logic and state management
│   │   ├── GameManager.ts      # Main game controller
│   │   ├── GameState.ts        # Game state management
│   │   ├── Pokemon.ts          # Pokemon class and logic
│   │   ├── Player.ts           # Player progress and stats
│   │   └── SaveManager.ts      # Save/load functionality
│   ├── ui/                     # UI providers
│   │   ├── SidebarProvider.ts  # Current HTML-based UI
│   │   ├── VueSidebarProvider.ts # New Vue-based UI
│   │   ├── StatusBarProvider.ts # Status bar integration
│   │   └── PokemonSprite.ts    # Sprite management
│   ├── webview/               # Vue 3 application
│   │   ├── components/        # Vue components
│   │   ├── stores/           # Pinia state management
│   │   ├── composables/      # Reusable Vue logic
│   │   └── types/           # TypeScript definitions
│   ├── assets/              # Pokemon sprites and backgrounds
│   └── extension.ts         # Extension entry point
├── dist/                    # Built extension and webview
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🎯 Development Roadmap

### ✅ Completed Phases

- **Phase 1**: Foundation & Core Systems
- **Phase 2**: Activity Tracking & Gameplay Mechanics
- **Phase 3**: Visual Polish & Advanced Animations
- **Vue Migration Phase 1**: Build pipeline and component structure

### 🚧 Current Work

- **Vue Migration Phase 2**: Animation system and sprite rendering
- **Vue Migration Phase 3**: Full feature parity and testing

### 📋 Upcoming

- **Phase 4**: Wild Encounters & Collection System
- **Phase 5**: Advanced Features & Polish
- **Phase 6**: Release Preparation

See [ROADMAP.md](ROADMAP.md) for detailed development timeline.

## 🧪 Development

### Scripts

```bash
# Extension development
npm run compile          # Build TypeScript extension
npm run watch           # Watch mode for extension development

# Vue webview development
npm run build:webview   # Build Vue application
npm run dev:webview     # Vue development server with hot reload

# Code quality
npm run lint            # Run ESLint and Prettier checks
npm run lint:fix        # Auto-fix linting issues
npm run test            # Run test suite
```

### Vue 3 Migration

The project is currently migrating to Vue 3 for better maintainability and developer experience:

- **Current**: HTML-in-TypeScript with manual DOM manipulation
- **Target**: Vue 3 components with reactive state management
- **Benefits**: Hot reload, component architecture, better testing, type safety

See [VUE_MIGRATION.md](VUE_MIGRATION.md) for complete migration documentation.

## 🎨 Assets

- **Pokemon Sprites**: Pixel-art sprite sheets with multiple animations
- **Backgrounds**: Cozy pixel-art scenes for different biomes
- **Animations**: Idle, Walk, Sit, Sleep, Attack, Eat, Pose, Wake, Hurt

## 🤝 Contributing

This is currently a personal project, but contributions and feedback are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Pokémon sprites and assets are used for educational/personal use
- Inspired by Tamagotchi and virtual pet games
- Built with love for the VS Code developer community

---

**Happy coding with your Pokémon companion!** 🐾✨
