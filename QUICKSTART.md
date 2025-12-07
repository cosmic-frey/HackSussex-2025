# 🚀 Quick Start Guide

## What You Have Now

A working Phaser 3 game with:
- ✅ Main menu with difficulty selection
- ✅ Level 1 gameplay (auto-runner)
- ✅ Token collection system
- ✅ Shadow threat system with warnings
- ✅ Spell casting with cooldown
- ✅ Boss fight with 3 phases
- ✅ Victory/defeat screens
- ✅ Placeholder graphics (colored shapes)

## How to Run It

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Go to https://nodejs.org
2. Download the LTS version
3. Install with default settings
4. Verify: Open CMD and type `node --version`

### Step 2: Install Dependencies
Open CMD in the `HackSussex/gaming` folder and run:
```bash
npm install
```

This will download Phaser and Vite (takes 1-2 minutes).

### Step 3: Start the Game
```bash
npm start
```

Your browser will open automatically to `http://localhost:5173`

## What You'll See

1. **Loading screen** - Brief loading bar
2. **Main menu** - Title and 3 difficulty buttons
3. **Level 1** - Blue rectangle (you) running, yellow circles (tokens), black circles (shadows)
4. **Boss fight** - Red rectangle (dragon) with health bars
5. **Game over** - Victory or defeat screen with stats

## Controls

- **SPACE** - Cast spell (purple circle shoots out)
- **No movement controls** - Character runs automatically

## Understanding the Code

### Main Files

**src/main.js**
- Sets up Phaser game
- Configures physics and scenes
- Entry point

**src/scenes/MenuScene.js**
- Main menu
- Difficulty selection
- Starts GameScene

**src/scenes/GameScene.js**
- Level 1 gameplay
- Token spawning
- Shadow spawning with warnings
- Spell casting
- Collision detection
- Performance tracking

**src/scenes/BossScene.js**
- Dragon boss fight
- Health bars
- Phase transitions
- Win/lose conditions

### Key Concepts

**Scenes** - Like levels or screens in the game
**Sprites** - Visual game objects (player, dragon, etc.)
**Physics** - Handles movement and collisions
**Tweens** - Smooth animations
**Particles** - Visual effects

## Testing the Game

### Test Level 1:
1. Select "EASY" difficulty
2. Press SPACE to cast spells
3. Collect yellow circles (tokens)
4. Destroy black circles (shadows) with spells
5. If a shadow hits you, you lose 50% of tokens
6. After 60 seconds, boss fight starts

### Test Boss Fight:
1. Press SPACE to attack dragon
2. Dodge red fireballs from dragon
3. Watch health bars
4. Dragon has 3 phases (at 50% and 25% health)
5. Win by depleting dragon health
6. Lose if your health reaches zero

## Customizing

### Change Colors:
In `PreloadScene.js`, find `createPlaceholderTextures()`:
```javascript
playerGraphics.fillStyle(0x4a90e2, 1); // Change 0x4a90e2 to any hex color
```

### Change Difficulty:
In `GameScene.js`, find `difficultySettings`:
```javascript
easy: {
    scrollSpeed: 100,        // How fast things move
    shadowWarningTime: 3000, // Warning time in milliseconds
    spellCooldown: 1000,     // Cooldown in milliseconds
    shadowSpawnRate: 3000    // How often shadows spawn
}
```

### Change Level Duration:
In `GameScene.js`, find:
```javascript
this.levelDuration = 60000; // 60 seconds (change to any value)
```

## Next Steps

Once you understand the code:
1. Replace placeholder graphics with real sprites
2. Add backend API for Auth0, ElevenLabs, etc.
3. Implement leaderboard with Cloudflare Workers
4. Add Solana skin system
5. Polish with better effects and animations

## Troubleshooting

**"npm: command not found"**
- Node.js not installed or not in PATH
- Restart terminal after installing Node.js

**Port 5173 already in use**
- Another app is using that port
- Change port in `vite.config.js`

**Black screen in browser**
- Check browser console (F12) for errors
- Make sure all files are in correct folders

**Game runs but nothing appears**
- Check console for errors
- Verify all scene files are imported in `main.js`

## Getting Help

- Check browser console (F12) for error messages
- Read comments in the code files
- Refer to Phaser 3 docs: https://photonstorm.github.io/phaser3-docs/
- Ask me questions about specific parts!

## What's Working

✅ Game loop
✅ Scene transitions
✅ Player movement (auto-run)
✅ Token collection
✅ Shadow spawning with warnings
✅ Spell casting with cooldown
✅ Collision detection
✅ Boss fight mechanics
✅ Health bars
✅ Difficulty scaling
✅ Performance tracking
✅ Victory/defeat conditions

## What's NOT Implemented Yet

❌ Backend API
❌ Auth0 login
❌ ElevenLabs voice
❌ Cloudflare leaderboard
❌ Solana skins
❌ Real graphics/sprites
❌ Sound effects
❌ Level 2
❌ Multiplayer

These will be added step-by-step following the tasks.md file!
