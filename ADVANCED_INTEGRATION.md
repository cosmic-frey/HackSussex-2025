# Advanced Integration Guide - Maximum Features

This guide shows you how to leverage the MOST features from Auth0, Vultr, and Cloudflare for your game.

---

## 🎯 What You'll Get

### Auth0 Features
- ✅ Social login (Google, GitHub, Discord)
- ✅ User profiles with avatars
- ✅ Email verification
- ✅ Password reset
- ✅ Multi-factor authentication (MFA)
- ✅ User roles (admin, player, moderator)
- ✅ Custom user metadata (achievements, stats)

### Vultr Features
- ✅ PostgreSQL database with backups
- ✅ Redis caching for leaderboards
- ✅ WebSocket support for real-time updates
- ✅ Rate limiting and DDoS protection
- ✅ Automated backups
- ✅ Monitoring and alerts

### Cloudflare Features
- ✅ Global CDN (fast worldwide)
- ✅ DDoS protection
- ✅ Analytics and insights
- ✅ Web Application Firewall (WAF)
- ✅ Bot protection
- ✅ Image optimization
- ✅ Workers for edge computing
- ✅ R2 storage for assets

---

## Phase 1: Auth0 - Maximum Features Setup

### 1.1 Social Login Integration

#### Enable Google Login
1. Go to Auth0 Dashboard → **Authentication** → **Social**
2. Click **Google**
3. Enable the connection
4. Use Auth0 Dev Keys (or add your own Google OAuth credentials)
5. Click **Save**

#### Enable GitHub Login
1. Click **GitHub**
2. Enable the connection
3. Use Auth0 Dev Keys
4. Click **Save**

#### Enable Discord Login
1. Go to https://discord.com/developers/applications
2. Create New Application → Name it "Password Dash"
3. Go to **OAuth2** → Copy Client ID and Secret
4. In Auth0, click **Discord**
5. Paste Client ID and Secret
6. Redirect URL: `https://YOUR_TENANT.auth0.com/login/callback`
7. Click **Save**

### 1.2 User Profiles with Custom Metadata

#### Create User Metadata Rules
1. Go to **Auth Pipeline** → **Rules**
2. Click **Create Rule** → **Empty Rule**
3. Name: "Add Game Metadata"
4. Code:

```javascript
function addGameMetadata(user, context, callback) {
  const namespace = 'https://your-game.com';
  
  // Initialize game metadata if it doesn't exist
  user.app_metadata = user.app_metadata || {};
  user.app_metadata.game_stats = user.app_metadata.game_stats || {
    total_games: 0,
    total_wins: 0,
    total_coins: 0,
    achievements: [],
    level_unlocked: 1,
    created_at: new Date().toISOString()
  };
  
  // Add to ID token
  context.idToken[namespace + '/game_stats'] = user.app_metadata.game_stats;
  context.idToken[namespace + '/user_id'] = user.user_id;
  context.idToken[namespace + '/email'] = user.email;
  context.idToken[namespace + '/picture'] = user.picture;
  
  // Save metadata
  auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
    .then(() => {
      callback(null, user, context);
    })
    .catch((err) => {
      callback(err);
    });
}
```

5. Click **Save**

### 1.3 User Roles (Admin, Player, Moderator)

#### Create Roles
1. Go to **User Management** → **Roles**
2. Click **Create Role**
3. Create three roles:
   - **admin** - Full access
   - **moderator** - Can ban users, view reports
   - **player** - Normal player (default)

#### Assign Permissions
1. Go to **Applications** → **APIs** → Your API
2. Click **Permissions** tab
3. Add permissions:
   - `read:leaderboard`
   - `write:score`
   - `delete:user` (admin only)
   - `ban:user` (moderator only)
   - `read:analytics` (admin only)

#### Auto-Assign Player Role
1. Go to **Auth Pipeline** → **Rules**
2. Create rule "Auto Assign Player Role":

