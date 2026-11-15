#!/usr/bin/env python3
"""
Lemo-OpusCar Studio Backend Server
Connects Gemini CLI with Lemo-OpusCar 99 Film Styles Engine.
Serves Lumina-style UI and provides REST APIs for video generation.
"""

import os
import sys
import json
import time
import uuid
import shutil
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8086
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILMS_DIR = os.path.join(BASE_DIR, "generated_films")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")
LEMO_HOME = os.path.expanduser("~/lemo-opuscar")
if not os.path.exists(LEMO_HOME):
    LEMO_HOME = r"C:\Users\Az\lemo-opuscar"

os.makedirs(FILMS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# 99 Lemo-OpusCar Styles Data
STYLES = [
    {"id": "brick-toy", "name": "Brick Toy (Lego Stop-Motion)", "cat": "toy", "color": "#f59e0b", "img": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80"},
    {"id": "teardown", "name": "Teardown (Bản Vẽ CAD Nổ Tách)", "cat": "toy", "color": "#38bdf8", "img": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"},
    {"id": "claymation", "name": "Claymation (Đất Nặn Thủ Công)", "cat": "toy", "color": "#fb7185", "img": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80"},
    {"id": "paper-popup", "name": "Paper Pop-Up (Sách 3D Mở Ra)", "cat": "toy", "color": "#e2e8f0", "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"},
    {"id": "tilt-shift", "name": "Tilt-Shift (Thế Giới Thu Nhỏ)", "cat": "toy", "color": "#10b981", "img": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"},
    {"id": "crayon-world", "name": "Crayon World (Sáp Màu Tuổi Thơ)", "cat": "toy", "color": "#f43f5e", "img": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80"},
    {"id": "watercolor", "name": "Watercolor Brush (Màu Nước Thủy Mặc)", "cat": "art", "color": "#60a5fa", "img": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80"},
    {"id": "impasto", "name": "Impasto (Sơn Dầu Van Gogh)", "cat": "art", "color": "#fbbf24", "img": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80"},
    {"id": "ukiyoe", "name": "Ukiyo-e (Tranh Khắc Gỗ Nhật Bản)", "cat": "art", "color": "#34d399", "img": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80"},
    {"id": "blueprint", "name": "Blueprint CAD (Bản Vẽ Kỹ Thuật)", "cat": "tech", "color": "#0284c7", "img": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80"},
    {"id": "cyberpunk-hud", "name": "Cyberpunk HUD (Hologram Neon)", "cat": "tech", "color": "#a855f7", "img": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80"},
    {"id": "wireframe", "name": "3D Wireframe (Lưới Vector)", "cat": "tech", "color": "#22c55e", "img": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"},
    {"id": "rubber-hose", "name": "Rubber Hose (Hoạt Hình 1930s)", "cat": "retro", "color": "#f1f5f9", "img": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80"},
    {"id": "pixel-art", "name": "Pixel Art (Game 16-Bit SNES)", "cat": "retro", "color": "#ec4899", "img": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"},
    {"id": "anime-cel", "name": "Anime Cel (Hoạt Hình Nhật Bản)", "cat": "retro", "color": "#f97316", "img": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80"}
]

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

def generate_interactive_film(film_id, title, prompt, style_id, duration, aspect, material_url):
    """
    Creates an official Lemo-OpusCar HTML5/Canvas interactive film project
    Adheres strictly to window.READY = true, window.render(t), window.DUR.
    """
    film_folder = os.path.join(FILMS_DIR, film_id)
    os.makedirs(film_folder, exist_ok=True)

    style_info = next((s for s in STYLES if s["id"] == style_id), STYLES[0])
    color = style_info.get("color", "#f59e0b")

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{title} - Lemo OpusCar Film</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ background: #070709; color: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; font-family: monospace; }}
    canvas {{ width: 100%; height: 100%; object-contain: contain; }}
    #hud {{ position: absolute; top: 16px; left: 16px; background: rgba(0,0,0,0.7); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); font-size: 12px; pointer-events: none; }}
  </style>
</head>
<body>
  <div id="hud">
    <div style="color: {color}; font-weight: bold;">OPUSCAR RENDER: {style_id.upper()}</div>
    <div id="tc" style="opacity: 0.8;">TC: 00:00.00</div>
  </div>
  <canvas id="c" width="1920" height="1080"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const tc = document.getElementById('tc');

    window.DUR = {duration};
    window.READY = true;

    window.render = function(t) {{
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark background with gradient
      const grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 800);
      grad.addColorStop(0, '#16161f');
      grad.addColorStop(1, '#070709');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const style = "{style_id}";
      const p = (t % 5) / 5;

      if (style === 'brick-toy') {{
        // Three.js simulated Lego bricks stop motion
        ctx.save();
        ctx.translate(w/2, h/2);
        for (let i = 0; i < 16; i++) {{
          const ang = (i / 16) * Math.PI * 2 + p * Math.PI;
          const rad = 180 + Math.sin(t * 3 + i) * 60;
          const x = Math.cos(ang) * rad;
          const y = Math.sin(ang) * rad;
          ctx.fillStyle = i % 2 === 0 ? '#ef4444' : (i % 3 === 0 ? '#3b82f6' : '{color}');
          ctx.fillRect(x - 45, y - 30, 90, 60);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(x - 22, y - 15, 10, 0, Math.PI * 2);
          ctx.arc(x + 22, y - 15, 10, 0, Math.PI * 2);
          ctx.fill();
        }}
        ctx.restore();
      }} else if (style === 'teardown' || style === 'blueprint') {{
        // Exploded CAD view wireframe
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.strokeStyle = '{color}';
        ctx.lineWidth = 3;
        ctx.rotate(t * 0.4);
        ctx.strokeRect(-180, -180, 360, 360);
        ctx.strokeRect(-260, -90, 520, 180);
        ctx.beginPath();
        ctx.arc(0, 0, 140, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '{color}';
        ctx.font = '24px monospace';
        ctx.fillText('CAD EXPLODED: PRECISION TOLERANCE 0.01mm', -250, 240);
        ctx.restore();
      }} else {{
        // Geometric dynamic motion
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.fillStyle = '{color}';
        ctx.beginPath();
        ctx.arc(0, 0, 150 + Math.sin(t * 4) * 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }}

      // Title overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("{title}", w/2, h - 80);

      // Timecode
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      tc.innerText = `TC: ${{String(m).padStart(2,'0')}}:${{String(s).padStart(2,'0')}}.${{String(ms).padStart(2,'0')}} / {duration}s`;
    }};

    // Auto-loop preview inside browser
    let start = performance.now();
    function loop() {{
      const now = performance.now();
      const elapsed = ((now - start) / 1000) % window.DUR;
      window.render(elapsed);
      requestAnimationFrame(loop);
    }}
    loop();
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

        # Fallback to static files
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

            prompt = data.get("prompt", "Phim quảng cáo đồ chơi hoạt hình AI")
            style_id = data.get("style", "brick-toy")
            aspect = data.get("aspect", "16:9")
            duration = int(data.get("duration", 30))
            draft = data.get("draft", False)
            material_url = data.get("material", "")

            film_id = f"film_{int(time.time())}_{uuid.uuid4().hex[:6]}"
            title = prompt.split(".")[0].strip()[:40] if prompt else "Siêu Phẩm Hoạt Hình AI"
            if len(title) < 5:
                title = "Phim Hoạt Hình Đồ Chơi Biến Hình"

            # 6 Technical Shots
            style_obj = next((s for s in STYLES if s["id"] == style_id), STYLES[0])
            thumb_img = material_url if material_url else style_obj["img"]

            shots = [
                {
                    "num": 1,
                    "title": "Shot 1: Mở Đầu Đại Cảnh (Establishing Shot)",
                    "time": "00:00 - 00:05",
                    "camera": "Dolly In 4K",
                    "desc": f"Bối cảnh rực rỡ ánh sáng, {prompt[:60]}... xuất hiện ấn tượng.",
                    "vo": "Nữ truyền cảm: Mỗi buổi sáng là một cuộc phiêu lưu kỳ thú...",
                    "img": thumb_img
                },
                {
                    "num": 2,
                    "title": "Shot 2: Cơ Chế Cơ Khí & Biến Hình (Mechanism)",
                    "time": "00:05 - 00:10",
                    "camera": "Orbit 360° Macro",
                    "desc": "Các mảnh ghép chuyển động nổ tung, tự động lắp ghép ăn khớp nhịp giật stop-motion.",
                    "vo": "Nữ truyền cảm: Tự động bung cánh lượn biến hình thành chiến binh...",
                    "img": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "num": 3,
                    "title": "Shot 3: Hành Động Tốc Độ (Dynamic Action)",
                    "time": "00:10 - 00:18",
                    "camera": "Dutch Tilt 124 BPM",
                    "desc": "Lướt qua các chướng ngại vật mạo hiểm, ánh đèn LED rực rỡ xé toạc màn sương.",
                    "vo": "Âm thanh: Tiếng động cơ phản lực dồn dập, tiếng vút gió sinh động.",
                    "img": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "num": 4,
                    "title": "Shot 4: Biểu Cảm Em Bé & Phụ Huynh (Emotion Reaction)",
                    "time": "00:18 - 00:22",
                    "camera": "Medium Close-up Warm",
                    "desc": "Bé 6 tuổi reo hò vỗ tay mừng rỡ, ánh mắt lấp lánh nụ cười rạng rỡ.",
                    "vo": "Nữ truyền cảm: Kích hoạt trí tưởng tượng vô hạn của con bạn.",
                    "img": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "num": 5,
                    "title": "Shot 5: Chi Tiết Sản Phẩm & An Toàn (Safety Showcase)",
                    "time": "00:22 - 00:26",
                    "camera": "Top-down Flatlay",
                    "desc": "Vật liệu nhựa nguyên sinh ABS chứng nhận CARU & COPPA an toàn 100%.",
                    "vo": "Nữ tự tin: Tiêu chuẩn an toàn Châu Âu và Mỹ nghiêm ngặt nhất.",
                    "img": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "num": 6,
                    "title": "Shot 6: Kêu Gọi Mua Hàng & Affiliate (Call To Action)",
                    "time": "00:26 - 00:30",
                    "camera": "Hero Center Glow",
                    "desc": "Sản phẩm tạo dáng anh hùng, logo và đường link mua hàng giảm giá 30%.",
                    "vo": "Nữ tự tin: Khám phá ngay trên TikTok Shop & Amazon với ưu đãi hôm nay!",
                    "img": thumb_img
                }
            ]

            # Generate interactive HTML film project
            film_url = generate_interactive_film(film_id, title, prompt, style_id, duration, aspect, material_url)

            # Lemo-OpusCar CLI Command
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
