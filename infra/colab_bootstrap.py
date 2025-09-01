
from textwrap import dedent
print(dedent("""
# Paste in a Colab cell:
!pip -q install -U pip
!pip -q install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
from google.colab import drive; drive.mount('/content/drive')
!git clone https://github.com/YOUR/repo && cd repo && pip install -r requirements.txt
!python train.py --epochs 5
"""))
