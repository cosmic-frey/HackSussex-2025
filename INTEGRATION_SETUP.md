# Complete Integration Guide: Auth0, Cloudflare & Vultr

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Auth0 Setup](#auth0-setup)
3. [Vultr Backend Setup](#vultr-backend-setup)
4. [Cloudflare Workers Setup](#cloudflare-workers-setup)
5. [Frontend Configuration](#frontend-configuration)
6. [Deployment Steps](#deployment-steps)
7. [Testing & Monitoring](#testing--monitoring)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Game (Phaser)                                    │   │
│  │ - AuthService (Auth0 Login)                      │   │
│  │ - ApiService (Score Submission)                  │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Edge)                   │
│                                                           │
│  - CORS Handling                                         │
│  - Request Caching                                       │
│  - Security Headers                                      │
│  - API Routing                                           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│            Vultr Backend (Express.js)                    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ API Routes                                       │   │
│  │ - /api/scores (POST) - Submit game scores       │   │
│  │ - /api/leaderboard/:difficulty (GET)            │   │
│  │ - /api/scores/me (GET) - User's scores          │   │
│  │ - /api/stats (GET) - Leaderboard stats          │   │
│  │ - /api/health (GET) - Health check              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Auth0 JWT Verification                           │   │
│  │ - Validate tokens from Auth0                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                              │   │
│  │ - Leaderboard table with rankings                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Auth0 Setup

### Step 1: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create a new Application (Single Page Application)
3. Configure:
   - **Application URIs**
     - Allowed Callback URLs: `http://localhost:5173`, `https://password-quest.com`
     - Allowed Logout URLs: `http://localhost:5173`, `https://password-quest.com`
     - Allowed Web Origins: `http://localhost:5173`, `https://password-quest.com`

### Step 2: Create Auth0 API

1. Go to Applications > APIs
2. Create a new API called "Password Quest API"
3. Set Identifier: `https://api.password-quest.com`
4. Enable RBAC Settings

### Step 3: Get Credentials

From the Application settings, get:
- **Domain**: `your-domain.auth0.com`
- **Client ID**: `your_client_id`
- **Audience**: `https://api.password-quest.com`

Add to `.env.local`:
```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.password-quest.com
```

---

## Vultr Backend Setup

### Step 1: Create Vultr Instance

1. Sign up at [Vultr.com](https://www.vultr.com)
2. Create a new Cloud Compute instance:
   - **OS**: Ubuntu 22.04 LTS
   - **Region**: Closest to your users
   - **Size**: $5-10/month (1GB RAM, 25GB SSD)
3. Note the IP address

### Step 2: Install Dependencies

SSH into your Vultr instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repository
cd /var/www
git clone <your-repo-url>
cd HackSussex/gaming/vultr-backend

# Install dependencies
npm install
```

### Step 3: Setup PostgreSQL

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE password_quest;
CREATE USER postgres_user WITH PASSWORD 'secure_password';
ALTER ROLE postgres_user SET client_encoding TO 'utf8';
ALTER ROLE postgres_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres_user SET default_transaction_deferrable TO on;
ALTER ROLE postgres_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE password_quest TO postgres_user;
\q
```

### Step 4: Configure Backend Environment

Create `.env` in `vultr-backend/`:

```
PORT=3000
NODE_ENV=production

# Database
DB_USER=postgres_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_NAME=password_quest
DB_PORT=5432

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.password-quest.com

# CORS
ALLOWED_ORIGINS=https://password-quest.com,https://www.password-quest.com

# Logging
LOG_LEVEL=info
```

### Step 5: Setup PM2 Process Manager

```bash
cd /var/www/HackSussex/gaming/vultr-backend

# Start with PM2
pm2 start server.js --name "password-quest-api"

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

### Step 6: Setup Nginx Reverse Proxy

Edit `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name api.password-quest.com _;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

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

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.password-quest.com
```

---

## Cloudflare Workers Setup

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Configure wrangler.toml

The file is already created. Update:

```toml
name = "password-quest"
account_id = "your_account_id"

[[routes]]
pattern = "api.password-quest.com/api/*"
zone_name = "password-quest.com"

[[routes]]
pattern = "password-quest.com/*"
zone_name = "password-quest.com"
```

### Step 3: Deploy Worker

```bash
cd HackSussex/gaming
wrangler deploy cloudflare-worker.js
```

### Step 4: Configure Environment Variables

In Cloudflare dashboard:
1. Go to Workers > password-quest
2. Settings > Environment Variables
3. Add:
   - `BACKEND_URL`: `https://your-vultr-ip:3000`
   - `ORIGIN_URL`: `https://password-quest.com`

---

## Frontend Configuration

### Step 1: Install Dependencies

```bash
cd HackSussex/gaming
npm install
```

### Step 2: Update Environment Variables

Create `.env.local`:

```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.password-quest.com
VITE_VULTR_API_URL=https://api.password-quest.com
```

### Step 3: Update game.config.js (if exists)

```javascript
export const config = {
    auth0: {
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
    },
    api: {
        baseUrl: import.meta.env.VITE_VULTR_API_URL
    }
};
```

---

## Deployment Steps

### Frontend Deployment (Vercel/Netlify/Cloudflare Pages)

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages publish dist

# Or deploy to Vercel
vercel

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### Backend Deployment (Already on Vultr)

```bash
# On your local machine
cd vultr-backend

# Push changes
git add .
git commit -m "Update backend"
git push

# On Vultr server
cd /var/www/HackSussex/gaming/vultr-backend
git pull
npm install
pm2 restart password-quest-api
```

---

## Testing & Monitoring

### Health Check

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://api.password-quest.com/api/health
```

### Test Score Submission

```bash
# Get Auth0 token first
export TOKEN="your_access_token"

# Submit test score
curl -X POST https://api.password-quest.com/api/scores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "easy",
    "score": 1000,
    "totalCoins": 50,
    "bossKillTime": 15.5,
    "level1Coins": 20,
    "level2Coins": 30,
    "level2Alerts": 2
  }'
```

### Get Leaderboard

```bash
curl https://api.password-quest.com/api/leaderboard/easy?limit=10
```

### Monitor Logs

```bash
# On Vultr server
pm2 logs password-quest-api

# Or with tail
tail -f ~/.pm2/logs/password-quest-api-error.log
```

### Cloudflare Analytics

View in Cloudflare dashboard:
- Workers > password-quest > Metrics
- Analytics

---

## Troubleshooting

### CORS Issues

1. Verify Cloudflare worker has correct CORS headers
2. Check backend ALLOWED_ORIGINS env var
3. Ensure Auth0 has correct callback URLs

### Auth Token Errors

1. Verify Auth0 domain and client ID
2. Check token expiration: `jq -R 'split(".")[1] | @base64d' <<< $TOKEN`
3. Ensure backend can reach Auth0 JWKS endpoint

### Database Connection Issues

1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify DB credentials in .env
3. Test connection: `psql -U postgres_user -d password_quest -h localhost`

### Slow API Responses

1. Check Cloudflare cache settings
2. Monitor Vultr CPU/Memory usage
3. Check database query performance

---

## Security Checklist

- [ ] Auth0 secrets are NOT committed to git
- [ ] Database password is strong (20+ characters)
- [ ] Vultr firewall only allows necessary ports (80, 443, 22)
- [ ] Enable Auth0 MFA
- [ ] Use HTTPS everywhere
- [ ] Enable Cloudflare DDoS protection
- [ ] Regular database backups
- [ ] Monitor API logs for suspicious activity
- [ ] Keep dependencies updated: `npm audit fix`

---

## Next Steps

1. Deploy frontend to Vercel/Netlify
2. Configure custom domain
3. Setup monitoring (DataDog, New Relic, etc.)
4. Setup automated backups for database
5. Configure email notifications for errors
6. Add analytics tracking
7. Scale as needed (more Vultr instances, load balancing)

