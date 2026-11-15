"""
Bước 5: Assembly & Export Service (Ghép Nối, Chèn Âm Thanh/Phụ Đề & Xuất MP4 Hoàn Chỉnh)
Sử dụng FFmpeg / MoviePy để:
1. Tạo phụ đề thẩm mỹ (semi-transparent rounded pill) cho từng phân cảnh.
2. Ghép đồng bộ video clip và giọng đọc thuyết minh tiếng Việt.
3. Ghép nối tuần tự các cảnh thành một thước phim dài liền mạch.
4. Hòa âm nhạc nền (BGM) với tính năng ducking.
5. Xuất bản file MP4 chuẩn H.264/AAC tương thích mọi thiết bị.
"""
import asyncio
import logging
import math
import os
import subprocess
import wave
from pathlib import Path
from typing import List, Optional
from PIL import Image, ImageDraw, ImageFont
import numpy as np

from pipeline.backend.config import settings
from pipeline.backend.models import SceneData
from pipeline.backend.services.video_service import _get_ffmpeg_executable

logger = logging.getLogger(__name__)


def _create_subtitle_card(
    text: str,
    output_png_path: Path,
    width: int = 1280,
    height: int = 720
):
    """Tạo lớp phủ PNG phụ đề thẩm mỹ với nền bo góc mờ."""
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Chia dòng văn bản nếu quá dài
    words = text.strip().split()
    lines = []
    curr = []
    for w in words:
        curr.append(w)
        if len(" ".join(curr)) > 42:
            lines.append(" ".join(curr))
            curr = []
    if curr:
        lines.append(" ".join(curr))

    display_text = "\n".join(lines[:2])  # Tối đa 2 dòng

    # Kích thước hộp phụ đề
    box_w = min(width - 80, max(500, len(text) * 16))
    box_h = 55 + len(lines) * 22
    cx, cy = width // 2, height - 85

    # Vẽ nền viên thuốc (pill) mờ
    draw.rounded_rectangle(
        [cx - box_w // 2, cy - box_h // 2, cx + box_w // 2, cy + box_h // 2],
        radius=18,
        fill=(15, 23, 42, 210),
        outline=(255, 255, 255, 60),
        width=2
    )

    # Vẽ chữ phụ đề
    draw.text((cx, cy), display_text, fill=(255, 255, 255, 255), anchor="mm", align="center")

    output_png_path.parent.mkdir(parents=True, exist_ok=True)
    overlay.save(output_png_path, "PNG")


def _generate_procedural_bgm(output_wav_path: Path, duration_seconds: float = 30.0):
    """Tạo nhạc nền synth/arpeggio vui nhộn, không bản quyền bằng numpy."""
    sample_rate = 44100
    total_samples = int(sample_rate * duration_seconds)
    t = np.linspace(0, duration_seconds, total_samples, endpoint=False)

    # Hợp âm vui tươi (C major / G major / Am / F)
    chords = [
        [261.63, 329.63, 392.00],  # C major (C4, E4, G4)
        [196.00, 246.94, 293.66],  # G major (G3, B3, D4)
        [220.00, 261.63, 329.63],  # A minor (A3, C4, E4)
        [174.61, 220.00, 261.63],  # F major (F3, A3, C4)
    ]

    wave_data = np.zeros(total_samples, dtype=np.float32)
    chord_duration = 3.0  # mỗi hợp âm 3 giây

    for i in range(total_samples):
        sec = t[i]
        chord_idx = int((sec / chord_duration) % len(chords))
        freqs = chords[chord_idx]

        # Arpeggio nốt nhẹ nhàng
        arp_step = int((sec * 4) % 3)
        note_freq = freqs[arp_step]

        # Sóng tổng hợp sine + triangle ấm áp
        sample = 0.5 * np.sin(2 * np.pi * note_freq * sec) + 0.2 * np.sin(4 * np.pi * note_freq * sec)
        # Nhịp bass nhẹ
        bass_freq = freqs[0] / 2
        sample += 0.3 * np.sin(2 * np.pi * bass_freq * sec)

        wave_data[i] = sample

    # Chuẩn hóa âm lượng và áp dụng envelope fade in/out
    fade_len = int(sample_rate * 1.5)
    fade_in = np.linspace(0.0, 1.0, fade_len)
    fade_out = np.linspace(1.0, 0.0, fade_len)
    wave_data[:fade_len] *= fade_in
    wave_data[-fade_len:] *= fade_out

    # Giảm âm lượng nhạc nền để không lấn át thuyết minh (ducking sẵn ở mức dịu)
    wave_data = wave_data * 0.15

    # Ghi ra file WAV 16-bit PCM
    output_wav_path.parent.mkdir(parents=True, exist_ok=True)
    int_data = (wave_data * 32767).astype(np.int16)
    with wave.open(str(output_wav_path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int_data.tobytes())


def _assemble_scene_clip(
    video_clip_path: Path,
    voice_audio_path: Optional[Path],
    subtitle_text: str,
    output_scene_path: Path,
    enable_subtitles: bool = True
):
    """Ghép video clip, audio thuyết minh và phụ đề cho 1 cảnh cụ thể."""
    ffmpeg_exe = _get_ffmpeg_executable()
    output_scene_path.parent.mkdir(parents=True, exist_ok=True)

    subtitle_png = output_scene_path.parent / f"{output_scene_path.stem}_sub.png"
    if enable_subtitles and subtitle_text:
        _create_subtitle_card(subtitle_text, subtitle_png)

    # Xây dựng lệnh FFmpeg xử lý
    inputs = ["-i", str(video_clip_path)]
    filter_complex = []

    if enable_subtitles and subtitle_png.exists():
        inputs.extend(["-i", str(subtitle_png)])
        filter_complex.append("[0:v][1:v]overlay=0:0[v_out]")
        video_map = "[v_out]"
    else:
        video_map = "0:v"

    has_audio = voice_audio_path and voice_audio_path.exists() and voice_audio_path.stat().st_size > 1000
    if has_audio:
        inputs.extend(["-i", str(voice_audio_path)])
        audio_idx = 2 if (enable_subtitles and subtitle_png.exists()) else 1
        audio_map = f"{audio_idx}:a"
    else:
        audio_map = None

    cmd = [ffmpeg_exe, "-y"] + inputs

    if filter_complex:
        cmd.extend(["-filter_complex", ";".join(filter_complex)])

    cmd.extend(["-map", video_map])

    if audio_map:
        cmd.extend(["-map", audio_map, "-c:a", "aac", "-b:a", "128k"])
    else:
        # Tạo track âm thanh tĩnh nếu không có voiceover
        cmd.extend(["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100", "-c:a", "aac", "-shortest"])

    cmd.extend([
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        str(output_scene_path)
    ])

    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)


def _concatenate_and_add_bgm(
    scene_clip_paths: List[Path],
    final_output_path: Path,
    enable_bgm: bool = True,
    total_duration: float = 20.0
):
    """Ghép nối danh sách các clip cảnh và hòa âm BGM hoàn chỉnh."""
    ffmpeg_exe = _get_ffmpeg_executable()
    temp_dir = final_output_path.parent / "temp_assembly"
    temp_dir.mkdir(parents=True, exist_ok=True)

    # 1. Tạo file concat list
    concat_file = temp_dir / "concat_list.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        for p in scene_clip_paths:
            escaped_path = str(p.resolve()).replace("\\", "/")
            f.write(f"file '{escaped_path}'\n")

    assembled_no_bgm = temp_dir / "assembled_no_bgm.mp4"
    cmd_concat = [
        ffmpeg_exe,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-pix_fmt", "yuv420p",
        str(assembled_no_bgm)
    ]
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # 2. Xử lý Background Music nếu được bật
    if enable_bgm:
        bgm_wav = temp_dir / "procedural_bgm.wav"
        _generate_procedural_bgm(bgm_wav, duration_seconds=max(total_duration + 5.0, 30.0))

        # Hòa âm track thoại và track BGM qua amix filter
        cmd_final = [
            ffmpeg_exe,
            "-y",
            "-i", str(assembled_no_bgm),
            "-i", str(bgm_wav),
            "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2[a_out]",
            "-map", "0:v",
            "-map", "[a_out]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            str(final_output_path)
        ]
        subprocess.run(cmd_final, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    else:
        # Không có BGM -> copy trực tiếp
        import shutil
        shutil.copy2(assembled_no_bgm, final_output_path)


async def assemble_final_video(
    scenes: List[SceneData],
    task_output_dir: Path,
    enable_subtitles: bool = True,
    enable_bgm: bool = True
) -> Path:
    """
    Bước 5: Ghép nối tất cả các phân cảnh, phụ đề, âm thanh thành video hoàn chỉnh.
    """
    final_video_path = task_output_dir / "final_video.mp4"
    scene_clips = []
    total_dur = 0.0

    loop = asyncio.get_running_loop()

    for idx, scene in enumerate(scenes):
        scene_num = scene.scene_number
        clip_path = Path(scene.video_clip_path) if scene.video_clip_path else None
        audio_path = Path(scene.audio_path) if scene.audio_path else None

        if not clip_path or not clip_path.exists():
            raise FileNotFoundError(f"Clip video cho cảnh {scene_num} không tồn tại: {clip_path}")

        assembled_scene_path = task_output_dir / "clips" / f"assembled_scene_{scene_num}.mp4"

        # Chạy lắp ghép từng cảnh
        await loop.run_in_executor(
            None,
            _assemble_scene_clip,
            clip_path,
            audio_path,
            scene.voiceover,
            assembled_scene_path,
            enable_subtitles
        )

        scene_clips.append(assembled_scene_path)
        total_dur += scene.duration_seconds

    # Ghép tất cả các cảnh và hòa âm BGM
    await loop.run_in_executor(
        None,
        _concatenate_and_add_bgm,
        scene_clips,
        final_video_path,
        enable_bgm,
        total_dur
    )

    logger.info(f"Đã xuất video hoàn chỉnh thành công: {final_video_path}")
    return final_video_path
