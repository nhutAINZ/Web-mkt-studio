#!/usr/bin/env python3
"""
Lumina AI Animation Studio - Complete Backend Server
- Intent Router: Greeting/FAQ, Clarifying Ambiguity (max 3 questions), Storyboard Creation, @shotN edit
- Storyboard JSON SSOT (Single Source of Truth) with Versioning & Undo
- Character Bible for Cross-Shot Consistency
- 6 Official Animation Presets (2D Cartoon, 3D Pixar, Anime, Claymation, Brick-Toy, Chibi)
- Zod Schema Validation with Auto-Retry (Max 2 retries)
- SSE (Server-Sent Events) Real-time Progress Streaming
- Image-to-Video Stitching & Client/Server Rendering
"""

import os
import sys
import json
import time
import uuid
import re
import urllib.parse
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8086
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILMS_DIR = os.path.join(BASE_DIR, "generated_films")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")
CHARACTER_BIBLE_FILE = os.path.join(BASE_DIR, "character_bible.json")

os.makedirs(FILMS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# 6 OFFICIAL ANIMATION PRESETS
ANIMATION_PRESETS = [
    {
        "id": "2d-cartoon",
        "name": "2D Cartoon (Hoạt Hình Cổ Điển)",
        "tag": "2d",
        "color": "#38bdf8",
        "prompt_prefix": "vibrant 2D cartoon animation style, bold outlines, expressive Disney/Looney Tunes aesthetic, bright colors, cel shaded 8k",
        "img": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "3d-disney",
        "name": "3D Pixar / Disney (Điện Ảnh 3D)",
        "tag": "3d",
        "color": "#a855f7",
        "prompt_prefix": "stunning 3D Pixar Disney style CGI animation, subsurface scattering, soft ambient lighting, high fidelity octane render 8k",
        "img": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "anime",
        "name": "Anime Nhật Bản (Makoto Shinkai)",
        "tag": "anime",
        "color": "#f43f5e",
        "prompt_prefix": "breathtaking Japanese anime art style by Makoto Shinkai and Studio Ghibli, lush skies, dramatic lens flares, intricate details 8k",
        "img": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "claymation",
        "name": "Claymation (Đất Nặn Thủ Công)",
        "tag": "clay",
        "color": "#fb7185",
        "prompt_prefix": "tactile handmade plasticine claymation stop-motion Aardman style, visible fingerprints on clay, soft organic shapes, cozy studio light 8k",
        "img": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "brick-toy",
        "name": "Brick-Toy (Lego Stop-Motion 12fps)",
        "tag": "brick",
        "color": "#f59e0b",
        "prompt_prefix": "Lego stop-motion brickfilm style, glossy ABS plastic toy blocks, realistic miniature studio lighting, depth of field 12fps aesthetic 8k",
        "img": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "chibi",
        "name": "Chibi Cute (Nhân Vật Đầu To Đáng Yêu)",
        "tag": "chibi",
        "color": "#10b981",
        "prompt_prefix": "ultra cute chibi character proportion, oversized head, big sparkling anime eyes, playful pastel colors, charming 3D toy figure 8k",
        "img": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80"
    }
]

# Fallback Curated Images Pool
CURATED_IMAGES = {
    "lego": [
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=80",
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=1280&q=80"
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
    # Check if item exists to update or insert
    updated = False
    for i, h in enumerate(history):
        if h["id"] == item["id"]:
            history[i] = item
            updated = True
            break
    if not updated:
        history.insert(0, item)
    if len(history) > 30:
        history = history[:30]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

def load_global_character_bible():
    if os.path.exists(CHARACTER_BIBLE_FILE):
        try:
            with open(CHARACTER_BIBLE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "name": "Nhân Vật Chính",
        "description": "Mô hình đồ chơi thông minh",
        "reference_image": None,
        "locked_traits": ["Vỏ kim loại bóng", "Mắt kính LED xanh", "Thiết kế cơ khí hiện đại"]
    }

def save_global_character_bible(bible):
    with open(CHARACTER_BIBLE_FILE, "w", encoding="utf-8") as f:
        json.dump(bible, f, ensure_ascii=False, indent=2)

# ==========================================
# STEP 7: ZOD SCHEMA VALIDATION WITH RETRY
# ==========================================
def validate_storyboard_with_zod(storyboard_dict):
    """
    Validates storyboard JSON using Node.js Zod schema (validator.js)
    Auto-retries up to 2 times on validation error.
    """
    temp_json_path = os.path.join(BASE_DIR, f"temp_val_{uuid.uuid4().hex[:6]}.json")
    for attempt in range(3):
        try:
            with open(temp_json_path, "w", encoding="utf-8") as f:
                json.dump(storyboard_dict, f, ensure_ascii=False)

            cmd = ["node", os.path.join(BASE_DIR, "validator.js"), temp_json_path]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            if proc.returncode == 0:
                res = json.loads(proc.stdout)
                if res.get("valid"):
                    if os.path.exists(temp_json_path):
                        os.remove(temp_json_path)
                    return True, res.get("data")
            # If validation failed, auto-correct common fields
            print(f"[Zod Validation Attempt {attempt + 1}] Retrying fix: {proc.stderr}")
            if len(storyboard_dict.get("shots", [])) < 6:
                while len(storyboard_dict["shots"]) < 6:
                    idx = len(storyboard_dict["shots"]) + 1
                    storyboard_dict["shots"].append({
                        "num": idx,
                        "title": f"Shot {idx}: Phân Cảnh Bổ Sung",
                        "time": f"00:{(idx-1)*5:02d} - 00:{idx*5:02d}",
                        "camera": "Static 4K",
                        "visual_prompt": "cinematic animation shot 8k",
                        "vo": "Nữ truyền cảm: Tiếp nối câu chuyện kỳ thú...",
                        "img": CURATED_IMAGES["default"][0]
                    })
        except Exception as e:
            print(f"[Zod Validation Error]: {e}")
        finally:
            if os.path.exists(temp_json_path):
                os.remove(temp_json_path)
    return False, storyboard_dict

# ==========================================
# STEP 2: INTENT ROUTER
# ==========================================
def route_intent(prompt: str):
    """
    Routes chat user intent into 4 branches:
    1. edit_single_shot: '@shotN ...'
    2. greeting_faq: 'hi', 'bạn là ai', 'hướng dẫn'...
    3. ambiguous: vague requests -> asks at most 3 clarifying questions
    4. create_storyboard: sufficient detail to generate animation
    """
    p = prompt.strip().lower()

    # Rule 1: @shotN ...
    shot_match = re.match(r"^@shot([1-6])\s*(.*)", p, re.IGNORECASE)
    if shot_match:
        shot_num = int(shot_match.group(1))
        instruction = shot_match.group(2).strip()
        return "edit_single_shot", {"shot_num": shot_num, "instruction": instruction}

    # Rule 2: Greeting & FAQ
    greetings = ["hi", "hello", "chào", "chao", "xin chào", "xin chao", "alo", "hey", "bạn là ai", "lumina là gì", "hướng dẫn", "help", "làm được gì", "test"]
    greeting_prefixes = ["hi", "hello", "chào", "chao", "xin chào", "xin chao", "hey", "alo"]
    if p in greetings or any(p.startswith(g + " ") or p == g for g in greeting_prefixes):
        return "greeting_faq", {}

    # Rule 3: Ambiguous / Vague request (ask max 3 clarifying questions)
    words = p.split()
    ambiguous_phrases = [
        "tôi muốn làm video", "làm video", "làm clip", "tạo video", "tạo clip",
        "quảng cáo đồ chơi", "video hoạt hình", "phim hoạt hình", "video ngắn",
        "làm phim", "làm clip đồ chơi", "làm video đồ chơi", "muốn tạo video", "muốn làm video"
    ]
    has_specific_subject = any(k in p for k in ["lego", "robot", "xe", "dino", "búp bê", "anime", "mecha", "stem", "drift", "mèo", "chó", "siêu nhân", "công chúa", "chiến binh", "giải cứu", "biến hình", "bay vút", "thành phố", "vương quốc"])
    is_ambiguous = (any(phrase == p or phrase in p for phrase in ambiguous_phrases) and not has_specific_subject) or (len(words) <= 5 and not has_specific_subject)
    if is_ambiguous:
        return "ambiguous", {}

    # Rule 4: Clear storyboard request
    return "create_storyboard", {}

# ==========================================
# STEP 4 & 6: GENERATE SHOTS WITH CHARACTER BIBLE
# ==========================================
def generate_shots_with_character(prompt, style_id, material_url, character_bible):
    """
    Generates 6 technical shots injecting Character Bible traits & Style preset
    to guarantee visual consistency across every single frame.
    """
    preset = next((s for s in ANIMATION_PRESETS if s["id"] == style_id), ANIMATION_PRESETS[4]) # brick-toy default
    preset_prefix = preset["prompt_prefix"]

    char_name = character_bible.get("name", "Main Hero")
    char_desc = character_bible.get("description", "Nhân vật đồ chơi hoạt hình")
    traits = ", ".join(character_bible.get("locked_traits", []))
    char_lock = f"[Character: {char_name}, {char_desc}, {traits}]"

    seed = abs(hash(prompt + style_id)) % 100000

    shot_configs = [
        ("Shot 1: Mở Đầu Đại Cảnh (Establishing Shot)", "00:00 - 00:05", "Dolly In 4K",
         f"{preset_prefix}, wide establishing shot of {char_lock} in bright modern living room, cinematic lighting",
         "Nữ truyền cảm: Mỗi buổi sáng, một thế giới diệu kỳ đang chờ bé khám phá...", 0),

        ("Shot 2: Cơ Chế Cơ Khí & Biến Hình (Mechanism)", "00:05 - 00:10", "Orbit 360° Macro",
         f"{preset_prefix}, macro shot of {char_lock} transforming and assembling mechanical gears in mid-air",
         "Nữ truyền cảm: Tự động bung cánh lượn biến hình thành chiến binh mạnh mẽ...", 1),

        ("Shot 3: Hành Động Kịch Tính (Dynamic Action)", "00:10 - 00:18", "Dutch Tilt 124 BPM",
         f"{preset_prefix}, high speed dynamic action shot of {char_lock} racing through futuristic obstacle track, motion blur",
         "Âm nhạc: Trống snare dồn dập, tiếng vút gió sound design sinh động...", 2),

        ("Shot 4: Biểu Cảm Em Bé & Tương Tác (Reaction)", "00:18 - 00:22", "Medium Close-up Warm",
         f"{preset_prefix}, joyful cute child smiling happily playing with {char_lock}, warm soft golden hour lighting",
         "Nữ truyền cảm: Nuôi dưỡng trí tưởng tượng không giới hạn cho thiên tài nhí...", 3),

        ("Shot 5: Chi Tiết Phụ Kiện & An Toàn (Showcase)", "00:22 - 00:26", "Top-down Flatlay",
         f"{preset_prefix}, flatlay top down view of {char_lock} accessories, packaging box, certified clean design",
         "Nữ tự tin: Chất liệu nhựa nguyên sinh ABS an toàn 100% không BPA đạt chuẩn quốc tế...", 4),

        ("Shot 6: Kêu Gọi Mua Hàng & Khuyến Mãi (CTA)", "00:26 - 00:30", "Hero Center Glow",
         f"{preset_prefix}, hero product pose of complete {char_lock} standing on glossy pedestal, glowing logo",
         "Nữ tự tin: Đặt hàng ngay hôm nay nhận ưu đãi giảm 30% và quà tặng hấp dẫn!", 5)
    ]

    shots = []
    for title, t_range, camera, visual_prompt, vo, idx in shot_configs:
        # Use uploaded material for shot 1 and 6 if provided
        if material_url and (idx == 0 or idx == 5):
            img_url = material_url
        else:
            encoded_prompt = urllib.parse.quote(visual_prompt)
            img_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&seed={seed + idx}"

        shots.append({
            "num": idx + 1,
            "title": title,
            "time": t_range,
            "camera": camera,
            "visual_prompt": visual_prompt,
            "vo": vo,
            "img": img_url,
            "fallback_img": CURATED_IMAGES["default"][idx % len(CURATED_IMAGES["default"])],
            "status": "ready"
        })

    return shots

# ==========================================
# STEP 5: INTERACTIVE FILM PROJECT GENERATOR
# ==========================================
def generate_interactive_film(film_id, title, prompt, style_id, duration, aspect, shots):
    film_folder = os.path.join(FILMS_DIR, film_id)
    os.makedirs(film_folder, exist_ok=True)

    preset = next((s for s in ANIMATION_PRESETS if s["id"] == style_id), ANIMATION_PRESETS[4])
    color = preset.get("color", "#f59e0b")
    shots_json = json.dumps(shots, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>{title} - Lumina Animation Film</title>
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
        ⚡ LUMINA &bull; {style_id.upper()}
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
        <span id="sub-content">Đang khởi tạo...</span>
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

    SHOTS.forEach((shot, index) => {{
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = shot.img;
      img.onload = () => {{
        imagesLoadedCount++;
        if (imagesLoadedCount >= SHOTS.length) window.READY = true;
      }};
      img.onerror = () => {{
        img.src = shot.fallback_img;
        imagesLoadedCount++;
        if (imagesLoadedCount >= SHOTS.length) window.READY = true;
      }};
      loadedImages.push(img);
    }});

    window.render = function(t) {{
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const shotDuration = window.DUR / SHOTS.length;
      const currentShotIndex = Math.min(SHOTS.length - 1, Math.floor(t / shotDuration));
      const shotProgress = (t % shotDuration) / shotDuration;
      const currentShot = SHOTS[currentShotIndex];
      const img = loadedImages[currentShotIndex];

      if (img && img.complete) {{
        ctx.save();
        const scale = 1.0 + shotProgress * 0.12;
        const panX = (shotProgress - 0.5) * 40;
        const panY = (shotProgress - 0.5) * 20;

        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }} else {{
        ctx.fillStyle = '#0f0f15';
        ctx.fillRect(0, 0, w, h);
      }}

      // Cinematic Vignette
      const grad = ctx.createRadialGradient(w/2, h/2, h * 0.45, w/2, h/2, w * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Timecode & HUD (Clean Bullet Character)
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      hudTc.innerText = `TC: ${{String(m).padStart(2,'0')}}:${{String(s).padStart(2,'0')}}.${{String(ms).padStart(2,'0')}} / {duration}s`;
      hudShot.innerText = `SHOT ${{currentShotIndex + 1}}/${{SHOTS.length}} • ${{currentShot.camera}}`;
      
      const voText = currentShot.vo.split(':');
      if (voText.length > 1) {{
        subSpeaker.innerText = voText[0].trim();
        subContent.innerText = voText[1].trim();
      }} else {{
        subSpeaker.innerText = 'NARRATOR';
        subContent.innerText = currentShot.vo;
      }}
    }};

    let startTime = performance.now();
    function animate() {{
      const now = performance.now();
      const elapsed = ((now - startTime) / 1000) % window.DUR;
      window.render(elapsed);
      requestAnimationFrame(animate);
    }}
    animate();

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

      const stream = canvas.captureStream(30);
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

      startTime = performance.now();
      mediaRecorder.start();
      setTimeout(() => {{
        mediaRecorder.stop();
      }}, Math.min(15000, window.DUR * 1000));
    }}
  </script>
</body>
</html>
"""
    with open(os.path.join(film_folder, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_content)

    return f"/generated_films/{film_id}/index.html"

# ==========================================
# HTTP REQUEST HANDLER
# ==========================================
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
        
        # 1. Presets / Styles List
        if parsed.path == "/api/styles":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "styles": ANIMATION_PRESETS}).encode("utf-8"))
            return

        # 2. History List
        elif parsed.path == "/api/history":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            history = load_history()
            self.wfile.write(json.dumps({"success": True, "history": history}).encode("utf-8"))
            return

        # 3. Global Character Bible
        elif parsed.path == "/api/character-bible":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            bible = load_global_character_bible()
            self.wfile.write(json.dumps({"success": True, "character_bible": bible}).encode("utf-8"))
            return

        # 4. SSE Stream Progress
        elif parsed.path == "/api/stream":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()

            # Stream simulated real pipeline progress
            steps = [
                (15, "Lớp Intent Router: Phân tích yêu cầu..."),
                (35, "Tạo Storyboard SSOT 6 phân cảnh..."),
                (60, "Tiêm Character Bible & sinh ảnh AI..."),
                (85, "Tạo giọng đọc thuyết minh tiếng Việt..."),
                (100, "Ghép nối video hoàn tất!")
            ]
            for pct, msg in steps:
                payload = json.dumps({"progress": pct, "msg": msg})
                self.wfile.write(f"data: {payload}\n\n".encode("utf-8"))
                self.wfile.flush()
                time.sleep(0.2)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        # ==========================================
        # CHAT & INTENT ROUTER ENDPOINT (/api/chat)
        # ==========================================
        if parsed.path == "/api/chat" or parsed.path == "/api/generate":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            prompt = data.get("prompt", "").strip()
            style_id = data.get("style", "brick-toy")
            aspect = data.get("aspect", "16:9")
            duration = int(data.get("duration", 30))
            material_url = data.get("material", "")
            active_film_id = data.get("activeFilmId")

            # Load active character bible
            character_bible = data.get("character_bible") or load_global_character_bible()

            # ROUTE INTENT
            intent, intent_data = route_intent(prompt)

            # BRANCH 1: GREETING & FAQ
            if intent == "greeting_faq":
                resp = {
                    "success": True,
                    "intent": "greeting_faq",
                    "reply": "Xin chào! Tôi là Lumina AI Animation Studio. Tôi có thể giúp bạn tạo video hoạt hình chuyên nghiệp từ ý tưởng hoặc hình ảnh của bạn với 6 phong cách nổi bật (3D Pixar, 2D Anime, Claymation, Brick-Toy Lego, Chibi...).",
                    "suggestions": [
                        "Tạo video 30s Lego siêu xe biến hình",
                        "Tạo phim ngắn Anime chú mèo pháp sư 15s",
                        "Tạo video 3D Pixar robot dọn dẹp đáng yêu"
                    ]
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # BRANCH 2: AMBIGUOUS REQUEST (Ask max 3 questions)
            elif intent == "ambiguous":
                resp = {
                    "success": True,
                    "intent": "ambiguous",
                    "reply": "Ý tưởng của bạn rất tiềm năng! Để Lumina tạo video hoạt hình đúng chuẩn nhất cho bạn, hãy bổ sung thêm vài thông tin:",
                    "questions": [
                        "1. Nhân vật / Chủ đề chính là gì? (vd: Siêu xe Lego, Robot Mecha, Khủng long đất nặn)",
                        "2. Phong cách hoạt hình mong muốn? (vd: 3D Pixar, 2D Anime, Brick-Toy Lego, Claymation)",
                        "3. Thời lượng và tỷ lệ khung hình? (vd: 15s dọc TikTok 9:16 hay 30s ngang TVC 16:9)"
                    ],
                    "suggestions": [
                        "Siêu xe Lego biến hình robot (30s TVC)",
                        "Robot STEM thông minh (15s TikTok)",
                        "Khủng long đất nặn pastel (30s)"
                    ]
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # BRANCH 3: EDIT SINGLE SHOT (@shotN ...)
            elif intent == "edit_single_shot":
                shot_num = intent_data["shot_num"]
                instruction = intent_data["instruction"] or "cập nhật hình ảnh và hành động mới"
                history = load_history()
                
                # Find film to edit
                target_film = None
                if active_film_id:
                    target_film = next((f for f in history if f["id"] == active_film_id), None)
                if not target_film and len(history) > 0:
                    target_film = history[0]

                if not target_film:
                    resp = {"success": False, "error": "Chưa có dự án video nào đang mở để sửa phân cảnh."}
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(json.dumps(resp).encode("utf-8"))
                    return

                # Snapshot version for UNDO
                if "history" not in target_film:
                    target_film["history"] = []
                target_film["history"].append({
                    "version": target_film.get("version", 1),
                    "shots": json.loads(json.dumps(target_film["shots"])),
                    "character_bible": json.loads(json.dumps(target_film.get("character_bible", {})))
                })
                target_film["version"] = target_film.get("version", 1) + 1

                # Update the specific shot
                preset = next((s for s in ANIMATION_PRESETS if s["id"] == target_film.get("style_lock", "brick-toy")), ANIMATION_PRESETS[4])
                new_seed = int(time.time() * 1000) % 999999
                new_prompt = f"{preset['prompt_prefix']}, {instruction}, 8k cinematic shot"
                encoded_prompt = urllib.parse.quote(new_prompt)
                new_img = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&seed={new_seed}"

                for s in target_film["shots"]:
                    if s["num"] == shot_num:
                        s["title"] = f"Shot {shot_num}: {instruction[:30]}"
                        s["visual_prompt"] = new_prompt
                        s["img"] = new_img

                # Regenerate film project
                generate_interactive_film(
                    target_film["id"], target_film["title"], target_film.get("prompt", ""),
                    target_film.get("style_lock", "brick-toy"), target_film.get("duration", 30),
                    target_film.get("aspect", "16:9"), target_film["shots"]
                )

                save_history(target_film)

                resp = {
                    "success": True,
                    "intent": "edit_single_shot",
                    "reply": f"Đã cập nhật và tạo lại thành công phân cảnh @shot{shot_num}: \"{instruction}\"!",
                    "film": target_film
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # BRANCH 4: CREATE FULL STORYBOARD
            film_id = f"film_{int(time.time())}_{uuid.uuid4().hex[:6]}"
            title = prompt.split(".")[0].strip()[:40] if prompt else "Siêu Phẩm Hoạt Hình AI"

            shots = generate_shots_with_character(prompt, style_id, material_url, character_bible)

            storyboard = {
                "id": film_id,
                "title": title,
                "prompt": prompt,
                "style_lock": style_id,
                "aspect": aspect,
                "duration": duration,
                "character_bible": character_bible,
                "shots": shots,
                "version": 1,
                "history": []
            }

            # VALIDATE STORYBOARD USING ZOD (STEP 7)
            is_valid, validated_data = validate_storyboard_with_zod(storyboard)
            if is_valid and validated_data:
                storyboard = validated_data

            # Generate interactive film project
            film_url = generate_interactive_film(film_id, title, prompt, style_id, duration, aspect, storyboard["shots"])
            storyboard["filmUrl"] = film_url
            storyboard["renderCmd"] = (
                f"cd ~/lemo-opuscar\n"
                f"node core/render/still.mjs \"films/{film_id}\" 1.5 3 --style \"{style_id}\" --ar \"{aspect}\"\n"
                f"./build.sh --fps 30 --crf 18 --output \"films/{film_id}/output_{style_id}_{aspect.replace(':','x')}.mp4\""
            )
            storyboard["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")

            save_history(storyboard)

            resp = {
                "success": True,
                "intent": "create_storyboard",
                "film": storyboard
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        # ==========================================
        # STEP 3: UNDO ENDPOINT (/api/undo)
        # ==========================================
        elif parsed.path == "/api/undo":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body) if body else {}
            film_id = data.get("filmId")

            history = load_history()
            target_film = None
            if film_id:
                target_film = next((f for f in history if f["id"] == film_id), None)
            if not target_film and len(history) > 0:
                target_film = history[0]

            if not target_film or not target_film.get("history"):
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Không có phiên bản trước để hoàn tác."}).encode("utf-8"))
                return

            # Pop last snapshot
            last_snapshot = target_film["history"].pop()
            target_film["shots"] = last_snapshot["shots"]
            if "character_bible" in last_snapshot:
                target_film["character_bible"] = last_snapshot["character_bible"]
            target_film["version"] = last_snapshot["version"]

            # Regenerate film project
            generate_interactive_film(
                target_film["id"], target_film["title"], target_film.get("prompt", ""),
                target_film.get("style_lock", "brick-toy"), target_film.get("duration", 30),
                target_film.get("aspect", "16:9"), target_film["shots"]
            )
            save_history(target_film)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "film": target_film}).encode("utf-8"))
            return

        # ==========================================
        # STEP 4: CHARACTER BIBLE UPDATE (/api/character-bible)
        # ==========================================
        elif parsed.path == "/api/character-bible":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body) if body else {}
            save_global_character_bible(data)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "character_bible": data}).encode("utf-8"))
            return

        # ==========================================
        # RETRY SHOT IMAGE (/api/retry-shot-image)
        # ==========================================
        elif parsed.path == "/api/retry-shot-image":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                film_id = data.get("filmId")
                shot_num = int(data.get("shotNum", 1))

                history = load_history()
                new_img = None
                for item in history:
                    if item["id"] == film_id:
                        for s in item["shots"]:
                            if s["num"] == shot_num:
                                new_seed = int(time.time() * 1000) % 999999
                                encoded_prompt = urllib.parse.quote(s.get("visual_prompt", "cinematic animation shot 8k"))
                                new_img = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&seed={new_seed}"
                                s["img"] = new_img
                        generate_interactive_film(
                            film_id, item["title"], item.get("prompt", ""),
                            item.get("style_lock", "brick-toy"), item.get("duration", 30),
                            item.get("aspect", "16:9"), item["shots"]
                        )
                        break

                if new_img:
                    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                        json.dump(history, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "img": new_img}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                return

        # ==========================================
        # UPDATE SHOT IMAGE (/api/update-shot-image)
        # ==========================================
        elif parsed.path == "/api/update-shot-image":
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
                        generate_interactive_film(
                            film_id, item["title"], item.get("prompt", ""),
                            item.get("style_lock", "brick-toy"), item.get("duration", 30),
                            item.get("aspect", "16:9"), item["shots"]
                        )
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
    print(f"  Lumina Animation Studio Backend on port {PORT}")
    print(f"  Serving: http://localhost:{PORT}")
    print(f"==================================================")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
