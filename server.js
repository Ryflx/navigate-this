const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Database connection
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('DATABASE_URL value:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database table
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        team_name VARCHAR(255) NOT NULL,
        codes TEXT[] NOT NULL,
        timestamp BIGINT NOT NULL,
        last_update BIGINT NOT NULL,
        UNIQUE(team_name)
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

initDB();

// API Routes

// Get all leaderboard entries
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT team_name, codes, timestamp, last_update FROM leaderboard ORDER BY array_length(codes, 1) DESC, timestamp ASC'
    );
    
    const entries = result.rows.map(row => ({
      teamName: row.team_name,
      codes: row.codes,
      timestamp: parseInt(row.timestamp),
      lastUpdate: parseInt(row.last_update)
    }));
    
    res.json(entries);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit a code
app.post('/api/submit', async (req, res) => {
  const { teamName, code } = req.body;
  
  if (!teamName || !code) {
    return res.status(400).json({ error: 'Team name and code are required' });
  }
  
  try {
    const client = await pool.connect();
    try {
      // Check if team exists
      const checkResult = await client.query(
        'SELECT codes FROM leaderboard WHERE team_name = $1',
        [teamName]
      );
      
      if (checkResult.rows.length > 0) {
        // Team exists - update codes
        const existingCodes = checkResult.rows[0].codes;
        
        if (existingCodes.includes(code)) {
          return res.json({ 
            success: false, 
            duplicate: true,
            codesCount: existingCodes.length 
          });
        }
        
        const updatedCodes = [...existingCodes, code];
        await client.query(
          'UPDATE leaderboard SET codes = $1, last_update = $2 WHERE team_name = $3',
          [updatedCodes, Date.now(), teamName]
        );
        
        return res.json({ 
          success: true, 
          codesCount: updatedCodes.length,
          isNew: false
        });
      } else {
        // New team
        await client.query(
          'INSERT INTO leaderboard (team_name, codes, timestamp, last_update) VALUES ($1, $2, $3, $4)',
          [teamName, [code], Date.now(), Date.now()]
        );
        
        return res.json({ 
          success: true, 
          codesCount: 1,
          isNew: true
        });
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error submitting code:', err);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// Admin endpoint to reset leaderboard
app.post('/api/admin/reset', async (req, res) => {
  const { password } = req.body;
  
  // Use environment variable for admin password or default
  const adminPassword = process.env.ADMIN_PASSWORD || 'SKYNET2029';
  
  if (password !== adminPassword) {
    return res.status(403).json({ error: 'Invalid admin password' });
  }
  
  try {
    await pool.query('DELETE FROM leaderboard');
    res.json({ success: true, message: 'Leaderboard reset' });
  } catch (err) {
    console.error('Error resetting leaderboard:', err);
    res.status(500).json({ error: 'Failed to reset leaderboard' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

