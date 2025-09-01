
#!/usr/bin/env bash
set -euo pipefail
sudo apt update && sudo apt -y install python3-pip ffmpeg git
python3 -m pip install --upgrade pip wheel
pip install aeneas torchaudio librosa pydub
python scripts/forced_alignment.py --input data/ --out aligned/
