import players, { formatCompletionItem } from "../data/player.js";
import { provinceData } from "../data/province.js";

function IconRank(rank) {
  const rankConfig = {
    1: { icon: '../images/RankIcon/top_rank.png', color: '#FFD700' },
    2: { icon: '../images/RankIcon/top2.png', color: '#C0C0C0' },
    3: { icon: '../images/RankIcon/top3.png', color: '#CD7F32' },
  };

  if (!rankConfig[rank]) {
    return ``;
  }
  
  const config = rankConfig[rank];
  if (config) {
    return `<span style="color: ${config.color};"><img src="${config.icon}" style="width:30px;height:30px;vertical-align:middle;"></span>`;
  }
  
  return ``;
}
function rankColorBackground(rank) {
  if (rank === 1) {
    return "#FFD700"; // Gold
  }
  if (rank === 2) {
    return "#C0C0C0"; // Silver
  }
  if (rank === 3) {
    return "#CD7F32"; // Bronze
  }
  if (rank <= 10) {
    return "#3370c0e8"; // Dark green for ranks 4-10
  }
  return "#949494ff"; // Dark slate gray for ranks 11+
}

function getStatusIcon(status) {
  if (status === "Active") {
    return '<span style="color: #00ff00;">●</span>';
  }
  if (status === "Quit") {
    return '<span style="color: #ff0000;">●</span>';
  }
  return '<span style="color: #ffffffff;">●</span>';
}

function getDeviceIcon(device) {
  if (device === "PC") {
    return '<span style="color: #ffffffff;"><i class="fas fa-desktop"></i></span>';
  }
  if (device === "Mobile") {
    return '<span style="color: #ffffffff;"><i class="fas fa-mobile-alt"></i></span>';
  }
  if (device === "Console") {
    return '<span style="color: #ffffffff;"><i class="fas fa-gamepad"></i></span>';
  }
  if (device === "PC/Mobile") {
    return '<span style="color: #ffffffff;"><i class="fas fa-desktop"></i><i class="fas fa-mobile-alt"></i></span>';
  }
  if (device === "Mobile/Console") {
    return '<span style="color: #ffffffff;"><i class="fas fa-mobile-alt"></i><i class="fas fa-gamepad"></i></span>';
  }
  return '<span style="color: #ffffffff;"><i class="fas fa-question"></i></span>';
}

function styleUI() {
  const elements = document.querySelectorAll("td");
  elements.forEach((element) => {
    element.style.color = "white";
    element.style.padding = "1rem";
  });
}

function searchPlayer() {
  const playerNameInput = document.querySelector("#playerInput");
  const container = document.getElementById("data-player");
  const playerName = playerNameInput.value.trim().toLowerCase();

  if (playerName === "") {
    container.innerHTML = renderLeaderboard(players);
    attachRowClickListeners();
    return;
  }

  // Search in local players data
  const foundPlayer = players.find(player => 
    player.username.toLowerCase().includes(playerName)
  );

  if (foundPlayer) {
    container.innerHTML = renderLeaderboard([foundPlayer]);
    attachRowClickListeners();
  } else {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:#ff6b6b;font-family:'Segoe UI',sans-serif;">Player not found</div>`;
  }
}

// Make searchPlayer available globally
window.searchPlayer = searchPlayer;

function buildStatsPlayer(p) {
  return `
    <tr><td class="stat-label">Rank</td><td class="stat-value">#${p.rank}</td></tr>
    <tr><td class="stat-label">Type</td><td class="stat-value">${p.type}</td></tr>
    <tr><td class="stat-label">Points</td><td class="stat-value">${p.points}</td></tr>
    <tr><td class="stat-label">Device</td><td class="stat-value">${p.device} ${getDeviceIcon(p.device)}</td></tr>
    <tr><td class="stat-label">Hardest</td><td class="stat-value">${p.hardest.map(h => formatCompletionItem(h)).join('<br>')}</td></tr>
    <tr><td class="stat-label">Status</td><td class="stat-value">${p.status} ${getStatusIcon(p.status)}</td></tr>
  `;
}

