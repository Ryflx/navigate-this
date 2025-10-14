// Configurable allowed tokens (MVP). In production, validate server-side.
const CONFIG = {
  allowedTokens: [
    // Replace with real extracted tokens. Order does not matter.
    "SIGMA-PASS-777" // example winning token
  ],
  // Which token actually grants access. Others are decoys.
  winningToken: "SIGMA-PASS-777",
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
  adminMode: false
};

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    state.leaderboard = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.leaderboard = [];
  }
}

function saveLeaderboard() {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.leaderboard));
}

function isTokenAllowed(token) {
  return CONFIG.allowedTokens.includes(token);
}

function isWinningToken(token) {
  return token === CONFIG.winningToken;
}

function addToLeaderboard(teamName) {
  const entry = {
    teamName: teamName.trim(),
    timestamp: Date.now()
  };
  state.leaderboard.push(entry);
  state.leaderboard.sort((a, b) => a.timestamp - b.timestamp);
  saveLeaderboard();
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function renderLeaderboard() {
  const list = $("#leaderboard");
  list.innerHTML = "";
  state.leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = entry.teamName;
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = ` – ${formatTime(entry.timestamp)}`;
    li.appendChild(time);
    list.appendChild(li);
  });
}

function showLeaderboard() {
  $("#login-section").classList.add("hidden");
  $("#leaderboard-section").classList.remove("hidden");
  renderLeaderboard();
}

function onSubmitLogin(e) {
  e.preventDefault();
  const teamName = $("#teamName").value || "";
  const token = $("#token").value || "";
  const msg = $("#login-message");
  msg.style.color = "var(--danger)";

  if (!teamName.trim()) {
    msg.textContent = "ERROR: UNIT DESIGNATION REQUIRED";
    return;
  }
  if (!token.trim()) {
    msg.textContent = "ERROR: ACCESS CODE REQUIRED";
    return;
  }
  if (!isTokenAllowed(token)) {
    msg.textContent = "ACCESS DENIED: INVALID AUTHORIZATION";
    return;
  }
  if (!isWinningToken(token)) {
    msg.textContent = "ALERT: INCORRECT SEQUENCE. REROUTE PROTOCOL.";
    return;
  }

  // Success
  addToLeaderboard(teamName);
  msg.style.color = "var(--accent)";
  msg.textContent = "AUTHENTICATION SUCCESSFUL. WELCOME TO THE RESISTANCE.";
  showLeaderboard();
}

function onReset() {
  if (confirm("PURGE ALL RESISTANCE REGISTRY DATA? THIS ACTION IS IRREVERSIBLE.")) {
    state.leaderboard = [];
    saveLeaderboard();
    renderLeaderboard();
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

function updateCountdownDisplay() {
  const display = $("#countdown-timer");
  const remainingSeconds = calculateTimeRemaining();
  
  display.textContent = formatCountdown(remainingSeconds);
  
  // Add visual warnings based on time remaining
  display.classList.remove("warning", "critical");
  if (remainingSeconds === 0) {
    display.classList.add("critical");
  } else if (remainingSeconds <= 300) { // Last 5 minutes
    display.classList.add("critical");
  } else if (remainingSeconds <= 1800) { // Last 30 minutes
    display.classList.add("warning");
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

function init() {
  $("#year").textContent = String(new Date().getFullYear());
  loadLeaderboard();
  
  // Event listeners for form
  $("#login-form").addEventListener("submit", onSubmitLogin);
  $("#reset").addEventListener("click", onReset);
  
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
}

document.addEventListener("DOMContentLoaded", init);



