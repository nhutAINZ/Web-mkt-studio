# ĐỀ XUẤT HỆ THỐNG CÔNG CỤ NỘI BỘ STUDIO (INTERNAL TOOLS SUITE)

Tài liệu đề xuất danh mục các công cụ phần mềm nội bộ do **Phòng Công nghệ & Hạ tầng (IT)** thiết kế và phát triển, nhằm số hóa và tự động hóa toàn diện quy trình làm phim hoạt hình AI quảng cáo đồ chơi cho **Phòng Marketing & Clip AI** và **Phòng Sales**.

---

## 1. Bộ Công Cụ Dành Cho Phòng Marketing & Clip AI

### Tool 1: Bảng Kanban Quản Lý Dự Án Clip Theo Phân Cảnh (Scene-by-Scene Production Kanban)
- **Mục tiêu:** Quản trị tiến độ sản xuất từng giây/từng shot của clip hoạt hình AI thay vì quản lý chung chung theo đầu việc lớn.
- **Tính năng cốt lõi:**
  - Kéo-thả trạng thái từng scene: `Brief` ➔ `Chốt Prompt` ➔ `Đang Render AI` ➔ `Hậu kỳ & SFX` ➔ `Chờ Duyệt An Toàn Trẻ Em` ➔ `Hoàn Tất`.
  - Gắn thẻ Agent phụ trách trực tiếp trên từng card (ví dụ: Shot 2 do `agency-image-prompt-engineer` viết prompt, `agency-technical-artist` render).
  - Tích hợp đếm ngược thời gian và cảnh báo trễ deadline 48h.
- **Agent IT chủ trì:** `agency-frontend-developer`, `agency-workflow-architect`.
- **Ưu tiên:** **RẤT CAO (Priority 1)**.

### Tool 2: Thư Viện Nhân Vật Đồ Chơi 3D & Kho Master Prompt (Toy Character & Prompt Library)
- **Mục tiêu:** Bảo toàn tính nhất quán (Consistency) tuyệt đối về màu sắc, đường nét và biểu cảm của món đồ chơi qua hàng trăm cảnh quay.
- **Tính năng cốt lõi:**
  - Quản lý Character Sheet theo từng dòng đồ chơi: Ảnh tham chiếu góc xoay 360 độ, mã màu Pantone, mã hạt seed, thẻ LoRA.
  - Kho lưu trữ và tìm kiếm nhanh các mẫu prompt thành công (Best-performing Prompts) phân loại theo phong cách (Pixar 3D, Claymation, Chibi).
  - Nút "Copy Prompt 1-Click" kèm Negative Prompts tiêu chuẩn loại trừ dị tật hình ảnh.
- **Agent IT chủ trì:** `agency-backend-architect`, `agency-ui-designer`.
- **Ưu tiên:** **RẤT CAO (Priority 1)**.

### Tool 3: Bảng Storyboard Tương Tác Trực Quan (Interactive Storyboard Board)
- **Mục tiêu:** Cho phép đạo diễn và biên kịch ghép nối các khung hình tĩnh để hình dung nhịp điệu phân cảnh trước khi bấm render video tốn credit.
- **Tính năng cốt lõi:**
  - Bố cục lưới thẻ tương tác hiển thị thời lượng (giây), góc máy, mô tả hành động và lời thoại nhân vật.
  - Xem trước chuyển động giả lập (Animatic Preview) bằng cách tua tuần tự các khung ảnh tĩnh theo đúng nhịp timeline.
- **Agent IT chủ trì:** `agency-frontend-developer`, `agency-ux-architect`.
- **Ưu tiên:** **TRUNG BÌNH (Priority 2)**.

### Tool 4: Hệ Thống Duyệt Clip Có Comment Theo Timestamp (Timestamp Video Review & Annotation Player)
- **Mục tiêu:** Xóa bỏ tình trạng góp ý chung chung; cho phép nhãn hàng và `agency-legal-compliance-checker` bấm dừng và comment chính xác đến từng mili-giây.
- **Tính năng cốt lõi:**
  - Trình phát video chuyên dụng có timeline zoom-in, hỗ trợ phím tắt tua từng khung hình (frame-by-frame).
  - Chức năng ghim bình luận tại timestamp cụ thể (ví dụ: `00:04.12: Tay búp bê bị biến dạng ngón, cần render lại shot này`).
  - Nút cấp chứng chỉ phê duyệt an toàn trẻ em (Legal Approval Stamp) do `agency-legal-compliance-checker` ký nhận.
