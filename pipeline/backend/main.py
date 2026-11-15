"""
FastAPI Backend: End-to-End AI Video Generation Pipeline
Cung cấp REST API & Server-Sent Events (SSE) theo dõi tiến trình 5 bước theo thời gian thực.
"""
import asyncio
import logging
import uuid
from pathlib import Path
from typing import Dict
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

from pipeline.backend.config import settings, STYLE_PRESETS
from pipeline.backend.models import VideoGenerationRequest, TaskStatus, SceneData
from pipeline.backend.services import llm_service, image_service, video_service, tts_service, assembly_service

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("video_pipeline")

app = FastAPI(
    title="End-to-End AI Video Generation Pipeline",
    description="Hệ thống tự động hóa hoàn chỉnh sản xuất video ngắn AI 5 bước: Input -> Script -> Image -> Video -> Assembly & Export",
    version="2.0.0"
)

# Kích hoạt CORS để frontend dễ dàng kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thư mục lưu trữ bộ nhớ trạng thái tác vụ
TASKS: Dict[str, TaskStatus] = {}

# Mount static và output files
app.mount("/static", StaticFiles(directory=str(settings.static_dir)), name="static")
app.mount("/output", StaticFiles(directory=str(settings.output_dir)), name="output")


async def run_pipeline_task(task_id: str, req: VideoGenerationRequest):
    """
    Quy trình bất đồng bộ 5 bước hoàn chỉnh:
    Bước 1: Input & Thiết lập
    Bước 2: Script Generation (LLM Gemini)
    Bước 3: Image Generation (Pollinations / DALL-E)
    Bước 4: Video Generation (Motion Engine / I2V)
    Bước 5: Assembly & Export (FFmpeg / MoviePy)
    """
    task = TASKS[task_id]
    task_dir = settings.output_dir / task_id
    img_dir = task_dir / "images"
    audio_dir = task_dir / "audio"
    clips_dir = task_dir / "clips"

    for d in [img_dir, audio_dir, clips_dir]:
        d.mkdir(parents=True, exist_ok=True)

    try:
        # ----------------------------------------------------------------------
        # BƯỚC 1: Tiếp Nhận Input
        # ----------------------------------------------------------------------
        task.step = 1
        task.step_name = "Tiếp nhận ý tưởng"
        task.progress = 10
        task.details = f"Chủ đề: '{req.topic}' | Phong cách: {req.style} | Số cảnh: {req.scene_count}"
        logger.info(f"[{task_id}] Bước 1 hoàn thành. {task.details}")
        await asyncio.sleep(0.5)

        # ----------------------------------------------------------------------
        # BƯỚC 2: Script Generation (LLM Gemini)
        # ----------------------------------------------------------------------
        task.step = 2
        task.step_name = "Đang viết kịch bản..."
        task.progress = 25
        task.details = "Gemini API đang phân tích chủ đề và phân cảnh điện ảnh..."
        logger.info(f"[{task_id}] Bước 2: Bắt đầu sinh kịch bản...")

        script = await llm_service.generate_script(
            topic=req.topic,
            style=req.style,
            scene_count=req.scene_count,
            api_key=req.gemini_api_key
        )
        task.script = script
        task.scenes = script.scenes
        task.details = f"Đã tạo kịch bản '{script.title}' với {len(script.scenes)} phân cảnh."
        logger.info(f"[{task_id}] Bước 2 hoàn thành: {script.title}")
        await asyncio.sleep(0.5)

        # ----------------------------------------------------------------------
        # BƯỚC 3: Image Generation
        # ----------------------------------------------------------------------
        task.step = 3
        task.step_name = "Đang tạo hình ảnh..."
        task.progress = 45
        logger.info(f"[{task_id}] Bước 3: Bắt đầu tạo hình ảnh cho {len(task.scenes)} cảnh...")

        for idx, scene in enumerate(task.scenes):
            pct = 45 + int((idx / len(task.scenes)) * 20)
            task.progress = pct
            task.details = f"Đang vẽ cảnh {scene.scene_number}/{len(task.scenes)}: {scene.title}"

            img_path = await image_service.generate_scene_image(
                prompt=scene.visual_prompt,
                output_dir=img_dir,
                scene_number=scene.scene_number,
                title=scene.title,
                style=req.style,
                provider=req.image_provider
            )
            scene.image_path = str(img_path)
            logger.info(f"[{task_id}] Cảnh {scene.scene_number} ảnh đã xong: {img_path}")

        # ----------------------------------------------------------------------
        # BƯỚC 4: Video Generation (I2V / Motion Engine) & Audio TTS
        # ----------------------------------------------------------------------
        task.step = 4
        task.step_name = "Đang render video..."
        task.progress = 68
        logger.info(f"[{task_id}] Bước 4: Bắt đầu sinh âm thanh và chuyển động video...")

        for idx, scene in enumerate(task.scenes):
            pct = 68 + int((idx / len(task.scenes)) * 18)
            task.progress = pct
            task.details = f"Đang sinh giọng đọc & render chuyển động máy quay ({scene.camera_motion}) cho cảnh {scene.scene_number}..."

            # 4.1 Sinh thuyết minh tiếng Việt
            audio_path, dur = await tts_service.generate_scene_voiceover(
                text=scene.voiceover,
                output_dir=audio_dir,
                scene_number=scene.scene_number,
                voice=req.tts_voice
            )
            scene.audio_path = str(audio_path)
            # Điều chỉnh thời lượng cảnh nếu giọng đọc dài hơn
            scene.duration_seconds = max(scene.duration_seconds, dur + 0.5)

            # 4.2 Render chuyển động video từ ảnh
            clip_path = await video_service.generate_scene_video(
                image_path=Path(scene.image_path),
                output_dir=clips_dir,
                scene_number=scene.scene_number,
                duration=scene.duration_seconds,
                motion_type=scene.camera_motion,
                provider=req.video_provider
            )
            scene.video_clip_path = str(clip_path)

        # ----------------------------------------------------------------------
        # BƯỚC 5: Assembly & Export
        # ----------------------------------------------------------------------
        task.step = 5
        task.step_name = "Đang ghép nối & xuất MP4..."
        task.progress = 88
        task.details = "Đang ghép nối phân cảnh, chèn phụ đề, hòa âm nhạc nền BGM và nén MP4..."
        logger.info(f"[{task_id}] Bước 5: Bắt đầu ghép nối hoàn thiện video...")

        final_video_path = await assembly_service.assemble_final_video(
            scenes=task.scenes,
            task_output_dir=task_dir,
            enable_subtitles=req.enable_subtitles,
            enable_bgm=req.enable_bgm
        )

        task.final_video_path = str(final_video_path)
        task.final_video_url = f"/api/video/{task_id}"
        task.step = 6
        task.step_name = "Hoàn thành"
        task.progress = 100
        task.completed = True
        task.details = f"Video đã xuất bản thành công! Kích thước: {final_video_path.stat().st_size / (1024*1024):.2f} MB"
        logger.info(f"[{task_id}] TOÀN BỘ PIPELINE HOÀN THÀNH XUẤT SẮC!")

    except Exception as e:
        logger.exception(f"[{task_id}] Lỗi pipeline: {e}")
        task.error = str(e)
        task.step_name = "Lỗi xử lý"
        task.details = f"Đã xảy ra lỗi: {e}"


