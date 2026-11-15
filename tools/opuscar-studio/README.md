# Lemo OpusCar Studio - Trình Dựng Video Hoạt Hình Bằng Code (99 Film Styles)

Ứng dụng UX Studio đồ họa chuyên sâu được thiết kế chuẩn mực **Unslop Craft** (không màu tím gradient lòe loẹt, giao diện tĩnh lặng tập trung, màn hình canvas sáng duy nhất ở trung tâm) tích hợp thư viện **Lemo-OpusCar** (99 phong cách điện ảnh kết xuất bằng mã nguồn Three.js/Canvas) kết nối trực tiếp với **Gemini CLI** và **Antigravity**.

---

## 1. Giới Thiệu & Triết Lý Thiết Kế (Unslop Design Standard)

Tuân thủ nghiêm ngặt kỹ năng `unslop` để loại bỏ hoàn toàn các lỗi thẩm mỹ của các ứng dụng AI thông thường:
- **Quiet Chrome & Zinc Palette:** Giao diện tối giản (`zinc-950`, `zinc-900`, `zinc-800`), loại bỏ gradient tím/hồng, bóng bẩy (glossy blobs) và các biểu tượng cảm xúc tràn lan.
- **The One Bright Element:** Màn hình Canvas thời gian thực (Real-time Canvas Monitor) là tâm điểm thị giác duy nhất với tỷ lệ khung hình tùy chỉnh (`16:9`, `9:16`, `1:1`), hiển thị trực quan các hiệu ứng chuyển động của từng phong cách.
- **Deliberate Typography:** Sử dụng bộ phông `Inter` cho nội dung đọc, `JetBrains Mono` cho tham số đạo diễn và mã nguồn, và `Newsreader` cho tiêu đề phân cảnh.
- **Rhythm & Spacing:** Cấu trúc phân cảnh kỹ thuật (Shot Timeline Breakdown) dạng thẻ tuyến tính, hiển thị chính xác thời lượng, nhịp điệu BPM, chuyển động camera và lời bình.

---

## 2. Thư Viện 99 Phong Cách Điện Ảnh (Lemo-OpusCar Engine)

Hệ thống tích hợp trực tiếp thư viện phong cách từ kho mã nguồn `~/lemo-opuscar` (`C:\Users\Az\lemo-opuscar\styles`):

### Các Nhóm Phong Cách Chính:
1. **Đồ Chơi & Stop-Motion (Toy & Craft):**
   - `brick-toy`: Từng khối LEGO tự động lắp ráp, bóng đổ bề mặt nhựa ABS, nhịp giật stop-motion 12fps.
   - `teardown`: Tách rời toàn bộ chi tiết cơ khí dạng bản vẽ kỹ thuật isometric, phóng to cụm bánh răng & pin.
   - `claymation`: Đất nặn thủ công có vân tay, uốn lượn biểu cảm vui tươi.
   - `paper-popup`: Sách diorama 3D mở ra, các mô hình đồ chơi gấp nếp tự động đứng dậy.
   - `tilt-shift`: Hiệu ứng độ sâu trường ảnh biến đại cảnh thành đồ chơi tí hon.
   - `crayon-world`: Nét vẽ sáp màu sần sùi của trẻ thơ, rực rỡ và ấm áp.

2. **Hội Họa & Mỹ Thuật (Art & Paint):**
   - `watercolor`: Vệt loang màu nước thủy mặc mềm mại.
   - `impasto`: Vệt dao sơn dầu gồ ghề phong cách Van Gogh.
   - `ukiyoe`: Tranh khắc gỗ Phù Thế Họa Nhật Bản với viền đen sắc nét.

3. **Kỹ Thuật & CAD (Tech & Blueprint):**
   - `blueprint`: Bản vẽ kỹ thuật nền xanh lam lưới tọa độ chuẩn xác.
   - `cyberpunk-hud`: Giao diện tương lai hologram phát sáng neon.
   - `wireframe`: Khung lưới đa giác 3D xoay vòng thời gian thực.

4. **Retro & Hoạt Hình Cổ Điển (Retro & Vintage):**
   - `rubber-hose`: Hoạt hình ống cao su thập niên 1930s (phong cách Cuphead/Steamboat Willie).
   - `pixel-art`: Điểm ảnh 16-bit hoài niệm thời kỳ máy game SNES.
   - `anime-cel`: Đổ bóng phẳng cel-shading điện ảnh Nhật Bản.

