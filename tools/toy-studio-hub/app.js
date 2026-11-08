// ToyStudio AI Hub - Multi-Department Autonomous Chat & Studio Logic
// Enhanced with Central Command Chat, Interactive Buy Links, and On-Demand IT Tools

// STATE DATA
const studioData = {
  credits: 84500,
  activeTab: 'tab-chat',
  chatLog: [],
  scenes: [
    { id: 1, title: 'Shot 1: Mở Hộp Thần Kỳ - Đèn Neon Bừng Sáng', duration: 4, agent: 'agency-image-prompt-engineer', column: 4, desc: 'Bàn tay em bé mở nắp hộp, ánh sáng kỳ ảo phát ra từ xe Turbo-Bot.' },
    { id: 2, title: 'Shot 2: Turbo-Bot Tự Động Biến Hình', duration: 6, agent: 'agency-technical-artist', column: 4, desc: 'Xe đua phóng nhanh, tự động mở hai cánh lượn ánh sáng neon rực rỡ.' },
    { id: 3, title: 'Shot 3: Vượt Chướng Ngại Vật Phòng Khách', duration: 5, agent: 'agency-short-video-editing-coach', column: 3, desc: 'Xe lượn qua chân bàn ghế gỗ, camera tracking mượt mà nhịp cắt nhanh.' },
    { id: 4, title: 'Shot 4: Chế Độ Bay Siêu Tốc', duration: 5, agent: 'agency-technical-artist', column: 2, desc: 'Bánh xe gập lại, phản lực đẩy Turbo-Bot lướt qua mô hình tháp lego.' },
    { id: 5, title: 'Shot 5: Bé Ôm Đồ Chơi Mỉm Cười', duration: 5, agent: 'agency-legal-compliance-checker', column: 2, desc: 'Nụ cười rạng rỡ của bé và ba mẹ cùng chơi, góc quay ấm áp.' },
    { id: 6, title: 'Shot 6: Logo RoboTech & Lời Kêu Gọi Sưu Tập', duration: 5, agent: 'agency-image-prompt-engineer', column: 1, desc: 'Hiển thị trọn bộ 4 màu sắc kèm cảnh báo an toàn phụ huynh giám sát.' }
  ],
  costs: [
    { title: 'Xe Turbo-Bot 30s (TikTok/TVC)', client: 'RoboTech Toys VN', duration: '30 giây', model: 'Midjourney v6 + Kling 1.5', credits: 7200, cost: 72.0, status: 'Trong Định Mức' },
    { title: 'Mecha-Dino Khủng Long 15s', client: 'KidsKingdom Mall', duration: '15 giây', model: 'Runway Gen-3 Alpha', credits: 4500, cost: 45.0, status: 'Trong Định Mức' },
    { title: 'Búp Bê Xứ Thần Tiên 30s', client: 'ToyLand Global', duration: '30 giây', model: 'Flux + Luma Dream', credits: 6800, cost: 68.0, status: 'Trong Định Mức' },
    { title: 'Thành Phố Lego Thông Minh 60s', client: 'SmartBlocks VN', duration: '60 giây', model: 'Kling 1.5 HD Multi-shot', credits: 8950, cost: 89.5, status: 'Cảnh Báo Vàng' }
  ],
  characters: [
    {
      name: 'Turbo-Bot (Chiến Binh Biến Hình)',
      toyLine: 'Xe Đua Biến Hình 3D',
      age: '4 - 8 Tuổi',
      colors: 'Xanh Neon & Cam Lửa',
      style: '3D Pixar Animation',
      seed: 'SEED-84920419',
      prompt: 'masterpiece, 3d pixar style, sleek futuristic sports car transforming into a cute friendly robot toy, bold neon cyan and vibrant orange body, friendly big animated glowing blue eyes, round smooth edges, studio toy lighting --ar 9:16',
      negative: 'ugly, deformed limbs, sharp dangerous edges, scary faces, realistic weapons',
      preview: '🚗⚡'
    },
    {
      name: 'Mecha-Dino (Khủng Long Cơ Giáp)',
      toyLine: 'Đồ Chơi Lắp Ráp STEM',
      age: '6 - 10 Tuổi',
      colors: 'Xanh Ngọc & Vàng Kim',
      style: 'Cute Stylized Chibi 3D',
      seed: 'SEED-39182044',
      prompt: '3d animated miniature baby t-rex mechanical toy, cute chibi proportions, transparent colorful gear mechanisms visible, glowing yellow energy core, smooth plastic and polished brass, playful jumping pose --ar 9:16',
      negative: 'sharp teeth, blood, scary monster, dark horror, broken parts',
      preview: '🦖⚙️'
    }
  ],
  comments: [
    { id: 1, time: '00:02.10', user: 'agency-brand-guardian', text: 'Màu cam trên mui xe cần tăng độ bão hòa thêm 15% để chuẩn mã Pantone của nhãn hàng.' },
    { id: 2, time: '00:04.20', user: 'agency-short-video-editing-coach', text: 'Hiệu ứng âm thanh cánh lượn bung ra rất bắt tai! Nhịp cắt ở giây 4.5 cần đẩy nhanh 3 frame.' },
    { id: 3, time: '00:18.50', user: 'agency-legal-compliance-checker', text: 'Đã bổ sung phụ đề khuyến cáo: "Đồ chơi dùng pin, trẻ dưới 3 tuổi cần có người lớn giám sát". Đạt chuẩn CARU.' }
  ],
  leads: [
    { id: 1, company: 'RoboTech Toys VN', toyLine: 'Xe Đua & Robot Biến Hình', buyer: 'Nguyễn Văn Minh (Marketing Dir)', budget: '$12,000', stage: 'Hợp Đồng Đã Ký', buyLink: 'https://shopee.vn/search?keyword=robotech+turbobot' },
    { id: 2, company: 'KidsKingdom Chain', toyLine: 'Khủng Long STEM Bánh Răng', buyer: 'Trần Thị Mai (Head of Brand)', budget: '$8,500', stage: 'Đã Gửi Báo Giá', buyLink: 'https://amazon.com/dp/B0KIDSTEMDINO' },
    { id: 3, company: 'SmartBlocks Vietnam', toyLine: 'Mô Hình Xây Dựng Nam Châm', buyer: 'Lê Hoàng (Product Owner)', budget: '$15,000', stage: 'Đang Họp Discovery', buyLink: 'https://tiktok.com/@smartblocks/shop' }
  ]
};

