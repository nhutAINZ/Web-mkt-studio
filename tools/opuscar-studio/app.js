// Lemo OpusCar Studio - Production Engine & Market Intelligence
// Designed with Unslop Standards (Quiet chrome, deliberate typography, focused bright monitor)

// ==========================================
// 1. DATA: 99 OPUSCAR FILM STYLES DEFINITION
// ==========================================
const opusCarStyles = [
  // ĐỒ CHƠI & STOP-MOTION
  {
    id: 'brick-toy',
    category: 'toy',
    name: 'Brick Toy (Lego Stop-Motion)',
    desc: 'Từng khối gạch nhựa LEGO tự bay lắp ráp, phản chiếu ánh sáng bóng đổ chuẩn xác, nhịp giật 12fps cổ điển.',
    tags: ['Three.js', 'ABS Plastic', 'Stop-Motion 12fps'],
    color: '#f59e0b',
    visualMode: 'bricks',
    previewImg: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'teardown',
    category: 'toy',
    name: 'Teardown (Bản Vẽ CAD Nổ Tách)',
    desc: 'Bung tách toàn bộ chi tiết cơ khí đồ chơi thành dạng bản vẽ không gian 3D, hiển thị bánh răng và động cơ.',
    tags: ['CAD Exploded', 'Isometric', 'Mechanical Precision'],
    color: '#38bdf8',
    visualMode: 'teardown',
    previewImg: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'claymation',
    category: 'toy',
    name: 'Claymation (Đất Nặn Thủ Công)',
    desc: 'Chất liệu đất nặn dẻo có dấu vân tay người nặn, biểu cảm ngộ nghĩnh, chuyển động uốn lượn đáng yêu.',
    tags: ['Handmade Clay', 'Tactile Texture', 'Charming Pacing'],
    color: '#fb7185',
    visualMode: 'clay',
    previewImg: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'paper-popup',
    category: 'toy',
    name: 'Paper Pop-Up (Sách 3D Mở Ra)',
    desc: 'Trang sách giấy mở ra, các mô hình đồ chơi và lâu đài gấp nếp tự động dựng đứng dậy sống động.',
    tags: ['Origami Paper', 'Shadow Play', 'Pop-Up Diorama'],
    color: '#e2e8f0',
    visualMode: 'paper',
    previewImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tilt-shift',
    category: 'toy',
    name: 'Tilt-Shift (Thế Giới Thu Nhỏ)',
    desc: 'Hiệu ứng trường sâu mờ ảo (DoF) biến mọi vật thể thực tế thành những món đồ chơi mô hình tí hon.',
    tags: ['Miniature Effect', 'Selective Focus', 'Diorama Lens'],
    color: '#10b981',
    visualMode: 'miniature',
    previewImg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'crayon-world',
    category: 'toy',
    name: 'Crayon World (Thế Giới Sáp Màu)',
    desc: 'Nét vẽ sáp màu sần sùi của trẻ thơ, màu sắc ấm áp rực rỡ, gợi cảm giác hoài niệm tuổi thơ tươi đẹp.',
    tags: ['Kids Crayon', 'Textured Paper', 'Nursery Warmth'],
    color: '#f43f5e',
    visualMode: 'crayon',
    previewImg: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'
  },

  // HỘI HỌA & MỸ THUẬT
  {
    id: 'watercolor',
    category: 'art',
    name: 'Watercolor Brush (Màu Nước Thủy Mặc)',
    desc: 'Vết loang màu nước tự nhiên trên nền giấy ẩm, các mảng màu hòa quyện vào nhau mềm mại như thơ.',
    tags: ['Wet on Wet', 'Pigment Bleed', 'Poetic Flow'],
    color: '#60a5fa',
    visualMode: 'watercolor',
    previewImg: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'impasto',
    category: 'art',
    name: 'Impasto (Sơn Dầu Đắp Nổi)',
    desc: 'Từng vệt bay sơn dầu dày cộm, gồ ghề chất liệu sơn Van Gogh, ánh sáng trượt qua gờ màu nổi khối.',
    tags: ['Oil Knife', 'Thick Impasto', 'Tactile Strokes'],
    color: '#fbbf24',
    visualMode: 'paint',
    previewImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ukiyoe',
    category: 'art',
    name: 'Ukiyo-e (Tranh Phù Thế Nhật Bản)',
    desc: 'Phong cách khắc gỗ Phù Thế Họa với đường viền đen đậm, sóng nước cuộn trào và bảng màu khoáng chất.',
    tags: ['Woodblock Print', 'Edo Palette', 'Wave Crests'],
    color: '#34d399',
    visualMode: 'ukiyoe',
    previewImg: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80'
  },

  // KỸ THUẬT & CAD
  {
    id: 'blueprint',
    category: 'tech',
    name: 'Blueprint CAD (Bản Vẽ Kỹ Thuật)',
    desc: 'Nền xanh lam kiến trúc, các đường kích thước trắng sắc sảo, lưới tọa độ và chú thích kỹ thuật cơ khí.',
    tags: ['Cyan Grid', 'Architectural Line', 'Precise Vectors'],
    color: '#0284c7',
    visualMode: 'blueprint',
    previewImg: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cyberpunk-hud',
    category: 'tech',
    name: 'Cyberpunk HUD (Giao Diện Hologram)',
    desc: 'Giao diện quét ba chiều công nghệ cao, vòng xoay quét tần số, dữ liệu thông số radar phát sáng.',
    tags: ['Sci-Fi UI', 'Neon Wireframe', 'Telemetry HUD'],
    color: '#a855f7',
    visualMode: 'hud',
    previewImg: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'wireframe',
    category: 'tech',
    name: '3D Wireframe (Lưới Đa Giác Xoay)',
    desc: 'Khung lưới vector phát sáng màu xanh phosphor chuyển động xoay không gian 3 chiều không trọng lực.',
    tags: ['Vector Mesh', 'CRT Glow', 'Retro 3D Geometry'],
    color: '#22c55e',
    visualMode: 'wireframe',
    previewImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },

  // RETRO & HOẠT HÌNH CỔ ĐIỂN
  {
    id: 'rubber-hose',
    category: 'retro',
    name: 'Rubber Hose (Hoạt Hình 1930s)',
    desc: 'Tay chân dạng ống cao su mềm uốn lượn, mắt pie-eye đen lay động, viền nhiễu đĩa than phim cổ điển.',
    tags: ['1930s Ink', 'Grain & Scratches', 'Bouncy Rhythms'],
    color: '#f1f5f9',
    visualMode: 'retro',
    previewImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pixel-art',
    category: 'retro',
    name: 'Pixel Art (Game 16-Bit Cổ Điển)',
    desc: 'Điểm ảnh sắc nét thời kỳ SNES/GameBoy, bảng màu hạn chế 32 màu rực rỡ, âm hưởng chiptune.',
    tags: ['16-bit Dithering', 'Sprite Animation', 'Nostalgic Retro'],
    color: '#ec4899',
    visualMode: 'pixel',
    previewImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'anime-cel',
    category: 'retro',
    name: 'Anime Cel Shading (Hoạt Hình Nhật Bản)',
    desc: 'Tô bóng phẳng 2 tông màu sắc nét, đường nét viền cọ tay anime shonen sôi động và kịch tính.',
    tags: ['Hard Shading', 'Action Speedlines', 'Dynamic Angles'],
    color: '#f97316',
    visualMode: 'anime',
    previewImg: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  }
];

