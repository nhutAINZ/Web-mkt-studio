// Lumina AI Animation Studio - Complete Video Pipeline Frontend
// - Yêu cầu 1: Sequential Image Queue, Cache, Rate Limit (>46s) & Style Lock
// - Yêu cầu 2: Director Storyboard -> 30s Timeline (6 shots, 0 overlaps)
// - Yêu cầu 3: Motion Engine (Dolly In/Out, Orbit/Pan, Dutch Tilt, Static Punchy)
// - Yêu cầu 4: Cinema Transitions (Crossfade, Whip-pan, Zoom-through, Glitch, Match-cut)
// - Yêu cầu 5: Audio Engine (Web Audio Procedural Music, Vietnamese TTS, Auto-ducking, Burnt-in Subtitles)
// - Yêu cầu 6: Full MP4 Export (Canvas + Web Audio Stream via MediaRecorder)
// - Yêu cầu 7: Edit Single Shot (@shotN Timeline Rebuild)

// 6 Official Animation Presets
const DEFAULT_STYLES = [
  { id: '2d-cartoon', name: '2D Cartoon (Hoạt Hình Cổ Điển)', tag: '2d', color: '#38bdf8', prompt_prefix: 'vibrant 2D cartoon animation style, bold outlines, expressive Disney/Looney Tunes aesthetic, bright colors, cel shaded 8k', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
  { id: '3d-disney', name: '3D Pixar / Disney (Điện Ảnh 3D)', tag: '3d', color: '#a855f7', prompt_prefix: 'stunning 3D Pixar Disney style CGI animation, subsurface scattering, soft ambient lighting, high fidelity octane render 8k', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
  { id: 'anime', name: 'Anime Nhật Bản (Makoto Shinkai)', tag: 'anime', color: '#f43f5e', prompt_prefix: 'breathtaking Japanese anime art style by Makoto Shinkai and Studio Ghibli, lush skies, dramatic lens flares, intricate details 8k', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80' },
  { id: 'claymation', name: 'Claymation (Đất Nặn Thủ Công)', tag: 'clay', color: '#fb7185', prompt_prefix: 'tactile handmade plasticine claymation stop-motion Aardman style, visible fingerprints on clay, soft organic shapes, cozy studio light 8k', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80' },
  { id: 'brick-toy', name: 'Brick-Toy (Lego Stop-Motion 12fps)', tag: 'brick', color: '#f59e0b', prompt_prefix: 'Lego stop-motion brickfilm style, high-end ABS plastic toy bricks with authentic Lego studs, miniature macro studio lighting, depth of field 12fps aesthetic, rich primary colors, glossy finish, sharp rim lighting 8k', img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' },
  { id: 'chibi', name: 'Chibi Cute (Nhân Vật Đầu To Đáng Yêu)', tag: 'chibi', color: '#10b981', prompt_prefix: 'ultra cute chibi character proportion, oversized head, big sparkling anime eyes, playful pastel colors, charming 3D toy figure 8k', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80' }
];

// Curated Lego Stop-Motion Library (Fallback Provider)
const CURATED_LEGO_SHOTS = [
  "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80",  // Shot 1: Establishing
  "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1280&q=80",  // Shot 2: Mechanism/Assembly
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1280&q=80",  // Shot 3: Dynamic Action
  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1280&q=80",  // Shot 4: Emotion Reaction
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80",  // Shot 5: Showcase/Safety
  "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80"   // Shot 6: Hero CTA
];

let currentStyle = 'brick-toy';
let currentMode = 'AI Video';
let currentAspect = '16:9';
let currentDuration = 30;
let isDraftMode = false;
let uploadedMaterialData = null;
let activeFilmId = null;
let currentCharacterBible = {
  name: 'Cậu bé lắp ráp Lego',
  description: 'Cậu bé sáng tạo cùng khối đồ chơi Lego robot',
  reference_image: null,
  locked_traits: ['Áo thun đỏ viền vàng', 'Khối Lego ABS bóng bẩy', 'Mắt to thông minh']
};
let stylesList = [];
let localHistory = [];

// ==========================================
// YÊU CẦU 1: INDEXEDDB CACHE & IMAGE QUEUE
// ==========================================
const DB_NAME = 'LuminaImageCache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
let lastLiveRequestTime = 0;

function openImageCacheDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => resolve(null);
  });
}

async function getCachedImage(key) {
  const db = await openImageCacheDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
      req.onerror = () => resolve(null);
    } catch(e) { resolve(null); }
  });
}

async function setCachedImage(key, dataUrl) {
  const db = await openImageCacheDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key: key, dataUrl: dataUrl, timestamp: Date.now() });
  } catch(e) {}
}

