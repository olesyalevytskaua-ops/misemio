# Misemio — personal recipe library (web app)

Run: `python3 -m http.server 8000` → http://localhost:8000 (app) and http://localhost:8000/ds/ (design system).

## Structure
- `assets/tokens.css` — the ONLY file with raw colour/size values (primitives `--mm-*` → semantic tokens, light + dark themes)
- `assets/components.css` — component classes (`.mm-*`), semantic tokens only
- `assets/ui.js` — component functions `MM.*` (button, iconButton, chip, tag, segmented, stepper, toggle, timer, check, searchField, textField, photo, monogram, topbar, section, listRow, indexRow, stats, dataRow, progress, empty, tabbar, rail, sheet, option, toast, actionbar, splash)
- `assets/app.js` — screens (hash routes: library, search, recipe-<id>, cook-<id>, collections, collection-<id>, import, import-review, menu, grocery, me)
- `ds/index.html` — design system page; renders the real components and runs a live audit

## Design-system rules (must follow)
1. Tokens only: no hex/rgb outside tokens.css; components and screens never use `--mm-*` primitives directly.
2. Compose screens from `MM.*`. New component → add to `ui.js` + `components.css` + document it on `/ds` (preview, usage, notes) BEFORE using it.
3. One serif moment per screen: exactly one `MM.display()` (44px).
4. Colour 60/25/10/5: paper · sage surfaces · deep sage actions · clay details. No pink/red/orange in UI.
5. Sage (#A4B79F) is never text.
6. Chartreuse accent max once per light screen; it is the primary action in dark mode.
7. Square corners; round only for monogram, dots, toggles.
8. Targets ≥ 44px, icon buttons need an accessible name, focus visible.
9. Contrast AA minimum, AAA for body text (check on /ds, both themes).
10. Undo toast instead of confirm dialogs.
11. Explain defaults; no guilt, no streaks.
12. Export always available. Respect prefers-reduced-motion.
After any change, open /ds and confirm the Live audit shows PASS everywhere.

Type: Cormorant Garamond (italic display), DM Sans (body), DM Mono (uppercase tracked labels).
Light = Option B (paper bg, deep sage actions). Dark = Option C (deep sage bg, chartreuse actions).