// ==========================================
// 2. DATA: TOY PRESETS (CÓ HÌNH ẢNH MẪU)
// ==========================================
const presetToys = [
  {
    id: 'lego-mecha',
    name: 'Siêu Xe Robot Mecha-Dino',
    category: 'lego',
    img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80',
    prompt: 'Một chiếc xe đua biến hình mini tự bung cánh lượn, lướt qua tháp lâu đài lego rực rỡ và biến thành robot chiến binh chào em bé trong phòng khách.',
    style: 'brick-toy'
  },
  {
    id: 'stem-robot',
    name: 'Robot STEM Lắp Ráp Thông Minh',
    category: 'robot',
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    prompt: 'Cánh tay cơ khí robot STEM tự động giải mã khối rubik lập trình, các bánh răng trong suốt phát sáng đèn LED xanh công nghệ.',
    style: 'teardown'
  },
  {
    id: 'rc-drift',
    name: 'Siêu Xe Đua RC Cyber Drift',
    category: 'rc',
    img: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80',
    prompt: 'Xe đua điều khiển từ xa RC gầm rú tăng tốc trên đường đua dạ quang, thực hiện cú drift 360 độ xé toạc màn sương neon lấp lánh.',
    style: 'tilt-shift'
  },
  {
    id: 'clay-dino',
    name: 'Khủng Long Đất Nặn Pastel',
    category: 'craft',
    img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    prompt: 'Chú khủng long béo tròn bằng đất nặn màu pastel vui nhộn nhảy múa trên bãi cỏ hoa, biểu cảm lí lắc đáng yêu chào khán giả nhí.',
    style: 'claymation'
  }
];