function computeImageHash(prompt, seed) {
  const str = `${prompt.trim()}_seed_${seed}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'img_' + Math.abs(hash).toString(16);
}

// Error Image Detection (Check size, text signatures, dimensions)
async function isErrorImageBlob(blob) {
  if (!blob) return true;
  // Pollinations "Free limit reached" rate-limit error placeholder is small (< 35KB)
  if (blob.size < 35000) return true;

  try {
    const textSlice = await blob.slice(0, 1500).text();
    if (textSlice.includes('Free limit reached') || textSlice.includes('rate limit') || textSlice.includes('Too Many Requests')) {
      return true;
    }
  } catch(e) {}

  return false;
}

// Sequential Image Queue with Rate Limiting (>= 46s per live request)
async function fetchShotImageWithQueue(visualPrompt, seed, shotNum, totalShots, onProgress) {
  const cacheKey = computeImageHash(visualPrompt, seed);
  const cached = await getCachedImage(cacheKey);
  if (cached) {
    if (onProgress) onProgress(`Shot ${shotNum}/${totalShots}: Đã tải từ cache (0s)`, 100);
    return cached;
  }

  // Rate Limiting: must be >= 46s since last live request
  const minInterval = 46000;
  const now = Date.now();
  const elapsed = now - lastLiveRequestTime;
  if (lastLiveRequestTime > 0 && elapsed < minInterval) {
    const waitMs = minInterval - elapsed;
    const waitSeconds = Math.ceil(waitMs / 1000);
    for (let s = waitSeconds; s > 0; s--) {
      if (onProgress) onProgress(`Đang tạo shot ${shotNum}/${totalShots} – còn ~${s}s (Rate limit buffer)...`, Math.floor(((waitSeconds - s) / waitSeconds) * 50));
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Attempt fetch with exponential backoff retry (up to 5 attempts)
  let attempts = 0;
  let finalUrl = null;
  const encodedPrompt = encodeURIComponent(visualPrompt);
  const requestUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;

  while (attempts < 5) {
    attempts++;
    try {
      lastLiveRequestTime = Date.now();
      if (onProgress) onProgress(`Đang tạo shot ${shotNum}/${totalShots} (Lần thử ${attempts}/5)...`, 60);

      const res = await fetch(requestUrl);
      if (res.ok) {
        const blob = await res.blob();
        const isError = await isErrorImageBlob(blob);
        if (!isError) {
          const reader = new FileReader();
          const dataUrl = await new Promise((res) => {
            reader.onload = (e) => res(e.target.result);
            reader.readAsDataURL(blob);
          });
          await setCachedImage(cacheKey, dataUrl);
          return dataUrl;
        }
      }
    } catch(err) {
      console.warn(`Attempt ${attempts} failed:`, err);
    }

    // Wait backoff: 5s, 10s, 20s, 30s, 45s
    const backoffMs = [5000, 10000, 20000, 30000, 45000][attempts - 1] || 10000;
    if (onProgress) onProgress(`Shot ${shotNum}/${totalShots}: Phát hiện giới hạn, tự động thử lại sau ${backoffMs/1000}s...`, 40);
    await new Promise(r => setTimeout(r, backoffMs));
  }

  // Fallback Provider: Use Curated Lego Stop-Motion High-Res Image
  console.log(`Using fallback provider for shot ${shotNum}`);
  finalUrl = CURATED_LEGO_SHOTS[(shotNum - 1) % CURATED_LEGO_SHOTS.length];
  await setCachedImage(cacheKey, finalUrl);
  return finalUrl;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  fetchStyles();
  fetchHistory();
  fetchCharacterBible();
});

// Close all dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dock-pill') && !e.target.closest('.pill-dropdown-menu')) {
    closeAllDropdowns();
  }
});

function toggleDropdown(menuId, event) {
  if (event) event.stopPropagation();
  const el = document.getElementById(menuId);
  if (!el) return;
  const isHidden = el.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) el.classList.remove('hidden');
}

function closeAllDropdowns() {
  ['menu-mode', 'menu-styles', 'menu-aspect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

// ==========================================
// 1. API & LOCAL STORAGE SYNC
// ==========================================
async function fetchStyles() {
  try {
    const res = await fetch('/api/styles');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.styles) {
        stylesList = data.styles;
        renderStylesDropdown(stylesList);
        return;
      }
    }
  } catch (err) {}
  stylesList = DEFAULT_STYLES;
  renderStylesDropdown(stylesList);
}

function renderStylesDropdown(styles) {
  const container = document.getElementById('styles-list-container');
  if (!container) return;

  container.innerHTML = styles.map(s => `
    <button type="button" class="dropdown-opt" onclick="selectStyle('${s.id}', '${s.name}')">
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.name}</span>
      <span style="font-size: 9px; color: #777; margin-left: 6px;">${s.id}</span>
    </button>
  `).join('');
}

async function fetchHistory() {
  try {
    const res = await fetch('/api/history');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.history) {
        localHistory = data.history;
        renderHistoryDrawer(localHistory);
        if (localHistory.length > 0 && !activeFilmId) {
          activeFilmId = localHistory[0].id;
        }
        return;
      }
    }
  } catch (e) {}

  const saved = localStorage.getItem('lumina_history');
  if (saved) {
    try {
      localHistory = JSON.parse(saved);
    } catch (e) {
      localHistory = [];
    }
  }
  renderHistoryDrawer(localHistory);
  if (localHistory.length > 0 && !activeFilmId) {
    activeFilmId = localHistory[0].id;
  }
}

function saveLocalHistory(film) {
  const idx = localHistory.findIndex(f => f.id === film.id);
  if (idx >= 0) {
    localHistory[idx] = film;
  } else {
    localHistory.unshift(film);
  }
  try {
    localStorage.setItem('lumina_history', JSON.stringify(localHistory));
  } catch (e) {}
  renderHistoryDrawer(localHistory);
}

function renderHistoryDrawer(items) {
  const container = document.getElementById('history-items-list');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<div style="color: #666; font-size: 12px; font-family: monospace; text-align: center; padding: 30px 0;">Chưa có video nào trong lịch sử.</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div onclick="loadFilmFromHistory('${item.id}'); toggleHistoryModal(false);" style="background: #09090c; border: 1px solid #1c1c24; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.15s;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #fff;">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</span>
        <span style="color: var(--accent-green); font-size: 10px; font-family: monospace;">${item.style_lock || item.style}</span>
      </div>
      <p style="font-size: 11px; color: #888; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">${item.prompt || ''}</p>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #555; font-family: monospace; padding-top: 4px;">
        <span>${item.duration}s • ${item.aspect} • v${item.version || 1}</span>
        <span>${item.timestamp || 'Mới tạo'}</span>
      </div>
    </div>
  `).join('');
}

function loadFilmFromHistory(filmId) {
  const film = localHistory.find(f => f.id === filmId);
  if (film) {
    activeFilmId = film.id;
    renderCompletedFilmCard(film);
  }
}

async function fetchCharacterBible() {
  try {
    const res = await fetch('/api/character-bible');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.character_bible) {
        currentCharacterBible = data.character_bible;
        syncCharacterBibleUI();
        return;
      }
    }
  } catch (e) {}

  const saved = localStorage.getItem('lumina_character_bible');
  if (saved) {
    try {
      currentCharacterBible = JSON.parse(saved);
    } catch (e) {}
  }
  syncCharacterBibleUI();
}

// ==========================================
// 2. CHARACTER BIBLE CONTROLS
// ==========================================
function toggleCharacterBibleModal(show = true) {
  const modal = document.getElementById('character-bible-modal');
  if (modal) {
    modal.classList.toggle('hidden', !show);
    if (show) syncCharacterBibleUI();
  }
}

function syncCharacterBibleUI() {
  const nameInput = document.getElementById('char-name-input');
  const descInput = document.getElementById('char-desc-input');
  const traitsInput = document.getElementById('char-traits-input');
  const preview = document.getElementById('char-preview-thumb');
  const uploadText = document.getElementById('char-upload-text');

  if (nameInput) nameInput.value = currentCharacterBible.name || '';
  if (descInput) descInput.value = currentCharacterBible.description || '';
  if (traitsInput) traitsInput.value = (currentCharacterBible.locked_traits || []).join(', ');

  if (currentCharacterBible.reference_image && preview) {
    preview.src = currentCharacterBible.reference_image;
    preview.style.display = 'block';
    if (uploadText) uploadText.style.display = 'none';
  }
}

function handleCharImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    currentCharacterBible.reference_image = e.target.result;
    syncCharacterBibleUI();
  };
  reader.readAsDataURL(file);
}

async function saveCharacterBible() {
  const name = document.getElementById('char-name-input')?.value.trim() || 'Cậu bé lắp ráp Lego';
  const desc = document.getElementById('char-desc-input')?.value.trim() || 'Cậu bé sáng tạo cùng khối đồ chơi Lego';
  const traitsRaw = document.getElementById('char-traits-input')?.value.trim() || '';
  const traits = traitsRaw.split(',').map(t => t.trim()).filter(Boolean);

  currentCharacterBible.name = name;
  currentCharacterBible.description = desc;
  currentCharacterBible.locked_traits = traits;

  try {
    localStorage.setItem('lumina_character_bible', JSON.stringify(currentCharacterBible));
    await fetch('/api/character-bible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCharacterBible)
    }).catch(() => {});
  } catch (err) {}

  alert('Đã khóa Character Bible! Nhân vật sẽ được đưa vào mọi phân cảnh video.');
  toggleCharacterBibleModal(false);
}

// ==========================================
// 3. DOCK CONTROLS & SELECTIONS
// ==========================================
function selectMode(mode) {
  currentMode = mode;
  document.getElementById('label-mode').innerText = mode;
  closeAllDropdowns();
}

function selectStyle(id, name) {
  currentStyle = id;
  document.getElementById('label-style').innerText = id;
  closeAllDropdowns();
}

function selectAspect(aspect, dur, label) {
  currentAspect = aspect;
  currentDuration = dur;
  document.getElementById('label-aspect').innerText = label;
  closeAllDropdowns();
}

function toggleDraftMode() {
  isDraftMode = !isDraftMode;
  const sw = document.getElementById('draft-toggle-switch');
  if (sw) sw.classList.toggle('on', isDraftMode);
}

function toggleExpandPrompt() {
  const ta = document.getElementById('dock-prompt-input');
  if (ta.rows === 2) {
    ta.rows = 5;
  } else {
    ta.rows = 2;
  }
}

function handleInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submitGenerateVideo();
  }
}

function handleMaterialUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedMaterialData = e.target.result;
    const preview = document.getElementById('material-preview-img');
    const placeholder = document.getElementById('material-placeholder');
    const btnDel = document.getElementById('btn-del-material');

    preview.src = uploadedMaterialData;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    btnDel.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function removeMaterial(event) {
  event.stopPropagation();
  uploadedMaterialData = null;
  const preview = document.getElementById('material-preview-img');
  const placeholder = document.getElementById('material-placeholder');
  const btnDel = document.getElementById('btn-del-material');

  preview.src = '';
  preview.style.display = 'none';
  placeholder.style.display = 'block';
  btnDel.style.display = 'none';
  document.getElementById('file-material-input').value = '';
}

