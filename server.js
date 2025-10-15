const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// File-based storage
const DATA_FILE = path.join(__dirname, 'leaderboard.json');
let leaderboard = [];

// File storage functions
function saveToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(leaderboard, null, 2));
    console.log('Data saved to file');
  } catch (err) {
    console.error('Error saving to file:', err);
  }
}

function loadFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      leaderboard = JSON.parse(data);
      console.log('Data loaded from file:', leaderboard.length, 'entries');
    } else {
      console.log('No data file found, starting fresh');
    }
  } catch (err) {
    console.error('Error loading from file:', err);
    leaderboard = [];
  }
}

// Load data on startup
loadFromFile();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// API Routes

// Get all leaderboard entries
app.get('/api/leaderboard', (req, res) => {
  const sortedEntries = leaderboard.sort((a, b) => {
    if (b.codes.length !== a.codes.length) {
      return b.codes.length - a.codes.length;
    }
    return a.timestamp - b.timestamp;
  });
  res.json(sortedEntries);
});

// Submit a code
app.post('/api/submit', (req, res) => {
  const { teamName, code } = req.body;
  
  if (!teamName || !code) {
    return res.status(400).json({ error: 'Team name and code are required' });
  }
  
  const existingTeamIndex = leaderboard.findIndex(entry => 
    entry.teamName.toLowerCase() === teamName.toLowerCase()
  );
  
  if (existingTeamIndex >= 0) {
    const existingTeam = leaderboard[existingTeamIndex];
    
    if (existingTeam.codes.includes(code)) {
      return res.json({ 
        success: false, 
        duplicate: true,
        codesCount: existingTeam.codes.length 
      });
    }
    
    existingTeam.codes.push(code);
    existingTeam.lastUpdate = Date.now();
    saveToFile(); // Save to file
    
    return res.json({ 
      success: true, 
      codesCount: existingTeam.codes.length,
      isNew: false
    });
  } else {
    // New team
    const newEntry = {
      teamName: teamName,
      codes: [code],
      timestamp: Date.now(),
      lastUpdate: Date.now()
    };
    
    leaderboard.push(newEntry);
    saveToFile(); // Save to file
    
    return res.json({ 
      success: true, 
      codesCount: 1,
      isNew: true
    });
  }
});

// Admin endpoint to reset leaderboard
app.post('/api/admin/reset', (req, res) => {
  const { password } = req.body;
  
  // Use environment variable for admin password or default
  const adminPassword = process.env.ADMIN_PASSWORD || 'SKYNET2029';
  
  if (password !== adminPassword) {
    return res.status(403).json({ error: 'Invalid admin password' });
  }
  
  // Reset file storage
  leaderboard = [];
  saveToFile(); // Save empty array to file
  res.json({ success: true, message: 'Leaderboard reset' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

