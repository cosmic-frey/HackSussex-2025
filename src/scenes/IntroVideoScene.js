import Phaser from 'phaser';

/**
 * IntroVideoScene - Cinematic intro showing the story
 * Plays after loading, before menu
 */
export default class IntroVideoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroVideoScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.canSkip = false;
        this.isInMenu = false;
        this.currentStage = 0; // Start at 0 for click-to-start screen
        
        // Create frame dimensions (80% of screen size, centered)
        this.frameWidth = width * 0.8;
        this.frameHeight = height * 0.8;
        this.frameX = width / 2;
        this.frameY = height / 2;
        
        // Show click-to-start screen first (required for audio)
        this.showClickToStart();
    }
    
    showClickToStart() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Black background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Title text
        const titleText = this.add.text(width / 2, height / 2 - 50, 'CLICK TO START', {
            font: 'bold 48px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 3
        });
        titleText.setOrigin(0.5);
        
        // Subtitle
        const subtitleText = this.add.text(width / 2, height / 2 + 20, 'Press any key or click anywhere', {
            font: '20px Courier',
            fill: '#00aa00'
        });
        subtitleText.setOrigin(0.5);
        
        // Pulse animation
        this.tweens.add({
            targets: [titleText, subtitleText],
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Make entire screen clickable
        const clickZone = this.add.rectangle(0, 0, width, height, 0x000000, 0.01).setOrigin(0);
        clickZone.setInteractive({ useHandCursor: true });
        
        clickZone.once('pointerdown', () => {
            titleText.destroy();
            subtitleText.destroy();
            clickZone.destroy();
            this.startStage1();
        });
        
        // Also allow any key press
        this.input.keyboard.once('keydown', () => {
            titleText.destroy();
            subtitleText.destroy();
            clickZone.destroy();
            this.startStage1();
        });
    }
    
    startStage1() {
        console.log('IntroVideo: Stage 1 - Village pan');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Black background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Create frame border (purple/tech style)
        const frameBorder = this.add.rectangle(this.frameX, this.frameY, this.frameWidth, this.frameHeight);
        frameBorder.setStrokeStyle(4, 0x9b59b6);
        frameBorder.setFillStyle(0x000000, 1);
        
        // Create mask for content to stay within frame
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            this.frameX - this.frameWidth / 2,
            this.frameY - this.frameHeight / 2,
            this.frameWidth,
            this.frameHeight
        );
        const mask = maskShape.createGeometryMask();
        
        // Load and display pixel village image (panning) - fit to frame
        this.villageImage = this.add.image(
            this.frameX - this.frameWidth / 2,
            this.frameY,
            'pixel_village'
        );
        this.villageImage.setOrigin(0, 0.5);
        
        // Scale to fit frame height
        const scaleToFit = this.frameHeight / this.villageImage.height;
        this.villageImage.setScale(scaleToFit);
        this.villageImage.setMask(mask);
        
        // Start background music immediately at quiet volume (now that user has interacted with page)
        this.bgMusic = this.sound.add('happy_village', { 
            loop: true, 
            volume: 0.1 // Start at quiet volume immediately (no fade-in)
        });
        this.bgMusic.play();
        
        // Pan slowly - only move 30% of the image width instead of the full width
        const panDuration = 25000; // Keep original 25 second duration
        const panDistance = this.villageImage.displayWidth * 0.3; // Only pan 30% of image width
        
        this.tweens.add({
            targets: this.villageImage,
            x: this.frameX - this.frameWidth / 2 - panDistance,
            duration: panDuration,
            ease: 'Linear'
        });
        
        // Wait 2 seconds before starting narration
        this.time.delayedCall(2000, () => {
            // Play opening narration after 2 second delay
            const openingNarration = this.sound.add('intro_opening_narration', { volume: 0.8 });
            openingNarration.play();
            
            // When narration finishes, enable skip and wait 1.5 seconds before moving to stage 2
            openingNarration.once('complete', () => {
                this.canSkip = true;
                this.showSkipButton();
                
                // Auto-proceed to stage 2 after 1.5 second buffer
                this.time.delayedCall(1500, () => {
                    this.startStage2();
                });
            });
        });
    }
    
    startStage2() {
        console.log('IntroVideo: Stage 2 - Phishing email with animated cursor');
        this.currentStage = 2;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Clear stage 1
        if (this.villageImage) this.villageImage.destroy();
        
        // Maintain black background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Maintain frame border (purple/tech style)
        const frameBorder = this.add.rectangle(this.frameX, this.frameY, this.frameWidth, this.frameHeight);
        frameBorder.setStrokeStyle(4, 0x9b59b6);
        frameBorder.setFillStyle(0x000000, 1);
        
        // Show phishing email image - fit to frame
        this.phishingEmail = this.add.image(this.frameX, this.frameY, 'phishing_image');
        this.phishingEmail.setOrigin(0.5);
        
        // Scale to fit frame
        const emailScale = Math.min(
            this.frameWidth / this.phishingEmail.width,
            this.frameHeight / this.phishingEmail.height
        );
        this.phishingEmail.setScale(emailScale);
        
        // Create animated mouse cursor - purple with black outline
        const cursorGraphics = this.add.graphics();
        
        // Draw black outline first (slightly larger)
        cursorGraphics.fillStyle(0x000000, 1);
        cursorGraphics.fillTriangle(0, 0, 0, 22, 16, 16); // Black outline arrow
        
        // Draw purple arrow on top
        cursorGraphics.fillStyle(0x9b59b6, 1); // Purple color matching frame
        cursorGraphics.fillTriangle(1, 1, 1, 20, 14, 14); // Purple arrow (slightly smaller for outline effect)
        
        cursorGraphics.setDepth(20);
        
        // Start cursor off-screen (top left of frame)
        const startX = this.frameX - this.frameWidth / 2 + 50;
        const startY = this.frameY - this.frameHeight / 2 + 50;
        cursorGraphics.setPosition(startX, startY);
        
        // Target position (center of frame - where the phishing link would be)
        const targetX = this.frameX;
        const targetY = this.frameY + 50;
        
        // Animate cursor moving to the phishing link
        this.tweens.add({
            targets: cursorGraphics,
            x: targetX,
            y: targetY,
            duration: 2000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Cursor "clicks" - flash effect
                this.tweens.add({
                    targets: cursorGraphics,
                    alpha: 0,
                    duration: 100,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        // After click animation, wait a moment then move to stage 3
                        this.time.delayedCall(500, () => {
                            cursorGraphics.destroy();
                            if (this.bgMusic) {
                                this.bgMusic.stop();
                            }
                            this.startStage3();
                        });
                    }
                });
            }
        });
    }
    
    startStage3() {
        console.log('IntroVideo: Stage 3 - Dragon appears');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Clear stage 2
        if (this.phishingEmail) this.phishingEmail.destroy();
        
        // Stop background music when dragon enters
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        // Black background (no phishing image)
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Maintain frame border (purple/tech style)
        const frameBorder = this.add.rectangle(this.frameX, this.frameY, this.frameWidth, this.frameHeight);
        frameBorder.setStrokeStyle(4, 0x9b59b6);
        frameBorder.setFillStyle(0x000000, 1);
        
        // Create red glow around dragon (circular gradient)
        const glowGraphics = this.add.graphics();
        glowGraphics.setDepth(5); // Behind dragon
        
        // Draw multiple circles with decreasing alpha for glow effect
        for (let i = 20; i > 0; i--) {
            const radius = (i / 20) * 150; // Max radius of 150
            const alpha = (1 - i / 20) * 0.6; // Fade out towards edges
            glowGraphics.fillStyle(0xff0000, alpha); // Red color
            glowGraphics.fillCircle(this.frameX, this.frameY, radius);
        }
        glowGraphics.setAlpha(0);
        
        // Create dragon sprite (flying animation) - fit to frame
        this.dragon = this.add.sprite(this.frameX, this.frameY, 'dragon');
        
        // Scale dragon to fit nicely in frame
        const dragonScale = Math.min(this.frameWidth / 200, this.frameHeight / 200);
        this.dragon.setScale(dragonScale);
        this.dragon.setAlpha(0);
        this.dragon.setDepth(10); // Above glow
        this.dragon.play('dragon_idle'); // Start dragon animation immediately
        
        // Play dragon laugh sound IMMEDIATELY as dragon starts to appear
        this.sound.play('dragon_hit', { volume: 0.9 });
        
        // Fade in dragon and glow together
        this.tweens.add({
            targets: [this.dragon, glowGraphics],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // After fade-in completes, wait then move to stage 4
                this.time.delayedCall(1500, () => {
                    this.startStage4();
                });
            }
        });
    }
    
    startStage4() {
        console.log('IntroVideo: Stage 4 - Character crying');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Clear ALL children from previous stages
        this.children.removeAll(true);
        
        console.log('IntroVideo: All previous stage elements cleared');
        
        // Black background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        console.log('IntroVideo: Creating character crying image');
        
        // Create character crying sprite (NOT image) - so we can play animation
        this.characterCry = this.add.sprite(this.frameX, this.frameY, 'character_cry');
        this.characterCry.setOrigin(0.5);
        
        // Make character smaller - scale to fit nicely in frame
        const cryScale = Math.min(
            (this.frameWidth * 0.4) / this.characterCry.width,
            (this.frameHeight * 0.4) / this.characterCry.height
        );
        this.characterCry.setScale(cryScale);
        
        // Play the cry animation (looping)
        this.characterCry.play('cry_animation');
        console.log('IntroVideo: Cry animation started');
        
        console.log('IntroVideo: Playing explanation narration');
        
        // Play explanation narration using add() with autoplay
        const explanationNarration = this.sound.add('intro_explanation_narration', { volume: 0.8 });
        
        // Listen for complete event BEFORE playing
        explanationNarration.once('complete', () => {
            console.log('IntroVideo: Narration complete, going to menu in 1 second');
            this.time.delayedCall(1000, () => {
                this.goToMenu();
            });
        });
        
        // Now play it
        explanationNarration.play();
        console.log('IntroVideo: Narration audio playing');
        
        // Fallback: if audio fails or doesn't complete, go to menu after 20 seconds (enough time for full narration)
        this.time.delayedCall(20000, () => {
            if (!this.isInMenu) {
                console.log('IntroVideo: Fallback timeout - going to menu');
                this.goToMenu();
            }
        });
    }
    
    showSkipButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Skip button
        const skipButton = this.add.rectangle(width - 100, height - 40, 150, 50, 0x000000, 0.7);
        skipButton.setInteractive({ useHandCursor: true });
        skipButton.setDepth(1000);
        
        const skipText = this.add.text(width - 100, height - 40, 'SKIP', {
            font: 'bold 20px Courier',
            fill: '#ffffff'
        });
        skipText.setOrigin(0.5);
        skipText.setDepth(1001);
        
        skipButton.on('pointerover', () => {
            skipButton.setFillStyle(0x333333, 0.9);
            skipText.setScale(1.1);
        });
        
        skipButton.on('pointerout', () => {
            skipButton.setFillStyle(0x000000, 0.7);
            skipText.setScale(1);
        });
        
        skipButton.on('pointerdown', () => {
            this.goToMenu();
        });
        
        // Store references
        this.skipButton = skipButton;
        this.skipText = skipText;
        
        // Also allow SPACE or ESC to skip
        this.input.keyboard.once('keydown-SPACE', () => {
            if (this.canSkip) this.goToMenu();
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            if (this.canSkip) this.goToMenu();
        });
    }
    
    goToMenu() {
        console.log('IntroVideo: Going to menu');
        
        this.isInMenu = true;
        
        // Stop only intro narration audio, not all sounds
        const narration = this.sound.getAll().find(sound => sound.key === 'intro_explanation_narration');
        if (narration) {
            narration.stop();
        }
        
        // Go to menu scene
        this.scene.start('MenuScene');
    }
}
