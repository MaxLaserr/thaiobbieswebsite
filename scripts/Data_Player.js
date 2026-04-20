import players from "../data/player.js";

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
    return "#4B5320"; // Dark green for ranks 4-10
  }
  return "#2F4F4F"; // Dark slate gray for ranks 11+
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
    styleUI();
    return;
  }

  // Search in local players data
  const foundPlayer = players.find(player => 
    player.username.toLowerCase().includes(playerName)
  );

  if (foundPlayer) {
    container.innerHTML = `
      <tr style="animation: rowFadeUp 0.35s ease both;">
        <td style="background-color: ${rankColorBackground(foundPlayer.rank)};">${foundPlayer.rank}</td>
        <td><img src="${foundPlayer.pfpUrl}" width="36" height="36" style="border-radius:50%;object-fit:cover;"></td>
        <td>${foundPlayer.type}</td>
        <td>${foundPlayer.points}</td>
        <td><a href="${foundPlayer.profileUrl}" target="_blank">${foundPlayer.username}</a></td>
        <td>${foundPlayer.hardest.join(", ")}</td>
        <td>${foundPlayer.device}</td>
        <td>${foundPlayer.status} ${getStatusIcon(foundPlayer.status)}</td>
      </tr>
    `;
    styleUI();
  } else {
    container.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: #ff6b6b;">
          Player not found
        </td>
      </tr>
    `;
    styleUI();
  }
}

// Make searchPlayer available globally
window.searchPlayer = searchPlayer;

function renderLeaderboard(data) {
  return data
    .map(
      (p, index) => `
    <tr style="animation: rowFadeUp 0.35s ease both; animation-delay: calc(${index} * 30ms);">
      <td style="background-color: ${rankColorBackground(p.rank)};">${p.rank}</td>
      <td><img src="${p.pfpUrl}" width="36" height="36" style="border-radius:50%;object-fit:cover;"></td>
      <td>${p.type}</td>
      <td>${p.points}</td>
      <td><a href="${p.profileUrl}" target="_blank">${p.username}</a></td>
      <td>${p.hardest.join(", ")}</td>
      <td>${p.device}</td>
      <td>${p.status} ${getStatusIcon(p.status)}</td>
    </tr>
  `,
    )
    .join("");
}

function renderProvinceList(data) {
  const container = document.getElementById("data-player");
  if (!container) return;

  container.innerHTML = data
    .map(
      (p) => `
    <tr>
      <td style="background-color: ${rankColorBackground(p.rank)};">${p.rank}</td>
      <td><img src="${p.pfpUrl}" width="36" height="36""></td>
      <td>${p.type}</td>
      <td>${p.points}</td>
      <td><a href="${p.profileUrl}">${p.username}</a></td>
      <td>${p.hardest[0]}</td>
      <td>${p.device} ${getDeviceIcon(p.device)}</td>
      <td>${p.status} ${getStatusIcon(p.status)}</td>
    </tr>
  `,
    )
    .join("");
  styleUI();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("data-player");
  if (container) {
    container.innerHTML = renderLeaderboard(players);
    styleUI();
  }
  renderProvinceList(players);
});