// TAB SWITCHING
function switchTab(tabId) {
  studioData.activeTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-purple-600', 'text-white', 'shadow-sm');
    btn.classList.add('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800');
  });

  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800');
    activeBtn.classList.add('bg-purple-600', 'text-white', 'shadow-sm');
  }
}

// ================================================================
// CENTRAL COMMAND CHAT ENGINE (User Orders -> 3 Dept Responses)
// ================================================================

function executeQuickPrompt(text) {
  const input = document.getElementById('studio-order-input');
  if (input) {
    input.value = text;
    document.getElementById('btn-send-order')?.click();
  }
}

function clearInput() {
  const input = document.getElementById('studio-order-input');
  if (input) input.value = '';
}

function clearChat() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.innerHTML = `
      <div class="flex items-start space-x-3 chat-bubble">
        <div class="w-9 h-9 rounded-xl bg-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">AO</div>
        <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none p-4 max-w-3xl text-sm text-slate-200">
          Khung chat đã được làm mới. Hãy nhập mệnh lệnh tiếp theo cho 3 phòng ban!
        </div>
      </div>
    `;
  }
}

function appendUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgHtml = `
    <div class="flex items-start justify-end space-x-3 chat-bubble">
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl rounded-tr-none p-4 max-w-2xl text-sm shadow-lg space-y-1">
        <div class="flex items-center justify-between text-xs text-purple-200 mb-1">
          <span class="font-heading font-bold text-white">Bạn (Studio Director)</span>
          <span class="font-mono text-[10px] opacity-80">Mệnh Lệnh Điều Hành</span>
        </div>
        <p class="font-medium text-slate-50 leading-relaxed">${escapeHtml(text)}</p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
        YOU
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
}

function appendOrchestratorMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgHtml = `
    <div class="flex items-start space-x-3 chat-bubble">
      <div class="w-9 h-9 rounded-xl bg-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
        AO
      </div>
      <div class="bg-slate-800/90 border border-purple-500/40 rounded-2xl rounded-tl-none p-4 max-w-3xl text-sm space-y-2">
        <div class="flex items-center space-x-2">
          <span class="font-heading font-bold text-purple-400">Studio Orchestrator</span>
          <span class="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono">Tiếp Nhận & Điều Phối</span>
        </div>
        <p class="text-slate-200 leading-relaxed">${text}</p>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
}

