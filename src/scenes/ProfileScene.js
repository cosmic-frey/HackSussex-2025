import Phaser from 'phaser';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';

/**
 * ProfileScene - User profile with stats and achievements
 */
export default class ProfileScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ProfileScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const user = AuthService.getUser();

        if (!user) {
            this.scene.start('MenuScene');
            return;
        }

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 50, 'PLAYER PROFILE', {
            font: 'bold 48px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // User avatar placeholder (circle)
        const avatarCircle = this.add.circle(width / 2, 150, 50, 0x3498db);
        avatarCircle.setStrokeStyle(4, 0xffffff);

        // Try to load actual avatar if available
        if (user.picture) {
            this.load.image('user-avatar', user.picture);
            this.load.once('complete', () => {
                avatarCircle.destroy();
                const avatar = this.add.image(width / 2, 150, 'user-avatar');
                avatar.setDisplaySize(100, 100);
                avatar.setOrigin(0.5);
                
                // Make it circular
                const mask = this.make.graphics();
                mask.fillStyle(0xffffff);
                mask.fillCircle(width / 2, 150, 50);
                avatar.setMask(mask.createGeometryMask());
            });
            this.load.start();
        }

        // User name
        this.add.text(width / 2, 230, AuthService.getUserName(), {
            font: 'bold 28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Email
        if (user.email) {
            this.add.text(width / 2, 265, user.email, {
                font: '16px Arial',
                fill: '#888888'
            }).setOrigin(0.5);
        }

        // Stats section
        this.add.text(width / 2, 310, 'YOUR BEST SCORES', {
            font: 'bold 24px Arial',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Loading text
        const loadingText = this.add.text(width / 2, 360, 'Loading stats...', {
            font: '18px Arial',
            fill: '#888888'
        }).setOrigin(0.5);

        // Load user stats
        ApiService.getUserScores().then(result => {
            loadingText.destroy();

            if (result && result.data && result.data.length > 0) {
                let y = 360;
                result.data.forEach(score => {
                    // Difficulty badge
                    const diffColor = score.difficulty === 'easy' ? 0x27ae60 : 
                                     score.difficulty === 'medium' ? 0xf39c12 : 0xe74c3c;
                    
                    this.add.rectangle(width / 2 - 150, y, 100, 30, diffColor);
                    this.add.text(width / 2 - 150, y, score.difficulty.toUpperCase(), {
                        font: 'bold 16px Arial',
                        fill: '#ffffff'
                    }).setOrigin(0.5);

                    // Score
                    this.add.text(width / 2, y, `Score: ${score.score.toFixed(2)}`, {
                        font: 'bold 20px Arial',
                        fill: '#00ff00'
                    }).setOrigin(0.5);

                    // Rank
                    this.add.text(width / 2 + 150, y, `Rank #${score.rank}`, {
                        font: '18px Arial',
                        fill: '#f1c40f'
                    }).setOrigin(0.5);

                    y += 45;
                });
            } else {
                this.add.text(width / 2, 360, 'No scores yet. Play to set your record!', {
                    font: '18px Arial',
                    fill: '#888888'
                }).setOrigin(0.5);
            }
        }).catch(error => {
            loadingText.setText('Failed to load stats');
            console.error('Error loading user stats:', error);
        });

        // Back button
        this.createButton(width / 2, height - 80, 'BACK TO MENU', 0x95a5a6, () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 250, 50, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => {
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', callback);
    }
}
