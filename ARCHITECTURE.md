# Architecture Documentation - Password Quest

## System Overview

Password Quest is a privacy-themed auto-runner game with full stack integration across three platforms:

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT TIER (Frontend)                    │
│  Phaser 3 Game Engine + React/Vue Framework                 │
│  - Webpack/Vite bundler                                     │
│  - Auth0 SPA JS SDK                                         │
│  - Custom ApiService for backend calls                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│              EDGE TIER (Cloudflare Workers)                 │
│  - Global CDN caching                                       │
│  - CORS handling                                            │
│  - Security headers                                         │
│  - Request rate limiting                                    │
│  - Analytics collection                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│         API TIER (Vultr Backend - Express.js)               │
│  - Token validation                                         │
│  - Score submission                                         │
│  - Leaderboard retrieval                                    │
│  - Database operations                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│             IDENTITY TIER (Auth0)                           │
│  - User authentication                                      │
│  - Token generation                                         │
│  - Token validation (JWKS)                                  │
│  - User profile management                                  │
└─────────────────────────────────────────────────────────────┘

                      │
┌─────────────────────▼───────────────────────────────────────┐
│           DATA TIER (PostgreSQL on Vultr)                   │
│  - Leaderboard storage                                      │
│  - Score history                                            │
│  - User statistics                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure
```
src/
├── main.js                 # Entry point, Phaser config
├── index.html              # HTML template
├── scenes/
│   ├── BootScene.js       # Initialize game
│   ├── PreloadScene.js    # Load assets
│   ├── MenuScene.js       # Main menu with Auth0 login
│   ├── GameScene.js       # Main gameplay
│   ├── GameOverScene.js   # Victory/defeat with score submission
│   ├── LeaderboardScene.js# Display top scores
│   ├── ProfileScene.js    # User profile and stats
│   └── ... (other scenes)
├── services/
│   ├── AuthService.js     # Auth0 integration (class-based)
│   ├── auth.js            # Legacy auth functions (backward compat)
│   ├── ApiService.js      # API calls (class-based)
│   ├── api.js             # ApiService instance
│   ├── SoundManager.js    # Audio management
│   └── config.js          # Configuration
└── assets/
    ├── images/
    ├── audio/
    └── sprites/
```

### AuthService Class

**File:** `src/services/AuthService.js`

Singleton service handling all Auth0 operations:

```javascript
class AuthService {
  async init()              // Initialize Auth0 client
  async login()             // Redirect to Auth0 login
  async logout()            // Logout user
  async getAccessToken()    // Get JWT token
  getUser()                 // Get current user
  isUserAuthenticated()     // Check auth status
  isInitialized()           // Check initialization
}
```

**Key Features:**
- Automatic Auth0 redirect callback handling
- Silent token renewal
- Local storage caching
- Error handling and logging

### ApiService Class

**File:** `src/services/ApiService.js`

Singleton service for all API calls:

```javascript
class ApiService {
  async request(endpoint, options)    // Generic request
  get(endpoint)                       // GET request
  post(endpoint, body)                // POST request
  async submitScore(scoreData)        // Submit game score
  async getLeaderboard(difficulty)    // Get top scores
  async getUserScores()               // Get user's scores
  async getLeaderboardStats()         // Get stats
  async healthCheck()                 // Check backend health
}
```

**Features:**
- Automatic Auth0 token injection
- Request timeout handling
- Comprehensive error handling
- Base URL from environment variables

### Scene Integration

**GameOverScene** - Score Submission
```javascript
// Called when player finishes game
async submitVictoryScore() {
  const scoreData = {
    difficulty: this.difficulty,
    score: this.finalScore,
    totalCoins: this.totalCoins,
    bossKillTime: this.bossKillTime,
    level1Coins: this.level1Coins,
    level2Coins: this.level2Coins,
    level2Alerts: this.level2Alerts
  };
  
  await ApiService.submitScore(scoreData);
}
```

**LeaderboardScene** - Display Rankings
```javascript
async loadLeaderboard() {
  const leaderboard = await ApiService.getLeaderboard(this.difficulty);
  // Display in scene
}
```

---

## Backend Architecture

### Directory Structure
```
vultr-backend/
├── server.js          # Express app & routes
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .env.local         # Local development (git ignored)
└── .env               # Production (git ignored)
```

### API Endpoints

#### Authentication
All protected endpoints require Auth0 JWT token in `Authorization: Bearer <token>` header

#### Public Endpoints

