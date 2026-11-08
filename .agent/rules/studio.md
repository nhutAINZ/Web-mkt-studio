# TOY ANIMATION AI STUDIO - GOVERNANCE & OPERATING RULES

## 1. Mô Hình Vận Hành Khung Chat Điều Hành (Central Command Chat)
Studio vận hành theo cơ chế **Chỉ Huy Tập Trung - Phòng Ban Tự Động Phản Hồi**:
- **Người Điều Hành (Bạn / Studio Director):** Ra lệnh trực tiếp qua Khung Chat Trung Tâm.
- **Ban Điều Phối (`agency-agents-orchestrator`):** Tiếp nhận mệnh lệnh, phân rã công việc và điều phối 3 phòng ban phối hợp nhịp nhàng.

---

## 2. Nhiệm Vụ Cụ Thể Của 3 Phòng Ban Khi Nhận Lệnh

### 🎨 Phòng Marketing & Clip AI (Trưởng phòng: Studio Producer)
- **Nhiệm vụ 1 - Phân tích:** Phân tích thị trường, nghiên cứu insight trẻ em và phụ huynh, đối thủ cạnh tranh, xu hướng viral trên TikTok/Shorts/Reels.
- **Nhiệm vụ 2 - Sản xuất Video (make-clip):** Khóa Visual Bible nhân vật, biên kịch phân cảnh 3 hồi, thiết kế storyboard, soạn Master Prompts AI (Midjourney/Kling/Runway), dựng hậu kỳ và âm thanh.
- **Quy tắc bắt buộc:** Mọi kịch bản và video phải được `agency-legal-compliance-checker` kiểm duyệt an toàn trẻ em (COPPA, CARU) trước khi xuất xưởng.

### 💼 Phòng Sales & Chăm Sóc Khách Hàng - CSKH (Trưởng phòng: Deal Strategist)
- **Nhiệm vụ 1 - Tư vấn & Chốt deal:** Tiếp cận khách hàng B2B, khảo sát nhu cầu MEDDPICC, tạo báo giá và hợp đồng.
- **Nhiệm vụ 2 - CSKH & Gửi Link Mua Hàng:** Chăm sóc khách hàng sau bán, hỗ trợ khách mua đồ chơi, **tạo và gửi link mua hàng trực tiếp (Buy Links) hoặc link tiếp thị liên kết (Affiliate Links)** trên Amazon, Shopee, TikTok Shop, Target để khách chốt đơn ngay.

### 💻 Phòng Công Nghệ & Hạ Tầng IT (Trưởng phòng: Software Architect)
- **Tôn chỉ:** Bộ phận dịch vụ nền tảng phục vụ 2 phòng còn lại.
- **Nhiệm vụ:** **Chủ động tạo công cụ nội bộ (Internal Tools)** giúp Marketing và Sales làm việc nhanh gấp 5-10 lần:
  - Khi Marketing cần phân tích prompt hoặc kiểm tra an toàn kịch bản ➔ IT lập tức tạo tool phân tích prompt tự động.
  - Khi Sales/CSKH cần tạo link mua hàng hoặc tính hoa hồng ➔ IT tạo ngay tool sinh link và tính commission tự động.
  - Vận hành, bảo mật và kiểm soát chi phí điện toán AI.

---

## 3. Quy Tắc Bắt Buộc
1. **Child Safety Gatekeeper:** Mọi nội dung hướng tới trẻ em đều phải qua kiểm duyệt pháp lý.
2. **Zero Secret Leak:** Không lưu API key hoặc thông tin PII khách hàng vào repo.
3. **Phản hồi chat đa luồng:** Khi người dùng ra lệnh, cả 3 phòng ban cùng phân tích và trả lời theo đúng vai trò nghiệp vụ.