function appendMarketingMessage(data) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgHtml = `
    <div class="flex items-start space-x-3 chat-bubble">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
        MKT
      </div>
      <div class="bg-slate-900 border border-purple-500/30 rounded-2xl rounded-tl-none p-5 max-w-3xl text-sm space-y-3.5 shadow-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="font-heading font-bold text-purple-400">Phòng Marketing & Clip AI</span>
            <span class="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full">Phân Tích & Sản Xuất Video</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">make-clip workflow</span>
        </div>

        <!-- 1. Phân Tích Thị Trường -->
        <div class="space-y-1">
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
            1. Phân Tích Thị Trường & Khách Hàng Mục Tiêu
          </h4>
          <p class="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            ${data.analysis}
          </p>
        </div>

        <!-- 2. Kịch Bản Phân Cảnh -->
        <div class="space-y-1">
          <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
            2. Kịch Bản Phân Cảnh Hoạt Hình AI (3 Hồi)
          </h4>
          <div class="text-xs text-slate-300 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div><strong>0-3s (Visual Hook):</strong> ${data.hook}</div>
            <div><strong>4-20s (Adventure/Play):</strong> ${data.body}</div>
            <div><strong>21-30s (Call To Action):</strong> ${data.cta}</div>
          </div>
        </div>

        <!-- 3. Master Prompt AI -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <h4 class="font-bold uppercase tracking-wider text-pink-400 flex items-center">
              <span class="w-1.5 h-1.5 rounded-full bg-pink-400 mr-1.5"></span>
              3. Master Prompt AI Cho Pipeline Render
            </h4>
            <button onclick="copyToClipboard('${data.prompt.replace(/'/g, "\\'")}', this)" class="text-[11px] text-purple-400 hover:text-purple-300 font-bold">Copy Prompt</button>
          </div>
          <p class="text-[11px] font-mono text-purple-200 bg-slate-950 p-2.5 rounded-lg border border-purple-950/80 leading-relaxed">
            ${data.prompt}
          </p>
        </div>

        <!-- 4. Duyệt An Toàn Trẻ Em -->
        <div class="flex items-center justify-between p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span><strong>Legal Compliance Checker:</strong> ${data.legal}</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">APPROVED</span>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
}

function appendSalesMessage(data) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgHtml = `
    <div class="flex items-start space-x-3 chat-bubble">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
        SALE
      </div>
      <div class="bg-slate-900 border border-emerald-500/30 rounded-2xl rounded-tl-none p-5 max-w-3xl text-sm space-y-3.5 shadow-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="font-heading font-bold text-emerald-400">Phòng Sales & Chăm Sóc Khách Hàng (CSKH)</span>
            <span class="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">Tư Vấn & Gửi Link Mua Hàng</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">close-deal & retail link</span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          ${data.salesNote}
        </p>

        <!-- HỘP LINK MUA HÀNG & AFFILIATE TRỰC TIẾP -->
        <div class="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-teal-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              </span>
              <span class="font-heading font-bold text-white text-xs">${data.productTitle}</span>
            </div>
            <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">${data.price}</span>
          </div>

          <div class="text-xs text-slate-300 flex items-center justify-between pt-1">
            <span>Nền tảng phân phối: <strong class="text-white">${data.platform}</strong></span>
            <span class="text-amber-400 font-mono text-[11px] font-semibold">Hoa hồng Affiliate: ${data.commission}</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 pt-1">
            <a href="${data.buyUrl}" target="_blank" class="flex-1 py-2 text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow-md flex items-center justify-center space-x-1.5">
              <span>Mở Link Mua Hàng Ngay ↗</span>
            </a>
            <button onclick="copyToClipboard('${data.buyUrl}', this)" class="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition">
              Copy Link Cho Khách
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
}

