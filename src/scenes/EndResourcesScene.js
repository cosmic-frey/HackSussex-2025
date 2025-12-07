import Phaser from 'phaser';

/**
 * EndResourcesScene - Educational resources and links after game completion
 */
export default class EndResourcesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndResourcesScene' });
    }

    init(data) {
        this.gameData = data;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Stop any previous music
        this.sound.stopAll();
        
        // Play end scene narration immediately at full volume
        this.sound.play('end_narration', { volume: 1.0 });
        
        // Background - gradient from dark blue to purple
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0e27, 0x0a0e27, 0x1a1a2e, 0x2d1b4e, 1);
        bg.fillRect(0, 0, width, height);
        
        // Title
        const title = this.add.text(width / 2, 60, 'CONGRATULATIONS!', {
            font: 'bold 56px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, 120, 'You\'ve completed Password Quest!', {
            font: 'bold 24px Courier',
            fill: '#9b59b6'
        });
        subtitle.setOrigin(0.5);
        
        // Section: Learn More
        const learnTitle = this.add.text(width / 2, 180, 'LEARN MORE ABOUT ONLINE SAFETY', {
            font: 'bold 28px Courier',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 3
        });
        learnTitle.setOrigin(0.5);
        
        // Educational links
        const links = [
            {
                title: 'BCS on Phishing Emails',
                url: 'https://www.bcs.org/articles-opinion-and-research/hook-line-and-sinker/',
                color: '#3498db'
            },
            {
                title: 'UK Government: Keep Young People Safe Online',
                url: 'https://www.gov.uk/government/publications/coronavirus-covid-19-keeping-children-safe-online/coronavirus-covid-19-support-for-parents-and-carers-to-keep-children-safe-online',
                color: '#e74c3c'
            },
            {
                title: 'NCSC: Stay Safe Online',
                url: 'https://www.ncsc.gov.uk/section/advice-guidance/you-your-family',
                color: '#2ecc71'
            },
            {
                title: 'BBC: How to Stay Scam Safe',
                url: 'https://www.bbc.co.uk/programmes/articles/58ByN3WgMLsXrpYTHv5pD5h/how-to-stay-scam-safe',
                color: '#9b59b6'
            }
        ];
        
        let yPos = 240;
        links.forEach(link => {
            this.createLink(width / 2, yPos, link.title, link.url, link.color);
            yPos += 60;
        });
        
        // Leaderboard button
        this.createButton(width / 2, yPos + 40, 'VIEW LEADERBOARD', '#f39c12', () => {
            // Open leaderboard in new tab
            window.open('/leaderboard.html', '_blank');
        });
        
        // Play Again button
        this.createButton(width / 2, yPos + 120, 'PLAY AGAIN', '#2ecc71', () => {
            this.sound.stopAll();
            this.scene.start('MenuScene');
        });
        
        // Footer
        const footer = this.add.text(width / 2, height - 30, 'Stay safe online!', {
            font: '18px Courier',
            fill: '#00ff00'
        });
        footer.setOrigin(0.5);
    }
    
    createLink(x, y, text, url, color) {
        // Link background
        const linkBg = this.add.rectangle(x, y, 700, 45, 0x1a1a2e, 0.8);
        linkBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color);
        linkBg.setInteractive({ useHandCursor: true });
        
        // Link text
        const linkText = this.add.text(x, y, text, {
            font: 'bold 18px Courier',
            fill: color
        });
        linkText.setOrigin(0.5);
        
        // Hover effects
        linkBg.on('pointerover', () => {
            linkBg.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.2);
            linkText.setScale(1.05);
            this.tweens.add({
                targets: linkText,
                x: x + 5,
                duration: 100
            });
        });
        
        linkBg.on('pointerout', () => {
            linkBg.setFillStyle(0x1a1a2e, 0.8);
            linkText.setScale(1);
            this.tweens.add({
                targets: linkText,
                x: x,
                duration: 100
            });
        });
        
        linkBg.on('pointerdown', () => {
            // Open link in new tab
            window.open(url, '_blank');
        });
        
        return { linkBg, linkText };
    }
    
    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 400, 60, Phaser.Display.Color.HexStringToColor(color).color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 24px Courier',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        buttonText.setOrigin(0.5);
        
        // Hover effects
        button.on('pointerover', () => {
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', callback);
        
        // Pulse animation
        this.tweens.add({
            targets: [button, buttonText],
            scale: 1.03,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return { button, buttonText };
    }
}
