import Phaser from 'phaser';

/**
 * HealthBar class - Visual health bar with color changes
 */
class HealthBar {
    constructor(scene, x, y, maxValue = 100) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.x = x;
        this.y = y;
        this.value = maxValue;
        this.maxValue = maxValue;
        this.width = 200;
        this.height = 20;
        this.p = (this.width - 4) / maxValue;
        this.draw();
        scene.add.existing(this.bar);
    }

    decrease(amount) {
        this.value -= amount;
        if (this.value < 0) {
            this.value = 0;
        }
        this.draw();
        return (this.value === 0);
    }

    setValue(value) {
        this.value = Math.max(0, Math.min(value, this.maxValue));
        this.draw();
    }

    draw() {
        this.bar.clear();
        
        // Background (black border)
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, this.width, this.height);
        
        // Inner background (white)
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Health bar color based on percentage
        const percent = this.value / this.maxValue;
        if (percent < 0.3) {
            this.bar.fillStyle(0xff0000); // Red when low
        } else if (percent < 0.6) {
            this.bar.fillStyle(0xffff00); // Yellow when medium
        } else {
            this.bar.fillStyle(0x00ff00); // Green when high
        }
        
        const barWidth = Math.floor(this.p * this.value);
        this.bar.fillRect(this.x + 2, this.y + 2, barWidth, this.height - 4);
    }

    destroy() {
        this.bar.destroy();
    }
}

/**
 * BossScene - Dragon boss fight
 * Boss health based on Level 1 performance
 */
