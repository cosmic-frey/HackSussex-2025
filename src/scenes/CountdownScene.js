import Phaser from 'phaser';

// CountdownScene - 3-2-1-GO countdown before game starts
// Shows player dancing with scrolling ground
 
export default class CountdownScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CountdownScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'medium';
        this.tokensFromLevel1 = data.tokensFromLevel1 || 0;
        this.nextScene = data.nextScene || 'GameScene'; // Which scene to start after countdown
        
        // Get scroll speed for ground animation
        this.difficultySettings = {
            easy: { scrollSpeed: 100 },
            medium: { scrollSpeed: 150 },
            hard: { scrollSpeed: 200 }
        };
        
        this.settings = this.difficultySettings[this.difficulty];
        
        // Flag to prevent double transition
        this.hasTransitioned = false;
        
        console.log('CountdownScene init with difficulty:', this.difficulty, 'nextScene:', this.nextScene);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Different background for Level 2
        if (this.nextScene === 'Level2Scene') {
            // Black background for Level 2
            this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        } else {
            // Sky blue for Level 1
            this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);
        }
        
        // Ground - scrolling tiled sprite at bottom (SAME AS GAMESCENE)
        if (this.nextScene !== 'Level2Scene') {
            this.ground = this.add.tileSprite(0, height - 100, width, 100, 'ground_placeholder').setOrigin(0);
            this.ground.setDepth(10);
        }
        
        // Position player at top of ground boundary (SAME AS GAMESCENE)
        const groundY = height - 115;
        
        // Player dancing at same position
        this.player = this.add.sprite(100, groundY, 'player_dance');
        this.player.setDepth(5); // In front of ground
        this.player.setScale(2); // 2x bigger
        this.player.setOrigin(0.5, 1); // Origin at bottom center for proper ground placement
        this.player.play('dance');
        
        // Countdown text with 3D outlined effect
        const textColor = this.nextScene === 'Level2Scene' ? '#00ff00' : '#ffff00';
        this.countdownText = this.add.text(width / 2, height / 2 - 100, '3', {
            font: 'bold 140px Courier',
            fill: textColor,
            stroke: '#000000',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 0,
                fill: true
            }
        });
        this.countdownText.setOrigin(0.5);
        this.countdownText.setDepth(20);
        
        // Countdown sequence
        // 3D effect with yellow writing and black outline
        this.countdown = 3;
        
        this.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            repeat: 2  // Only repeat 2 times (3 total calls: 2→1→GO)
        });
    }

    update(time, delta) {
        // Scroll the ground (SAME AS GAMESCENE) - only for Level 1
        if (this.ground) {
            this.ground.tilePositionX += this.settings.scrollSpeed * (delta / 1000);
        }
    }
    
    updateCountdown() {
        this.countdown--;
        
        const textColor = this.nextScene === 'Level2Scene' ? '#00ff00' : '#ffff00';
        
        if (this.countdown > 0) {
            // Show countdown number
            this.countdownText.setText(this.countdown.toString());
            this.countdownText.setFill(textColor);
            
            // Scale animation
            this.countdownText.setScale(0.5);
            this.tweens.add({
                targets: this.countdownText,
                scale: 1.2,
                duration: 300,
                ease: 'Back.easeOut'
            });
        } else {
            // Show GO!
            this.countdownText.setText('GO!');
            this.countdownText.setFill(textColor);
            
            // 3D spin and disappear animation
            this.countdownText.setScale(0.5);
            this.tweens.add({
                targets: this.countdownText,
                scale: 1.8,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            // Spin and fade out animation
            this.tweens.add({
                targets: this.countdownText,
                rotation: Math.PI * 4, // Spin 2 full rotations
                alpha: 0,
                duration: 800,
                delay: 300,
                ease: 'Power1.easeIn',
                onComplete: () => {
                    // Start the next scene (Level 1 or Level 2)
                    if (this.nextScene === 'Level2Scene') {
                        this.scene.start('Level2Scene', { 
                            difficulty: this.difficulty,
                            tokensFromLevel1: this.tokensFromLevel1
                        });
                    } else {
                        this.scene.start('GameScene', { 
                            difficulty: this.difficulty 
                        });
                    }
                }
            });
        }
    }
}
