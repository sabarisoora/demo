# Rebuild the kit

1. Edit `config.json` (prices, commission phases and dates, placeholders such as sales-page URLs).
2. Edit a niche in `packs/<niche>.py` if needed. Add a new niche by copying a pack (keep the 30 hooks in the same angle order).
3. Run `python3 build_kit.py` (add `--no-graphics` if Node.js/Playwright is not installed).
4. Run `python3 qa_kit.py` and fix anything it reports.
