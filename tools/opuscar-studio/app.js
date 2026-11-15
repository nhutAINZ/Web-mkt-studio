// Lumina AI Video Studio - Frontend Logic
// Seamlessly connects with Python Backend (server.py), Gemini CLI & Lemo-OpusCar

let currentStyle = 'brick-toy';
let currentMode = 'AI Video';
let currentAspect = '16:9';
let currentDuration = 30;
let isDraftMode = false;
let uploadedMaterialData = null;
let stylesList = [];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  fetchStyles();
  fetchHistory();
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
// 1. API: FETCH STYLES & HISTORY
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
    // Fallback embedded styles if server is restarting
  }
  stylesList = [
    { id: 'brick-toy', name: 'Brick Toy (Lego Stop-Motion)' },
    { id: 'teardown', name: 'Teardown (Bản Vẽ CAD Nổ Tách)' },
    { id: 'claymation', name: 'Claymation (Đất Nặn Thủ Công)' },
    { id: 'paper-popup', name: 'Paper Pop-Up (Sách 3D Mở Ra)' },
    { id: 'tilt-shift', name: 'Tilt-Shift (Thế Giới Thu Nhỏ)' },
    { id: 'watercolor', name: 'Watercolor Brush (Màu Nước Thủy Mặc)' },
    { id: 'blueprint', name: 'Blueprint CAD (Bản Vẽ Kỹ Thuật)' },
    { id: 'rubber-hose', name: 'Rubber Hose (Hoạt Hình 1930s)' },
    { id: 'pixel-art', name: 'Pixel Art (Game 16-Bit SNES)' }
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
    <div onclick="renderCompletedFilmCard(${JSON.stringify(item).replace(/"/g, '&quot;')}); toggleHistoryModal(false);" style="background: #09090c; border: 1px solid #1c1c24; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.15s;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #fff;">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</span>
        <span style="color: var(--accent-green); font-size: 10px; font-family: monospace;">${item.style}</span>
      </div>
      <p style="font-size: 11px; color: #888; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">${item.prompt}</p>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #555; font-family: monospace; padding-top: 4px;">
        <span>${item.duration}s &bull; ${item.aspect}</span>
        <span>${item.timestamp}</span>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 2. DOCK SELECTIONS & TOGGLES
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

// ==========================================
// 3. MATERIAL UPLOAD (+ material)
// ==========================================
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

// ==========================================
// 4. SUBMIT GENERATE VIDEO
// ==========================================
async function submitGenerateVideo() {
  const inputEl = document.getElementById('dock-prompt-input');
  const prompt = inputEl.value.trim();

  if (!prompt && !uploadedMaterialData) {
    inputEl.focus();
    return;
  }

  // Hide hero title, show feed
  document.getElementById('hero-empty-state').style.display = 'none';
  const feed = document.getElementById('generation-feed');
  feed.style.display = 'flex';

  // Inject User Message Card
  const userCardId = `user-msg-${Date.now()}`;
  feed.insertAdjacentHTML('beforeend', `
    <div id="${userCardId}" class="user-msg-card">
      <div class="user-msg-header">
        <span>You</span>
        <span>${currentStyle} &bull; ${currentAspect}</span>
      </div>
      <div class="user-msg-body">${prompt || 'Video tạo từ hình ảnh đồ chơi nạp vào'}</div>
      ${uploadedMaterialData ? `<img src="${uploadedMaterialData}" class="user-msg-img">` : ''}
    </div>
  `);

  // Inject AI Loading State Card
  const loadingCardId = `ai-loading-${Date.now()}`;
  feed.insertAdjacentHTML('beforeend', `
    <div id="${loadingCardId}" class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card" style="padding: 14px 18px;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: monospace; color: #d1d1dc;">
          <span style="color: var(--accent-green); font-size: 14px;">⚙️</span>
          <span>Đang tìm kiếm & tạo hình ảnh cho 6 phân cảnh, ghép nối video...</span>
        </div>
        <div style="width: 100%; height: 4px; background: #08080b; border-radius: 4px; overflow: hidden; margin-top: 6px;">
          <div style="width: 60%; height: 100%; background: var(--accent-green); animation: pulse 1s infinite alternate;"></div>
        </div>
      </div>
    </div>
  `);

  // Scroll to bottom
  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });

  // Clear prompt
  inputEl.value = '';

  // Call Backend API
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt || 'Video AI đồ chơi',
        style: currentStyle,
        aspect: currentAspect,
        duration: currentDuration,
        draft: isDraftMode,
        material: uploadedMaterialData
      })
    });

    const result = await response.json();
    document.getElementById(loadingCardId)?.remove();

    if (result.success && result.film) {
      renderCompletedFilmCard(result.film);
      fetchHistory();
    } else {
      showErrorCard('Không thể tạo video: ' + (result.error || 'Lỗi server'));
    }
  } catch (err) {
    document.getElementById(loadingCardId)?.remove();
    showErrorCard('Lỗi kết nối máy chủ backend: ' + err.message);
  }
}

function renderCompletedFilmCard(film) {
  // Hide empty state if showing
  document.getElementById('hero-empty-state').style.display = 'none';
  const feed = document.getElementById('generation-feed');
  feed.style.display = 'flex';

  const cardId = `film-${film.id}`;

  feed.insertAdjacentHTML('beforeend', `
    <div id="${cardId}" class="ai-msg-row">
      <div class="ai-avatar">L</div>
      <div class="ai-card">
        
        <!-- Header Info -->
        <div class="ai-card-header">
          <div>
            <div class="ai-card-title">${film.title}</div>
            <div class="ai-card-meta">
              Style: <strong style="color: var(--accent-green);">${film.style}</strong> &bull; ${film.duration}s (${film.aspect}) &bull; AI Images Stitched
            </div>
          </div>
          <a href="${film.filmUrl}" target="_blank" class="btn-fullscreen">
            Toàn Màn Hình ↗
          </a>
        </div>

        <!-- Interactive Stitched Video Viewport Player -->
        <div class="video-viewport-frame" style="${film.aspect === '9:16' ? 'max-width: 280px; aspect-ratio: 9/16; margin: 0 auto;' : ''}">
          <iframe src="${film.filmUrl}"></iframe>
        </div>

        <!-- 6 Cinematic Shots Breakdown with Image Click to Replace -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #8e8e9f; font-family: monospace; text-transform: uppercase;">
            <span>6 Cinematic Shots (Nhấp vào ảnh để đổi ảnh bạn muốn)</span>
            <span style="color: var(--accent-green); font-size: 10px;">Click to replace image</span>
          </div>
          <div class="shots-grid">
            ${film.shots.map(s => `
              <div class="shot-card" onclick="replaceShotImage('${film.id}', ${s.num})" style="cursor: pointer;" title="Nhấp để tải ảnh khác thay thế cho Shot ${s.num}">
                <img src="${s.img}" class="shot-img" id="shot-img-${film.id}-${s.num}">
                <div class="shot-info">
                  <div class="shot-name">${s.title}</div>
                  <div class="shot-cam">${s.camera} &bull; ${s.time}</div>
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
        // Reload video player iframe
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
  alert('Tính năng Explore: Khám phá thư viện video mẫu tạo bởi 99 Lemo-OpusCar styles!');
}
