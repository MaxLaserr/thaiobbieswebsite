<<<<<<< HEAD
import { TieredList, Towers } from "../data/list.js";
import { TIERED_OBBY, DIFF_STYLES, Q_COLORS } from "../data/keyword.js";

let TowersList = Towers;
let TieredObby = TieredList;
let MobileTowerList = TieredList.filter(item => item.tiers === "mobile-tower-list-content");

// Debug: Log the filtered lists
console.log('TowersList:', TowersList);
console.log('TieredObby:', TieredObby);
console.log('MobileTowerList:', MobileTowerList);

export function getTowersList() {
    console.log('getTowersList called, returning:', TowersList);
    return TowersList;
}

export function getTieredObbyList() {
    console.log('getTieredObbyList called, returning:', TieredObby);
    return TieredObby;
}

export function getMobileTowerList() {
    console.log('getMobileTowerList called, returning:', MobileTowerList);
    return MobileTowerList;
}

export function getTowerList() {
    console.log('getTowerList called, returning:', Towers);
    return Towers.map(tower => tower.name);
}

function getDifficultyName(diffObj) {
    for (const [key, val] of Object.entries(DIFF_STYLES)) {
        if (val === diffObj) return key;
    }
    return '';
}

function getTierLabel(tiersObj) {
    for (const [key, val] of Object.entries(TIERED_OBBY)) {
        if (val === tiersObj) return `Tier ${key}`;
    }
    return '';
}

function getQualityLabel(colorStr) {
    for (const [key, val] of Object.entries(Q_COLORS)) {
        if (val === colorStr) return key;
    }
    return '';
}

function getRateLabel(rate, difficultyName) {
    return `${difficultyName} (${rate})`;
}

function getRateKey(rateKey) {
    return rateKey;
}

function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}

