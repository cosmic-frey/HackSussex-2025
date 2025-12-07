import Phaser from 'phaser';

/**
 * Level2IntroScene - Instructions before Level 2 (Breach Space)
 */
export default class Level2IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2IntroScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'medium';
        this.tokensFromLevel1 = data.tokens || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Stop Level 1 music if still playing
        if (this.sound.get('level1_music')) {
            this.sound.get('level1_music').stop();
        }
        
        // Start Level 2 background music (quieter than sound effects)
        if (this.sound.get('level2_music')) {
            this.sound.get('level2_music').stop();
        }
        this.bgMusic = this.sound.add('level2_music', { 
            loop: true, 
            volume: 0.3  // Background music quieter than sound effects
        });
        this.bgMusic.play();
        
        // Black background with glitch effect
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Glitch lines
        for (let i = 0; i < 20; i++) {
            const line = this.add.rectangle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(50, 200),
                2,
                0xff0000,
                0.3
            );
            this.tweens.add({
                targets: line,
                alpha: 0,
                duration: Phaser.Math.Between(100, 500),
                repeat: -1,
                yoyo: true
            });
        }
        
        // Title with glitch effect
        const title = this.add.text(width / 2, 80, 'LEVEL 2: ENTERING THE BREACH', {
            font: 'bold 48px Courier',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Glitch the title
        this.tweens.add({
            targets: title,
            x: width / 2 + Phaser.Math.Between(-5, 5),
            duration: 100,
            repeat: -1,
            yoyo: true
        });
        
        // Motto
        const motto = this.add.text(width / 2, 140, '"DAMAGE CAN BE REVERSED IF YOU ACT FAST!"', {
            font: 'bold 20px Courier',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        });
        motto.setOrigin(0.5);
        
        // Instructions
        const instructions = [
            'OBJECTIVE:',
            'Avoid phishing emails whilst collecting coins',
            'and warn others by collecting warning signals!',
            '',
            'CONTROLS:',
            'CLICK or TAP - Fly upward',
            '',
            'COLLECT:',
            '🪙 Coins - Increase your score',
            '❗ Warning Signals - Every 5 = +1 spell for boss fight',
            '',
            'AVOID:',
            '👤 Shadow People - Lose ALL warnings on contact!',
            '⚠️ Need at least 1 warning to count Level 2 coins!',
            '',
            `Password Tokens from Level 1: ${this.tokensFromLevel1}`
        ];
        
        let yPos = 200;
        instructions.forEach(line => {
            const style = line.includes('OBJECTIVE') || line.includes('CONTROLS') || line.includes('COLLECT') || line.includes('AVOID')
                ? { font: 'bold 22px Courier', fill: '#ff0000' }
                : line.startsWith('❗') || line.startsWith('🪙')
                ? { font: '18px Courier', fill: '#ffff00' }
                : line.includes('Tokens from')
                ? { font: 'bold 20px Courier', fill: '#00ff00' }
                : { font: '18px Courier', fill: '#ffffff' };
            
            this.add.text(width / 2, yPos, line, style).setOrigin(0.5);
            yPos += line === '' ? 15 : 30;
        });
        
        // Create interactive button
        this.createButton(width / 2, height - 80, 'ENTER BREACH SPACE', 0xff0000, () => {
            this.startLevel2();
        });
        
        // Instruction text
        const instructionText = this.add.text(width / 2, height - 30, 'Click button or press SPACE', {
            font: '16px Courier',
            fill: '#00ff00'
        });
        instructionText.setOrigin(0.5);
        
        // Input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.startLevel2();
        }
    }

    startLevel2() {
        // Add countdown before Level 2 starts
        this.scene.start('CountdownScene', { 
            difficulty: this.difficulty,
            tokensFromLevel1: this.tokensFromLevel1,
            nextScene: 'Level2Scene'
        });
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 350, 60, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 26px Courier',
            fill: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        
        // Hover effects
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
        
        // Pulse animation with glitch effect
        this.tweens.add({
            targets: [button, buttonText],
            scale: 1.05,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Glitch effect
        this.tweens.add({
            targets: buttonText,
            x: x + Phaser.Math.Between(-2, 2),
            duration: 100,
            repeat: -1,
            yoyo: true
        });
    }
}
