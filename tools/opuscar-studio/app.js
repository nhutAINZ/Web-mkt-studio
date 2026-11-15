// Lemo OpusCar Studio - Engine Logic
// Engineered with Unslop Craft Standards (Quiet chrome, deliberate typography, focused bright monitor)

const opusCarStyles = [
  // ĐỒ CHƠI & STOP-MOTION (TOY & CRAFT)
  {
    id: 'brick-toy',
    category: 'toy',
    name: 'Brick Toy (Lego Stop-Motion)',
    desc: 'Từng khối gạch nhựa LEGO tự bay lắp ráp, phản chiếu ánh sáng bóng đổ chuẩn xác, nhịp giật 12fps cổ điển.',
    tags: ['Three.js', 'ABS Plastic', 'Stop-Motion 12fps'],
    color: '#f59e0b',
    visualMode: 'bricks'
  },
  {
    id: 'teardown',
    category: 'toy',
    name: 'Teardown (Exploded View)',
    desc: 'Bung tách toàn bộ chi tiết cơ khí đồ chơi thành dạng bản vẽ không gian 3D, hiển thị bánh răng và động cơ.',
    tags: ['CAD Exploded', 'Isometric', 'Mechanical Precision'],
    color: '#38bdf8',
    visualMode: 'teardown'
  },
  {
    id: 'claymation',
    category: 'toy',
    name: 'Claymation (Đất Nặn Thủ Công)',
    desc: 'Chất liệu đất nặn dẻo có dấu vân tay người nặn, biểu cảm ngộ nghĩnh, chuyển động uốn lượn đáng yêu.',
    tags: ['Handmade Clay', 'Tactile Texture', 'Charming Pacing'],
    color: '#fb7185',
    visualMode: 'clay'
  },
  {
    id: 'paper-popup',
    category: 'toy',
    name: 'Paper Pop-Up (Sách 3D Mở Ra)',
    desc: 'Trang sách giấy mở ra, các mô hình đồ chơi và lâu đài gấp nếp tự động dựng đứng dậy sống động.',
    tags: ['Origami Paper', 'Shadow Play', 'Pop-Up Diorama'],
    color: '#e2e8f0',
    visualMode: 'paper'
  },
  {
    id: 'tilt-shift',
    category: 'toy',
    name: 'Tilt-Shift (Thế Giới Thu Nhỏ)',
    desc: 'Hiệu ứng trường sâu mờ ảo (DoF) biến mọi vật thể thực tế thành những món đồ chơi mô hình tí hon.',
    tags: ['Miniature Effect', 'Selective Focus', 'Diorama Lens'],
    color: '#10b981',
    visualMode: 'miniature'
  },
  {
    id: 'crayon-world',
    category: 'toy',
    name: 'Crayon World (Thế Giới Sáp Màu)',
    desc: 'Nét vẽ sáp màu sần sùi của trẻ thơ, màu sắc ấm áp rực rỡ, gợi cảm giác hoài niệm tuổi thơ tươi đẹp.',
    tags: ['Kids Crayon', 'Textured Paper', 'Nursery Warmth'],
    color: '#f43f5e',
    visualMode: 'crayon'
  },

  // HỘI HỌA & MỸ THUẬT (ART & PAINT)
  {
    id: 'watercolor',
    category: 'art',
    name: 'Watercolor Brush (Màu Nước Thủy Mặc)',
    desc: 'Vết loang màu nước tự nhiên trên nền giấy ẩm, các mảng màu hòa quyện vào nhau mềm mại như thơ.',
    tags: ['Wet on Wet', 'Pigment Bleed', 'Poetic Flow'],
    color: '#60a5fa',
    visualMode: 'watercolor'
  },
  {
    id: 'impasto',
    category: 'art',
    name: 'Impasto (Sơn Dầu Đắp Nổi)',
    desc: 'Từng vệt bay sơn dầu dày cộm, gồ ghề chất liệu sơn Van Gogh, ánh sáng trượt qua gờ màu nổi khối.',
    tags: ['Oil Knife', 'Thick Impasto', 'Tactile Strokes'],
    color: '#fbbf24',
    visualMode: 'paint'
  },
  {
    id: 'ukiyoe',
    category: 'art',
    name: 'Ukiyo-e (Tranh Phù Thế Nhật Bản)',
    desc: 'Phong cách khắc gỗ Phù Thế Họa với đường viền đen đậm, sóng nước cuộn trào và bảng màu khoáng chất.',
    tags: ['Woodblock Print', 'Edo Palette', 'Wave Crests'],
    color: '#34d399',
    visualMode: 'ukiyoe'
  },

  // KỸ THUẬT & CAD (TECH & BLUEPRINT)
  {
    id: 'blueprint',
    category: 'tech',
    name: 'Blueprint CAD (Bản Vẽ Kỹ Thuật)',
    desc: 'Nền xanh lam kiến trúc, các đường kích thước trắng sắc sảo, lưới tọa độ và chú thích kỹ thuật cơ khí.',
    tags: ['Cyan Grid', 'Architectural Line', 'Precise Vectors'],
    color: '#0284c7',
    visualMode: 'blueprint'
  },
  {
    id: 'hologram-hud',
    category: 'tech',
    name: 'Hologram HUD (Giao Diện Không Gian)',
    desc: 'Mô hình 3D phát sáng màu xanh neon lơ lửng, quét dữ liệu số học và radar tương lai.',
    tags: ['Futuristic HUD', 'Glow Wireframe', 'Volumetric Scan'],
    color: '#06b6d4',
    visualMode: 'hud'
  },

  // RETRO & HOẠT HÌNH CỔ ĐIỂN (RETRO & ANIMATION)
  {
    id: 'rubber-hose',
    category: 'retro',
    name: 'Rubber Hose 1930s (Chuột Mickey Cổ Điển)',
    desc: 'Phong cách hoạt hình thập niên 1930 với tay chân ống cao su mềm mại, mắt hình bánh pie và hạt phim cổ.',
    tags: ['1930s Cartoon', 'Film Grain', 'Bouncing Rhythm'],
    color: '#f8fafc',
    visualMode: 'vintage'
  },
  {
    id: 'pixel-rpg',
    category: 'retro',
    name: 'Pixel RPG 16-bit (Game Cổ Điển)',
    desc: 'Đồ họa điểm ảnh pixel sắc nét thời hoàng kim Super Nintendo, phối cảnh nhìn xiên isometric ngộ nghĩnh.',
    tags: ['16-Bit Tiles', 'Pixel Grid', 'Nostalgic Chiptune'],
    color: '#a855f7',
    visualMode: 'pixel'
  }
];

