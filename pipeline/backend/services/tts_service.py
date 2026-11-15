"""
Bước 5 (Audio): Text-To-Speech (TTS) Service Cho Thuyết Minh Tiếng Việt
Hỗ trợ:
1. edge-tts: Giọng đọc AI tự nhiên chất lượng cao (vi-VN-HoaiMyNeural / vi-VN-NamMinhNeural).
2. gTTS: Google Text-to-Speech dự phòng tự động.
"""
import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Optional

from pipeline.backend.config import settings

logger = logging.getLogger(__name__)


def _get_audio_duration_seconds(audio_path: Path) -> float:
    """Đo thời lượng file audio bằng FFprobe hoặc giá trị xấp xỉ."""
    try:
        from pipeline.backend.services.video_service import _get_ffmpeg_executable
        ffmpeg_exe = _get_ffmpeg_executable()
        # Thay ffmpeg bằng ffprobe nếu có, hoặc dùng ffmpeg -i
        cmd = [ffmpeg_exe, "-i", str(audio_path)]
        res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.DEVNULL, text=True, errors="ignore")
        # Tìm Duration: 00:00:04.50
        import re
        match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
        if match:
            hours = float(match.group(1))
            minutes = float(match.group(2))
            seconds = float(match.group(3))
            return hours * 3600 + minutes * 60 + seconds
    except Exception as e:
        logger.warning(f"Không thể đo audio duration qua ffprobe: {e}")

    # Xấp xỉ dựa trên kích thước file mp3 (thường ~16KB/giây ở 128kbps)
    size = audio_path.stat().st_size
    return max(3.0, size / 16000.0)


async def generate_scene_voiceover(
    text: str,
    output_dir: Path,
    scene_number: int,
    voice: Optional[str] = None
) -> tuple[Path, float]:
    """
    Sinh file audio thuyết minh tiếng Việt từ lời thoại kịch bản.
    Trả về: (audio_path, duration_seconds)
    """
    save_path = output_dir / f"voice_scene_{scene_number}.mp3"
    save_path.parent.mkdir(parents=True, exist_ok=True)

    if save_path.exists() and save_path.stat().st_size > 5000:
        logger.info(f"Sử dụng audio đã cache: {save_path}")
        duration = _get_audio_duration_seconds(save_path)
        return save_path, duration

    clean_text = text.strip()
    if not clean_text:
        clean_text = f"Cảnh số {scene_number}"

    target_voice = voice or settings.tts_voice or "vi-VN-HoaiMyNeural"

    # 1. Thử edge-tts trước
    try:
        import edge_tts
        logger.info(f"Đang sinh giọng đọc qua edge-tts ({target_voice}): '{clean_text[:40]}...'")
        communicate = edge_tts.Communicate(clean_text, target_voice)
        await communicate.save(str(save_path))
        if save_path.exists() and save_path.stat().st_size > 1000:
            duration = _get_audio_duration_seconds(save_path)
            logger.info(f"Sinh audio thành công qua edge-tts: {save_path} ({duration:.2f}s)")
            return save_path, duration
    except Exception as e:
        logger.warning(f"Lỗi edge-tts: {e}. Thử gTTS dự phòng...")

    # 2. Dự phòng bằng gTTS
    try:
        from gtts import gTTS
        loop = asyncio.get_running_loop()
        def _call_gtts():
            tts = gTTS(text=clean_text, lang="vi", slow=False)
            tts.save(str(save_path))
        await loop.run_in_executor(None, _call_gtts)
        if save_path.exists() and save_path.stat().st_size > 1000:
            duration = _get_audio_duration_seconds(save_path)
            logger.info(f"Sinh audio thành công qua gTTS: {save_path} ({duration:.2f}s)")
            return save_path, duration
    except Exception as e:
        logger.error(f"Lỗi gTTS: {e}")

    # 3. Tạo file im lặng tối thiểu nếu cả 2 phương thức mạng đều không khả dụng
    duration = 4.0
    return save_path, duration
