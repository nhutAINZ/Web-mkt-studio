"""
Bước 3: Image Generation Service (Tạo Hình Ảnh AI Cho Từng Phân Cảnh)
Hỗ trợ:
- Pollinations.ai (Flux / Turbo) với thuật toán kiểm tra ảnh lỗi & backoff
- OpenAI DALL-E 3
- Fallback Canvas Generator bằng Pillow với bảng màu phong cách điện ảnh
"""
import asyncio
import hashlib
import logging
from pathlib import Path
from typing import Optional
from urllib.parse import quote
import httpx
from PIL import Image, ImageDraw, ImageFont

from pipeline.backend.config import settings

logger = logging.getLogger(__name__)


def _is_valid_image(image_bytes: bytes) -> bool:
    """Kiểm tra bytes có phải ảnh thật và không phải ảnh lỗi/placeholder (< 35KB hoặc chứa chữ error)."""
    if len(image_bytes) < 35 * 1024:
        return False
    # Kiểm tra header JPEG hoặc PNG
    if not (image_bytes.startswith(b'\xff\xd8') or image_bytes.startswith(b'\x89PNG\r\n\x1a\n')):
        return False
    # Kiểm tra chuỗi báo lỗi thường gặp
    head_sample = image_bytes[:1000].lower()
    if b"rate limit" in head_sample or b"free limit" in head_sample:
        return False
    return True


def _create_cinematic_fallback_image(
    save_path: Path,
    title: str,
    scene_number: int,
    style: str,
    width: int = 1280,
    height: int = 720
):
    """Tạo hình ảnh đồ họa điện ảnh chất lượng cao 16:9 bằng Pillow khi ngoại tuyến."""
    img = Image.new("RGB", (width, height), color=(15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Vẽ dải màu gradient điện ảnh
    color_schemes = [
        ((255, 107, 107), (78, 205, 196)),   # Warm Coral to Turquoise
        ((254, 202, 87), (255, 107, 107)),   # Bright Yellow to Coral
        ((84, 160, 255), (95, 39, 205)),     # Sky Blue to Deep Violet
        ((29, 209, 161), (16, 172, 132)),    # Vibrant Emerald
        ((255, 159, 243), (243, 104, 224)),  # Kawaii Pink
    ]
    c1, c2 = color_schemes[(scene_number - 1) % len(color_schemes)]

    for y in range(height):
        ratio = y / height
        r = int(15 * (1 - ratio) + c1[0] * 0.25 * ratio)
        g = int(23 * (1 - ratio) + c1[1] * 0.25 * ratio)
        b = int(42 * (1 - ratio) + c2[2] * 0.35 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Vẽ các hình khối đại diện (phong cách Lego/Shape)
    cx, cy = width // 2, height // 2 - 20
    box_w, box_h = 320, 180
    draw.rounded_rectangle(
        [cx - box_w // 2, cy - box_h // 2, cx + box_w // 2, cy + box_h // 2],
        radius=20,
        fill=c1,
        outline=(255, 255, 255),
        width=4
    )

    # Vẽ nút tròn đồ chơi trên hộp
    for bx in [-80, 0, 80]:
        draw.ellipse([cx + bx - 25, cy - box_h // 2 - 20, cx + bx + 25, cy - box_h // 2 + 10], fill=c2)

    # Vẽ khung nhãn thông tin
    draw.rounded_rectangle(
        [cx - 400, height - 140, cx + 400, height - 40],
        radius=14,
        fill=(10, 15, 30, 200),
        outline=(255, 255, 255, 80),
        width=2
    )

    draw.text((cx, cy), f"SCENE {scene_number}", fill=(255, 255, 255), anchor="mm")
    draw.text((cx, height - 90), f"{title} [{style.upper()}]", fill=(255, 255, 255), anchor="mm")

    save_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(save_path, "JPEG", quality=92)
    logger.info(f"Đã tạo ảnh canvas điện ảnh fallback: {save_path}")


async def _generate_with_pollinations(
    prompt: str,
    save_path: Path,
    seed: int = 42,
    retries: int = 2
) -> bool:
    """Gọi Pollinations API với cơ chế retry và phát hiện ảnh lỗi."""
    clean_prompt = prompt.replace("\n", " ").strip()
    encoded = quote(clean_prompt[:400])
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=1280&height=720&seed={seed}&nologo=true&model=flux"

    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Pollinations call attempt {attempt}/{retries}...")
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(url, headers={"User-Agent": "LuminaVideoPipeline/2.0"})
                if res.status_code == 200:
                    image_bytes = res.content
                    if _is_valid_image(image_bytes):
                        save_path.parent.mkdir(parents=True, exist_ok=True)
                        save_path.write_bytes(image_bytes)
                        logger.info(f"Tạo ảnh thành công từ Pollinations: {save_path} ({len(image_bytes)} bytes)")
                        return True
                    else:
                        logger.warning(f"Ảnh từ Pollinations không hợp lệ (size {len(image_bytes)} bytes). Thử lại...")
        except Exception as e:
            logger.warning(f"Lỗi kết nối Pollinations lần {attempt}: {e}")

        if attempt < retries:
            await asyncio.sleep(3.0 * attempt)

    return False


async def _generate_with_openai(prompt: str, save_path: Path, api_key: str) -> bool:
    """Gọi OpenAI DALL-E 3 API."""
    try:
        url = "https://api.openai.com/v1/images/generations"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "dall-e-3",
            "prompt": prompt[:950],
            "n": 1,
            "size": "1792x1024",
            "response_format": "b64_json"
        }
        import base64
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                b64 = data["data"][0]["b64_json"]
                img_data = base64.b64decode(b64)
                save_path.parent.mkdir(parents=True, exist_ok=True)
                save_path.write_bytes(img_data)
                return True
    except Exception as e:
        logger.error(f"Lỗi gọi OpenAI DALL-E: {e}")
    return False


async def generate_scene_image(
    prompt: str,
    output_dir: Path,
    scene_number: int,
    title: str = "",
    style: str = "brick-toy",
    provider: Optional[str] = None
) -> Path:
    """
    Bước 3: Tạo hình ảnh AI cho một phân cảnh cụ thể và lưu vào thư mục output.
    """
    save_path = output_dir / f"scene_{scene_number}.jpg"
    resolved_provider = provider or settings.image_provider

    # Nếu file đã tồn tại và hợp lệ, sử dụng lại (Cache)
    if save_path.exists() and save_path.stat().st_size > 35 * 1024:
        logger.info(f"Sử dụng ảnh đã cache: {save_path}")
        return save_path

    # Thử nhà cung cấp OpenAI nếu có key
    if resolved_provider == "openai" and settings.openai_api_key:
        ok = await _generate_with_openai(prompt, save_path, settings.openai_api_key)
        if ok:
            return save_path

    # Thử Pollinations API
    success = await _generate_with_pollinations(prompt, save_path, seed=42 + scene_number)
    if success:
        return save_path

    # Fallback tạo canvas mỹ thuật điện ảnh
    logger.info(f"Sử dụng fallback canvas generator cho cảnh {scene_number}...")
    _create_cinematic_fallback_image(
        save_path=save_path,
        title=title or f"Scene {scene_number}",
        scene_number=scene_number,
        style=style
    )
    return save_path