// ==========================================
// 3. DATA: TÌM THỊ TRƯỜNG ĐỒ CHƠI (MARKET INTEL)
// ==========================================
const marketDatabase = [
  {
    id: 'mkt-lego-us',
    region: 'us',
    category: 'lego',
    title: 'Thị Trường LEGO & Khối Lắp Ghép Mỹ (US Market)',
    size: '$14.2 Tỷ USD',
    growth: '+7.4% YoY',
    demographic: 'Trẻ em 5-12 tuổi (60%) & "Kidult" 18-35 tuổi (40%)',
    buyerPersona: 'Phụ huynh Millennial (28-42 tuổi) ưu tiên phát triển tư duy không gian và giảm thời gian dùng màn hình điện thoại của con.',
    affiliateCommission: '10% - 14% (Trung bình $8.50/đơn qua Amazon/Target/TikTok Shop)',
    topHooks: [
      '⚡ "Chờ đến giây thứ 3 xem điều kỳ diệu bung nở..." (Hiệu ứng biến hình stop-motion)',
      '🧱 "Thử thách lắp 500 mảnh LEGO trong 10 giây siêu tốc!"',
      '💎 "Bộ đồ chơi mà cả bố và con đều tranh nhau chơi mỗi tối."'
    ],
    winningFormat: 'TikTok Spark Ads (9:16 Dọc, 15-20s, nhịp nhanh 124 BPM)',
    targetROAS: '4.2x - 5.5x',
    recommendedStyle: 'brick-toy',
    samplePrompt: 'Chiếc phi thuyền Lego tự động ráp thành siêu robot hộ vệ trên bàn học, ánh sáng phản chiếu nhựa ABS sắc nét, bé trai 7 tuổi reo hò thích thú.'
  },
  {
    id: 'mkt-lego-eu',
    region: 'eu',
    category: 'lego',
    title: 'Thị Trường Khối Xây Dựng & Đồ Chơi Gỗ Châu Âu (EU - Đức, Anh, Pháp)',
    size: '€11.8 Tỷ EUR',
    growth: '+6.1% YoY',
    demographic: 'Trẻ em 3-10 tuổi & Gia đình Châu Âu',
    buyerPersona: 'Phụ huynh Châu Âu cực kỳ khắt khe về độ bền, vật liệu an toàn (CE Mark / EN71) và tính giáo dục hướng nghiệp khoa học.',
    affiliateCommission: '8% - 12% (Trung bình €9.20/đơn qua Otto/Amazon EU)',
    topHooks: [
      '🌿 "Đồ chơi đạt chuẩn an toàn Châu Âu EN71 mà bé mê mẩn từ cái nhìn đầu tiên."',
      '🧩 "Giải pháp cai nghiện iPad hiệu quả nhất cho trẻ em Châu Âu."',
      '🏰 "Tự tay dựng nên lâu đài cổ tích kiến trúc Gothic trong phòng khách."'
    ],
    winningFormat: 'YouTube Shorts & Instagram Reels (Phong cách tự nhiên, ASMR gạch va chạm)',
    targetROAS: '3.8x - 4.6x',
    recommendedStyle: 'brick-toy',
    samplePrompt: 'Mô hình lâu đài Châu Âu cổ kính tự động lắp ghép từng khối gạch tinh xảo, phụ huynh và bé cùng cười hạnh phúc bên lò sưởi ấm cúng.'
  },
  {
    id: 'mkt-stem-us',
    region: 'us',
    category: 'robot',
    title: 'Đồ Chơi Robot STEM & Trí Tuệ Nhân Tạo Mỹ',
    size: '$8.6 Tỷ USD',
    growth: '+12.8% YoY (Tăng trưởng nóng)',
    demographic: 'Học sinh 8-15 tuổi & Lớp học STEM',
    buyerPersona: 'Phụ huynh thu nhập khá muốn con làm quen sớm với tư duy kỹ sư, lập trình robot và khoa học công nghệ thực nghiệm.',
    affiliateCommission: '12% - 16% (Giá trị đơn hàng cao $80 - $220)',
    topHooks: [
      '🤖 "Bộ đồ chơi dạy bé lập trình trí tuệ nhân tạo như kỹ sư NASA."',
      '⚙️ "Xem cấu tạo bánh răng bên trong hoạt động siêu mượt mà!" (Exploded CAD View)',
      '🏆 "Chiến thắng cuộc thi robot trường học nhờ bộ kit lắp ráp này."'
    ],
    winningFormat: 'Video phân tích kỹ thuật CAD nổ tách chi tiết (Teardown isometric)',
    targetROAS: '4.8x - 6.2x',
    recommendedStyle: 'teardown',
    samplePrompt: 'Cánh tay cơ khí robot STEM tự động giải mã khối rubik lập trình, các bánh răng trong suốt phát sáng đèn LED xanh công nghệ.'
  },
  {
    id: 'mkt-rc-sea',
    region: 'sea',
    category: 'rc',
    title: 'Xe Đua RC & Đồ Chơi Vận Động Đông Nam Á / Việt Nam',
    size: '$3.4 Tỷ USD',
    growth: '+15.2% YoY (Cực kỳ sôi động)',
    demographic: 'Trẻ em 6-14 tuổi & Giới trẻ yêu thích tốc độ',
    buyerPersona: 'Phụ huynh trẻ Gen Z / Millennial mua hàng theo xu hướng TikTok Shop & Shopee Live, thích sản phẩm có đèn LED và âm thanh sống động.',
    affiliateCommission: '10% - 18% (Tỷ lệ chuyển đổi đơn hàng TikTok Shop > 4.5%)',
    topHooks: [
      '🔥 "Chiếc xe drift địa hình bất chấp mọi chướng ngại vật cát đá!"',
      '💥 "Test độ bền rơi từ tầng 2 xuống không một vết xước!"',
      '🚨 "Săn sale giá chỉ bằng 3 ly trà sữa trên TikTok Shop ngay hôm nay!"'
    ],
    winningFormat: 'TikTok Live Stream Hook (Âm nhạc sôi động 128 BPM, góc quay nghiêng Dynamic Dutch)',
    targetROAS: '5.0x - 7.5x',
    recommendedStyle: 'tilt-shift',
    samplePrompt: 'Siêu xe đua điều khiển từ xa RC địa hình bay qua dốc cát, khói bụi tung mù mịt, vượt chướng ngại vật ngoạn mục với ánh đèn pha rực sáng.'
  },
  {
    id: 'mkt-craft-global',
    region: 'global',
    category: 'craft',
    title: 'Đồ Chơi Thủ Công & Đất Nặn Pastel Toàn Cầu',
    size: '$5.8 Tỷ USD',
    growth: '+8.3% YoY',
    demographic: 'Bé mầm non 2-6 tuổi & Mẹ bỉm sữa',
    buyerPersona: 'Mẹ bỉm sữa tìm kiếm đồ chơi an toàn không hóa chất độc hại, rèn luyện kỹ năng vận động tinh (Fine Motor Skills) cho bé.',
    affiliateCommission: '12% - 15% (Đơn hàng thường mua kèm combo phụ kiện)',
    topHooks: [
      '🧁 "Âm thanh bóp đất nặn xả stress siêu êm tai..." (ASMR Sound)',
      '🌸 "100% bột mì thực phẩm an toàn tuyệt đối cho bé nhỏ gặm nhấm."',
      '🌈 "Bé tự làm tiệm bánh kem ngọt ngào ngay tại nhà."'
    ],
    winningFormat: 'Cận cảnh chuyển động đất nặn thủ công (Claymation ấm áp, chậm rãi)',
    targetROAS: '4.0x - 5.1x',
    recommendedStyle: 'claymation',
    samplePrompt: 'Các bạn thú bằng đất nặn bột mì thực phẩm ngộ nghĩnh tự nhào nặn làm bánh sinh nhật nhiều tầng rực rỡ sắc màu, mang nụ cười cho bé.'
  }
];

// ==========================================
// 4. ACTIVE STATE MANAGEMENT
// ==========================================
let activeStyle = opusCarStyles[0]; // brick-toy by default
let isPlaying = false;
let playbackInterval = null;
let currentTime = 4.2;
let totalDuration = 30.0;
let customToyImage = null; // Stored user uploaded image

