import players, { formatCompletionItem } from "../assets/player.js";
import {
  tower_pack_obby,
  tiered_pack_obby_60fps,
  tiered_pack_obby_high_fps,
  pace_based,
  misc_placements_obby,
} from "../assets/packobby.js";

function normalizeObbyName(value) {
  return String(value ?? "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\s*\[\d+\??\s*FPS\]\s*$/i, "")
    .replace(/\s*\(\s*\d+\+?\s*FPS\s*\)\s*$/i, "")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function createObbyIndex(...lists) {
  const index = new Map();

  for (const obby of lists.flat()) {
    const name = normalizeObbyName(obby.tower_name);
    if (!name) continue;

    const previous = index.get(name);
    if (!previous || Number(obby.points) > Number(previous.points)) {
      index.set(name, obby);
    }
  }

  return index;
}

const obbyIndexes = {
  tower: createObbyIndex(tower_pack_obby, misc_placements_obby),
  tiered: createObbyIndex(
    tiered_pack_obby_60fps,
    tiered_pack_obby_high_fps,
    misc_placements_obby,
  ),
  paced: createObbyIndex(pace_based, misc_placements_obby),
};

const rankConfig = {
  1: { icon: "/images/top1.png", color: "#FFD700" },
  2: { icon: "/images/top2.png", color: "#C0C0C0" },
  3: { icon: "/images/top3.png", color: "#CD7F32" },
};

function getRankedPlayers(data = players) {
  return [...data]
    .sort((a, b) => Number(b.points) - Number(a.points))
    .map((player, index) => ({ ...player, rank: index + 1 }));
}

function getHardestByRank(data, pointsByName, hardestField) {
  return data
    .map((player) => {
      const completions = Array.isArray(player[hardestField])
        ? player[hardestField]
        : [];
      const matchedObby = completions
        .map((completion) => pointsByName.get(normalizeObbyName(completion)))
        .find(Boolean);

      if (!matchedObby) return null;

      return {
        ...player,
        hardestPoints: Number(matchedObby.points),
        hardestObby: matchedObby,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.hardestPoints - a.hardestPoints)
    .map((player, index) => ({ ...player, rank: index + 1 }));
}

function getTowersByRank(data = players) {
  return getHardestByRank(data, obbyIndexes.tower, "hardest_tower");
}

function getObbiesByRank(data = players) {
  return getHardestByRank(data, obbyIndexes.tiered, "hardest_tiered");
}

function getPacedByRank(data = players) {
  return getHardestByRank(data, obbyIndexes.paced, "hardest_paced");
}

function IconRank(rank) {
  if (!rankConfig[rank]) {
    return ``;
  }

  const config = rankConfig[rank];
  if (config) {
    return `<span style="color: ${config.color};"><img src="${config.icon}" style="width:30px;height:30px;vertical-align:middle;"></span>`;
  }

  return ``;
}
const rankColors = {
  1: "#FFD700", // Gold
  2: "#C0C0C0", // Silver
  3: "#CD7F32", // Bronze
};

function rankColorBackground(points) {
  if (rankColors[points]) return rankColors[points];
  if (points >= 1303) return "#6208f1"; // Top 10
  if (points >= 335) return "#e48dff"; // Top 10
  if (points >= 83) return "#ffffffe7"; // Top 20
  if (points >= 20) return "#00ffffef"; // Top 20
  if (points >= 5) return "#3facf4d3"; // Top 20
  if (points >= 1) return "#0d1dffca"; // Top 20
  return "#949494ff"; // 11+
}

// const statusColors = {
//   Active: "#00ff00",
//   Quit: "#ff0000",
// };

// function getStatusIcon(status) {
//   const color = statusColors[status] ?? "#ffffffff";
//   return `<span style="color: ${color};">●</span>`;
// }

const deviceIcons = {
  PC: "fa-desktop",
  Mobile: "fa-mobile-alt",
  Console: "fa-gamepad",
  "PC/Mobile": "fa-desktop fa-mobile-alt",
  "Mobile/Console": "fa-mobile-alt fa-gamepad",
};

function getDeviceIcon(device) {
  const icons = deviceIcons[device] ?? "fa-question";
  const iconsHtml = icons
    .split(" ")
    .map((i) => `<i class="fas ${i}"></i>`)
    .join("");
  return `<span style="color: #ffffffff;">${iconsHtml}</span>`;
}

function searchPlayer() {
  const playerNameInput = document.querySelector("#playerInput");
  const container = document.getElementById("data-player");
  const playerName = playerNameInput.value.trim().toLowerCase();
  const rankedPlayers = getRankedPlayers();

  if (playerName === "") {
    container.innerHTML = renderLeaderboard(rankedPlayers);
    attachRowClickListeners(rankedPlayers);
    return;
  }

  const foundPlayer = rankedPlayers.find((player) =>
    player.username.toLowerCase().includes(playerName),
  );

  if (foundPlayer) {
    container.innerHTML = renderLeaderboard([foundPlayer]);
    attachRowClickListeners([foundPlayer]);
  } else {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:#ff6b6b;font-family:'Segoe UI',sans-serif;">Player not found</div>`;
  }
}

window.searchPlayer = searchPlayer;

function buildStatsPlayer(p) {
  return `
    <tr><td class="stat-label">Rank</td><td class="stat-value">#${p.rank}</td></tr>
    <tr><td class="stat-label">Aptitude</td><td class="stat-value">${p.type}</td></tr>
    <tr><td class="stat-label">Points</td><td class="stat-value">${p.points}</td></tr>
    <tr><td class="stat-label">Device</td><td class="stat-value">${p.device} ${getDeviceIcon(p.device)}</td></tr>
    <tr><td class="stat-label">Hardest</td><td class="stat-value">${(p.hardest ?? []).map((h) => formatCompletionItem(h)).join("<br>")}</td></tr>
  `;
}

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

const deletedVideoPlayers = new Set(["Krozeq", "Snow_o0z", "porjai_lanafan10"]);
const noVideoPlayers = new Set([
  "datazaaz",
  "SpriteTH",
  "Zenoler",
  "YPJJTHXD1",
]);

function checkVideo(player) {
  if (deletedVideoPlayers.has(player.username))
    return `<div class="detail-no-video">Video was deleted</div>`;
  if (noVideoPlayers.has(player.username))
    return `<div class="detail-no-video">No Video</div>`;
  return null;
}

function buildVideoHtml(player) {
  const ytId = getYouTubeId(player.youtubeId);
  if (ytId) {
    return `<iframe class="detail-video-iframe"
               src="https://www.youtube.com/embed/${ytId}"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowfullscreen></iframe>`;
  }
  return (
    checkVideo(player) ??
    `<div class="detail-no-video">It cannot be promoted</div>`
  );
}

function openPlayerDetail(player) {
  const overlay = document.getElementById("player-detail-overlay");
  const videoHtml = buildVideoHtml(player);

  if (!overlay) return;

  overlay.innerHTML = `
    <div class="night">
        <div class="shooting-stars">
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
        </div>
    </div>
    <div id="detail-panel" class="player-watch-page">
      <button id="detail-back-btn">← Back to Leaderboard</button>
      <div class="player-watch-layout">
        <main class="player-watch-main">
          <div class="player-watch-frame">${videoHtml}</div>
          <h1 class="player-watch-title">Profile</h1>
          <div class="player-watch-channel">
            <img src="${player.pfpUrl}" alt="${player.username}" class="player-watch-avatar">
            <div class="player-watch-channel-copy">
              <strong>${IconRank(player.rank)} ${player.username}</strong>
              <a href="${player.profileUrl}" target="_blank" rel="noopener">View channel</a>
            </div>
            <span class="player-watch-rank" style="color:${rankColorBackground(player.points)}">#${player.rank}</span>
          </div>
          <div class="detail-badges player-watch-badges">
            <span class="detail-badge">${player.points} points</span>
            <span class="detail-badge">${player.type}</span>
            <span class="detail-badge">${player.device}</span>
          </div>
          <section class="player-watch-stats">
            <h2>Player Stats</h2>
            <table class="detail-stats-table">${buildStatsPlayer(player)}</table>
          </section>
        </main>
        <aside class="player-watch-sidebar">
          <section class="player-watch-section">
            <h2>Cool Completions</h2>
            <div class="detail-completions">
              ${player.completions_tiered ? `<div><b>Tiered</b><br>${player.completions_tiered.map((c) => `&bull; ${formatCompletionItem(c)}`).join("<br>")}</div>` : ""}
              ${player.completions_tower ? `<div><b>Towers</b><br>${player.completions_tower.map((c) => `&bull; ${formatCompletionItem(c)}`).join("<br>")}</div>` : ""}
              ${player.completions_paced ? `<div><b>Paced</b><br>${player.completions_paced.map((c) => `&bull; ${formatCompletionItem(c)}`).join("<br>")}</div>` : ""}
            </div>
          </section>
        </aside>
      </div>
    </div>
  `;

  overlay.classList.add("visible");
  document.body.style.overflow = "hidden";
  document
    .getElementById("detail-back-btn")
    .addEventListener("click", closePlayerDetail);
}

function closePlayerDetail() {
  const overlay = document.getElementById("player-detail-overlay");
  if (!overlay) return;
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.2s ease";
  setTimeout(() => {
    overlay.classList.remove("visible");
    overlay.style.opacity = "";
    overlay.style.transition = "";
    document.body.style.overflow = "";
  }, 200);
}

function attachRowClickListeners(data = getRankedPlayers()) {
  document
    .querySelectorAll("#data-player .list-card[data-rank]")
    .forEach((card) => {
      card.addEventListener("click", () => {
        const rank = parseInt(card.getAttribute("data-rank"));
        const player = data.find((p) => p.rank === rank);
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
        <span class="card-rank-num" style="color:${rankColorBackground(p.points)}">#${p.rank}</span>
      </div>
      <img class="card-info-pfp" src="${p.pfpUrl}">
      <div class="card-info">
        <p class="card-info-name">${IconRank(p.rank)} ${p.username}</p>
        <p class="card-info-sub"><strong>Aptitude:</strong> ${p.type} &nbsp;|&nbsp; <strong>Points:</strong> ${p.points}</p>
        <p class="card-info-sub"><strong>Hardest:</strong> ${formatCompletionItem(p.hardest?.[0] ?? "")}</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <span>${getDeviceIcon(p.device)} ${p.device}</span>
      </div>
      <span class="card-arrow">›</span>
    </div>
  `,
    )
    .join("");
}

function renderHardestTower(data) {
  return data
    .filter((p) => p.hardest_tower?.[0]?.trim() !== "N/A")
    .map(
      (p, index) => `
    <div class="list-card" data-rank="${p.rank}" style="animation: rowFadeUp 0.35s ease both; animation-delay: calc(${index} * 30ms);">
      <div class="card-rank-col">
        <span class="card-rank-label">RANK</span>
        <span class="card-rank-num" style="color:${rankColorBackground(p.points)}">#${p.rank}</span>
      </div>
      <img class="card-info-pfp" src="${p.pfpUrl}">
      <div class="card-info">
        <p class="card-info-name">${IconRank(p.rank)} ${p.username}</p>
        <span>${getDeviceIcon(p.device)} ${p.device}</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <p class="card-info-sub"><strong>Hardest:</strong> ${formatCompletionItem(p.hardest_tower?.[0])}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderHardestTiered(data) {
  return data
    .filter((p) => p.hardest_tiered?.[0]?.trim() !== "N/A")
    .map(
      (p, index) => `
    <div class="list-card" data-rank="${p.rank}" style="animation: rowFadeUp 0.35s ease both; animation-delay: calc(${index} * 30ms);">
      <div class="card-rank-col">
        <span class="card-rank-label">RANK</span>
        <span class="card-rank-num" style="color:${rankColorBackground(p.points)}">#${p.rank}</span>
      </div>
      <img class="card-info-pfp" src="${p.pfpUrl}">
      <div class="card-info">
        <p class="card-info-name">${IconRank(p.rank)} ${p.username}</p>
        <span>${getDeviceIcon(p.device)} ${p.device}</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
      <p class="card-info-sub"><strong>Hardest:</strong> ${formatCompletionItem(p.hardest_tiered?.[0])}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderHardestPaced(data) {
  return data
    .filter((p) => p.hardest_paced?.[0]?.trim() !== "N/A")
    .map(
      (p, index) => `
    <div class="list-card" data-rank="${p.rank}" style="animation: rowFadeUp 0.35s ease both; animation-delay: calc(${index} * 30ms);">
      <div class="card-rank-col">
        <span class="card-rank-label">RANK</span>
        <span class="card-rank-num" style="color:${rankColorBackground(p.points)}">#${p.rank}</span>
      </div>
      <img class="card-info-pfp" src="${p.pfpUrl}">
      <div class="card-info">
        <p class="card-info-name">${IconRank(p.rank)} ${p.username}</p>
        <span>${getDeviceIcon(p.device)} ${p.device}</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
      <p class="card-info-sub"><strong>Hardest:</strong> ${formatCompletionItem(p.hardest_paced?.[0])}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

function setupDeviceFilters(rankedPlayers) {
  const mobileCheckbox = document.getElementById("show-mobile-checkbox");
  const pcCheckbox = document.getElementById("show-pc-checkbox");

  function renderFilteredPlayers() {
    const showMobile = mobileCheckbox.checked;
    const showPc = pcCheckbox.checked;

    const filteredPlayers = getRankedPlayers(rankedPlayers.filter((player) => {
      const isMobile = player.device.includes("Mobile");
      const isPc = player.device.includes("PC");

      return (isMobile && showMobile) || (isPc && showPc);
    }));
    const filteredTowers = getTowersByRank(filteredPlayers);
    const filteredObbies = getObbiesByRank(filteredPlayers);
    const filteredPaced = getPacedByRank(filteredPlayers);

    const container = document.getElementById("data-player");
    const towerContainer = document.getElementById("data-tower");
    const obbiesContainer = document.getElementById("data-obbies");
    const pacedContainer = document.getElementById("data-pace");

    if (container) {
      container.innerHTML = renderLeaderboard(filteredPlayers);
    }
    if (towerContainer) {
      towerContainer.innerHTML = renderHardestTower(filteredTowers);
    }
    if (obbiesContainer) {
      obbiesContainer.innerHTML = renderHardestTiered(filteredObbies);
    }
    if (pacedContainer) {
      pacedContainer.innerHTML = renderHardestPaced(filteredPaced);
    }
    attachRowClickListeners(filteredPlayers);
  }

  mobileCheckbox.addEventListener("change", renderFilteredPlayers);
  pcCheckbox.addEventListener("change", renderFilteredPlayers);
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.createElement("div");
  overlay.id = "player-detail-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target.id === "player-detail-overlay") closePlayerDetail();
  });
  document.body.appendChild(overlay);

  const container = document.getElementById("data-player");
  const towerContainer = document.getElementById("data-tower");
  const obbiesContainer = document.getElementById("data-obbies");
  const pacedContainer = document.getElementById("data-pace");
  const rankedPlayers = getRankedPlayers();
  const rankedTowers = getTowersByRank();
  const rankedObbies = getObbiesByRank();
  const rankedPaced = getPacedByRank();

  // Search players as the user types, matching the creation-search behavior.
  document.getElementById("playerInput")?.addEventListener("input", searchPlayer);

  if (container) {
    container.innerHTML = renderLeaderboard(rankedPlayers);
    attachRowClickListeners(rankedPlayers);
  }
  if (towerContainer) {
    towerContainer.innerHTML = renderHardestTower(rankedTowers);
  }
  if (obbiesContainer) {
    obbiesContainer.innerHTML = renderHardestTiered(rankedObbies);
  }
  if (pacedContainer) {
    pacedContainer.innerHTML = renderHardestPaced(rankedPaced);
  }
  // renderProvinceList(provinceData);
  setupDeviceFilters(rankedPlayers);
});