```javascript
function assignPlayerRole(user, context, callback) {
  const ManagementClient = require('auth0@2.27.0').ManagementClient;
  const management = new ManagementClient({
    token: auth0.accessToken,
    domain: auth0.domain
  });

  // Check if user already has roles
  if (context.authorization && context.authorization.roles.length > 0) {
    return callback(null, user, context);
  }

  // Assign player role to new users
  const params = { id: user.user_id };
  const data = { roles: ['rol_PLAYER_ROLE_ID'] }; // Replace with actual role ID

  management.users.assignRoles(params, data, (err) => {
    if (err) {
      console.log('Error assigning role:', err);
    }
    callback(null, user, context);
  });
}
```

### 1.4 Email Verification

1. Go to **Authentication** → **Templates**
2. Click **Verification Email**
3. Customize the email template
4. Enable **Require Email Verification**

### 1.5 Multi-Factor Authentication (MFA)

1. Go to **Security** → **Multi-factor Auth**
2. Enable **One-time Password**
3. Enable **SMS** (optional, costs extra)
4. Set policy: "Always" or "Adaptive"

---

## Phase 2: Vultr - Maximum Features Setup

### 2.1 Enhanced Server Setup

#### Choose Better Server Plan
Instead of $6/month, consider:
- **$12/month**: 2 CPU, 2GB RAM, 55GB SSD (recommended for production)
- Enables Redis caching and better performance

#### Enable Auto Backups
1. In Vultr dashboard, click your server
2. Go to **Backups**
3. Enable **Automatic Backups** (+20% of server cost)
4. Set schedule: Daily at 2 AM

### 2.2 Install Redis for Caching

```bash
# Install Redis
apt install -y redis-server

# Configure Redis
nano /etc/redis/redis.conf

# Change these lines:
# supervised systemd
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Start Redis
systemctl start redis
systemctl enable redis

# Test Redis
redis-cli ping  # Should return PONG
```

### 2.3 Enhanced Backend with Redis Caching

Update `server.js` to include Redis:

```javascript
const redis = require('redis');
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('✓ Redis connected'));

// Cached leaderboard endpoint
app.get('/api/leaderboard/:difficulty', async (req, res) => {
    try {
        const { difficulty } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const cacheKey = `leaderboard:${difficulty}:${limit}`;

        // Check cache first
        redisClient.get(cacheKey, async (err, cachedData) => {
            if (cachedData) {
                console.log('Cache hit for', cacheKey);
                return res.json(JSON.parse(cachedData));
            }

            // Cache miss - query database
            const query = `
                SELECT 
                    username,
                    score,
                    total_coins,
                    boss_kill_time,
                    created_at,
                    ROW_NUMBER() OVER (ORDER BY score DESC) as rank
                FROM leaderboard
                WHERE difficulty = $1
                ORDER BY score DESC
                LIMIT $2;
            `;

            const result = await pool.query(query, [difficulty, limit]);
            const response = {
                success: true,
                difficulty,
                count: result.rows.length,
                data: result.rows,
                cached: false
            };

            // Cache for 5 minutes
            redisClient.setex(cacheKey, 300, JSON.stringify(response));

            res.json(response);
        });
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Clear cache when new score is submitted
app.post('/api/scores', verifyToken, async (req, res) => {
    // ... existing score submission code ...
    
    // Clear leaderboard cache for this difficulty
    const cachePattern = `leaderboard:${difficulty}:*`;
    redisClient.keys(cachePattern, (err, keys) => {
        if (keys && keys.length > 0) {
            redisClient.del(keys);
            console.log('Cleared cache for', difficulty);
        }
    });
    
    // ... rest of code ...
});
```

Install Redis package:
```bash
npm install redis
```

### 2.4 WebSocket Support for Real-Time Updates

```bash
npm install socket.io
```

Update `server.js`:

```javascript
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(','),
        methods: ['GET', 'POST']
    }
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-leaderboard', (difficulty) => {
        socket.join(`leaderboard-${difficulty}`);
        console.log(`Client joined ${difficulty} leaderboard`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Emit leaderboard update when score is submitted
app.post('/api/scores', verifyToken, async (req, res) => {
    // ... existing code ...
    
    // Broadcast update to all clients watching this leaderboard
    io.to(`leaderboard-${difficulty}`).emit('leaderboard-update', {
        difficulty,
        newScore: result.rows[0]
    });
    
    // ... rest of code ...
});

// Change app.listen to server.listen
server.listen(PORT, () => {
    console.log(`✓ API server running on port ${PORT}`);
    console.log(`✓ WebSocket server ready`);
});
```

