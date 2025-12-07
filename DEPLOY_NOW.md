# 🚀 Vercel Deployment - Complete Setup

Your Password Quest game is ready to deploy! Follow these steps:

---

## ✅ What's Already Done

- ✓ Game code ready (`src/`, `index.html`, `vite.config.js`)
- ✓ `vercel.json` configuration created
- ✓ `.gitignore` configured
- ✓ Auth0 integration ready
- ✓ Build configuration set up

---

## 📋 Step-by-Step Deployment

### Step 1: Install Git (5 minutes)

**Windows:**
1. Go to https://git-scm.com/download/win
2. Download and run the installer
3. Choose "Use Git from Git Bash only" (or default)
4. Click through all defaults
5. **Restart your PowerShell terminal**

**Verify Git installed:**
```powershell
git --version
```

---

### Step 2: Initialize Git Repository (2 minutes)

```powershell
cd "C:\Users\freja\OneDrive\Documents\gaming\HackSussex\gaming"

# Configure Git (use YOUR info)
git config user.email "your-email@gmail.com"
git config user.name "Your Name"

# Add all files
git add .

# Create initial commit
git commit -m "Password Quest game with Auth0 integration"
```

---

### Step 3: Create GitHub Account & Repository (5 minutes)

1. Go to https://github.com
2. Click **Sign up**
3. Create account with:
   - Email
   - Password
   - Username (e.g., `freja-gaming`)
4. Verify email
5. Click **New repository**
6. Fill in:
   - Repository name: `password-quest`
   - Description: `A privacy-themed auto-runner game`
   - Public
7. Click **Create repository**

**Copy the commands shown!** They'll look like:
```
git remote add origin https://github.com/YOUR_USERNAME/password-quest.git
git branch -M main
git push -u origin main
```

---

### Step 4: Push Code to GitHub (2 minutes)

Paste the commands from Step 3 into PowerShell:

```powershell
cd "C:\Users\freja\OneDrive\Documents\gaming\HackSussex\gaming"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/password-quest.git
git branch -M main
git push -u origin main
```

---

### Step 5: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **GitHub** (it will ask for permission)
4. Authorize Vercel to access your GitHub
5. Click **Import Project**
6. Select `password-quest` repository
7. Vercel will auto-detect everything ✓
8. Click **Deploy**

**Wait 1-2 minutes...**

Your game is now live at: **`https://password-quest.vercel.app`** 🎉

---

### Step 6: Configure Auth0 (3 minutes)

Now update Auth0 with your Vercel URL:

1. Go to https://manage.auth0.com
2. Applications → Your App Settings
3. Update **Allowed Callback URLs**:
   ```
   http://localhost:5173
   https://password-quest.vercel.app
   ```
4. Update **Allowed Logout URLs**:
   ```
   http://localhost:5173
   https://password-quest.vercel.app
   ```
5. Update **Allowed Web Origins**:
   ```
   http://localhost:5173
   https://password-quest.vercel.app
   ```
6. Click **Save**

---

### Step 7: Set Environment Variables in Vercel (2 minutes)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables (get values from Auth0 dashboard):

| Key | Value |
|-----|-------|
| `VITE_AUTH0_DOMAIN` | `your-tenant.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Your Auth0 Client ID |
| `VITE_AUTH0_AUDIENCE` | `https://api.password-quest.com` |
| `VITE_VULTR_API_URL` | `http://localhost:3000` (or your backend URL) |

4. Click **Save**
5. Go to **Deployments** → Click latest → **Redeploy**

---

## 🎯 You're Done!

Your game is now live at: **https://password-quest.vercel.app** 🚀

### Test It:
1. Open https://password-quest.vercel.app
2. Click **LOGIN**
3. Create a new Auth0 account
4. You should see the game menu
5. Try playing a level!

---

## 📱 Optional: Add Custom Domain

If you have a domain name (e.g., `mygame.com`):

1. In Vercel dashboard: **Settings** → **Domains**
2. Add your domain name
3. Follow Vercel's DNS instructions
4. Update Auth0 URLs to include your domain

---

## 🔧 Troubleshooting

### "Git not found"
- Restart PowerShell after installing Git
- Or use PowerShell as Administrator

### "Failed to connect to GitHub"
- Make sure you authorized Vercel
- Check your GitHub account permissions

### "Game won't load"
- Check browser console for errors (F12)
- Verify environment variables are set in Vercel
- Check Auth0 callback URLs are correct

### "Login doesn't work"
- Verify Auth0 domain and client ID in Vercel env vars
- Check Auth0 allowed URLs include your Vercel domain

---

## 🎓 What You Learned

✓ Git version control
✓ GitHub repositories
✓ Vercel continuous deployment
✓ Environment variable management
✓ Full-stack deployment pipeline

---

## 📚 Next Steps

1. Monitor your game at https://password-quest.vercel.app
2. When ready, connect your backend (Vultr)
3. Share the link with friends!
4. Watch your leaderboard grow

**Congratulations! Your game is now live on the internet! 🎮**

