"""
Khởi chạy Streamlit Frontend UI cho Video Generation Studio
"""
import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
APP_PATH = ROOT_DIR / "pipeline" / "frontend" / "streamlit_app.py"

if __name__ == "__main__":
    print(f"🎬 Khởi chạy Lumina Video Studio UI tại http://localhost:8501")
    cmd = [
        sys.executable,
        "-m", "streamlit", "run",
        str(APP_PATH),
        "--server.port=8501",
        "--server.headless=true",
        "--theme.base=dark"
    ]
    subprocess.run(cmd)
