import Phaser from 'phaser';

/**
 * PreloadScene - Loads all game assets
 * Shows a loading bar while assets are being loaded
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create high-tech loading screen
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Dark cyberpunk background
        this.add.rectangle(0, 0, width, height, 0x0a0e27).setOrigin(0);
        
        // Animated grid background
        for (let i = 0; i < 20; i++) {
            const line = this.add.line(0, (i * height) / 20, 0, 0, width, 0, 0x9b59b6, 0.05);
        }
        for (let i = 0; i < 30; i++) {
            const line = this.add.line((i * width) / 30, 0, 0, height, 0, height, 0x9b59b6, 0.05);
        }
        
        // Title
        const title = this.add.text(width / 2, height / 4, 'INITIALIZING SYSTEM', {
            font: 'bold 48px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 2
        });
        title.setOrigin(0.5);
        
        // Subtitle with tech feel
        const subtitle = this.add.text(width / 2, height / 4 + 60, '[ LOADING ASSETS ]', {
            font: '20px Courier',
            fill: '#00aa00'
        });
        subtitle.setOrigin(0.5);
        
        // Animated corner brackets
        const cornerStyle = { font: 'bold 32px Courier', fill: '#9b59b6', stroke: '#000000', strokeThickness: 2 };
        const topLeftBracket = this.add.text(30, 30, '┌─', cornerStyle);
        const topRightBracket = this.add.text(width - 80, 30, '─┐', cornerStyle);
        const bottomLeftBracket = this.add.text(30, height - 60, '└─', cornerStyle);
        const bottomRightBracket = this.add.text(width - 80, height - 60, '─┘', cornerStyle);
        
        // Pulse animation for brackets
        [topLeftBracket, topRightBracket, bottomLeftBracket, bottomRightBracket].forEach(bracket => {
            this.tweens.add({
                targets: bracket,
                alpha: 0.5,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        });
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
            font: 'bold 24px Courier',
            fill: '#00ff00'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Percent text
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: 'bold 32px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 2
        });
        percentText.setOrigin(0.5, 0.5);
        
        // High-tech progress bar background
        const barBg = this.add.rectangle(width / 2, height / 2 + 60, 400, 40, 0x1a2d3a, 0.9);
        barBg.setStrokeStyle(2, 0x9b59b6);
        
        // Progress bar fill
        const progressBar = this.add.rectangle(width / 2 - 200, height / 2 + 60, 0, 40, 0x00ff00);
        
        // Glow effect for progress bar
        const glowBar = this.add.rectangle(width / 2 - 200, height / 2 + 60, 0, 40, 0x9b59b6, 0.3);
        
        // Status messages
        const statusText = this.add.text(width / 2, height / 2 + 130, '> INITIALIZING CORE SYSTEMS', {
            font: '16px Courier',
            fill: '#00aa00'
        });
        statusText.setOrigin(0.5);
        
        // Update loading bar
        this.load.on('progress', (value) => {
            const fillWidth = 400 * value;
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.width = fillWidth;
            glowBar.width = fillWidth;
            
            // Change status message based on progress
            if (value < 0.33) {
                statusText.setText('> LOADING ASSETS...');
            } else if (value < 0.66) {
                statusText.setText('> COMPILING TEXTURES...');
            } else if (value < 1) {
                statusText.setText('> FINALIZING SYSTEMS...');
            }
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            glowBar.destroy();
            loadingText.destroy();
            percentText.destroy();
            statusText.setText('> SYSTEMS READY - CONNECTING TO MENU');
            
            // Animate text before transition
            this.tweens.add({
                targets: statusText,
                alpha: 0,
                duration: 500,
                delay: 500
            });
        });
        
        // Error handling for failed loads
        this.load.on('loaderror', (file) => {
            console.error('Error loading file:', file.key, file.src);
            statusText.setText('> ERROR: ' + file.key + ' FAILED');
            statusText.setFill('#ff0000');
        });
        
        // Load your actual placeholder PNG images
        this.load.image('playerchar_placeholder', '/playerchar_placeholder.png');
        this.load.image('dragon_placeholder', '/dragon_placeholder.png');
        this.load.image('shadow_placeholder', '/enemy_placeholder.png');
        this.load.image('shadow_fig', '/shadow_fig.png'); // YOUR actual shadow PNG
        this.load.image('ground_placeholder', '/ground_placeholder.png');
        this.load.image('token_placeholder', '/coin.png');
        
        // Load intro video assets
        this.load.image('pixel_village', '/pixel_village.png');
        this.load.image('phishing_image', '/phishing_image.png');
        
        // Character crying animation sprite sheet
        // 4 frames of 32x32 each
        this.load.spritesheet('character_cry', '/playchar_cry.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.video('phish_video', '/phish_click_recording.mp4');
        
        // Load player sprite sheets
        // Walking animation (side view, running right)
        this.load.spritesheet('player_walk', '/player_walk_right.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Dance/celebration animation (front view, arms wiggling)
        this.load.spritesheet('player_dance', '/playchar_dance.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Spellcasting animation for boss fight
        this.load.spritesheet('player_spellcast', '/player_spellcasting.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Dragon sprite sheet for boss fight
        this.load.spritesheet('dragon', '/dragon.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Load particle atlas for wisp and flame effects
        try {
            this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
            this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json');
            this.load.setBaseURL(''); // Reset base URL
        } catch (error) {
            console.warn('Failed to load flares atlas from CDN:', error);
        }
        
        // Load audio files
        // Background music
        this.load.audio('level1_music', '/level_1_tune.mp3');
        this.load.audio('level2_music', '/level2_tune.mp3');
        this.load.audio('level3_music', '/level3_tune.mp3');
        
        // Sound effects for Level 1
        this.load.audio('coin_collect', '/bing.mp3');
        this.load.audio('shadow_steal', '/shadow_steal.mp3');
        this.load.audio('spell_cast', '/spell_sound.mp3');
        this.load.audio('jump', '/jump.mp3');
        this.load.audio('shadow_explode', '/shadow_explode.mp3');
        
        // Sound effects for Level 2 and 3
        this.load.audio('hit_shadow', '/hit_shadow_level2.mp3');
        this.load.audio('fireball', '/fireball_sound.mp3');
        this.load.audio('dragon_hit', '/dragon_hit.mp3');
        
        // End scene narration
        this.load.audio('end_narration', '/end_scene_narration.mp3');
        
        // Intro video audio
        this.load.audio('happy_village', '/happy_village_tune.mp3');
        this.load.audio('intro_opening_narration', '/Intro_vid_opening_narration.mp3');
        this.load.audio('intro_explanation_narration', '/intro_video_explanation_narration.mp3');
        
        console.log('PreloadScene: Loading PNG assets, sprite sheets, and audio files');
    }

    create() {
        // Create textures for items that don't have PNG files yet
        this.createMissingTextures();
        
        // Create walking animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Create dance/celebration animation
        this.anims.create({
            key: 'dance',
            frames: this.anims.generateFrameNumbers('player_dance', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        // Create spellcasting animation for boss fight
        this.anims.create({
            key: 'spellcast',
            frames: this.anims.generateFrameNumbers('player_spellcast', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0 // Play once
        });
        
        // Create dragon animation for boss fight
        this.anims.create({
            key: 'dragon_idle',
            frames: this.anims.generateFrameNumbers('dragon', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        
        // Create crying animation for intro video
        // First check what frames are available in the texture
        if (this.textures.exists('character_cry')) {
            const cryTexture = this.textures.get('character_cry');
            console.log(`PreloadScene: character_cry texture has ${cryTexture.frameTotal} frames`);
        }
        
        this.anims.create({
            key: 'cry_animation',
            frames: this.anims.generateFrameNumbers('character_cry', { start: 0, end: 3 }), // Top row only (frames 0-3)
            frameRate: 8,
            repeat: -1 // Loop the crying animation
        });
        
        console.log('PreloadScene: cry_animation created');
        
        // Don't start music here - browser requires user interaction first
        // Music will start in IntroVideoScene after user clicks to begin
        console.log('PreloadScene: All assets ready, transitioning to IntroVideoScene');
        
        // Transition to IntroVideoScene
        this.scene.start('IntroVideoScene');
    }
    

    // Creates colored shapes for items that don't have PNG files yetif graphics don't load = always playable
    createMissingTextures() {
        // Spell placeholder (purple circle) - no PNG for this yet
        const spellGraphics = this.add.graphics();
        spellGraphics.fillStyle(0x9b59b6, 1);
        spellGraphics.fillCircle(4, 4, 4);
        spellGraphics.generateTexture('spell_placeholder', 8, 8);
        spellGraphics.destroy();
        
        // Fallback textures if PNGs fail to load
        if (!this.textures.exists('token_placeholder')) {
            console.warn('Coin texture not loaded, creating fallback');
            const tokenGraphics = this.add.graphics();
            tokenGraphics.fillStyle(0xf1c40f, 1);
            tokenGraphics.fillCircle(8, 8, 8);
            tokenGraphics.generateTexture('token_placeholder', 16, 16);
            tokenGraphics.destroy();
        }
        
        if (!this.textures.exists('shadow_placeholder')) {
            console.warn('Shadow texture not loaded, creating fallback');
            const shadowGraphics = this.add.graphics();
            shadowGraphics.fillStyle(0x2c3e50, 1);
            shadowGraphics.fillRect(0, 0, 32, 32);
            shadowGraphics.generateTexture('shadow_placeholder', 32, 32);
            shadowGraphics.destroy();
        }
        
        // Create spark particle texture for spell effects
        const sparkGraphics = this.add.graphics();
        sparkGraphics.fillStyle(0xffffff, 1);
        sparkGraphics.fillCircle(4, 4, 4);
        sparkGraphics.generateTexture('spark', 8, 8);
        sparkGraphics.destroy();
        
        // Create flares texture as fallback if CDN load fails
        if (!this.textures.exists('flares')) {
            console.warn('Flares texture not loaded from CDN, creating fallback');
            // Create a simple white circle for particle effects
            const flaresGraphics = this.add.graphics();
            flaresGraphics.fillStyle(0xffffff, 1);
            flaresGraphics.fillCircle(8, 8, 8);
            flaresGraphics.generateTexture('flares', 16, 16);
            flaresGraphics.destroy();
        }
        
        // Check ground texture
        console.log('Ground texture exists?', this.textures.exists('ground_placeholder'));
        if (this.textures.exists('ground_placeholder')) {
            console.log('✓ Ground texture loaded successfully from ground_placeholder.png!');
        } else {
            console.error('✗ Ground texture FAILED to load!');
        }
        
        console.log('PreloadScene: All assets ready');
    }
}
