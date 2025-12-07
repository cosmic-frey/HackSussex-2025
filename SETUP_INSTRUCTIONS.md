# 🚀 Complete Setup Instructions

Follow these steps in order. I'll tell you exactly when to login to each service.

---

## Step 1: Install Dependencies (5 minutes)

```bash
cd HackSussex/gaming

# Install frontend dependencies
npm install @auth0/auth0-spa-js socket.io-client

# Install backend dependencies
cd vultr-backend
npm install
cd ..
```

---

## Step 2: Auth0 Setup (10 minutes)

### 🔐 LOGIN TO AUTH0 NOW

1. Go to https://auth0.com
2. Click **Sign Up** (use your email)
3. Create account and verify email
4. Choose tenant name (e.g., `password-dash-dev`)

### Create Application

1. Go to **Applications** → **Applications**
2. Click **Create Application**
3. Name: `Password Dash Game`
4. Type: **Single Page Web Applications**
5. Click **Create**

### Get Your Credentials

Copy these values:
```
Domain: _________________.auth0.com
Client ID: _________________________________
```

### Configure URLs

In Application Settings, scroll to **Application URIs**:

**Allowed Callback URLs:**
```
http://localhost:5173, https://your-game.pages.dev
```

**Allowed Logout URLs:**
```
http://localhost:5173, https://your-game.pages.dev
```

**Allowed Web Origins:**
```
http://localhost:5173, https://your-game.pages.dev
```

Click **Save Changes**

### Create API

1. Go to **Applications** → **APIs**
2. Click **Create API**
3. Name: `Game Leaderboard API`
4. Identifier: `https://game-api.com`
5. Click **Create**

### Enable Social Login (Optional but Recommended)

1. Go to **Authentication** → **Social**
2. Enable **Google** (use Auth0 Dev Keys)
3. Enable **GitHub** (use Auth0 Dev Keys)
4. Click **Save**

### ✅ Auth0 Setup Complete!

---

## Step 3: Create Environment Files (2 minutes)

### Frontend Environment

Create `HackSussex/gaming/.env`:
```env
VITE_AUTH0_DOMAIN=YOUR_DOMAIN_FROM_STEP2.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP2
VITE_AUTH0_AUDIENCE=https://game-api.com
VITE_API_URL=http://localhost:3000/api
```

**Replace the values with your actual Auth0 credentials!**

---

## Step 4: Vultr Setup (15 minutes)

### 🌐 LOGIN TO VULTR NOW

1. Go to https://vultr.com
2. Sign up (you mentioned you have free access)
3. Add payment method if required

### Deploy Server

1. Click **Deploy** → **Deploy New Server**
2. Server Type: **Cloud Compute**
3. Location: Choose closest to you
4. Server Image: **Ubuntu 22.04 LTS**
5. Server Size: **$6/month** (or higher if free)
6. Click **Deploy Now**

Wait 2-3 minutes for deployment.

### Get Server Details

Copy these:
```
IP Address: ___.___.___.___
Password: ___________________
```

### Connect to Server

**Windows:**
- Download PuTTY from https://putty.org
- Host: YOUR_IP_ADDRESS
- Port: 22
- Click Open
- Login as: `root`
- Password: YOUR_PASSWORD

**Mac/Linux:**
```bash
ssh root@YOUR_IP_ADDRESS
# Enter password when prompted
```

### Setup Server (Copy/Paste These Commands)

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2

# Setup database
sudo -u postgres psql << EOF
CREATE DATABASE game_leaderboard;
CREATE USER gameapi WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE game_leaderboard TO gameapi;
\q
EOF

