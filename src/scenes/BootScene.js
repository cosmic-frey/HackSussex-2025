import Phaser from 'phaser';

/**
 * BootScene - Initial scene that sets up the game
 * Displays a stylish loading screen before transitioning to PreloadScene
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        console.log('BootScene: Game initialized');
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Beautiful gradient background
        this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);
        
        // Animated grid pattern background
        for (let i = 0; i < 5; i++) {
            const line = this.add.line(0, i * (height / 5), 0, 0, width, 0, 0x9b59b6, 0.1);
        }
        
        // Logo/Title
        const title = this.add.text(width / 2, height / 4 - 60, 'PASSWORD QUEST', {
            font: 'bold 72px Arial',
            fill: '#87CEEB',
            stroke: '#9b59b6',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        });
        title.setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 40, 'Recover Your Stolen Credentials', {
            font: 'italic 24px Arial',
            fill: '#f1c40f'
        });
        subtitle.setOrigin(0.5);
        
        // Player character dancing (placeholder for now - will show once assets load)
        const player = this.add.image(width / 2, height / 2 + 40, 'playerchar_placeholder');
        player.setScale(4);
        
        // Floating animation for player
        this.tweens.add({
            targets: player,
            y: player.y + 20,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Loading text
        const loadingText = this.add.text(width / 2, height - 120, 'Initializing...', {
            font: 'bold 20px Arial',
            fill: '#2ecc71'
        });
        loadingText.setOrigin(0.5);
        
        // Animated loading bar background
        const barBg = this.add.rectangle(width / 2, height - 60, 300, 30, 0x2c3e50, 0.8);
        barBg.setOrigin(0.5);
        
        // Animated loading bar
        const bar = this.add.rectangle(width / 2 - 150, height - 60, 0, 30, 0x9b59b6);
        bar.setOrigin(0, 0.5);
        
        // Animate the loading bar
        this.tweens.add({
            targets: bar,
            width: 300,
            duration: 2000,
            ease: 'Power2.easeInOut',
            onComplete: () => {
                loadingText.setText('Loading Assets...');
            }
        });
        
        // Pulsing corner elements
        const cornerSize = 40;
        const topLeft = this.add.rectangle(20, 20, cornerSize, cornerSize, 0x9b59b6, 0.3);
        const topRight = this.add.rectangle(width - 20, 20, cornerSize, cornerSize, 0x9b59b6, 0.3);
        const bottomLeft = this.add.rectangle(20, height - 20, cornerSize, cornerSize, 0x9b59b6, 0.3);
        const bottomRight = this.add.rectangle(width - 20, height - 20, cornerSize, cornerSize, 0x9b59b6, 0.3);
        
        [topLeft, topRight, bottomLeft, bottomRight].forEach(corner => {
            this.tweens.add({
                targets: corner,
                alpha: 0.7,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        });
        
        // Transition to PreloadScene after delay
        this.time.delayedCall(3000, () => {
            this.scene.start('PreloadScene');
        });
    }
}