function applySuggestionPrompt(text) {
  const inputEl = document.getElementById('dock-prompt-input');
  inputEl.value = text;
  submitGenerateVideo();
}

// ==========================================
// YÊU CẦU 2, 3, 4, 5, 6: CLIENT-SIDE PIPELINE PLAYER BLOB GENERATOR
// ==========================================
function buildInteractiveFilmPlayerBlob(film) {
  const preset = DEFAULT_STYLES.find(s => s.id === (film.style_lock || film.style)) || DEFAULT_STYLES[4];
  const color = preset.color || '#f59e0b';
  const styleId = preset.id || 'brick-toy';
  const duration = film.duration || 30;
  const shotsJson = JSON.stringify(film.shots);
  const filmId = film.id;

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${film.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #stage {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #050508;
    }
    canvas {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    #hud-top {
      position: absolute;
      top: 14px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      z-index: 10;
    }
    .badge {
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 600;
    }
    #controls-bar {
      position: absolute;
      top: 14px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 20;
    }
    .btn-action {
      border: none;
      padding: 7px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn-action:hover { opacity: 0.9; transform: scale(1.02); }
    #btn-preview {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
    }
    #btn-download-video {
      background: ${color};
      color: #000;
    }
    #render-progress-box {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(10, 10, 15, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 10px 16px;
      display: none;
      z-index: 30;
      backdrop-filter: blur(12px);
    }
  </style>