@app.post("/api/generate", response_model=Dict[str, str])
async def create_video_generation(req: VideoGenerationRequest, background_tasks: BackgroundTasks):
    """Bắt đầu tiến trình tạo video tự động 5 bước."""
    task_id = str(uuid.uuid4())[:8]
    TASKS[task_id] = TaskStatus(task_id=task_id)
    background_tasks.add_task(run_pipeline_task, task_id, req)
    return {"task_id": task_id, "status": "processing", "message": "Tiến trình đã được khởi tạo thành công!"}


@app.get("/api/status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Kiểm tra trạng thái tác vụ hiện tại."""
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Không tìm thấy task_id")
    return TASKS[task_id]


@app.get("/api/progress/stream/{task_id}")
async def stream_task_progress(task_id: str):
    """Server-Sent Events (SSE) đẩy tiến trình theo thời gian thực về frontend."""
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Không tìm thấy task_id")

    async def event_generator():
        while True:
            task = TASKS.get(task_id)
            if not task:
                break
            yield {
                "event": "progress",
                "data": task.model_dump_json()
            }
            if task.completed or task.error:
                break
            await asyncio.sleep(0.5)

    return EventSourceResponse(event_generator())


@app.get("/api/video/{task_id}")
async def download_final_video(task_id: str):
    """Tải về hoặc phát trực tiếp video MP4 hoàn chỉnh."""
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Không tìm thấy task_id")
    task = TASKS[task_id]
    if not task.final_video_path or not Path(task.final_video_path).exists():
        raise HTTPException(status_code=404, detail="Video chưa sẵn sàng hoặc render thất bại")

    return FileResponse(
        path=task.final_video_path,
        media_type="video/mp4",
        filename=f"video_{task_id}.mp4"
    )


@app.get("/api/health")
async def health_check():
    """Kiểm tra trạng thái server và các dịch vụ hỗ trợ."""
    return {
        "status": "healthy",
        "styles_supported": list(STYLE_PRESETS.keys()),
        "default_voice": settings.tts_voice,
        "default_video_provider": settings.video_provider
    }
