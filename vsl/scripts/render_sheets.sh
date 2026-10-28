#!/usr/bin/env bash
# Renders the real workbook sheets + guide pages used in the video (not committed: they show the paid product).
# Usage: scripts/render_sheets.sh <path to unzipped Auto_Repair_Shop_..._Complete_2026 folder>
set -euo pipefail
SRC="$1"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TMP="$(mktemp -d)"
cp "$SRC"/01_Essential_Package/01_Workbook/*.xlsx "$TMP/ess.xlsx"
cp "$SRC"/02_Elite_Package/01_Workbook/*.xlsx "$TMP/elite.xlsx"
(cd "$TMP" && soffice --headless --convert-to 'pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}' ess.xlsx elite.xlsx --outdir . >/dev/null)
mkdir -p "$ROOT/public/sheets" "$ROOT/public/docs"
while read -r f n name; do
  pdftoppm -f "$n" -l "$n" -r 220 -x 0 -y 0 -W 3600 -H 2600 -png "$TMP/$f.pdf" "$TMP/p"; mv "$TMP"/p-*.png "$ROOT/public/sheets/$name.png"
done <<'LIST'
ess 4 ro-entry
ess 5 expense-entry
ess 6 tax
ess 7 dashboard
ess 8 accountant
ess 9 health-snapshot
ess 1 start
ess 3 setup
elite 2 command-center
elite 8 technicians
elite 14 comebacks
elite 17 cashflow
elite 18 receivables
elite 24 kpi
elite 25 health-score
elite 26 profit-leak
elite 27 forecast
elite 28 benchmark
elite 31 monthly-review
elite 37 deductions
elite 38 tax-readiness
elite 22 bays
elite 3 leads
elite 11 inventory
elite 19 customers
LIST
python3 -I - "$ROOT/public/sheets" <<'PY'
import sys, glob
from PIL import Image, ImageChops
for f in glob.glob(sys.argv[1] + "/*.png"):
    im = Image.open(f).convert("RGB"); b = ImageChops.difference(im, Image.new("RGB", im.size, "white")).getbbox()
    im.crop((0, 0, min(im.width, b[2] + 20), min(im.height, b[3] + 20))).save(f, optimize=True)
PY
pdftoppm -f 1 -l 1 -r 90 -png "$SRC"/02_Elite_Package/02_Field_Guide/*.pdf "$ROOT/public/docs/field-guide"
pdftoppm -f 3 -l 3 -r 90 -png "$SRC"/01_Essential_Package/03_Quick_Start/*.pdf "$ROOT/public/docs/qs-p3"
rm -rf "$TMP"
