"""
Bước 2: Script Generation Service (Sử dụng LLM / Gemini API)
Phân tích chủ đề và sinh kịch bản phân đoạn dạng JSON:
- Số thứ tự phân cảnh (scene_number)
- Mô tả chi tiết hình ảnh bằng tiếng Anh (visual_prompt dùng cho Image Gen)
- Lời thoại/thuyết minh tiếng Việt (voiceover)
"""
import json
import logging
import re
from typing import Optional
import httpx

from pipeline.backend.config import settings, STYLE_PRESETS
from pipeline.backend.models import ScriptResponse, SceneData

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """Bạn là Đạo diễn Phim hoạt hình AI & Chuyên gia Kịch bản Quảng cáo Đồ chơi Trẻ em.
Nhiệm vụ của bạn là nhận một chủ đề hoặc ý tưởng video từ người dùng và phân tích, sáng tạo thành một KỊCH BẢN PHÂN ĐOẠN ĐIỆN ẢNH (Storyboard Script) gồm đúng số cảnh được yêu cầu.

YÊU CẦU BẮT BUỘC:
1. Tuân thủ chuẩn an toàn trẻ em CARU & COPPA: Hình ảnh trong sáng, vui tươi, mang tính giáo dục hoặc kích thích trí tưởng tượng sáng tạo, tuyệt đối không có hành vi nguy hiểm trẻ em có thể bắt chước.
2. Cấu trúc câu chuyện liền mạch:
   - Cảnh 1: Mở đầu / Thiết lập thế giới (Establishing Shot)
   - Cảnh 2: Khám phá / Biến hình / Thử thách kích thích tò mò
   - Cảnh 3: Hành động cao trào / Trải nghiệm niềm vui tột đỉnh
   - Cảnh 4: Kết thúc / Lời kêu gọi hành động (Call To Action) hoặc thông điệp ý nghĩa
3. visual_prompt (MÔ TẢ HÌNH ẢNH):
   - BẮT BUỘC VIẾT BẰNG TIẾNG ANH CHI TIẾT (để các mô hình tạo ảnh AI hiểu chuẩn xác nhất).
   - Phải lồng ghép phong cách mỹ thuật (style prompt) được chỉ định.
   - Ghi rõ góc máy (close-up, wide-shot, eye-level), ánh sáng (cinematic lighting, warm studio light), hành động nhân vật, màu sắc.
4. voiceover (LỜI THOẠI/THUYẾT MINH):
   - BẮT BUỘC VIẾT BẰNG TIẾNG VIỆT tự nhiên, hào hứng, truyền cảm hứng, độ dài vừa vặn khoảng 10-18 từ (tương ứng 4-6 giây đọc).
5. camera_motion: Chọn 1 trong các giá trị: dolly_in, dolly_out, orbit_pan, dutch_tilt, zoom_punch.

BẠN BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐOẠN JSON HỢP LỆ THEO ĐỊNH DẠNG:
{
  "title": "Tên kịch bản tiếng Việt",
  "style": "tên_phong_cách",
  "target_audience": "Trẻ em & Phụ huynh",
  "total_duration": 20.0,
  "scenes": [
    {
      "scene_number": 1,
      "title": "Mở đầu thế giới kỳ diệu",
      "visual_prompt": "Cinematic wide establishing shot of ... (English prompt with style keywords)",
      "voiceover": "Lời thoại tiếng Việt cho cảnh 1...",
      "duration_seconds": 5.0,
      "camera_motion": "dolly_in",
      "transition": "crossfade"
    }
  ]
}
"""