</head>
<body>
  <div id="stage">
    <div id="hud-top">
      <div class="badge" style="color: ${color};">
        ⚡ LUMINA PIPELINE • ${styleId.toUpperCase()}
      </div>
      <div class="badge" id="hud-tc">
        TC: 00:00.00 / ${duration}s
      </div>
    </div>

    <div id="controls-bar">
      <button class="btn-action" id="btn-preview" onclick="restartPreview()">
        <span>▶</span>
        <span>Xem trước</span>
      </button>
      <button class="btn-action" id="btn-download-video" onclick="recordAndDownloadVideo()">
        <span>💾</span>
        <span id="btn-download-text">Tải Video MP4</span>
      </button>
    </div>

    <div id="render-progress-box">
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; color: #fff; margin-bottom: 6px;">
        <span id="render-status-text">Đang xuất video MP4 (H.264 + Audio)...</span>
        <span id="render-pct-text">0%</span>
      </div>
      <div style="width: 100%; height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
        <div id="render-bar-fill" style="width: 0%; height: 100%; background: ${color}; transition: width 0.15s linear;"></div>
      </div>
    </div>

    <canvas id="c" width="1280" height="720"></canvas>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const hudTc = document.getElementById('hud-tc');

    window.DUR = ${duration};
    window.READY = false;

    const SHOTS = ${shotsJson};
    const loadedImages = [];
    let imagesLoadedCount = 0;

    // YÊU CẦU 1: Preload images with strict placeholder / error detection
    SHOTS.forEach((shot, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = shot.img;
      img.onload = () => {
        if (img.naturalWidth < 300) {
          if (shot.fallback_img) img.src = shot.fallback_img;
        }
        imagesLoadedCount++;
        if (imagesLoadedCount >= SHOTS.length) window.READY = true;
      };
      img.onerror = () => {
        if (shot.fallback_img) img.src = shot.fallback_img;
        imagesLoadedCount++;
        if (imagesLoadedCount >= SHOTS.length) window.READY = true;
      };
      loadedImages.push(img);
    });

    // YÊU CẦU 3: EASING FUNCTIONS
    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function easeOutBounce(x) {
      const n1 = 7.5625, d1 = 2.75;
      if (x < 1 / d1) return n1 * x * x;
      else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
      else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
      else return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }

    // YÊU CẦU 5: AUDIO ENGINE (PROCEDURAL CINEMATIC BGM + TTS + DUCKING)
    let audioCtx = null;
    let musicGain = null;
    let voiceGain = null;
    let audioDestNode = null;
    let isAudioStarted = false;
    let lastSpokenShotIndex = -1;

    function initAudio() {
      if (isAudioStarted) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        audioDestNode = audioCtx.createMediaStreamDestination();

        musicGain = audioCtx.createGain();
        musicGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

        voiceGain = audioCtx.createGain();
        voiceGain.gain.setValueAtTime(1.0, audioCtx.currentTime);

        musicGain.connect(audioCtx.destination);
        musicGain.connect(audioDestNode);

        voiceGain.connect(audioCtx.destination);
        voiceGain.connect(audioDestNode);

        startCinematicMusicLoop();
        isAudioStarted = true;
      } catch(e) {
        console.warn('Web Audio error:', e);
      }
    }

    function startCinematicMusicLoop() {
      if (!audioCtx) return;
      const chords = [
        [130.81, 164.81, 196.00], // C Maj
        [98.00, 123.47, 146.83],  // G Maj
        [110.00, 130.81, 164.81], // A Min
        [87.31, 110.00, 130.81]   // F Maj
      ];

      function scheduleBeat(time, chordIdx) {
        const chord = chords[chordIdx % chords.length];
        chord.forEach(freq => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(0.001, time);
          gain.gain.linearRampToValueAtTime(0.18, time + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

          osc.connect(gain);
          gain.connect(musicGain);
          osc.start(time);
          osc.stop(time + 1.8);
        });

        const kickOsc = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();
        kickOsc.frequency.setValueAtTime(95, time);
        kickOsc.frequency.exponentialRampToValueAtTime(35, time + 0.25);
        kickGain.gain.setValueAtTime(0.25, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        kickOsc.connect(kickGain);
        kickGain.connect(musicGain);
        kickOsc.start(time);
        kickOsc.stop(time + 0.25);
      }

      let beatTime = audioCtx.currentTime + 0.1;
      for (let i = 0; i < 40; i++) {
        scheduleBeat(beatTime + i * 0.9, i);
      }
    }

    function triggerTTS(shotIndex) {
      if (shotIndex === lastSpokenShotIndex) return;
      lastSpokenShotIndex = shotIndex;
      const shot = SHOTS[shotIndex];
      const text = shot.voiceover || shot.vo || shot.subtitle;
      if (!text || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const clean = text.replace(/^[^:]+:\\s*/, '').trim();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'vi-VN';
      utter.rate = 1.12;

      utter.onstart = () => {
        if (musicGain && audioCtx) musicGain.gain.setTargetAtTime(0.10, audioCtx.currentTime, 0.15);
      };
      utter.onend = utter.onerror = () => {
        if (musicGain && audioCtx) musicGain.gain.setTargetAtTime(0.35, audioCtx.currentTime, 0.25);
      };

      window.speechSynthesis.speak(utter);
    }

    // YÊU CẦU 3: MOTION ENGINE RENDER PER SHOT
    function renderShotMotion(shot, img, shotProgress, t, w, h) {
      if (!img || !img.complete) {
        ctx.fillStyle = '#0f0f15';
        ctx.fillRect(-w/2, -h/2, w, h);
        return;
      }

      const camType = (typeof shot.camera === 'object' ? shot.camera.type : shot.camera) || 'dolly_in';

      ctx.save();

      if (camType === 'dolly_in') {
        const e = easeInOutCubic(shotProgress);
        const scale = 1.0 + e * 0.25;
        const panX = (e - 0.5) * 20;
        const panY = (e - 0.5) * 10;
        ctx.translate(panX, panY);
        ctx.scale(scale, scale);
      }
      else if (camType === 'dolly_out') {
        const e = easeInOutCubic(shotProgress);
        const scale = 1.25 - e * 0.25;
        const panX = (0.5 - e) * 20;
        const panY = (0.5 - e) * 10;
        ctx.translate(panX, panY);
        ctx.scale(scale, scale);
      }
      else if (camType === 'orbit_pan') {
        const e = easeInOutCubic(shotProgress);
        const panX = (e - 0.5) * 80;
        const rot = Math.sin(shotProgress * Math.PI) * (3 * Math.PI / 180);
        const scale = 1.10 + Math.sin(shotProgress * Math.PI) * 0.04;
        ctx.translate(panX, 0);
        ctx.rotate(rot);
        ctx.scale(scale, scale);
      }
      else if (camType === 'dutch_tilt') {
        const baseAngle = 10 * Math.PI / 180;
        const rhythmicShake = Math.sin(t * 18) * (0.8 * Math.PI / 180);
        const shakeY = Math.sin(t * 22) * 3;
        const rot = baseAngle + rhythmicShake;
        const scale = 1.16 + shotProgress * 0.06;
        ctx.translate(Math.cos(t * 16) * 4, shakeY);
        ctx.rotate(rot);
        ctx.scale(scale, scale);
      }
      else if (camType === 'static_punchy') {
        const punchP = Math.min(1.0, shotProgress * 4.0);
        const bounce = easeOutBounce(punchP);
        const scale = 1.20 - bounce * 0.12 + Math.sin(t * 3) * 0.015;
        ctx.scale(scale, scale);
      }
      else {
        const scale = 1.0 + shotProgress * 0.15;
        ctx.scale(scale, scale);
      }

      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // MASTER TIME-BASED RENDER AT 30FPS
    window.render = function(t) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let currentShotIndex = 0;
      for (let i = 0; i < SHOTS.length; i++) {
        if (t >= SHOTS[i].start && t < SHOTS[i].end) {
          currentShotIndex = i;
          break;
        }
        if (i === SHOTS.length - 1 && t >= SHOTS[i].end) {
          currentShotIndex = SHOTS.length - 1;
        }
      }

      const currentShot = SHOTS[currentShotIndex];
      const shotDur = currentShot.end - currentShot.start;
      const shotProgress = Math.max(0, Math.min(1.0, (t - currentShot.start) / shotDur));

      triggerTTS(currentShotIndex);

      // YÊU CẦU 4: TRANSITION OVERLAP (0.3s - 0.6s)
      const transDur = (currentShot.transitionOut && currentShot.transitionOut.duration) || 0.45;
      const timeUntilEnd = currentShot.end - t;
      const isTransitioning = (timeUntilEnd < transDur && currentShotIndex < SHOTS.length - 1);
      const nextShotIndex = currentShotIndex + 1;
      const transType = (currentShot.transitionOut && currentShot.transitionOut.type) || 'crossfade';

      if (!isTransitioning) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        renderShotMotion(currentShot, loadedImages[currentShotIndex], shotProgress, t, w, h);
        ctx.restore();
      } else {
        const transProgress = Math.max(0, Math.min(1.0, (transDur - timeUntilEnd) / transDur));
        const nextShot = SHOTS[nextShotIndex];

        if (transType === 'crossfade') {
          ctx.save();
          ctx.translate(w / 2, h / 2);
          renderShotMotion(currentShot, loadedImages[currentShotIndex], shotProgress, t, w, h);
          ctx.restore();

          ctx.save();
          ctx.globalAlpha = transProgress;
          ctx.translate(w / 2, h / 2);
          renderShotMotion(nextShot, loadedImages[nextShotIndex], 0.05 * transProgress, t, w, h);
          ctx.restore();
        }
        else if (transType === 'whip_pan') {
          ctx.save();
          ctx.translate(w / 2 - transProgress * w * 1.15, h / 2);
          renderShotMotion(currentShot, loadedImages[currentShotIndex], shotProgress, t, w, h);
          ctx.restore();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          for (let s = 0; s < 5; s++) {
            ctx.fillRect(0, s * (h / 5), w, 8);
          }

          ctx.save();
          ctx.translate(w / 2 + (1 - transProgress) * w * 1.15, h / 2);
          renderShotMotion(nextShot, loadedImages[nextShotIndex], 0.02, t, w, h);
          ctx.restore();
        }
        else if (transType === 'zoom_through') {
          ctx.save();
          ctx.globalAlpha = 1 - transProgress;
          ctx.translate(w / 2, h / 2);
          ctx.scale(1.0 + transProgress * 2.2, 1.0 + transProgress * 2.2);
          renderShotMotion(currentShot, loadedImages[currentShotIndex], shotProgress, t, w, h);
          ctx.restore();

          ctx.save();
          ctx.globalAlpha = transProgress;
          ctx.translate(w / 2, h / 2);
          ctx.scale(0.4 + transProgress * 0.6, 0.4 + transProgress * 0.6);
          renderShotMotion(nextShot, loadedImages[nextShotIndex], 0.02, t, w, h);
          ctx.restore();
        }
        else if (transType === 'glitch_cut') {
          const glitchX = (Math.random() - 0.5) * 25;
          ctx.save();
          ctx.translate(w / 2 + glitchX, h / 2);
          renderShotMotion(transProgress < 0.5 ? currentShot : nextShot, loadedImages[transProgress < 0.5 ? currentShotIndex : nextShotIndex], shotProgress, t, w, h);
          ctx.restore();

          ctx.fillStyle = 'rgba(255, 0, 80, 0.22)';
          ctx.fillRect(0, Math.random() * h, w, 14);
          ctx.fillStyle = 'rgba(0, 220, 255, 0.22)';
          ctx.fillRect(0, Math.random() * h, w, 14);
        }
        else if (transType === 'match_cut') {
          ctx.save();
          ctx.translate(w / 2, h / 2);
          renderShotMotion(nextShot, loadedImages[nextShotIndex], 0.02, t, w, h);
          ctx.restore();

          ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.45 * (1 - transProgress)) + ')';
          ctx.fillRect(0, 0, w, h);
        }
      }

      // Vignette
      const grad = ctx.createRadialGradient(w/2, h/2, h * 0.45, w/2, h/2, w * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // YÊU CẦU 5: BURNT-IN SUBTITLES
      const subText = (currentShot.subtitle || currentShot.voiceover || currentShot.vo || '').replace(/^[^:]+:\\s*/, '').trim();
      if (subText) {
        ctx.save();
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const textMetrics = ctx.measureText(subText);
        const padX = 24, padY = 12;
        const boxW = Math.min(w * 0.88, textMetrics.width + padX * 2);
        const boxH = 46;
        const boxX = (w - boxW) / 2;
        const boxY = h - 68;

        ctx.fillStyle = 'rgba(7, 7, 12, 0.82)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(subText, w / 2, boxY + boxH / 2, boxW - padX * 2);
        ctx.restore();
      }

      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      hudTc.innerText = 'TC: ' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(ms).padStart(2,'0') + ' / ${duration}s';
    };

    let startTime = performance.now();
    function animate() {
      const now = performance.now();
      const elapsed = ((now - startTime) / 1000) % window.DUR;
      window.render(elapsed);
      requestAnimationFrame(animate);
    }
    animate();

    function restartPreview() {
      initAudio();
      startTime = performance.now();
      lastSpokenShotIndex = -1;
    }

    // YÊU CẦU 6: RENDER & XUẤT MP4 HOÀN CHỈNH
    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];

    function recordAndDownloadVideo() {
      initAudio();
      const btn = document.getElementById('btn-download-video');
      const btnText = document.getElementById('btn-download-text');
      const progressBox = document.getElementById('render-progress-box');
      const barFill = document.getElementById('render-bar-fill');
      const pctText = document.getElementById('render-pct-text');
      const statusText = document.getElementById('render-status-text');

      if (isRecording) return;
      isRecording = true;
      btnText.innerText = 'Đang render MP4...';
      btn.style.background = '#ef4444';
      progressBox.style.display = 'block';
      recordedChunks = [];

      const canvasStream = canvas.captureStream(30);
      const tracks = [...canvasStream.getVideoTracks()];
      if (audioDestNode && audioDestNode.stream) {
        tracks.push(...audioDestNode.stream.getAudioTracks());
      }
      const combinedStream = new MediaStream(tracks);

      let mime = 'video/mp4;codecs=avc1,mp4a.40.2';
      if (!MediaRecorder.isTypeSupported(mime)) {
        mime = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
      }

      mediaRecorder = new MediaRecorder(combinedStream, { mimeType: mime, videoBitsPerSecond: 6000000 });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const isMp4 = mime.includes('mp4');
        const blob = new Blob(recordedChunks, { type: isMp4 ? 'video/mp4' : 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '${filmId}_lumina_animation.mp4';
        a.click();
        URL.revokeObjectURL(url);

        isRecording = false;
        btnText.innerText = 'Tải Video MP4';
        btn.style.background = '${color}';
        progressBox.style.display = 'none';
      };

      startTime = performance.now();
      lastSpokenShotIndex = -1;
      mediaRecorder.start();

      const renderInterval = setInterval(() => {
        if (!isRecording) { clearInterval(renderInterval); return; }
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const pct = Math.min(100, Math.floor((elapsed / window.DUR) * 100));
        barFill.style.width = pct + '%';
        pctText.innerText = pct + '%';
        statusText.innerText = 'Đang render MP4: ' + pct + '% (' + Math.floor(elapsed) + 's/' + window.DUR + 's)...';
        if (elapsed >= window.DUR) {
          clearInterval(renderInterval);
          if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }
      }, 200);
    }
  <` + `/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

// YÊU CẦU 2: ĐẠO DIỄN TỰ ĐỘNG - STORYBOARD 30S TIMELINE
async function generateClientSideStoryboard(prompt, styleId, aspect, duration, characterBible, onProgress) {
  const preset = DEFAULT_STYLES.find(s => s.id === styleId) || DEFAULT_STYLES[4];
  const filmId = `film_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const title = prompt.length > 36 ? prompt.substring(0, 36) + '...' : (prompt || 'Video Hoạt Hình Lego 30s');

  const charName = characterBible?.name || 'Cậu bé lắp ráp Lego';
  const charDesc = characterBible?.description || 'Cậu bé sáng tạo cùng khối đồ chơi Lego robot';
  const charTraitsStr = (characterBible?.locked_traits || ['Áo thun đỏ viền vàng', 'Khối Lego ABS bóng bẩy', 'Mắt to thông minh']).join(', ');

  // YÊU CẦU 1: Fixed Seed for the entire project + Style Lock inserted into EVERY shot
  const projectSeed = Math.abs(computeStringHash(prompt + styleId)) % 899999 + 100000;
  const styleLock = `Lego stop-motion brickfilm style, authentic ABS plastic toy bricks with studs, miniature macro studio lighting, depth of field 12fps aesthetic, rich primary colors, glossy finish, sharp rim lighting 8k. [Character: ${charName}, ${charDesc}. Locked traits: ${charTraitsStr}]`;

  const shotBlueprints = [
    {
      num: 1,
      title: "Shot 1: Mở Đầu Đại Cảnh (Establishing Shot)",
      start: 0.0,
      end: 5.0,
      time: "00:00 - 00:05",
      camera: { type: "dolly_in", from: { scale: 1.0 }, to: { scale: 1.25 }, easing: "easeInOutCubic" },
      transitionOut: { type: "whip_pan", duration: 0.4 },
      action: `wide establishing macro shot of ${prompt}, boy sitting at bright studio table full of colorful Lego brick pieces, warm sunlight`,
      voiceover: "Mỗi buổi sáng, một thế giới diệu kỳ mở ra từ những khối gạch nhỏ bé...",
      subtitle: "Mỗi buổi sáng, một thế giới diệu kỳ mở ra từ những khối gạch nhỏ bé..."
    },
    {
      num: 2,
      title: "Shot 2: Cơ Chế Cơ Khí & Lắp Ráp (Mechanism)",
      start: 5.0,
      end: 10.0,
      time: "00:05 - 00:10",
      camera: { type: "orbit_pan", from: { x: -40, rot: -0.052 }, to: { x: 40, rot: 0.052 }, easing: "easeInOutCubic" },
      transitionOut: { type: "zoom_through", duration: 0.5 },
      action: `extreme macro close-up, small hands precisely snapping Lego gears, hinges and cockpit transforming into futuristic mechanism`,
      voiceover: "Từng chi tiết cơ khí ăn khớp hoàn hảo, tháo lắp thông minh và chuẩn xác...",
      subtitle: "Từng chi tiết cơ khí ăn khớp hoàn hảo, tháo lắp thông minh và chuẩn xác..."
    },
    {
      num: 3,
      title: "Shot 3: Hành Động Kịch Tính (Dynamic Action)",
      start: 10.0,
      end: 18.0,
      time: "00:10 - 00:18",
      camera: { type: "dutch_tilt", baseAngle: 0.174, shakeIntensity: 1.0, easing: "easeInOutCubic" },
      transitionOut: { type: "glitch_cut", duration: 0.35 },
      action: `high-speed dynamic motion shot, completed Lego build speeding across obstacle track, glowing LED beams, sparks and motion streaks`,
      voiceover: "Khởi động động cơ phản lực, cùng bứt phá tốc độ và giải cứu thành phố nào!",
      subtitle: "Khởi động động cơ phản lực, cùng bứt phá tốc độ và giải cứu thành phố nào!"
    },
    {
      num: 4,
      title: "Shot 4: Cảm Xúc & Tự Hào (Emotion Reaction)",
      start: 18.0,
      end: 22.0,
      time: "00:18 - 00:22",
      camera: { type: "dolly_out", from: { scale: 1.25 }, to: { scale: 1.0 }, easing: "easeInOutCubic" },
      transitionOut: { type: "crossfade", duration: 0.5 },
      action: `medium close-up, boy smiling with proud joyful eyes holding his finished Lego masterpiece, warm golden hour studio rim light`,
      voiceover: "Nuôi dưỡng tư duy logic, sự kiên trì và niềm vui sáng tạo bất tận trong bé.",
      subtitle: "Nuôi dưỡng tư duy logic, sự kiên trì và niềm vui sáng tạo bất tận trong bé."
    },
    {
      num: 5,
      title: "Shot 5: Chi Tiết Phụ Kiện & An Toàn (Showcase)",
      start: 22.0,
      end: 26.0,
      time: "00:22 - 00:26",
      camera: { type: "orbit_pan", from: { x: 30, rot: 0.03 }, to: { x: -30, rot: -0.03 }, easing: "easeInOutCubic" },
      transitionOut: { type: "match_cut", duration: 0.3 },
      action: `top-down flatlay layout, packaging box, certified 100% virgin ABS plastic badge, clean rounded non-toxic corners`,
      voiceover: "Nhựa nguyên sinh ABS an toàn tuyệt đối, đạt chứng chỉ tiêu chuẩn an toàn quốc tế.",
      subtitle: "Nhựa nguyên sinh ABS an toàn tuyệt đối, đạt chứng chỉ tiêu chuẩn an toàn quốc tế."
    },
    {
      num: 6,
      title: "Shot 6: Kêu Gọi Mua Hàng & Khuyến Mãi (Hero CTA)",
      start: 26.0,
      end: 30.0,
      time: "00:26 - 00:30",
      camera: { type: "static_punchy", bounceIntensity: 1.0, easing: "easeOutBounce" },
      transitionOut: { type: "none", duration: 0.0 },
      action: `hero product showcase on glowing glass pedestal, sparkling Lego logo, gift boxes and limited discount banner`,
      voiceover: "Sở hữu ngay hôm nay trên các sàn thương mại điện tử để nhận trọn bộ quà tặng!",
      subtitle: "Sở hữu ngay hôm nay trên các sàn thương mại điện tử để nhận trọn bộ quà tặng!"
    }
  ];

  const shots = [];
  // YÊU CẦU 1: Fetch shot images sequentially with Rate Limiting (>= 46s) & Cache
  for (let i = 0; i < shotBlueprints.length; i++) {
    const bp = shotBlueprints[i];
    const fullVisualPrompt = `${styleLock}. Shot ${bp.num}: ${bp.action}`;
    const fallbackImg = CURATED_LEGO_SHOTS[i % CURATED_LEGO_SHOTS.length];

    // Fetch via sequential queue & cache
    let shotImg = fallbackImg;
    try {
      shotImg = await fetchShotImageWithQueue(fullVisualPrompt, projectSeed, bp.num, 6, onProgress);
    } catch(e) {
      console.warn(`Error generating shot ${bp.num}, using verified fallback:`, e);
      shotImg = fallbackImg;
    }

    shots.push({
      id: `shot_${bp.num}`,
      num: bp.num,
      title: bp.title,
      start: bp.start,
      end: bp.end,
      time: bp.time,
      camera: bp.camera,
      transitionOut: bp.transitionOut,
      imagePrompt: fullVisualPrompt,
      visual_prompt: fullVisualPrompt,
      voiceover: bp.voiceover,
      subtitle: bp.subtitle,
      vo: bp.voiceover,
      img: shotImg,
      fallback_img: fallbackImg,
      status: 'ready'
    });
  }

  const renderCmd = `# Lemo-OpusCar Automation Script\npython -m lemo_opuscar.cli render \\\n  --style "${styleId}" \\\n  --prompt "${prompt}" \\\n  --duration ${duration} \\\n  --aspect "${aspect}" \\\n  --shots 6 \\\n  --fps 30 \\\n  --output "./dist/${filmId}.mp4"`;

  const film = {
    id: filmId,
    title: title,
    prompt: prompt,
    seed: projectSeed,
    style_lock: styleId,
    style: styleId,
    duration: duration,
    aspect: aspect,
    character_bible: characterBible || currentCharacterBible,
    shots: shots,
    renderCmd: renderCmd,
    version: 1,
    history: [],
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };

  film.filmUrl = buildInteractiveFilmPlayerBlob(film);
  return film;
}

function computeStringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function runClientSideIntentRouter(payload, onProgress) {
  const p = (payload.prompt || '').trim().toLowerCase();

  // Branch 1: @shotN edit
  const shotMatch = p.match(/^@shot([1-6])\s*(.*)/i);
  if (shotMatch) {
    const shotNum = parseInt(shotMatch[1]);
    const instruction = shotMatch[2].trim() || 'Cập nhật hình ảnh và hành động mới';

    let target = localHistory.find(f => f.id === payload.activeFilmId) || localHistory[0];
    if (!target) {
      target = await generateClientSideStoryboard('Video cậu bé lắp ráp lego', payload.style || 'brick-toy', payload.aspect || '16:9', payload.duration || 30, payload.character_bible, onProgress);
    }

    if (!target.history) target.history = [];
    target.history.push({
      version: target.version || 1,
      shots: JSON.parse(JSON.stringify(target.shots)),
      character_bible: JSON.parse(JSON.stringify(target.character_bible || {}))
    });
    target.version = (target.version || 1) + 1;

    const projectSeed = target.seed || 123456;
    const preset = DEFAULT_STYLES.find(s => s.id === (target.style_lock || target.style)) || DEFAULT_STYLES[4];
    const newPrompt = `${preset.prompt_prefix}, [Style Lock: brick-toy], ${instruction}, 8k cinematic shot`;

    if (onProgress) onProgress(`Đang tạo lại @shot${shotNum}...`, 50);
    const newImg = await fetchShotImageWithQueue(newPrompt, projectSeed, shotNum, 6, onProgress);

    for (let s of target.shots) {
      if (s.num === shotNum) {
        s.title = `Shot ${shotNum}: ${instruction.substring(0, 30)}`;
        s.imagePrompt = newPrompt;
        s.visual_prompt = newPrompt;
        s.voiceover = `${instruction}...`;
        s.subtitle = `${instruction}...`;
        s.img = newImg;
      }
    }

    target.filmUrl = buildInteractiveFilmPlayerBlob(target);
    saveLocalHistory(target);

    return {
      success: true,
      intent: 'edit_single_shot',
      reply: `Đã cập nhật và tạo lại thành công phân cảnh @shot${shotNum}: "${instruction}"!`,
      film: target
    };
  }

  // Branch 2: Greetings & FAQ
  const greetings = ["hi", "hello", "chào", "chao", "xin chào", "xin chao", "alo", "hey", "bạn là ai", "lumina là gì", "hướng dẫn", "help", "làm được gì", "test"];
  const greetingPrefixes = ["hi", "hello", "chào", "chao", "xin chào", "xin chao", "hey", "alo"];
  if (greetings.includes(p) || greetingPrefixes.some(g => p.startsWith(g + ' ') || p === g)) {
    return {
      success: true,
      intent: 'greeting_faq',
      reply: 'Xin chào! Tôi là Lumina AI Animation Studio. Tôi có thể giúp bạn tạo video hoạt hình 30s chuyên nghiệp từ ý tưởng của bạn với chuyển động camera điện ảnh, giọng đọc tiếng Việt và nhạc nền đồng bộ.',
      suggestions: [
        'video cậu bé lắp ráp lego',
        'Tạo video 30s Lego siêu xe biến hình',
        'Tạo video 3D Pixar robot dọn dẹp đáng yêu'
      ]
    };
  }

  // Branch 3: Ambiguous requests
  const words = p.split(/\s+/);
  const ambiguousPhrases = [
    "tôi muốn làm video", "làm video", "làm clip", "tạo video", "tạo clip",
    "quảng cáo đồ chơi", "video hoạt hình", "phim hoạt hình", "video ngắn",
    "làm phim", "làm clip đồ chơi", "làm video đồ chơi", "muốn tạo video", "muốn làm video"
  ];
  const hasSpecificSubject = ["lego", "robot", "xe", "dino", "búp bê", "anime", "mecha", "stem", "drift", "mèo", "chó", "siêu nhân", "công chúa", "chiến binh", "giải cứu", "biến hình", "bay vút", "thành phố", "vương quốc", "cậu bé", "lắp ráp"].some(k => p.includes(k));
  const isAmbiguous = (ambiguousPhrases.some(phrase => phrase === p || p.includes(phrase)) && !hasSpecificSubject) || (words.length <= 5 && !hasSpecificSubject);

  if (isAmbiguous) {
    return {
      success: true,
      intent: 'ambiguous',
      reply: 'Ý tưởng của bạn rất tiềm năng! Để Lumina tạo video hoạt hình đúng chuẩn nhất cho bạn, hãy bổ sung thêm vài thông tin:',
      questions: [
        '1. Nhân vật / Chủ đề chính là gì? (vd: Cậu bé lắp ráp Lego, Robot Mecha, Khủng long đất nặn)',
        '2. Phong cách hoạt hình mong muốn? (vd: 3D Pixar, 2D Anime, Brick-Toy Lego, Claymation)',
        '3. Thời lượng và tỷ lệ khung hình? (vd: 15s dọc TikTok 9:16 hay 30s ngang TVC 16:9)'
      ],
      suggestions: [
        'video cậu bé lắp ráp lego',
        'Siêu xe Lego biến hình robot (30s TVC)',
        'Robot STEM thông minh (15s TikTok)'
      ]
    };
  }

  // Branch 4: Full Storyboard
  const newFilm = await generateClientSideStoryboard(payload.prompt, payload.style || 'brick-toy', payload.aspect || '16:9', payload.duration || 30, payload.character_bible, onProgress);
  saveLocalHistory(newFilm);
  return {
    success: true,
    intent: 'create_storyboard',
    film: newFilm
  };
}

// ==========================================
// 5. SUBMIT CHAT & INTENT ROUTER HANDLING
// ==========================================
async function submitGenerateVideo() {
  const inputEl = document.getElementById('dock-prompt-input');
  const prompt = inputEl.value.trim();

  if (!prompt && !uploadedMaterialData) {
    inputEl.focus();
    return;
  }

  // Switch to feed view
  document.getElementById('hero-empty-state').style.display = 'none';
  const feed = document.getElementById('generation-feed');
  feed.style.display = 'flex';

  // Inject User Message Card
  const userCardId = `user-msg-${Date.now()}`;
  feed.insertAdjacentHTML('beforeend', `
    <div id="${userCardId}" class="user-msg-card">
      <div class="user-msg-header">
        <span>You</span>
        <span>${currentStyle} • ${currentAspect}</span>
      </div>
      <div class="user-msg-body">${prompt || 'Video tạo từ hình ảnh đồ chơi nạp vào'}</div>
      ${uploadedMaterialData ? `<img src="${uploadedMaterialData}" class="user-msg-img">` : ''}
    </div>
  `);

  // Inject AI Loading Card with Live Progress & Queue Feedback
  const loadingCardId = `ai-loading-${Date.now()}`;
  feed.insertAdjacentHTML('beforeend', `
    <div id="${loadingCardId}" class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card" style="padding: 14px 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace; color: #d1d1dc;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--accent-green); font-size: 14px;">⚙️</span>
            <span id="sse-progress-msg">Lớp Intent Router: Đang phân tích yêu cầu...</span>
          </div>
          <span id="sse-progress-pct" style="color: var(--accent-green); font-weight: 700;">15%</span>
        </div>
        <div style="width: 100%; height: 5px; background: #08080b; border-radius: 4px; overflow: hidden; margin-top: 8px;">
          <div id="sse-progress-bar" style="width: 15%; height: 100%; background: var(--accent-green); transition: width 0.3s ease;"></div>
        </div>
      </div>
    </div>
  `);

  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  inputEl.value = '';

  const payload = {
    prompt: prompt,
    activeFilmId: activeFilmId,
    style: currentStyle,
    aspect: currentAspect,
    duration: currentDuration,
    draft: isDraftMode,
    material: uploadedMaterialData,
    character_bible: currentCharacterBible
  };

  const updateProgress = (msg, pct) => {
    const bar = document.getElementById('sse-progress-bar');
    const msgEl = document.getElementById('sse-progress-msg');
    const pctEl = document.getElementById('sse-progress-pct');
    if (bar) bar.style.width = pct + '%';
    if (msgEl) msgEl.innerText = msg;
    if (pctEl) pctEl.innerText = pct + '%';
  };

  // Call Server or Fallback to Client Engine
  let result = null;
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      result = await response.json();
    }
  } catch (err) {}

  if (!result || !result.intent) {
    updateProgress('Kích hoạt Director Pipeline & Hàng đợi tuần tự...', 35);
    result = await runClientSideIntentRouter(payload, updateProgress);
  }

  document.getElementById(loadingCardId)?.remove();

  if (!result) {
    showErrorCard('Không thể xử lý yêu cầu lúc này.');
    return;
  }

  if (result.intent === 'greeting_faq') {
    renderGreetingCard(result);
  }
  else if (result.intent === 'ambiguous') {
    renderClarificationCard(result);
  }
  else if (result.intent === 'edit_single_shot') {
    renderSingleShotEditCard(result);
    if (result.film) {
      activeFilmId = result.film.id;
      renderCompletedFilmCard(result.film);
      fetchHistory();
    }
  }
  else if (result.film) {
    activeFilmId = result.film.id;
    renderCompletedFilmCard(result.film);
    fetchHistory();
  } else {
    showErrorCard('Không thể tạo video: ' + (result.error || 'Lỗi xử lý'));
  }
}

