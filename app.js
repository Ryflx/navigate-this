// Configurable allowed tokens (MVP). In production, validate server-side.
const CONFIG = {
  // Valid Genesis codes - teams can submit multiple codes
  genesisCodes: {
    "AND969962419": "Document Code", // Code in black text in documents
    "AND310603257": "AI Hidden Code"    // Code hidden with AI
  },
  nextClueUrl: "https://example.com/your-prerecorded-video", // TODO: replace with real URL
  storageKey: "navigate-this-leaderboard-v1",
  // Admin password for countdown control
  adminPassword: "SKYNET2029" // Change this to your preferred password
};

const $ = (sel) => document.querySelector(sel);

const state = {
  leaderboard: [],
  countdown: {
    // Deadline: November 5th, 2025 at 12:30 PM UK time (end of 2-hour session)
    deadline: new Date('2025-11-05T12:30:00+00:00'), // UK time (GMT) - 12:30 PM
    intervalId: null
  },
  adminMode: false,
  apiUrl: window.location.origin // Use same origin for API calls
};

async function loadLeaderboard() {
  try {
    const response = await fetch(`${state.apiUrl}/api/leaderboard`);
    if (response.ok) {
      state.leaderboard = await response.json();
    } else {
      console.error('Failed to load leaderboard');
      state.leaderboard = [];
    }
  } catch (e) {
    console.error('Error loading leaderboard:', e);
    state.leaderboard = [];
  }
}

async function submitCode(teamName, code) {
  try {
    const response = await fetch(`${state.apiUrl}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teamName, code })
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to submit code');
    }
  } catch (e) {
    console.error('Error submitting code:', e);
    throw e;
  }
}

function isValidGenesisCode(code) {
  return CONFIG.genesisCodes.hasOwnProperty(code);
}

function getCodeType(code) {
  return CONFIG.genesisCodes[code] || "Unknown";
}

function findTeamEntry(teamName) {
  return state.leaderboard.find(entry => 
    entry.teamName.toLowerCase() === teamName.trim().toLowerCase()
  );
}

// No longer needed - submission handled by API

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function renderLeaderboard() {
  const list = $("#leaderboard");
  list.innerHTML = "";
  state.leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    
    // Team name and code count badge
    const teamInfo = document.createElement("div");
    teamInfo.className = "team-info";
    
    const teamName = document.createElement("span");
    teamName.className = "team-name";
    teamName.textContent = entry.teamName;
    teamInfo.appendChild(teamName);
    
    // Show codes as badges
    const codesBadge = document.createElement("span");
    codesBadge.className = `codes-badge codes-${entry.codes.length}`;
    codesBadge.textContent = `${entry.codes.length}/${Object.keys(CONFIG.genesisCodes).length} codes`;
    teamInfo.appendChild(codesBadge);
    
    li.appendChild(teamInfo);
    
    // Show which codes were submitted
    const codesDetail = document.createElement("div");
    codesDetail.className = "codes-detail";
    entry.codes.forEach(code => {
      const codeTag = document.createElement("span");
      codeTag.className = "code-tag";
      codeTag.textContent = `✓ ${getCodeType(code)}`;
      codesDetail.appendChild(codeTag);
    });
    li.appendChild(codesDetail);
    
    // Timestamp
    const time = document.createElement("div");
    time.className = "time";
    time.textContent = `First submission: ${formatTime(entry.timestamp)}`;
    li.appendChild(time);
    
    list.appendChild(li);
  });
}

function showLeaderboard() {
  $("#login-section").classList.add("hidden");
  $("#leaderboard-section").classList.remove("hidden");
  renderLeaderboard();
}

function showLoginForm() {
  $("#leaderboard-section").classList.add("hidden");
  $("#login-section").classList.remove("hidden");
  // Clear form for security
  $("#teamName").value = "";
  $("#token").value = "";
  $("#login-message").textContent = "";
}

async function refreshLeaderboard() {
  await loadLeaderboard();
  renderLeaderboard();
}

async function onSubmitLogin(e) {
  e.preventDefault();
  const teamName = $("#teamName").value || "";
  const code = $("#token").value || "";
  const msg = $("#login-message");
  const submitBtn = $("#login-form button[type='submit']");
  
  msg.style.color = "var(--danger)";

  if (!teamName.trim()) {
    msg.textContent = "ERROR: UNIT DESIGNATION REQUIRED";
    return;
  }
  if (!code.trim()) {
    msg.textContent = "ERROR: GENESIS CODE REQUIRED";
    return;
  }
  
  if (!isValidGenesisCode(code)) {
    msg.textContent = "ACCESS DENIED: INVALID GENESIS CODE";
    return;
  }

  // Disable button during submission
  submitBtn.disabled = true;
  msg.textContent = "PROCESSING...";

  try {
    // Submit to API
    const result = await submitCode(teamName, code);
    
    msg.style.color = "var(--accent)";
    const totalCodes = Object.keys(CONFIG.genesisCodes).length;
    
    if (result.duplicate) {
      msg.textContent = `CODE ALREADY SUBMITTED. YOU HAVE ${result.codesCount}/${totalCodes} CODES.`;
      setTimeout(async () => {
        await loadLeaderboard();
        showLeaderboard();
      }, 2000);
    } else if (result.success) {
      if (result.codesCount === totalCodes) {
        msg.textContent = `GENESIS COMPLETE! ALL ${totalCodes} CODES UPLOADED. WELCOME TO THE RESISTANCE.`;
      } else if (result.codesCount > 1) {
        msg.textContent = `${getCodeType(code)} VERIFIED. ${result.codesCount}/${totalCodes} CODES UPLOADED. CONTINUE MISSION.`;
      } else {
        msg.textContent = `${getCodeType(code)} VERIFIED. ${result.codesCount}/${totalCodes} CODES UPLOADED.`;
      }
      
      setTimeout(async () => {
        await loadLeaderboard();
        showLeaderboard();
      }, 2500);
    }
  } catch (error) {
    msg.style.color = "var(--danger)";
    msg.textContent = "ERROR: SUBMISSION FAILED. TRY AGAIN.";
    console.error('Submission error:', error);
  } finally {
    submitBtn.disabled = false;
  }
}

async function onReset() {
  if (confirm("PURGE ALL RESISTANCE REGISTRY DATA? THIS ACTION IS IRREVERSIBLE.")) {
    try {
      const response = await fetch(`${state.apiUrl}/api/admin/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: CONFIG.adminPassword })
      });
      
      if (response.ok) {
        state.leaderboard = [];
        renderLeaderboard();
        alert('LEADERBOARD PURGED');
      } else {
        alert('PURGE FAILED: AUTHORIZATION ERROR');
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('PURGE FAILED: SYSTEM ERROR');
    }
  }
}

