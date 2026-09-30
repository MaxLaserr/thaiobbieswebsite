import { Towers } from "../assets/towers_list.js";
import { TieredList } from "../assets/tieredobby_list.js";
import { PaceBased } from "../assets/pacebased.js";
import {
  Verified_Creations_Obby,
  Unverified_Creations_Obby,
} from "../assets/creations_obby.js";
import {
  TIERED_OBBY,
  DIFF_STYLES,
  Q_COLORS,
  Pace_Based_STYLES,
} from "../assets/keyword.js";

const normalizePoints = (list) =>
  list.map((item) => ({ ...item, points: Number(item.points) || 0 }));

const TowersList = normalizePoints(Towers);
const TieredObby = normalizePoints(TieredList);
const PaceBasedList = normalizePoints(PaceBased);
const VerifiedCreations = normalizePoints(Verified_Creations_Obby);
const UnverifiedCreations = normalizePoints(Unverified_Creations_Obby);

const CREATION_VERIFIED = "creation-verified-content";
const CREATION_UNVERIFIED = "creation-unverified-content";
let activeCreationSection = CREATION_VERIFIED;
const sectionHideTimers = new WeakMap();
let listQuery = "";

export function getTowerList() {
  return Towers.map((tower) => tower.name);
}

const $ = (id) => document.getElementById(id);

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

const safeUrl = (url) => (/^https?:\/\//i.test(url ?? "") ? esc(url) : "");

const formatCreators = (creators) =>
  Array.isArray(creators) ? creators.join(", ") : creators || "—";

function buildReverseLookup(obj) {
  const map = new Map();
  for (const [key, value] of Object.entries(obj)) {
    if (!map.has(value)) map.set(value, key);
  }
  return map;
}

const difficultyNames = buildReverseLookup(DIFF_STYLES);
const tierNames = buildReverseLookup(TIERED_OBBY);
const paceNames = buildReverseLookup(Pace_Based_STYLES);
const qualityNames = buildReverseLookup(Q_COLORS);

const getDifficultyName = (diff) => difficultyNames.get(diff) ?? "";
const getQualityLabel = (color) => qualityNames.get(color) ?? "";

function getYouTubeId(url) {
  const match = url?.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/i,
  );
  return match ? match[1] : null;
}