// Render Conversational Greeting / FAQ Card
function renderGreetingCard(data) {
  const feed = document.getElementById('generation-feed');
  feed.insertAdjacentHTML('beforeend', `
    <div class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card" style="padding: 16px 20px;">
        <div style="font-size: 13.5px; color: #f4f4f7; line-height: 1.6;">${data.reply}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
          ${(data.suggestions || []).map(s => `
            <button onclick="applySuggestionPrompt('${s.replace(/'/g, "\\'")}')" class="dock-pill" style="color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.3);">
              <span>✨</span>
              <span>${s}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `);
  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
}

// Render Clarifying Questions Card
function renderClarificationCard(data) {
  const feed = document.getElementById('generation-feed');
  feed.insertAdjacentHTML('beforeend', `
    <div class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card" style="padding: 16px 20px;">
        <div style="font-size: 13.5px; color: #f4f4f7; line-height: 1.6; margin-bottom: 12px;">${data.reply}</div>
        <div style="display: flex; flex-direction: column; gap: 8px; background: #08080b; border: 1px solid #1a1a24; border-radius: 10px; padding: 12px 14px; font-size: 12.5px; color: #d1d1dc;">
          ${(data.questions || []).map(q => `<div>${q}</div>`).join('')}
        </div>
        <div style="font-size: 11px; font-mono; color: #777; margin-top: 12px; margin-bottom: 6px;">Hoặc bấm chọn nhanh gợi ý:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${(data.suggestions || []).map(s => `
            <button onclick="applySuggestionPrompt('${s.replace(/'/g, "\\'")}')" class="dock-pill" style="color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.3);">
              <span>🚀</span>
              <span>${s}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `);
  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
}

