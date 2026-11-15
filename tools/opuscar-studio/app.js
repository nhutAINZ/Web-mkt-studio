// Lumina AI Animation Studio - Complete Frontend Logic
// - Intent Router Handling (Greetings, Clarifying Questions, Storyboard, @shotN edit)
// - Storyboard JSON SSOT + Undo History
// - Character Bible (Upload, Lock, Consistency across all shots)
// - Real-time SSE Progress Streaming
// - 6 Animation Presets (2D Cartoon, 3D Pixar, Anime, Claymation, Brick-Toy, Chibi)
// - Shot Loading / Error / Retry States

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
// 1. API: FETCH STYLES, HISTORY & CHARACTER BIBLE
// ==========================================
async function fetchStyles() {
  try {
    const res = await fetch('/api/styles');
    const data = await res.json();
    if (data.success && data.styles) {
      stylesList = data.styles;
      renderStylesDropdown(stylesList);
      return;
    }
  } catch (err) {
    // Fallback embedded styles
  }
  stylesList = [
    { id: 'brick-toy', name: 'Brick-Toy (Lego 12fps)' },
    { id: '2d-cartoon', name: '2D Cartoon (Cổ Điển)' },
    { id: '3d-disney', name: '3D Pixar / Disney' },
    { id: 'anime', name: 'Anime Nhật Bản' },
    { id: 'claymation', name: 'Claymation (Đất Nặn)' },
    { id: 'chibi', name: 'Chibi Cute (Đầu To)' }
  ];
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
    const data = await res.json();
    if (data.success && data.history) {
      renderHistoryDrawer(data.history);
      if (data.history.length > 0 && !activeFilmId) {
        activeFilmId = data.history[0].id;
      }
    }
  } catch (e) {
    // Ignore
  }
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
      <p style="font-size: 11px; color: #888; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">${item.prompt}</p>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #555; font-family: monospace; padding-top: 4px;">
        <span>${item.duration}s • ${item.aspect} &bull; v${item.version || 1}</span>
        <span>${item.timestamp}</span>
      </div>
    </div>
  `).join('');
}

function loadFilmFromHistory(filmId) {
  fetch('/api/history')
    .then(r => r.json())
    .then(data => {
      const film = data.history.find(f => f.id === filmId);
      if (film) {
        activeFilmId = film.id;
        renderCompletedFilmCard(film);
      }
    });
}

async function fetchCharacterBible() {
  try {
    const res = await fetch('/api/character-bible');
    const data = await res.json();
    if (data.success && data.character_bible) {
      currentCharacterBible = data.character_bible;
      syncCharacterBibleUI();
    }
  } catch (e) {
    // Ignore
  }
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
    const res = await fetch('/api/character-bible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCharacterBible)
    });
    const data = await res.json();
    if (data.success) {
      alert('Đã khóa Character Bible! Nhân vật sẽ được đưa vào mọi phân cảnh video.');
      toggleCharacterBibleModal(false);
    }
  } catch (err) {
    alert('Lỗi lưu Character Bible: ' + err.message);
  }
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
// 4. SUBMIT CHAT & INTENT ROUTER HANDLING
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

  // Start Server-Sent Events (SSE) Stream
  let eventSource = null;
  try {
    eventSource = new EventSource('/api/stream');
    eventSource.onmessage = (event) => {
      try {
        const d = JSON.parse(event.data);
        const bar = document.getElementById('sse-progress-bar');
        const msg = document.getElementById('sse-progress-msg');
        const pct = document.getElementById('sse-progress-pct');
        if (bar) bar.style.width = d.progress + '%';
        if (msg) msg.innerText = d.msg;
        if (pct) pct.innerText = d.progress + '%';
        if (d.progress >= 100) eventSource.close();
      } catch (err) {}
    };
  } catch (err) {}

  // Call Backend /api/chat
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        activeFilmId: activeFilmId,
        style: currentStyle,
        aspect: currentAspect,
        duration: currentDuration,
        draft: isDraftMode,
        material: uploadedMaterialData,
        character_bible: currentCharacterBible
      })
    });

    if (eventSource) eventSource.close();
    document.getElementById(loadingCardId)?.remove();

    const result = await response.json();

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
      showErrorCard('Không thể xử lý yêu cầu: ' + (result.error || 'Lỗi server'));
    }
  } catch (err) {
    if (eventSource) eventSource.close();
    document.getElementById(loadingCardId)?.remove();
    showErrorCard('Lỗi kết nối máy chủ: ' + err.message);
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
      <div class="ai-card" style="padding: 16px 20px; border-color: rgba(6, 182, 212, 0.4);">
        <div style="font-size: 13px; font-weight: 700; color: var(--accent-cyan); font-family: monospace;">
          💡 LUMINA CLARIFYING AGENT (LÀM RÕ Ý TƯỞNG)
        </div>
        <div style="font-size: 13px; color: #ececf2; margin-top: 4px; line-height: 1.5;">${data.reply}</div>
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0c0c11; border: 1px solid #1f1f2a; padding: 10px 14px; border-radius: 10px; margin-top: 8px; font-size: 12px; color: #c4c4d4; font-family: monospace;">
          ${(data.questions || []).map(q => `<div>${q}</div>`).join('')}
        </div>
        <div style="font-size: 11px; color: #8e8e9f; margin-top: 10px; font-family: monospace;">Hoặc chọn nhanh kịch bản gợi ý bên dưới:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
          ${(data.suggestions || []).map(s => `
            <button onclick="applySuggestionPrompt('${s.replace(/'/g, "\\'")}')" class="dock-pill" style="color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3);">
              <span>⚡</span>
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
      <div class="ai-card" style="padding: 12px 18px; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05);">
        <div style="font-size: 12.5px; color: #f4f4f7; display: flex; align-items: center; justify-content: space-between;">
          <div>✅ <strong>${data.reply}</strong></div>
          <button onclick="undoFilmVersion('${data.film.id}')" class="btn-shot-retry" style="background: #2a2a38; border: 1px solid #444; color: #eee; font-size: 10px; padding: 3px 8px;">
            ↺ Hoàn tác (Undo)
          </button>
        </div>
      </div>
    </div>
  `);
}

// ==========================================
// 5. RENDER COMPLETED STORYBOARD FILM CARD
// ==========================================
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
            <button onclick="copyToClipboard('${film.renderCmd.replace(/\n/g, '\\n')}')" style="background: none; border: none; color: var(--accent-green); cursor: pointer; text-decoration: underline;">Copy Script</button>
          </div>
          <div class="cmd-box">${film.renderCmd}</div>
        </div>

      </div>
    </div>
  `);

  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
}

