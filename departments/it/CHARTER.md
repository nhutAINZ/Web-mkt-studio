# ĐIỀU LỆ HOẠT ĐỘNG PHÒNG CÔNG NGHỆ & HẠ TẦNG IT (CHARTER)

## 1. Mục tiêu (Department Mission)
Đóng vai trò là **Bộ phận Dịch vụ & Nền tảng Kỹ thuật Nội bộ (Internal Service & Tech Enabler)**. Nhiệm vụ tối thượng của phòng IT là:
1. Phục vụ và giải quyết mọi nhu cầu công nghệ, tự động hóa và tối ưu pipeline sản xuất cho phòng **Marketing & Clip AI**.
2. Phục vụ hệ thống quản lý dữ liệu, báo giá tự động và CRM bán hàng cho phòng **Sales**.
3. Bảo vệ an toàn dữ liệu, kiểm soát chi phí điện toán đám mây/API token và đảm bảo hệ thống vận hành liên tục 24/7.

---

## 2. Nhân sự AI Agent (20 Thành viên)
- **Trưởng phòng:** **Software Architect** (`agency-software-architect`) - Định hướng kiến trúc phần mềm, chuẩn mực công nghệ và quản trị hạ tầng.
- **Phát triển Ứng dụng & Nền tảng:**
  - `agency-frontend-developer`: Lập trình giao diện ứng dụng web nội bộ (UI tiếng Việt thân thiện, responsive).
  - `agency-backend-architect`: Thiết kế API, cơ sở dữ liệu và kiến trúc microservices.
  - `agency-rapid-prototyper`: Dựng nhanh các bản Proof of Concept (PoC)/MVP để thử nghiệm ý tưởng.
- **Thiết kế Trải nghiệm & Quy trình:**
  - `agency-ui-designer`: Xây dựng hệ thống giao diện, design system và icon đồ họa.
  - `agency-ux-architect`: Tối ưu kiến trúc trải nghiệm và dòng chảy thao tác của người dùng.
  - `agency-ux-researcher`: Phỏng vấn, khảo sát khó khăn của đội Marketing/Sales khi sử dụng công cụ.
  - `agency-workflow-architect`: Thiết kế luồng phối hợp tự động giữa các agent và API bên ngoài.
- **Kỹ thuật Chuyên sâu về AI & Truyền thông:**
  - `agency-ai-engineer`: Tích hợp các model AI tạo ảnh/video, quản lý fine-tuning và tối ưu hóa context prompt.
  - `agency-video-streaming-engineer`: Xây dựng giải pháp stream video preview tức thì, nén codec và phát trực tuyến.
  - `agency-data-visualization-engineer`: Xây dựng dashboard trực quan hóa chi phí AI, tiến độ dự án và KPI.
  - `agency-mcp-builder`: Xây dựng các Model Context Protocol (MCP) server kết nối AI với kho dữ liệu studio.
  - `agency-automation-governance-architect`: Quản trị rủi ro, chi phí và tính bền vững của các kịch bản tự động hóa.
- **Vận hành & Tài liệu Kỹ thuật:**
  - `agency-devops-automator`: Tự động hóa CI/CD, đóng gói Docker và giám sát môi trường chạy.
  - `agency-technical-writer`: Viết tài liệu hướng dẫn sử dụng, API docs và runbook vận hành cho studio.
  - `agency-senior-project-manager`: Lập kế hoạch sprint, quản lý tiến độ bàn giao tool cho 2 phòng ban.
- **Hội đồng Kiểm định & Đảm bảo Chất lượng:**
  - `agency-code-reviewer`: Thẩm định chất lượng code, bảo đảm tính dễ đọc và bảo trì.
  - `agency-ai-generated-code-security-auditor`: Quét lỗ hổng bảo mật, rò rỉ API key và prompt injection.
  - `agency-evidence-collector`: Kiểm thử chức năng, thu thập bằng chứng lỗi trung thực kèm log.
  - `agency-reality-checker`: Đánh giá tính sẵn sàng triển khai (Production Readiness), bác bỏ các phê duyệt hình thức.

---

## 3. Đầu vào (Inputs)
1. Yêu cầu xây dựng công cụ mới hoặc nâng cấp từ Marketing & Sales (Feature requests & Pain points).
2. Dữ liệu tiêu thụ tài nguyên AI (API usage, token consumption, render credits).
3. Báo cáo phản hồi lỗi và khó khăn trong quá trình sản xuất clip hoặc chốt sales.

---

## 4. Đầu ra (Outputs)
1. **Bộ Công cụ Nội bộ (Internal Tools) tại thư mục `tools/`:** 
   - Dashboard theo dõi chi phí AI & tiến độ.
   - Bảng Kanban quản lý sản xuất clip theo cảnh quay.
   - Hệ thống CRM nhẹ và công cụ tạo báo giá tự động cho Sales.
2. **MCP Servers & Integrations:** Các máy chủ MCP kết nối agent với cơ sở dữ liệu nội bộ.
3. **Tài liệu Hướng dẫn:** File `README.md` trong từng thư mục tool do `agency-technical-writer` biên soạn.
4. **Báo cáo Thẩm định Chất lượng:** Biên bản kiểm thử an toàn bảo mật và khả năng vận hành thực tế.

---

## 5. Chỉ số Hiệu quả then chốt (KPIs)
- **Tỷ lệ Hài lòng của Marketing & Sales (Internal CSAT):** $\ge 90\%$.
- **Thời gian Hoàn thành Bản mẫu MVP (MVP Delivery Time):** $\le 48$ giờ kể từ khi chốt luồng quy trình.
- **Độ Ổn định Hệ thống (Uptime của các Tool nội bộ):** $\ge 99.5\%$.
- **Điểm An toàn & Bảo mật (Security & Secret Zero-Leak):** $100\%$ không để lọt API key hay lỗ hổng bảo mật nghiêm trọng.

