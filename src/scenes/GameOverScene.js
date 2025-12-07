import Phaser from 'phaser';
import ApiService from '../services/api.js';
import AuthService from '../services/AuthService.js';

/**
 * GameOverScene - Victory or defeat screen
 * Shows final score and options to retry or return to menu
 */
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.victory = data.victory;
        this.difficulty = data.difficulty;
        this.finalScore = data.finalScore || 0;
        this.totalCoins = data.totalCoins || 0;
        this.bossKillTime = data.bossKillTime || 0;
        this.level1Coins = data.level1Coins || 0;
        this.level2Coins = data.level2Coins || 0;
        this.level2Alerts = data.level2Alerts || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        const bgColor = this.victory ? 0x27ae60 : 0xe74c3c;
        this.add.rectangle(0, 0, width, height, bgColor, 0.3).setOrigin(0);
        
        // Title
        const title = this.add.text(width / 2, 80, 
            this.victory ? 'VICTORY!' : 'DEFEAT', {
            font: 'bold 64px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Message
        const message = this.victory 
            ? 'You recovered your login credentials!'
            : 'The dragon kept your credentials...';
        
        this.add.text(width / 2, 160, message, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        if (this.victory) {
            // Final Score (large and prominent)
            this.add.text(width / 2, 220, 'FINAL SCORE', {
                font: 'bold 32px Arial',
                fill: '#f1c40f',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 270, this.finalScore.toFixed(2), {
                font: 'bold 48px Arial',
                fill: '#ffffff',
                stroke: '#f1c40f',
                strokeThickness: 4
            }).setOrigin(0.5);
            
            // Score breakdown
            this.add.text(width / 2, 330, 'BREAKDOWN', {
                font: 'bold 20px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 365, `Difficulty: ${this.difficulty.toUpperCase()}`, {
                font: '18px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 395, `Level 1 Password Tokens: ${this.level1Coins}`, {
                font: '18px Arial',
                fill: '#00ff00'
            }).setOrigin(0.5);
            
            // Level 2 coins with alert indicator
            const level2Text = this.level2Alerts >= 1 
                ? `Level 2 Password Tokens: ${this.level2Coins} ✓`
                : `Level 2 Password Tokens: ${this.level2Coins} (NOT COUNTED - No Alerts)`;
            const level2Color = this.level2Alerts >= 1 ? '#00ff00' : '#ff0000';
            
            this.add.text(width / 2, 425, level2Text, {
                font: '18px Arial',
                fill: level2Color
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 455, `Total Password Tokens: ${this.totalCoins}`, {
                font: 'bold 20px Arial',
                fill: '#f1c40f'
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 485, `Boss Kill Time: ${this.bossKillTime.toFixed(2)}s`, {
                font: '18px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 515, `Formula: ${this.totalCoins} ÷ ${this.bossKillTime.toFixed(2)} = ${this.finalScore.toFixed(2)}`, {
                font: '16px Arial',
                fill: '#aaaaaa'
            }).setOrigin(0.5);
        } else {
            // Defeat stats
            this.add.text(width / 2, 250, 'STATS', {
                font: 'bold 24px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 300, `Difficulty: ${this.difficulty.toUpperCase()}`, {
                font: '20px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            this.add.text(width / 2, 330, 'Better luck next time!', {
                font: '18px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }
        
        // Buttons
        const buttonY = this.victory ? 570 : 400;
        
        if (this.victory) {
            // Submit score to backend if user is authenticated
            if (AuthService.isUserAuthenticated()) {
                this.submitVictoryScore();
            }
            
            // Victory - show Continue button to resources page
            this.createButton(width / 2 - 120, buttonY, 'CONTINUE', 0x2ecc71, () => {
                this.scene.start('EndResourcesScene', {
                    victory: this.victory,
                    difficulty: this.difficulty,
                    finalScore: this.finalScore,
                    totalCoins: this.totalCoins
                });
            });
            
            this.createButton(width / 2 + 120, buttonY, 'RETRY', 0x3498db, () => {
                this.scene.start('MenuScene');
            });
        } else {
            // Defeat - show Retry and Main Menu
            this.createButton(width / 2, buttonY, 'RETRY', 0x3498db, () => {
                this.scene.start('MenuScene');
            });
            
            this.createButton(width / 2, buttonY + 70, 'MAIN MENU', 0x95a5a6, () => {
                this.scene.start('MenuScene');
            });
        }
    }
    
    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 200, 50, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        
        button.on('pointerover', () => {
            button.setFillStyle(color, 0.8);
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(color, 1);
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', callback);
    }
    
    /**
     * Submit victory score to backend
     */
    async submitVictoryScore() {
        try {
            if (!AuthService.isUserAuthenticated()) {
                console.warn('User not authenticated, cannot submit score');
                return;
            }

            const scoreData = {
                difficulty: this.difficulty,
                score: this.finalScore,
                totalCoins: this.totalCoins,
                bossKillTime: this.bossKillTime,
                level1Coins: this.level1Coins,
                level2Coins: this.level2Coins,
                level2Alerts: this.level2Alerts
            };
            
            console.log('Submitting score:', scoreData);
            const response = await ApiService.submitScore(scoreData);
            console.log('✓ Score submitted:', response);
        } catch (error) {
            console.error('Failed to submit score:', error);
            // Don't block gameplay if score submission fails
        }
    }
}
