# Deploy to Vercel - Quick Guide

## Prerequisites
You need to install Git first:

### Windows:
1. Download from: https://git-scm.com/download/win
2. Run the installer
3. Choose default options
4. Restart your terminal

## Quick Deploy Steps

### 1. Initialize Git (after installing Git)
```bash
cd "C:\Users\freja\OneDrive\Documents\gaming\HackSussex\gaming"
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
git add .
git commit -m "Password Quest game with Auth0 integration"
```

### 2. Create GitHub Repository
1. Go to https://github.com
2. Sign up or log in
3. Click "New repository"
4. Name it: `password-quest`
5. Click "Create repository"
6. Copy the commands GitHub shows you

### 3. Push to GitHub
Replace YOUR_USERNAME with your GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/password-quest.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" (use GitHub account)
3. Click "Import Project"
4. Select `password-quest` repository
5. Click "Deploy"
6. Your game will be live at: `https://password-quest.vercel.app`

### 5. Update Auth0 Settings
After Vercel deployment, update Auth0:

Auth0 Dashboard → Applications → Settings

Add to **Allowed Callback URLs**:
```
https://password-quest.vercel.app
```

Add to **Allowed Logout URLs**:
```
https://password-quest.vercel.app
```

Add to **Allowed Web Origins**:
```
https://password-quest.vercel.app
```

## Done! 🎮

Your game is now live on the internet!

## Optional: Custom Domain

If you have a domain name:
1. In Vercel dashboard, go to Settings → Domains
2. Add your domain
3. Update your domain's DNS settings to point to Vercel
4. Update Auth0 callback URLs with your custom domain

