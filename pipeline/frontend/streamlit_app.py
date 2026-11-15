"""
Streamlit Frontend: End-to-End AI Video Generation Studio
Giao diện trực quan hiển thị tiến trình 5 bước theo thời gian thực (Real-time Stepper).
"""
import json
import time
from pathlib import Path
import httpx
import streamlit as st

# Cấu hình trang giao diện
st.set_page_config(
    page_title="Lumina AI Video Pipeline",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Tùy biến giao diện CSS phong cách Studio hiện đại (Dark Theme)
st.markdown("""
<style>
    /* Dark Theme Studio Styling */
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    
    .main-header {
        text-align: center;
        padding: 1.5rem 0 1rem 0;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
        border-radius: 16px;
        margin-bottom: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    
    .badge-pill {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
        background: rgba(99, 102, 241, 0.2);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.4);
        margin-bottom: 0.5rem;
    }
    
    .step-box {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        transition: all 0.2s ease;
    }
    
    .step-active {
        border-color: #6366f1;
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }
    
    .scene-card {
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
    }
    
    .scene-title {
        color: #38bdf8;
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 4px;
    }
    
    .prompt-text {
        font-family: monospace;
        font-size: 0.82rem;
        color: #94a3b8;
        background: #0f172a;
        padding: 8px;
        border-radius: 6px;
        border-left: 3px solid #6366f1;
        margin-top: 4px;
    }
    
    .voice-text {
        font-size: 0.9rem;
        color: #e2e8f0;
        margin-top: 6px;
    }
</style>
""", unsafe_allow_html=True)

# URL kết nối tới FastAPI Backend
BACKEND_URL = "http://127.0.0.1:8000"

# Sidebar: Cài đặt & Cấu hình Pipeline
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80", use_container_width=True)
    st.markdown("### ⚙️ Cấu Hình Pipeline AI")
    
    style_option = st.selectbox(
        "1. Phong cách hình ảnh (Style Preset)",
        options=[
            ("brick-toy", "🧱 Đồ chơi xếp hình (Brick-Toy)"),
            ("3d-pixar", "✨ Hoạt hình 3D Pixar / Disney"),
            ("anime", "🌸 Hoạt họa Anime Makoto Shinkai"),
            ("claymation", "🎨 Đất nặn thủ công (Claymation)"),
            ("2d-cartoon", "🖍️ Hoạt hình 2D Hiện đại"),
            ("chibi", "🧸 Dễ thương Chibi Kawaii")
        ],
        format_func=lambda x: x[1]
    )[0]

    scene_count = st.slider("2. Số lượng phân cảnh (Scenes)", min_value=2, max_value=6, value=4)
    
    voice_option = st.selectbox(
        "3. Giọng đọc thuyết minh (TTS)",
        options=[
            ("vi-VN-HoaiMyNeural", "Giọng Nữ truyền cảm (Hoài My AI)"),
            ("vi-VN-NamMinhNeural", "Giọng Nam mạnh mẽ (Nam Minh AI)")
        ],
        format_func=lambda x: x[1]
    )[0]
    
    col_bgm, col_sub = st.columns(2)
    with col_bgm:
        enable_bgm = st.checkbox("Nhạc nền (BGM)", value=True)
    with col_sub:
        enable_sub = st.checkbox("Phụ đề đốt cứng", value=True)
        
    st.markdown("---")
    st.markdown("### 🔑 API Keys (Tùy chọn)")
    api_key_input = st.text_input(
        "Gemini API Key",
        type="password",
        placeholder="AIzaSy...",
        help="Để trống sẽ dùng key từ file .env hoặc chế độ thông minh dự phòng"
    )
    st.caption("💡 Đăng ký key miễn phí tại [Google AI Studio](https://aistudio.google.com/)")

# Main Header
st.markdown("""
<div class="main-header">
    <div class="badge-pill">END-TO-END AI VIDEO PIPELINE 2.0</div>
    <h1 style="margin: 0; font-size: 2.2rem; font-weight: 800; color: #ffffff;">🎬 Lumina Video Generation Studio</h1>
    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 1rem;">
        Hệ thống tự động hóa hoàn chỉnh 5 bước: Ý tưởng ➔ Kịch bản Gemini ➔ Tạo hình ảnh ➔ Render chuyển động ➔ Ghép nối MP4
    </p>
</div>
""", unsafe_allow_html=True)

# Khởi tạo Session State
if "task_id" not in st.session_state:
    st.session_state.task_id = None
if "task_data" not in st.session_state:
    st.session_state.task_data = None
if "is_generating" not in st.session_state:
    st.session_state.is_generating = False

# ==============================================================================
# BƯỚC 1: INPUT Ý TƯỞNG TỪ NGƯỜI DÙNG
# ==============================================================================
st.markdown("### 📝 Bước 1: Nhập ý tưởng hoặc chủ đề video")

sample_ideas = [
    "Cậu bé 7 tuổi tự tay lắp ráp robot biến hình cứu hộ thành phố",
    "Cuộc phiêu lưu thần tốc của siêu xe đồ chơi mini trong phòng ngủ",
    "Búp bê công chúa phép thuật giải cứu vương quốc bánh kẹo kỳ diệu",
    "Khủng long Lego ngộ nghĩnh đi tìm quả trứng khổng lồ bị thất lạc"
]

selected_sample = st.selectbox("💡 Hoặc chọn nhanh một chủ đề mẫu:", ["-- Tự nhập ý tưởng của bạn --"] + sample_ideas)

default_text = "" if selected_sample == "-- Tự nhập ý tưởng của bạn --" else selected_sample
user_topic = st.text_area(
    "Mô tả ý tưởng video bạn muốn sản xuất:",
    value=default_text,
    height=80,
    placeholder="Ví dụ: Giới thiệu bộ xếp hình xe đua không gian tốc độ cao dành cho bé từ 6 tuổi trở lên..."
)

btn_generate = st.button("🚀 BẮT ĐẦU TẠO VIDEO AI HOÀN CHỈNH", type="primary", use_container_width=True)

if btn_generate:
    if not user_topic.strip():
        st.warning("⚠️ Vui lòng nhập chủ đề video trước khi bắt đầu!")
    else:
        st.session_state.is_generating = True
        st.session_state.task_data = None
        
        # Gửi request sang FastAPI Backend
        payload = {
            "topic": user_topic.strip(),
            "style": style_option,
            "scene_count": scene_count,
            "tts_voice": voice_option,
            "enable_bgm": enable_bgm,
            "enable_subtitles": enable_sub,
            "gemini_api_key": api_key_input.strip() if api_key_input.strip() else None
        }
        
        try:
            with st.spinner("Đang kết nối tới Backend Pipeline..."):
                res = httpx.post(f"{BACKEND_URL}/api/generate", json=payload, timeout=10.0)
                if res.status_code == 200:
                    task_info = res.json()
                    st.session_state.task_id = task_info["task_id"]
                    st.success(f"Khởi tạo tác vụ thành công! Task ID: `{st.session_state.task_id}`")
                else:
                    st.error(f"Lỗi khởi tạo: {res.text}")
                    st.session_state.is_generating = False
        except Exception as e:
            st.error(f"Không thể kết nối tới FastAPI Backend tại {BACKEND_URL}. Hãy chắc chắn bạn đã khởi chạy `python pipeline/run_backend.py`. Chi tiết lỗi: {e}")
            st.session_state.is_generating = False

# ==============================================================================
# THEO DÕI TIẾN TRÌNH & HIỂN THỊ KẾT QUẢ TỪNG BƯỚC
# ==============================================================================
if st.session_state.task_id:
    task_id = st.session_state.task_id
    st.markdown("---")
    
    # Khu vực hiển thị Stepper Progress
    status_container = st.empty()
    details_container = st.empty()
    
    # Polling trạng thái từ backend cho đến khi hoàn thành
    if st.session_state.is_generating:
        progress_bar = st.progress(0)
        
        while st.session_state.is_generating:
            try:
                res = httpx.get(f"{BACKEND_URL}/api/status/{task_id}", timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    st.session_state.task_data = data
                    
                    pct = data.get("progress", 0)
                    step_name = data.get("step_name", "")
                    details = data.get("details", "")
                    
                    progress_bar.progress(pct)
                    status_container.info(f"⏳ **Tiến trình:** {pct}% - **{step_name}**")
                    details_container.caption(f"📌 {details}")
                    
                    if data.get("completed") or data.get("error"):
                        st.session_state.is_generating = False
                        break
                time.sleep(1.2)
            except Exception as e:
                time.sleep(2.0)

    # Hiển thị kết quả chi tiết sau khi có dữ liệu
    data = st.session_state.task_data
    if data:
        if data.get("error"):
            st.error(f"❌ Xảy ra lỗi trong quá trình xử lý: {data.get('error')}")
        
        script = data.get("script")
        scenes = data.get("scenes", [])
        
        # ----------------------------------------------------------------------
        # BƯỚC 2: HIỂN THỊ KỊCH BẢN PHÂN ĐOẠN (SCRIPT & PROMPT & VOICEOVER)
        # ----------------------------------------------------------------------
        if script:
            st.markdown(f"### 📋 Bước 2: Kịch Bản Phân Đoạn Điện Ảnh - *{script.get('title')}*")
            st.caption(f"Phong cách: **{script.get('style')}** | Khán giả mục tiêu: **{script.get('target_audience')}** | Thời lượng: **{script.get('total_duration')}s**")
            
            with st.expander("🔍 Xem chi tiết kịch bản phân đoạn JSON", expanded=True):
                for scene in scenes:
                    st.markdown(f"""
                    <div class="scene-card">
                        <div class="scene-title">🎬 Cảnh {scene.get('scene_number')}: {scene.get('title', 'Phân cảnh')} ({scene.get('duration_seconds')}s - {scene.get('camera_motion')})</div>
                        <div style="font-size: 0.85rem; color: #cbd5e1;"><b>Lời thoại (Voiceover):</b> "{scene.get('voiceover')}"</div>
                        <div class="prompt-text"><b>Visual Prompt (EN):</b> {scene.get('visual_prompt')}</div>
                    </div>
                    """, unsafe_allow_html=True)

        # ----------------------------------------------------------------------
        # BƯỚC 3: HIỂN THỊ HÌNH ẢNH CỦA TỪNG PHÂN CẢNH
        # ----------------------------------------------------------------------
        valid_images = [s for s in scenes if s.get("image_path")]
        if valid_images:
            st.markdown("### 🎨 Bước 3: Hình Ảnh AI Từng Phân Cảnh")
            img_cols = st.columns(min(len(valid_images), 4))
            for i, scene in enumerate(valid_images):
                col_idx = i % 4
                with img_cols[col_idx]:
                    img_path = scene.get("image_path")
                    if img_path and Path(img_path).exists():
                        st.image(img_path, caption=f"Cảnh {scene.get('scene_number')}: {scene.get('title')}", use_container_width=True)

        # ----------------------------------------------------------------------
        # BƯỚC 4: HIỂN THỊ CÁC ĐOẠN CLIP CHUYỂN ĐỘNG NGẮN
        # ----------------------------------------------------------------------
        valid_clips = [s for s in scenes if s.get("video_clip_path")]
        if valid_clips:
            with st.expander("🎬 Bước 4: Xem trước từng đoạn clip chuyển động riêng lẻ", expanded=False):
                clip_cols = st.columns(min(len(valid_clips), 3))
                for i, scene in enumerate(valid_clips):
                    with clip_cols[i % 3]:
                        clip_p = scene.get("video_clip_path")
                        if clip_p and Path(clip_p).exists():
                            st.video(clip_p)
                            st.caption(f"Cảnh {scene.get('scene_number')} ({scene.get('camera_motion')})")

        # ----------------------------------------------------------------------
        # BƯỚC 5: XUẤT BẢN & PHÁT VIDEO HOÀN CHỈNH (CÓ NÚT TẢI VỀ)
        # ----------------------------------------------------------------------
        if data.get("completed"):
            final_p = data.get("final_video_path")
            st.markdown("---")
            st.markdown("### 🏆 Bước 5: Video Hoàn Chỉnh (Assembly & Export)")
            
            col_vid, col_action = st.columns([2, 1])
            with col_vid:
                if final_p and Path(final_p).exists():
                    st.video(final_p)
                else:
                    st.warning("Đang tải video hoàn chỉnh...")
                    
            with col_action:
                st.markdown("#### 🎉 Xuất bản thành công!")
                st.write("Video đã được ghép nối hoàn chỉnh gồm:")
                st.markdown("- ✅ Chuyển động camera mượt mà chuẩn 30fps")
                st.markdown("- ✅ Thuyết minh giọng đọc tiếng Việt truyền cảm")
                st.markdown("- ✅ Phụ đề đốt cứng đồng bộ")
                st.markdown("- ✅ Hòa âm nhạc nền (BGM) với ducking")
                
                if final_p and Path(final_p).exists():
                    video_bytes = Path(final_p).read_bytes()
                    st.download_button(
                        label="⬇️ TẢI VIDEO MP4 HOÀN CHỈNH",
                        data=video_bytes,
                        file_name=f"Lumina_Video_{task_id}.mp4",
                        mime="video/mp4",
                        type="primary",
                        use_container_width=True
                    )
                    
                    st.caption(f"Dung lượng: {len(video_bytes) / (1024*1024):.2f} MB | Định dạng: MP4 (H.264 + AAC)")
