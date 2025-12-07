# Step-by-Step Deployment Guide

This guide will walk you through deploying your game with Auth0, Vultr, and Cloudflare Pages.

---

## Prerequisites

- [ ] Auth0 account (free tier)
- [ ] Vultr account ($6/month minimum)
- [ ] Cloudflare account (free tier)
- [ ] Domain name (optional but recommended)
- [ ] SSH client (Terminal on Mac/Linux, PuTTY on Windows)

---

## Phase 1: Auth0 Setup (15-20 minutes)

### Step 1: Create Auth0 Account
1. Go to https://auth0.com
2. Click "Sign Up" and create a free account
3. Choose a tenant name (e.g., `your-game-dev`)
4. Select your region (closest to your users)

### Step 2: Create Application
1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Name: `Password Dash Game`
4. Type: **Single Page Web Applications**
5. Click **Create**

### Step 3: Configure Application Settings
1. In your application settings, find these values:
   ```
   Domain: your-tenant.auth0.com
   Client ID: abc123xyz... (copy this)
   ```

2. Scroll down to **Application URIs**:
   
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

3. Click **Save Changes**

### Step 4: Create API
1. Go to **Applications** → **APIs**
2. Click **Create API**
3. Name: `Game Leaderboard API`
4. Identifier: `https://your-api.com` (this is your audience)
5. Signing Algorithm: **RS256**
6. Click **Create**

### Step 5: Save Your Credentials
Create a file called `auth0-credentials.txt` and save:
```
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_AUDIENCE=https://your-api.com
```

✅ **Auth0 Setup Complete!**

---

## Phase 2: Vultr Backend Setup (30-45 minutes)

### Step 1: Create Vultr Account
1. Go to https://vultr.com
2. Sign up for an account
3. Add payment method (credit card required)

### Step 2: Deploy Server
1. Click **Deploy** → **Deploy New Server**
2. Choose Server Type: **Cloud Compute - Shared CPU**
3. Server Location: Choose closest to your users
4. Server Image: **Ubuntu 22.04 LTS x64**
5. Server Size: **$6/month** (1 CPU, 1GB RAM, 25GB SSD)
6. Additional Features: Enable **Auto Backups** (optional, +$1.20/month)
7. Server Hostname: `game-api`
8. Click **Deploy Now**

Wait 2-3 minutes for server to deploy.

### Step 3: Get Server IP Address
1. Click on your server in Vultr dashboard
2. Copy the **IP Address** (e.g., `123.45.67.89`)
3. Copy the **Password** (or use SSH key if you set one up)

### Step 4: Connect to Server via SSH

**On Mac/Linux:**
```bash
ssh root@YOUR_SERVER_IP
```

**On Windows:**
1. Download PuTTY from https://putty.org
2. Open PuTTY
3. Host Name: `YOUR_SERVER_IP`
4. Port: `22`
5. Click **Open**
6. Login as: `root`
7. Password: (paste the password from Vultr)

### Step 5: Update Server
```bash
apt update && apt upgrade -y
```

### Step 6: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 7: Install PostgreSQL
```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### Step 8: Setup Database
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run these commands:
CREATE DATABASE game_leaderboard;
CREATE USER gameapi WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE game_leaderboard TO gameapi;
\q
```

### Step 9: Install Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Step 10: Install PM2
```bash
npm install -g pm2
```

### Step 11: Create API Directory
```bash
mkdir -p /var/www/game-api
cd /var/www/game-api
```

### Step 12: Upload Backend Code

**Option A: Using SCP (from your local machine):**
```bash
# From your local machine (in HackSussex/gaming directory)
scp -r vultr-backend/* root@YOUR_SERVER_IP:/var/www/game-api/
```

**Option B: Using Git:**
```bash
# On server
cd /var/www/game-api
git clone YOUR_REPO_URL .
cd vultr-backend
```