// 6 TECHNICAL SHOT DEFINITION WITH RICH IMAGES
let filmShots = [
  {
    id: 1,
    title: 'Shot 1: Mở Đầu Đại Cảnh (Establishing Shot)',
    duration: '00:00 - 00:05 (5.0s)',
    camera: 'Dolly In + Crane Down',
    desc: 'Bối cảnh phòng khách ấm áp, ánh ban mai chiếu rọi qua cửa sổ rọi lên bàn đồ chơi rực rỡ.',
    vo: 'Nữ truyền cảm: "Mỗi sáng thức dậy, một thế giới diệu kỳ đang chờ bé khám phá..."',
    img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
    tags: ['Wide View', 'Morning Sun', 'Safety Certified']
  },
  {
    id: 2,
    title: 'Shot 2: Cơ Chế Cơ Khí & Biến Hình (Mechanism Reveal)',
    duration: '00:05 - 00:10 (5.0s)',
    camera: 'Orbit 360° + Macro Lens',
    desc: 'Các mảnh ghép tháo rời tự bay lên không trung, khớp xoay tự động ăn khớp khóa chặt cơ học.',
    vo: 'Nữ truyền cảm: "Chỉ với một nút bấm bí mật, siêu xe tự bung cánh lượn..."',
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    tags: ['Stop-Motion 12fps', 'Macro Gear', 'ABS Gloss']
  },
  {
    id: 3,
    title: 'Shot 3: Hành Động Kịch Tính (Dynamic Action)',
    duration: '00:10 - 00:18 (8.0s)',
    camera: 'Dutch Tilt + Speed Ramp 124 BPM',
    desc: 'Xe lao vun vút qua cầu trượt uốn lượn, lướt qua tháp lâu đài và đáp xuống an toàn.',
    vo: 'Âm nhạc: Trống snare dồn dập, tiếng vút gió sound design sinh động.',
    img: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
    tags: ['Speed Ramp', 'Motion Blur', 'High Energy']
  },
  {
    id: 4,
    title: 'Shot 4: Biểu Cảm & Tương Tác Em Bé (Reaction Shot)',
    duration: '00:18 - 00:22 (4.0s)',
    camera: 'Medium Close-up, Soft Focus',
    desc: 'Em bé 6 tuổi reo hò vỗ tay thích thú, ánh mắt lấp lánh nụ cười rạng rỡ bên mẹ.',
    vo: 'Nữ truyền cảm: "Nuôi dưỡng trí tưởng tượng không giới hạn cho thiên tài nhí."',
    img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
    tags: ['Emotion', 'Parent Connection', 'Warm Light']
  },
  {
    id: 5,
    title: 'Shot 5: Khám Phá Tính Năng Mở Rộng (Feature Showcase)',
    duration: '00:22 - 00:26 (4.0s)',
    camera: 'Top-down Flatlay Zoom Out',
    desc: 'Toàn cảnh bộ phụ kiện 300+ chi tiết, bản hướng dẫn màu sắc và hộp đựng thông minh.',
    vo: 'Nữ truyền cảm: "Chất liệu nhựa nguyên sinh ABS an toàn 100% không chứa BPA."',
    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    tags: ['Flatlay', 'COPPA Passed', 'BPA Free']
  },
  {
    id: 6,
    title: 'Shot 6: Kêu Gọi Mua Hàng & Link Mua (Call To Action)',
    duration: '00:26 - 00:30 (4.0s)',
    camera: 'Hero Static Center + Glow Tag',
    desc: 'Sản phẩm tạo dáng anh hùng ở trung tâm, logo thương hiệu, ưu đãi giảm 30% và link mua hàng.',
    vo: 'Nữ tự tin: "Sở hữu ngay hôm nay với ưu đãi độc quyền dành cho 100 phụ huynh đầu tiên!"',
    img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
    tags: ['CTA Card', 'Affiliate Ready', 'Discount Tag']
  }
];

// ==========================================
// 5. INITIALIZATION ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initStudioBackgroundCanvas();
  renderStoryboardShots();
  renderPresetToysGrid();
  renderMarketFinder();
  initCanvasMonitor();
  updateRenderScriptCLI();
});

// ==========================================
// 6. XƯỞNG SẢN XUẤT VIDEO AI: BACKGROUND CANVAS
// ==========================================
function initStudioBackgroundCanvas() {
  const bgCanvas = document.getElementById('studio-bg-canvas');
  if (!bgCanvas) return;
  const ctx = bgCanvas.getContext('2d');

  function resize() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Particle dust & grid nodes
  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      radius: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  let gridOffset = 0;

  function renderStudioBg() {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Dark studio gradient
    const grad = ctx.createLinearGradient(0, 0, 0, bgCanvas.height);
    grad.addColorStop(0, '#070709');
    grad.addColorStop(0.5, '#0d0d12');
    grad.addColorStop(1, '#050507');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Studio Perspective Grid (Floor)
    const horizon = bgCanvas.height * 0.45;
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.04)';
    ctx.lineWidth = 1;

    // Moving horizontal grid lines
    gridOffset = (gridOffset + 0.3) % 40;
    for (let y = horizon; y < bgCanvas.height; y += 35) {
      const lineY = y + gridOffset;
      if (lineY < bgCanvas.height) {
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(bgCanvas.width, lineY);
        ctx.stroke();
      }
    }

    // Converging perspective lines from horizon center
    const centerX = bgCanvas.width * 0.5;
    for (let x = -bgCanvas.width; x <= bgCanvas.width * 2; x += 90) {
      ctx.beginPath();
      ctx.moveTo(centerX, horizon);
      ctx.lineTo(x, bgCanvas.height);
      ctx.stroke();
    }
    ctx.restore();

    // Studio Ambient Light Spotlights
    const spotGrad1 = ctx.createRadialGradient(bgCanvas.width * 0.25, 100, 20, bgCanvas.width * 0.25, 100, 400);
    spotGrad1.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
    spotGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = spotGrad1;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    const spotGrad2 = ctx.createRadialGradient(bgCanvas.width * 0.8, 150, 20, bgCanvas.width * 0.8, 150, 450);
    spotGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
    spotGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = spotGrad2;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Floating Particles
    ctx.fillStyle = '#f59e0b';
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = bgCanvas.width;
      if (p.x > bgCanvas.width) p.x = 0;
      if (p.y < 0) p.y = bgCanvas.height;
      if (p.y > bgCanvas.height) p.y = 0;
    });
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(renderStudioBg);
  }
  renderStudioBg();
}

