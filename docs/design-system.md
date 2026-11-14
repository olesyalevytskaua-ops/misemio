# Misemio — Design system v1.0 (source of truth)

Live: app https://claude.ai/artifact/Jvo14J38BK41eYgzDctkgi · DS page at /ds (ds/index.html, same artifact).
Code: assets/tokens.css (only file with raw values) · assets/components.css · assets/ui.js (MM.* components) · assets/app.js (screens).

## Rules (every screen is checked against these)
1. Tokens only. Raw colours live only in tokens.css. Components/screens use semantic tokens (--bg, --text, --text-strong, --text-2, --line, --surface, --action-bg/fg, --accent-bg/fg, --selected-bg/fg, --focus, --glyph, --decor), never primitives (--mm-*).
2. Compose, don't restyle. Screens are built from MM.* components. A missing component is added to /ds first (states + notes), then used.
3. One serif moment per screen: exactly one MM.display() at 44px.
4. Colour hierarchy 60/25/10/5: Paper · sage surfaces · deep sage actions · clay details. Food photography brings warm colour; no pink/red/orange in UI.
5. Sage #A4B79F is a surface, never text (1.9:1 on paper).
6. Accent (chartreuse) max once per light screen; it is the primary action in dark mode.
7. Square corners. Round only for monogram, dots, toggles.
8. 44px minimum targets; icon buttons have accessible names; visible focus (--focus).
9. Contrast AA minimum, AAA for body text — checked live on /ds for both themes.
10. Undo, not confirm (toast with Undo, 5 s).
11. Explain defaults ("Optional. Unfiled recipes wait in Unsorted.").
12. No guilt, no streaks; progress only for the task in hand.
13. Your recipes are yours: export always available in Me.
14. Respect reduced motion (motion tokens drop to 0).

## Primitives
Paper #F6F3ED · Ink #1F1B18 · Deep Sage #314E41 · Sage #A4B79F · Sage Pale #E5E9DE · Sage Mist #D5DDCD · Linen #E9E4D6 · Sage Wash #DDE3D4 · Moss #556B57 (secondary text) · Hairline #C9D4C0 · Lichen #8FA38A (placeholder glyph) · Clay #D7C4AF (decor) · Chartreuse #D3DE66 · Deep Sage 2 #3B5A4C · Deep Sage 3 #2A4338 · Fern #5F7A6B · Sage Ink #2F3A30.
Light = Option B (paper bg, deep sage actions). Dark = Option C (deep sage bg, chartreuse actions, paper text, hairline secondary).

## Type
Cormorant Garamond italic (display 44/32/24, serif 18) · DM Sans (body 15, small 13) · DM Mono uppercase tracked 0.16em (labels 10/11, buttons 13 @0.2em, tabs 9).

## Spacing / size / motion
4-pt scale --s-1…--s-14; gutter 24. Hit 44, primary control 60, tab bar 84, column max 430. Radius 0. Motion 120/240/420ms, ease cubic-bezier(.2,.7,.2,1).

## Components (MM.*)
button (primary/accent/secondary/ghost, m/l) · iconButton · chip/chips · tag · segmented · stepper · toggle · check · searchField · textField · photo (placeholder: letter + tone 1–4, sprig + caption ≥100px) · monogram · topbar · section · listRow/list · indexRow (contents-page row: number = drag handle, serif title, count, arrow; add variant) · stats · dataRow · progress · empty · tabbar (Library, Collections, Import, Menu, Me; active = solid tile) · rail · sheet/option · toast (undo) · actionbar.

## Decisions
- Collections layout: Option 2 · index, no photos (chosen 2026-11-14). Numbered MM.indexRow list, drag by the number, "+ New collection" as the last row.
- Dark --surface = Deep Sage 3 (sunken), so body text on fields/tags is AAA (9.7:1).
