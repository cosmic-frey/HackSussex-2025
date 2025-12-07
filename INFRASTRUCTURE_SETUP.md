/**
 * Setup Instructions for Auth0, Vultr, and Cloudflare Integration
 * 
 * This document guides you through setting up the complete infrastructure
 * for Password Quest with authentication, backend, and CDN.
 */

# PASSWORD QUEST - INFRASTRUCTURE SETUP GUIDE

## Part 1: Auth0 Setup (Authentication)

### Step 1: Create Auth0 Account
- Go to https://auth0.com/signup
- Sign up with your email
- Create a new tenant (e.g., "password-quest")

### Step 2: Create Application
1. Go to Applications → Applications
2. Click "Create Application"
3. Choose "Single Page Application"
4. Name it "Password Quest"
5. Choose "React" (closest to our setup)
6. Copy your credentials:
   - Domain: `YOUR_AUTH0_DOMAIN.auth0.com`
   - Client ID: `YOUR_CLIENT_ID`

### Step 3: Configure Application Settings
1. In Application Settings:
2. Add to "Allowed Callback URLs":
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
3. Add to "Allowed Logout URLs":
   - `http://localhost:5173`
   - `https://your-domain.com`
4. Save changes

### Step 4: Set API Identifier
1. Go to APIs → Create API
2. Name: "Password Quest API"
3. Identifier: `https://your-domain.com/api`
4. Use this as your audience in the game