// STATE
let activeStyle = opusCarStyles[0];
let currentSec = 4.2;
let totalDuration = 30;
let isPlaying = false;
let animInterval = null;

// SHOTS DATA
const filmShots = [
  { id: 1, title: 'Shot 1: Mở Hộp Thần Kỳ', duration: '0s - 4s', camera: 'Low-Angle Tracking', desc: 'Bàn tay mở nắp hộp, ánh sáng phát quang bung tỏa.' },
  { id: 2, title: 'Shot 2: Biến Hình & Bung Cánh Lượn', duration: '4s - 10s', camera: 'Orbit 360° Slow-Mo', desc: 'Chi tiết cơ khí tự động ráp nối, cánh lượn ánh sáng bung mở.' },
  { id: 3, title: 'Shot 3: Vượt Chướng Ngại Vật', duration: '10s - 18s', camera: 'Dynamic Following', desc: 'Xe đua lướt qua mô hình tháp lắp ráp trong phòng khách.' },
  { id: 4, title: 'Shot 4: Chế Độ Phản Lực Siêu Tốc', duration: '18s - 23s', camera: 'Dolly Zoom Out', desc: 'Phản lực mini đẩy đồ chơi lướt qua không trung an toàn.' },
  { id: 5, title: 'Shot 5: Em Bé Cười Vui Cùng Gia Đình', duration: '23s - 27s', camera: 'Warm Medium Close-Up', desc: 'Nụ cười rạng rỡ của bé và ba mẹ cùng chơi đùa.' },
  { id: 6, title: 'Shot 6: Logo Nhãn Hàng & Cảnh Báo An Toàn', duration: '27s - 30s', camera: 'Clean Still Hero Card', desc: 'Hiển thị trọn bộ sưu tập kèm phụ đề chuẩn CARU/COPPA.' }
];

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderStylesGrid();
  renderTimelineShots();
  updateCodeSnippet();
  startCanvasLoop();
});