**Option C: Manual (if above don't work):**
```bash
# On server, create files manually
cd /var/www/game-api
nano server.js
# Paste the server.js content, then Ctrl+X, Y, Enter

nano package.json
# Paste the package.json content, then Ctrl+X, Y, Enter
```

### Step 13: Install Dependencies
```bash
cd /var/www/game-api
npm install
```

### Step 14: Create Environment File
```bash
nano .env
```

Paste this (replace with your actual values):
```env
PORT=3000
NODE_ENV=production
DB_USER=gameapi
DB_NAME=game_leaderboard
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api.com
ALLOWED_ORIGINS=http://localhost:5173,https://your-game.pages.dev
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 15: Test API
```bash
node server.js
```

You should see:
```
✓ Database connected successfully
✓ Database tables initialized
✓ API server running on port 3000
```

Press `Ctrl+C` to stop.

### Step 16: Configure Nginx
```bash
nano /etc/nginx/sites-available/game-api
```

Paste this:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and enable:
```bash
ln -s /etc/nginx/sites-available/game-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 17: Start API with PM2
```bash
cd /var/www/game-api
pm2 start server.js --name game-api
pm2 save
pm2 startup
# Copy and run the command it outputs
```

### Step 18: Test API Endpoint
```bash
curl http://YOUR_SERVER_IP/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

✅ **Vultr Backend Complete!**

---

## Phase 3: Frontend Integration (15-20 minutes)

### Step 1: Install Auth0 SDK
```bash
cd HackSussex/gaming
npm install @auth0/auth0-spa-js
```

### Step 2: Create Environment File
```bash
# In HackSussex/gaming directory
cp .env.example .env
```

Edit `.env`:
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://your-api.com
VITE_API_URL=http://YOUR_SERVER_IP/api
```

### Step 3: Update Main.js to Initialize Auth
Edit `src/main.js`:

```javascript
import Phaser from 'phaser';
import AuthService from './services/AuthService';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1IntroScene from './scenes/Level1IntroScene.js';
import CountdownScene from './scenes/CountdownScene.js';
import GameScene from './scenes/GameScene.js';
import Level2IntroScene from './scenes/Level2IntroScene.js';
import Level2Scene from './scenes/Level2Scene.js';
import Level3IntroScene from './scenes/Level3IntroScene.js';
import BossScene from './scenes/BossScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Initialize Auth0 before starting game
AuthService.init().then(() => {
    console.log('Auth0 initialized');
    
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false
            }
        },
        scene: [
            BootScene,
            PreloadScene,
            MenuScene,
            Level1IntroScene,
            CountdownScene,
            GameScene,
            Level2IntroScene,
            Level2Scene,
            Level3IntroScene,
            BossScene,
            GameOverScene
        ]
    };

    new Phaser.Game(config);
}).catch(error => {
    console.error('Failed to initialize Auth0:', error);
    // Start game anyway
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false
            }
        },
        scene: [
            BootScene,
            PreloadScene,
            MenuScene,
            Level1IntroScene,
            CountdownScene,
            GameScene,
            Level2IntroScene,
            Level2Scene,
            Level3IntroScene,
            BossScene,
            GameOverScene
        ]
    };

    new Phaser.Game(config);
});
```

### Step 4: Update GameOverScene to Submit Scores
Add to `src/scenes/GameOverScene.js` at the top:

```javascript
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
```

In the `create()` method, after displaying victory stats, add:

```javascript
if (this.victory) {
    // Submit score if authenticated
    if (AuthService.isUserAuthenticated()) {
        ApiService.submitScore({
            difficulty: this.difficulty,
            score: this.finalScore,
            totalCoins: this.totalCoins,
            bossKillTime: this.bossKillTime,
            level1Coins: this.level1Coins,
            level2Coins: this.level2Coins,
            level2Alerts: this.level2Alerts
        }).then(result => {
            if (result.success) {
                this.add.text(width / 2, 550, '✓ Score submitted to leaderboard!', {
                    font: '16px Arial',
                    fill: '#00ff00'
                }).setOrigin(0.5);
            }
        });
    } else {
        this.add.text(width / 2, 550, 'Login to save your score!', {
            font: '16px Arial',
            fill: '#ffff00'
        }).setOrigin(0.5);
    }
}
```

### Step 5: Test Locally
```bash
npm run dev
```

Open http://localhost:5173 and test the game.

✅ **Frontend Integration Complete!**

---

## Phase 4: Cloudflare Pages Deployment (20-30 minutes)

### Step 1: Prepare for Production
Create `.env.production`:
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://your-api.com
VITE_API_URL=http://YOUR_SERVER_IP/api
```

### Step 2: Build Project
```bash
npm run build
```

Check that `dist` folder was created.

### Step 3: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 4: Create Cloudflare Pages Project
1. Go to https://dash.cloudflare.com
2. Click **Pages** in sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access your GitHub
6. Select your repository
7. Click **Begin setup**

### Step 5: Configure Build Settings
- **Project name**: `password-dash-game` (or your choice)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Step 6: Add Environment Variables
Click **Environment variables** and add:
```
VITE_AUTH0_DOMAIN = your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID = your_auth0_client_id
VITE_AUTH0_AUDIENCE = https://your-api.com
VITE_API_URL = http://YOUR_SERVER_IP/api
```

### Step 7: Deploy
1. Click **Save and Deploy**
2. Wait 2-5 minutes for build to complete
3. You'll get a URL like: `https://password-dash-game.pages.dev`

### Step 8: Update Auth0 URLs
1. Go back to Auth0 Dashboard
2. Update your application settings with the new Cloudflare URL:
   ```
   Allowed Callback URLs:
   http://localhost:5173,
   https://password-dash-game.pages.dev
   
   Allowed Logout URLs:
   http://localhost:5173,
   https://password-dash-game.pages.dev
   
   Allowed Web Origins:
   http://localhost:5173,
   https://password-dash-game.pages.dev
   ```
3. Save changes

### Step 9: Update Backend CORS
SSH into your Vultr server:
```bash
ssh root@YOUR_SERVER_IP
cd /var/www/game-api
nano .env
```

Update `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=http://localhost:5173,https://password-dash-game.pages.dev
```

Restart API:
```bash
pm2 restart game-api
```

### Step 10: Test Production Site
Visit your Cloudflare Pages URL and test:
- [ ] Game loads
- [ ] Can play all levels
- [ ] Login works
- [ ] Score submission works

✅ **Deployment Complete!**

---

## Phase 5: SSL Certificate (Optional but Recommended)

### Step 1: Get Domain Name
If you don't have one, buy from:
- Namecheap.com
- GoDaddy.com
- Google Domains

### Step 2: Point Domain to Cloudflare
1. In Cloudflare, click **Add a site**
2. Enter your domain name
3. Follow instructions to change nameservers at your registrar

### Step 3: Add Custom Domain to Pages
1. In Cloudflare Pages, go to your project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `game.yourdomain.com`)
5. Cloudflare will automatically configure DNS and SSL