### Step 5: Install Auth0 Package
\`\`\`bash
cd "C:\Users\freja\OneDrive\Documents\gaming\HackSussex\gaming"
npm install @auth0/auth0-spa-js
\`\`\`

### Step 6: Create .env file in project root
\`\`\`
VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID
VITE_API_BASE_URL=https://api.your-domain.com
\`\`\`

---

## Part 2: Vultr Backend Setup

### Step 1: Create Vultr Account
- Go to https://www.vultr.com
- Sign up and verify email
- Add billing method

### Step 2: Deploy Cloud Compute Instance
1. Click "Compute"
2. Choose "Cloud Compute"
3. Location: Choose closest to your users (e.g., Europe, US East)
4. OS: Ubuntu 22.04 LTS
5. Plan: Regular Cloud Compute - $2.50/month (smallest for testing)
6. Click "Deploy Now"
7. Note your IPv4 address

### Step 3: SSH into Server
\`\`\`bash
ssh root@YOUR_VULTR_IP
\`\`\`
(Password sent to your email)

### Step 4: Set Up Node.js
\`\`\`bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version
npm --version

# Create app directory
mkdir -p /var/www/password-quest
cd /var/www/password-quest
\`\`\`

### Step 5: Set Up Backend Project
\`\`\`bash
# Copy server.js from vultr-backend folder to /var/www/password-quest/

# Initialize npm
npm init -y

# Install dependencies
npm install express cors dotenv jsonwebtoken

# Create .env file
cat > .env << EOF
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN.auth0.com
AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
EOF
\`\`\`

### Step 6: Install PM2 (Process Manager)
\`\`\`bash
npm install -g pm2

# Start server with PM2
pm2 start server.js --name "password-quest"

# Make it restart on reboot
pm2 startup
pm2 save
\`\`\`

### Step 7: Set Up Nginx Reverse Proxy
\`\`\`bash
# Install Nginx
apt install -y nginx

# Create Nginx config
sudo cat > /etc/nginx/sites-available/password-quest << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/password-quest /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### Step 8: Set Up SSL with Let's Encrypt
\`\`\`bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --nginx -d your-domain.com

# Auto-renew
systemctl enable certbot.timer
\`\`\`

---

## Part 3: Cloudflare Setup

### Step 1: Register Domain
- Buy domain from any registrar (Namecheap, GoDaddy, etc.)
- Note: You'll change nameservers next

### Step 2: Create Cloudflare Account
- Go to https://dash.cloudflare.com/sign-up
- Sign up with email
- Add your domain

### Step 3: Change Nameservers
1. Cloudflare shows 2 nameservers (e.g., ns1.cloudflare.com, ns2.cloudflare.com)
2. Log into your domain registrar
3. Update nameservers to Cloudflare's
4. Wait 24-48 hours for propagation

### Step 4: Set Up DNS Records
In Cloudflare Dashboard:

1. Go to DNS
2. Add A record:
   - Name: your-domain.com
   - Type: A
   - Content: YOUR_VULTR_IP
   - Proxy status: Proxied (orange cloud)

3. Add CNAME for API (optional, if you want api.your-domain.com):
   - Name: api
   - Type: CNAME
   - Content: your-domain.com
   - Proxy status: Proxied

### Step 5: Enable Security Features
1. SSL/TLS → Mode: Full
2. SSL/TLS → Always Use HTTPS: ON
3. Security → DDoS Protection: ON
4. Speed → Brotli: ON
5. Caching → Cache Level: "Cache Everything"

### Step 6: Deploy Cloudflare Worker (Optional)
\`\`\`bash
# Install Wrangler globally
npm install -g @cloudflare/wrangler

# Login
wrangler login

# Create worker project
wrangler init password-quest-worker
cd password-quest-worker

# Copy cloudflare-worker.js code into src/index.js
# Deploy
wrangler deploy
\`\`\`

---

## Part 4: Update Game Code

### Step 1: Update main.js
\`\`\`javascript
import { initAuth0, handleAuth0Redirect } from './services/auth.js';

async function init() {
    try {
        await initAuth0();
        await handleAuth0Redirect();
        
        const game = new Phaser.Game(config);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

init();
\`\`\`

### Step 2: Update GameOverScene
\`\`\`javascript
// In GameOverScene.js
import { submitScore, reportAnalytics } from '../services/api.js';
import { getUser } from '../services/auth.js';

// After game ends:
async function endGame(won) {
    if (won) {
        const user = getUser();
        const scoreData = {
            username: user.email,
            score: this.totalScore,
            level: 3,
            difficulty: this.difficulty,
            tokens: this.tokensCollected,
            timeSpent: this.timeSpent
        };

        try {
            await submitScore(scoreData);
            await reportAnalytics({
                event: 'game_completed',
                data: scoreData
            });
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    }
}
\`\`\`

---

## Part 5: Testing

### Development Testing
\`\`\`bash
# Terminal 1: Run Vite dev server
cd gaming
npm run dev

# Terminal 2: Run Vultr backend locally
cd vultr-backend
npm install
node server.js
\`\`\`

Visit: http://localhost:5173

### Production Testing
1. Deploy to Vultr
2. Update Cloudflare DNS
3. Wait for SSL certificate
4. Visit: https://your-domain.com
5. Test login flow
6. Play game
7. Check leaderboard

---

## Troubleshooting

### Auth0 Issues
- Token not loading? Check domain and client ID in .env
- Login redirect failing? Verify Allowed Callback URLs in Auth0

### Vultr Backend Issues
- Connection refused? Check if PM2 process is running: `pm2 list`
- Nginx not working? Check config: `sudo nginx -t`

### Cloudflare Issues
- DNS not resolving? Check nameservers propagated with: `dig your-domain.com`
- SSL not working? Force Full (Strict) mode in Cloudflare

---

## Cost Breakdown (Monthly)

- Vultr: $2.50 - $6/month
- Cloudflare: FREE (with paid plan option $20/month)
- Auth0: FREE (up to 7,000 users)
- **Total: ~$2.50 - $30/month**

---

## Security Checklist

- [ ] Enable 2FA on Auth0
- [ ] Enable 2FA on Vultr
- [ ] Enable 2FA on Cloudflare
- [ ] Store .env secrets locally (never commit)
- [ ] Use strong passwords
- [ ] Keep Node.js updated
- [ ] Monitor Cloudflare analytics
- [ ] Set up PM2 monitoring

---

For questions, refer to:
- Auth0: https://auth0.com/docs
- Vultr: https://www.vultr.com/docs/
- Cloudflare: https://developers.cloudflare.com/