function appendITMessage(toolData) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const toolUniqueId = 'tool-' + Date.now();

  const msgHtml = `
    <div class="flex items-start space-x-3 chat-bubble">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
        IT
      </div>
      <div class="bg-slate-900 border border-blue-500/30 rounded-2xl rounded-tl-none p-5 max-w-3xl text-sm space-y-3.5 shadow-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="font-heading font-bold text-blue-400">Phòng Công Nghệ & Hạ Tầng IT</span>
            <span class="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">Tự Động Tạo Tool Nội Bộ</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">build-tool on-demand</span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          🛠️ <strong>Phòng IT đã tự động chế tạo công cụ nội bộ mới</strong> theo yêu cầu của chiến dịch để hỗ trợ Marketing và Sales thao tác nhanh gấp 5 lần ngay bên dưới:
        </p>

        <!-- LIVE INTERACTIVE MINI-TOOL -->
        <div class="bg-slate-950 border border-blue-500/40 rounded-xl p-4 space-y-3" id="${toolUniqueId}">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-heading font-bold text-xs text-white flex items-center">
              <span class="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-ping"></span>
              ${toolData.title}
            </span>
            <span class="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Interactive Tool</span>
          </div>

          <!-- Dynamic Tool Body -->
          ${toolData.html}
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
}

// ================================================================
// DISPATCH ENGINE: USER SENDS ORDER
// ================================================================

function handleSendOrder(e) {
  e.preventDefault();
  const input = document.getElementById('studio-order-input');
  if (!input || !input.value.trim()) return;

  const orderText = input.value.trim();
  input.value = '';

  // 1. Show user command
  appendUserMessage(orderText);

  // 2. Orchestrator analysis
  setTimeout(() => {
    appendOrchestratorMessage(`
      Đã nhận mệnh lệnh: <em>"${escapeHtml(orderText)}"</em>.<br/>
      Tôi phân rã và kích hoạt 3 phòng ban cùng xử lý đồng thời:
      <strong>Marketing</strong> lập kịch bản và phân tích thị trường; 
      <strong>Sales & CSKH</strong> chuẩn bị tư vấn và cấp link mua hàng; 
      <strong>IT</strong> tạo công cụ nội bộ tự động để tối ưu tốc độ!
    `);
  }, 400);

  // Determine scenario context
  const isLego = orderText.toLowerCase().includes('lego') || orderText.toLowerCase().includes('lắp ráp');
  const isToolOnly = orderText.toLowerCase().includes('tool') || orderText.toLowerCase().includes('công cụ');

  // 3. Marketing response
  setTimeout(() => {
    if (isLego) {
      appendMarketingMessage({
        analysis: 'Thị trường đồ chơi lắp ráp tại Mỹ & Châu Âu đạt $14.8B. Đang bùng nổ mạnh mẽ phân khúc người lớn AFOL (34%) và trẻ em sáng tạo STEM (4-8 tuổi). Video phong cách Pixar 3D + Stop-motion đang có tỷ lệ tương tác cao gấp 3.2 lần trên TikTok.',
        hook: 'Các mảnh ghép LEGO ma thuật tự động bay lơ lửng trong không trung và tự ráp thành siêu xe neon rực rỡ.',
        body: 'Nhân vật phi hành gia tí hon bước vào buồng lái, xe kích hoạt động cơ phản lực vượt chướng ngại vật mượt mà.',
        cta: 'Bố mẹ chạm ngay vào link giỏ hàng bên dưới để nhận mã giảm giá 15% độc quyền cho bé!',
        prompt: 'masterpiece, 3d pixar animation style, colorful building bricks magically floating and assembling into futuristic toy car, glowing neon cyan details, macro studio lighting, 8k resolution, ray tracing, cute charming --ar 9:16 --style raw',
        legal: 'Đã kiểm định: Không chứa hành vi nguy hiểm, chèn phụ đề cảnh báo độ tuổi (Trẻ dưới 3 tuổi cần giám sát). Đạt chuẩn CARU & COPPA.'
      });
    } else {
      appendMarketingMessage({
        analysis: 'Phân khúc xe đua đồ chơi biến hình 3D cho trẻ 4-8 tuổi đang chiếm 42% lượng tìm kiếm video đồ chơi trên TikTok. Màu sắc tươi sáng (Neon + Cam) kích thích sự tò mò và cảm xúc tích cực của trẻ nhỏ.',
        hook: 'Bàn tay bé chạm nhẹ vào mui xe Turbo-Bot, xe lập tức bung hai cánh lượn ánh sáng phát quang rực rỡ.',
        body: 'Xe đua phóng nhanh trên sàn gỗ phòng khách, tự chuyển đổi thành Robot chiến binh siêu đáng yêu với đôi mắt LED nhấp nháy.',
        cta: 'Sưu tập ngay trọn bộ 4 màu sắc kỳ diệu! Link mua hàng chính hãng bên dưới.',
        prompt: 'masterpiece, 3d pixar style, sleek futuristic toy sports car transforming into friendly robot toy, bold neon cyan and vibrant orange, glowing eyes, soft warm studio lighting, octane render --ar 9:16',
        legal: 'Đã kiểm định: Bo tròn các góc cạnh, không mô tả vũ khí bạo lực. Đạt chuẩn an toàn đồ chơi quốc tế ASTM/EN71.'
      });
    }
  }, 900);

  // 4. Sales & CSKH response
  setTimeout(() => {
    if (isLego) {
      appendSalesMessage({
        salesNote: 'Phòng Sales & CSKH đã kết nối mạng lưới tiếp thị liên kết (Affiliate Network) cho sản phẩm LEGO / Đồ chơi lắp ráp. Link mua hàng đã được tích hợp mã theo dõi hoa hồng độc quyền:',
        productTitle: 'LEGO Creator 3-in-1 Xe Đua Biến Hình Siêu Tốc',
        price: '$24.99 USD (Ưu đãi 15%)',
        platform: 'Amazon Associates & TikTok Shop',
        commission: '4.5% ($1.12 USD / đơn)',
        buyUrl: 'https://www.amazon.com/dp/B0LEGOBUILDTOY?tag=toystudio-affiliate-20'
      });
    } else {
      appendSalesMessage({
        salesNote: 'Phòng Sales & CSKH đã kích hoạt kịch bản chăm sóc khách hàng và chuẩn bị sẵn link mua hàng trực tiếp (Official Retail Cart) để khách hàng chốt đơn ngay lập tức:',
        productTitle: 'Siêu Xe Đua Biến Hình Turbo-Bot HyperRacer (Chính Hãng)',
        price: '389.000 VNĐ ($16.00 USD)',
        platform: 'Shopee Mall & Cửa Hàng Trực Tuyến RoboTech',
        commission: '12% Hoa hồng phân phối',
        buyUrl: 'https://shopee.vn/search?keyword=robotech+turbobot+3d'
      });
    }
  }, 1500);

  // 5. IT Department On-Demand Tool Creation
  setTimeout(() => {
    if (isLego) {
      appendITMessage({
        title: 'Bộ Tính Hoa Hồng Affiliate & Sinh Link Rút Gọn (Affiliate Link Engine)',
        html: `
          <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-400 mb-1">Giá Sản Phẩm ($):</label>
                <input type="number" id="it-calc-price" value="25" oninput="calcAffiliateCommission()" class="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1.5 rounded focus:outline-none focus:border-blue-500">
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Mức Hoa Hồng (%):</label>
                <select id="it-calc-rate" onchange="calcAffiliateCommission()" class="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1.5 rounded focus:outline-none focus:border-blue-500">
                  <option value="4.5">Amazon (4.5%)</option>
                  <option value="12">TikTok Shop (12%)</option>
                  <option value="5">LEGO Direct (5%)</option>
                </select>
              </div>
            </div>
            <div class="p-2.5 bg-blue-950/40 rounded-lg border border-blue-900/60 flex items-center justify-between text-slate-200">
              <span>Hoa hồng thực nhận / đơn:</span>
              <strong class="text-emerald-400 font-mono text-sm" id="it-calc-result">$1.13 USD</strong>
            </div>
          </div>
        `
      });
    } else {
      appendITMessage({
        title: 'Bộ Soát Lỗi An Toàn Kịch Bản & Kiểm Tra Chuẩn COPPA (Child Safety AI Linter)',
        html: `
          <div class="space-y-2 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Nhập kịch bản hoặc lời thoại cần kiểm tra:</label>
              <input type="text" id="it-safety-input" value="Bé tự tay biến hình xe đua an toàn cùng ba mẹ" class="w-full bg-slate-900 border border-slate-700 text-white px-2 py-1.5 rounded focus:outline-none focus:border-blue-500">
            </div>
            <button onclick="runSafetyLinter()" class="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold">Quét Độ An Toàn Trẻ Em Ngay</button>
            <div id="it-safety-result" class="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-400 font-medium">
              ✓ 100% Đạt tiêu chuẩn: Không chứa từ ngữ kích động bạo lực, hợp chuẩn CARU.
            </div>
          </div>
        `
      });
    }
  }, 2100);
}

// INTERACTIVE IT TOOLS LOGIC
function calcAffiliateCommission() {
  const price = parseFloat(document.getElementById('it-calc-price')?.value || '25');
  const rate = parseFloat(document.getElementById('it-calc-rate')?.value || '4.5');
  const res = (price * (rate / 100)).toFixed(2);
  const el = document.getElementById('it-calc-result');
  if (el) el.innerText = `$${res} USD`;
}

function runSafetyLinter() {
  const input = document.getElementById('it-safety-input')?.value.toLowerCase() || '';
  const resEl = document.getElementById('it-safety-result');
  if (!resEl) return;

  const dangerWords = ['bạo lực', 'súng', 'đánh nhau', 'nuốt', 'nguy hiểm', 'chết'];
  const hasDanger = dangerWords.some(w => input.includes(w));

  if (hasDanger) {
    resEl.className = 'p-2 bg-red-950/60 rounded border border-red-500/50 text-red-400 font-medium';
    resEl.innerText = '⚠️ CẢNH BÁO: Phát hiện từ ngữ có nguy cơ không an toàn cho trẻ em! Cần viết lại.';
  } else {
    resEl.className = 'p-2 bg-emerald-950/60 rounded border border-emerald-500/50 text-emerald-400 font-medium';
    resEl.innerText = '✓ ĐẠT CHUẨN COPPA / CARU: Lời thoại ấm áp, an toàn tuyệt đối cho trẻ em.';
  }
}

// HELPERS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const oldText = btn.innerText;
    btn.innerText = 'Đã Copy! ✓';
    btn.classList.add('text-emerald-400');
    setTimeout(() => {
      btn.innerText = oldText;
      btn.classList.remove('text-emerald-400');
    }, 1500);
  });
}

// RENDER TABLES ON LOAD
function renderCostTable() {
  const tbody = document.getElementById('cost-table-body');
  if (!tbody) return;
  tbody.innerHTML = studioData.costs.map(c => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="py-3 px-3"><div class="font-medium text-white">${c.title}</div><div class="text-xs text-slate-400">${c.client}</div></td>
      <td class="py-3 px-3 text-xs">${c.duration}</td>
      <td class="py-3 px-3 text-xs font-mono text-purple-300">${c.model}</td>
      <td class="py-3 px-3 text-xs font-mono font-bold text-amber-300">${c.credits.toLocaleString()} Cr</td>
      <td class="py-3 px-3 text-xs font-semibold text-emerald-400">$${c.cost.toFixed(2)}</td>
      <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[11px] font-medium ${c.status === 'Trong Định Mức' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">${c.status}</span></td>
    </tr>
  `).join('');
}