function getTiktokId(url) {
    if (!url) return null;
    const match = url.match(/(?:tiktok\.com\/@[^\/]+\/video\/)([^\/\n?#]+)/);
    return match ? match[1] : null;
}

function getDiffStyle(item, type) {
    return type === 'towers' ? (item.difficulty || {}) : (item.tiers || {});
}

function getDiffLabel(item, type) {
    return type === 'towers' ? getDifficultyName(item.difficulty) : getTierLabel(item.tiers);
}

function getDiffImage(item, type) {
    return type === 'towers' ? (item.difficulty?.image || '') : (item.tiers?.image || '');
}

function getIconText(item, type) {
    if (type === 'tiered') {
        const label = getTierLabel(item.tiers);
        return label.replace('Tier ', '');
    }
    const d = getDifficultyName(item.difficulty);
    return d ? d[0] : '?';
}

// ---- Card (Image 1) ----
function createCard(item, type) {
    const diffStyle = getDiffStyle(item, type);
    const creators = Array.isArray(item.creators) ? item.creators.join(', ') : (item.creators || '—');
    const ytId = getYouTubeId(item.url);
    const tiktokId = getTiktokId(item.tiktokUrl);
    const iconText = getIconText(item, type);
    const diffImage = getDiffImage(item, type);

    let thumbHtml;
    
    if (ytId) {
        thumbHtml = `<div class="card-thumb"><a href="${item.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="thumb" loading="lazy"></a></div>`;
    } else if (tiktokId) {
        thumbHtml = ''; //  Remove card-thumb-placeholder when TikTok URL is present
    } else {
        thumbHtml = `<div class="card-thumb"><div class="card-thumb-placeholder" style="background:${diffStyle.background || 'rgba(255,255,255,0.05)'}"></div></div>`;
    }

    const tiktokUrl = tiktokId ? `https://www.tiktok.com/@${tiktokId}` : '';
    
    const card = document.createElement('div');
    card.className = 'list-card';
    card.innerHTML = `
        <div class="card-rank-col">
            <span class="card-rank-label">RANK</span>
            <span class="card-rank-num">#${item.top}</span>
        </div>
        <div class="card-diff-icon" style="background:${diffStyle.background || 'rgba(255,255,255,0.1)'};border:${diffStyle.border || '1px solid rgba(255,255,255,0.2)'};color:${diffStyle.color || '#fff'}">${diffImage ? `<img src="${diffImage}" alt="diff" style="width:32px;height:32px;">` : iconText}</div>
        <div class="card-info">
            <p class="card-info-name">${item.name}</p>
            <p class="card-info-sub"><strong>First Victor:</strong> ${item.firstVictor || '—'}</p>
            <p class="card-info-sub"><strong>Creators:</strong> ${creators}</p>
        </div>
        <span class="card-arrow">›</span>
        ${thumbHtml}
        ${tiktokUrl ? `<a href="${tiktokUrl}" target="_blank" rel="noopener" class="card-tiktok-link" title="View on TikTok">▶ TikTok</a>` : ''}
    `;
    card.addEventListener('click', () => openDetail(item, type));
    return card;
}

// ---- Detail Panel (Image 2) ----
function buildStatsRows(item, type) {
    const diffStyle = getDiffStyle(item, type);
    const diffLabel = getDiffLabel(item, type);
    const rateKey = item.rateKey ? getRateKey(item.rateKey) : '';
    const creators = Array.isArray(item.creators) ? item.creators.join(', ') : (item.creators || '—');
    const extraRow = type === 'towers'
        ? `<tr><td class="stat-label">FPS</td><td class="stat-value">${item.fps || '—'}</td></tr>`
        : `<tr><td class="stat-label">Type</td><td class="stat-value">${item.type || '—'}</td></tr>`;
    return `
        <tr><td class="stat-label">Placement</td><td class="stat-value">#${item.top}</td></tr>
        <tr><td class="stat-label">Difficulty</td><td class="stat-value" style="color:${diffStyle.color || '#fff'}">${diffLabel || '—'} ${rateKey ? `(${rateKey})` : ''}</td></tr>
        <tr><td class="stat-label">First Victor</td><td class="stat-value">${item.firstVictor || '—'}</td></tr>
        <tr><td class="stat-label">Creators</td><td class="stat-value">${creators}</td></tr>
        <tr><td class="stat-label">Location</td><td class="stat-value"><a href="${item.location}" target="_blank" rel="noopener" style="color:#00a8ff">Game Link</a></td></tr>
        <tr><td class="stat-label">Gameplay Style</td><td class="stat-value">${item.gameStyle || '—'}</td></tr>
        <tr><td class="stat-label">Difficulty Sources</td><td class="stat-value">${item.difficultySource || '—'}</td></tr>
        ${extraRow}
        <tr><td class="stat-label">Verification Date</td><td class="stat-value">${item.verifiedDate || '—'}</td></tr>
        <tr><td class="stat-label">Length</td><td class="stat-value">${item.length || '—'}</td></tr>
        <tr><td class="stat-label">Quality</td><td class="stat-value" style="color:${item.quality || '#fff'}">${getQualityLabel(item.quality) || '—'}</td></tr>
    `;
}

function openDetail(item, type) {
    const overlay = document.getElementById('detail-overlay');
    if (!overlay) return;

    const diffStyle = getDiffStyle(item, type);
    const diffLabel = getDiffLabel(item, type);
    const qualityLabel = getQualityLabel(item.quality);
    const rateLabel = item.rate ? getRateLabel(item.rate, diffLabel) : '';
    const iconText = getIconText(item, type);
    const ytId = getYouTubeId(item.url);

    const videoHtml = ytId
        ? `<iframe class="detail-video-iframe"
               src="https://www.youtube.com/embed/${ytId}"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowfullscreen></iframe>`
        : `<div class="detail-no-video">No verification video available</div>`;

    overlay.innerHTML = `
        <div id="detail-panel">
            <button id="detail-back-btn">← Back to List</button>
            <div class="detail-title-row">
                <div class="detail-icon-box" style="background:${diffStyle.background || 'rgba(255,255,255,0.1)'};border:${diffStyle.border || '1px solid rgba(255,255,255,0.2)'};color:${diffStyle.color || '#fff'}">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : (diffStyle.image ? `<img src="${diffStyle.image}" style="width:32px;height:32px;">` : iconText)}</div>
                <div class="detail-rank-name">
                    <span class="detail-rank">#${item.top}</span>
                    <h1 class="detail-name">${item.name}</h1>
                </div>
            </div>
            <div class="detail-badges">
                <span class="detail-badge" style="color:${diffStyle.color || '#fff'}">${rateLabel || diffLabel || '---'}</span>
                <span class="detail-badge" style="color:${item.quality || '#fff'}">Quality ${qualityLabel || '—'}</span>
            </div>
            <div id="detail-body">
                <div class="detail-card">
                    <h3>General Info &amp; Statistics</h3>
                    <table class="detail-stats-table">${buildStatsRows(item, type)}</table>
                </div>
                <div class="detail-card">
                    <h3>Verification Video</h3>
                    ${videoHtml}
                </div>
            </div>
        </div>
    `;

    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    document.getElementById('detail-back-btn').addEventListener('click', closeDetail);
}

function closeDetail() {
    const overlay = document.getElementById('detail-overlay');
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

function renderTowersList() {
    const container = document.getElementById('towers-content');
    if (!container) return;
    TowersList.forEach(item => container.appendChild(createCard(item, 'towers')));

    // Default to towers section
    switchList('towers-content');
}

function renderTieredObbyList() {
    const container = document.getElementById('tiered-obby-content');
    if (!container) return;
    TieredObby.forEach(item => container.appendChild(createCard(item, 'tiered')));
    
    // Default to tiered section
    switchList('tiered-obby-content');
}

function switchList(sectionId) {
    const sections = document.querySelectorAll('#content > div');
    const targetSection = document.getElementById(sectionId);

    sections.forEach(section => {
        if (section !== targetSection) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(10px)';
            setTimeout(() => { section.style.display = 'none'; }, 230);
        }
    });

    if (targetSection) {
        targetSection.style.transition = 'none';
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(10px)';
        targetSection.style.display = 'block';
        targetSection.offsetHeight;
        targetSection.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
    }

    const buttons = document.querySelectorAll('.section-button');
    buttons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-section') === sectionId);
    });
}

function changeSection(button) {
    const section = button.getAttribute('data-section');
    switchList(section);
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.section-button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            changeSection(e.currentTarget);
        });
    });

    const overlay = document.createElement('div');
    overlay.id = 'detail-overlay';
    overlay.addEventListener('click', (e) => {
        if (e.target.id === 'detail-overlay') closeDetail();
    });
    document.body.appendChild(overlay);

    renderTowersList();
    renderTieredObbyList();
});
=======
import { TieredList, Towers } from "../data/list.js";
import { TIERED_OBBY, DIFF_STYLES, Q_COLORS } from "../data/keyword.js";