// Countdown Timer Functions
function formatCountdown(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function calculateTimeRemaining() {
  const now = new Date();
  const deadline = state.countdown.deadline;
  
  // Calculate seconds remaining until deadline
  const remainingSeconds = Math.floor((deadline - now) / 1000);
  
  return Math.max(0, remainingSeconds);
}

function playBeep(frequency = 800, duration = 100) {
  try {
    // Create audio context for beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    // Fallback: use system beep if available
    console.log('\a'); // Bell character (may not work in all browsers)
  }
}

function updateCountdownDisplay() {
  const display = $("#countdown-timer");
  const remainingSeconds = calculateTimeRemaining();
  
  display.textContent = formatCountdown(remainingSeconds);
  
  // Add visual warnings and audio feedback based on time remaining
  display.classList.remove("warning", "critical");
  if (remainingSeconds === 0) {
    display.classList.add("critical");
    // Continuous beep when time is up
    playBeep(1000, 200);
  } else if (remainingSeconds <= 60 && remainingSeconds % 10 === 0) { // Every 10 seconds in last minute
    display.classList.add("critical");
    playBeep(800, 150);
  } else if (remainingSeconds <= 300 && remainingSeconds % 30 === 0) { // Every 30 seconds in last 5 minutes
    display.classList.add("critical");
    playBeep(600, 100);
  } else if (remainingSeconds <= 1800 && remainingSeconds % 60 === 0) { // Every minute in last 30 minutes
    display.classList.add("warning");
    playBeep(400, 80);
  }
}

function toggleAdminMode() {
  const password = prompt("ADMIN AUTHENTICATION REQUIRED\nEnter password:");
  
  if (password === CONFIG.adminPassword) {
    state.adminMode = !state.adminMode;
    const resetBtn = $("#reset");
    if (state.adminMode) {
      resetBtn.classList.remove("hidden");
      alert("ADMIN MODE ACTIVATED");
    } else {
      resetBtn.classList.add("hidden");
      alert("ADMIN MODE DEACTIVATED");
    }
  } else if (password !== null) {
    alert("ACCESS DENIED: INVALID CREDENTIALS");
  }
}

async function init() {
  $("#year").textContent = String(new Date().getFullYear());
  
  // Load leaderboard from API
  await loadLeaderboard();
  
  // Event listeners for form
  $("#login-form").addEventListener("submit", onSubmitLogin);
  $("#reset").addEventListener("click", onReset);
  
  // Event listeners for navigation
  $("#submit-another").addEventListener("click", showLoginForm);
  $("#refresh-leaderboard").addEventListener("click", refreshLeaderboard);
  
  // Admin mode toggle with keyboard shortcut (Ctrl/Cmd + Shift + A)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      toggleAdminMode();
    }
  });
  
  // Initialize and start countdown timer (updates every second)
  updateCountdownDisplay();
  state.countdown.intervalId = setInterval(updateCountdownDisplay, 1000);
  
  // Refresh leaderboard every 10 seconds to show new submissions
  setInterval(async () => {
    await loadLeaderboard();
    // Only re-render if leaderboard is visible
    if (!$("#leaderboard-section").classList.contains("hidden")) {
      renderLeaderboard();
    }
  }, 10000);
}

document.addEventListener("DOMContentLoaded", init);



