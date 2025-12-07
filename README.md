# Password Quest - Hackathon Game

A privacy-themed auto-runner game where you collect password tokens and defeat shadow threats to recover your stolen login credentials from a dragon boss.

## 🎮 Game Features

- **Auto-runner gameplay** - Character runs automatically
- **Token collection** - Collect password tokens (yellow circles)
- **Shadow threats** - Destroy shadows with spells or lose tokens
- **Boss fight** - Defeat the dragon to win
- **3 difficulty modes** - Easy, Medium, Hard
- **Placeholder graphics** - Simple colored shapes for rapid prototyping

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Open terminal in the `HackSussex/gaming` folder
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:5173`

## 🎯 How to Play

- **SPACE** - Cast spell to destroy shadows
- **Goal** - Collect tokens, avoid/destroy shadows, defeat the dragon
- **Warning** - Shadows steal 50% of your tokens if they hit you!

## 📦 Project Structure

```
HackSussex/gaming/
├── src/
│   ├── main.js              # Game configuration
│   └── scenes/
│       ├── BootScene.js     # Initial setup
│       ├── PreloadScene.js  # Asset loading
│       ├── MenuScene.js     # Main menu
│       ├── GameScene.js     # Level 1 gameplay
│       ├── BossScene.js     # Dragon boss fight
│       └── GameOverScene.js # Victory/defeat screen
├── index.html               # Entry point
├── package.json             # Dependencies
└── README.md               # This file
```

## 🎨 Placeholder Graphics

The game currently uses simple colored shapes:
- **Player** - Blue rectangle (32x32)
- **Dragon** - Red rectangle (128x128)
- **Shadow** - Black circle (24x24)
- **Token** - Yellow circle (16x16)
- **Spell** - Purple circle (8x8)

These are generated programmatically in `PreloadScene.js`. You can replace them with actual images later by:
1. Adding image files to an `assets/` folder
2. Loading them in `PreloadScene.preload()`
3. Using the same texture keys

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Next Steps

This is a working prototype with core mechanics. To complete the hackathon project, you'll need to add:

1. **Backend API** (Node.js/Express)
   - Auth0 authentication
   - ElevenLabs voice integration
   - Cloudflare Workers leaderboard
   - Solana skin system

2. **Visual Polish**
   - Replace placeholder graphics with actual sprites
   - Add more particle effects
   - Improve animations

3. **Audio**
   - ElevenLabs voice narration
   - Sound effects
   - Background music

4. **Optional Features**
   - Level 2 (water theme)
   - Multiplayer co-op
   - Gemini API boss dialogue

## 🐛 Troubleshooting

**Game doesn't start:**
- Make sure you ran `npm install`
- Check that port 5173 isn't already in use
- Try `npm run build` then `npm run preview`

**Placeholder graphics not showing:**
- Check browser console for errors
- Make sure all scene files are in `src/scenes/`

## 📚 Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser Examples](https://phaser.io/examples)
- [Game Design Spec](.kiro/specs/shadow-mage-game/)

## 🎓 Learning Notes

This boilerplate demonstrates:
- Phaser 3 scene management
- Physics and collision detection
- Particle effects
- Tweens and animations
- Input handling
- Game state management
- Difficulty scaling

Each file is heavily commented to explain what's happening and why!