let TowersList = Towers;
let TieredObby = TieredList;
let MobileTowerList = TieredList.filter(item => item.tiers === "mobile-tower-list-content");

// Debug: Log the filtered lists
console.log('TowersList:', TowersList);
console.log('TieredObby:', TieredObby);
console.log('MobileTowerList:', MobileTowerList);

export function getTowersList() {
    console.log('getTowersList called, returning:', TowersList);
    return TowersList;
}

export function getTieredObbyList() {
    console.log('getTieredObbyList called, returning:', TieredObby);
    return TieredObby;
}

export function getMobileTowerList() {
    console.log('getMobileTowerList called, returning:', MobileTowerList);
    return MobileTowerList;
}

export function getTowerList() {
    console.log('getTowerList called, returning:', Towers);
    return Towers.map(tower => tower.name);
}

function getDifficultyName(diffObj) {
    for (const [key, val] of Object.entries(DIFF_STYLES)) {
        if (val === diffObj) return key;
    }
    return '';
}

function getTierLabel(tiersObj) {
    for (const [key, val] of Object.entries(TIERED_OBBY)) {
        if (val === tiersObj) return `Tier ${key}`;
    }
    return '';
}

function getQualityLabel(colorStr) {
    for (const [key, val] of Object.entries(Q_COLORS)) {
        if (val === colorStr) return key;
    }
    return '';
}

function getRateLabel(rate, difficultyName) {
    return `${difficultyName} (${rate})`;
}

function getRateKey(rateKey) {
    return rateKey;
}

function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}

