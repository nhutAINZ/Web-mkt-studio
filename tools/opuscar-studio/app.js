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
    }
  } catch (err) {
    // Fallback embedded styles if server is restarting
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
}

function renderStylesDropdown(styles) {
  const container = document.getElementById('styles-dropdown-list');
  if (!container) return;

  container.innerHTML = styles.map(s => `
    <button onclick="selectStyle('${s.id}', '${s.name}')" class="w-full text-left px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded flex items-center justify-between font-mono">
      <span class="truncate">${s.name}</span>
      <span class="text-[10px] text-zinc-500 font-bold ml-1">${s.id}</span>
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
    container.innerHTML = '<div class="text-zinc-500 text-xs font-mono text-center py-8">Chưa có video nào trong lịch sử.</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div onclick="loadPastGeneration('${item.id}')" class="bg-zinc-950 border border-zinc-800 hover:border-brand-accent p-3 rounded-xl cursor-pointer transition space-y-1.5">
      <div class="flex items-center justify-between text-xs font-bold text-zinc-200">
        <span class="truncate font-mono">${item.title}</span>
        <span class="text-[10px] text-brand-accent font-mono">${item.style}</span>
      </div>
      <p class="text-[11px] text-zinc-400 line-clamp-2">${item.prompt}</p>
      <div class="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
        <span>${item.duration}s &bull; ${item.aspect}</span>
        <span>${item.timestamp}</span>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 2. DOCK CONTROLS & DROPDOWNS
// ==========================================
function toggleDropdown(dropdownId) {
  const el = document.getElementById(dropdownId);
  if (!el) return;
  const isHidden = el.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) el.classList.remove('hidden');
}

function closeAllDropdowns() {
  ['dropdown-mode', 'dropdown-styles', 'dropdown-aspect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    closeAllDropdowns();
  }
});

function selectMode(mode) {
  currentMode = mode;
  document.getElementById('current-mode-label').innerText = mode;
  closeAllDropdowns();
}

function selectStyle(id, name) {
  currentStyle = id;
  document.getElementById('current-style-label').innerText = id;
  closeAllDropdowns();
}

function selectAspect(aspect, dur, label) {
  currentAspect = aspect;
  currentDuration = dur;
  document.getElementById('current-aspect-label').innerText = label;
  closeAllDropdowns();
}

function toggleDraftMode() {
  isDraftMode = !isDraftMode;
  const dot = document.getElementById('draft-toggle-dot');
  const btn = document.getElementById('draft-toggle-btn');
  if (isDraftMode) {
    btn.className = 'w-7 h-4 bg-brand-accent rounded-full relative transition';
    dot.className = 'w-3 h-3 bg-zinc-950 rounded-full absolute top-0.5 right-0.5 transition-all';
  } else {
    btn.className = 'w-7 h-4 bg-zinc-800 rounded-full relative transition';
    dot.className = 'w-3 h-3 bg-zinc-400 rounded-full absolute top-0.5 left-0.5 transition-all';
  }
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
    const btnRemove = document.getElementById('btn-remove-material');

    preview.src = uploadedMaterialData;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    btnRemove.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function removeMaterial(event) {
  event.stopPropagation();
  uploadedMaterialData = null;
  const preview = document.getElementById('material-preview-img');
  const placeholder = document.getElementById('material-placeholder');
  const btnRemove = document.getElementById('btn-remove-material');

  preview.src = '';
  preview.classList.add('hidden');
  placeholder.classList.remove('hidden');
  btnRemove.classList.add('hidden');
  document.getElementById('file-material-input').value = '';
}

// ==========================================
// 4. GENERATION ENGINE & CHAT FEED
// ==========================================
async function submitGenerateVideo() {
  const inputEl = document.getElementById('dock-prompt-input');
  const prompt = inputEl.value.trim();

  if (!prompt && !uploadedMaterialData) {
    inputEl.focus();
    return;
  }

  // Switch from empty state to generation feed
  document.getElementById('hero-empty-state').classList.add('hidden');
  const feed = document.getElementById('generation-feed');
  feed.classList.remove('hidden');

  // Add User Speech Bubble Card
  const userCardId = `user-msg-${Date.now()}`;
  feed.insertAdjacentHTML('beforeend', `
    <div id="${userCardId}" class="flex items-start justify-end space-x-3">
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-lg space-y-2 shadow-lg">
        <div class="text-xs font-mono text-zinc-400 flex items-center justify-between">
          <span>You</span>
          <span class="text-[10px] text-zinc-500">${currentStyle} &bull; ${currentAspect}</span>
        </div>
        <p class="text-sm text-zinc-100 font-sans leading-relaxed">${prompt || 'Video tạo từ hình ảnh đồ chơi nạp vào'}</p>
        ${uploadedMaterialData ? `<img src="${uploadedMaterialData}" class="w-24 h-16 object-cover rounded-lg border border-zinc-700 mt-2">` : ''}
      </div>
    </div>
  `);

  // Add AI Loading State Card
  const loadingCardId = `ai-loading-${Date.now()}`;
  feed.insertAdjacentHTML('beforeend', `
    <div id="${loadingCardId}" class="flex items-start space-x-3">
      <div class="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent font-bold text-xs flex-shrink-0">
        L
      </div>
      <div class="bg-brand-dock border border-brand-dockBorder rounded-2xl p-5 w-full max-w-2xl space-y-3 shadow-2xl">
        <div class="flex items-center space-x-2 text-xs font-mono text-zinc-300">
          <span class="animate-spin text-brand-accent">⚙️</span>
          <span>Gemini CLI & Lemo-OpusCar đang khởi tạo pipeline...</span>
        </div>
        <div class="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
          <div class="bg-brand-accent h-full w-2/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  `);

  // Scroll to bottom
  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });

  // Clear prompt input
  inputEl.value = '';

  // Call Backend API
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody({
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

function jsonBody(obj) {
  return JSON.stringify(obj);
}

function renderCompletedFilmCard(film) {
  const feed = document.getElementById('generation-feed');
  const cardId = `film-${film.id}`;

  const aspectClass = film.aspect === '9:16' ? 'max-w-[280px] aspect-[9/16]' : 'w-full aspect-video';

  feed.insertAdjacentHTML('beforeend', `
    <div id="${cardId}" class="flex items-start space-x-3">
      <div class="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent font-bold text-xs flex-shrink-0">
        L
      </div>
      <div class="bg-brand-dock border border-brand-dockBorder rounded-2xl p-5 w-full max-w-3xl space-y-4 shadow-2xl">
        
        <!-- Header Info -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white font-mono">${film.title}</h3>
            <div class="flex items-center space-x-2 text-xs text-zinc-400 font-mono mt-0.5">
              <span>Style: <strong class="text-brand-accent">${film.style}</strong></span>
              <span>&bull;</span>
              <span>${film.duration}s (${film.aspect})</span>
              <span>&bull;</span>
              <span>Gemini CLI Verified</span>
            </div>
          </div>
          <a href="${film.filmUrl}" target="_blank" class="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition">
            Xem Toàn Màn Hình ↗
          </a>
        </div>

        <!-- Interactive Lemo-OpusCar Canvas Viewport Player -->
        <div class="relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center shadow-inner ${aspectClass} mx-auto">
          <iframe src="${film.filmUrl}" class="w-full h-full border-0"></iframe>
        </div>

        <!-- 6 Cinematic Shots Breakdown -->
        <div class="space-y-2 pt-2 border-t border-zinc-800/80">
          <div class="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">6 Cinematic Shots (Kịch Bản Kỹ Thuật)</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${film.shots.map(s => `
              <div class="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-start space-x-2.5">
                <img src="${s.img}" class="w-14 h-10 object-cover rounded bg-zinc-900 flex-shrink-0">
                <div class="truncate text-xs">
                  <div class="font-bold text-zinc-200 truncate">${s.title}</div>
                  <div class="text-[10px] text-zinc-500 font-mono">${s.camera} &bull; ${s.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Lemo-OpusCar CLI Command Snippet -->
        <div class="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Mã Render Lemo-OpusCar CLI:</span>
            <button onclick="copyToClipboard('${film.renderCmd.replace(/\n/g, '\\n')}')" class="text-brand-accent hover:underline">Copy Script</button>
          </div>
          <pre class="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400 overflow-x-auto">${film.renderCmd}</pre>
        </div>

      </div>
    </div>
  `);

  const viewport = document.getElementById('center-viewport');
  viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
}

function showErrorCard(msg) {
  const feed = document.getElementById('generation-feed');
  feed.insertAdjacentHTML('beforeend', `
    <div class="p-4 bg-red-950/30 border border-red-500/40 rounded-xl text-xs font-mono text-red-300">
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
  document.getElementById('generation-feed').classList.add('hidden');
  document.getElementById('hero-empty-state').classList.remove('hidden');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) {
    if (sb.classList.contains('w-60')) {
      sb.classList.remove('w-60');
      sb.classList.add('w-0', 'overflow-hidden', 'p-0');
    } else {
      sb.classList.remove('w-0', 'overflow-hidden', 'p-0');
      sb.classList.add('w-60');
    }
  }
}

function showExploreModal() {
  alert('Tính năng Explore: Khám phá thư viện video mẫu tạo bởi 99 Lemo-OpusCar styles!');
}
