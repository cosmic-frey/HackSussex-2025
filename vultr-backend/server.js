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

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
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
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Auth0 JWT verification
const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, getKey, {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
    }, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
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
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, difficulty)
        );
        
        CREATE INDEX IF NOT EXISTS idx_difficulty_score ON leaderboard(difficulty, score DESC);
        CREATE INDEX IF NOT EXISTS idx_user_id ON leaderboard(user_id);
        CREATE INDEX IF NOT EXISTS idx_created_at ON leaderboard(created_at DESC);
    `;
    
    try {
        await pool.query(createTableQuery);
        console.log('✓ Database tables initialized');
    } catch (err) {
        console.error('✗ Error initializing database:', err);
    }
}

initDatabase();

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
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

        if (typeof score !== 'number' || score <= 0) {
            return res.status(400).json({ error: 'Invalid score' });
        }

        if (typeof totalCoins !== 'number' || totalCoins < 0) {
            return res.status(400).json({ error: 'Invalid total coins' });
        }

        if (typeof bossKillTime !== 'number' || bossKillTime <= 0) {
            return res.status(400).json({ error: 'Invalid boss kill time' });
        }

        const userId = req.user.sub;
        const username = req.user.name || req.user.nickname || req.user.email || 'Anonymous';

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
                updated_at = CASE 
                    WHEN EXCLUDED.score > leaderboard.score THEN CURRENT_TIMESTAMP 
                    ELSE leaderboard.updated_at 
                END
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId, username, difficulty, score, totalCoins, bossKillTime,
            level1Coins, level2Coins, level2Alerts
        ]);

        console.log(`Score submitted: ${username} - ${difficulty} - ${score}`);

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Score submitted successfully'
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
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);

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
                updated_at,
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

// Get leaderboard stats
app.get('/api/stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                difficulty,
                COUNT(*) as total_players,
                AVG(score) as avg_score,
                MAX(score) as highest_score,
                MIN(boss_kill_time) as fastest_kill
            FROM leaderboard
            GROUP BY difficulty
            ORDER BY difficulty;
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ API server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});
