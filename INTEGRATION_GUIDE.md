# Leaderboard Integration Guide

## Overview
This guide covers integrating the game with Auth0 (authentication), Vultr (backend API), and Cloudflare Pages (hosting) to create a complete leaderboard system with 3 separate boards (Easy, Medium, Hard).

---

## Architecture Overview

```
┌─────────────────┐
│  Cloudflare     │
│  Pages (Host)   │ ← Game Frontend (Phaser)
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐
    │  Auth0   │    │   Vultr    │
    │  (Auth)  │    │  Backend   │
    └──────────┘    │   API      │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  Database  │
                    │ (PostgreSQL)│
                    └────────────┘
```

---

## Phase 1: Auth0 Setup (Authentication)

### 1.1 Create Auth0 Account & Application
1. Go to https://auth0.com and create a free account
2. Create a new "Single Page Application"
3. Note down:
   - **Domain**: `your-tenant.auth0.com`
   - **Client ID**: `abc123...`
   - **Client Secret**: (keep secure)

### 1.2 Configure Auth0 Application
**Allowed Callback URLs:**
```
http://localhost:5173,
https://your-game.pages.dev
```

**Allowed Logout URLs:**
```
http://localhost:5173,
https://your-game.pages.dev
```

**Allowed Web Origins:**
```
http://localhost:5173,
https://your-game.pages.dev
```

### 1.3 Install Auth0 SDK
```bash
cd HackSussex/gaming
npm install @auth0/auth0-spa-js
```

### 1.4 Create Auth Service
Create `src/services/AuthService.js`:

```javascript
import { createAuth0Client } from '@auth0/auth0-spa-js';

class AuthService {
    constructor() {
        this.auth0Client = null;
        this.user = null;
        this.isAuthenticated = false;
    }

    async init() {
        this.auth0Client = await createAuth0Client({
            domain: 'YOUR_AUTH0_DOMAIN',
            clientId: 'YOUR_AUTH0_CLIENT_ID',
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });

        // Check if user is authenticated
        this.isAuthenticated = await this.auth0Client.isAuthenticated();
        
        if (this.isAuthenticated) {
            this.user = await this.auth0Client.getUser();
        }

        // Handle redirect callback
        if (window.location.search.includes('code=') && 
            window.location.search.includes('state=')) {
            await this.auth0Client.handleRedirectCallback();
            this.isAuthenticated = true;
            this.user = await this.auth0Client.getUser();
            window.history.replaceState({}, document.title, '/');
        }
    }

    async login() {
        await this.auth0Client.loginWithRedirect();
    }

    async logout() {
        await this.auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    }

    async getAccessToken() {
        if (!this.isAuthenticated) return null;
        return await this.auth0Client.getTokenSilently();
    }

    getUser() {
        return this.user;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

export default new AuthService();
```

---

## Phase 2: Vultr Backend Setup

### 2.1 Create Vultr Account & Server
1. Go to https://vultr.com and create account
2. Deploy a new server:
   - **OS**: Ubuntu 22.04 LTS
   - **Plan**: $6/month (1 CPU, 1GB RAM)
   - **Location**: Closest to your target audience

### 2.2 Server Setup (SSH into Vultr)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2.3 Setup PostgreSQL Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE game_leaderboard;
CREATE USER gameapi WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE game_leaderboard TO gameapi;
\q
```

### 2.4 Create Backend API
Create backend directory on Vultr:
```bash
mkdir -p /var/www/game-api
cd /var/www/game-api
npm init -y
```

Install dependencies:
```bash
npm install express cors pg dotenv express-validator helmet express-rate-limit
npm install jsonwebtoken jwks-rsa
```

### 2.5 Backend Code Structure
Create `/var/www/game-api/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth0 JWT verification
const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, getKey, {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
    }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Initialize database tables