// RENDER STYLES GRID
function renderStylesGrid(category = 'all') {
  const container = document.getElementById('styles-grid');
  if (!container) return;

  const filtered = category === 'all' 
    ? opusCarStyles 
    : opusCarStyles.filter(s => s.category === category);

  container.innerHTML = filtered.map(s => {
    const isSelected = s.id === activeStyle.id;
    return `
      <div onclick="selectStyle('${s.id}')" class="cursor-pointer p-3 rounded-lg border text-left transition ${
        isSelected 
          ? 'bg-zinc-800/90 border-amber-500/60 shadow-sm' 
          : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
      }">
        <div class="flex items-center justify-between mb-1">
          <span class="w-2 h-2 rounded-full" style="background-color: ${s.color}"></span>
          <span class="text-[10px] font-mono text-zinc-500 uppercase">${s.category}</span>
        </div>
        <div class="font-mono text-xs font-semibold text-zinc-100 truncate">${s.name}</div>
        <div class="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">${s.desc}</div>
      </div>
    `;
  }).join('');
}

function filterStyles(cat) {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-zinc-800', 'text-zinc-200', 'border-zinc-700');
    btn.classList.add('bg-zinc-900', 'text-zinc-400', 'border-zinc-800');
  });
  event.target.classList.add('active', 'bg-zinc-800', 'text-zinc-200', 'border-zinc-700');
  event.target.classList.remove('bg-zinc-900', 'text-zinc-400', 'border-zinc-800');
  renderStylesGrid(cat);
}

function selectStyle(id) {
  const style = opusCarStyles.find(s => s.id === id);
  if (!style) return;
  activeStyle = style;

  // Update selected overview card
  document.getElementById('selected-style-title').innerText = `${style.id} (${style.name})`;
  document.getElementById('selected-style-cat').innerText = style.category.toUpperCase();
  document.getElementById('selected-style-desc').innerText = style.desc;
  document.getElementById('selected-style-tags').innerHTML = style.tags.map(t => 
    `<span class="bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-300">${t}</span>`
  ).join('');

  renderStylesGrid();
  updateCodeSnippet();
}

// RENDER TIMELINE SHOTS
function renderTimelineShots() {
  const container = document.getElementById('timeline-shots-container');
  if (!container) return;

  container.innerHTML = filmShots.map(shot => `
    <div onclick="jumpToShot(${shot.id})" class="cursor-pointer p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between text-xs">
      <div class="space-y-0.5">
        <div class="font-semibold text-zinc-200 flex items-center space-x-2">
          <span>${shot.title}</span>
          <span class="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">${shot.duration}</span>
        </div>
        <div class="text-[11px] text-zinc-400">${shot.desc}</div>
      </div>
      <div class="text-right text-[11px] font-mono text-zinc-500">
        CAM: <span class="text-zinc-300">${shot.camera}</span>
      </div>
    </div>
  `).join('');
}

function jumpToShot(id) {
  const shot = filmShots.find(s => s.id === id);
  if (!shot) return;
  if (id === 1) currentSec = 2;
  else if (id === 2) currentSec = 7;
  else if (id === 3) currentSec = 14;
  else if (id === 4) currentSec = 20;
  else if (id === 5) currentSec = 25;
  else currentSec = 28;

  updateScrubberUI();
}

// UPDATE CONTROLS
function updateTimeline() {
  const durVal = parseInt(document.getElementById('film-duration')?.value || '30');
  totalDuration = durVal;
  document.getElementById('film-scrubber').max = totalDuration;
  document.getElementById('total-duration-display').innerText = formatTime(totalDuration);
  updateCodeSnippet();
}

function updateAspect() {
  const aspect = document.getElementById('film-aspect')?.value || '16:9';
  const wrapper = document.getElementById('monitor-wrapper');
  if (aspect === '9:16') {
    wrapper.style.aspectRatio = '9 / 16';
    wrapper.style.maxHeight = '480px';
  } else if (aspect === '1:1') {
    wrapper.style.aspectRatio = '1 / 1';
    wrapper.style.maxHeight = '360px';
  } else {
    wrapper.style.aspectRatio = '16 / 9';
    wrapper.style.maxHeight = '360px';
  }
  updateCodeSnippet();
}