# Create API directory
mkdir -p /var/www/game-api
```

### Upload Backend Code

**From your local machine** (new terminal):
```bash
cd HackSussex/gaming
scp -r vultr-backend/* root@YOUR_IP_ADDRESS:/var/www/game-api/
```

### Configure Backend

**Back on the server:**
```bash
cd /var/www/game-api

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=3000
NODE_ENV=production
DB_USER=gameapi
DB_NAME=game_leaderboard
DB_PASSWORD=YourSecurePassword123!
DB_HOST=localhost
DB_PORT=5432
AUTH0_DOMAIN=YOUR_DOMAIN.auth0.com
AUTH0_AUDIENCE=https://game-api.com
ALLOWED_ORIGINS=http://localhost:5173,https://your-game.pages.dev
EOF

# Start API
pm2 start server.js --name game-api
pm2 save
pm2 startup
# Run the command it outputs

# Configure Nginx
cat > /etc/nginx/sites-available/game-api << 'EOF'
server {
    listen 80;
    server_name YOUR_IP_ADDRESS;

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
ln -s /etc/nginx/sites-available/game-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Test API

```bash
curl http://YOUR_IP_ADDRESS/api/health
```

Should return: `{"status":"ok",...}`

### ✅ Vultr Setup Complete!

---

## Step 5: Update Frontend Config (1 minute)

Update your `.env` file:
```env
VITE_AUTH0_DOMAIN=YOUR_DOMAIN.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://game-api.com
VITE_API_URL=http://YOUR_IP_ADDRESS/api
```

---

## Step 6: Test Locally (5 minutes)

```bash
cd HackSussex/gaming
npm run dev
```

Open http://localhost:5173

**Test:**
- ✅ Game loads
- ✅ Can play Level 1
- ✅ Login button appears
- ✅ Click login → redirects to Auth0
- ✅ Login with Google/GitHub
- ✅ Redirects back to game
- ✅ Play and complete game
- ✅ Score is submitted

---

## Step 7: Cloudflare Pages Deployment (10 minutes)

### 🌩️ LOGIN TO CLOUDFLARE NOW

1. Go to https://dash.cloudflare.com
2. Sign up/login
3. Go to **Pages**

### Push to GitHub

```bash
cd HackSussex/gaming

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub
# Then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Deploy to Cloudflare Pages

1. In Cloudflare, click **Create a project**
2. Click **Connect to Git**
3. Authorize GitHub
4. Select your repository
5. Click **Begin setup**

**Build settings:**
- Project name: `password-dash-game`
- Production branch: `main`
- Framework: `Vite`
- Build command: `npm run build`
- Build output: `dist`

**Environment variables:**
```
VITE_AUTH0_DOMAIN = YOUR_DOMAIN.auth0.com
VITE_AUTH0_CLIENT_ID = YOUR_CLIENT_ID
VITE_AUTH0_AUDIENCE = https://game-api.com
VITE_API_URL = http://YOUR_IP_ADDRESS/api
```

6. Click **Save and Deploy**

Wait 3-5 minutes for build.

### Get Your URL

Copy your Cloudflare Pages URL:
```
https://password-dash-game.pages.dev
```

### Update Auth0 URLs

1. Go back to Auth0 Dashboard
2. Go to your Application settings
3. Update **Allowed Callback URLs**, **Logout URLs**, and **Web Origins**:
```
http://localhost:5173,
https://password-dash-game.pages.dev
```
4. Click **Save**

### Update Vultr CORS

SSH into your Vultr server:
```bash
ssh root@YOUR_IP_ADDRESS
cd /var/www/game-api
nano .env
```

Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=http://localhost:5173,https://password-dash-game.pages.dev
```

Save (Ctrl+X, Y, Enter)

Restart API:
```bash
pm2 restart game-api
```

### ✅ Cloudflare Deployment Complete!

---

## Step 8: Final Testing (5 minutes)

Visit your Cloudflare URL: `https://password-dash-game.pages.dev`

**Test everything:**
- ✅ Game loads
- ✅ Login works
- ✅ Play all 3 levels
- ✅ Complete game
- ✅ Score submits
- ✅ View leaderboard
- ✅ View profile

---

## 🎉 YOU'RE DONE!

Your game is now live with:
- ✅ Auth0 authentication
- ✅ Vultr backend API
- ✅ Cloudflare Pages hosting
- ✅ Leaderboard system
- ✅ User profiles

**Share your game:**
`https://password-dash-game.pages.dev`

---

## Troubleshooting

### Login doesn't work
- Check Auth0 URLs match exactly
- Check browser console for errors
- Verify `.env` values are correct

### API not responding
```bash
ssh root@YOUR_IP_ADDRESS
pm2 logs game-api
```

### Leaderboard not loading
- Check API health: `http://YOUR_IP_ADDRESS/api/health`
- Check CORS settings in backend `.env`

---

## What's Next?

- Add sounds (follow ELEVENLABS_SOUND_GUIDE.md)
- Add more features (follow ADVANCED_INTEGRATION.md)
- Customize styling
- Add achievements
- Add social sharing

Enjoy your game! 🎮
