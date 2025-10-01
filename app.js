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
  storageKey: "navigate-this-leaderboard-v1"
};

const $ = (sel) => document.querySelector(sel);

const state = {
  leaderboard: []
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
    li.textContent = `${index + 1}. ${entry.teamName}`;
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
    msg.textContent = "Please enter a team name.";
    return;
  }
  if (!token.trim()) {
    msg.textContent = "Please enter a token.";
    return;
  }
  if (!isTokenAllowed(token)) {
    msg.textContent = "Invalid token.";
    return;
  }
  if (!isWinningToken(token)) {
    msg.textContent = "Close, but not this path. Keep navigating.";
    return;
  }

  // Success
  addToLeaderboard(teamName);
  msg.style.color = "var(--accent)";
  msg.textContent = "Access granted.";
  showLeaderboard();
}

function onReset() {
  if (confirm("Reset local leaderboard? This only affects your browser.")) {
    state.leaderboard = [];
    saveLeaderboard();
    renderLeaderboard();
  }
}

function init() {
  $("#year").textContent = String(new Date().getFullYear());
  loadLeaderboard();
  $("#login-form").addEventListener("submit", onSubmitLogin);
  $("#reset").addEventListener("click", onReset);
}

document.addEventListener("DOMContentLoaded", init);