async function initDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS leaderboard (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            username VARCHAR(100) NOT NULL,
            difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
            score DECIMAL(10, 2) NOT NULL,
            total_coins INTEGER NOT NULL,
            boss_kill_time DECIMAL(10, 2) NOT NULL,
            level1_coins INTEGER NOT NULL,
            level2_coins INTEGER NOT NULL,
            level2_alerts INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, difficulty)
        );
        
        CREATE INDEX IF NOT EXISTS idx_difficulty_score ON leaderboard(difficulty, score DESC);
        CREATE INDEX IF NOT EXISTS idx_user_id ON leaderboard(user_id);
    `;
    
    try {
        await pool.query(createTableQuery);
        console.log('Database tables initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

initDatabase();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Submit score (authenticated)
app.post('/api/scores', verifyToken, async (req, res) => {
    try {
        const {
            difficulty,
            score,
            totalCoins,
            bossKillTime,
            level1Coins,
            level2Coins,
            level2Alerts
        } = req.body;

        // Validation
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty' });
        }

        if (score <= 0 || totalCoins < 0 || bossKillTime <= 0) {
            return res.status(400).json({ error: 'Invalid score data' });
        }

        const userId = req.user.sub;
        const username = req.user.name || req.user.email || 'Anonymous';

        // Insert or update score (keep best score per difficulty)
        const query = `
            INSERT INTO leaderboard 
            (user_id, username, difficulty, score, total_coins, boss_kill_time, 
             level1_coins, level2_coins, level2_alerts)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id, difficulty) 
            DO UPDATE SET
                score = GREATEST(leaderboard.score, EXCLUDED.score),
                total_coins = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.total_coins 
                    ELSE leaderboard.total_coins 
                END,
                boss_kill_time = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.boss_kill_time 
                    ELSE leaderboard.boss_kill_time 
                END,
                level1_coins = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.level1_coins 
                    ELSE leaderboard.level1_coins 
                END,
                level2_coins = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.level2_coins 
                    ELSE leaderboard.level2_coins 
                END,
                level2_alerts = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.level2_alerts 
                    ELSE leaderboard.level2_alerts 
                END,
                username = EXCLUDED.username,
                created_at = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN CURRENT_TIMESTAMP 
                    ELSE leaderboard.created_at 
                END
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId, username, difficulty, score, totalCoins, bossKillTime,
            level1Coins, level2Coins, level2Alerts
        ]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error submitting score:', err);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

