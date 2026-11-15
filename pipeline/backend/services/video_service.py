"""
Bước 4: Video Generation Service (Tạo Đoạn Clip Ngắn Cho Từng Phân Cảnh)
Hỗ trợ:
1. Động cơ chuyển động máy quay điện ảnh (Motion Engine): Dolly In, Dolly Out, Orbit Pan, Dutch Tilt, Zoom Punch.
   Sử dụng Pillow + imageio-ffmpeg / MoviePy để render video mượt mà chuẩn 30fps.
2. Cloud Image-to-Video API Adapter (Runway / Luma / SVD).
"""
import asyncio
import logging
import math
import os
import subprocess
from pathlib import Path
from typing import Optional
from PIL import Image
import numpy as np

from pipeline.backend.config import settings

logger = logging.getLogger(__name__)


def _ease_in_out_cubic(t: float) -> float:
    """Hàm gia tốc mượt mà cubic easing (0.0 -> 1.0)."""
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def _get_ffmpeg_executable() -> str:
    """Tìm đường dẫn thực thi ffmpeg (hệ thống hoặc từ imageio_ffmpeg)."""
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def _render_motion_clip(
    image_path: Path,
    output_clip_path: Path,
    duration: float = 5.0,
    motion_type: str = "dolly_in",
    fps: int = 30,
    width: int = 1280,
    height: int = 720
):
    """
    Render ảnh tĩnh thành clip chuyển động máy quay chân thực 30fps 16:9.
    """
    ffmpeg_exe = _get_ffmpeg_executable()
    output_clip_path.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(image_path).convert("RGB")
    orig_w, orig_h = img.size

    # Chuẩn bị crop ảnh ban đầu để khớp tỉ lệ 16:9
    target_aspect = width / height
    orig_aspect = orig_w / orig_h
    if orig_aspect > target_aspect:
        # Ảnh gốc bè hơn -> cắt bớt chiều rộng
        crop_w = int(orig_h * target_aspect)
        offset_x = (orig_w - crop_w) // 2
        img = img.crop((offset_x, 0, offset_x + crop_w, orig_h))
    else:
        # Ảnh gốc cao hơn -> cắt bớt chiều cao
        crop_h = int(orig_w / target_aspect)
        offset_y = (orig_h - crop_h) // 2
        img = img.crop((0, offset_y, orig_w, offset_y + crop_h))

    # Resize base image có thêm padding margin (120%) để pan/tilt không bị viền đen
    margin_w = int(width * 1.35)
    margin_h = int(height * 1.35)
    base_img = img.resize((margin_w, margin_h), Image.Resampling.LANCZOS)
    bw, bh = base_img.size

    total_frames = int(duration * fps)

    # Khởi chạy FFmpeg pipe để ghi video trực tiếp từ stream raw frame
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "rgb24",
        "-r", str(fps),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        str(output_clip_path)
    ]

    pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    for i in range(total_frames):
        t = i / max(total_frames - 1, 1)
        progress = _ease_in_out_cubic(t)

        if motion_type == "dolly_in":
            # Scale từ 1.0 đến 1.25, tâm ở chính giữa
            scale = 1.0 + 0.25 * progress
            crop_w = int(width / scale)
            crop_h = int(height / scale)
            cx, cy = bw // 2, bh // 2
            left = max(0, cx - crop_w // 2)
            top = max(0, cy - crop_h // 2)
            frame_img = base_img.crop((left, top, left + crop_w, top + crop_h)).resize((width, height), Image.Resampling.BILINEAR)

        elif motion_type == "dolly_out":
            # Scale từ 1.25 về 1.0
            scale = 1.25 - 0.25 * progress
            crop_w = int(width / scale)
            crop_h = int(height / scale)
            cx, cy = bw // 2, bh // 2
            left = max(0, cx - crop_w // 2)
            top = max(0, cy - crop_h // 2)
            frame_img = base_img.crop((left, top, left + crop_w, top + crop_h)).resize((width, height), Image.Resampling.BILINEAR)

        elif motion_type == "orbit_pan":
            # Pan từ trái sang phải kèm xoay nhẹ 2.5 độ
            pan_offset = (progress - 0.5) * (bw - width) * 0.7
            cx = int(bw // 2 + pan_offset)
            cy = bh // 2
            crop_w = int(width * 1.05)
            crop_h = int(height * 1.05)
            left = max(0, min(bw - crop_w, cx - crop_w // 2))
            top = max(0, min(bh - crop_h, cy - crop_h // 2))
            cropped = base_img.crop((left, top, left + crop_w, top + crop_h))
            angle = (progress - 0.5) * 3.5
            rotated = cropped.rotate(angle, resample=Image.Resampling.BILINEAR)
            frame_img = rotated.resize((width, height), Image.Resampling.BILINEAR)

        elif motion_type == "dutch_tilt":
            # Xoay nghiêng góc máy ấn tượng 5 - 8 độ kết hợp zoom nhẹ
            angle = 5.0 * math.sin(progress * math.pi)
            scale = 1.08 + 0.12 * progress
            crop_w = int(width / scale)
            crop_h = int(height / scale)
            cx, cy = bw // 2, bh // 2
            left = max(0, cx - crop_w // 2)
            top = max(0, cy - crop_h // 2)
            cropped = base_img.crop((left, top, left + crop_w, top + crop_h))
            rotated = cropped.rotate(angle, resample=Image.Resampling.BILINEAR)
            frame_img = rotated.resize((width, height), Image.Resampling.BILINEAR)

        elif motion_type == "zoom_punch":
            # Zoom bùng nổ nảy ở nửa đầu rồi trôi nhẹ
            if progress < 0.4:
                sub_p = progress / 0.4
                scale = 1.0 + 0.30 * (math.sin(sub_p * math.pi / 2))
            else:
                scale = 1.30 - 0.05 * ((progress - 0.4) / 0.6)
            crop_w = int(width / scale)
            crop_h = int(height / scale)
            cx, cy = bw // 2, bh // 2
            left = max(0, cx - crop_w // 2)
            top = max(0, cy - crop_h // 2)
            frame_img = base_img.crop((left, top, left + crop_w, top + crop_h)).resize((width, height), Image.Resampling.BILINEAR)

        else:
            # Mặc định dolly in nhẹ nhàng
            scale = 1.0 + 0.15 * progress
            crop_w = int(width / scale)
            crop_h = int(height / scale)
            left = (bw - crop_w) // 2
            top = (bh - crop_h) // 2
            frame_img = base_img.crop((left, top, left + crop_w, top + crop_h)).resize((width, height), Image.Resampling.BILINEAR)

        # Chuyển đổi sang raw RGB bytes và ghi vào pipe
        pipe.stdin.write(frame_img.tobytes())

    pipe.stdin.close()
    pipe.wait()
    logger.info(f"Render clip chuyển động hoàn tất: {output_clip_path} ({duration}s, {motion_type})")


async def generate_scene_video(
    image_path: Path,
    output_dir: Path,
    scene_number: int,
    duration: float = 5.0,
    motion_type: str = "dolly_in",
    provider: Optional[str] = None
) -> Path:
    """
    Bước 4: Đưa hình ảnh phân cảnh vào mô hình tạo video để xuất clip MP4 ngắn.
    """
    output_clip_path = output_dir / f"clip_scene_{scene_number}.mp4"

    # Nếu clip đã render trước đó, tái sử dụng (Cache)
    if output_clip_path.exists() and output_clip_path.stat().st_size > 100 * 1024:
        logger.info(f"Sử dụng video clip đã cache: {output_clip_path}")
        return output_clip_path

    resolved_provider = provider or settings.video_provider

    # Chạy động cơ chuyển động (Motion Engine) trong threadpool bất đồng bộ
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(
        None,
        _render_motion_clip,
        image_path,
        output_clip_path,
        duration,
        motion_type,
        30,
        1280,
        720
    )

    return output_clip_path