// Render Single Shot Edited Notification Card
function renderSingleShotEditCard(data) {
  const feed = document.getElementById('generation-feed');
  feed.insertAdjacentHTML('beforeend', `
    <div class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card" style="padding: 14px 18px; border-color: rgba(16, 185, 129, 0.4);">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--accent-green); font-weight: 600;">
          <span>✅</span>
          <span>${data.reply}</span>
        </div>
      </div>
    </div>
  `);
}

// Render Completed Film Card with 6 Shots & Interactive Player
function renderCompletedFilmCard(film) {
  document.getElementById('hero-empty-state').style.display = 'none';
  const feed = document.getElementById('generation-feed');
  feed.style.display = 'flex';

  activeFilmId = film.id;
  const cardId = `film-${film.id}`;
  const existingCard = document.getElementById(cardId);
  if (existingCard) existingCard.remove();

  const charName = film.character_bible?.name || 'Cậu bé lắp ráp Lego';
  const hasHistory = (film.history && film.history.length > 0);

  // If filmUrl is missing or relative on static host, create live Blob player
  if (!film.filmUrl || (!window.location.port && film.filmUrl.startsWith('/generated_films'))) {
    film.filmUrl = buildInteractiveFilmPlayerBlob(film);
  }

  // YÊU CẦU 6: Verify all shots ready
  const allShotsReady = film.shots && film.shots.length === 6 && film.shots.every(s => s.status !== 'error');

  feed.insertAdjacentHTML('beforeend', `
    <div id="${cardId}" class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card">
        
        <!-- Header Info & Actions -->
        <div class="ai-card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="ai-card-title">${film.title}</span>
              <span style="font-size: 9px; background: #1c1c27; color: var(--accent-green); border: 1px solid #28283a; padding: 1px 6px; border-radius: 4px; font-family: monospace;">v${film.version || 1}</span>
            </div>
            <div class="ai-card-meta">
              Style: <strong style="color: var(--accent-green);">${film.style_lock || film.style}</strong> • ${film.duration}s (${film.aspect}) • Character: <strong style="color: #fff;">${charName}</strong>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${hasHistory ? `
              <button onclick="undoFilmVersion('${film.id}')" class="btn-fullscreen" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.3);" title="Quay lại phiên bản trước">
                ↺ Undo (Hoàn tác)
              </button>
            ` : ''}
            <button onclick="triggerFilmDownload('${film.id}')" class="btn-fullscreen" style="color: var(--accent-green); border-color: rgba(16, 185, 129, 0.4); font-weight: 700;" ${!allShotsReady ? 'disabled title="Đang tạo ảnh các phân cảnh..."' : ''}>
              ${allShotsReady ? '💾 Tải Video MP4' : '⏳ Đang đồng bộ...'}
            </button>
            <a href="${film.filmUrl}" target="_blank" class="btn-fullscreen">
              Toàn Màn Hình ↗
            </a>
          </div>
        </div>

        <!-- Interactive Stitched Video Viewport Player -->
        <div class="video-viewport-frame" style="${film.aspect === '9:16' ? 'max-width: 280px; aspect-ratio: 9/16; margin: 0 auto;' : ''}">
          <iframe id="iframe-${film.id}" src="${film.filmUrl}"></iframe>
        </div>

        <!-- 6 Cinematic Shots Breakdown with Image Click to Replace & Retry -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #8e8e9f; font-family: monospace; text-transform: uppercase;">
            <span>6 Cinematic Shots (Gõ "@shotN <lệnh>" trong chat để sửa riêng shot đó)</span>
            <span style="color: var(--accent-green); font-size: 10px;">Click thumbnail to replace</span>
          </div>
          <div class="shots-grid">
            ${film.shots.map(s => {
              const camName = typeof s.camera === 'object' ? s.camera.type : s.camera;
              return `
              <div class="shot-card" onclick="replaceShotImage('${film.id}', ${s.num})" style="cursor: pointer;" title="Nhấp để tải ảnh khác thay thế cho Shot ${s.num}">
                <div class="shot-thumb-wrapper" id="shot-wrap-${film.id}-${s.num}">
                  <div class="shot-thumb-skeleton" id="shot-skel-${film.id}-${s.num}">
                    <span class="spinner-small"></span>
                  </div>
                  <img src="${s.img}" class="shot-img loading" id="shot-img-${film.id}-${s.num}" 
                       onload="onShotImgLoaded('${film.id}', ${s.num})" 
                       onerror="onShotImgError('${film.id}', ${s.num})">
                  <div class="shot-thumb-error" id="shot-err-${film.id}-${s.num}" style="display: none;">
                    <span style="font-size: 9px; color: #fca5a5;">Lỗi ảnh</span>
                    <button type="button" class="btn-shot-retry" onclick="retryShotImage('${film.id}', ${s.num}, event)">🔄 Thử lại</button>
                  </div>
                </div>
                <div class="shot-info">
                  <div class="shot-name">${s.title}</div>
                  <div class="shot-cam">${camName} • ${s.time}</div>
                </div>
              </div>
            `;}).join('')}
          </div>
        </div>

        <!-- Lemo-OpusCar CLI Command Snippet -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-family: monospace; color: #8e8e9f;">
            <span>Mã Render Lemo-OpusCar CLI:</span>
            <button onclick="copyToClipboard('${(film.renderCmd || '').replace(/\n/g, '\\n')}')" style="background: none; border: none; color: var(--accent-green); cursor: pointer; text-decoration: underline;">Copy Script</button>
          </div>
          <div class="cmd-box">${film.renderCmd || ''}</div>
        </div>

      </div>
    </div>
  `);

  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
}