### Step 4: Setup SSL for API (Vultr)
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
certbot --nginx -d api.yourdomain.com

# Follow prompts, choose redirect HTTP to HTTPS
```

Update Nginx config:
```bash
nano /etc/nginx/sites-available/game-api
```

Change `server_name` to your domain:
```nginx
server_name api.yourdomain.com;
```

Restart Nginx:
```bash
systemctl restart nginx
```

Update `.env` on Vultr:
```env
ALLOWED_ORIGINS=http://localhost:5173,https://game.yourdomain.com
```

Update frontend `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

Redeploy on Cloudflare Pages.

✅ **SSL Setup Complete!**

---

## Troubleshooting

### API Not Responding
```bash
# Check if API is running
pm2 status

# View logs
pm2 logs game-api

# Restart API
pm2 restart game-api
```

### Database Connection Error
```bash
# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Test connection
sudo -u postgres psql -d game_leaderboard
```

### Auth0 Login Not Working
- Check that callback URLs match exactly
- Check browser console for errors
- Verify Auth0 credentials in `.env`

### CORS Errors
- Check `ALLOWED_ORIGINS` in backend `.env`
- Restart API after changing: `pm2 restart game-api`
- Check browser console for exact error

---

## Monitoring

### Check API Health
```bash
curl http://YOUR_SERVER_IP/api/health
```

### View API Logs
```bash
pm2 logs game-api
```

### Database Backup
```bash
# Backup
pg_dump -U gameapi game_leaderboard > backup_$(date +%Y%m%d).sql

# Restore
psql -U gameapi game_leaderboard < backup_20240101.sql
```

---

## Costs Summary

| Service | Cost | Notes |
|---------|------|-------|
| Auth0 | Free | Up to 7,000 active users |
| Vultr | $6/month | Basic server |
| Cloudflare Pages | Free | Unlimited bandwidth |
| Domain (optional) | $10-15/year | One-time annual cost |
| **Total** | **$6/month** | Plus optional domain |

---

## Next Steps

1. [ ] Complete all deployment steps
2. [ ] Test thoroughly
3. [ ] Add more features (leaderboard UI, user profiles)
4. [ ] Monitor performance
5. [ ] Scale as needed

---

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs: `pm2 logs game-api`
3. Check Auth0 dashboard for errors
4. Verify all environment variables

Good luck! 🚀