// TRANSPORT CONTROLS
function togglePlayback() {
  isPlaying = !isPlaying;
  const btn = document.getElementById('btn-transport-play');
  if (isPlaying) {
    btn.innerText = 'Dừng ⏸';
    btn.classList.add('bg-amber-400', 'text-zinc-950');
    btn.classList.remove('bg-zinc-800', 'text-zinc-200');
    animInterval = setInterval(() => {
      currentSec += 0.2;
      if (currentSec > totalDuration) currentSec = 0;
      updateScrubberUI();
    }, 200);
  } else {
    btn.innerText = 'Phát ▶';
    btn.classList.remove('bg-amber-400', 'text-zinc-950');
    btn.classList.add('bg-zinc-800', 'text-zinc-200');
    clearInterval(animInterval);
  }
}

function onScrub(val) {
  currentSec = parseFloat(val);
  updateScrubberUI();
}

function stepFrame(step) {
  currentSec = Math.max(0, Math.min(totalDuration, currentSec + step));
  updateScrubberUI();
}

function updateScrubberUI() {
  document.getElementById('film-scrubber').value = currentSec;
  const timeFormatted = formatTime(currentSec);
  document.getElementById('timecode-display').innerText = timeFormatted;

  const frameNum = Math.floor(currentSec * 30);
  document.getElementById('current-frame-info').innerText = `Frame ${frameNum} / 30fps`;

  // Update scene labels
  const titleEl = document.getElementById('active-scene-title');
  const promptEl = document.getElementById('active-scene-prompt');
  const camEl = document.getElementById('camera-movement-display');

  if (currentSec < 4) {
    titleEl.innerText = 'Shot 1: Mở Hộp Thần Kỳ';
    promptEl.innerText = 'Mở nắp hộp đồ chơi, ánh sáng phát quang huyền ảo...';
    camEl.innerText = 'Low-Angle Tracking';
  } else if (currentSec < 10) {
    titleEl.innerText = 'Shot 2: Biến Hình & Bung Cánh Lượn';
    promptEl.innerText = 'Mảnh ghép cơ khí tháo rời, ánh sáng neon rực rỡ...';
    camEl.innerText = 'Orbit 360°';
  } else if (currentSec < 18) {
    titleEl.innerText = 'Shot 3: Vượt Chướng Ngại Vật';
    promptEl.innerText = 'Xe lướt nhanh trên sàn phòng khách, camera bám đuôi...';
    camEl.innerText = 'Dynamic Following';
  } else if (currentSec < 23) {
    titleEl.innerText = 'Shot 4: Chế Độ Bay Phản Lực';
    promptEl.innerText = 'Bánh xe gập lại, phản lực đẩy mô hình bay qua tháp lego...';
    camEl.innerText = 'Dolly Zoom Out';
  } else if (currentSec < 27) {
    titleEl.innerText = 'Shot 5: Bé Cười Vui Cùng Gia Đình';
    promptEl.innerText = 'Bé ôm robot trên tay, nụ cười rạng rỡ của gia đình...';
    camEl.innerText = 'Warm Close-Up';
  } else {
    titleEl.innerText = 'Shot 6: Logo Nhãn Hàng & Cảnh Báo';
    promptEl.innerText = 'Logo hiển thị trang trọng kèm phụ đề tuân thủ CARU/COPPA...';
    camEl.innerText = 'Still Card';
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
}

// CANVAS DRAW LOOP (Simulating the 99 film styles visually)
function startCanvasLoop() {
  const canvas = document.getElementById('film-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = currentSec * 2;

    if (activeStyle.visualMode === 'bricks') {
      drawBricks(ctx, t);
    } else if (activeStyle.visualMode === 'teardown') {
      drawTeardown(ctx, t);
    } else if (activeStyle.visualMode === 'blueprint') {
      drawBlueprint(ctx, t);
    } else if (activeStyle.visualMode === 'hud') {
      drawHologram(ctx, t);
    } else {
      drawGenericArt(ctx, t, activeStyle.color);
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

function drawBricks(ctx, t) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.save();
  ctx.translate(w / 2, h / 2);

  // Lego Brick base
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * 0.2;
    const dist = 60 + Math.sin(t + i) * 20;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#38bdf8';
    ctx.fillRect(x - 16, y - 10, 32, 20);

    // Studs
    ctx.fillStyle = i % 2 === 0 ? '#d97706' : '#0284c7';
    ctx.beginPath();
    ctx.arc(x - 8, y - 10, 3, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 10, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Car Hero Body
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-45, -20, 90, 40);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-30, 20, 10, 0, Math.PI * 2);
  ctx.arc(30, 20, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawTeardown(ctx, t) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.save();
  ctx.translate(w / 2, h / 2);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;

  // Exploded isometric cubes
  const offset = 40 + Math.sin(t) * 15;
  for (let layer = -2; layer <= 2; layer++) {
    const y = layer * offset;
    ctx.strokeRect(-50, y - 15, 100, 30);
    ctx.beginPath();
    ctx.moveTo(0, y - 15);
    ctx.lineTo(0, y + 15);
    ctx.stroke();
  }

  // Gear rotating
  ctx.save();
  ctx.rotate(t * 0.5);
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawBlueprint(ctx, t) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#082f49';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // CAD Car Outline
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(w / 2 - 80, h / 2 - 35, 160, 70);
  ctx.stroke();
}

function drawHologram(ctx, t) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.save();
  ctx.translate(w / 2, h / 2);

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 70 + Math.sin(t) * 10, 0, Math.PI * 2);
  ctx.stroke();

  // Scanlines
  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
  for (let i = -60; i < 60; i += 8) {
    ctx.fillRect(-60, i, 120, 2);
  }
  ctx.restore();
}

function drawGenericArt(ctx, t, color) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(Math.sin(t) * 30, Math.cos(t) * 20, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// CODE GENERATOR & EXPORT
function updateCodeSnippet() {
  const aspect = document.getElementById('film-aspect')?.value || '16:9';
  const duration = document.getElementById('film-duration')?.value || '30';
  const pacing = document.getElementById('film-pacing')?.value || 'snappy';

  const codeBox = document.getElementById('code-snippet-box');
  if (codeBox) {
    codeBox.innerText = `
# Lemo-OpusCar CLI Automation Script
# Generated by OpusCar Studio (Unslop Standard)

cd ~/lemo-opuscar

# 1. Initialize film project
node core/render/still.mjs "films/turbo-bot" 1.5 3 \\
  --style "${activeStyle.id}" \\
  --ar "${aspect}" \\
  --duration ${duration} \\
  --pacing "${pacing}"

# 2. Compile and render final video with ffmpeg
./build.sh \\
  --fps 30 \\
  --crf 18 \\
  --preset medium \\
  --output "films/turbo-bot/output_${activeStyle.id}_${aspect.replace(':', 'x')}.mp4"
    `.trim();
  }
}

function copyRenderCode() {
  const codeBox = document.getElementById('code-snippet-box');
  if (codeBox) {
    navigator.clipboard.writeText(codeBox.innerText).then(() => {
      alert('Đã sao chép toàn bộ lệnh render Lemo-OpusCar vào bộ nhớ tạm!');
    });
  }
}

function exportTreatment() {
  const story = document.getElementById('story-prompt')?.value || 'Phim quảng cáo đồ chơi hoạt hình';
  const aspect = document.getElementById('film-aspect')?.value || '16:9';
  const duration = document.getElementById('film-duration')?.value || '30';
  const pacing = document.getElementById('film-pacing')?.value || 'snappy';
  const narrator = document.getElementById('film-narrator')?.value || 'vn-warm-female';

  const treatmentMd = `
# FILM TREATMENT: TURBO-BOT TOY COMMERCIAL
**Style:** \`${activeStyle.id}\` (${activeStyle.name})
**Engine:** Lemo-OpusCar 99 Film Styles Architecture
**Director's Standard:** Unslop Craft System

---

## 1. LOGLINE & STORY BRIEF
${story}

## 2. PRODUCTION SPECIFICATIONS
- **Target Duration:** ${duration} seconds
- **Aspect Ratio:** ${aspect} (Optimized for TVC & Digital Ads)
- **Rhythm & Pacing:** ${pacing} (124 BPM Upbeat)
- **Narrator Voice:** ${narrator}
- **Rendering Pipeline:** Three.js / Canvas WebGL Shader \`~/lemo-opuscar/styles/${activeStyle.id}/\`

## 3. SHOT BREAKDOWN & TIMELINE
${filmShots.map(s => `- **${s.title}** (${s.duration}): ${s.desc} [Camera: ${s.camera}]`).join('\n')}

---
*Generated by Lemo OpusCar Studio.*
  `.trim();

  navigator.clipboard.writeText(treatmentMd).then(() => {
    alert('Đã xuất file TREATMENT.md và sao chép vào bộ nhớ tạm thành công!');
  });
}

function generateFilmScript() {
  togglePlayback();
}