function openPlayerDetail(player) {
  const overlay = document.getElementById('player-detail-overlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div id="detail-panel">
      <button id="detail-back-btn">← Back to Leaderboard</button>
      <div class="detail-title-row">
        <img src="${player.pfpUrl}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div class="detail-rank-name">
          <span class="detail-rank" style="text-align: center; color: ${rankColorBackground(player.rank)};">#${player.rank}</span>
          <h1 class="detail-name">${player.username}</h1>
        </div>
      </div>
      <div class="detail-badges">
        <span class="detail-badge">${player.type}</span>
        <span class="detail-badge" style="color:${player.status === 'Active' ? '#00ff00' : '#ff0000'}">${player.status}</span>
      </div>
      <div id="detail-body">
        <div class="detail-card">
          <h2>Player Stats</h2>
          <table class="detail-stats-table">${buildStatsPlayer(player)}</table>
        </div>
        <div class="detail-card">
          <h2>Profile</h2>
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;">
            <img src="${player.pfpUrl}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;">
            <a href="${player.profileUrl}" target="_blank" rel="noopener" style="color:#00a8ff;font-size:16px;">View Channel↗</a>
          </div>
        </div>
        <div class="detail-card">
          <h2>Completion Stats</h2>
          <div class="detail-completions" style="text-align:left;">
            ${player.completions_tiered ? `<div><b style="color:#fff;">Tiered:</b> <br>${player.completions_tiered.map(c => `&bull; ${formatCompletionItem(c)}`).join('<br>')}</div>` : ''}
            ${player.completions_tower ? `<div><b style="color:#fff;"><br>Towers:</b> <br>${player.completions_tower.map(c => `&bull; ${formatCompletionItem(c)}`).join('<br>')}</div>` : ''}
          </div>
        </div>  
      </div>
    </div>
  `;

  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  document.getElementById('detail-back-btn').addEventListener('click', closePlayerDetail);
}

function closePlayerDetail() {
  const overlay = document.getElementById('player-detail-overlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.2s ease';
  setTimeout(() => {
    overlay.classList.remove('visible');
    overlay.style.opacity = '';
    overlay.style.transition = '';
    document.body.style.overflow = '';
  }, 200);
}

function attachRowClickListeners() {
  document.querySelectorAll('#data-player .list-card[data-rank]').forEach(card => {
    card.addEventListener('click', () => {
      const rank = parseInt(card.getAttribute('data-rank'));
      const player = players.find(p => p.rank === rank);
      if (player) openPlayerDetail(player);
    });
  });
}

function renderLeaderboard(data) {
  return data
    .map(
      (p, index) => `
    <div class="list-card" data-rank="${p.rank}" style="animation: rowFadeUp 0.35s ease both; animation-delay: calc(${index} * 30ms);">
      <div class="card-rank-col">
        <span class="card-rank-label">RANK</span>
        <span class="card-rank-num" style="color:${rankColorBackground(p.rank)}">#${p.rank}</span>
      </div>
      <img src="${p.pfpUrl}" width="46" height="46" style="border-radius:50%;object-fit:cover;flex-shrink:0;">
      <div class="card-info">
        <p class="card-info-name">${IconRank(p.rank)} ${p.username}</p>
        <p class="card-info-sub"><strong>Type:</strong> ${p.type} &nbsp;|&nbsp; <strong>Points:</strong> ${p.points}</p>
        <p class="card-info-sub"><strong>Hardest:</strong> ${formatCompletionItem(p.hardest[0])}</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <span>${getDeviceIcon(p.device)}</span>
        <span>${getStatusIcon(p.status)} <span style="font-size:11px;color:rgba(255,255,255,0.5);">${p.status}</span></span>
      </div>
      <span class="card-arrow">›</span>
    </div>
  `,
    )
    .join("");
}

function renderProvinceList(data) {
  const container = document.getElementById("data-province");
  if (!container) return;

  container.innerHTML = data
    .map(
      (p, index) => `
    <tr style="animation: rowFadeUp 0.35s ease both; animation-delay: calc(${index} * 30ms);">
      <td style="background-color: ${rankColorBackground(p.top)};">${p.top}</td>
      <td>${p.City}</td>
      <td>${p.Points}</td>
      <td>${p.Hardest1}</td>
      <td>${p.Hardest2}</td>
      <td>${p.Hardest3}</td>
      <td>${p.Hardest4}</td>
      <td>${p.Hardest5}</td>
    </tr>
  `,
    )
    .join("");
  styleUI();
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.createElement('div');
  overlay.id = 'player-detail-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'player-detail-overlay') closePlayerDetail();
  });
  document.body.appendChild(overlay);

  const container = document.getElementById("data-player");
  if (container) {
    container.innerHTML = renderLeaderboard(players);
    attachRowClickListeners();
  }
  renderProvinceList(provinceData);
});