- **Agent IT chủ trì:** `agency-video-streaming-engineer`, `agency-frontend-developer`.
- **Ưu tiên:** **RẤT CAO (Priority 1)**.

### Tool 5: Lịch Đăng Clip Đa Nền Tảng (Multi-Platform Content Calendar)
- **Mục tiêu:** Lên lịch phát hành và đồng bộ hóa phân phối video trên TikTok, YouTube Shorts và Instagram Reels.
- **Tính năng cốt lõi:**
  - Giao diện lịch biểu trực quan theo tháng/tuần/ngày.
  - Quản lý kho nội dung đã duyệt, tự động chuẩn bị sẵn bộ hashtag thịnh hành và copywriting cho từng nền tảng.
- **Agent IT chủ trì:** `agency-frontend-developer`, `agency-workflow-architect`.
- **Ưu tiên:** **TRUNG BÌNH (Priority 2)**.

### Tool 6: Dashboard Đo Lường Hiệu Quả Clip & Tỷ Lệ Giữ Chân (Clip Analytics & Retention Dashboard)
- **Mục tiêu:** Đánh giá sức hút của video hoạt hình dựa trên dữ liệu tương tác thực tế từ các kênh truyền thông.
- **Tính năng cốt lõi:**
  - Biểu đồ đường cong giữ chân người xem (Retention Curve 3 giây đầu, 50% thời lượng, xem hết video).
  - So sánh hiệu quả giữa các phong cách hoạt hình (ví dụ: Phong cách 3D hoạt hình Pixar tạo CTR cao hơn Claymation 24%).
- **Agent IT chủ trì:** `agency-data-visualization-engineer`.
- **Ưu tiên:** **TRUNG BÌNH (Priority 2)**.

---

## 2. Bộ Công Cụ Dành Cho Phòng Sales & Phát Triển Kinh Doanh

### Tool 7: CRM Nhẹ Chuyên Dụng Cho Khách Hàng Đồ Chơi (Toy Brand Lightweight CRM)
- **Mục tiêu:** Quản lý tập trung dữ liệu liên hệ của các nhãn hàng đồ chơi, phân loại theo mùa vụ mua sắm (Trung Thu, Giáng Sinh, Tết Thiếu Nhi).
- **Tính năng cốt lõi:**
  - Quản lý hồ sơ công ty: Dòng đồ chơi chủ đạo, độ tuổi phục vụ, người quyết định ngân sách (Economic Buyer), lịch sử trao đổi.
  - Trạng thái hành trình khách hàng: `Mới tiếp cận` ➔ `Đã họp Discovery` ➔ `Đã gửi Báo giá & Proposal` ➔ `Đang thương thảo` ➔ `Ký hợp đồng` ➔ `Chăm sóc sau bán`.
- **Agent IT chủ trì:** `agency-backend-architect`, `agency-frontend-developer`.
- **Ưu tiên:** **RẤT CAO (Priority 1)**.

### Tool 8: Công Cụ Tự Động Tạo Báo Giá & Proposal (Auto Quote & Proposal Generator)
- **Mục tiêu:** Giúp chuyên viên sales tạo ra bản báo giá và đề xuất sản xuất chuyên nghiệp chỉ trong 3 phút, thay vì mất cả buổi soạn thảo thủ công.
- **Tính năng cốt lõi:**
  - Nhập thông số: Số lượng clip (3, 5, 10 clip), độ dài (15s, 30s), phong cách 3D/2D, yêu cầu lồng tiếng.
  - Tự động tính toán chi phí AI credit, chi phí nhân sự và biên lợi nhuận kỳ vọng.
  - Xuất ra file Proposal & Báo giá chuẩn định dạng Markdown/PDF lưu thẳng vào thư mục `docs/quotes/`.
- **Agent IT chủ trì:** `agency-rapid-prototyper`, `agency-pricing-analyst`.
- **Ưu tiên:** **RẤT CAO (Priority 1)**.