### 2.5 Monitoring with PM2 Plus

```bash
# Link PM2 to PM2 Plus (free monitoring)
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY

# Enable monitoring
pm2 install pm2-server-monit
```

Get keys from: https://app.pm2.io

### 2.6 Automated Database Backups

Create backup script:

```bash
nano /root/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="game_leaderboard"
DB_USER="gameapi"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

Make executable and schedule:
```bash
chmod +x /root/backup-db.sh

# Add to crontab (daily at 3 AM)
crontab -e
# Add line:
0 3 * * * /root/backup-db.sh
```

---

## Phase 3: Cloudflare - Maximum Features

### 3.1 Enable All Security Features

1. Go to Cloudflare Dashboard → Your domain
2. **Security** → **WAF**
   - Enable **Managed Rules**
   - Enable **OWASP Core Ruleset**
3. **Security** → **Bots**
   - Enable **Bot Fight Mode**
4. **Security** → **DDoS**
   - Already enabled automatically
5. **SSL/TLS** → **Overview**
   - Set to **Full (strict)**

### 3.2 Performance Optimization

#### Enable Auto Minify
1. **Speed** → **Optimization**
2. Enable **Auto Minify**:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

#### Enable Brotli Compression
1. **Speed** → **Optimization**
2. Enable **Brotli**

#### Enable Rocket Loader
1. **Speed** → **Optimization**
2. Enable **Rocket Loader**

### 3.3 Cloudflare R2 for Asset Storage

#### Create R2 Bucket
1. Go to **R2** in sidebar
2. Click **Create bucket**
3. Name: `game-assets`
4. Click **Create bucket**

#### Upload Game Assets
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Upload assets
wrangler r2 object put game-assets/audio/coin-collect.mp3 --file=public/audio/coin-collect.mp3
```

#### Configure Public Access
1. In R2 bucket settings
2. Enable **Public Access**
3. Get public URL: `https://pub-xxxxx.r2.dev`

Update PreloadScene to load from R2:
```javascript
this.load.audio('coin-collect', 'https://pub-xxxxx.r2.dev/audio/coin-collect.mp3');
```

### 3.4 Cloudflare Workers for Edge Computing

Create a Worker for API caching:

```javascript
// worker.js
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // Cache leaderboard requests
        if (url.pathname.startsWith('/api/leaderboard/')) {
            const cache = caches.default;
            let response = await cache.match(request);
            
            if (!response) {
                // Fetch from origin
                response = await fetch(request);
                
                // Cache for 5 minutes
                const headers = new Headers(response.headers);
                headers.set('Cache-Control', 'public, max-age=300');
                
                response = new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers
                });
                
                await cache.put(request, response.clone());
            }
            
            return response;
        }
        
        // Pass through other requests
        return fetch(request);
    }
};
```

Deploy Worker:
```bash
wrangler publish
```

### 3.5 Analytics and Insights

1. **Analytics** → **Web Analytics**
2. Enable **Web Analytics**
3. Add tracking code to `index.html`:

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

### 3.6 Image Optimization

1. **Speed** → **Optimization** → **Image Optimization**
2. Enable **Polish** (Lossless or Lossy)
3. Enable **WebP**

Update image loading:
```javascript
// Cloudflare will automatically serve WebP if supported
this.load.image('player', '/playerchar_placeholder.png');
```

### 3.7 Page Rules for Caching

