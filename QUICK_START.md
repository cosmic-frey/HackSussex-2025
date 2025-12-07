# Quick Start Guide - Auth0 + Cloudflare + Vultr Integration

## 🚀 5-Minute Setup Overview

### Prerequisites
- Auth0 account (auth0.com)
- Vultr account (vultr.com)
- Cloudflare account (cloudflare.com)
- Git and Node.js 18+ installed

---

## Step 1: Auth0 Setup (5 min)

```bash
# Go to https://manage.auth0.com

# Create Application:
# 1. Create a new "Single Page Application"
# 2. Name it "Password Quest"
# 3. Choose "React" as framework (for SPAs)

# Configure URLs:
Applications > Settings
  ├─ Allowed Callback URLs: http://localhost:5173,https://password-quest.com
  ├─ Allowed Logout URLs: http://localhost:5173,https://password-quest.com
  └─ Allowed Web Origins: http://localhost:5173,https://password-quest.com

# Get credentials from Application Settings:
Domain: your-tenant.auth0.com
Client ID: xxxxxxxxxxxxxxxxxxxxxxxx

# Create API:
Applications > APIs > Create API
  ├─ Name: Password Quest API
  ├─ Identifier: https://api.password-quest.com
  └─ Signing Algorithm: RS256
```

---

## Step 2: Local Frontend Setup (5 min)

```bash
cd HackSussex/gaming

# Create .env.local
cat > .env.local << EOF
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.password-quest.com
VITE_VULTR_API_URL=http://localhost:3000
EOF

# Install & run
npm install
npm run dev
# Visit http://localhost:5173
```

---

## Step 3: Local Backend Setup (10 min)

```bash
# Setup PostgreSQL locally
# On Windows: Download PostgreSQL installer
# On Mac: brew install postgresql
# On Linux: sudo apt install postgresql

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
# Or use PostgreSQL app on Mac/Windows

cd HackSussex/gaming/vultr-backend

# Create .env.local
cat > .env.local << EOF
PORT=3000
NODE_ENV=development

DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_NAME=password_quest
DB_PORT=5432

AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.password-quest.com

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

LOG_LEVEL=debug
EOF

# Install & run
npm install
npm run dev
# Visit http://localhost:3000/api/health
```

---

## Step 4: Test Locally

### Test Backend Health
```bash
curl http://localhost:3000/api/health
# Response: { "status": "ok", "timestamp": "...", "uptime": 123.45 }
```

### Test Login in Frontend
1. Click "LOGIN" button in game menu
2. You'll be redirected to Auth0 login
3. After login, you'll be redirected back

### Test Score Submission
1. Complete a game on any difficulty
2. Should see "Score submitted" in console
3. Check leaderboard: https://localhost:3000/api/leaderboard/easy

---

## Step 5: Production Deployment

### Deploy Backend to Vultr

```bash
# 1. Create Vultr instance
# Visit vultr.com > Products > Cloud Compute
# Ubuntu 22.04 LTS, $5/month size

# 2. SSH into your instance
ssh root@<vultr-ip>

# 3. Setup server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx
sudo npm install -g pm2

# 4. Clone repo
cd /var/www
git clone <your-repo-url>
cd HackSussex/gaming/vultr-backend

# 5. Setup database
sudo -u postgres psql << EOF
CREATE DATABASE password_quest;
CREATE USER app_user WITH PASSWORD 'strong_password_123';
ALTER ROLE app_user SET client_encoding TO 'utf8';
ALTER ROLE app_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE app_user SET default_transaction_deferrable TO on;
ALTER ROLE app_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE password_quest TO app_user;
\q
EOF

# 6. Setup environment
cat > .env << EOF
PORT=3000
NODE_ENV=production
DB_USER=app_user
DB_PASSWORD=strong_password_123
DB_HOST=localhost
DB_NAME=password_quest
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.password-quest.com
ALLOWED_ORIGINS=https://password-quest.com,https://www.password-quest.com
LOG_LEVEL=info
EOF

# 7. Start with PM2
npm install
pm2 start server.js --name password-quest-api
pm2 startup
pm2 save

# 8. Setup Nginx
sudo cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    server_name api.password-quest.com;
    
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
EOF

sudo nginx -t
sudo systemctl restart nginx

# 9. Setup SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.password-quest.com
```

### Deploy Frontend

#### Option A: Cloudflare Pages (Recommended)
```bash
cd HackSussex/gaming
npm run build
npx wrangler pages publish dist
```

#### Option B: Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Option C: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Step 6: Update Auth0 Settings

Go to Auth0 Dashboard > Applications > Settings

Update callback/logout URLs to your production domain:
- Allowed Callback URLs: https://password-quest.com
- Allowed Logout URLs: https://password-quest.com  
- Allowed Web Origins: https://password-quest.com

---

## Step 7: Setup Cloudflare Worker (Optional but Recommended)

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
cd HackSussex/gaming
wrangler deploy cloudflare-worker.js

# Configure environment
# In Cloudflare dashboard:
# Workers > password-quest > Settings > Environment Variables
# Add:
# BACKEND_URL = https://api.password-quest.com
# ORIGIN_URL = https://password-quest.com
```

---

## 🧪 Testing Checklist

- [ ] Frontend loads at http://localhost:5173
- [ ] Can click LOGIN button
- [ ] Redirected to Auth0 login page
- [ ] Login works and redirects back
- [ ] User info displayed in menu
- [ ] Can complete a game
- [ ] Score appears in leaderboard
- [ ] Backend API responds to health check
- [ ] Database has leaderboard entries
- [ ] Cloudflare worker is proxying requests

---

## 🔍 Troubleshooting

### "Auth0 not initialized" error
**Fix:** Make sure `.env.local` has correct Auth0 credentials

### "Cannot connect to database"
**Fix:** 
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Create database if missing
sudo -u postgres psql -c "CREATE DATABASE password_quest;"
```

### CORS errors
**Fix:** Check `ALLOWED_ORIGINS` in backend `.env`

### Cloudflare Worker 522 error
**Fix:** Make sure backend URL is correct in worker settings

---

## 📊 Monitoring

### Check backend logs
```bash
pm2 logs password-quest-api

# View specific number of lines
pm2 logs password-quest-api --lines 100
```

### Check Cloudflare stats
- Cloudflare Dashboard > Workers > password-quest > Metrics

### Database query stats
```bash
sudo -u postgres psql password_quest -c "SELECT * FROM leaderboard LIMIT 10;"
```

---

## 🔒 Security Checklist

- [ ] Auth0 secrets never committed to git
- [ ] Database password is strong (20+ chars)
- [ ] `.env` files in .gitignore
- [ ] HTTPS enabled on all domains
- [ ] Firewall: only allow 80, 443, 22
- [ ] Regular database backups
- [ ] Monitor API logs for suspicious activity

---

## 📞 Support Resources

- **Auth0:** https://auth0.com/docs
- **Cloudflare Workers:** https://developers.cloudflare.com/workers
- **Vultr:** https://www.vultr.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs

---

## Next Steps

1. Get custom domain for your game
2. Setup automated database backups
3. Add analytics/monitoring
4. Scale backend if needed
5. Add more game features

