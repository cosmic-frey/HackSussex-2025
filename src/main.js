import Phaser from 'phaser';
import { initAuth0, handleAuth0Redirect } from './services/auth.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import IntroVideoScene from './scenes/IntroVideoScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1IntroScene from './scenes/Level1IntroScene.js';
import CountdownScene from './scenes/CountdownScene.js';
import GameScene from './scenes/GameScene.js';
import Level2IntroScene from './scenes/Level2IntroScene.js';
import Level2Scene from './scenes/Level2Scene.js';
import Level3IntroScene from './scenes/Level3IntroScene.js';
import BossScene from './scenes/BossScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import EndResourcesScene from './scenes/EndResourcesScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'parent',
        expandParent: true,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        IntroVideoScene,
        MenuScene,
        Level1IntroScene,
        CountdownScene,
        GameScene,
        Level2IntroScene,
        Level2Scene,
        Level3IntroScene,
        BossScene,
        GameOverScene,
        EndResourcesScene
    ]
};

// Initialize Auth0 and start game
async function initGame() {
    try {
        console.log('🔐 Initializing Auth0...');
        await initAuth0();
        
        console.log('📍 Handling Auth0 redirect...');
        await handleAuth0Redirect();
        
        console.log('🎮 Starting Phaser game...');
        const game = new Phaser.Game(config);
        
        // Make game instance globally accessible for debugging
        window.game = game;
        console.log('✓ Game initialized successfully');
    } catch (error) {
        console.error('✗ Failed to initialize game:', error);
        // Still create game even if Auth0 fails (optional login)
        const game = new Phaser.Game(config);
        window.game = game;
    }
}

initGame();