def _generate_fallback_script(topic: str, style: str, scene_count: int) -> ScriptResponse:
    """Tạo kịch bản dự phòng thông minh chuẩn xác theo topic khi chưa có API Key hoặc mất kết nối."""
    style_info = STYLE_PRESETS.get(style, STYLE_PRESETS["brick-toy"])
    style_prefix = style_info["prompt_prefix"]

    scenes = []
    motions = ["dolly_in", "orbit_pan", "dutch_tilt", "zoom_punch", "dolly_out", "orbit_pan"]

    template_configs = [
        {
            "sub": "Mở Đầu Khám Phá",
            "prompt_en": f"{style_prefix}, a vibrant colorful world inspired by '{topic}', cheerful cinematic establishing shot, macro lens, detailed textures, soft golden hour sunlight, 8k render",
            "voice_vi": f"Chào mừng bạn đến với thế giới kỳ diệu của {topic}! Hãy sẵn sàng cho hành trình sáng tạo phi thường.",
            "duration": 5.0
        },
        {
            "sub": "Biến Hình Sáng Tạo",
            "prompt_en": f"{style_prefix}, dynamic transformation scene, vibrant pieces connecting together into an epic model related to '{topic}', joyful sparks, smooth motion blur, depth of field",
            "voice_vi": "Từng mảnh ghép lắp nối kỳ diệu, biến những ước mơ ngây thơ thành hiện thực sống động ngay trước mắt bạn!",
            "duration": 5.0
        },
        {
            "sub": "Hành Động Đỉnh Cao",
            "prompt_en": f"{style_prefix}, thrilling dynamic action shot of '{topic}' in motion, hero pose, glowing energy trails, speed lines, rich atmospheric reflections, cinematic composition",
            "voice_vi": "Khởi động động cơ và tăng tốc vượt qua mọi chướng ngại vật! Trải nghiệm niềm vui chiến thắng vỡ òa!",
            "duration": 5.0
        },
        {
            "sub": "Lan Tỏa Niềm Vui & Kêu Gọi",
            "prompt_en": f"{style_prefix}, happy children smiling with their custom toy creation of '{topic}', warm cozy room, sparkling celebration confetti, eye-level close-up, heartwarming masterpiece",
            "voice_vi": f"Thỏa sức sáng tạo và khám phá thế giới riêng của bạn cùng {topic} ngay hôm nay!",
            "duration": 5.0
        }
    ]

    for i in range(scene_count):
        tpl = template_configs[i % len(template_configs)]
        scenes.append(
            SceneData(
                scene_number=i + 1,
                title=f"Cảnh {i + 1}: {tpl['sub']}",
                visual_prompt=tpl["prompt_en"],
                voiceover=tpl["voice_vi"],
                duration_seconds=tpl["duration"],
                camera_motion=motions[i % len(motions)],
                transition="crossfade"
            )
        )

    return ScriptResponse(
        title=f"Khám Phá Sáng Tạo: {topic}",
        style=style,
        target_audience="Trẻ em & Gia đình",
        total_duration=float(sum(s.duration_seconds for s in scenes)),
        scenes=scenes
    )


async def generate_script(
    topic: str,
    style: str = "brick-toy",
    scene_count: int = 4,
    api_key: Optional[str] = None
) -> ScriptResponse:
    """
    Bước 2: Gọi LLM (Gemini API) để phân tích chủ đề và sinh kịch bản JSON.
    Hỗ trợ cấu hình Gemini API Key qua tham số hoặc biến môi trường GEMINI_API_KEY.
    """
    resolved_api_key = api_key or settings.gemini_api_key
    style_info = STYLE_PRESETS.get(style, STYLE_PRESETS["brick-toy"])

    user_prompt = f"""CHỦ ĐỀ VIDEO: "{topic}"
PHONG CÁCH HÌNH ẢNH: {style_info['name']}
MÔ TẢ PHONG CÁCH (STYLE PROMPT): "{style_info['prompt_prefix']}"
SỐ LƯỢNG PHÂN CẢNH YÊU CẦU: {scene_count} cảnh.

Hãy tạo kịch bản phân đoạn JSON hoàn chỉnh theo đúng hướng dẫn hệ thống."""

    if resolved_api_key and resolved_api_key.strip():
        try:
            logger.info("Đang gọi Gemini API để tạo kịch bản...")
            # Ưu tiên gọi qua REST API chuẩn của Gemini (v1beta)
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={resolved_api_key.strip()}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": SYSTEM_PROMPT + "\n\n" + user_prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(endpoint, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        # Làm sạch markdown nếu có
                        clean_json = re.sub(r"^```json\s*", "", text_content.strip())
                        clean_json = re.sub(r"```$", "", clean_json.strip())
                        parsed = json.loads(clean_json)
                        script = ScriptResponse(**parsed)
                        logger.info(f"Đã tạo thành công kịch bản từ Gemini: {script.title} ({len(script.scenes)} cảnh)")
                        return script
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Lỗi khi gọi Gemini API: {e}. Chuyển sang fallback generator.")

    # Fallback generator thông minh khi chưa có API key hoặc lỗi mạng
    logger.info("Sử dụng kịch bản chuyên biệt thông minh (Fallback generator)...")
    return _generate_fallback_script(topic=topic, style=style, scene_count=scene_count)