export default class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        console.log(`✓ BossScene init called with data:`, data);
        this.difficulty = data.difficulty;
        this.tokensCollected = data.tokens || 0;
        this.level1Coins = data.level1Coins || 0;
        this.level2Coins = data.level2Coins || 0;
        this.level2Alerts = data.level2Alerts || 0;
        this.shadowsDestroyed = data.shadowsDestroyed || 0;
        this.shadowsHit = data.shadowsHit || 0;
        
        // Health bars based on difficulty (out of 10, 15, or 20)
        const maxHealth = { easy: 10, medium: 10, hard: 10 };
        
        // Dragon health starts at max for difficulty
        this.dragonMaxHealth = maxHealth[this.difficulty];
        this.dragonHealth = this.dragonMaxHealth;
        
        // Player health starts at max for difficulty
        this.playerMaxHealth = maxHealth[this.difficulty];
        this.playerHealth = this.playerMaxHealth;
        
        // Boss fight timer for scoring
        this.bossStartTime = 0;
        this.bossKillTime = 0;
        
        // Boss phase
        this.bossPhase = 1;
        
        console.log(`✓ BossScene: Dragon HP: ${this.dragonHealth}, Player HP: ${this.playerHealth}`);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        console.log(`✓ BossScene create called - width: ${width}, height: ${height}`);
        
        // Temporary dark background for intro
        this.cameras.main.setBackgroundColor(0x000000);
        
        // Boss intro text
        const introText = this.add.text(width / 2, height / 2 - 50, 'LEVEL 3: FINAL BATTLE', {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        introText.setOrigin(0.5);
        
        const subtitle = this.add.text(width / 2, height / 2 + 20, 'REGAIN YOUR INTERNET PRIVACY!', {
            font: 'bold 32px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            introText.destroy();
            subtitle.destroy();
            this.startBossFight();
        });
    }
    
    startBossFight() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // START BOSS TIMER FOR SCORING
        this.bossStartTime = this.time.now;
        console.log('Boss fight started - timer begins');
        
        // Continue Level 3 background music if not already playing
        if (!this.sound.get('level3_music') || !this.sound.get('level3_music').isPlaying) {
            this.bgMusic = this.sound.add('level3_music', { 
                loop: true, 
                volume: 0.3  // Background music quieter than sound effects
            });
            this.bgMusic.play();
        } else {
            this.bgMusic = this.sound.get('level3_music');
        }
        
        // Check if flares texture has frames (atlas) or is simple texture (fallback)
        const flaresTexture = this.textures.get('flares');
        this.flaresFrame = flaresTexture.has('white') ? 'white' : null;
        console.log('Flares texture frame:', this.flaresFrame ? 'white (atlas)' : 'none (fallback)');
        
        // Rocky lava background
        this.createLavaBackground(width, height);
        
        // Create podiums
        const podiumHeight = 80;
        const podiumWidth = 150;
        
        // Player podium (left side, on ground)
        const playerPodium = this.add.rectangle(150, height - podiumHeight / 2, podiumWidth, podiumHeight, 0x4a4a4a);
        playerPodium.setStrokeStyle(4, 0x2c2c2c);
        playerPodium.setDepth(1);
        
        // Dragon podium (right side, floating in air)
        const dragonPodiumY = 250;
        const dragonPodium = this.add.rectangle(width - 200, dragonPodiumY, podiumWidth, podiumHeight, 0x4a4a4a);
        dragonPodium.setStrokeStyle(4, 0x2c2c2c);
        dragonPodium.setDepth(1);
        
        // Create dragon sprite with animation
        this.dragonStartX = width - 200;
        this.dragonStartY = dragonPodiumY - 80;
        this.dragon = this.add.sprite(this.dragonStartX, this.dragonStartY, 'dragon');
        this.dragon.setScale(3);
        this.dragon.setDepth(5);
        this.dragon.play('dragon_idle');
        
        // Dragon stays on podium - animation provides the movement
        
        // No constant smoke around dragon - removed green smoke
        
        // Create player sprite - start with dance animation
        const playerY = height - podiumHeight - 32;
        this.playerStartX = 150;
        this.playerStartY = playerY;
        this.player = this.add.sprite(this.playerStartX, this.playerStartY, 'player_dance');
        this.player.setScale(2.5);
        this.player.setDepth(5);
        this.player.play('dance');
        
        // Player idle bobbing (subtle, standing on ground)
        this.playerBobTween = this.tweens.add({
            targets: this.player,
            y: this.player.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Health bars
        this.createHealthBars();
        
        // Turn-based combat system
        this.isPlayerTurn = true;
        this.spellsCastThisTurn = 0;
        this.spellsPerTurn = 2;
        this.canCastSpell = true;
        this.isCombatActive = true;
        this.playerDodgeReady = true;
        this.dragonDodgeChance = 0.3; // 30% chance dragon dodges
        
        // Input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        
        // Instructions
        this.turnIndicator = this.add.text(width / 2, height - 50, 'YOUR TURN - SPACE: cast spell | ↑/W: jump | ← →: dodge (2 spells)', {
            font: 'bold 16px Courier',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);
        
        this.dodgeIndicator = this.add.text(width / 2, height - 25, 'Jump/Dodge Ready!', {
            font: 'bold 14px Courier',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);
    }
    
    getParticleConfig(baseConfig) {
        // Add frame parameter only if flares texture has frames
        if (this.flaresFrame) {
            return { frame: this.flaresFrame, ...baseConfig };
        }
        return baseConfig;
    }
    
    createLavaBackground(width, height) {
        // Grey rocky background
        const bg = this.add.graphics();
        
        // Base grey rocky color
        bg.fillGradientStyle(0x3a3a3a, 0x3a3a3a, 0x2a2a2a, 0x2a2a2a, 1);
        bg.fillRect(0, 0, width, height);
        
        // Add rocky texture with random rectangles
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(20, 80);
            const darkness = Phaser.Math.FloatBetween(0.1, 0.4);
            
            bg.fillStyle(0x000000, darkness);
            bg.fillRect(x, y, size, size);
        }
        
        // No static cracks - we'll use animated fire instead!
        
        bg.setDepth(0);
        
        // Add MORE rocky texture (double the amount)
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(15, 60);
            const darkness = Phaser.Math.FloatBetween(0.2, 0.6);
            
            bg.fillStyle(0x000000, darkness);
            bg.fillRect(x, y, size, size);
        }
        
        // Add animated fire and flames if flares texture is available
        if (this.textures.exists('flares')) {
            // Create multiple fire emitters across the bottom
            for (let i = 0; i < 15; i++) {
                const fireX = (width / 15) * i + Phaser.Math.Between(-20, 20);
                const fireY = height - Phaser.Math.Between(0, 50);
                
                const fire = this.add.particles(fireX, fireY, 'flares', this.getParticleConfig({
                    color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
                    colorEase: 'quad.out',
                    lifespan: 2000,
                    angle: { min: -100, max: -80 },
                    scale: { start: 0.50, end: 0, ease: 'sine.out' },
                    speed: 80,
                    advance: 2000,
                    blendMode: 'ADD',
                    frequency: 100,
                    quantity: 1
                }));
                fire.setDepth(1);
            }
            
            // Add some larger flame pillars
            for (let i = 0; i < 5; i++) {
                const pillarX = Phaser.Math.Between(width * 0.1, width * 0.9);
                const pillarY = height - Phaser.Math.Between(10, 30);
                
                const flamePillar = this.add.particles(pillarX, pillarY, 'flares', this.getParticleConfig({
                    color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
                    colorEase: 'quad.out',
                    lifespan: 3000,
                    angle: { min: -110, max: -70 },
                    scale: { start: 0.80, end: 0, ease: 'sine.out' },
                    speed: { min: 100, max: 150 },
                    advance: 2000,
                    blendMode: 'ADD',
                    frequency: 80,
                    quantity: 2
                }));
                flamePillar.setDepth(1);
            }
            
            // Add FOREGROUND flames (in front of characters)
            for (let i = 0; i < 8; i++) {
                const fgFlameX = Phaser.Math.Between(width * 0.15, width * 0.85);
                const fgFlameY = height - Phaser.Math.Between(5, 20);
                
                const foregroundFlame = this.add.particles(fgFlameX, fgFlameY, 'flares', this.getParticleConfig({
                    color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
                    colorEase: 'quad.out',
                    lifespan: 2500,
                    angle: { min: -105, max: -75 },
                    scale: { start: 0.60, end: 0, ease: 'sine.out' },
                    speed: { min: 90, max: 130 },
                    advance: 2000,
                    blendMode: 'ADD',
                    frequency: 90,
                    quantity: 1
                }));
                foregroundFlame.setDepth(10); // In front of characters (depth 5)
            }
            
            // MUCH MORE VISIBLE lava bubbles rising from bottom
            const lavaBubbles = this.add.particles(0, height, 'flares', this.getParticleConfig({
                x: { min: 0, max: width },
                y: height + 20,
                lifespan: 4000,
                speedY: { min: -120, max: -60 },
                speedX: { min: -40, max: 40 },
                scale: { start: 1.5, end: 0.3, ease: 'Power2' },
                color: [0xff4500, 0xff6600, 0xffa500, 0xffaa00],
                colorEase: 'quad.out',
                alpha: { start: 1.0, end: 0 },
                blendMode: 'ADD',
                frequency: 80,
                quantity: 3
            }));
            lavaBubbles.setDepth(3);
            
            // Smokey effect (from Phaser fire effects example)
            const smokey = this.add.particles(0, height * 0.8, 'flares', this.getParticleConfig({
                x: { min: 0, max: width },
                y: { min: height * 0.6, max: height },
                color: [0x040d61, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404],
                lifespan: 1500,
                angle: { min: -100, max: -80 },
                scale: 0.75,
                speed: { min: 200, max: 300 },
                advance: 2000,
                blendMode: 'ADD',
                frequency: 150,
                quantity: 2
            }));
            smokey.setDepth(3);
            
            // MORE VISIBLE heat distortion particles
            const heatWaves = this.add.particles(0, height * 0.5, 'flares', this.getParticleConfig({
                x: { min: 0, max: width },
                y: { min: height * 0.3, max: height },
                lifespan: 3000,
                speedY: { min: -70, max: -30 },
                scale: { start: 0.8, end: 0 },
                color: [0xff6600, 0xff4500, 0xff8800, 0xffaa00],
                alpha: { start: 0.7, end: 0 },
                blendMode: 'ADD',
                frequency: 60,
                quantity: 3
            }));
            heatWaves.setDepth(3);
            
            // Add animated spark particles across the entire background (like Level 3 intro)
            const backgroundSparks = this.add.particles(0, 0, 'spark', {
                x: { min: 0, max: width },
                y: { min: 0, max: height },
                speed: { min: 20, max: 50 },
                scale: { start: 0.3, end: 0 },
                lifespan: 2000,
                blendMode: 'ADD',
                frequency: 100,
                tint: [0xff0000, 0xff4500, 0xff6347]  // Red, orange-red, tomato
            });
            backgroundSparks.setDepth(100);  // In front of everything so they're visible
            
            // Store references for dynamic effects
            this.smokeEmitter = smokey;
            this.heatEmitter = heatWaves;
        }
    }
    
    update() {
        if (!this.dragon || !this.isCombatActive) return;
        
        // Player attack (only on player's turn)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isPlayerTurn && this.canCastSpell) {
            this.playerCastSpell();
        }
        
        // Player can jump/dodge anytime during level 3
        if (this.playerDodgeReady) {
            if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.rightKey)) {
                this.playerDodge();
            } else if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
                this.playerJump();
            }
        }
        
        // No dragon smoke emitter anymore
        
        // Add extra smoke around whoever has lowest health
        if (this.textures.exists('flares') && this.time.now % 500 < 50) {
            const playerHealthPercent = this.playerHealth / this.playerMaxHealth;
            const dragonHealthPercent = this.dragonHealth / this.dragonMaxHealth;
            
            if (playerHealthPercent < dragonHealthPercent && playerHealthPercent < 0.5) {
                // Player is struggling - add smoke
                const strugglingSmoke = this.add.particles(this.player.x, this.player.y, 'flares', this.getParticleConfig({
                    lifespan: 2000,
                    speedY: { min: -40, max: -20 },
                    speedX: { min: -20, max: 20 },
                    scale: { start: 0.5, end: 1.2, ease: 'Cubic.easeOut' },
                    color: [0x666666, 0x444444],
                    alpha: { start: 0.4, end: 0 },
                    blendMode: 'NORMAL',
                    quantity: 3
                }));
                strugglingSmoke.setDepth(4);
                this.time.delayedCall(2000, () => strugglingSmoke.destroy());
            } else if (dragonHealthPercent < playerHealthPercent && dragonHealthPercent < 0.5) {
                // Dragon is struggling - add more smoke
                const strugglingSmoke = this.add.particles(this.dragon.x, this.dragon.y, 'flares', this.getParticleConfig({
                    lifespan: 2000,
                    speedY: { min: -40, max: -20 },
                    speedX: { min: -20, max: 20 },
                    scale: { start: 0.6, end: 1.4, ease: 'Cubic.easeOut' },
                    color: [0x666666, 0x444444],
                    alpha: { start: 0.5, end: 0 },
                    blendMode: 'NORMAL',
                    quantity: 4
                }));
                strugglingSmoke.setDepth(4);
                this.time.delayedCall(2000, () => strugglingSmoke.destroy());
            }
        }
        
        // Check phase transitions
        if (this.dragonHealth <= this.dragonMaxHealth * 0.5 && this.bossPhase === 1) {
            this.enterPhase2();
        }
        
        if (this.dragonHealth <= this.dragonMaxHealth * 0.25 && this.bossPhase === 2) {
            this.enterPhase3();
        }
    }
    
    createHealthBars() {
        const width = this.cameras.main.width;
        
        // Dragon health bar label
        this.add.text(width / 2, 20, 'DRAGON', {
            font: 'bold 20px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Create dragon health bar (centered, wider)
        this.dragonHealthBar = new HealthBar(this, width / 2 - 200, 45, this.dragonMaxHealth);
        this.dragonHealthBar.width = 400;
        this.dragonHealthBar.height = 25;
        this.dragonHealthBar.p = (400 - 4) / this.dragonMaxHealth;
        this.dragonHealthBar.setValue(this.dragonHealth);
        
        // Player health bar label
        this.add.text(20, 80, 'PLAYER', {
            font: 'bold 18px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        // Create player health bar
        this.playerHealthBar = new HealthBar(this, 20, 105, this.playerMaxHealth);
        this.playerHealthBar.setValue(this.playerHealth);
    }
    
    playerCastSpell() {
        if (!this.canCastSpell || !this.isPlayerTurn) return;
        
        this.canCastSpell = false;
        this.spellsCastThisTurn++;
        
        // Play spell casting sound (louder than background music)
        this.sound.play('spell_cast', { volume: 0.8 });
        
        // Check if dragon dodges
        const dragonDodges = Math.random() < this.dragonDodgeChance;
        
        // Pause bobbing and play spellcast animation
        this.playerBobTween.pause();
        this.player.setTexture('player_spellcast');
        this.player.play('spellcast');
        
        // Player moves forward during cast, then returns to start position
        this.tweens.add({
            targets: this.player,
            x: this.playerStartX + 60,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Return to starting position
                this.tweens.add({
                    targets: this.player,
                    x: this.playerStartX,
                    duration: 400,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        // Return to dance animation
                        this.player.setTexture('player_dance');
                        this.player.play('dance');
                        this.playerBobTween.resume();
                    }
                });
            }
        });
        
        // Dragon dodge animation (quick shift)
        if (dragonDodges) {
            this.tweens.add({
                targets: this.dragon,
                y: this.dragonStartY - 100,
                duration: 150,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        }
        
        // Each attack does 1 damage (if not dodged)
        const damage = dragonDodges ? 0 : 1;
        this.dragonHealth -= damage;
        
        // Update health bar
        this.dragonHealthBar.setValue(this.dragonHealth);
        
        // Create magic spell with gold, blue, white sparkles and lightning - NO GREEN
        const magicSpell = this.add.particles(this.player.x, this.player.y, 'flares', this.getParticleConfig({
            color: [0xffd700, 0x4169e1, 0xffffff, 0x87ceeb, 0xffe066],  // Gold, blue, white, sky blue, light gold
            colorEase: 'quart.out',
            lifespan: 1200,
            angle: { min: -100, max: -80 },
            scale: { start: 0.90, end: 0, ease: 'sine.in' },
            speed: 350,
            advance: 2000,
            blendMode: 'ADD',
            frequency: 20,
            quantity: 2
        }));
        magicSpell.setDepth(50);
        
        // Move magic spell toward dragon
        this.tweens.add({
            targets: magicSpell,
            x: this.dragon.x,
            y: this.dragon.y,
            duration: 500,
            onComplete: () => {
                // Stop spell emission
                magicSpell.stop();
                
                // Create sparkle explosion on impact - gold, blue, white only
                const explosion = this.add.particles(this.dragon.x, this.dragon.y, 'flares', this.getParticleConfig({
                    color: [0xffd700, 0x4169e1, 0xffffff, 0x87ceeb, 0xffe066],  // Gold, blue, white, sky blue, light gold
                    colorEase: 'quad.out',
                    lifespan: 1200,
                    angle: { min: 0, max: 360 },
                    scale: { start: 1.2, end: 0, ease: 'sine.out' },
                    speed: { min: 250, max: 400 },
                    advance: 2000,
                    blendMode: 'ADD',
                    quantity: 40
                }));
                explosion.setDepth(50);
                
                this.cameras.main.shake(100, 0.005);
                
                // Damage text or MISS
                const damageText = this.add.text(this.dragon.x, this.dragon.y - 50, 
                    dragonDodges ? 'MISS!' : `-${damage}`, {
                    font: 'bold 24px Arial',
                    fill: dragonDodges ? '#ffff00' : '#ffffff'
                });
                this.tweens.add({
                    targets: damageText,
                    y: damageText.y - 30,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => damageText.destroy()
                });
                
                // Clean up particles and check turn
                this.time.delayedCall(1200, () => {
                    magicSpell.destroy();
                    explosion.destroy();
                    this.checkTurnEnd();
                });
            }
        });
        
        // Check win condition
        if (this.dragonHealth <= 0) {
            this.isCombatActive = false;
            this.victory();
        }
    }
    
    checkTurnEnd() {
        // Update turn indicator
        const spellsLeft = this.spellsPerTurn - this.spellsCastThisTurn;
        this.turnIndicator.setText(`YOUR TURN - SPACE: cast spell | ↑/W: jump | ← →: dodge (${spellsLeft} spells left)`);
        
        // Check if player has cast all spells
        if (this.spellsCastThisTurn >= this.spellsPerTurn) {
            // End player turn, start dragon turn
            this.spellsCastThisTurn = 0;
            this.isPlayerTurn = false;
            this.playerDodgeReady = true;
            this.turnIndicator.setText('DRAGON\'S TURN - Press ↑/W to JUMP or ← → to DODGE!');
            this.turnIndicator.setFill('#ff0000');
            this.dodgeIndicator.setText('Jump/Dodge Ready!');
            this.dodgeIndicator.setFill('#ffff00');
            
            // Dragon casts 2 spells with delay between them
            this.time.delayedCall(1000, () => {
                this.dragonCastSpell(1);
            });
        } else {
            // Allow player to cast another spell
            this.time.delayedCall(800, () => {
                this.canCastSpell = true;
            });
        }
    }
    
    playerDodge() {
        if (!this.playerDodgeReady) return;
        
        this.playerDodgeReady = false;
        this.dodgeIndicator.setText('Dodged!');
        this.dodgeIndicator.setFill('#00ff00');
        
        // Dodge animation
        const dodgeDirection = Phaser.Input.Keyboard.JustDown(this.leftKey) ? -1 : 1;
        const originalX = this.player.x;
        
        this.tweens.add({
            targets: this.player,
            x: this.player.x + (dodgeDirection * 80),
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.player.x = originalX;
            }
        });
        
        console.log('Player dodged!');
    }
    
    playerJump() {
        if (!this.playerDodgeReady) return;
        
        this.playerDodgeReady = false;
        this.dodgeIndicator.setText('Jumped!');
        this.dodgeIndicator.setFill('#00ff00');
        
        // Jump animation - higher jump
        const originalY = this.player.y;
        
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 400,
            duration: 600,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.player.y = originalY;
            }
        });
        
        console.log('Player jumped!');
    }
    
    dragonCastSpell(spellNumber) {
        if (!this.dragon || !this.isCombatActive) return;
    
        // Check if player dodged
        const playerDodged = !this.playerDodgeReady;
        
        // Play fireball sound (louder than background music)
        this.sound.play('fireball', { volume: 0.8 });
        
        // Brief attack animation (scale pulse) - dragon keeps moving
        this.tweens.add({
            targets: this.dragon,
            scaleX: 3.3,
            scaleY: 3.3,
            duration: 200,
            yoyo: true
        });
        
        // Dragon does 1 damage per attack (if player didn't dodge)
        const damage = playerDodged ? 0 : 1;
        this.playerHealth -= damage;
        
        // Update health bar
        this.playerHealthBar.setValue(this.playerHealth);
        
        // Play dragon hit sound if player was hit (EXTRA LOUD)
        if (!playerDodged && damage > 0) {
            this.sound.play('dragon_hit', { volume: 0.9 });
        }
        
        // Create flame particle emitter - RED, YELLOW, ORANGE flames
        const flame = this.add.particles(this.dragon.x, this.dragon.y, 'flares', this.getParticleConfig({
            color: [0xff0000, 0xff6600, 0xff9900, 0xffcc00, 0xffff00],  // Red, orange, yellow
            colorEase: 'quad.out',
            lifespan: 2400,
            angle: { min: -100, max: -80 },
            scale: { start: 0.70, end: 0, ease: 'sine.out' },
            speed: 100,
            advance: 2000,
            blendMode: 'ADD',
            frequency: 30,
            quantity: 2
        }));
        flame.setDepth(50);
            
            // Move flame emitter toward player
            this.tweens.add({
                targets: flame,
                x: this.player.x,
                y: this.player.y,
                duration: 1000,
                onComplete: () => {
                    // Stop flame emission
                    flame.stop();
                    
                    // Create flame explosion on impact - RED, YELLOW, ORANGE
                    const explosion = this.add.particles(this.player.x, this.player.y, 'flares', this.getParticleConfig({
                        color: [0xff0000, 0xff6600, 0xff9900, 0xffcc00, 0xffff00],  // Red, orange, yellow
                        colorEase: 'quad.out',
                        lifespan: 1000,
                        angle: { min: 0, max: 360 },
                        scale: { start: 0.8, end: 0, ease: 'sine.out' },
                        speed: { min: 200, max: 300 },
                        advance: 2000,
                        blendMode: 'ADD',
                        quantity: 35
                    }));
                    explosion.setDepth(50);
                    
                    this.cameras.main.shake(150, 0.01);
                    
                    // Damage text or MISS
                    const damageText = this.add.text(this.player.x, this.player.y - 30, 
                        playerDodged ? 'MISS!' : `-${damage}`, {
                        font: 'bold 20px Arial',
                        fill: playerDodged ? '#ffff00' : '#e74c3c'
                    });
                    this.tweens.add({
                        targets: damageText,
                        y: damageText.y - 30,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => damageText.destroy()
                    });
                    
                    // EXTRA STEAM AND SMOKE after dragon fires
                    const afterFireSteam = this.add.particles(this.dragon.x, this.dragon.y, 'flares', this.getParticleConfig({
                        lifespan: 4000,
                        speedY: { min: -80, max: -40 },
                        speedX: { min: -40, max: 40 },
                        scale: { start: 1, end: 2, ease: 'Cubic.easeOut' },
                        color: [0x888888, 0x666666, 0x444444],
                        alpha: { start: 0.7, end: 0 },
                        blendMode: 'NORMAL',
                        quantity: 8
                    }));
                    afterFireSteam.setDepth(4);
                    
                    // Extra heat waves after fire
                    const afterFireHeat = this.add.particles(this.dragon.x, this.dragon.y, 'flares', this.getParticleConfig({
                        lifespan: 3000,
                        speedY: { min: -60, max: -30 },
                        speedX: { min: -30, max: 30 },
                        scale: { start: 0.6, end: 0 },
                        color: [0xff6600, 0xff4500, 0xff8800],
                        alpha: { start: 0.6, end: 0 },
                        blendMode: 'ADD',
                        quantity: 10
                    }));
                    afterFireHeat.setDepth(4);
                    
                    // Clean up particles and check if dragon should cast another spell
                    this.time.delayedCall(1000, () => {
                        flame.destroy();
                        explosion.destroy();
                        
                        // Clean up extra effects after delay
                        this.time.delayedCall(3000, () => {
                            afterFireSteam.destroy();
                            afterFireHeat.destroy();
                        });
                        
                        // Check lose condition
                        if (this.playerHealth <= 0) {
                            this.isCombatActive = false;
                            this.defeat();
                            return;
                        }
                        
                        // If this was spell 1, cast spell 2
                        if (spellNumber === 1) {
                            this.time.delayedCall(500, () => {
                                this.dragonCastSpell(2);
                            });
                        } else {
                            // Dragon's turn is over, back to player
                            this.endDragonTurn();
                        }
                    });
                }
            });
    }
    
    endDragonTurn() {
        // Switch back to player's turn
        this.isPlayerTurn = true;
        this.spellsCastThisTurn = 0;
        this.canCastSpell = true;
        this.playerDodgeReady = true;
        this.turnIndicator.setText('YOUR TURN - SPACE: cast spell | ↑/W: jump | ← →: dodge (2 spells)');
        this.turnIndicator.setFill('#00ff00');
        this.dodgeIndicator.setText('Jump/Dodge Ready!');
        this.dodgeIndicator.setFill('#ffff00');
    }
    
    enterPhase2() {
        this.bossPhase = 2;
        console.log('BossScene: Entering Phase 2');
        
        const text = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
            'PHASE 2!', {
            font: 'bold 36px Arial',
            fill: '#ff0000'
        });
        text.setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 2000,
            onComplete: () => text.destroy()
        });
        
        // Increase attack speed (handled by existing timer)
    }
    
    enterPhase3() {
        this.bossPhase = 3;
        console.log('BossScene: Entering Phase 3');
        
        const text = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
            'FINAL PHASE!', {
            font: 'bold 36px Arial',
            fill: '#ff0000'
        });
        text.setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 2000,
            onComplete: () => text.destroy()
        });
        
        // Could spawn minions here in future
    }
    
    victory() {
        // STOP BOSS TIMER AND CALCULATE SCORE
        this.bossKillTime = (this.time.now - this.bossStartTime) / 1000; // Convert to seconds
        
        // Stop Level 3 background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        // Calculate total coins based on Level 2 alerts rule
        let totalCoins = this.level1Coins;
        if (this.level2Alerts >= 1) {
            totalCoins += this.level2Coins;
            console.log(`Level 2 coins counted: ${this.level2Coins} (alerts: ${this.level2Alerts})`);
        } else {
            console.log(`Level 2 coins NOT counted (no alerts collected)`);
        }
        
        // Final score = Total Coins ÷ Boss Kill Time
        const finalScore = (totalCoins / this.bossKillTime).toFixed(2);
        
        console.log('=== FINAL SCORE CALCULATION ===');
        console.log(`Level 1 Coins: ${this.level1Coins}`);
        console.log(`Level 2 Coins: ${this.level2Coins}`);
        console.log(`Level 2 Alerts: ${this.level2Alerts}`);
        console.log(`Total Coins: ${totalCoins}`);
        console.log(`Boss Kill Time: ${this.bossKillTime.toFixed(2)}s`);
        console.log(`FINAL SCORE: ${finalScore}`);
        
        this.scene.start('GameOverScene', {
            victory: true,
            difficulty: this.difficulty,
            finalScore: parseFloat(finalScore),
            totalCoins: totalCoins,
            bossKillTime: this.bossKillTime,
            level1Coins: this.level1Coins,
            level2Coins: this.level2Coins,
            level2Alerts: this.level2Alerts
        });
    }
    
    defeat() {
        console.log('BossScene: Defeat!');
        
        // Stop Level 3 background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        this.scene.start('GameOverScene', {
            victory: false,
            difficulty: this.difficulty,
            finalScore: 0,
            totalCoins: 0,
            bossKillTime: 0
        });
    }
}