function getTiktokId(url) {
  const match = url?.match(/tiktok\.com\/@[^/]+\/video\/([^/\n?#]+)/);
  return match ? match[1] : null;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const TYPE_CONFIG = {
  towers: {
    containerId: "towers-content",
    list: TowersList,
    style: (item) => item.difficulty || {},
    label: (item) => getDifficultyName(item.difficulty),
    icon: (item) => getDifficultyName(item.difficulty)[0] || "?",
  },
  tiered: {
    containerId: "tiered-obby-content",
    list: TieredObby,
    style: (item) => item.tiers || {},
    label: (item) =>
      tierNames.has(item.tiers) ? `Tier ${tierNames.get(item.tiers)}` : "",
    icon: (item) => tierNames.get(item.tiers) ?? "?",
  },
  "pace-based": {
    containerId: "pace-based-content",
    list: PaceBasedList,
    style: (item) => item.pacediff || {},
    label: (item) => paceNames.get(item.pacediff) ?? "",
    icon: (item) => paceNames.get(item.pacediff) ?? "?",
  },
};

const getDiffStyle = (item, type) => TYPE_CONFIG[type]?.style(item) ?? {};
const getDiffLabel = (item, type) => TYPE_CONFIG[type]?.label(item) ?? "";
const getDiffImage = (item, type) => getDiffStyle(item, type).image || "";
const getIconText = (item, type) => TYPE_CONFIG[type]?.icon(item) ?? "?";

function buildThumb(item, diffStyle) {
  const ytId = getYouTubeId(item.url);
  if (ytId) {
    return `<div class="card-thumb"><a href="${safeUrl(item.url)}" target="_blank" rel="noopener"><img src="https://img.youtube.com/vi/${esc(ytId)}/hqdefault.jpg" alt="thumb" loading="lazy"></a></div>`;
  }
  // TikTok entries intentionally have no placeholder thumb.
  if (getTiktokId(item.tiktokUrl)) return "";
  return `<div class="card-thumb"><div class="card-thumb-placeholder" style="background:${esc(diffStyle.background || "rgba(255,255,255,0.05)")}"></div></div>`;
}

function createCard(item, type, index) {
  const diffStyle = getDiffStyle(item, type);
  const diffImage = getDiffImage(item, type);
  // Bug fix: the old code built "tiktok.com/@<videoId>", which is a wrong link.
  const tiktokHref = getTiktokId(item.tiktokUrl) ? safeUrl(item.tiktokUrl) : "";
  const victorUrl = safeUrl(item.firstVictorUrl);
  const victor = esc(item.firstVictor || "—");

  const card = el("div", "list-card");
  card.dataset.index = index;
  card.innerHTML = `
    <div class="card-rank-col">
      <span class="card-rank-label">TOP</span>
      <span class="card-rank-num">#${esc(item.top || "—")}</span>
    </div>
    <div class="card-diff-icon" style="background:${esc(diffStyle.background || "rgba(255,255,255,0.1)")};border:${esc(diffStyle.border || "1px solid rgba(255,255,255,0.2)")};color:${esc(diffStyle.color || "#fff")}">${
      diffImage
        ? `<img src="${esc(diffImage)}" alt="diff" style="width:32px;height:32px;">`
        : esc(getIconText(item, type))
    }</div>
    <div class="card-info">
      <p class="card-info-name">${esc(item.name)}</p>
      <p class="card-info-sub"><strong>First Victor:</strong> ${victorUrl ? `<a href="${victorUrl}" target="_blank" rel="noopener">${victor}</a>` : victor}</p>
      <p class="card-info-sub"><strong>Creators:</strong> ${esc(formatCreators(item.creators))}</p>
      <p class="card-info-sub"><strong>Points:</strong> ${esc(item.points || "—")}</p>
    </div>
    <span class="card-arrow">›</span>
    ${buildThumb(item, diffStyle)}
    ${tiktokHref ? `<a href="${tiktokHref}" target="_blank" rel="noopener" class="card-tiktok-link" title="View on TikTok">▶ TikTok</a>` : ""}
  `;
  return card;
}

function matchesListQuery(item, type, query) {
  if (!query) return true;
  const creators = Array.isArray(item.creators)
    ? item.creators
    : [item.creators];
  return [
    item.name,
    ...creators,
    item.firstVictor,
    getDiffLabel(item, type),
    item.gameStyle,
    item.points,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function renderList(type) {
  const { containerId, list } = TYPE_CONFIG[type];
  const container = $(containerId);
  if (!container) return;

  const matches = list
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => matchesListQuery(item, type, listQuery));
  const fragment = document.createDocumentFragment();
  matches.forEach(({ item, index }) =>
    fragment.appendChild(createCard(item, type, index)),
  );
  container.replaceChildren(fragment);

  if (!container.dataset.clickBound) {
    container.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      const card = event.target.closest(".list-card");
      if (card) openDetail(list[Number(card.dataset.index)], type);
    });
    container.dataset.clickBound = "true";
  }
}

function statRow(label, valueHtml, style = "") {
  return `<tr><td class="stat-label">${label}</td><td class="stat-value"${style ? ` style="${style}"` : ""}>${valueHtml}</td></tr>`;
}

function linkOrText(url, text) {
  const href = safeUrl(url);
  return href
    ? `<a href="${href}" target="_blank" rel="noopener" style="color:#00a8ff">${esc(text)}</a>`
    : esc(text);
}

function buildStatsRows(item, type) {
  const diffStyle = getDiffStyle(item, type);
  const diffLabel = getDiffLabel(item, type);
  const rateSuffix = item.rateKey ? ` (${item.rateKey})` : "";

  const rows = [
    statRow("Placement", `Top ${esc(item.top)}`),
    statRow(
      "Difficulty",
      esc(`${diffLabel || "—"}${rateSuffix}`),
      `color:${esc(diffStyle.color || "#fff")}`,
    ),
    statRow(
      "First Victor",
      linkOrText(item.firstVictorUrl, item.firstVictor || "—"),
    ),
    statRow("Creators", esc(formatCreators(item.creators))),
    statRow(
      "Location",
      item.locationLink
        ? linkOrText(item.locationLink, "Game Link")
        : esc(item.location || "—"),
    ),
    statRow("Gameplay Style", esc(item.gameStyle || "—")),
    statRow("Difficulty Sources", esc(item.difficultySource || "—")),
    type === "towers"
      ? statRow("FPS", esc(item.fps || "—"))
      : statRow("Type", esc(item.type || "—")),
    statRow("Verification Date", esc(item.verifiedDate || "—")),
    statRow("Length", esc(item.length || "—")),
    statRow(
      "Quality",
      esc(getQualityLabel(item.quality) || "—"),
      `color:${esc(item.quality || "#fff")}`,
    ),
  ];
  return rows.join("");
}

const SHOOTING_STARS = `<div class="night"><div class="shooting-stars">${'<div class="star"></div>'.repeat(10)}</div></div>`;

function openDetail(item, type) {
  const overlay = $("detail-overlay");
  if (!overlay) return;

  const diffStyle = getDiffStyle(item, type);
  const diffLabel = getDiffLabel(item, type);
  const diffImage = getDiffImage(item, type);
  const qualityLabel = getQualityLabel(item.quality);
  const rateLabel = item.rate && diffLabel ? `${diffLabel} (${item.rate})` : "";
  const ytId = getYouTubeId(item.url);

  const videoHtml = ytId
    ? `<iframe class="detail-video-iframe" src="https://www.youtube.com/embed/${esc(ytId)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : `<div class="detail-no-video">No verification video available</div>`;

  const iconHtml = item.image
    ? `<img src="${esc(item.image)}" alt="" style="width:100%;height:100%;object-fit:cover;">`
    : diffImage
      ? `<img src="${esc(diffImage)}" alt="" style="width:32px;height:32px;">`
      : esc(getIconText(item, type));

  overlay.innerHTML = `
    ${SHOOTING_STARS}
    <div id="detail-panel" class="player-watch-page obby-watch-page">
      <button id="detail-back-btn">← Back to List</button>
      <div class="player-watch-layout">
        <main class="player-watch-main">
          <div class="player-watch-frame">${videoHtml}</div>
          <h1 class="player-watch-title">${esc(item.name)}</h1>
          <div class="player-watch-channel">
            <div class="detail-icon-box" style="background:${esc(diffStyle.background || "rgba(255,255,255,0.1)")};border:${esc(diffStyle.border || "1px solid rgba(255,255,255,0.2)")};color:${esc(diffStyle.color || "#fff")}">${iconHtml}</div>
            <div class="player-watch-channel-copy">
              <strong>${esc(diffLabel || "Obby")}${rateLabel ? ` · ${esc(item.rate)}` : ""}</strong>
              <span>First victor by ${esc(item.firstVictor || "First victor not listed")}</span>
            </div>
            <span class="player-watch-rank">#${esc(item.top)}</span>
          </div>
          <div class="detail-badges player-watch-badges">
            <span class="detail-badge" style="color:${esc(diffStyle.color || "#fff")}">${esc(rateLabel || diffLabel || "---")}</span>
            <span class="detail-badge" style="color:${esc(item.quality || "#fff")}">Quality ${esc(qualityLabel || "—")}</span>
            <span class="detail-badge">${esc(item.points || "—")} points</span>
          </div>
        </main>
        <aside class="player-watch-sidebar">
          <section class="player-watch-section">
            <h2>General Info &amp; Statistics</h2>
            <table class="detail-stats-table">${buildStatsRows(item, type)}</table>
          </section>
        </aside>
      </div>
    </div>
  `;

  overlay.classList.add("visible");
  document.body.style.overflow = "hidden";
  $("detail-back-btn").addEventListener("click", closeDetail);
}

function closeDetail() {
  const overlay = $("detail-overlay");
  if (!overlay?.classList.contains("visible")) return;

  overlay.style.transition = "opacity 0.2s ease";
  overlay.style.opacity = "0";
  setTimeout(() => {
    overlay.classList.remove("visible");
    overlay.style.opacity = "";
    overlay.style.transition = "";
    document.body.style.overflow = "";
  }, 200);
}

function matchesQuery(item, query) {
  if (!query) return true;
  const creators = Array.isArray(item.creators)
    ? item.creators
    : [item.creators];
  return [
    item.name,
    ...creators,
    item.firstVictor,
    getDifficultyName(item.difficulty),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function showCreationEmptyState() {
  const detail = $("creation-detail");
  const empty = el("div", "creation-detail-empty");
  empty.append(
    el("span", "creation-empty-mark", "TOC"),
    el("p", "", "No creation selected."),
  );
  detail.replaceChildren(empty);
}

function buildCreationRow(item, index, container, isVerified) {
  const difficultyName = getDifficultyName(item.difficulty);
  const creation = { ...item, top: index + 1 };

  const row = el("button", "creation-row");
  row.type = "button";
  row.setAttribute("aria-pressed", "false");

  const icon = el("span", "creation-row-icon");
  icon.style.setProperty(
    "--difficulty-color",
    item.difficulty?.color || "#c8f169",
  );
  if (item.difficulty?.image) {
    const img = el("img");
    img.src = item.difficulty.image;
    img.alt = "";
    icon.appendChild(img);
  } else {
    icon.textContent = difficultyName.slice(0, 1) || "?";
  }

  const copy = el("span", "creation-row-copy");
  copy.append(
    el("span", "creation-row-name", item.name),
    el(
      "span",
      "creation-row-meta",
      `${difficultyName || "Unrated"} · ${item.rate || "—"}`,
    ),
  );

  const arrow = el("span", "creation-row-arrow", "↗");
  arrow.setAttribute("aria-hidden", "true");

  row.append(
    el("span", "creation-row-rank", String(index + 1).padStart(2, "0")),
    icon,
    copy,
    arrow,
  );

  row.addEventListener("click", () => {
    container.querySelectorAll(".creation-row").forEach((r) => {
      r.classList.remove("is-selected");
      r.setAttribute("aria-pressed", "false");
    });
    row.classList.add("is-selected");
    row.setAttribute("aria-pressed", "true");
    showCreationDetail(creation, isVerified);
  });
  return row;
}

function renderCreationsList(items, containerId) {
  const container = $(containerId);
  const isActive = containerId === activeCreationSection;
  const query = $("creation-search")?.value.trim().toLowerCase() || "";

  const matches = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => matchesQuery(item, query));

  container.replaceChildren();
  if (isActive) $("creation-count").textContent = matches.length;

  if (!matches.length) {
    container.appendChild(
      el(
        "p",
        "creation-list-empty",
        query
          ? "No creations match this search."
          : "No creations in this section yet.",
      ),
    );
    if (isActive) showCreationEmptyState();
    return;
  }

  const isVerified = containerId === CREATION_VERIFIED;
  const fragment = document.createDocumentFragment();
  matches.forEach(({ item, index }) =>
    fragment.appendChild(buildCreationRow(item, index, container, isVerified)),
  );
  container.appendChild(fragment);

  if (isActive) container.querySelector(".creation-row")?.click();
}

function showCreationDetail(item, isVerified) {
  const detail = $("creation-detail");
  const difficultyName = getDifficultyName(item.difficulty) || "Unrated";
  const difficultyStyle = item.difficulty || {};
  const rateText = `${difficultyName} · ${item.rate || "—"}`;

  // Heading
  const heading = el("header", "creation-detail-heading");
  const difficulty = el("div", "creation-detail-difficulty");
  difficulty.style.setProperty(
    "--difficulty-color",
    difficultyStyle.color || "#c8f169",
  );
  if (difficultyStyle.image) {
    const img = el("img");
    img.src = difficultyStyle.image;
    img.alt = "";
    difficulty.appendChild(img);
  }
  difficulty.appendChild(el("span", "", rateText));
  heading.append(
    el("span", isVerified ? "creation-status is-verified" : "creation-status is-unverified", isVerified ? "Verified" : getYouTubeId(item.url) ? "Showcase" : "Unverified"),
    el(
      "span",
      "creation-detail-rank",
      `Rank #${String(item.top).padStart(2, "0")}`,
    ),
    el("h2", "", item.name),
    difficulty,
  );

  // Proof video
  const ytId = getYouTubeId(item.url);
  let proof;
  if (ytId) {
    proof = el("div", "creation-proof");
    const frame = el("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}`;
    frame.title = `${isVerified ? "Verification" : "Showcase"} video for ${item.name}`;
    frame.loading = "lazy";
    frame.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    proof.append(frame);
  } else {
    proof = el(
      "div",
      "creation-proof-placeholder",
      ytId ? "Cannot promote video" : "No verification video available",
    );
  }

  // Facts
  const facts = el("dl", "creation-facts");
  const addFact = (label, value, href = "") => {
    const entry = el("div", "creation-fact");
    const dd = el("dd");
    if (href) {
      const link = el("a", "", value || "Open link");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener";
      dd.appendChild(link);
    } else {
      dd.textContent = value || "—";
    }
    entry.append(el("dt", "", label), dd);
    facts.appendChild(entry);
  };

  addFact("Verified by", item.firstVictor, item.url);
  addFact("Creator(s)", formatCreators(item.creators));
  addFact("Verification Date", isVerified ? item.verifiedDate : "Not verified");
  addFact("Location", item.location, item.locationLink);
  addFact("Gameplay style", item.gameStyle);
  addFact("Length", item.length);
  addFact("Quality", getQualityLabel(item.quality));
  addFact("Points", item.points ? String(item.points) : "—");

  detail.replaceChildren(heading, proof, facts);
}

function switchList(sectionId) {
  const targetSection = $(sectionId);
  if (!targetSection) return;

  document.querySelectorAll("#content > div").forEach((section) => {
    clearTimeout(sectionHideTimers.get(section));
    sectionHideTimers.delete(section);
    if (section === targetSection) return;

    section.style.opacity = "0";
    section.style.transform = "translateY(10px)";
    sectionHideTimers.set(
      section,
      setTimeout(() => {
        section.style.display = "none";
        sectionHideTimers.delete(section);
      }, 230),
    );
  });

  // Reset, force a reflow, then animate in.
  targetSection.style.transition = "none";
  targetSection.style.opacity = "0";
  targetSection.style.transform = "translateY(10px)";
  targetSection.style.display = "block";
  void targetSection.offsetHeight;
  targetSection.style.transition = "opacity 0.25s ease, transform 0.25s ease";
  targetSection.style.opacity = "1";
  targetSection.style.transform = "translateY(0)";

  document.querySelectorAll(".section-button").forEach((button) => {
    const isActive = button.dataset.section === sectionId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

const getCreationItems = (section) =>
  section === CREATION_VERIFIED ? VerifiedCreations : UnverifiedCreations;

function changeSection(button) {
  const section = button.dataset.section;
  switchList(section);
  if (section === CREATION_VERIFIED || section === CREATION_UNVERIFIED) {
    activeCreationSection = section;
    renderCreationsList(getCreationItems(section), section);
  }
}

window.changeSection = changeSection;

function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".section-button")
    .forEach((button) =>
      button.addEventListener("click", (e) => changeSection(e.currentTarget)),
    );

  const overlay = el("div");
  overlay.id = "detail-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDetail();
  });
  document.body.appendChild(overlay);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDetail();
  });

  Object.keys(TYPE_CONFIG).forEach(renderList);

  const searchInput = $("obbyInput");
  const resultCount = $("obby-result-count");
  const clearSearch = $("obby-search-clear");
  const updateListSearch = debounce(() => {
    listQuery = searchInput?.value.trim().toLowerCase() || "";
    Object.keys(TYPE_CONFIG).forEach(renderList);
    const total = Object.entries(TYPE_CONFIG).reduce(
      (sum, [type, config]) =>
        sum +
        config.list.filter((item) => matchesListQuery(item, type, listQuery))
          .length,
      0,
    );
    resultCount.textContent = listQuery
        ? `${total} result${total === 1 ? "" : "s"}`
        : "Search all obbies";
    clearSearch.classList.toggle("is-visible", Boolean(listQuery));
  });
  searchInput?.addEventListener("input", updateListSearch);
  clearSearch?.addEventListener("click", () => {
    searchInput.value = "";
    updateListSearch();
    searchInput.focus();
  });
  updateListSearch();

  $("creation-search")?.addEventListener(
    "input",
    debounce(() =>
      renderCreationsList(
        getCreationItems(activeCreationSection),
        activeCreationSection,
      ),
    ),
  );

  if ($("towers-content")) {
    switchList("towers-content");
  } else if ($(CREATION_VERIFIED)) {
    activeCreationSection = CREATION_VERIFIED;
    switchList(CREATION_VERIFIED);
    renderCreationsList(VerifiedCreations, CREATION_VERIFIED);
  }
});
