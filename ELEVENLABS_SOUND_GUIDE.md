# ElevenLabs Sound Integration Guide

Complete step-by-step guide for integrating sound effects and voice-overs using ElevenLabs AI.

---

## Table of Contents
1. [ElevenLabs Setup](#elevenlabs-setup)
2. [Generate Sound Effects](#generate-sound-effects)
3. [Generate Voice-Overs](#generate-voice-overs)
4. [Integrate Sounds into Phaser](#integrate-sounds-into-phaser)
5. [Sound Implementation Examples](#sound-implementation-examples)

---

## ElevenLabs Setup

### Step 1: Create ElevenLabs Account
1. Go to https://elevenlabs.io
2. Click **Sign Up** (free tier available)
3. Verify your email
4. You get **10,000 characters/month free**

### Step 2: Get API Key
1. Go to your **Profile Settings**
2. Click **API Keys**
3. Click **Generate API Key**
4. Copy and save your API key securely

---

## Generate Sound Effects

ElevenLabs has a **Sound Effects** feature that generates custom audio.

### Step 1: Access Sound Effects Generator
1. Log into ElevenLabs
2. Click **Sound Effects** in the sidebar
3. You'll see the sound generation interface

### Step 2: Generate Game Sounds

#### Coin Collection Sound
**Prompt**: "Bright cheerful coin pickup sound, short ding with sparkle"
- Duration: 0.5 seconds
- Click **Generate**
- Download as `coin-collect.mp3`

#### Jump Sound
**Prompt**: "Light bouncy jump sound effect, quick whoosh upward"
- Duration: 0.3 seconds
- Click **Generate**
- Download as `jump.mp3`

#### Spell Cast Sound
**Prompt**: "Magical spell casting sound, mystical whoosh with energy buildup"
- Duration: 1 second
- Click **Generate**
- Download as `spell-cast.mp3`

#### Spell Hit Sound
**Prompt**: "Magical explosion impact, powerful burst with sparkles"
- Duration: 0.8 seconds
- Click **Generate**
- Download as `spell-hit.mp3`

#### Shadow Destroyed Sound
**Prompt**: "Dark enemy defeated sound, dramatic explosion with fade"
- Duration: 1.2 seconds
- Click **Generate**
- Download as `shadow-destroyed.mp3`

#### Shadow Steal Sound
**Prompt**: "Ominous theft sound, dark swoosh with negative tone"
- Duration: 0.8 seconds
- Click **Generate**
- Download as `shadow-steal.mp3`

#### Dragon Roar Sound
**Prompt**: "Fierce dragon roar, powerful and intimidating beast sound"
- Duration: 2 seconds
- Click **Generate**
- Download as `dragon-roar.mp3`

#### Dragon Attack Sound
**Prompt**: "Dragon fireball attack, whooshing flame projectile"
- Duration: 1 second
- Click **Generate**
- Download as `dragon-attack.mp3`

#### Victory Sound
**Prompt**: "Triumphant victory fanfare, uplifting celebration music"
- Duration: 3 seconds
- Click **Generate**
- Download as `victory.mp3`

#### Defeat Sound
**Prompt**: "Sad defeat sound, descending tones with disappointment"
- Duration: 2 seconds
- Click **Generate**
- Download as `defeat.mp3`

#### Background Music - Level 1
**Prompt**: "Upbeat electronic game music, energetic and motivating loop"
- Duration: 30 seconds
- Click **Generate**
- Download as `level1-music.mp3`

#### Background Music - Level 2
**Prompt**: "Tense digital glitch music, cyberpunk atmosphere with urgency"
- Duration: 30 seconds
- Click **Generate**
- Download as `level2-music.mp3`

#### Background Music - Boss Fight
**Prompt**: "Epic boss battle music, intense orchestral with drums"
- Duration: 60 seconds
- Click **Generate**
- Download as `boss-music.mp3`

---

## Generate Voice-Overs

### Step 1: Choose Voice
1. Go to **Voice Library**
2. Browse available voices
3. Recommended voices for game:
   - **Adam** - Deep, authoritative (for announcements)
   - **Rachel** - Clear, friendly (for instructions)
   - **Antoni** - Energetic (for level intros)

### Step 2: Generate Voice Lines

#### Level 1 Intro
**Text**: "Level 1: Password Dash. Collect passwords and destroy shadow hackers. Good luck!"
- Voice: **Antoni**
- Stability: 50%
- Clarity: 75%
- Download as `level1-intro.mp3`

#### Level 2 Intro
**Text**: "Level 2: Entering the Breach. Damage can be reversed if you act fast!"
- Voice: **Antoni**
- Download as `level2-intro.mp3`

#### Level 3 Intro
**Text**: "Final Battle! Defeat the dragon to regain your internet privacy!"
- Voice: **Adam**
- Download as `level3-intro.mp3`

#### Victory Line
**Text**: "Victory! You've reclaimed your digital freedom!"
- Voice: **Rachel**
- Download as `victory-voice.mp3`

#### Defeat Line
**Text**: "Defeat. But you can try again!"
- Voice: **Rachel**
- Download as `defeat-voice.mp3`

---

## Integrate Sounds into Phaser

### Step 1: Create Audio Directory
```bash
cd HackSussex/gaming
mkdir -p public/audio
```

### Step 2: Move Audio Files
Move all downloaded MP3 files to `public/audio/`:
```
public/audio/
├── coin-collect.mp3
├── jump.mp3
├── spell-cast.mp3
├── spell-hit.mp3
├── shadow-destroyed.mp3
├── shadow-steal.mp3
├── dragon-roar.mp3
├── dragon-attack.mp3
├── victory.mp3
├── defeat.mp3
├── level1-music.mp3
├── level2-music.mp3
├── boss-music.mp3
├── level1-intro.mp3
├── level2-intro.mp3
├── level3-intro.mp3
├── victory-voice.mp3
└── defeat-voice.mp3
```

### Step 3: Load Sounds in PreloadScene

Update `src/scenes/PreloadScene.js`:

```javascript
preload() {
    // ... existing image loading code ...
    
    // Load sound effects
    this.load.audio('coin-collect', '/audio/coin-collect.mp3');
    this.load.audio('jump', '/audio/jump.mp3');
    this.load.audio('spell-cast', '/audio/spell-cast.mp3');
    this.load.audio('spell-hit', '/audio/spell-hit.mp3');
    this.load.audio('shadow-destroyed', '/audio/shadow-destroyed.mp3');
    this.load.audio('shadow-steal', '/audio/shadow-steal.mp3');
    this.load.audio('dragon-roar', '/audio/dragon-roar.mp3');
    this.load.audio('dragon-attack', '/audio/dragon-attack.mp3');
    this.load.audio('victory', '/audio/victory.mp3');
    this.load.audio('defeat', '/audio/defeat.mp3');
    
    // Load background music
    this.load.audio('level1-music', '/audio/level1-music.mp3');
    this.load.audio('level2-music', '/audio/level2-music.mp3');
    this.load.audio('boss-music', '/audio/boss-music.mp3');
    
    // Load voice-overs
    this.load.audio('level1-intro-voice', '/audio/level1-intro.mp3');
    this.load.audio('level2-intro-voice', '/audio/level2-intro.mp3');
    this.load.audio('level3-intro-voice', '/audio/level3-intro.mp3');
    this.load.audio('victory-voice', '/audio/victory-voice.mp3');
    this.load.audio('defeat-voice', '/audio/defeat-voice.mp3');
    
    console.log('Audio files loaded');
}
```

### Step 4: Create Sound Manager

Create `src/services/SoundManager.js`:

```javascript
/**
 * SoundManager - Centralized sound management
 */
class SoundManager {
    constructor() {
        this.scene = null;
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.voiceVolume = 0.8;
        this.muted = false;
    }

    init(scene) {
        this.scene = scene;
    }

    // Play sound effect
    playSFX(key, volume = this.sfxVolume) {
        if (this.muted || !this.scene) return;
        
        try {
            const sound = this.scene.sound.add(key, { volume });
            sound.play();
            return sound;
        } catch (error) {
            console.warn(`Failed to play sound: ${key}`, error);
        }
    }

    // Play background music (looping)
    playMusic(key, volume = this.musicVolume) {
        if (this.muted || !this.scene) return;
        
        // Stop current music
        this.stopMusic();
        
        try {
            this.music = this.scene.sound.add(key, {
                volume,
                loop: true
            });
            this.music.play();
            return this.music;
        } catch (error) {
            console.warn(`Failed to play music: ${key}`, error);
        }
    }

    // Stop current music
    stopMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    // Play voice-over
    playVoice(key, volume = this.voiceVolume) {
        if (this.muted || !this.scene) return;
        
        try {
            const voice = this.scene.sound.add(key, { volume });
            voice.play();
            return voice;
        } catch (error) {
            console.warn(`Failed to play voice: ${key}`, error);
        }
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        if (this.scene) {
            this.scene.sound.mute = this.muted;
        }
        return this.muted;
    }

    // Set volumes
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.music) {
            this.music.setVolume(volume);
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
    }

    setVoiceVolume(volume) {
        this.voiceVolume = volume;
    }
}

export default new SoundManager();
```

---

## Sound Implementation Examples

### Example 1: GameScene with Sounds

Update `src/scenes/GameScene.js`:

```javascript
import SoundManager from '../services/SoundManager';

export default class GameScene extends Phaser.Scene {
    create() {
        // Initialize sound manager
        SoundManager.init(this);
        
        // Start background music
        SoundManager.playMusic('level1-music');
        
        // ... rest of create code ...
    }

    // In collectToken method
    collectToken(player, token) {
        // ... existing code ...
        
        // Play coin collect sound
        SoundManager.playSFX('coin-collect');
        
        // ... rest of method ...
    }

    // In jump handling
    update() {
        // ... existing code ...
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(-400);
                SoundManager.playSFX('jump');
            }
        }
        
        // ... rest of update ...
    }

    // In castSpell method
    castSpell() {
        // ... existing code ...
        
        // Play spell cast sound
        SoundManager.playSFX('spell-cast');
        
        // ... rest of method ...
    }

    // In spellHitsShadow method
    spellHitsShadow(spell, shadow) {
        // ... existing code ...
        
        // Play spell hit and shadow destroyed sounds
        SoundManager.playSFX('spell-hit');
        this.time.delayedCall(200, () => {
            SoundManager.playSFX('shadow-destroyed');
        });
        
        // ... rest of method ...
    }

    // In hitByShadow method
    hitByShadow(player, shadow) {
        // ... existing code ...
        
        // Play shadow steal sound
        SoundManager.playSFX('shadow-steal');
        
        // ... rest of method ...
    }

    // When leaving scene
    shutdown() {
        SoundManager.stopMusic();
    }
}
```

### Example 2: Level1IntroScene with Voice

Update `src/scenes/Level1IntroScene.js`:

```javascript
import SoundManager from '../services/SoundManager';

export default class Level1IntroScene extends Phaser.Scene {
    create() {
        // Initialize sound manager
        SoundManager.init(this);
        
        // Play intro voice-over
        SoundManager.playVoice('level1-intro-voice');
        
        // ... rest of create code ...
    }
}
```

### Example 3: BossScene with Music

Update `src/scenes/BossScene.js`:

```javascript
import SoundManager from '../services/SoundManager';

export default class BossScene extends Phaser.Scene {
    startBossFight() {
        // Initialize sound manager
        SoundManager.init(this);
        
        // Play boss music
        SoundManager.playMusic('boss-music');
        
        // Play dragon roar
        SoundManager.playSFX('dragon-roar', 1.0);
        
        // ... rest of method ...
    }

    playerAttack() {
        // ... existing code ...
        
        // Play spell cast sound
        SoundManager.playSFX('spell-cast');
        
        // ... rest of method ...
    }

    dragonAttack() {
        // ... existing code ...
        
        // Play dragon attack sound
        SoundManager.playSFX('dragon-attack');
        
        // ... rest of method ...
    }

    victory() {
        // Stop boss music
        SoundManager.stopMusic();
        
        // Play victory sounds
        SoundManager.playSFX('victory');
        this.time.delayedCall(500, () => {
            SoundManager.playVoice('victory-voice');
        });
        
        // ... rest of method ...
    }

    defeat() {
        // Stop boss music
        SoundManager.stopMusic();
        
        // Play defeat sounds
        SoundManager.playSFX('defeat');
        this.time.delayedCall(500, () => {
            SoundManager.playVoice('defeat-voice');
        });
        
        // ... rest of method ...
    }
}
```

### Example 4: MenuScene with Mute Button

Update `src/scenes/MenuScene.js`:

```javascript
import SoundManager from '../services/SoundManager';

export default class MenuScene extends Phaser.Scene {
    create() {
        // Initialize sound manager
        SoundManager.init(this);
        
        // ... existing menu code ...
        
        // Add mute button
        const muteButton = this.add.text(width - 60, 20, '🔊', {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        });
        muteButton.setInteractive({ useHandCursor: true });
        muteButton.on('pointerdown', () => {
            const muted = SoundManager.toggleMute();
            muteButton.setText(muted ? '🔇' : '🔊');
        });
    }
}
```

---

## Testing Sounds

### Step 1: Test Locally
```bash
npm run dev
```

### Step 2: Check Console
Open browser console (F12) and look for:
```
✓ Audio files loaded
```

### Step 3: Test Each Sound
- Collect a coin → Should hear coin sound
- Jump → Should hear jump sound
- Cast spell → Should hear spell sound
- Hit shadow → Should hear explosion
- Get hit by shadow → Should hear steal sound
- Boss fight → Should hear dragon roar and music

---

## Optimization Tips

### 1. Compress Audio Files
Use online tools to compress MP3 files:
- https://www.freeconvert.com/audio-compressor
- Target: 128kbps for music, 64kbps for SFX

### 2. Preload Only Essential Sounds
Load menu/level 1 sounds first, lazy-load others.

### 3. Use Audio Sprites
Combine multiple short sounds into one file for faster loading.

### 4. Add Loading Progress
Show audio loading progress in PreloadScene.

---

## Troubleshooting

### Sound Not Playing
- Check browser console for errors
- Verify file paths are correct
- Check if audio files are in `public/audio/`
- Try different audio format (OGG as fallback)

### Audio Autoplay Blocked
Modern browsers block autoplay. Solution:
```javascript
// In MenuScene, add click-to-start
this.input.once('pointerdown', () => {
    this.sound.context.resume();
});
```

### Volume Too Loud/Quiet
Adjust volumes in SoundManager:
```javascript
this.musicVolume = 0.3;  // 30%
this.sfxVolume = 0.7;    // 70%
this.voiceVolume = 0.8;  // 80%
```

---

## Cost Estimate

**ElevenLabs Free Tier:**
- 10,000 characters/month
- Approximately 15-20 voice-overs
- Sound effects: Unlimited (separate feature)

**Paid Tier ($5/month):**
- 30,000 characters/month
- Commercial license
- More voices

---

## Summary

You now have:
- ✅ Sound effects for all game actions
- ✅ Background music for each level
- ✅ Voice-overs for intros and endings
- ✅ Centralized sound management
- ✅ Mute functionality

Total sounds: ~17 audio files
Total size: ~5-10 MB (compressed)

Enjoy your fully voiced game! 🎮🔊