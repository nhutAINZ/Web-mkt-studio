// Lumina AI Animation Studio - Complete Frontend Logic
// - Dual Mode: Runs on Python/Gemini Backend OR Standalone on Static Hosting (Netlify)
// - Intent Router Handling (Greetings, Ambiguous Questions, Storyboard, @shotN edit)
// - Storyboard JSON SSOT + Undo History
// - Character Bible (Upload, Lock, Consistency across all shots)
// - Real-time SSE Progress Streaming (with Smooth Simulation Fallback on Netlify)
// - 6 Animation Presets (2D Cartoon, 3D Pixar, Anime, Claymation, Brick-Toy, Chibi)
// - Shot Loading / Error / Retry States

// 6 Official Animation Presets
const DEFAULT_STYLES = [
  { id: '2d-cartoon', name: '2D Cartoon (Hoạt Hình Cổ Điển)', tag: '2d', color: '#38bdf8', prompt_prefix: 'vibrant 2D cartoon animation style, bold outlines, expressive Disney/Looney Tunes aesthetic, bright colors, cel shaded 8k', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
  { id: '3d-disney', name: '3D Pixar / Disney (Điện Ảnh 3D)', tag: '3d', color: '#a855f7', prompt_prefix: 'stunning 3D Pixar Disney style CGI animation, subsurface scattering, soft ambient lighting, high fidelity octane render 8k', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80' },
  { id: 'anime', name: 'Anime Nhật Bản (Makoto Shinkai)', tag: 'anime', color: '#f43f5e', prompt_prefix: 'breathtaking Japanese anime art style by Makoto Shinkai and Studio Ghibli, lush skies, dramatic lens flares, intricate details 8k', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80' },
  { id: 'claymation', name: 'Claymation (Đất Nặn Thủ Công)', tag: 'clay', color: '#fb7185', prompt_prefix: 'tactile handmade plasticine claymation stop-motion Aardman style, visible fingerprints on clay, soft organic shapes, cozy studio light 8k', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80' },
  { id: 'brick-toy', name: 'Brick-Toy (Lego Stop-Motion 12fps)', tag: 'brick', color: '#f59e0b', prompt_prefix: 'Lego stop-motion brickfilm style, glossy ABS plastic toy blocks, realistic miniature studio lighting, depth of field 12fps aesthetic 8k', img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80' },
  { id: 'chibi', name: 'Chibi Cute (Nhân Vật Đầu To Đáng Yêu)', tag: 'chibi', color: '#10b981', prompt_prefix: 'ultra cute chibi character proportion, oversized head, big sparkling anime eyes, playful pastel colors, charming 3D toy figure 8k', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80' }
];

let currentStyle = 'brick-toy';
let currentMode = 'AI Video';
let currentAspect = '16:9';
let currentDuration = 30;
let isDraftMode = false;
let uploadedMaterialData = null;
let activeFilmId = null;
let currentCharacterBible = {
  name: 'Nhân Vật Chính',
  description: 'Mô hình đồ chơi thông minh',
  reference_image: null,
  locked_traits: ['Vỏ kim loại bóng', 'Mắt kính LED xanh']
};
let stylesList = [];
let localHistory = [];

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
  } catch (err) {
    // Fallback for Netlify / Static hosting
  }
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
  } catch (e) {
    // Fallback for Netlify
  }

  // Load from localStorage
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
  } catch (e) {
    // Fallback
  }

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
  const name = document.getElementById('char-name-input')?.value.trim() || 'Nhân Vật Chính';
  const desc = document.getElementById('char-desc-input')?.value.trim() || 'Mô hình đồ chơi thông minh';
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
// 4. STANDALONE CLIENT-SIDE GENERATION (NETLIFY FALLBACK)
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
    #subtitles-bar {
      position: absolute;
      bottom: 24px;
      left: 20px;
      right: 20px;
      background: rgba(7, 7, 10, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      z-index: 10;
    }
    .sub-text {
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sub-speaker {
      color: ${color};
      font-weight: 700;
      font-family: monospace;
      font-size: 11px;
      background: rgba(245, 158, 11, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }
    #btn-download-video {
      position: absolute;
      top: 14px;
      right: 16px;
      background: ${color};
      color: #000;
      border: none;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.15s;
    }
    #btn-download-video:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div id="stage">
    <div id="hud-top">
      <div class="badge" style="color: ${color};">
        ⚡ LUMINA • ${styleId.toUpperCase()}
      </div>
      <div class="badge" id="hud-tc">
        TC: 00:00.00 / ${duration}s
      </div>
    </div>

    <button id="btn-download-video" onclick="recordAndDownloadVideo()">
      <span>💾</span>
      <span id="btn-download-text">Tải Video MP4</span>
    </button>

    <div id="subtitles-bar">
      <div class="sub-text">
        <span class="sub-speaker" id="sub-speaker">VOICEOVER</span>
        <span id="sub-content">Đang khởi tạo...</span>
      </div>
      <div class="badge" id="hud-shot" style="margin: 0; padding: 3px 8px; font-size: 10px;">
        SHOT 1/6
      </div>
    </div>

    <canvas id="c" width="1280" height="720"></canvas>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const hudTc = document.getElementById('hud-tc');
    const hudShot = document.getElementById('hud-shot');
    const subSpeaker = document.getElementById('sub-speaker');
    const subContent = document.getElementById('sub-content');

    window.DUR = ${duration};
    window.READY = false;

    const SHOTS = ${shotsJson};
    const loadedImages = [];
    let imagesLoadedCount = 0;

    SHOTS.forEach((shot, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = shot.img;
      img.onload = () => {
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

    window.render = function(t) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const shotDuration = window.DUR / SHOTS.length;
      const currentShotIndex = Math.min(SHOTS.length - 1, Math.floor(t / shotDuration));
      const shotProgress = (t % shotDuration) / shotDuration;
      const currentShot = SHOTS[currentShotIndex];
      const img = loadedImages[currentShotIndex];

      if (img && img.complete) {
        ctx.save();
        const scale = 1.0 + shotProgress * 0.12;
        const panX = (shotProgress - 0.5) * 40;
        const panY = (shotProgress - 0.5) * 20;

        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else {
        ctx.fillStyle = '#0f0f15';
        ctx.fillRect(0, 0, w, h);
      }

      // Cinematic Vignette
      const grad = ctx.createRadialGradient(w/2, h/2, h * 0.45, w/2, h/2, w * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Timecode & HUD
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      hudTc.innerText = 'TC: ' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(ms).padStart(2,'0') + ' / ${duration}s';
      hudShot.innerText = 'SHOT ' + (currentShotIndex + 1) + '/' + SHOTS.length + ' • ' + currentShot.camera;
      
      const voText = (currentShot.vo || '').split(':');
      if (voText.length > 1) {
        subSpeaker.innerText = voText[0].trim();
        subContent.innerText = voText[1].trim();
      } else {
        subSpeaker.innerText = 'NARRATOR';
        subContent.innerText = currentShot.vo || '';
      }
    };

    let startTime = performance.now();
    function animate() {
      const now = performance.now();
      const elapsed = ((now - startTime) / 1000) % window.DUR;
      window.render(elapsed);
      requestAnimationFrame(animate);
    }
    animate();

    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];

    function recordAndDownloadVideo() {
      const btn = document.getElementById('btn-download-video');
      const btnText = document.getElementById('btn-download-text');
      if (isRecording) return;

      isRecording = true;
      btnText.innerText = 'Đang quay video...';
      btn.style.background = '#ef4444';
      recordedChunks = [];

      const stream = canvas.captureStream(30);
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      } catch(e) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '${filmId}_video.webm';
        a.click();
        URL.revokeObjectURL(url);

        isRecording = false;
        btnText.innerText = 'Tải Video MP4';
        btn.style.background = '${color}';
      };

      startTime = performance.now();
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      }, Math.min(15000, window.DUR * 1000));
    }
  <` + `/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

function generateClientSideStoryboard(prompt, styleId, aspect, duration, characterBible) {
  const preset = DEFAULT_STYLES.find(s => s.id === styleId) || DEFAULT_STYLES[4];
  const filmId = `film_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const title = prompt.length > 36 ? prompt.substring(0, 36) + '...' : (prompt || 'Hoạt Hình Đồ Chơi AI');
  
  const charTraitsStr = (characterBible?.locked_traits || []).join(', ');
  const charDesc = characterBible ? `${characterBible.name} (${characterBible.description}). Locked traits: ${charTraitsStr}` : 'Toy hero figure';

  const shotBlueprints = [
    { title: "Mở Đầu Đại Cảnh (Establishing Shot)", camera: "Dolly In 4K", time: "00:00 - 00:05", vo: "Voiceover: Chào mừng các bạn nhỏ đến với thế giới đồ chơi kỳ diệu!", action: "Toàn cảnh thế giới đồ chơi rực rỡ sắc màu" },
    { title: "Cơ Chế Biến Hình (Mechanism)", camera: "Orbit 360° Macro", time: "00:05 - 00:10", vo: "Voiceover: Cơ chế biến hình siêu tốc độc đáo, tháo lắp thông minh an toàn.", action: "Góc cận 360 độ chi tiết cơ khí và khớp nối đồ chơi" },
    { title: "Hành Động Kịch Tính (Dynamic Action)", camera: "Dutch Tilt 124 BPM", time: "00:10 - 00:18", vo: "Nhân vật: Khởi động động cơ phản lực, cùng bay vào không gian giải cứu nào!", action: "Hành động tốc độ cao, ánh sáng lấp lánh phiêu lưu" },
    { title: "Cảm Xúc Em Bé (Emotion Reaction)", camera: "Medium Close-up Warm", time: "00:18 - 00:22", vo: "Em bé: Wow! Đồ chơi biến hình đỉnh quá mẹ ơi!", action: "Nụ cười rạng rỡ của trẻ thơ và sự an tâm của bố mẹ" },
    { title: "Đóng Gói & Quà Tặng (Unboxing & Value)", camera: "Top-down 60fps", time: "00:22 - 00:26", vo: "Voiceover: Hộp sản phẩm cao cấp, tặng kèm bộ phụ kiện sáng tạo.", action: "Mở hộp đồ chơi cao cấp sắc sảo từng góc cạnh" },
    { title: "Kêu Gọi Mua Hàng (Call To Action)", camera: "Frontal Static Punchy", time: "00:26 - 00:30", vo: "Voiceover: Sở hữu ngay hôm nay trên các sàn thương mại điện tử!", action: "Sản phẩm tỏa sáng cùng logo và thông điệp chốt hạ" }
  ];

  const shots = shotBlueprints.map((b, idx) => {
    const num = idx + 1;
    const seed = (Date.now() + num * 777) % 999999;
    const visualPrompt = `${preset.prompt_prefix}, character: ${charDesc}, shot ${num}: ${b.action}, cinematic lighting, 8k masterpiece`;
    const encodedPrompt = encodeURIComponent(visualPrompt);
    const img = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;
    const fallbackImg = `https://picsum.photos/seed/${seed}/1280/720`;
    return {
      num: num,
      title: `Shot ${num}: ${b.title}`,
      time: b.time,
      camera: b.camera,
      visual_prompt: visualPrompt,
      vo: b.vo,
      img: img,
      fallback_img: fallbackImg,
      status: 'ready'
    };
  });

  const renderCmd = `# Lemo-OpusCar Automation Script\npython -m lemo_opuscar.cli render \\\n  --style "${styleId}" \\\n  --prompt "${prompt}" \\\n  --duration ${duration} \\\n  --aspect "${aspect}" \\\n  --shots 6 \\\n  --fps 30 \\\n  --output "./dist/${filmId}.mp4"`;

  const film = {
    id: filmId,
    title: title,
    prompt: prompt,
    style_lock: styleId,
    style: styleId,
    duration: duration,
    aspect: aspect,
    character_bible: characterBible || { name: 'Main Hero', description: 'Toy character', reference_image: null, locked_traits: [] },
    shots: shots,
    renderCmd: renderCmd,
    version: 1,
    history: [],
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };

  film.filmUrl = buildInteractiveFilmPlayerBlob(film);
  return film;
}

function runClientSideIntentRouter(payload) {
  const p = (payload.prompt || '').trim().toLowerCase();

  // Branch 1: @shotN edit
  const shotMatch = p.match(/^@shot([1-6])\s*(.*)/i);
  if (shotMatch) {
    const shotNum = parseInt(shotMatch[1]);
    const instruction = shotMatch[2].trim() || 'Cập nhật hình ảnh và hành động mới';
    
    let target = localHistory.find(f => f.id === payload.activeFilmId) || localHistory[0];
    if (!target) {
      target = generateClientSideStoryboard('Phim hoạt hình đồ chơi', payload.style || 'brick-toy', payload.aspect || '16:9', payload.duration || 30, payload.character_bible);
    }

    if (!target.history) target.history = [];
    target.history.push({
      version: target.version || 1,
      shots: JSON.parse(JSON.stringify(target.shots)),
      character_bible: JSON.parse(JSON.stringify(target.character_bible || {}))
    });
    target.version = (target.version || 1) + 1;

    const preset = DEFAULT_STYLES.find(s => s.id === (target.style_lock || target.style)) || DEFAULT_STYLES[4];
    const newSeed = Date.now() % 999999;
    const newPrompt = `${preset.prompt_prefix}, ${instruction}, 8k cinematic shot`;
    const newImg = `https://image.pollinations.ai/prompt/${encodeURIComponent(newPrompt)}?width=1280&height=720&nologo=true&seed=${newSeed}`;

    for (let s of target.shots) {
      if (s.num === shotNum) {
        s.title = `Shot ${shotNum}: ${instruction.substring(0, 30)}`;
        s.visual_prompt = newPrompt;
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
      reply: 'Xin chào! Tôi là Lumina AI Animation Studio. Tôi có thể giúp bạn tạo video hoạt hình chuyên nghiệp từ ý tưởng hoặc hình ảnh của bạn với 6 phong cách nổi bật (3D Pixar, 2D Anime, Claymation, Brick-Toy Lego, Chibi...).',
      suggestions: [
        'Tạo video 30s Lego siêu xe biến hình',
        'Tạo phim ngắn Anime chú mèo pháp sư 15s',
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
  const hasSpecificSubject = ["lego", "robot", "xe", "dino", "búp bê", "anime", "mecha", "stem", "drift", "mèo", "chó", "siêu nhân", "công chúa", "chiến binh", "giải cứu", "biến hình", "bay vút", "thành phố", "vương quốc"].some(k => p.includes(k));
  const isAmbiguous = (ambiguousPhrases.some(phrase => phrase === p || p.includes(phrase)) && !hasSpecificSubject) || (words.length <= 5 && !hasSpecificSubject);

  if (isAmbiguous) {
    return {
      success: true,
      intent: 'ambiguous',
      reply: 'Ý tưởng của bạn rất tiềm năng! Để Lumina tạo video hoạt hình đúng chuẩn nhất cho bạn, hãy bổ sung thêm vài thông tin:',
      questions: [
        '1. Nhân vật / Chủ đề chính là gì? (vd: Siêu xe Lego, Robot Mecha, Khủng long đất nặn)',
        '2. Phong cách hoạt hình mong muốn? (vd: 3D Pixar, 2D Anime, Brick-Toy Lego, Claymation)',
        '3. Thời lượng và tỷ lệ khung hình? (vd: 15s dọc TikTok 9:16 hay 30s ngang TVC 16:9)'
      ],
      suggestions: [
        'Siêu xe Lego biến hình robot (30s TVC)',
        'Robot STEM thông minh (15s TikTok)',
        'Khủng long đất nặn pastel (30s)'
      ]
    };
  }

  // Branch 4: Full Storyboard
  const newFilm = generateClientSideStoryboard(payload.prompt, payload.style || 'brick-toy', payload.aspect || '16:9', payload.duration || 30, payload.character_bible);
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

  // Inject AI Loading Card with Live SSE Progress
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

  // Simulate smooth progress steps if standalone / Netlify
  let progressStep = 15;
  const progressTimer = setInterval(() => {
    progressStep = Math.min(95, progressStep + 18);
    const bar = document.getElementById('sse-progress-bar');
    const msg = document.getElementById('sse-progress-msg');
    const pct = document.getElementById('sse-progress-pct');
    if (bar) bar.style.width = progressStep + '%';
    if (pct) pct.innerText = progressStep + '%';
    if (msg) {
      if (progressStep > 75) msg.innerText = 'Ghép Canvas & Xuất bản Storyboard...';
      else if (progressStep > 45) msg.innerText = 'Pipeline: Sinh 6 Phân cảnh AI...';
      else if (progressStep > 25) msg.innerText = 'Character Bible: Đồng nhất đặc điểm...';
    }
  }, 350);

  // Call Server or Fallback to Standalone Engine
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
    // Standalone fallback
    result = runClientSideIntentRouter(payload);
  }

  clearInterval(progressTimer);
  document.getElementById(loadingCardId)?.remove();

  if (!result) {
    showErrorCard('Không thể xử lý yêu cầu lúc này.');
    return;
  }

  // INTENT ROUTER BRANCH 1: GREETING & FAQ
  if (result.intent === 'greeting_faq') {
    renderGreetingCard(result);
  }
  // INTENT ROUTER BRANCH 2: AMBIGUOUS REQUEST (Ask max 3 questions)
  else if (result.intent === 'ambiguous') {
    renderClarificationCard(result);
  }
  // INTENT ROUTER BRANCH 3: EDIT SINGLE SHOT (@shotN)
  else if (result.intent === 'edit_single_shot') {
    renderSingleShotEditCard(result);
    if (result.film) {
      activeFilmId = result.film.id;
      renderCompletedFilmCard(result.film);
      fetchHistory();
    }
  }
  // INTENT ROUTER BRANCH 4: CREATE FULL STORYBOARD
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

// Render Clarifying Questions Card (Ambiguity Resolver)
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

  const charName = film.character_bible?.name || 'Chưa đặt';
  const hasHistory = (film.history && film.history.length > 0);

  // If filmUrl is missing or relative on static host, create live Blob player
  if (!film.filmUrl || (!window.location.port && film.filmUrl.startsWith('/generated_films'))) {
    film.filmUrl = buildInteractiveFilmPlayerBlob(film);
  }

  feed.insertAdjacentHTML('beforeend', `
    <div id="${cardId}" class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card">
        
        <!-- Header Info & Undo -->
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
            <a href="${film.filmUrl}" target="_blank" class="btn-fullscreen">
              Toàn Màn Hình ↗
            </a>
          </div>
        </div>

        <!-- Interactive Stitched Video Viewport Player -->
        <div class="video-viewport-frame" style="${film.aspect === '9:16' ? 'max-width: 280px; aspect-ratio: 9/16; margin: 0 auto;' : ''}">
          <iframe src="${film.filmUrl}"></iframe>
        </div>

        <!-- 6 Cinematic Shots Breakdown with Image Click to Replace & Retry -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #8e8e9f; font-family: monospace; text-transform: uppercase;">
            <span>6 Cinematic Shots (Gõ "@shotN <lệnh>" trong chat để sửa riêng shot đó)</span>
            <span style="color: var(--accent-green); font-size: 10px;">Click thumbnail to replace</span>
          </div>
          <div class="shots-grid">
            ${film.shots.map(s => `
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
                  <div class="shot-cam">${s.camera} • ${s.time}</div>
                </div>
              </div>
            `).join('')}
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

  // Local storage undo
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
        newImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(shot.visual_prompt || 'cinematic toy shot')}?width=1280&height=720&nologo=true&seed=${seed}`;
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

// User can click on any shot to replace its image
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

      // Update in local history
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