**GET /api/health**
```
Response: {
  status: "ok",
  timestamp: "2024-01-01T12:00:00Z",
  uptime: 12345.67
}
```

**GET /api/leaderboard/:difficulty?limit=100**
```
difficulty: "easy" | "medium" | "hard"
limit: number (default 100, max 1000)

Response: {
  success: true,
  difficulty: "easy",
  count: 50,
  data: [
    {
      rank: 1,
      username: "Player1",
      score: 1000.5,
      total_coins: 50,
      boss_kill_time: 15.2,
      created_at: "2024-01-01T10:00:00Z"
    },
    ...
  ]
}
```

**GET /api/stats**
```
Response: {
  success: true,
  data: [
    {
      difficulty: "easy",
      total_players: 150,
      avg_score: 450.25,
      highest_score: 1500.5,
      fastest_kill: 8.2
    },
    ...
  ]
}
```

#### Protected Endpoints

**POST /api/scores** (Requires Auth0 token)
```
Request Body: {
  difficulty: "easy" | "medium" | "hard",
  score: number,
  totalCoins: number,
  bossKillTime: number,
  level1Coins: number,
  level2Coins: number,
  level2Alerts: number
}

Response: {
  success: true,
  data: {
    id: 1,
    user_id: "auth0|...",
    username: "player@example.com",
    difficulty: "easy",
    score: 1000.5,
    total_coins: 50,
    boss_kill_time: 15.2,
    rank: 1,
    created_at: "2024-01-01T12:00:00Z"
  },
  message: "Score submitted successfully"
}
```

**GET /api/scores/me** (Requires Auth0 token)
```
Response: {
  success: true,
  data: [
    {
      difficulty: "easy",
      score: 1000.5,
      total_coins: 50,
      boss_kill_time: 15.2,
      rank: 1,
      created_at: "2024-01-01T12:00:00Z"
    },
    ...
  ]
}
```

### Database Schema

**leaderboard** table
```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,              -- Auth0 user ID
  username VARCHAR(100) NOT NULL,             -- Email or name
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score DECIMAL(10, 2) NOT NULL,              -- Calculated score
  total_coins INTEGER NOT NULL,               -- Total password tokens
  boss_kill_time DECIMAL(10, 2) NOT NULL,    -- Seconds to kill boss
  level1_coins INTEGER NOT NULL,              -- Level 1 tokens
  level2_coins INTEGER NOT NULL,              -- Level 2 tokens
  level2_alerts INTEGER NOT NULL,             -- Number of alerts in level 2
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, difficulty)                -- One score per user per difficulty
);

-- Indexes for performance
CREATE INDEX idx_difficulty_score ON leaderboard(difficulty, score DESC);
CREATE INDEX idx_user_id ON leaderboard(user_id);
CREATE INDEX idx_created_at ON leaderboard(created_at DESC);
```

### Auth0 Integration

**Token Verification Flow**

```
1. Frontend sends request with Authorization header
   Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

2. Backend receives request
   
3. Extract JWT from header
   
4. Verify signature using Auth0 JWKS endpoint
   GET https://your-domain.auth0.com/.well-known/jwks.json
   
5. Validate claims:
   - audience: matches VITE_AUTH0_AUDIENCE
   - issuer: matches Auth0 domain
   - expiration: token not expired
   
6. Extract user ID from token (sub claim)
   
7. Allow request or reject with 401
```

**JWT Payload Example**
```javascript
{
  "sub": "auth0|1234567890",      // User ID
  "email": "user@example.com",
  "name": "User Name",
  "aud": ["https://api.password-quest.com"],
  "iss": "https://your-domain.auth0.com/",
  "iat": 1704110400,              // Issued at
  "exp": 1704196800               // Expires in 24 hours
}
```

---

## Cloudflare Workers Architecture

### Features

**Request Routing**
- API requests → Vultr backend
- Static assets → Cache with long TTL
- HTML/pages → Cache with short TTL

**CORS Handling**
- Automatically add CORS headers
- Handle preflight OPTIONS requests
- Support all standard methods

**Security**
- Add security headers (X-Content-Type-Options, etc.)
- CSP headers
- Referrer-Policy
- Permissions-Policy

**Performance**
- Global edge caching
- Automatic compression
- Cache invalidation strategies

**Analytics**
- Log all requests
- Track response times
- Monitor error rates

### Deployment

