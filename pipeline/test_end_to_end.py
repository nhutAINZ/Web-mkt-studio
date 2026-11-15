"""
Automated Test Suite for End-to-End AI Video Generation Pipeline
Kiểm thử tuần tự 5 bước độc lập và toàn diện:
1. Input tiếp nhận
2. Kịch bản phân đoạn JSON (LLM Gemini / Fallback)
3. Sinh ảnh AI từng cảnh (Image Gen)
4. Sinh chuyển động video từ ảnh (Motion Engine)
5. Ghép nối, lồng tiếng TTS, nhạc nền BGM & xuất MP4
"""
import asyncio
import os
import sys
from pathlib import Path

# Thêm root path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from pipeline.backend.config import settings
from pipeline.backend.services import llm_service, image_service, video_service, tts_service, assembly_service


async def run_pipeline_test():
    print("\n========================================================")
    print("🎬 BẮT ĐẦU KIỂM THỬ END-TO-END VIDEO GENERATION PIPELINE")
    print("========================================================\n")

    topic = "Cậu bé 7 tuổi chế tạo siêu robot biến hình từ khối đồ chơi Lego"
    style = "brick-toy"
    scene_count = 3  # Test nhanh với 3 cảnh
    test_output_dir = settings.output_dir / "test_run"
    img_dir = test_output_dir / "images"
    audio_dir = test_output_dir / "audio"
    clips_dir = test_output_dir / "clips"

    for d in [img_dir, audio_dir, clips_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # --------------------------------------------------------------------------
    # BƯỚC 1 & 2: Kịch bản phân đoạn (LLM)
    # --------------------------------------------------------------------------
    print("👉 [Bước 2] Đang kiểm thử sinh kịch bản phân đoạn...")
    script = await llm_service.generate_script(
        topic=topic,
        style=style,
        scene_count=scene_count
    )
    assert script is not None, "Script không được là None"
    assert len(script.scenes) == scene_count, f"Số cảnh phải bằng {scene_count}"
    print(f"   ✅ Kịch bản '{script.title}' gồm {len(script.scenes)} cảnh:")
    for sc in script.scenes:
        print(f"      - Cảnh {sc.scene_number}: {sc.title} | {sc.camera_motion} | {sc.duration_seconds}s")
        print(f"        Prompt EN: {sc.visual_prompt[:60]}...")
        print(f"        Voice VI : {sc.voiceover}")

    # --------------------------------------------------------------------------
    # BƯỚC 3: Sinh hình ảnh từng cảnh
    # --------------------------------------------------------------------------
    print("\n👉 [Bước 3] Đang kiểm thử tạo hình ảnh AI cho các cảnh...")
    for sc in script.scenes:
        img_p = await image_service.generate_scene_image(
            prompt=sc.visual_prompt,
            output_dir=img_dir,
            scene_number=sc.scene_number,
            title=sc.title,
            style=style
        )
        assert img_p.exists(), f"File ảnh cảnh {sc.scene_number} không tồn tại"
        assert img_p.stat().st_size > 10000, f"File ảnh quá nhỏ ({img_p.stat().st_size} bytes)"
        sc.image_path = str(img_p)
        print(f"   ✅ Cảnh {sc.scene_number}: Đã tạo ảnh thành công ({img_p.stat().st_size // 1024} KB)")

    # --------------------------------------------------------------------------
    # BƯỚC 4: Sinh âm thanh TTS & chuyển động video từ ảnh
    # --------------------------------------------------------------------------
    print("\n👉 [Bước 4] Đang kiểm thử sinh giọng đọc thuyết minh & render clip chuyển động...")
    for sc in script.scenes:
        # TTS
        audio_p, dur = await tts_service.generate_scene_voiceover(
            text=sc.voiceover,
            output_dir=audio_dir,
            scene_number=sc.scene_number
        )
        assert audio_p.exists(), f"File audio cảnh {sc.scene_number} không tồn tại"
        sc.audio_path = str(audio_p)
        sc.duration_seconds = max(sc.duration_seconds, dur + 0.5)

        # Video clip
        clip_p = await video_service.generate_scene_video(
            image_path=Path(sc.image_path),
            output_dir=clips_dir,
            scene_number=sc.scene_number,
            duration=sc.duration_seconds,
            motion_type=sc.camera_motion
        )
        assert clip_p.exists(), f"File video clip cảnh {sc.scene_number} không tồn tại"
        sc.video_clip_path = str(clip_p)
        print(f"   ✅ Cảnh {sc.scene_number}: Đã render clip ({sc.duration_seconds:.1f}s, {sc.camera_motion}, {clip_p.stat().st_size // 1024} KB)")

    # --------------------------------------------------------------------------
    # BƯỚC 5: Ghép nối, hòa âm BGM & xuất MP4
    # --------------------------------------------------------------------------
    print("\n👉 [Bước 5] Đang kiểm thử ghép nối hoàn chỉnh (Assembly & Export)...")
    final_video = await assembly_service.assemble_final_video(
        scenes=script.scenes,
        task_output_dir=test_output_dir,
        enable_subtitles=True,
        enable_bgm=True
    )
    assert final_video.exists(), "File video MP4 hoàn chỉnh không tồn tại"
    size_mb = final_video.stat().st_size / (1024 * 1024)
    assert size_mb > 0.1, f"Kích thước file video quá nhỏ ({size_mb} MB)"
    print(f"   ✅ Video MP4 xuất bản hoàn chỉnh: {final_video}")
    print(f"   ✅ Dung lượng: {size_mb:.2f} MB")

    print("\n========================================================")
    print("🎉 TẤT CẢ 5 BƯỚC PIPELINE ĐÃ VƯỢT QUA KIỂM THỬ THÀNH CÔNG 100%!")
    print("========================================================\n")


if __name__ == "__main__":
    asyncio.run(run_pipeline_test())
