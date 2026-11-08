# HƯỚNG DẪN SỬ DỤNG: TOYSTUDIO AI HUB v1.0

Ứng dụng web điều hành nội bộ đa chức năng cho agency sản xuất phim hoạt hình AI quảng cáo đồ chơi, tích hợp công cụ chuyên môn cho **Marketing & Clip AI**, **Sales** và **Ban Điều Phối Studio**.

---

## 1. Tính Năng Nổi Bật

### 🎯 Phân Hệ Marketing & Clip AI:
1. **Bảng Kanban Quản Lý Theo Cảnh (Scene Kanban):**
   - Theo dõi tiến độ sản xuất từng frame/shot qua 4 cột trạng thái chuẩn: *1. Soạn Prompt*, *2. Đang Render AI*, *3. Hậu Kỳ & Thẩm Định An Toàn Trẻ Em*, *4. Hoàn Thành*.
   - Cho phép di chuyển tiến/lùi phân cảnh nhanh chóng và thêm phân cảnh mới với modal tiện ích.
2. **Thư Viện Nhân Vật 3D & Kho Master Prompt:**
   - Xem trước Visual Bible, mã màu Pantone, Character Seed và phong cách (Pixar 3D, Chibi Mecha, Claymation).
   - Nút **Copy Prompt 1-Click** tích hợp sẵn Negative Prompts chặn dị tật hình ảnh và bảo đảm an toàn trẻ thơ.
3. **Trình Duyệt Clip Theo Timestamp & Phê Duyệt Pháp Lý:**
   - Thanh trượt scrubber chính xác đến từng mili-giây, tua nhanh/chậm &plusmn;0.5 giây.
   - Thêm bình luận góp ý trực tiếp gắn liền với timestamp đang phát.
   - Nút **Ký Phê Duyệt An Toàn (Legal Stamp)** dành riêng cho `agency-legal-compliance-checker` xác nhận video tuân thủ chuẩn CARU/COPPA.

### 💼 Phân Hệ Sales & Phát Triển Kinh Doanh:
1. **CRM Khách Hàng Đồ Chơi:**
   - Quản lý danh sách đối tác nhãn hàng, quy mô ngân sách, đầu mối mua hàng (Buyer) và giai đoạn chuyển đổi.
   - Nút liên kết chuyển nhanh thông tin khách hàng sang bộ tạo báo giá.
2. **Bộ Tự Động Tạo Báo Giá & Đề Xuất Proposal:**
   - Tự động tính toán chi phí theo số lượng clip, thời lượng (15s/30s/60s) và phong cách hoạt hình.
   - Xuất bản dự thảo Proposal định dạng Markdown chuẩn chỉnh, sẵn sàng gửi khách hàng.

### 📊 Phân Hệ Dùng Chung Toàn Studio:
1. **Dashboard KPI Toàn Diện:**
   - Hiển thị tỷ lệ duyệt clip lần đầu (&ge;80%), thời gian sản xuất trung bình (~32.4h), doanh thu phễu sales và chỉ số uptime IT.
2. **Theo Dõi Chi Phí Điện Toán AI (AI Cost & Credit Tracker):**
   - Bảng theo dõi chi phí theo từng clip và biểu đồ phân bổ tài nguyên (Video Gen 58%, Image Gen 22%, Upscale 12%, Audio 8%).

---

## 2. Hướng Dẫn Khởi Chạy

Ứng dụng được đóng gói hoàn toàn dưới dạng Single-Page Application (SPA) siêu nhẹ, không cần cài đặt node_modules hay build tool phức tạp.

### Cách 1: Mở Trực Tiếp Trên Trình Duyệt
Nhấp đúp chuột vào file `tools/toy-studio-hub/index.html` hoặc mở bằng trình duyệt Google Chrome / Microsoft Edge / Safari.

### Cách 2: Khởi Chạy Qua Local Server (Khuyến nghị cho Studio)
Chạy lệnh một dòng bằng Python tích hợp sẵn:
```powershell
python -m http.server 8080 --directory tools/toy-studio-hub
```
Sau đó truy cập địa chỉ: `http://localhost:8080`.

---

## 3. Nhật Ký Thẩm Định & Kiểm Soát Chất Lượng
- **Code Review:** Đã qua thẩm định bởi `agency-code-reviewer` - Code cấu trúc rõ ràng, tách biệt logic dữ liệu và render.
- **An Toàn & Bảo Mật:** Đã kiểm duyệt bởi `agency-ai-generated-code-security-auditor` - Không chứa hardcoded API keys, không rò rỉ dữ liệu cá nhân, sanitization dữ liệu đầu vào.
- **Tính Thực Tế:** Đã xác nhận bởi `agency-reality-checker` - Đạt tiêu chuẩn Production-Ready cho toàn studio.