```bash
# Local development
wrangler dev cloudflare-worker.js

# Production deployment
wrangler deploy cloudflare-worker.js

# View logs
wrangler tail
```

---

## Authentication Flow

### Login Sequence

```
User clicks LOGIN
    ↓
AuthService.login() called
    ↓
Redirect to Auth0:
https://your-domain.auth0.com/authorize?
  client_id=...&
  response_type=code&
  redirect_uri=https://password-quest.com&
  scope=openid profile email&
  audience=https://api.password-quest.com
    ↓
User enters credentials at Auth0
    ↓
Auth0 redirects back:
https://password-quest.com?code=...&state=...
    ↓
AuthService detects redirect
    ↓
Exchange code for tokens:
POST https://your-domain.auth0.com/oauth/token
  client_id=...&
  code=...&
  redirect_uri=...&
  client_secret=...
    ↓
Auth0 returns:
{
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
    ↓
AuthService stores tokens in localStorage
    ↓
User logged in! ✓
```

### Score Submission Flow

```
Game ends → GameOverScene created
    ↓
Check if user authenticated (AuthService.isUserAuthenticated())
    ↓
If authenticated, call submitVictoryScore()
    ↓
Get access token: await AuthService.getAccessToken()
    ↓
Send POST to /api/scores with:
  - Authorization: Bearer <token>
  - Payload: { difficulty, score, coins, etc }
    ↓
Cloudflare Worker receives request
    ↓
Forward to Vultr backend
    ↓
Backend receives request
    ↓
Verify JWT token using Auth0 JWKS
    ↓
If valid, extract user ID from token
    ↓
Insert/update score in PostgreSQL
    ↓
Return success response
    ↓
Score added to leaderboard! ✓
```

---

## Environment Variables

### Frontend (.env.local)
```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.password-quest.com
VITE_VULTR_API_URL=https://api.password-quest.com
```

### Backend (.env)
```
PORT=3000
NODE_ENV=production

DB_USER=postgres
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_NAME=password_quest
DB_PORT=5432

AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.password-quest.com

ALLOWED_ORIGINS=https://password-quest.com

LOG_LEVEL=info
```

### Cloudflare Worker (Environment Variables in dashboard)
```
BACKEND_URL=https://api.password-quest.com
ORIGIN_URL=https://password-quest.com
```

---

## Deployment Checklist

- [ ] Auth0 application created with correct URLs
- [ ] Auth0 API created with identifier
- [ ] Frontend environment variables set
- [ ] Backend environment variables set
- [ ] PostgreSQL database created
- [ ] Database user permissions configured
- [ ] Backend deployed to Vultr
- [ ] PM2 configured for auto-restart
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Cloudflare Worker deployed
- [ ] Cloudflare environment variables set
- [ ] Domain DNS pointing to Cloudflare
- [ ] Frontend deployed to Vercel/Netlify/CF Pages
- [ ] All URLs updated in Auth0
- [ ] Tested login flow end-to-end
- [ ] Tested score submission end-to-end

---

## Monitoring & Logs

### Vultr Backend Logs
```bash
# Real-time logs
pm2 logs password-quest-api

# Persistent logs
tail -f ~/.pm2/logs/password-quest-api-out.log
```

### Cloudflare Logs
- Dashboard > Workers > password-quest > Metrics
- Real-time logs available in Tail

### Database Logs
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Query statistics
sudo -u postgres psql -d password_quest -c "SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10;"
```

---

## Performance Optimization

### Frontend
- Code splitting for scenes
- Asset compression
- Vite tree-shaking
- Lazy loading for images

### Backend
- Database indexes on frequently queried columns
- Connection pooling with pg
- Rate limiting to prevent abuse
- Compression middleware

### Edge (Cloudflare)
- Global CDN caching
- Automatic compression
- Geographic routing
- DDoS protection

---

## Security Best Practices

1. **Secrets Management**
   - Never commit .env files
   - Use secure credential storage
   - Rotate secrets regularly

2. **API Security**
   - JWT token validation on all protected routes
   - Rate limiting
   - CORS validation
   - Input validation/sanitization

3. **Database Security**
   - Strong passwords (20+ characters)
   - Limited user permissions
   - Regular backups
   - Encrypted connections

4. **Transport Security**
   - HTTPS everywhere
   - HSTS headers
   - Certificate pinning (optional)

5. **OWASP Compliance**
   - Protect against SQL injection (using parameterized queries)
   - Protect against XSS
   - Protect against CSRF (via SOP)
   - Secure headers

