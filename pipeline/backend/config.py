"""
Configuration & Settings for End-to-End AI Video Generation Pipeline
"""
from pathlib import Path
from typing import Dict
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
STATIC_DIR = BASE_DIR / "static"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    # LLM Settings
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Image Gen Settings
    image_provider: str = "pollinations"  # pollinations, openai, imagen
    openai_api_key: str = ""

    # Video Gen Settings
    video_provider: str = "motion_engine"  # motion_engine, runway, luma, svd
    runway_api_secret: str = ""
    luma_api_key: str = ""

    # TTS Settings
    tts_provider: str = "edge_tts"  # edge_tts, gtts
    tts_voice: str = "vi-VN-HoaiMyNeural"  # or vi-VN-NamMinhNeural

    # Server Settings
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_port: int = 8501

    # Directory Paths
    base_dir: Path = BASE_DIR
    output_dir: Path = OUTPUT_DIR
    static_dir: Path = STATIC_DIR

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Style Presets
STYLE_PRESETS: Dict[str, Dict[str, str]] = {
    "brick-toy": {
        "name": "Đồ chơi Xếp hình (Brick-Toy)",
        "prompt_prefix": "Lego brick-toy style, miniature plastic toy world, bright primary colors, macro photography, 8k octane render",
        "bgm_tempo": "playful_upbeat"
    },
    "3d-pixar": {
        "name": "Hoạt hình 3D Pixar / Disney",
        "prompt_prefix": "3D Pixar animation style, warm studio lighting, expressive charming characters, rich subsurface scattering, cinematic 4k",
        "bgm_tempo": "cheerful_inspiring"
    },
    "anime": {
        "name": "Hoạt họa Anime Rực rỡ",
        "prompt_prefix": "Makoto Shinkai anime aesthetic, lush colorful scenery, gorgeous volumetric clouds, cel-shaded characters, vibrant",
        "bgm_tempo": "emotional_adventure"
    },
    "claymation": {
        "name": "Đất nặn Thủ công (Claymation)",
        "prompt_prefix": "Claymation stop-motion style, handcrafted plasticine textures, playful subtle thumbprints, tactile miniature studio lighting",
        "bgm_tempo": "quirky_fun"
    },
    "2d-cartoon": {
        "name": "Hoạt hình 2D Hiện đại",
        "prompt_prefix": "Modern 2D children cartoon style, bold clean lineart, vibrant flat pastel colors, cheerful and safe aesthetic",
        "bgm_tempo": "light_playful"
    },
    "chibi": {
        "name": "Dễ thương Chibi Kawaii",
        "prompt_prefix": "Super cute chibi style, oversized expressive eyes, adorable tiny bodies, kawaii colorful playground, pastel lighting",
        "bgm_tempo": "cute_bouncy"
    }
}
