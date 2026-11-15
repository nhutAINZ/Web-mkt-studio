"""
Pydantic Schemas for AI Video Generation Pipeline
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class SceneData(BaseModel):
    scene_number: int = Field(..., description="Thứ tự phân cảnh (bắt đầu từ 1)")
    title: str = Field(default="", description="Tiêu đề ngắn của phân cảnh")
    visual_prompt: str = Field(
        ...,
        description="Mô tả hình ảnh chi tiết bằng tiếng Anh dùng làm prompt sinh ảnh (bao gồm nhân vật, hành động, ánh sáng, góc máy)"
    )
    voiceover: str = Field(
        ...,
        description="Lời thoại hoặc lời dẫn thuyết minh tương ứng bằng tiếng Việt"
    )
    duration_seconds: float = Field(default=5.0, description="Thời lượng cảnh tính bằng giây")
    camera_motion: str = Field(
        default="dolly_in",
        description="Hiệu ứng chuyển động máy quay (dolly_in, dolly_out, orbit_pan, dutch_tilt, zoom_punch)"
    )
    transition: str = Field(
        default="crossfade",
        description="Hiệu ứng chuyển cảnh (crossfade, fade_black, whip_pan)"
    )
    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    video_clip_path: Optional[str] = None


class ScriptResponse(BaseModel):
    title: str = Field(..., description="Tiêu đề kịch bản phim ngắn")
    style: str = Field(default="brick-toy", description="Phong cách hình ảnh")
    target_audience: str = Field(default="Trẻ em & Gia đình", description="Đối tượng khán giả")
    total_duration: float = Field(default=20.0, description="Tổng thời lượng ước tính")
    scenes: List[SceneData] = Field(..., description="Danh sách các cảnh trong kịch bản")


class VideoGenerationRequest(BaseModel):
    topic: str = Field(..., description="Ý tưởng hoặc chủ đề video cần sản xuất")
    style: str = Field(default="brick-toy", description="Phong cách: brick-toy, 3d-pixar, anime, claymation, 2d-cartoon, chibi")
    scene_count: int = Field(default=4, ge=2, le=8, description="Số lượng phân cảnh (từ 2 đến 8)")
    gemini_api_key: Optional[str] = None
    image_provider: Optional[str] = None
    video_provider: Optional[str] = None
    tts_voice: Optional[str] = None
    enable_subtitles: bool = True
    enable_bgm: bool = True


class TaskStatus(BaseModel):
    task_id: str
    step: int = Field(1, description="Bước hiện tại: 1 (Input), 2 (Script), 3 (Images), 4 (Video Clips), 5 (Assembly), 6 (Completed)")
    step_name: str = "Khởi tạo tác vụ"
    progress: int = 0  # 0 to 100
    details: str = "Đang chuẩn bị không gian làm việc..."
    script: Optional[ScriptResponse] = None
    scenes: List[SceneData] = []
    final_video_path: Optional[str] = None
    final_video_url: Optional[str] = None
    error: Optional[str] = None
    completed: bool = False
