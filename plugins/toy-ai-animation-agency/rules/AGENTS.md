# TOY ANIMATION AI STUDIO - GOVERNANCE & OPERATING RULES

## 1. Bản Sắc Agency
Studio chuyên sản xuất phim hoạt hình AI (2D/3D Generative AI) quảng cáo đồ chơi trẻ em, sản phẩm mẹ & bé và các dòng đồ chơi giáo dục STEM.
Studio vận hành theo mô hình phân tầng:
- **Ban Điều Phối:** `agency-agents-orchestrator`, `agency-studio-producer`, `agency-project-shepherd`.
- **Phòng Marketing & Clip AI (Trưởng phòng: Studio Producer):** 17 Agents sáng tạo hình ảnh, kịch bản, âm thanh và phân phối.
- **Phòng Sales & Tăng Trưởng (Trưởng phòng: Deal Strategist):** 9 Agents tiếp cận khách hàng B2B, khảo sát nhu cầu, báo giá và chăm sóc sau bán.
- **Phòng Công Nghệ & Hạ Tầng IT (Trưởng phòng: Software Architect):** 20 Agents phụ trách nền tảng, công cụ nội bộ, bảo mật và kiểm định.

## 2. Quy Tắc Bắt Buộc Khi Vận Hành

### Cổng An Toàn Trẻ Em (Child Safety Gatekeeper)
- Mọi kịch bản, tạo hình nhân vật và clip hoàn chỉnh **bắt buộc phải được `agency-legal-compliance-checker` phê duyệt** trước khi bàn giao hoặc xuất bản.
- Tuyệt đối tuân thủ tiêu chuẩn an toàn quảng cáo đồ chơi CARU và Đạo luật COPPA:
  - Không mô tả hành vi nguy hiểm trẻ nhỏ có thể bắt chước.
  - Phải có phụ đề khuyến cáo nếu sản phẩm chứa pin hoặc chi tiết nhỏ đối với trẻ dưới 3 tuổi.
  - Không phóng đại tính năng cơ học của đồ chơi gây hiểu nhầm.

### Nguyên Tắc Bảo Mật & Thông Tin Nhạy Cảm
- Không hardcode API key, token thanh toán hay dữ liệu cá nhân của đối tác vào kho lưu trữ code.
- Mọi bí mật môi trường phải được cấu hình qua biến môi trường an toàn.

### Nguyên Tắc Triệu Tập Agent (Agent On-Demand)
- Chỉ gọi đúng các agent có vai trò trực tiếp trong tác vụ đang xử lý để giữ sự tập trung và độ sâu của ngữ cảnh.

