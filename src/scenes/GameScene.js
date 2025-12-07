import Phaser from 'phaser';

/**
 * GameScene - Main gameplay (Level 1)
 * Auto-runner where player collects tokens and destroys shadows
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Get difficulty from MenuScene
        this.difficulty = data.difficulty || 'medium';
        
        // Set difficulty parameters
        this.difficultySettings = {
            easy: {
                scrollSpeed: 100,
                shadowWarningTime: 3000,
                spellCooldown: 1000,
                shadowSpawnRate: 3000
            },
            medium: {
                scrollSpeed: 150,
                shadowWarningTime: 2000,
                spellCooldown: 1500,
                shadowSpawnRate: 2000
            },
            hard: {
                scrollSpeed: 200,
                shadowWarningTime: 1000,
                spellCooldown: 2000,
                shadowSpawnRate: 1500
            }
        };
        
        this.settings = this.difficultySettings[this.difficulty];
        
        // Game state
        this.tokenCount = 0; // Token counter (NOT the physics group)
        this.shadowsDestroyed = 0;
        this.shadowsHit = 0;
        this.canCastSpell = true;
        this.gameTime = 0;
        this.levelDuration = 60000; // 60 seconds
        this.hasDoubleJump = false; // Track if double jump is available
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        console.log(`✓ GameScene STARTED - Level 1 (${this.difficulty} mode)`);
        console.log(`✓ Screen size: ${width}x${height}`);
        
        // Continue Level 1 background music if not already playing
        if (!this.sound.get('level1_music') || !this.sound.get('level1_music').isPlaying) {
            this.bgMusic = this.sound.add('level1_music', { 
                loop: true, 
                volume: 0.3  // Background music quieter than sound effects
            });
            this.bgMusic.play();
        } else {
            this.bgMusic = this.sound.get('level1_music');
        }
        
        // Background - sky blue
        this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);
        
        // Ground - scrolling tiled sprite at bottom
        console.log('Ground texture exists:', this.textures.exists('ground_placeholder'));
        this.ground = this.add.tileSprite(0, height - 100, width, 100, 'ground_placeholder').setOrigin(0);
        this.ground.setDepth(10);
        // Don't shift texture - use it as-is
        this.physics.add.existing(this.ground, true); // Static body
        
        // Position player at top of ground boundary
        const groundY = height - 115; // Top surface of ground (height - 100 ground - 15 offset)
        
        // Create player with walking animation (use first frame of walk spritesheet)
        this.player = this.physics.add.sprite(100, groundY, 'player_walk', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2); // Make player 2x bigger
        this.player.setOrigin(0.5, 1); // Origin at bottom center for proper ground placement
        this.player.setDepth(20); // In front of everything
        this.physics.add.collider(this.player, this.ground);
        
        // Debug: Check animation exists
        console.log('Walk animation exists?', this.anims.exists('walk'));
        console.log('Player texture:', this.player.texture.key);
        console.log('Player frame:', this.player.frame.name);
        
        // Start walking animation with error handling
        try {
            this.player.anims.play('walk', true);
            console.log('✓ Player walk animation started');
        } catch (error) {
            console.error('✗ Failed to play walk animation:', error);
        }
        
        // Groups for game objects
        this.tokens = this.physics.add.group();
        this.shadows = this.physics.add.group();
        this.spells = this.physics.add.group();
        
        // HUD (but hidden during countdown)
        this.createHUD();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        
        // Collisions
        this.physics.add.overlap(this.player, this.tokens, this.collectToken, null, this);
        this.physics.add.overlap(this.player, this.shadows, this.hitByShadow, null, this);
        this.physics.add.overlap(this.spells, this.shadows, this.spellHitsShadow, null, this);
        
        // Spawn initial coins spread across the screen
        this.spawnTokenInFrame(width * 0.7);  // Coin at 70% screen width
        this.spawnTokenInFrame(width * 0.85); // Coin at 85% screen width
        this.spawnTokenInFrame(width - 50);   // Coin at right edge
        
        // Continue spawning at reasonable rate
        this.time.addEvent({
            delay: 1500, // Spawn coins every 1.5 seconds (reduced frcoins to collect
            callback: () => this.spawnTokenInFrame(width - 50),
            callbackScope: this,
            loop: true
        });
        
        // Shadow spawning - only ONE shadow at a time
        this.shadowActive = false; // Track if a shadow is currently active
        this.shadowSpawnDelay = {
            easy: 4000,    // 4 seconds between shadows
            medium: 3000,  // 3 seconds between shadows
            hard: 2000     // 2 seconds between shadows
        };
        
        // Spawn first shadow after initial delay
        this.time.delayedCall(3000, () => {
            this.spawnShadow();
        });
        
        // Start level timer
        this.levelTimer = this.time.addEvent({
            delay: this.levelDuration,
            callback: this.endLevel,
            callbackScope: this
        });
    }

    update(time, delta) {
        this.gameTime += delta;
        
        // Update timer display
        const timeLeft = Math.max(0, Math.ceil((this.levelDuration - this.gameTime) / 1000));
        this.timerText.setText(`Time: ${timeLeft}s`);
        
        // Jumping with double jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
            if (this.player.body.touching.down) {
                // First jump from ground
                this.player.setVelocityY(-400);
                this.hasDoubleJump = true; // Enable double jump
                // Play jump sound
                this.sound.play('jump', { volume: 0.8 });
            } else if (this.hasDoubleJump) {
                // Double jump in air
                this.player.setVelocityY(-400);
                this.hasDoubleJump = false; // Use up double jump
                // Play jump sound
                this.sound.play('jump', { volume: 0.8 });
            }
        }
        
        // Reset double jump when landing
        if (this.player.body.touching.down) {
            this.hasDoubleJump = false;
        }
        
        // Spell casting
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canCastSpell) {
            this.castSpell();
        }
        
        // Scroll the ground to create movement illusion
        this.ground.tilePositionX += this.settings.scrollSpeed * (delta / 1000);
        
        // Update spells
        this.spells.children.entries.forEach(spell => {
            if (spell.x > this.cameras.main.width) {
                spell.destroy();
            }
        });
        
        // Shadows remain in place - only removed when hit by spell or collision with player
        // No automatic removal based on position
        
        // Update tokens - STRICT boundary enforcement
        const playerGroundY = this.cameras.main.height - 115; // SAME boundary where player walks
        this.tokens.children.entries.forEach(token => {
            // STRICT CHECK: If coin reaches or passes the walking boundary, EXPLODE IT
            if (token.y >= playerGroundY - 10) { // 10px buffer above boundary
                console.log(`🔥 Coin EXPLODED at y=${token.y.toFixed(1)}, boundary=${playerGroundY}, spawnY=${token.getData('spawnY')}`);
                
                // Stop the floating tween immediately
                this.tweens.killTweensOf(token);
                
                // Coin hit ground boundary - create explosion effect
                const burst = this.add.particles(token.x, token.y, 'spark', {
                    speed: { min: 50, max: 150 },
                    scale: { start: 0.4, end: 0 },
                    lifespan: 400,
                    blendMode: 'ADD',
                    quantity: 10,
                    tint: 0xf1c40f,
                    angle: { min: -120, max: -60 } // Burst upward
                });
                
                this.time.delayedCall(400, () => burst.destroy());
                token.destroy();
            }
            // Remove if off-screen left
            else if (token.x < -50) {
                this.tweens.killTweensOf(token);
                token.destroy();
            }
        });
    }
    
    createHUD() {
        // Password Tokens counter
        this.tokenText = this.add.text(16, 16, 'Password Tokens: 0', {
            font: 'bold 20px Arial',
            fill: '#f1c40f'
        });
        
        // Anonymous shadows destroyed
        this.shadowText = this.add.text(16, 46, 'Anonymous Shadows Destroyed: 0', {
            font: '16px Arial',
            fill: '#000000ff'
        });
        
        // Timer
        this.timerText = this.add.text(this.cameras.main.width - 16, 16, 'Time: 60s', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        });
        this.timerText.setOrigin(1, 0);
        
        // Spell cooldown indicator
        this.cooldownBar = this.add.rectangle(16, 76, 100, 10, 0x9b59b6);
        this.cooldownBar.setOrigin(0);
    }
    
    spawnTokenInFrame(x) {
        // Spawn coin at specified X position within visible frame
        
        // Calculate reachable coin height based on actual ground position
        const height = this.cameras.main.height;
        const playerGroundY = height - 115; // Player's feet position (BOUNDARY)
        const singleJumpHeight = 100; // Single jump reaches 100 pixels (velocity -400)
        const doubleJumpHeight = 180; // Double jump reaches ~180 pixels total
        
        // Coins spawn ONLY within DOUBLE JUMP reach
        // minY = highest point player can reach with double jump
        // maxY = MUST be above ground boundary with safe margin for floating animation
        const minY = playerGroundY - doubleJumpHeight; // Top of double jump reach
        const maxY = playerGroundY - 30; // 30 pixels ABOVE walking boundary (safe for 8px float down)
        
        // Spawn coins with varied heights within reachable range
        const y = Phaser.Math.Between(minY, maxY);
        
        const token = this.tokens.create(x, y, 'token_placeholder');
        token.setVelocityX(-this.settings.scrollSpeed);
        token.setDepth(15); // In front of ground (ground is depth 10)
        
        // Store original spawn Y for boundary checking
        token.setData('spawnY', y);
        token.setData('boundary', playerGroundY);
        
        // Disable gravity so coins don't fall
        token.body.setAllowGravity(false);
        token.setGravityY(0);
        
        // Gentle floating animation - ONLY floats UP from spawn point, never down past it
        this.tweens.add({
            targets: token,
            y: y - 8, // Float up 8px from spawn
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    spawnShadow() {
        // Only spawn if no shadow is currently active
        if (this.shadowActive) {
            console.log('Shadow already active, skipping spawn');
            return;
        }
        
        this.shadowActive = true; // Mark shadow as active
        // Spawn closer to player based on difficulty for increased challenge
        const spawnDistances = {
            easy: 600,    // Further away - more time to react
            medium: 450,  // Medium distance
            hard: 300     // Very close - less time to react
        };
        const spawnDistance = spawnDistances[this.difficulty];
        const x = this.player.x + spawnDistance; // Spawn ahead of player
        
        // Shadow spawns on GROUND BOUNDARY where player walks (same as player position)
        const playerGroundY = this.cameras.main.height - 115;
        const y = playerGroundY; // On ground boundary where character walks
        
        console.log('Shadow spawning at', x, y);
        
        // Spawn shadow immediately - no warning indicator
        this.time.delayedCall(0, () => {
            // Check if texture exists
            if (!this.textures.exists('shadow_fig')) {
                console.error('shadow_fig texture does NOT exist! Using fallback.');
                const shadow = this.shadows.create(x, y, 'shadow_placeholder');
                shadow.setOrigin(0.5, 1);
                shadow.setDepth(15);
                shadow.setScale(2);
                shadow.setVelocityX(-this.settings.scrollSpeed);
                shadow.body.setAllowGravity(false);
                return;
            }
            
            const shadow = this.shadows.create(x, y, 'shadow_fig');
            shadow.setOrigin(0.5, 1); // Origin at bottom center like player
            shadow.setDepth(15); // In front of ground
            shadow.setScale(2); // Same scale as player
            shadow.body.setAllowGravity(false); // No gravity
            
            // Shadow moves LEFT at scroll speed so player can catch up
            // This makes it appear stationary in world space while ground scrolls
            shadow.setVelocityX(-this.settings.scrollSpeed);
            
            console.log(`✓ Shadow spawned: x=${x}, y=${y}, playerY=${this.player.y}, velocity=${shadow.body.velocity.x}`);
            console.log(`  Shadow size: ${shadow.width}x${shadow.height}, texture: ${shadow.texture.key}`);
        });
    }
    
    castSpell() {
        if (!this.canCastSpell) return;
        
        // Play spell casting sound (louder than background music)
        this.sound.play('spell_cast', { volume: 0.7 });
        
        // Find nearest shadow to target
        let nearestShadow = null;
        let minDistance = Infinity;
        
        this.shadows.children.entries.forEach(shadow => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, shadow.x, shadow.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestShadow = shadow;
            }
        });
        
        // If there's a shadow, create BIGGER directed spell beam with LIGHTNING and SHIMMER
        if (nearestShadow) {
            // Calculate angle toward shadow
            const angle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                nearestShadow.x, nearestShadow.y
            );
            
            // SHIMMER EFFECT: Glowing aura around player when casting
            const shimmer = this.add.circle(this.player.x, this.player.y - 20, 40, 0xff00ff, 0.4);
            shimmer.setDepth(19);
            this.tweens.add({
                targets: shimmer,
                scale: 1.5,
                alpha: 0,
                duration: 500,
                ease: 'Power2'
            });
            
            // LIGHTNING BOLT: Jagged line from player to shadow
            const lightning = this.add.graphics();
            lightning.setDepth(18);
            lightning.lineStyle(3, 0xffffff, 1);
            
            // Create jagged lightning path
            const segments = 8;
            const dx = (nearestShadow.x - this.player.x) / segments;
            const dy = (nearestShadow.y - this.player.y) / segments;
            
            lightning.beginPath();
            lightning.moveTo(this.player.x, this.player.y - 20);
            
            for (let i = 1; i < segments; i++) {
                const x = this.player.x + dx * i + Phaser.Math.Between(-20, 20);
                const y = this.player.y - 20 + dy * i + Phaser.Math.Between(-15, 15);
                lightning.lineTo(x, y);
            }
            lightning.lineTo(nearestShadow.x, nearestShadow.y);
            lightning.strokePath();
            
            // Flash the lightning
            this.tweens.add({
                targets: lightning,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => lightning.destroy()
            });
            
            // Create LARGE particle stream directed at shadow
            const emitter = this.add.particles(this.player.x + 30, this.player.y - 30, 'spark', {
                scale: { start: 0.8, end: 0 }, // BIGGER particles
                lifespan: 600,
                speed: { min: 300, max: 400 }, // FASTER particles
                blendMode: 'ADD',
                frequency: 10, // MORE frequent
                maxParticles: 100, // MORE particles
                tint: [0x9b59b6, 0xff00ff, 0x8b00ff, 0xffffff], // Purple + white for shimmer
                angle: { min: Phaser.Math.RadToDeg(angle) - 10, max: Phaser.Math.RadToDeg(angle) + 10 } // Directed cone
            });
            
            // Add gravity well for homing effect
            emitter.createGravityWell({
                x: nearestShadow.x,
                y: nearestShadow.y,
                power: 5, // Stronger pull
                epsilon: 100,
                gravity: 200 // Stronger gravity
            });
            
            // Visual beam line from player to shadow (glowing core)
            const beam = this.add.line(
                0, 0,
                this.player.x, this.player.y,
                nearestShadow.x, nearestShadow.y,
                0x9b59b6, 0.8
            );
            beam.setLineWidth(6);
            beam.setDepth(18);
            
            // Pulse the beam with shimmer
            this.tweens.add({
                targets: beam,
                alpha: 0,
                duration: 400,
                ease: 'Power2'
            });
            
            // ELECTRIC SPARKS around the beam
            const sparks = this.add.particles(this.player.x + 30, this.player.y - 30, 'spark', {
                scale: { start: 0.3, end: 0 },
                lifespan: 300,
                speed: { min: 50, max: 100 },
                blendMode: 'ADD',
                frequency: 30,
                maxParticles: 30,
                tint: 0xffffff, // White electric sparks
                angle: { min: 0, max: 360 } // All directions
            });
            
            // Check for hit after particles travel
            this.time.delayedCall(500, () => {
                // Check if shadow still exists and is close enough
                if (nearestShadow.active && minDistance < 600) { // Increased range
                    this.spellHitsShadow(null, nearestShadow);
                }
                emitter.destroy();
                sparks.destroy();
                beam.destroy();
                shimmer.destroy();
            });
        } else {
            // No target - create unfocused spell burst
            const emitter = this.add.particles(this.player.x + 30, this.player.y - 30, 'spark', {
                scale: { start: 0.6, end: 0 },
                lifespan: 600,
                speed: { min: 150, max: 250 },
                blendMode: 'ADD',
                quantity: 20,
                tint: [0x9b59b6, 0xff00ff],
                angle: { min: -45, max: 45 } // Forward cone
            });
            
            this.time.delayedCall(600, () => {
                emitter.destroy();
            });
        }
        
        // Cooldown
        this.canCastSpell = false;
        this.cooldownBar.setFillStyle(0x555555);
        
        this.time.delayedCall(this.settings.spellCooldown, () => {
            this.canCastSpell = true;
            this.cooldownBar.setFillStyle(0x9b59b6);
        });
    }
    
    collectToken(player, token) {
        // Prevent double-counting: check if token is already collected
        if (token.getData('collected')) {
            return;
        }
        
        // Mark as collected immediately
        token.setData('collected', true);
        
        // Disable physics body immediately to prevent further collisions
        token.body.enable = false;
        
        // Play coin collection sound (louder than background music)
        this.sound.play('coin_collect', { volume: 0.6 });
        
        // Increment counter
        this.tokenCount = (this.tokenCount || 0) + 1;
        this.tokenText.setText(`Password Tokens: ${this.tokenCount}`);
        
        console.log(`✓ Coin collected! Total: ${this.tokenCount}`);
        
        // 3D spin animation before disappearing
        this.tweens.add({
            targets: token,
            rotation: Math.PI * 4, // Spin 2 full rotations
            scale: 0,
            duration: 600,
            ease: 'Power2.easeIn',
            onComplete: () => {
                token.destroy();
            }
        });
        
        // Visual feedback - floating +1 text
        const text = this.add.text(token.x, token.y, '+1', {
            font: 'bold 16px Arial',
            fill: '#f1c40f'
        });
        this.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }
    
    hitByShadow(player, shadow) {
        this.shadowsHit++;
        
        // Play shadow steal sound (louder than background music)
        this.sound.play('shadow_steal', { volume: 0.7 });
        
        // Lose 50% of password tokens
        const tokensLost = Math.floor((this.tokenCount || 0) / 2);
        this.tokenCount = (this.tokenCount || 0) - tokensLost;
        this.tokenText.setText(`Password Tokens: ${this.tokenCount}`);
        
        // Shadow shoots into the air and off screen after stealing coins
        const shadowX = shadow.x;
        const shadowY = shadow.y;
        
        // Stop horizontal movement
        shadow.setVelocityX(0);
        
        // Launch shadow upward and off screen
        this.tweens.add({
            targets: shadow,
            y: -100, // Shoot up off screen
            x: shadowX + 50, // Slight horizontal movement
            rotation: Math.PI * 2, // Spin while flying
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => {
                shadow.destroy();
                // Shadow is gone - schedule next spawn
                this.shadowActive = false;
                const delay = this.shadowSpawnDelay[this.difficulty];
                this.time.delayedCall(delay, () => this.spawnShadow());
            }
        });
        
        // Visual feedback - floating text
        const text = this.add.text(shadowX, shadowY - 30, `-${tokensLost} tokens!`, {
            font: 'bold 16px Arial',
            fill: '#e74c3c'
        });
        this.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
        
        // Screen shake
        this.cameras.main.shake(200, 0.01);
    }
    
    spellHitsShadow(spell, shadow) {
        if (spell) spell.destroy();
        
        const explosionX = shadow.x;
        const explosionY = shadow.y;
        
        // Play shadow explode sound
        this.sound.play('shadow_explode', { volume: 0.8 });
        
        shadow.destroy();
        this.shadowsDestroyed++;
        this.shadowText.setText(`Anonymous Shadows Destroyed: ${this.shadowsDestroyed}`);
        
        // Shadow is destroyed - schedule next spawn
        this.shadowActive = false;
        const delay = this.shadowSpawnDelay[this.difficulty];
        this.time.delayedCall(delay, () => this.spawnShadow());
        
        // MASSIVE particle explosion effect
        const explosionEmitter = this.add.particles(explosionX, explosionY, 'spark', {
            speed: { min: 200, max: 400 },
            scale: { start: 0.6, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            quantity: 30,
            angle: { min: 0, max: 360 },
            tint: [0x9b59b6, 0xff00ff, 0x8b00ff]
        });
        
        // Expanding purple ring
        const ring = this.add.circle(explosionX, explosionY, 10, 0x9b59b6, 0.8);
        this.tweens.add({
            targets: ring,
            scale: 4,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => ring.destroy()
        });
        
        // Screen shake for impact
        this.cameras.main.shake(150, 0.008);
        
        // Cleanup explosion emitter
        this.time.delayedCall(600, () => {
            explosionEmitter.destroy();
        });
    }
    
    endLevel() {
        console.log('GameScene: Level 1 complete');
        console.log(`Level 1 Password Tokens Collected: ${this.tokenCount}`);
        
        // Stop Level 1 background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        // Pass to Level 2 Intro
        this.scene.start('Level2IntroScene', {
            difficulty: this.difficulty,
            tokens: this.tokenCount || 0
        });
    }
}
