import Phaser from 'phaser';
import AuthService from '../services/AuthService.js';

/**
 * MenuScene - Main menu with difficulty selection
 * Players choose Easy, Medium, or Hard before starting
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // High-tech dark background
        this.add.rectangle(0, 0, width, height, 0x0a0e27).setOrigin(0);
        
        // Animated grid pattern for cyberpunk feel
        for (let i = 0; i < 20; i++) {
            const line = this.add.line(0, (i * height) / 20, 0, 0, width, 0, 0x9b59b6, 0.05);
        }
        
        // Vertical lines for grid effect
        for (let i = 0; i < 30; i++) {
            const line = this.add.line((i * width) / 30, 0, 0, height, 0, height, 0x9b59b6, 0.05);
        }
        
        // Title with neon effect
        const title = this.add.text(width / 2, 60, 'PASSWORD QUEST', {
            font: 'bold 72px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#9b59b6',
                blur: 20,
                fill: true
            }
        });
        title.setOrigin(0.5);
        
        // Neon glow animation for title
        this.tweens.add({
            targets: title,
            shadowBlur: 30,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Subtitle with tech style
        const subtitle = this.add.text(width / 2, 145, '[ RECOVER YOUR STOLEN LOGIN CREDENTIALS ]', {
            font: 'bold 18px Courier',
            fill: '#00aa00',
            stroke: '#003300',
            strokeThickness: 1
        });
        subtitle.setOrigin(0.5);
        
        // Mission briefing box with tech borders
        const briefingBg = this.add.rectangle(width / 2, 240, 700, 130, 0x1a2d3a, 0.8);
        briefingBg.setStrokeStyle(2, 0x9b59b6);
        
        const story = this.add.text(width / 2, 240, 
            '> MISSION BRIEFING\n\n' +
            '• A ROGUE DRAGON HAS ENCRYPTED YOUR CREDENTIALS\n' +
            '• COLLECT PASSWORD TOKENS\n' +
            '• NEUTRALIZE SHADOW THREATS\n' +
            '• DEFEAT THE BOSS TO RECOVER YOUR DATA', {
            font: '14px Courier',
            fill: '#00ff00',
            align: 'center',
            lineSpacing: 8
        });
        story.setOrigin(0.5);
        
        // Control panel section
        const controlsTitle = this.add.text(width / 2, 340, '[ SYSTEM CONTROLS ]', {
            font: 'bold 18px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 1
        });
        controlsTitle.setOrigin(0.5);
        
        const controls = this.add.text(width / 2, 380, 
            'JUMP: UP ARROW | W KEY\n' +
            'SPACEBAR: CAST SPELL TO DESTROY SHADOW THREATS', {
            font: 'bold 16px Courier',
            fill: '#00ff00',
            align: 'center',
            lineSpacing: 10
        });
        controls.setOrigin(0.5);
        
        // Difficulty selection title
        const difficultyText = this.add.text(width / 2, 440, '[ SELECT SYSTEM DIFFICULTY ]', {
            font: 'bold 18px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 1
        });
        difficultyText.setOrigin(0.5);
        
        // Difficulty buttons with neon styling
        this.createNeonButton(width / 2 - 220, 510, 'EASY', '#2ecc71', () => {
            this.startGame('easy');
        });
        
        this.createNeonButton(width / 2, 510, 'MEDIUM', '#f39c12', () => {
            this.startGame('medium');
        });
        
        this.createNeonButton(width / 2 + 220, 510, 'HARD', '#e74c3c', () => {
            this.startGame('hard');
        });
        
        // Auth0 Login/Logout button
        const authButtonX = width - 100;
        const authButtonY = 40;
        
        if (AuthService.isUserAuthenticated()) {
            const user = AuthService.getUser();
            const userEmail = user?.email || 'User';
            
            this.add.text(authButtonX - 80, authButtonY, `Logged in: ${userEmail}`, {
                font: '12px Courier',
                fill: '#00ff00'
            }).setOrigin(1, 0);
            
            this.createNeonButton(authButtonX, authButtonY + 25, 'LOGOUT', '#e74c3c', async () => {
                await AuthService.logout();
                location.reload();
            });
        } else {
            this.createNeonButton(authButtonX, authButtonY, 'LOGIN', '#3498db', async () => {
                try {
                    await AuthService.login();
                    location.reload();
                } catch (error) {
                    console.error('Login failed:', error);
                }
            });
        }
        
        // Warning alert
        const warningBox = this.add.rectangle(width / 2, 620, 600, 50, 0x8b0000, 0.3);
        warningBox.setStrokeStyle(2, 0xff0000);
        
        const warning = this.add.text(width / 2, 620, 
            '⚠️ ALERT: SHADOW ENTITIES WILL STEAL YOUR PASSWORD TOKENS', {
            font: 'bold 13px Courier',
            fill: '#ff0000',
            stroke: '#660000',
            strokeThickness: 1
        });
        warning.setOrigin(0.5);
        
        // Pulsing alert indicator
        this.tweens.add({
            targets: warningBox,
            alpha: 0.5,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        
        // Footer with system info
        const footer = this.add.text(width / 2, height - 20, 
            '>> SYSTEM LOADED | PHASER 3 ENGINE | AWAITING COMMAND', {
            font: '11px Courier',
            fill: '#00aa00'
        });
        footer.setOrigin(0.5);
    }
    
    /**
     * Creates a neon-styled button with high-tech feel
     */
    createNeonButton(x, y, text, color, callback) {
        // Outer glow rectangle
        const glowBg = this.add.rectangle(x, y, 200, 60, color, 0.2);
        glowBg.setStrokeStyle(2, color);
        
        // Main button
        const button = this.add.rectangle(x, y, 180, 50, 0x0a0e27);
        button.setStrokeStyle(2, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 16px Courier',
            fill: color,
            stroke: color,
            strokeThickness: 1
        });
        buttonText.setOrigin(0.5);
        
        // Hover effects with neon glow
        button.on('pointerover', () => {
            glowBg.setStrokeStyle(3, color);
            button.setStrokeStyle(3, color);
            buttonText.setScale(1.1);
            this.tweens.add({
                targets: glowBg,
                alpha: 0.5,
                duration: 200
            });
        });
        
        button.on('pointerout', () => {
            glowBg.setStrokeStyle(2, color);
            button.setStrokeStyle(2, color);
            buttonText.setScale(1);
            this.tweens.add({
                targets: glowBg,
                alpha: 0.2,
                duration: 200
            });
        });
        
        button.on('pointerdown', () => {
            buttonText.setScale(0.9);
            this.tweens.add({
                targets: [button, glowBg],
                alpha: 0,
                duration: 300,
                onComplete: callback
            });
        });
        
        return { glowBg, button, buttonText };
    }
    
    /**
     * Starts the game with selected difficulty
     */
    startGame(difficulty) {
        console.log(`MenuScene: Starting game with ${difficulty} difficulty`);
        
        // Pass difficulty to Level1IntroScene first
        this.scene.start('Level1IntroScene', { difficulty });
    }
}