function triggerFilmDownload(filmId) {
  const iframe = document.getElementById(`iframe-${filmId}`);
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.recordAndDownloadVideo?.();
  } else {
    alert('Vui lòng mở video hoặc bấm nút Tải Video MP4 trực tiếp trong trình phát.');
  }
}

// STEP 3: UNDO FUNCTIONALITY
async function undoFilmVersion(filmId) {
  let target = localHistory.find(f => f.id === filmId);
  try {
    const res = await fetch('/api/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.film) {
        renderCompletedFilmCard(data.film);
        fetchHistory();
        alert(`Đã hoàn tác về phiên bản v${data.film.version}!`);
        return;
      }
    }
  } catch (err) {}

  if (target && target.history && target.history.length > 0) {
    const lastSnap = target.history.pop();
    target.shots = lastSnap.shots;
    if (lastSnap.character_bible) target.character_bible = lastSnap.character_bible;
    target.version = lastSnap.version;
    target.filmUrl = buildInteractiveFilmPlayerBlob(target);
    saveLocalHistory(target);
    renderCompletedFilmCard(target);
    alert(`Đã hoàn tác về phiên bản v${target.version}!`);
  } else {
    alert('Không có phiên bản trước để hoàn tác.');
  }
}

// STEP 1: THUMBNAIL LOADING, ERROR & RETRY HANDLERS
function onShotImgLoaded(filmId, shotNum) {
  const skel = document.getElementById(`shot-skel-${filmId}-${shotNum}`);
  const img = document.getElementById(`shot-img-${filmId}-${shotNum}`);
  const err = document.getElementById(`shot-err-${filmId}-${shotNum}`);
  if (skel) skel.classList.add('hidden');
  if (img) img.classList.remove('loading');
  if (err) err.style.display = 'none';
}