### Tool 9: Thư Viện Portfolio & Showreel Clip Hoạt Hình Mẫu (Video Portfolio & Showreel Hub)
- **Mục tiêu:** Kho tài nguyên hình ảnh sinh động giúp Sales gửi ngay cho khách hàng xem thử theo đúng thể loại đồ chơi của họ khi đang tư vấn.
- **Tính năng cốt lõi:**
  - Phân loại showreel theo danh mục đồ chơi: Xe mô hình, Búp bê thời trang, Đồ chơi trí tuệ STEAM, Thú bông ngộ nghĩnh.
  - Tạo link chia sẻ bảo mật (White-label pitch deck) gửi riêng cho từng nhãn hàng.
- **Agent IT chủ trì:** `agency-frontend-developer`, `agency-video-streaming-engineer`.
- **Ưu tiên:** **TRUNG BÌNH (Priority 2)**.

### Tool 10: Bảng Theo Dõi & Dự Báo Phễu Bán Hàng (Sales Pipeline Tracker)
- **Mục tiêu:** Trực quan hóa giá trị doanh thu kỳ vọng theo thời gian thực cho Ban Giám đốc và Trưởng phòng Sales (`agency-deal-strategist`).
- **Tính năng cốt lõi:**
  - Biểu đồ phễu chuyển đổi (Funnel chart), xác suất chốt hợp đồng (Win Probability) theo từng giai đoạn.
  - Cảnh báo các thương vụ bị "ngâm" quá lâu chưa phản hồi để đội sales kịp thời chăm sóc.
- **Agent IT chủ trì:** `agency-data-visualization-engineer`, `agency-pipeline-analyst`.
- **Ưu tiên:** **TRUNG BÌNH (Priority 2)**.

---

## 3. Bộ Công Cụ Dùng Chung Toàn Studio

### Tool 11: Trung Tâm Chỉ Huy & Dashboard KPI Toàn Studio (Studio Central Command & KPI Dashboard)
- **Mục tiêu:** Bảng điều khiển trung tâm giúp Ban Giám đốc và 3 Trưởng phòng nắm bắt toàn bộ nhịp đập hoạt động của agency.
- **Tính năng cốt lõi:**
  - Hiển thị song song 3 khối KPI:
    - *Marketing:* Số clip đang sản xuất, thời gian turnaround trung bình, tỷ lệ duyệt clip lần đầu.
    - *Sales:* Doanh số tháng, số deal mới, tỷ lệ chuyển đổi khách hàng đồ chơi.
    - *IT:* Độ sẵn sàng của hệ thống, thời gian phản hồi công cụ nội bộ.
- **Agent IT chủ trì:** `agency-data-visualization-engineer`, `agency-software-architect`.
- **Ưu tiên:** **CAO (Priority 1)**.

### Tool 12: Hệ Thống Theo Dõi Chi Phí Điện Toán & Credit AI (AI Cost & Credit Tracker per Clip)
- **Mục tiêu:** Minh bạch hóa và kiểm soát chặt chẽ từng đồng chi phí tài nguyên AI tiêu thụ cho mỗi giây video clip.
- **Tính năng cốt lõi:**
  - Đo lường chi tiết chi phí theo từng dự án: Chi phí render ảnh Midjourney, chi phí video model (Runway/Kling), chi phí voice ElevenLabs, chi phí upscale.
  - Phân tích biên lợi nhuận thực tế (Gross Margin) của từng hợp đồng quảng cáo đồ chơi sau khi trừ đi chi phí điện toán AI.
  - Cảnh báo đỏ khi một clip vượt quá định mức ngân sách credit cho phép.
- **Agent IT chủ trì:** `agency-backend-architect`, `agency-data-visualization-engineer`.
- **Ưu tiên:** **RẤT CAO (Priority 1)**.

---

## 4. Tiêu Chuẩn Thiết Kế & Kỹ Thuật Bắt Buộc
- **Giao diện người dùng (UI/UX):** 100% tiếng Việt tự nhiên, trực quan, thẩm mỹ hiện đại, hỗ trợ Dark Mode/Light Mode, thân thiện với cả nhân sự nghệ thuật và kinh doanh.
- **Độ tương thích (Responsive):** Tương thích hoàn hảo trên màn hình máy tính trạm làm việc, laptop và máy tính bảng iPad/Tablet.
- **Kiến trúc mã nguồn:** Mã nguồn sạch, nhẹ, có thể khởi chạy dễ dàng ngay trong môi trường local (chạy qua web app đơn giản như Python FastAPI/Flask hoặc Single Page Web App thuần HTML5/Tailwind/JS) mà không đòi hỏi hạ tầng phức tạp.

