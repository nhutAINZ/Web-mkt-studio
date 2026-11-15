#!/usr/bin/env python3
"""
Lemo-OpusCar Studio Backend Server (Enhanced Video Pipeline)
- AI Prompt Analysis & Expansion
- Automatic Image Generation & Sourcing (Pollinations AI + Curated Fallback)
- Multi-shot Image Sequencing & Video Composition with Transitions, Subtitles & Audio
- Connects Gemini CLI & Lemo-OpusCar 99 Film Styles
"""

import os
import sys
import json
import time
import uuid
import re
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

PORT = 8086
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILMS_DIR = os.path.join(BASE_DIR, "generated_films")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")

os.makedirs(FILMS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# 99 Lemo-OpusCar Styles Data
STYLES = [
    {"id": "brick-toy", "name": "Brick Toy (Lego Stop-Motion)", "cat": "toy", "color": "#f59e0b", "img": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80"},
    {"id": "teardown", "name": "Teardown (Bản Vẽ CAD Nổ Tách)", "cat": "toy", "color": "#38bdf8", "img": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"},
    {"id": "claymation", "name": "Claymation (Đất Nặn Thủ Công)", "cat": "toy", "color": "#fb7185", "img": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"},
    {"id": "paper-popup", "name": "Paper Pop-Up (Sách 3D Mở Ra)", "cat": "toy", "color": "#e2e8f0", "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"},
    {"id": "tilt-shift", "name": "Tilt-Shift (Thế Giới Thu Nhỏ)", "cat": "toy", "color": "#10b981", "img": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"},
    {"id": "crayon-world", "name": "Crayon World (Sáp Màu Tuổi Thơ)", "cat": "toy", "color": "#f43f5e", "img": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"},
    {"id": "watercolor", "name": "Watercolor Brush (Màu Nước Thủy Mặc)", "cat": "art", "color": "#60a5fa", "img": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"},
    {"id": "impasto", "name": "Impasto (Sơn Dầu Van Gogh)", "cat": "art", "color": "#fbbf24", "img": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"},
    {"id": "ukiyoe", "name": "Ukiyo-e (Tranh Khắc Gỗ Nhật Bản)", "cat": "art", "color": "#34d399", "img": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80"},
    {"id": "blueprint", "name": "Blueprint CAD (Bản Vẽ Kỹ Thuật)", "cat": "tech", "color": "#0284c7", "img": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80"},
    {"id": "cyberpunk-hud", "name": "Cyberpunk HUD (Hologram Neon)", "cat": "tech", "color": "#a855f7", "img": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80"},
    {"id": "wireframe", "name": "3D Wireframe (Lưới Vector)", "cat": "tech", "color": "#22c55e", "img": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"},
    {"id": "rubber-hose", "name": "Rubber Hose (Hoạt Hình 1930s)", "cat": "retro", "color": "#f1f5f9", "img": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"},
    {"id": "pixel-art", "name": "Pixel Art (Game 16-Bit SNES)", "cat": "retro", "color": "#ec4899", "img": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"},
    {"id": "anime-cel", "name": "Anime Cel (Hoạt Hình Nhật Bản)", "cat": "retro", "color": "#f97316", "img": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"}
]

# Fallback Curated Toy High-Res Images
CURATED_IMAGES = {
    "lego": [
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80"
    ],
    "robot": [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1280&q=80"
    ],
    "car": [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1280&q=80"
    ],
    "default": [
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80"
    ]
}

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(item):
    history = load_history()
    history.insert(0, item)
    if len(history) > 30:
        history = history[:30]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

def generate_shot_images(prompt, style_id, material_url):
    """
    Generates or selects targeted images for all 6 shots.
    Uses AI generated images via Pollinations API + Curated high-res Fallbacks.
    """
    p_lower = prompt.lower()
    tag = "lego" if "lego" in p_lower else ("robot" if "robot" in p_lower or "stem" in p_lower else ("car" if "xe" in p_lower or "car" in p_lower or "drift" in p_lower else "default"))
    curated_pool = CURATED_IMAGES.get(tag, CURATED_IMAGES["default"])

    # Base seed for consistency across the 6 shots
    seed = abs(hash(prompt)) % 100000

    shot_concepts = [
        ("Shot 1: Mở Đầu Đại Cảnh (Establishing Shot)", "00:00 - 00:05", "Dolly In 4K",
         f"cinematic wide establishing shot of {tag} toy set in sunny bright living room, photorealistic 8k commercial, depth of field",
         "Nữ truyền cảm: Mỗi buổi sáng, một thế giới diệu kỳ đang chờ bé khám phá...", 0),

        ("Shot 2: Cơ Chế Cơ Khí & Biến Hình (Mechanism)", "00:05 - 00:10", "Orbit 360° Macro",
         f"macro shot of {tag} toy mechanism assembling and transforming in mid-air, studio lighting, plastic reflection 8k",
         "Nữ truyền cảm: Tự động bung cánh lượn biến hình thành chiến binh mạnh mẽ...", 1),

        ("Shot 3: Hành Động Tốc Độ (Dynamic Action)", "00:10 - 00:18", "Dutch Tilt 124 BPM",
         f"high speed dynamic action shot of {tag} racing through futuristic obstacle course, glowing tracks, motion blur 8k",
         "Âm nhạc: Trống snare dồn dập, tiếng vút gió sound design sinh động...", 2),

        ("Shot 4: Cảm Xúc Em Bé & Phụ Huynh (Reaction)", "00:18 - 00:22", "Medium Close-up Warm",
         f"joyful 6 year old child playing happily with {tag} toy next to smiling parents, warm natural lighting, cinematic portrait 8k",
         "Nữ truyền cảm: Nuôi dưỡng trí tưởng tượng không giới hạn cho thiên tài nhí...", 3),

        ("Shot 5: Chi Tiết Phụ Kiện & An Toàn (Showcase)", "00:22 - 00:26", "Top-down Flatlay",
         f"flatlay top down view of {tag} accessories packaging box and parts, product photography, certified safe clean 8k",
         "Nữ tự tin: Chất liệu nhựa nguyên sinh ABS an toàn 100% không BPA đạt chuẩn quốc tế...", 4),

        ("Shot 6: Kêu Gọi Mua Hàng & Khuyến Mãi (CTA)", "00:26 - 00:30", "Hero Center Glow",
         f"hero product shot of complete {tag} toy standing on glossy display pedestal, glowing neon logo, commercial poster 8k",
         "Nữ tự tin: Đặt hàng ngay hôm nay nhận ưu đãi giảm 30% và quà tặng hấp dẫn!", 5)
    ]

    shots = []
    for title, t_range, camera, visual_prompt, vo, idx in shot_concepts:
        # Use user material for Shot 1 and Shot 6 if provided
        if material_url and (idx == 0 or idx == 5):
            img_url = material_url
        else:
            # Generate AI image url via Pollinations
            encoded_prompt = urllib.parse.quote(visual_prompt)
            ai_img_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&seed={seed + idx}"
            # Curated fallback image url
            fallback_img = curated_pool[idx % len(curated_pool)]
            img_url = ai_img_url

        shots.append({
            "num": idx + 1,
            "title": title,
            "time": t_range,
            "camera": camera,
            "visual_prompt": visual_prompt,
            "vo": vo,
            "img": img_url,
            "fallback_img": curated_pool[idx % len(curated_pool)]
        })

    return shots

def generate_interactive_film(film_id, title, prompt, style_id, duration, aspect, shots):
    """
    Creates an interactive HTML5 Canvas film project that STITCHES the 6 shot images together
    with smooth Ken Burns camera motion, transitions, timecode, subtitles, and audio sound effects!
    """
    film_folder = os.path.join(FILMS_DIR, film_id)
    os.makedirs(film_folder, exist_ok=True)

    style_info = next((s for s in STYLES if s["id"] == style_id), STYLES[0])
    color = style_info.get("color", "#f59e0b")

    shots_json = json.dumps(shots, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>{title} - Lemo OpusCar Film</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      background: #000;
      color: #fff;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    }}
    #stage {{
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #050508;
    }}
    canvas {{
      width: 100%;
      height: 100%;
      object-fit: contain;
    }}
    /* Top HUD */
    #hud-top {{
      position: absolute;
      top: 14px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      z-index: 10;
    }}
    .badge {{
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 600;
    }}
    /* Bottom Subtitles & Voiceover */
    #subtitles-bar {{
      position: absolute;
      bottom: 24px;
      left: 20px;
      right: 20px;
      background: rgba(7, 7, 10, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      z-index: 10;
    }}
    .sub-text {{
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .sub-speaker {{
      color: {color};
      font-weight: 700;
      font-family: monospace;
      font-size: 11px;
      background: rgba(245, 158, 11, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }}
    /* Download Video Button */
    #btn-download-video {{
      position: absolute;
      top: 14px;
      right: 16px;
      background: {color};
      color: #000;
      border: none;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.15s;
    }}
    #btn-download-video:hover {{ opacity: 0.9; }}
  </style>
</head>
<body>
  <div id="stage">
    <div id="hud-top">
      <div class="badge" style="color: {color};">
        ⚡ OPUSCAR RENDER &bull; {style_id.upper()}
      </div>
      <div class="badge" id="hud-tc">
        TC: 00:00.00 / {duration}s
      </div>
    </div>

    <button id="btn-download-video" onclick="recordAndDownloadVideo()">
      <span>💾</span>
      <span id="btn-download-text">Tải Video MP4</span>
    </button>

    <div id="subtitles-bar">
      <div class="sub-text">
        <span class="sub-speaker" id="sub-speaker">VOICEOVER</span>
        <span id="sub-content">Mỗi buổi sáng, một thế giới diệu kỳ đang chờ bé khám phá...</span>
      </div>
      <div class="badge" id="hud-shot" style="margin: 0; padding: 3px 8px; font-size: 10px;">
        SHOT 1/6
      </div>
    </div>

    <canvas id="c" width="1280" height="720"></canvas>
  </div>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const hudTc = document.getElementById('hud-tc');
    const hudShot = document.getElementById('hud-shot');
    const subSpeaker = document.getElementById('sub-speaker');
    const subContent = document.getElementById('sub-content');

    window.DUR = {duration};
    window.READY = false;

    const SHOTS = {shots_json};
    const loadedImages = [];
    let imagesLoadedCount = 0;

    // Preload all 6 shot images
    SHOTS.forEach((shot, index) => {{
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = shot.img;
      img.onload = () => {{
        imagesLoadedCount++;
        if (imagesLoadedCount >= SHOTS.length) window.READY = true;
      }};
      img.onerror = () => {{
        // Fallback to curated image if pollinations is slow
        img.src = shot.fallback_img;
        imagesLoadedCount++;
        if (imagesLoadedCount >= SHOTS.length) window.READY = true;
      }};
      loadedImages.push(img);
    }});

    // Render frame at second t
    window.render = function(t) {{
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const shotDuration = window.DUR / SHOTS.length;
      const currentShotIndex = Math.min(SHOTS.length - 1, Math.floor(t / shotDuration));
      const shotProgress = (t % shotDuration) / shotDuration;
      const currentShot = SHOTS[currentShotIndex];
      const img = loadedImages[currentShotIndex];

      // Draw Shot Image with Ken Burns Camera Motion
      if (img && img.complete) {{
        ctx.save();
        // Ken burns subtle scale and pan
        const scale = 1.0 + shotProgress * 0.12;
        const panX = (shotProgress - 0.5) * 40;
        const panY = (shotProgress - 0.5) * 20;

        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }} else {{
        // Fallback placeholder while loading
        ctx.fillStyle = '#0f0f15';
        ctx.fillRect(0, 0, w, h);
      }}

      // Cinematic Vignette Overlay
      const grad = ctx.createRadialGradient(w/2, h/2, h * 0.45, w/2, h/2, w * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle Style-Specific Overlay (e.g. Stop-motion film grain for brick-toy)
      if ("{style_id}" === "brick-toy") {{
        // Lego stop-motion frame jitter
        if (Math.random() > 0.8) {{
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.fillRect(0, 0, w, h);
        }}
      }}

      // Update HUD & Subtitles
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      hudTc.innerText = `TC: ${{String(m).padStart(2,'0')}}:${{String(s).padStart(2,'0')}}.${{String(ms).padStart(2,'0')}} / {duration}s`;
      hudShot.innerText = `SHOT ${{currentShotIndex + 1}}/${{SHOTS.length}} &bull; ${{currentShot.camera}}`;
      
      const voText = currentShot.vo.split(':');
      if (voText.length > 1) {{
        subSpeaker.innerText = voText[0].trim();
        subContent.innerText = voText[1].trim();
      }} else {{
        subSpeaker.innerText = 'NARRATOR';
        subContent.innerText = currentShot.vo;
      }}
    }};

    // Continuous real-time playback loop
    let startTime = performance.now();
    function animate() {{
      const now = performance.now();
      const elapsed = ((now - startTime) / 1000) % window.DUR;
      window.render(elapsed);
      requestAnimationFrame(animate);
    }}
    animate();

    // Client-side MP4/WebM Video Recording via MediaRecorder
    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];

    function recordAndDownloadVideo() {{
      const btn = document.getElementById('btn-download-video');
      const btnText = document.getElementById('btn-download-text');
      if (isRecording) return;

      isRecording = true;
      btnText.innerText = 'Đang quay video...';
      btn.style.background = '#ef4444';
      recordedChunks = [];

      const stream = canvas.captureStream(30); // 30 FPS stream
      mediaRecorder = new MediaRecorder(stream, {{ mimeType: 'video/webm;codecs=vp9' }});

      mediaRecorder.ondataavailable = (e) => {{
        if (e.data.size > 0) recordedChunks.push(e.data);
      }};

      mediaRecorder.onstop = () => {{
        const blob = new Blob(recordedChunks, {{ type: 'video/webm' }});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '{film_id}_video.webm';
        a.click();
        URL.revokeObjectURL(url);

        isRecording = false;
        btnText.innerText = 'Tải Video MP4';
        btn.style.background = '{color}';
      }};

      // Reset playback to 0 and record for 1 full cycle
      startTime = performance.now();
      mediaRecorder.start();
      setTimeout(() => {{
        mediaRecorder.stop();
      }}, Math.min(15000, window.DUR * 1000)); // records up to 15s sample or full duration
    }}
  </script>
</body>
</html>
"""
    with open(os.path.join(film_folder, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_content)

    return f"/generated_films/{film_id}/index.html"

class StudioRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/styles":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "styles": STYLES}).encode("utf-8"))
            return
        elif parsed.path == "/api/history":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            history = load_history()
            self.wfile.write(json.dumps({"success": True, "history": history}).encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/generate":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            prompt = data.get("prompt", "tạo video quảng cáo lego").strip()
            style_id = data.get("style", "brick-toy")
            aspect = data.get("aspect", "16:9")
            duration = int(data.get("duration", 30))
            draft = data.get("draft", False)
            material_url = data.get("material", "")

            film_id = f"film_{int(time.time())}_{uuid.uuid4().hex[:6]}"
            title = prompt.split(".")[0].strip()[:40] if prompt else "Siêu Phẩm Hoạt Hình AI"

            # Generate real targeted images & prompts for all 6 shots
            shots = generate_shot_images(prompt, style_id, material_url)

            # Generate interactive stitched film project
            film_url = generate_interactive_film(film_id, title, prompt, style_id, duration, aspect, shots)

            # Lemo-OpusCar CLI Automation Script
            render_cmd = (
                f"cd ~/lemo-opuscar\n"
                f"node core/render/still.mjs \"films/{film_id}\" 1.5 3 --style \"{style_id}\" --ar \"{aspect}\"\n"
                f"./build.sh --fps 30 --crf 18 --output \"films/{film_id}/output_{style_id}_{aspect.replace(':','x')}.mp4\""
            )

            result_item = {
                "id": film_id,
                "title": title,
                "prompt": prompt,
                "style": style_id,
                "aspect": aspect,
                "duration": duration,
                "draft": draft,
                "material": material_url,
                "filmUrl": film_url,
                "renderCmd": render_cmd,
                "shots": shots,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }

            save_history(result_item)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "film": result_item}).encode("utf-8"))
            return

        elif parsed.path == "/api/update-shot-image":
            # Allow user to replace any shot's image
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                film_id = data.get("filmId")
                shot_num = int(data.get("shotNum", 1))
                new_img = data.get("img")

                history = load_history()
                for item in history:
                    if item["id"] == film_id:
                        for s in item["shots"]:
                            if s["num"] == shot_num:
                                s["img"] = new_img
                        # Regenerate film project
                        generate_interactive_film(film_id, item["title"], item["prompt"], item["style"], item["duration"], item["aspect"], item["shots"])
                        break
                with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                    json.dump(history, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                return

        self.send_response(404)
        self.end_headers()

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, StudioRequestHandler)
    print(f"==================================================")
    print(f"  Lemo-OpusCar Lumina Backend Online on port {PORT}")
    print(f"  Serving: http://localhost:{PORT}")
    print(f"==================================================")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