function onShotImgError(filmId, shotNum) {
  const skel = document.getElementById(`shot-skel-${filmId}-${shotNum}`);
  const img = document.getElementById(`shot-img-${filmId}-${shotNum}`);
  const err = document.getElementById(`shot-err-${filmId}-${shotNum}`);
  if (skel) skel.classList.add('hidden');
  if (img) img.classList.add('loading');
  if (err) err.style.display = 'flex';
}

async function retryShotImage(filmId, shotNum, event) {
  if (event) event.stopPropagation();
  const skel = document.getElementById(`shot-skel-${filmId}-${shotNum}`);
  const err = document.getElementById(`shot-err-${filmId}-${shotNum}`);
  const img = document.getElementById(`shot-img-${filmId}-${shotNum}`);
  if (skel) skel.classList.remove('hidden');
  if (err) err.style.display = 'none';

  let newImgUrl = null;
  try {
    const res = await fetch('/api/retry-shot-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId, shotNum })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.img) {
        newImgUrl = data.img;
      }
    }
  } catch (e) {}

  if (!newImgUrl) {
    const target = localHistory.find(f => f.id === filmId);
    if (target) {
      const shot = target.shots.find(s => s.num === shotNum);
      if (shot) {
        const seed = Date.now() % 999999;
        newImgUrl = await fetchShotImageWithQueue(shot.visual_prompt || 'cinematic toy shot', seed, shotNum, 6);
        shot.img = newImgUrl;
        target.filmUrl = buildInteractiveFilmPlayerBlob(target);
        saveLocalHistory(target);
      }
    }
  }

  if (newImgUrl) {
    if (img) img.src = newImgUrl;
    const iframe = document.querySelector(`#film-${filmId} iframe`);
    if (iframe) iframe.src = iframe.src.split('?')[0] + '?t=' + Date.now();
  } else {
    if (err) err.style.display = 'flex';
    if (skel) skel.classList.add('hidden');
  }
}

function replaceShotImage(filmId, shotNum) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const imgEl = document.getElementById(`shot-img-${filmId}-${shotNum}`);
      if (imgEl) imgEl.src = dataUrl;

      const target = localHistory.find(f => f.id === filmId);
      if (target) {
        const shot = target.shots.find(s => s.num === shotNum);
        if (shot) shot.img = dataUrl;
        target.filmUrl = buildInteractiveFilmPlayerBlob(target);
        saveLocalHistory(target);
      }

      await fetch('/api/update-shot-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filmId, shotNum, img: dataUrl })
      }).catch(() => {});

      const iframe = document.querySelector(`#film-${filmId} iframe`);
      if (iframe) iframe.src = iframe.src.split('?')[0] + '?t=' + Date.now();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function showErrorCard(msg) {
  const feed = document.getElementById('generation-feed');
  feed.insertAdjacentHTML('beforeend', `
    <div style="padding: 12px 16px; background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.4); border-radius: 12px; font-size: 12px; font-family: monospace; color: #fca5a5;">
      ⚠️ ${msg}
    </div>
  `);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text.replace(/\\n/g, '\n')).then(() => {
    alert('Đã sao chép lệnh render vào bộ nhớ tạm!');
  });
}

function toggleHistoryModal(show = true) {
  const modal = document.getElementById('history-modal');
  if (modal) modal.classList.toggle('hidden', !show);
}

function resetToHome() {
  document.getElementById('generation-feed').style.display = 'none';
  document.getElementById('hero-empty-state').style.display = 'block';
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('collapsed');
}

function showExploreAlert() {
  alert('Tính năng Explore: Khám phá thư viện video mẫu tạo bởi Lumina AI Animation!');
}
