"""Download diagnostic photos only; do not bundle these into the application."""
from pathlib import Path
import urllib.request, zipfile, io
Path("fixtures").mkdir(exist_ok=True)
for category in ["cardboard", "glass", "plastic", "metal", "paper", "trash"]:
    url = f"https://raw.githubusercontent.com/Ebuka24Stephen/trashnet-dataset/main/{category}/{category}1.jpg"
    urllib.request.urlretrieve(url, f"fixtures/{category}.jpg")
url = "https://huggingface.co/datasets/UdaraChamidu/Garbage-Classification-with-12-classes/resolve/main/garbage_classification.zip"
archive = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(url).read()))
for category in ["battery", "biological"]:
    names = sorted(n for n in archive.namelist() if f"/{category}/" in n and n.endswith(".jpg"))
    for i, name in enumerate(names[:3]):
        Path(f"fixtures/{category}{i}.jpg").write_bytes(archive.read(name))
print("Fixtures downloaded. Sources are documented in README.md.")
