// Configurable allowed tokens (MVP). In production, validate server-side.
const CONFIG = {
  allowedTokens: [
    // Replace with real extracted tokens. Order does not matter.
    "OBSIDIAN-KEY-01",
    "CRYPT-DELTA-42",
    "SIGMA-PASS-777", // example winning token
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
    totalSeconds: 90 * 60, // 1 hour 30 minutes
    remainingSeconds: 90 * 60,
    isRunning: false,
    intervalId: null
  }
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
  $("#next-clue-link").href = CONFIG.nextClueUrl;
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

function updateCountdownDisplay() {
  const display = $("#countdown-timer");
  display.textContent = formatCountdown(state.countdown.remainingSeconds);
  
  // Add visual warnings based on time remaining
  display.classList.remove("warning", "critical");
  if (state.countdown.remainingSeconds <= 300) { // Last 5 minutes
    display.classList.add("critical");
  } else if (state.countdown.remainingSeconds <= 900) { // Last 15 minutes
    display.classList.add("warning");
  }
}

function tickCountdown() {
  if (state.countdown.remainingSeconds > 0) {
    state.countdown.remainingSeconds--;
    updateCountdownDisplay();
  } else {
    // Time's up!
    pauseCountdown();
    alert("⚠ JUDGMENT DAY HAS ARRIVED ⚠\nTIME EXPIRED");
  }
}

function startCountdown() {
  // Require admin password to start countdown
  const password = prompt("ADMIN AUTHENTICATION REQUIRED\nEnter password to initiate countdown:");
  
  if (password !== CONFIG.adminPassword) {
    alert("ACCESS DENIED: INVALID CREDENTIALS");
    return;
  }
  
  if (!state.countdown.isRunning) {
    state.countdown.isRunning = true;
    state.countdown.intervalId = setInterval(tickCountdown, 1000);
    $("#start-timer").classList.add("hidden");
    $("#pause-timer").classList.remove("hidden");
  }
}

function pauseCountdown() {
  if (state.countdown.isRunning) {
    state.countdown.isRunning = false;
    clearInterval(state.countdown.intervalId);
    $("#start-timer").classList.remove("hidden");
    $("#pause-timer").classList.add("hidden");
  }
}

function resetCountdown() {
  pauseCountdown();
  state.countdown.remainingSeconds = state.countdown.totalSeconds;
  updateCountdownDisplay();
}

function init() {
  $("#year").textContent = String(new Date().getFullYear());
  loadLeaderboard();
  
  // Event listeners for form
  $("#login-form").addEventListener("submit", onSubmitLogin);
  $("#reset").addEventListener("click", onReset);
  
  // Event listeners for countdown timer
  $("#start-timer").addEventListener("click", startCountdown);
  $("#pause-timer").addEventListener("click", pauseCountdown);
  $("#reset-timer").addEventListener("click", resetCountdown);
  
  // Initialize countdown display
  updateCountdownDisplay();
}

document.addEventListener("DOMContentLoaded", init);