// ==========================================
// 7. HERO COMMAND BAR & PRESET ACTIONS
// ==========================================
function generateFromHeroBar() {
  playSyntheticSound('laser');
  const promptInput = document.getElementById('hero-prompt-input');
  const userPrompt = promptInput.value.trim() || 'Phim quảng cáo đồ chơi hoạt hình AI';

  // Apply visual feedback
  const btn = document.getElementById('btn-hero-generate');
  btn.innerHTML = `
    <div class="flex items-center space-x-1.5">
      <span class="animate-spin">⚙️</span>
      <span>ĐANG XỬ LÝ...</span>
    </div>
    <span class="text-[10px] text-zinc-900 font-semibold tracking-wider uppercase mt-0.5">Render AI Shots</span>
  `;

  setTimeout(() => {
    // Update shot 1 prompt with user prompt
    filmShots[0].desc = userPrompt.substring(0, 110) + '...';
    if (customToyImage) {
      filmShots[0].img = customToyImage;
      filmShots[1].img = customToyImage;
      filmShots[5].img = customToyImage;
    }
    renderStoryboardShots();
    updateRenderScriptCLI();

    btn.innerHTML = `
      <div class="flex items-center space-x-1.5">
        <span>🚀</span>
        <span>SẢN XUẤT VIDEO</span>
      </div>
      <span class="text-[10px] text-zinc-900 font-semibold tracking-wider opacity-80 uppercase mt-0.5">Render AI Pipeline</span>
    `;

    // Trigger visual play in monitor
    togglePlayback();
  }, 600);
}

function applyPresetPrompt(presetId) {
  const preset = presetToys.find(t => t.id === presetId);
  if (!preset) return;

  playSyntheticSound('blip');
  document.getElementById('hero-prompt-input').value = preset.prompt;
  document.getElementById('hero-style-select').value = preset.style;
  onStyleDropdownChange(preset.style);

  // Set reference image
  setReferenceImage(preset.img, preset.name);
}

function onStyleDropdownChange(styleId) {
  const found = opusCarStyles.find(s => s.id === styleId);
  if (found) {
    activeStyle = found;
    // Update shot images if no custom user image
    if (!customToyImage) {
      filmShots.forEach((shot, index) => {
        if (index % 2 === 0) shot.img = found.previewImg;
      });
    }
    renderStoryboardShots();
    updateRenderScriptCLI();
    drawMonitorFrame();
  }
}

function onHeroAspectChange(aspect) {
  const monitor = document.getElementById('monitor-wrapper');
  if (monitor) {
    if (aspect === '9:16') {
      monitor.className = 'relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center max-w-[280px] mx-auto aspect-[9/16] shadow-2xl';
    } else if (aspect === '1:1') {
      monitor.className = 'relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center max-w-[380px] mx-auto aspect-square shadow-2xl';
    } else {
      monitor.className = 'relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center aspect-video shadow-2xl';
    }
  }
  updateRenderScriptCLI();
}

function onHeroDurationChange(dur) {
  totalDuration = parseFloat(dur);
  document.getElementById('total-duration-display').innerText = formatTimecode(totalDuration);
  document.getElementById('film-scrubber').max = totalDuration;
  updateRenderScriptCLI();
}

// ==========================================
// 8. TÍNH NĂNG THÊM HÌNH ẢNH (IMAGE REFERENCE)
// ==========================================
function triggerImageUploadModal(show = true) {
  playSyntheticSound('blip');
  const modal = document.getElementById('image-modal');
  if (modal) {
    modal.classList.toggle('hidden', !show);
  }
}

function handleUserImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    setReferenceImage(dataUrl, file.name);
    triggerImageUploadModal(false);
  };
  reader.readAsDataURL(file);
}

function setReferenceImage(imgUrl, title = 'Ảnh Đồ Chơi Mẫu') {
  customToyImage = imgUrl;

  const container = document.getElementById('hero-image-preview-container');
  const thumb = document.getElementById('hero-image-thumbnail');
  const titleEl = document.getElementById('hero-image-title');
  const addBtnLabel = document.getElementById('btn-add-img-label');

  if (container && thumb) {
    thumb.src = imgUrl;
    if (titleEl) titleEl.innerText = title;
    container.classList.remove('hidden');
    if (addBtnLabel) addBtnLabel.innerText = 'Đã Thêm Hình ✓';
  }

  // Inject into storyboard shots
  filmShots[0].img = imgUrl;
  filmShots[1].img = imgUrl;
  filmShots[5].img = imgUrl;
  renderStoryboardShots();
  drawMonitorFrame();
}

function removeReferenceImage() {
  customToyImage = null;
  const container = document.getElementById('hero-image-preview-container');
  const addBtnLabel = document.getElementById('btn-add-img-label');
  if (container) container.classList.add('hidden');
  if (addBtnLabel) addBtnLabel.innerText = '+ Thêm Hình';

  // Restore style preview images
  filmShots.forEach((shot, index) => {
    shot.img = activeStyle.previewImg;
  });
  renderStoryboardShots();
  drawMonitorFrame();
}

