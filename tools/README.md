# THƯ MỤC CÔNG CỤ NỘI BỘ STUDIO (INTERNAL TOOLS)

Thư mục này chứa toàn bộ mã nguồn các công cụ, dashboard và phần mềm tự động hóa nội bộ do **Phòng Công nghệ & Hạ tầng (IT)** phát triển nhằm phục vụ cho **Phòng Marketing & Clip AI** và **Phòng Sales**.

## Nguyên tắc Phát triển Công cụ Nội bộ
1. **Phục vụ Thực tế:** Mọi tool xây dựng đều phải giải quyết điểm nghẽn thực sự của Marketing hoặc Sales theo quy trình `build-tool.md`.
2. **Giao diện Trực quan:** Thiết kế UI/UX tiếng Việt rõ ràng, responsive, thân thiện với người dùng sáng tạo và kinh doanh.
3. **An toàn Tuyệt đối:** Không hardcode API key, tuân thủ kiểm định bảo mật của `agency-ai-generated-code-security-auditor` và đánh giá của `agency-reality-checker`.
4. **Tài liệu Đi kèm:** Mỗi thư mục con của một tool phải có file `README.md` hướng dẫn cách cài đặt và sử dụng cụ thể do `agency-technical-writer` biên soạn.