function renderKanban() {
  for (let col = 1; col <= 4; col++) {
    const colEl = document.getElementById(`kanban-col-${col}`);
    const countEl = document.getElementById(`count-col-${col}`);
    const colScenes = studioData.scenes.filter(s => s.column === col);
    if (countEl) countEl.innerText = colScenes.length;
    if (!colEl) continue;

    colEl.innerHTML = colScenes.map(s => `
      <div class="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 space-y-2">
        <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">${s.duration}s</span>
        <h4 class="font-heading font-semibold text-xs text-white">${s.title}</h4>
        <p class="text-[11px] text-slate-400 line-clamp-2">${s.desc}</p>
        <span class="text-purple-400 font-mono text-[10px] block">${s.agent}</span>
      </div>
    `).join('');
  }
}

function renderCharacters() {
  const grid = document.getElementById('character-grid');
  if (!grid) return;
  grid.innerHTML = studioData.characters.map(c => `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div class="flex items-center space-x-3">
        <span class="text-2xl">${c.preview}</span>
        <div><h4 class="font-heading font-bold text-white text-sm">${c.name}</h4><span class="text-xs text-purple-400">${c.toyLine}</span></div>
      </div>
      <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">${c.prompt}</div>
    </div>
  `).join('');
}

function renderCRM() {
  const tbody = document.getElementById('crm-table-body');
  if (!tbody) return;
  tbody.innerHTML = studioData.leads.map(l => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="py-3.5 px-4 font-semibold text-white">${l.company}</td>
      <td class="py-3.5 px-4 text-xs text-purple-300">${l.toyLine}</td>
      <td class="py-3.5 px-4 text-xs text-slate-300">${l.buyer}</td>
      <td class="py-3.5 px-4 text-xs font-bold text-emerald-400">${l.budget}</td>
      <td class="py-3.5 px-4"><span class="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">${l.stage}</span></td>
      <td class="py-3.5 px-4">
        <a href="${l.buyLink}" target="_blank" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center">
          <span>Gửi Link Mua Hàng ↗</span>
        </a>
      </td>
    </tr>
  `).join('');
}

function renderComments() {
  const container = document.getElementById('comments-container');
  if (!container) return;
  container.innerHTML = studioData.comments.map(c => `
    <div class="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 text-xs space-y-1">
      <div class="flex justify-between font-mono text-purple-400"><span>${c.time}</span><span class="text-slate-400">${c.user}</span></div>
      <p class="text-slate-200">${c.text}</p>
    </div>
  `).join('');
}

function onScrub(val) {
  document.getElementById('current-timestamp').innerText = `00:${parseFloat(val).toFixed(2).padStart(5, '0')}`;
}

function approveVideo() {
  alert('ĐÃ PHÊ DUYỆT BỞI LEGAL COMPLIANCE CHECKER: Video đạt chuẩn an toàn trẻ em quốc tế!');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCostTable();
  renderKanban();
  renderCharacters();
  renderCRM();
  renderComments();
});