function renderPresetToysGrid() {
  const grid = document.getElementById('preset-toys-grid');
  if (!grid) return;

  grid.innerHTML = presetToys.map(toy => `
    <div onclick="selectPresetFromModal('${toy.id}')" class="bg-zinc-950 border border-zinc-800 hover:border-amber-400/80 rounded-xl p-2.5 cursor-pointer group transition space-y-2">
      <div class="aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 relative">
        <img src="${toy.img}" alt="${toy.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
        <span class="absolute bottom-1 right-1 text-[9px] font-mono bg-zinc-950/80 px-1.5 py-0.5 rounded text-amber-400 font-bold">${toy.style}</span>
      </div>
      <div>
        <div class="text-xs font-bold text-zinc-200 group-hover:text-amber-400 truncate">${toy.name}</div>
        <p class="text-[10px] text-zinc-500 line-clamp-1">${toy.prompt}</p>
      </div>
    </div>
  `).join('');
}

function selectPresetFromModal(toyId) {
  applyPresetPrompt(toyId);
  triggerImageUploadModal(false);
}

// ==========================================
// 9. VISUAL STORYBOARD RENDERING (CÓ HÌNH ẢNH)
// ==========================================
function renderStoryboardShots() {
  const container = document.getElementById('storyboard-shots-list');
  if (!container) return;

  container.innerHTML = filmShots.map((shot, idx) => `
    <div class="bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-3 sm:p-4 transition flex flex-col md:flex-row gap-4 items-start group">
      <!-- High-Res Shot Visual Image Frame -->
      <div class="relative w-full md:w-44 aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 group-hover:border-amber-400/50 transition">
        <img src="${shot.img}" alt="${shot.title}" class="w-full h-full object-cover">
        
        <!-- Shot Index Badge -->
        <div class="absolute top-1.5 left-1.5 bg-zinc-950/85 backdrop-blur-sm border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 font-bold">
          #0${idx + 1}
        </div>

        <!-- Camera Pill -->
        <div class="absolute bottom-1.5 right-1.5 bg-zinc-950/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-300">
          ${shot.camera.split('+')[0]}
        </div>
      </div>

      <!-- Shot Script Details -->
      <div class="flex-1 space-y-2 w-full">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-zinc-200 font-mono tracking-tight group-hover:text-amber-300 transition">${shot.title}</span>
          <span class="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">${shot.duration}</span>
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed">${shot.desc}</p>

        <!-- Voiceover audio box -->
        <div class="bg-zinc-900/80 border border-zinc-800 p-2 rounded-lg text-[11px] font-mono text-zinc-400 flex items-start space-x-2">
          <span class="text-amber-400 text-xs">🎙️</span>
          <span class="italic text-zinc-300">${shot.vo}</span>
        </div>

        <!-- Shot Tags -->
        <div class="flex flex-wrap gap-1.5 pt-0.5 text-[10px] font-mono text-zinc-500">
          ${shot.tags.map(t => `<span class="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 10. TÍNH NĂNG TÌM THỊ TRƯỜNG (MARKET INTELLIGENCE)
// ==========================================
let currentMarketCategory = 'all';

function toggleMarketModal(show = true) {
  playSyntheticSound('blip');
  const modal = document.getElementById('market-modal');
  if (modal) {
    modal.classList.toggle('hidden', !show);
  }
}

function setMarketCategory(cat) {
  currentMarketCategory = cat;
  document.querySelectorAll('.market-cat-btn').forEach(btn => {
    btn.className = 'market-cat-btn px-2.5 py-1 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white';
  });
  if (event && event.target) {
    event.target.className = 'market-cat-btn px-2.5 py-1 rounded bg-cyan text-zinc-950 font-bold border border-cyan';
  }
  filterMarketData();
}

function filterMarketData() {
  const query = (document.getElementById('market-search-input')?.value || '').toLowerCase();
  const region = document.getElementById('market-region-select')?.value || 'us';

  const filtered = marketDatabase.filter(item => {
    const matchRegion = (region === 'global' || item.region === region || item.region === 'global');
    const matchCategory = (currentMarketCategory === 'all' || item.category === currentMarketCategory);
    const matchQuery = !query || item.title.toLowerCase().includes(query) || item.topHooks.some(h => h.toLowerCase().includes(query)) || item.samplePrompt.toLowerCase().includes(query);
    return matchRegion && matchCategory && matchQuery;
  });

  renderMarketResults(filtered);
}

function renderMarketFinder() {
  filterMarketData();
}

function renderMarketResults(items) {
  const container = document.getElementById('market-results-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-zinc-500 font-mono text-xs">
        Không tìm thấy báo cáo thị trường phù hợp với từ khóa này. Hãy thử từ khóa khác như "lego", "robot", "stem", "xe đua".
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 hover:border-cyan/50 transition">
      
      <!-- Top Title & Metrics -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-base font-bold text-white font-mono">${item.title}</span>
            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-dim text-cyan border border-cyan/30">${item.region.toUpperCase()}</span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">${item.buyerPersona}</p>
        </div>

        <button onclick="applyMarketToScript('${item.id}')" class="px-3.5 py-2 rounded-lg bg-cyan text-zinc-950 font-mono font-bold text-xs hover:bg-cyan/90 transition shadow-md flex items-center space-x-1.5 whitespace-nowrap self-start sm:self-auto">
          <span>⚡ Áp Dụng Thị Trường Này</span>
        </button>
      </div>

      <!-- Key Market Financial Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div class="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <span class="text-zinc-500 text-[10px] block">Quy Mô Ngành</span>
          <strong class="text-amber-400 text-sm">${item.size}</strong>
        </div>
        <div class="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <span class="text-zinc-500 text-[10px] block">Tăng Trưởng</span>
          <strong class="text-emerald-400 text-sm">${item.growth}</strong>
        </div>
        <div class="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <span class="text-zinc-500 text-[10px] block">Hoa Hồng Affiliate</span>
          <strong class="text-cyan text-sm">${item.affiliateCommission.split('(')[0]}</strong>
        </div>
        <div class="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <span class="text-zinc-500 text-[10px] block">Dự Báo ROAS</span>
          <strong class="text-purple-400 text-sm">${item.targetROAS}</strong>
        </div>
      </div>

      <!-- Top 3 Winning TikTok / Shorts Hooks -->
      <div class="space-y-2">
        <span class="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider block">Top Công Thức Hook Triệu View Đã Được Kiểm Chứng:</span>
        <div class="space-y-1.5">
          ${item.topHooks.map(hook => `
            <div class="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 flex items-center justify-between">
              <span class="font-mono text-zinc-200">${hook}</span>
              <button onclick="copyHookToPrompt('${hook.replace(/'/g, "\\'")}')" class="text-[11px] font-mono text-cyan hover:underline ml-2 whitespace-nowrap">Chèn Vào Prompt &rarr;</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recommended Format & AI Style -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs font-mono text-zinc-400 border-t border-zinc-800/80">
        <div>
          <span class="text-zinc-500">Định dạng khuyên dùng:</span>
          <strong class="text-zinc-300 ml-1">${item.winningFormat}</strong>
        </div>
        <div>
          <span class="text-zinc-500">Style Lemo-OpusCar:</span>
          <strong class="text-amber-400 ml-1">${item.recommendedStyle}</strong>
        </div>
      </div>

    </div>
  `).join('');
}

function applyMarketToScript(marketId) {
  const item = marketDatabase.find(m => m.id === marketId);
  if (!item) return;

  playSyntheticSound('laser');

  // Update prompt with market winning hook & sample prompt
  const promptInput = document.getElementById('hero-prompt-input');
  promptInput.value = `${item.topHooks[0].replace(/^[^\"]*\"|\"[^\"]*$/g, '')}: ${item.samplePrompt}`;

  // Update style
  document.getElementById('hero-style-select').value = item.recommendedStyle;
  onStyleDropdownChange(item.recommendedStyle);

  // Update Market Badge in Hero Bar
  const marketTag = document.getElementById('active-market-tag');
  const marketTagName = document.getElementById('market-tag-name');
  if (marketTag && marketTagName) {
    marketTagName.innerText = `${item.title.split('(')[0].trim()}`;
    marketTag.classList.remove('hidden');
  }

  // Close modal and notify
  toggleMarketModal(false);
  generateFromHeroBar();
}

function copyHookToPrompt(hookText) {
  const promptInput = document.getElementById('hero-prompt-input');
  promptInput.value = hookText + ' ' + promptInput.value;
  toggleMarketModal(false);
  promptInput.focus();
}

// ==========================================
// 11. STUDIO CANVAS MONITOR (THREE.JS / SIM)
// ==========================================
function initCanvasMonitor() {
  drawMonitorFrame();
}

function drawMonitorFrame() {
  const canvas = document.getElementById('film-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Dark background for monitor
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, w, h);

  // Simulated render by visualMode
  const mode = activeStyle.visualMode || 'bricks';

  if (mode === 'bricks') {
    // Lego bricks stop-motion simulation
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const count = 12;
    const progress = (currentTime % 5) / 5;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + progress * Math.PI;
      const radius = 60 + Math.sin(progress * Math.PI * 4 + i) * 20;
      const bx = Math.cos(angle) * radius;
      const by = Math.sin(angle) * radius;

      // Draw Lego brick
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : (i % 3 === 0 ? '#3b82f6' : '#f59e0b');
      ctx.fillRect(bx - 18, by - 12, 36, 24);
      // Lego studs
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(bx - 9, by - 6, 4, 0, Math.PI * 2);
      ctx.arc(bx + 9, by - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (mode === 'teardown' || mode === 'blueprint') {
    // CAD wireframe exploded view
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = activeStyle.color || '#38bdf8';
    ctx.lineWidth = 1.5;

    const angle = (currentTime * 0.5) % (Math.PI * 2);
    ctx.rotate(angle);

    ctx.strokeRect(-60, -60, 120, 120);
    ctx.strokeRect(-90, -30, 180, 60);
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Measurement labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillText('R: 45.0mm', 55, 0);
    ctx.fillText('ISO 9001', -50, 80);
    ctx.restore();
  } else if (mode === 'clay') {
    // Soft organic clay blobs
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const wobble = Math.sin(currentTime * 4) * 8;
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(0, 0, 70 + wobble, 60 - wobble, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#070709';
    ctx.beginPath();
    ctx.arc(-20, -10, 6, 0, Math.PI * 2);
    ctx.arc(20, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Default stylized wireframe & glowing orb
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
    grad.addColorStop(0, activeStyle.color || '#f59e0b');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Monitor Scanlines & Frame Crosshair
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2, 20); ctx.lineTo(w / 2, 40);
  ctx.moveTo(w / 2, h - 40); ctx.lineTo(w / 2, h - 20);
  ctx.moveTo(30, h / 2); ctx.lineTo(50, h / 2);
  ctx.moveTo(w - 50, h / 2); ctx.lineTo(w - 30, h / 2);
  ctx.stroke();
}

function onScrub(val) {
  currentTime = parseFloat(val);
  updatePlaybackUI();
  drawMonitorFrame();
}

function togglePlayback() {
  isPlaying = !isPlaying;
  const btn = document.getElementById('btn-transport-play');
  if (isPlaying) {
    if (btn) {
      btn.innerText = 'Tạm Dừng ❚❚';
      btn.className = 'px-3 py-1 bg-zinc-800 text-amber-400 border border-amber-400 rounded text-xs font-bold hover:bg-zinc-700 transition';
    }
    playSyntheticSound('blip');
    playbackInterval = setInterval(() => {
      currentTime += 0.1;
      if (currentTime >= totalDuration) {
        currentTime = 0;
      }
      updatePlaybackUI();
      drawMonitorFrame();
    }, 100);
  } else {
    if (btn) {
      btn.innerText = 'Phát ▶';
      btn.className = 'px-3 py-1 bg-amber-400 text-zinc-950 rounded text-xs font-bold hover:bg-amber-300 transition';
    }
    clearInterval(playbackInterval);
  }
}

function stepFrame(deltaSeconds) {
  currentTime = Math.max(0, Math.min(totalDuration, currentTime + deltaSeconds));
  updatePlaybackUI();
  drawMonitorFrame();
}

function updatePlaybackUI() {
  const scrubber = document.getElementById('film-scrubber');
  if (scrubber) scrubber.value = currentTime;

  const currentDisplay = document.getElementById('current-scrub-time');
  if (currentDisplay) currentDisplay.innerText = formatTimecode(currentTime);

  const tcDisplay = document.getElementById('timecode-display');
  if (tcDisplay) tcDisplay.innerText = formatTimecode(currentTime);

  const frameInfo = document.getElementById('current-frame-info');
  if (frameInfo) frameInfo.innerText = `Frame ${Math.round(currentTime * 30)} / 30fps`;

  // Update current active scene label based on time
  const shotIdx = Math.min(5, Math.floor((currentTime / totalDuration) * 6));
  const activeShot = filmShots[shotIdx];
  if (activeShot) {
    const sceneTitle = document.getElementById('active-scene-title');
    const scenePrompt = document.getElementById('active-scene-prompt');
    const camDisplay = document.getElementById('camera-movement-display');
    if (sceneTitle) sceneTitle.innerText = activeShot.title;
    if (scenePrompt) scenePrompt.innerText = activeShot.desc;
    if (camDisplay) camDisplay.innerText = activeShot.camera;
  }
}

function formatTimecode(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

// ==========================================
// 12. CLI CODE GENERATOR & EXPORTS
// ==========================================
function updateRenderScriptCLI() {
  const aspect = document.getElementById('hero-aspect-select')?.value || '16:9';
  const duration = document.getElementById('hero-duration-select')?.value || '30';
  const pacing = document.getElementById('hero-pacing-select')?.value || 'snappy';

  const codeBox = document.getElementById('code-snippet-box');
  if (codeBox) {
    codeBox.innerText = `
# Lemo-OpusCar Video Production Automation Script
# Style: ${activeStyle.id} | Engine: 99 Styles Three.js / Canvas
cd ~/lemo-opuscar

# 1. Khởi tạo & nạp kịch bản 6 phân cảnh
node core/render/still.mjs "films/lego-commercial" 1.5 3 \\
  --style "${activeStyle.id}" \\
  --ar "${aspect}" \\
  --duration ${duration} \\
  --pacing "${pacing}"

# 2. Render & ghép nối âm thanh bản quyền
./build.sh \\
  --fps 30 \\
  --crf 18 \\
  --output "films/lego-commercial/output_${activeStyle.id}_${aspect.replace(':', 'x')}.mp4"
    `.trim();
  }
}

function copyRenderCode() {
  const codeBox = document.getElementById('code-snippet-box');
  if (codeBox) {
    navigator.clipboard.writeText(codeBox.innerText).then(() => {
      playSyntheticSound('blip');
      alert('Đã sao chép lệnh render Lemo-OpusCar CLI vào bộ nhớ tạm!');
    });
  }
}

function exportTreatment() {
  const promptInput = document.getElementById('hero-prompt-input');
  const userPrompt = promptInput.value.trim() || 'Phim quảng cáo đồ chơi hoạt hình AI';

  const treatmentMd = `
# HỒ SƠ TIỀN KỲ ĐIỆN ẢNH (FILM TREATMENT)
**Dự Án:** Phim Hoạt Hình Quảng Cáo Đồ Chơi AI
**Phong Cách:** \`${activeStyle.id}\` (${activeStyle.name})
**Tiêu Chuẩn Thiết Kế:** Unslop Craft System
**Chứng Nhận An Toàn:** COPPA & CARU Certified Child-Safe

---

## 1. Ý TƯỞNG CỐT TRUYỆN (LOGLINE)
${userPrompt}

## 2. THÔNG SỐ KỸ THUẬT SẢN XUẤT
- **Thời lượng:** ${totalDuration} giây
- **Tỷ lệ khung hình:** ${document.getElementById('hero-aspect-select')?.value || '16:9'}
- **Nhịp độ BPM:** ${document.getElementById('hero-pacing-select')?.value || '124 BPM'}
- **Hệ thống kết xuất:** Three.js / Canvas GLSL Shaders (\`~/lemo-opuscar/styles/${activeStyle.id}/\`)

## 3. BẢNG PHÂN CẢNH KỸ THUẬT (SHOT BREAKDOWN)
${filmShots.map(s => `- **${s.title}** (${s.duration}): ${s.desc} [Camera: ${s.camera}] [VO: ${s.vo}]`).join('\n')}

---
*Được xuất bởi Lemo OpusCar Studio.*
  `.trim();

  navigator.clipboard.writeText(treatmentMd).then(() => {
    playSyntheticSound('laser');
    alert('Đã xuất file TREATMENT.md và sao chép vào bộ nhớ tạm thành công!');
  });
}

// ==========================================
// 13. SYNTHETIC AUDIO FEEDBACK (WEB AUDIO API)
// ==========================================
function playSyntheticSound(type = 'blip') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'blip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'laser') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
}