// STEP 3: UNDO FUNCTIONALITY
async function undoFilmVersion(filmId) {
  try {
    const res = await fetch('/api/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId })
    });
    const data = await res.json();
    if (data.success && data.film) {
      renderCompletedFilmCard(data.film);
      fetchHistory();
      alert(`Đã hoàn tác về phiên bản v${data.film.version}!`);
    } else {
      alert('Không thể hoàn tác: ' + (data.error || 'Không có lịch sử trước'));
    }
  } catch (err) {
    alert('Lỗi hoàn tác: ' + err.message);
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

  try {
    const res = await fetch('/api/retry-shot-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId, shotNum })
    });
    const data = await res.json();
    if (data.success && data.img) {
      if (img) img.src = data.img;
      const iframe = document.querySelector(`#film-${filmId} iframe`);
      if (iframe) iframe.src = iframe.src.split('?')[0] + '?t=' + Date.now();
    } else {
      if (err) err.style.display = 'flex';
      if (skel) skel.classList.add('hidden');
    }
  } catch (e) {
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

      try {
        await fetch('/api/update-shot-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filmId, shotNum, img: dataUrl })
        });
        const iframe = document.querySelector(`#film-${filmId} iframe`);
        if (iframe) iframe.src = iframe.src.split('?')[0] + '?t=' + Date.now();
      } catch (err) {
        alert('Lỗi cập nhật ảnh: ' + err.message);
      }
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
