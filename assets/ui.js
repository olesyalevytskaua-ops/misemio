/* ==========================================================================
   Misemio — component library (v1.0)
   Each function returns an HTML string built from components.css classes.
   Screens (app.js) and the /ds page render ONLY through these functions.
   ========================================================================== */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const attrs = (o) => Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`)).join(' ');

  /* ---- Icons: one stroke family, 24 grid, 1.2 stroke ------------------- */
  const ICONS = {
    library: 'M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14',
    collections: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    plus: 'M12 5v14M5 12h14',
    menu: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5',
    me: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0M9 14c1.6 1.6 4.4 1.6 6 0M9.5 10h.01M14.5 10h.01',
    search: 'M4 11a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M20 20l-4-4',
    back: 'M15 5l-7 7 7 7',
    chev: 'M9 5l7 7-7 7',
    up: 'M6 15l6-6 6 6',
    down: 'M6 9l6 6 6-6',
    arrow: 'M3 12h17M14 6l6 6-6 6',
    close: 'M6 6l12 12M18 6L6 18',
    heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    sort: 'M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4',
    filter: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
    link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
    text: 'M5 6h14M5 11h14M5 16h9',
    cart: 'M4 5h2l2 11h10l2-8H7M10 20h.01M17 20h.01',
    check: 'M5 12l5 5 9-10',
    shuffle: 'M4 7h4l8 10h4M4 17h4l2-2.5M14 9.5L16 7h4M18 4l3 3-3 3M18 14l3 3-3 3',
    drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
    timer: 'M12 8v5l3 2M12 21a8 8 0 1 0 0-16a8 8 0 1 0 0 16M10 2h4',
    sun: 'M12 16a4 4 0 1 0 0-8a4 4 0 1 0 0 8M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13'
  };
  const icon = (name, { size, label } = {}) =>
    `<svg class="mm-icon${size === 's' ? ' mm-icon--s' : ''}" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}><path d="${ICONS[name] || ''}"/></svg>`;

  /* ---- Text --------------------------------------------------------------- */
  const label = (text, { strong, large, tag = 'p', id } = {}) =>
    `<${tag} ${attrs({ id })} class="mm-label${large ? ' mm-label--l' : ''}${strong ? ' mm-label--strong' : ''}">${esc(text)}</${tag}>`;
  const display = (text, { size, tag = 'h1', id } = {}) =>
    `<${tag} ${attrs({ id })} class="mm-display${size ? ' mm-display--' + size : ''}">${esc(text)}</${tag}>`;
  const meta = (parts) => `<p class="mm-meta">${(Array.isArray(parts) ? parts : [parts]).map(esc).join(' · ')}</p>`;
  const serif = (text, { clamp } = {}) => `<p class="mm-serif${clamp ? ' mm-serif--clamp' : ''}">${esc(text)}</p>`;

  /* ---- Actions ------------------------------------------------------------ */
  // variant: primary | accent | secondary | ghost ; size: m | l ; href => <a>
  const button = (text, { variant = 'primary', size = 'm', href, action, data, block, trailing, center, disabled, ariaLabel, type = 'button' } = {}) => {
    const cls = `mm-btn mm-btn--${variant}${size === 'l' ? ' mm-btn--l' : ''}${block ? ' mm-btn--block' : ''}${center || !trailing ? ' mm-btn--center' : ''}`;
    const inner = `<span>${esc(text)}</span>${trailing ? icon(trailing) : ''}`;
    const common = { class: cls, 'data-action': action, 'data-arg': data, 'aria-label': ariaLabel };
    return href ? `<a ${attrs({ ...common, href })}>${inner}</a>`
                : `<button ${attrs({ ...common, type, disabled })}>${inner}</button>`;
  };
  const iconButton = (name, labelText, { href, action, data, pressed } = {}) => {
    const a = { class: 'mm-iconbtn', 'aria-label': labelText, 'data-action': action, 'data-arg': data };
    if (pressed !== undefined) a['aria-pressed'] = String(!!pressed);
    return href ? `<a ${attrs({ ...a, href })}>${icon(name)}</a>` : `<button type="button" ${attrs(a)}>${icon(name)}</button>`;
  };

  // Timer: a countdown for a step that names a duration. state: idle | running | paused | done
  const clock = (sec) => { const s = Math.max(0, Math.round(sec)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    const p = (n) => String(n).padStart(2, '0'); return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`; };
  const timer = ({ key, label: lbl, left, state = 'idle' } = {}) => {
    const verb = { idle: 'Start', running: 'Pause', paused: 'Resume', done: 'Again' }[state];
    return `<div class="mm-timer" data-state="${esc(state)}">${icon('timer')}
      <span class="mm-timer__body">${label(lbl, { tag: 'span' })}<span class="mm-timer__time" role="timer" ${attrs({ 'data-timer': key })}>${state === 'done' ? 'Done' : clock(left)}</span></span>
      ${button(verb, { variant: 'secondary', action: 'timer', data: key, ariaLabel: `${verb} ${lbl} timer` })}
      ${state !== 'idle' ? iconButton('close', `Reset ${lbl} timer`, { action: 'timer-reset', data: key }) : ''}</div>`;
  };

  /* ---- Choice ------------------------------------------------------------- */
  const chip = (text, { pressed, action, data, href, count } = {}) => {
    const body = esc(text) + (count !== undefined ? ` · ${esc(count)}` : '');
    return href
      ? `<a class="mm-chip" ${attrs({ href, 'aria-current': pressed ? 'true' : undefined })}>${body}</a>`
      : `<button type="button" class="mm-chip" ${attrs({ 'aria-pressed': String(!!pressed), 'data-action': action, 'data-arg': data })}>${body}</button>`;
  };
  const chips = (items) => `<div class="mm-chips">${items.join('')}</div>`;
  const tag = (text, { action, data } = {}) =>
    `<span class="mm-tag">${esc(text)}<button type="button" ${attrs({ 'aria-label': 'Remove ' + text, 'data-action': action, 'data-arg': data })}>${icon('close', { size: 's' })}</button></span>`;
  const segmented = (options, value, { action, label: lbl } = {}) =>
    `<div class="mm-segmented" role="group" ${attrs({ 'aria-label': lbl })}>${options.map((o) =>
      `<button type="button" ${attrs({ 'aria-pressed': String(o.value === value), 'data-action': action, 'data-arg': o.value })}>${esc(o.label)}</button>`).join('')}</div>`;
  const toggle = (id, checked, { action } = {}) =>
    `<input type="checkbox" role="switch" class="mm-toggle" ${attrs({ id, checked, 'data-action': action })}>`;
  const stepper = (value, unit, { action, label: lbl } = {}) =>
    `<div class="mm-stepper" role="group" ${attrs({ 'aria-label': lbl })}>
       <button type="button" aria-label="Fewer" data-action="${esc(action)}" data-arg="-1">−</button>
       <output aria-live="polite">${esc(value)} ${esc(unit)}</output>
       <button type="button" aria-label="More" data-action="${esc(action)}" data-arg="1">+</button></div>`;
  const check = (text, { checked, qty, action, data, id } = {}) =>
    `<label class="mm-check"><input type="checkbox" ${attrs({ checked, 'data-action': action, 'data-arg': data, id })}>
       <span class="mm-check__text">${esc(text)}</span>${qty ? `<span class="mm-check__qty">${esc(qty)}</span>` : ''}</label>`;

  /* ---- Fields ------------------------------------------------------------- */
  const searchField = (value, { placeholder = 'Name, ingredient or note', label: lbl = 'Search recipes by name, ingredient or note', id = 'q', boxed } = {}) =>
    `<label class="mm-field${boxed ? ' mm-field--box' : ''}">${icon('search')}<span class="mm-sr">${esc(lbl)}</span>
       <input type="search" ${attrs({ id, value, placeholder, autocomplete: 'off' })}></label>`;
  const textField = (value, { placeholder, label: lbl, id, icon: ic } = {}) =>
    `<label class="mm-field mm-field--box">${ic ? icon(ic) : ''}<span class="mm-sr">${esc(lbl)}</span>
       <input type="text" ${attrs({ id, value, placeholder })}></label>`;

  /* ---- Media -------------------------------------------------------------- */
  const SPRIG = '<path d="M50 136 C50 100 48 60 52 8"/><path d="M50 112 C30 107 22 92 24 82 C38 84 48 96 50 112Z"/><path d="M50 97 C70 92 78 77 76 67 C62 69 52 81 50 97Z"/><path d="M50 80 C32 75 26 62 28 52 C40 55 49 65 50 80Z"/><path d="M51 64 C68 59 73 47 71 38 C60 41 52 50 51 64Z"/><path d="M51 47 C38 42 34 32 36 24 C45 27 51 35 51 47Z"/><path d="M52 32 C60 26 62 17 58 8 C52 12 50 22 52 32Z"/>';
  // Photo placeholder: tone 1–4, size {w,h} in px (w may be '100%'), caption optional
  const photo = ({ letter = 'm', tone = 1, w = '100%', h = 300, caption, captionRight, alt = 'No photo yet' } = {}) => {
    const big = h >= 100;
    const fs = Math.round(h * (big ? 0.5 : 0.62));
    const width = typeof w === 'number' ? w + 'px' : w;
    return `<div class="mm-photo" role="img" aria-label="${esc(alt)}" data-tone="${esc(tone)}" style="width:${width};height:${h}px">
      ${big ? `<svg class="mm-photo__sprig" viewBox="0 0 100 140" aria-hidden="true">${SPRIG}</svg>` : ''}
      <span class="mm-photo__letter" aria-hidden="true" style="font-size:${fs}px;padding-bottom:${Math.round(h * 0.08)}px">${esc(String(letter).charAt(0).toLowerCase())}</span>
      ${big && (caption || captionRight) ? `<span class="mm-photo__cap" aria-hidden="true">${caption ? label(caption, { tag: 'span' }) : '<span></span>'}${captionRight ? label(captionRight, { tag: 'span' }) : ''}</span>` : ''}
    </div>`;
  };
  const monogram = ({ href } = {}) => href ? `<a class="mm-monogram" href="${esc(href)}" aria-label="Misemio home">m.</a>` : `<span class="mm-monogram" aria-hidden="true">m.</span>`;

  // Splash: the welcome screen on app open. Logo, wordmark, promise, one way in.
  // inline: true renders it in place (for /ds) instead of as a full-screen dialog.
  const splash = ({ inline } = {}) => {
    const word = 'misemio.'.split('').map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`).join('');
    return `<div class="mm-splash${inline ? ' mm-splash--inline' : ''}" ${inline ? '' : 'role="dialog" aria-modal="true" aria-labelledby="mm-splash-title"'}>
      <div class="mm-splash__bg" aria-hidden="true"></div>
      <div class="mm-splash__inner">
        <div class="mm-splash__brand">
          <span class="mm-monogram mm-splash__mono" aria-hidden="true">m.</span>
          <h1 class="mm-splash__word" ${inline ? '' : 'id="mm-splash-title"'} aria-label="Misemio"><span aria-hidden="true">${word}</span></h1>
          <p class="mm-splash__tag"><span>Your personal</span> <span>recipe library</span></p>
          <span class="mm-splash__rule" aria-hidden="true"></span>
          <p class="mm-splash__line">Save. Organize. Cook. Repeat.</p>
        </div>
        <div class="mm-splash__cta">${button('Start cooking', { variant: 'accent', size: 'l', trailing: 'arrow', action: 'splash-close', block: true })}</div>
      </div></div>`;
  };

  /* ---- Structure ---------------------------------------------------------- */
  const topbar = ({ left = '', title = '', right = '' } = {}) =>
    `<header class="mm-topbar">${left || '<span style="width:var(--hit)"></span>'}<div class="mm-topbar__title">${title}</div>${right || '<span style="width:var(--hit)"></span>'}</header>`;
  const section = (title, { action, actionHref, actionLabel, id } = {}) =>
    `<div class="mm-section">${label(title, { tag: 'h2', id })}${actionHref ? `<a href="${esc(actionHref)}">${esc(actionLabel)}</a>` : action ? `<button type="button" data-action="${esc(action)}">${esc(actionLabel)}</button>` : ''}</div>`;
  // List row: media (html) + title + meta + optional trailing (html)
  const listRow = ({ href, title, metaText, media = '', trailing, action, data, plain } = {}) => {
    const inner = `${media}<span class="mm-listrow__body"><span class="mm-listrow__title">${esc(title)}</span>${metaText ? `<span class="mm-label">${esc(metaText)}</span>` : ''}</span>${trailing ?? `<span class="mm-listrow__chev">${icon('chev', { size: 's' })}</span>`}`;
    const cls = `mm-listrow${plain ? ' mm-listrow--plain' : ''}`;
    // A trailing control next to a link stays outside the link (no nested interactives)
    if (href && trailing) return `<li><div class="${cls}"><a href="${esc(href)}" class="mm-row" style="flex:1;min-width:0;gap:var(--s-4);text-decoration:none">${media}<span class="mm-listrow__body"><span class="mm-listrow__title">${esc(title)}</span>${metaText ? `<span class="mm-label">${esc(metaText)}</span>` : ''}</span></a>${trailing}</div></li>`;
    return `<li>${href ?`<a class="${cls}" href="${esc(href)}">${inner}</a>` : `<div class="${cls}" ${attrs({ 'data-action': action, 'data-arg': data })}>${inner}</div>`}</li>`;
  };
  // Index row: contents-page entry. Number (doubles as drag handle) + serif title + count + arrow.
  // add: true → the closing "+ New …" row, a button.
  const indexRow = ({ n, title, count, countLabel = 'recipes', href, drag, action, data, add } = {}) => {
    const num = String(n).padStart(2, '0');
    if (add) return `<li><button type="button" class="mm-indexrow mm-indexrow--add" ${attrs({ 'data-action': action, 'data-arg': data })}><span class="mm-indexrow__n" aria-hidden="true">+</span><span class="mm-indexrow__title">${esc(title)}</span></button></li>`;
    const handle = drag
      ? `<span class="mm-indexrow__n mm-indexrow__n--drag" data-drag="${esc(drag)}" role="button" tabindex="0" aria-label="Reorder ${esc(title)}, position ${n}. Use arrow keys">${num}</span>`
      : `<span class="mm-indexrow__n" aria-hidden="true">${num}</span>`;
    return `<li ${attrs({ 'data-col': drag })}><div class="mm-indexrow">${handle}<a class="mm-indexrow__link" href="${esc(href)}"><span class="mm-indexrow__title">${esc(title)}</span>${count != null ? `<span class="mm-indexrow__count">${esc(count)}<span class="mm-sr"> ${esc(countLabel)}</span></span>` : ''}${icon('arrow')}</a></div></li>`;
  };
  const list = (rows, { label: lbl } = {}) => `<ul class="mm-list" ${attrs({ 'aria-label': lbl })}>${rows.join('')}</ul>`;
  const dataRow = (k, v) => `<div class="mm-datarow"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;
  const stats = (items) => `<div class="mm-stats">${items.map(([v, k]) => `<div class="mm-stat"><b>${esc(v)}</b>${label(k, { tag: 'span' })}</div>`).join('')}</div>`;
  const progress = (pct, { label: lbl } = {}) =>
    `<div class="mm-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" ${attrs({ 'aria-label': lbl })}><span style="width:${pct}%"></span></div>`;
  const empty = ({ title, body, cta } = {}) =>
    `<div class="mm-empty">${display(title, { size: 'm', tag: 'h2' })}${body ? `<p class="mm-body-s">${esc(body)}</p>` : ''}${cta || ''}</div>`;

  /* ---- Navigation --------------------------------------------------------- */
  const TABS = [
    { id: 'library', label: 'Library', icon: 'library' },
    { id: 'collections', label: 'Collections', icon: 'collections' },
    { id: 'import', label: 'Import', icon: 'plus' },
    { id: 'menu', label: 'Menu', icon: 'menu' },
    { id: 'me', label: 'Me', icon: 'me' }
  ];
  const tabbar = (active, { hrefFor = (id) => '#' + id, fixed = true } = {}) =>
    `<nav class="mm-tabbar" aria-label="Main" ${fixed ? '' : 'style="position:static;transform:none"'}>${TABS.map((t) =>
      `<a class="mm-tab" href="${esc(hrefFor(t.id))}" ${t.id === active ? 'aria-current="page"' : ''}>${icon(t.icon)}<span>${t.label.toUpperCase()}</span></a>`).join('')}</nav>`;
  const rail = ({ idx, total, prevName, nextName, action = 'rail' }) => {
    const pad = (v) => String(v).padStart(2, '0');
    const step = 120 / total;
    return `<div class="mm-rail" role="group" aria-label="Today's picks">
      ${iconButton('up', 'Previous recipe: ' + prevName, { action, data: '-1' })}
      <span class="mm-rail__name" aria-hidden="true">${esc(prevName)}</span>
      <span class="mm-rail__idx">${pad(idx + 1)}</span>
      <span class="mm-rail__track" aria-hidden="true"><span class="mm-rail__seg" style="top:${idx * step}px;height:${step}px"></span></span>
      <span>${pad(total)}</span>
      <span class="mm-rail__name" aria-hidden="true">${esc(nextName)}</span>
      ${iconButton('down', 'Next recipe: ' + nextName, { action, data: '1' })}
    </div>`;
  };

  /* ---- Overlays ----------------------------------------------------------- */
  const sheet = ({ title, body, id = 'sheet' }) =>
    `<div class="mm-scrim" data-action="close-sheet"></div>
     <div class="mm-sheet" role="dialog" aria-modal="true" aria-labelledby="${esc(id)}-t"><div class="mm-sheet__grip"></div>
       <div class="mm-row" style="justify-content:space-between">${label(title, { strong: true, id: id + '-t', tag: 'h2' })}${iconButton('close', 'Close', { action: 'close-sheet' })}</div>${body}</div>`;
  const option = (text, checked, { action, data } = {}) =>
    `<button type="button" role="menuitemradio" class="mm-option" ${attrs({ 'aria-checked': String(!!checked), 'data-action': action, 'data-arg': data })}><span>${esc(text)}</span>${checked ? icon('check', { size: 's' }) : ''}</button>`;
  const toast = (text, { undo = true } = {}) =>
    `<div class="mm-toast" role="status">${esc(text)}${undo ? '<button type="button" data-action="undo">UNDO</button>' : ''}</div>`;
  const actionbar = (html) => `<div class="mm-actionbar">${html}</div>`;

  window.MM = { esc, icon, ICONS, label, display, meta, serif, button, iconButton, chip, chips, tag, segmented, toggle, stepper, timer, clock, check,
    searchField, textField, photo, monogram, topbar, section, listRow, indexRow, list, dataRow, stats, progress, empty, tabbar, rail,
    sheet, option, toast, actionbar, splash, TABS, VERSION: '1.0' };
})();
