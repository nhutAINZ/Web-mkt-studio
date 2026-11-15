"""
Khởi chạy FastAPI Backend Server cho Video Generation Pipeline
"""
import sys
from pathlib import Path

# Thêm thư mục gốc vào sys.path để import chuẩn module pipeline
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from pipeline.backend.config import settings

if __name__ == "__main__":
    print(f"🎬 Khởi chạy Lumina Video Pipeline Backend tại http://{settings.backend_host}:{settings.backend_port}")
    uvicorn.run(
        "pipeline.backend.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True
    )
