# Merge gamedata + bundle into 1.html (single file)
import re
from pathlib import Path

root = Path(__file__).parent
html_path = root / "1.html"
gamedata_path = root.parent / "gamedata.js"
bundle_path = root / "quantum-bundle.js"

html = html_path.read_text(encoding="utf-8")
gd = gamedata_path.read_text(encoding="utf-8")
# Only games array (no renderItems at end)
cut = gd.find("games.sort")
if cut > 0:
    gd = gd[:cut]
gd = gd.replace("const games", "window.games", 1).strip() + "\n"

bundle = bundle_path.read_text(encoding="utf-8") if bundle_path.exists() else ""

inject = f'<script>\n{gd}\n</script>\n<script>\n{bundle}\n</script>\n'

marker = "<!-- ======================== -->\n<!-- LUCIDE ICONS CDN SCRIPT  -->"
if marker not in html:
    marker = '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>'
    html = html.replace(marker, inject + marker, 1)
else:
    html = html.replace(marker, inject + marker, 1)

# Scramjet scripts after </style> if missing
if "scramjet.js" not in html:
    html = html.replace(
        "</style>",
        '</style>\n<script src="https://intelligent-dedication-production-f8d8.up.railway.app/scramjet/scramjet.js"></script>\n<script src="https://intelligent-dedication-production-f8d8.up.railway.app/controller/controller.api.js"></script>',
        1,
    )

html_path.write_text(html, encoding="utf-8")
print("Merged into 1.html")