// Get leaderboard (public)
app.get('/api/leaderboard/:difficulty', async (req, res) => {
    try {
        const { difficulty } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty' });
        }

        const query = `
            SELECT 
                username,
                score,
                total_coins,
                boss_kill_time,
                level1_coins,
                level2_coins,
                level2_alerts,
                created_at,
                ROW_NUMBER() OVER (ORDER BY score DESC) as rank
            FROM leaderboard
            WHERE difficulty = $1
            ORDER BY score DESC
            LIMIT $2;
        `;

        const result = await pool.query(query, [difficulty, limit]);

        res.json({
            success: true,
            difficulty,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get user's best scores (authenticated)
app.get('/api/scores/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.sub;

        const query = `
            SELECT 
                difficulty,
                score,
                total_coins,
                boss_kill_time,
                level1_coins,
                level2_coins,
                level2_alerts,
                created_at,
                (SELECT COUNT(*) + 1 FROM leaderboard l2 
                 WHERE l2.difficulty = l1.difficulty AND l2.score > l1.score) as rank
            FROM leaderboard l1
            WHERE user_id = $1
            ORDER BY difficulty;
        `;

        const result = await pool.query(query, [userId]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching user scores:', err);
        res.status(500).json({ error: 'Failed to fetch user scores' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
```

### 2.6 Create Environment File
Create `/var/www/game-api/.env`:
```env
PORT=3000
DB_USER=gameapi
DB_NAME=game_leaderboard
DB_PASSWORD=your_secure_password
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api.com
ALLOWED_ORIGINS=http://localhost:5173,https://your-game.pages.dev
```

### 2.7 Setup Nginx Reverse Proxy
Create `/etc/nginx/sites-available/game-api`:
```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/game-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2.8 Start API with PM2
```bash
cd /var/www/game-api
pm2 start server.js --name game-api
pm2 save
pm2 startup
```

---

## Phase 3: Frontend Integration

### 3.1 Create API Service
Create `src/services/ApiService.js`:

```javascript
import AuthService from './AuthService';

class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    }

    async submitScore(scoreData) {
        try {
            const token = await AuthService.getAccessToken();
            
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${this.baseURL}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scoreData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit score');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }

    async getLeaderboard(difficulty, limit = 100) {
        try {
            const response = await fetch(
                `${this.baseURL}/leaderboard/${difficulty}?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    async getUserScores() {
        try {
            const token = await AuthService.getAccessToken();
            
            if (!token) {
                return null;
            }

            const response = await fetch(`${this.baseURL}/scores/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user scores');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user scores:', error);
            return null;
        }
    }
}

export default new ApiService();
```

### 3.2 Update GameOverScene
Add to `src/scenes/GameOverScene.js`:

```javascript
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// In the create() method, after victory:
if (this.victory && AuthService.isUserAuthenticated()) {
    // Submit score to leaderboard
    ApiService.submitScore({
        difficulty: this.difficulty,
        score: this.finalScore,
        totalCoins: this.totalCoins,
        bossKillTime: this.bossKillTime,
        level1Coins: this.level1Coins,
        level2Coins: this.level2Coins,
        level2Alerts: this.level2Alerts
    }).then(() => {
        console.log('Score submitted to leaderboard!');
    }).catch(err => {
        console.error('Failed to submit score:', err);
    });
}
```

### 3.3 Create Leaderboard Scene
Create `src/scenes/LeaderboardScene.js`:

```javascript
import Phaser from 'phaser';
import ApiService from '../services/ApiService';

export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    init(data) {
        this.selectedDifficulty = data.difficulty || 'easy';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0e27).setOrigin(0);

        // Title
        this.add.text(width / 2, 50, 'LEADERBOARD', {
            font: 'bold 48px Arial',
            fill: '#00ff00'
        }).setOrigin(0.5);

        // Difficulty tabs
        this.createDifficultyTabs();

        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Load leaderboard data
        this.loadLeaderboard();

        // Back button
        this.createButton(width / 2, height - 50, 'BACK TO MENU', 0x95a5a6, () => {
            this.scene.start('MenuScene');
        });
    }

    createDifficultyTabs() {
        const width = this.cameras.main.width;
        const difficulties = ['easy', 'medium', 'hard'];
        const tabWidth = 150;
        const startX = width / 2 - (tabWidth * 1.5);

        difficulties.forEach((diff, index) => {
            const x = startX + (index * tabWidth);
            const isSelected = diff === this.selectedDifficulty;
            const color = isSelected ? 0x00ff00 : 0x333333;

            const tab = this.add.rectangle(x, 120, tabWidth - 10, 40, color);
            tab.setInteractive({ useHandCursor: true });

            const text = this.add.text(x, 120, diff.toUpperCase(), {
                font: 'bold 18px Arial',
                fill: isSelected ? '#000000' : '#ffffff'
            }).setOrigin(0.5);

            tab.on('pointerdown', () => {
                this.selectedDifficulty = diff;
                this.scene.restart({ difficulty: diff });
            });
        });
    }

    async loadLeaderboard() {
        try {
            const result = await ApiService.getLeaderboard(this.selectedDifficulty, 10);
            this.displayLeaderboard(result.data);
        } catch (error) {
            this.loadingText.setText('Failed to load leaderboard');
        }
    }

    displayLeaderboard(data) {
        this.loadingText.destroy();

        const width = this.cameras.main.width;
        const startY = 180;

        // Headers
        this.add.text(50, startY, 'RANK', { font: 'bold 16px Arial', fill: '#00ff00' });
        this.add.text(150, startY, 'PLAYER', { font: 'bold 16px Arial', fill: '#00ff00' });
        this.add.text(width - 200, startY, 'SCORE', { font: 'bold 16px Arial', fill: '#00ff00' });

        // Entries
        data.forEach((entry, index) => {
            const y = startY + 40 + (index * 35);
            const color = index < 3 ? '#f1c40f' : '#ffffff';

            this.add.text(50, y, `#${entry.rank}`, { font: '16px Arial', fill: color });
            this.add.text(150, y, entry.username, { font: '16px Arial', fill: color });
            this.add.text(width - 200, y, entry.score.toFixed(2), { font: '16px Arial', fill: color });
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

---

## Phase 4: Cloudflare Pages Deployment

### 4.1 Prepare for Deployment
Create `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
```

Update `vite.config.js`:
```javascript
export default {
    base: '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
};
```

### 4.2 Build Project
```bash
npm run build
```

### 4.3 Deploy to Cloudflare Pages
1. Go to https://dash.cloudflare.com
2. Navigate to "Pages"
3. Click "Create a project"
4. Connect your Git repository (GitHub/GitLab)
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: Add your `.env.production` values

### 4.4 Custom Domain (Optional)
1. In Cloudflare Pages, go to "Custom domains"
2. Add your domain
3. Update DNS records as instructed

---

## Phase 5: Testing

### 5.1 Test Authentication
- Login/logout flow
- Token refresh
- Protected routes

### 5.2 Test API
- Submit scores
- Fetch leaderboards
- Rate limiting

### 5.3 Test Leaderboard
- Score submission
- Ranking accuracy
- Difficulty separation

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Auth0 Setup | 2-3 hours |
| 2 | Vultr Backend | 4-6 hours |
| 3 | Frontend Integration | 3-4 hours |
| 4 | Cloudflare Deployment | 1-2 hours |
| 5 | Testing & Debugging | 2-3 hours |
| **Total** | | **12-18 hours** |

---

## Security Checklist

- [ ] Auth0 JWT validation on backend
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] SQL injection prevention (parameterized queries)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Database credentials secured
- [ ] API endpoints authenticated where needed

---

## Monitoring & Maintenance

### Backend Monitoring
```bash
# Check API status
pm2 status

# View logs
pm2 logs game-api

# Restart API
pm2 restart game-api
```

### Database Backup
```bash
# Backup database
pg_dump -U gameapi game_leaderboard > backup_$(date +%Y%m%d).sql

# Restore database
psql -U gameapi game_leaderboard < backup_20240101.sql
```

---

## Support & Resources

- **Auth0 Docs**: https://auth0.com/docs
- **Vultr Docs**: https://www.vultr.com/docs/
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Phaser Docs**: https://photonstorm.github.io/phaser3-docs/

---

## Next Steps

1. Set up Auth0 account and configure application
2. Deploy Vultr server and install dependencies
3. Create and test backend API
4. Integrate frontend with Auth0 and API
5. Deploy to Cloudflare Pages
6. Test end-to-end flow
7. Monitor and optimize

Good luck with your integration! 🚀