function getTiktokId(url) {
    if (!url) return null;
    const match = url.match(/(?:tiktok\.com\/@[^\/]+\/video\/)([^\/\n?#]+)/);
    return match ? match[1] : null;
}

function getDiffStyle(item, type) {
    return type === 'towers' ? (item.difficulty || {}) : (item.tiers || {});
}

function getDiffLabel(item, type) {
    return type === 'towers' ? getDifficultyName(item.difficulty) : getTierLabel(item.tiers);
}

function getDiffImage(item, type) {
    return type === 'towers' ? (item.difficulty?.image || '') : (item.tiers?.image || '');
}

function getIconText(item, type) {
    if (type === 'tiered') {
        const label = getTierLabel(item.tiers);
        return label.replace('Tier ', '');
    }
    const d = getDifficultyName(item.difficulty);
    return d ? d[0] : '?';
}

// ---- Card (Image 1) ----
function createCard(item, type) {
    const diffStyle = getDiffStyle(item, type);
    const creators = Array.isArray(item.creators) ? item.creators.join(', ') : (item.creators || '—');
    const ytId = getYouTubeId(item.url);
    const tiktokId = getTiktokId(item.tiktokUrl);
    const iconText = getIconText(item, type);
    const diffImage = getDiffImage(item, type);

    let thumbHtml;
    
    if (ytId) {
        thumbHtml = `<div class="card-thumb"><a href="${item.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="thumb" loading="lazy"></a></div>`;
    } else if (tiktokId) {
        thumbHtml = ''; //  Remove card-thumb-placeholder when TikTok URL is present
    } else {
        thumbHtml = `<div class="card-thumb"><div class="card-thumb-placeholder" style="background:${diffStyle.background || 'rgba(255,255,255,0.05)'}"></div></div>`;
    }

    const tiktokUrl = tiktokId ? `https://www.tiktok.com/@${tiktokId}` : '';
    
    const card = document.createElement('div');
    card.className = 'list-card';
    card.innerHTML = `
        <div class="card-rank-col">
            <span class="card-rank-label">RANK</span>
            <span class="card-rank-num">#${item.top}</span>
        </div>
        <div class="card-diff-icon" style="background:${diffStyle.background || 'rgba(255,255,255,0.1)'};border:${diffStyle.border || '1px solid rgba(255,255,255,0.2)'};color:${diffStyle.color || '#fff'}">${diffImage ? `<img src="${diffImage}" alt="diff" style="width:32px;height:32px;">` : iconText}</div>
        <div class="card-info">
            <p class="card-info-name">${item.name}</p>
            <p class="card-info-sub"><strong>First Victor:</strong> ${item.firstVictor || '—'}</p>
            <p class="card-info-sub"><strong>Creators:</strong> ${creators}</p>
        </div>
        <span class="card-arrow">›</span>
        ${thumbHtml}
        ${tiktokUrl ? `<a href="${tiktokUrl}" target="_blank" rel="noopener" class="card-tiktok-link" title="View on TikTok">▶ TikTok</a>` : ''}
    `;
    card.addEventListener('click', () => openDetail(item, type));
    return card;
}

// ---- Detail Panel (Image 2) ----
function buildStatsRows(item, type) {
    const diffStyle = getDiffStyle(item, type);
    const diffLabel = getDiffLabel(item, type);
    const rateKey = item.rateKey ? getRateKey(item.rateKey) : '';
    const creators = Array.isArray(item.creators) ? item.creators.join(', ') : (item.creators || '—');
    const extraRow = type === 'towers'
        ? `<tr><td class="stat-label">FPS</td><td class="stat-value">${item.fps || '—'}</td></tr>`
        : `<tr><td class="stat-label">Type</td><td class="stat-value">${item.type || '—'}</td></tr>`;
    return `
        <tr><td class="stat-label">Placement</td><td class="stat-value">#${item.top}</td></tr>
        <tr><td class="stat-label">Difficulty</td><td class="stat-value" style="color:${diffStyle.color || '#fff'}">${diffLabel || '—'} ${rateKey ? `(${rateKey})` : ''}</td></tr>
        <tr><td class="stat-label">First Victor</td><td class="stat-value">${item.firstVictor || '—'}</td></tr>
        <tr><td class="stat-label">Creators</td><td class="stat-value">${creators}</td></tr>
        <tr><td class="stat-label">Location</td><td class="stat-value"><a href="${item.location}" target="_blank" rel="noopener" style="color:#00a8ff">Game Link</a></td></tr>
        <tr><td class="stat-label">Gameplay Style</td><td class="stat-value">${item.gameStyle || '—'}</td></tr>
        <tr><td class="stat-label">Difficulty Sources</td><td class="stat-value">${item.difficultySource || '—'}</td></tr>
        ${extraRow}
        <tr><td class="stat-label">Verification Date</td><td class="stat-value">${item.verifiedDate || '—'}</td></tr>
        <tr><td class="stat-label">Length</td><td class="stat-value">${item.length || '—'}</td></tr>
        <tr><td class="stat-label">Quality</td><td class="stat-value" style="color:${item.quality || '#fff'}">${getQualityLabel(item.quality) || '—'}</td></tr>
    `;
}

function openDetail(item, type) {
    const overlay = document.getElementById('detail-overlay');
    if (!overlay) return;

    const diffStyle = getDiffStyle(item, type);
    const diffLabel = getDiffLabel(item, type);
    const qualityLabel = getQualityLabel(item.quality);
    const rateLabel = item.rate ? getRateLabel(item.rate, diffLabel) : '';
    const iconText = getIconText(item, type);
    const ytId = getYouTubeId(item.url);

    const videoHtml = ytId
        ? `<iframe class="detail-video-iframe"
               src="https://www.youtube.com/embed/${ytId}"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowfullscreen></iframe>`
        : `<div class="detail-no-video">No verification video available</div>`;

    overlay.innerHTML = `
        <div id="detail-panel">
            <button id="detail-back-btn">← Back to List</button>
            <div class="detail-title-row">
                <div class="detail-icon-box" style="background:${diffStyle.background || 'rgba(255,255,255,0.1)'};border:${diffStyle.border || '1px solid rgba(255,255,255,0.2)'};color:${diffStyle.color || '#fff'}">${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : (diffStyle.image ? `<img src="${diffStyle.image}" style="width:32px;height:32px;">` : iconText)}</div>
                <div class="detail-rank-name">
                    <span class="detail-rank">#${item.top}</span>
                    <h1 class="detail-name">${item.name}</h1>
                </div>
            </div>
            <div class="detail-badges">
                <span class="detail-badge" style="color:${diffStyle.color || '#fff'}">${rateLabel || diffLabel || '---'}</span>
                <span class="detail-badge" style="color:${item.quality || '#fff'}">Quality ${qualityLabel || '—'}</span>
            </div>
            <div id="detail-body">
                <div class="detail-card">
                    <h3>General Info &amp; Statistics</h3>
                    <table class="detail-stats-table">${buildStatsRows(item, type)}</table>
                </div>
                <div class="detail-card">
                    <h3>Verification Video</h3>
                    ${videoHtml}
                </div>
            </div>
        </div>
    `;

    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    document.getElementById('detail-back-btn').addEventListener('click', closeDetail);
}

function closeDetail() {
    const overlay = document.getElementById('detail-overlay');
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

function renderTowersList() {
    const container = document.getElementById('towers-content');
    if (!container) return;
    TowersList.forEach(item => container.appendChild(createCard(item, 'towers')));

    // Default to towers section
    switchList('towers-content');
}

function renderTieredObbyList() {
    const container = document.getElementById('tiered-obby-content');
    if (!container) return;
    TieredObby.forEach(item => container.appendChild(createCard(item, 'tiered')));
    
    // Default to tiered section
    switchList('tiered-obby-content');
}

function switchList(sectionId) {
    const sections = document.querySelectorAll('#content > div');
    const targetSection = document.getElementById(sectionId);

    sections.forEach(section => {
        if (section !== targetSection) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(10px)';
            setTimeout(() => { section.style.display = 'none'; }, 230);
        }
    });

    if (targetSection) {
        targetSection.style.transition = 'none';
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(10px)';
        targetSection.style.display = 'block';
        targetSection.offsetHeight;
        targetSection.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
    }

    const buttons = document.querySelectorAll('.section-button');
    buttons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-section') === sectionId);
    });
}

function changeSection(button) {
    const section = button.getAttribute('data-section');
    switchList(section);
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.section-button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            changeSection(e.currentTarget);
        });
    });

    const overlay = document.createElement('div');
    overlay.id = 'detail-overlay';
    overlay.addEventListener('click', (e) => {
        if (e.target.id === 'detail-overlay') closeDetail();
    });
    document.body.appendChild(overlay);

    renderTowersList();
    renderTieredObbyList();
});
>>>>>>> d40c5947f92a2de6b084f79787927b289c2ba7b9