---

## 3. Tính Năng Chính Của Ứng Dụng

1. **Bộ Chọn 99 Phong Cách (Style Selector):** Lọc theo danh mục (Đồ chơi, Mỹ thuật, Kỹ thuật, Retro) kèm thẻ công nghệ (`Three.js`, `GLSL Shaders`, `12fps Stop-motion`).
2. **Bàn Điều Khiển Đạo Diễn (Director's Desk):**
   - Nhập prompt cốt truyện hoặc ý tưởng TVC đồ chơi.
   - Điều chỉnh thời lượng (15s TikTok hook, 30s TVC, 45s mùa vụ, 60s phim ngắn).
   - Tùy biến tỷ lệ khung hình (`16:9`, `9:16`, `1:1`).
   - Cài đặt nhịp điệu BPM (`snappy 124 BPM`, `playful 110 BPM`, `cinematic 90 BPM`, `asmr`).
   - Lựa chọn giọng thuyết minh hoặc chỉ dùng âm nhạc sound design.
3. **Màn Hình Dựng Phim Thời Gian Thực (Canvas Monitor):**
   - Khung xem trước mô phỏng chuyển động hình học theo từng phong cách hoạt hình.
   - Timecode chính xác đến từng mili-giây (`00:04.20`).
   - Hiển thị góc quay camera ảo (Orbit 360, Dolly In, Dutch Tilt, Pan Left).
   - Thanh trượt scrubber điều khiển tua tới/lui từng giây hoặc phát liên tục.
4. **Phân Cảnh Kỹ Thuật (Shot Breakdown Timeline):**
   - Liệt kê chi tiết 6 phân cảnh (Establishing, Mechanism, Dynamic Action, Reaction, Climax, Call To Action).
   - Hiển thị nhãn kiểm định an toàn trẻ em (COPPA / CARU Child Safe).
5. **Trình Tạo Mã Nguồn Render (Lemo-OpusCar CLI Automation):**
   - Tự động sinh lệnh render Node.js và bash script:
     ```bash
     cd ~/lemo-opuscar
     node core/render/still.mjs "films/turbo-bot" 1.5 3 --style brick-toy --ar 16:9
     ./build.sh --fps 30 --crf 18 --output "films/turbo-bot/output_brick-toy_16x9.mp4"
     ```
   - Nút **Sao chép mã nguồn** tiện lợi với 1 cú click.
6. **Xuất File TREATMENT.md:**
   - Tạo hồ sơ tiền kỳ điện ảnh tiêu chuẩn Hollywood cho đạo diễn và khách hàng phê duyệt.

---

## 4. Tích Hợp Gemini CLI & Antigravity

Đã cấu hình các subagent và kỹ năng trong thư mục hệ thống:
- **Kỹ năng Unslop:** `~/.gemini/config/skills/unslop/` và `~/.gemini/antigravity/skills/unslop/`
- **Kỹ năng Lemo-OpusCar:** `~/.gemini/config/skills/lemo-opuscar/` và `~/.gemini/antigravity/skills/lemo-opuscar/`
- **Gemini Subagents:**
  - `~/.gemini/agents/lemo-opuscar.md` (Chuyên gia render video hoạt hình bằng code)
  - `~/.gemini/agents/unslop.md` (Chuyên gia kiểm toán và thiết kế giao diện chống AI slop)

### Sử Dụng Qua Gemini CLI:
```bash
# Nhờ subagent opuscar dựng kịch bản phim đồ chơi Lego 30s
gemini chat --agent lemo-opuscar "Tạo phim ngắn đồ chơi xe đua Lego phong cách brick-toy 30s 16:9"

# Nhờ subagent unslop kiểm định giao diện
gemini chat --agent unslop "Đánh giá và tinh chỉnh giao diện tools/opuscar-studio theo tiêu chuẩn Unslop"
```

---

## 5. Hướng Dẫn Khởi Chạy Nhanh

Khởi động trực tiếp bằng file batch:
```cmd
start-opuscar-studio.bat
```
Hoặc mở file trực tiếp trong trình duyệt:
```text
tools/opuscar-studio/index.html
```
Hoặc truy cập qua **ToyStudio AI Hub**:
1. Chạy `start-studio-hub.bat` (Port 8085)
2. Bấm vào nút **OpusCar Studio (99 Styles) ↗** trên thanh điều hướng đầu trang.