1. **Rules** → **Page Rules**
2. Create rule for assets:
   - URL: `*yourdomain.com/assets/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     - Browser Cache TTL: 1 month

---

## Phase 4: Advanced Frontend Integration

### 4.1 Real-Time Leaderboard with WebSocket

Create `src/services/WebSocketService.js`:

```javascript
import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        const apiUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        this.socket = io(apiUrl, {
            transports: ['websocket'],
            reconnection: true
        });

        this.socket.on('connect', () => {
            console.log('✓ WebSocket connected');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('✗ WebSocket disconnected');
            this.connected = false;
        });

        return this.socket;
    }

    joinLeaderboard(difficulty) {
        if (this.socket) {
            this.socket.emit('join-leaderboard', difficulty);
        }
    }

    onLeaderboardUpdate(callback) {
        if (this.socket) {
            this.socket.on('leaderboard-update', callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new WebSocketService();
```

Install socket.io-client:
```bash
npm install socket.io-client
```

### 4.2 User Profile Scene

Create `src/scenes/ProfileScene.js`:

```javascript
import Phaser from 'phaser';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';

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
            fill: '#00ff00'
        }).setOrigin(0.5);

        // User avatar
        if (user.picture) {
            // Load avatar image
            this.load.image('avatar', user.picture);
            this.load.once('complete', () => {
                const avatar = this.add.image(width / 2, 150, 'avatar');
                avatar.setDisplaySize(100, 100);
                avatar.setOrigin(0.5);
            });
            this.load.start();
        }

        // User info
        this.add.text(width / 2, 230, user.name || user.email, {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Load user stats
        ApiService.getUserScores().then(result => {
            if (result && result.data) {
                let y = 280;
                result.data.forEach(score => {
                    this.add.text(width / 2, y, 
                        `${score.difficulty.toUpperCase()}: ${score.score.toFixed(2)} (Rank #${score.rank})`, {
                        font: '20px Arial',
                        fill: '#00ff00'
                    }).setOrigin(0.5);
                    y += 35;
                });
            }
        });

        // Back button
        this.createButton(width / 2, height - 80, 'BACK', 0x95a5a6, () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 200, 50, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerover', () => button.setScale(1.05));
        button.on('pointerout', () => button.setScale(1));
        button.on('pointerdown', callback);
    }
}
```

### 4.3 Enhanced Menu with Login

Update `src/scenes/MenuScene.js`:

```javascript
import AuthService from '../services/AuthService';

create() {
    // ... existing code ...
    
    // Check if user is logged in
    if (AuthService.isUserAuthenticated()) {
        const user = AuthService.getUser();
        
        // Show user info
        this.add.text(width - 20, 20, `👤 ${user.name || 'Player'}`, {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(1, 0);
        
        // Profile button
        this.createButton(width / 2, 350, 'VIEW PROFILE', 0x3498db, () => {
            this.scene.start('ProfileScene');
        });
        
        // Logout button
        this.createButton(width / 2, 420, 'LOGOUT', 0xe74c3c, () => {
            AuthService.logout();
        });
    } else {
        // Login button
        this.createButton(width / 2, 350, 'LOGIN', 0x27ae60, () => {
            AuthService.login();
        });
    }
}
```

---

## Cost Summary with All Features

| Service | Free Tier | Paid Tier | Features |
|---------|-----------|-----------|----------|
| **Auth0** | 7,000 users | $23/month | Social login, MFA, roles |
| **Vultr** | - | $12/month | 2GB RAM, Redis, backups |
| **Cloudflare** | Free | $20/month | R2, Workers, advanced WAF |
| **Total** | **$12/month** | **$55/month** | All features enabled |

**Recommended Start**: $12/month (Vultr only, use free tiers for others)

---

## Feature Checklist

### Auth0
- [ ] Social login (Google, GitHub, Discord)
- [ ] User profiles with metadata
- [ ] Email verification
- [ ] User roles (admin, player, moderator)
- [ ] MFA (optional)

### Vultr
- [ ] PostgreSQL database
- [ ] Redis caching
- [ ] WebSocket support
- [ ] Automated backups
- [ ] PM2 monitoring

### Cloudflare
- [ ] Pages deployment
- [ ] WAF enabled
- [ ] Bot protection
- [ ] Auto minify
- [ ] R2 storage (optional)
- [ ] Workers (optional)
- [ ] Analytics

---

## Next Steps

1. Start with basic setup ($12/month)
2. Add features as you grow
3. Monitor usage and costs
4. Scale up when needed

You now have access to enterprise-grade features for your game! 🚀
