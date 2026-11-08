# Web Marketing Studio - AI Animation & Toy Commercials Agency

Hệ thống điều hành Studio Creative Agency chuyên sản xuất phim hoạt hình AI (2D/3D Generative AI) quảng cáo đồ chơi trẻ em, sản phẩm mẹ & bé và các dòng đồ chơi giáo dục STEM.

Ứng dụng mô hình **3 Phòng Ban Ảo & 49 AI Agents Chuyên Sâu** chạy trên nền tảng **Google Antigravity**, tích hợp đầy đủ công cụ web điều hành nội bộ và cổng kiểm soát an toàn trẻ em khắt khe.

---

## 🏛️ Cơ Cấu 3 Phòng Ban Ảo

1. **Phòng Marketing & Clip AI (Trưởng phòng: Studio Producer):**
   - 17 AI Agents chuyên sâu về tạo hình nhân vật, biên kịch phân cảnh 3 hồi, Storyboard, Master Prompts AI, hậu kỳ âm thanh và tối ưu viral TikTok/Shorts/Reels.
   - Cổng thẩm định an toàn trẻ em bắt buộc (`agency-legal-compliance-checker`) tuân thủ chuẩn CARU và Đạo luật COPPA.

2. **Phòng Sales & Chăm Sóc Khách Hàng (Trưởng phòng: Deal Strategist):**
   - 9 AI Agents phụ trách tiếp cận nhãn hàng đồ chơi B2B, khảo sát nhu cầu MEDDPICC, tạo báo giá/proposal tự động và gửi link mua hàng trực tiếp (Buy Links / Affiliate Links).

3. **Phòng Công Nghệ & Hạ Tầng IT (Trưởng phòng: Software Architect):**
   - 20 AI Agents phục vụ 2 phòng ban còn lại, tự động tạo công cụ nội bộ (Internal Tools) theo nhu cầu thực tế, kiểm soát an toàn bảo mật và theo dõi chi phí credit AI.

---

## 🚀 Ứng Dụng Web Điều Hành: ToyStudio AI Hub

Nằm trong thư mục `tools/toy-studio-hub/`:
- **Khung Chat Điều Hành Tập Trung:** Bạn ra lệnh, 3 phòng ban cùng phân tích và thực thi nhiệm vụ đồng thời.
- **Bảng Kanban Theo Cảnh (Scene Kanban):** Quản lý tiến độ sản xuất từng frame/shot.
- **Thư Viện Nhân Vật & Prompt:** Quản lý Visual Bible, Character Seed và Master Prompt có nút copy 1-click.
- **Trình Duyệt Video Theo Timestamp:** Tua theo từng mili-giây, ghim bình luận theo thời gian thực và đóng dấu phê duyệt pháp lý.
- **Báo Cáo Phân Tích Thị Trường LEGO & Affiliate:** Dashboard trực quan hóa cơ cấu 14.8 tỷ USD thị trường Mỹ/Châu Âu tại `docs/lego_market_analysis.html`.

### Khởi Chạy Nhanh:
Nhấp đúp chuột vào file `start-studio-hub.bat` (Windows) hoặc chạy:
```bash
python -m http.server 8085 --directory tools/toy-studio-hub
```
Sau đó truy cập: `http://localhost:8085`.

---

## 📦 Antigravity Plugin Đóng Gói
Hệ sinh thái studio được đóng gói thành Antigravity Plugin chuẩn hóa tại `plugins/toy-ai-animation-agency/` (gồm 52 kỹ năng và quy tắc an toàn `rules/AGENTS.md`), sẵn sàng tái sử dụng cho mọi dự án mới.

---

## 📄 Bản Quyền & Giấy Phép
Phát triển dựa trên khung kiến trúc Agency Agents bởi Antigravity Orchestration Team.
Mọi kịch bản và sản phẩm tuân thủ nghiêm ngặt chuẩn mực an toàn trẻ em quốc tế.
