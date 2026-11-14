/* ==========================================================================
   Misemio — app screens
   RULE: screens compose MM.* components only. No colours, no new classes.
   Inline style is allowed only for layout with spacing tokens (var(--s-*)).
   ========================================================================== */
(function () {
  const M = window.MM;
  const D = window.MM_DATA;
  const $app = document.getElementById('app');
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Any day'];

  /* ---- persistence (one viewer's conveniences only) ------------------------ */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('misemio.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('misemio.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  const S = {
    recipes: store.get('recipes', JSON.parse(JSON.stringify(D.recipes))),
    collections: store.get('collections', JSON.parse(JSON.stringify(D.collections))),
    menus: store.get('menus', [
      { id: 'week', name: 'This week', people: 2, items: [{ rid: 'lemon-pasta', day: 'Mon' }, { rid: 'bean-stew', day: 'Wed' }, { rid: 'miso-aubergine', day: 'Thu' }, { rid: 'honey-figs', day: 'Sat' }] },
      { id: 'sunday', name: 'Sunday lunch', people: 6, items: [{ rid: 'tarte-fine', day: 'Sun' }, { rid: 'olive-focaccia', day: 'Sun' }, { rid: 'saffron-pudding', day: 'Sun' }] }
    ]),
    activeMenu: store.get('activeMenu', 'week'),
    grocery: store.get('grocery', {}),
    theme: store.get('theme', 'light'),
    pick: 0, q: '', sort: 'added', filters: {}, sheet: null, servings: {}, step: 0, timers: {},
    groceryView: 'aisle', toast: null, undo: null, draft: null, addDay: 'Any day', addMenu: null
  };
  const save = () => { ['recipes', 'collections', 'menus', 'activeMenu', 'grocery', 'theme'].forEach((k) => store.set(k, S[k])); };
  const R = (id) => S.recipes.find((r) => r.id === id);
  const tone = (r) => r.tone || 1;
  const thumb = (r, size = 60) => M.photo({ letter: r.name, tone: tone(r), w: size, h: size, alt: r.name });

  /* ---- helpers -------------------------------------------------------------- */
  const scaleAmt = (a, unit, f) => {
    if (!a) return '';
    if (unit === 'pinch') return a;
    let v = a * f;
    if (unit === 'g' || unit === 'ml') v = v >= 100 ? Math.round(v / 10) * 10 : Math.round(v / 5) * 5 || Math.round(v);
    else v = Math.round(v * 2) / 2;
    return String(v).replace('.5', '½').replace(/^0½/, '½');
  };
  const qty = (a, unit, f) => { const s = scaleAmt(a, unit, f); return s ? `${s}${unit ? ' ' + unit : ''}` : ''; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const fmtTime = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`);
  const metaOf = (r) => [`${r.servings} portions`, fmtTime(r.time), `${r.kcal} kcal`];

  /* ---- Today's picks: explained, not random (reason line) ------------------ */
  const picks = () => {
    const now = Date.now();
    const inMenu = new Set(S.menus.flatMap((m) => m.items.map((i) => i.rid)));
    return S.recipes.map((r) => {
      const days = Math.round((now - new Date(r.added).getTime()) / 864e5);
      let reason = 'From your library', score = 1;
      if (inMenu.has(r.id)) { reason = 'Planned in your menu'; score = 5; }
      else if (days <= 4) { reason = 'Saved this week · not tried yet'; score = 4; }
      else if (r.fav) { reason = 'A favourite'; score = 3; }
      else if (r.time <= 30) { reason = 'Quick · under 30 min'; score = 2; }
      return { r, reason, score };
    }).sort((a, b) => b.score - a.score);
  };

  /* ================================ SCREENS ================================= */
  const screens = {};

  screens.library = () => {
    const P = picks();
    const n = P.length;
    const i = ((S.pick % n) + n) % n;
    const cur = P[i], prev = P[(i - 1 + n) % n], next = P[(i + 1) % n];
    const recent = [...S.recipes].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 3);
    return { tab: 'library', html: `
      ${M.topbar({ left: M.monogram({ href: '#library' }), right: `<div class="mm-row">${M.label(greeting(), { large: true, tag: 'span' })}${M.iconButton('search', 'Search recipes', { href: '#search' })}</div>` })}
      <section class="mm-pad" aria-label="Recently saved">
        <div class="mm-row" style="margin-top:var(--s-5);padding:var(--s-2) 0;border-top:var(--border) solid var(--line);border-bottom:var(--border) solid var(--line)">
          ${M.label('Recently saved', { tag: 'span' })}
          <div class="mm-row" style="gap:var(--s-2)">${recent.map((r, k) => `<a href="#recipe-${r.id}" aria-label="${M.esc(r.name)}${k === 0 ? ', new' : ''}" style="position:relative;display:block">${thumb(r, 44)}${k === 0 ? '<span class="mm-dot" style="position:absolute;top:-3px;right:-3px"></span>' : ''}</a>`).join('')}</div>
          <span class="mm-spacer"></span>
          ${M.button('View all', { variant: 'ghost', href: '#search' })}
        </div>
      </section>
      <div data-swipe style="display:grid;grid-template-columns:var(--hit) 1fr;gap:var(--s-3);padding:var(--s-8) var(--gutter) 0 var(--s-3);touch-action:none">
        <div style="padding-top:var(--s-10)">${M.rail({ idx: i, total: n, prevName: prev.r.name, nextName: next.r.name })}</div>
        <main class="mm-stack" style="gap:var(--s-3);min-width:0">
          ${M.label("What to cook today")}
          ${M.display(cur.r.name)}
          ${M.meta(metaOf(cur.r))}
          ${M.serif(cur.r.blurb, { clamp: true })}
          <div style="margin-top:var(--s-3)">
            ${M.photo({ letter: cur.r.name, tone: tone(cur.r), h: 260, caption: cur.reason, captionRight: 'Scroll ↓', alt: cur.r.name })}
          </div>
          <div style="margin-top:var(--s-2)">
            ${M.button('Start cooking', { size: 'l', href: '#recipe-' + cur.r.id, trailing: 'arrow', block: true })}
          </div>
        </main>
      </div>` };
  };

  /* ---- Search, sort, filter ----------------------------------------------- */
  const SORTS = [['added', 'Newest first', 'Newest'], ['name', 'Name A–Z', 'A–Z'], ['time', 'Quickest', 'Quickest'], ['kcal', 'Fewest calories', 'Kcal'], ['protein', 'Most protein', 'Protein'], ['ingredients', 'Fewest ingredients', 'Ingredients']];
  const FILTERS = [['quick', 'Under 30 min', (r) => r.time <= 30], ['fav', 'Favourites', (r) => r.fav], ['light', 'Under 400 kcal', (r) => r.kcal < 400], ['protein', 'High protein', (r) => (r.nutrition?.protein || 0) >= 20], ['few', '5 ingredients or fewer', (r) => r.ingredients.length <= 5]];
  const searchResults = () => {
    const q = S.q.trim().toLowerCase();
    let rows = S.recipes.map((r) => {
      if (!q) return { r, hint: '' };
      if (r.name.toLowerCase().includes(q)) return { r, hint: 'Found in the name' };
      const ing = r.ingredients.find((x) => x[0].toLowerCase().includes(q));
      if (ing) return { r, hint: 'Ingredient: ' + ing[0] };
      if ((r.note || '').toLowerCase().includes(q)) return { r, hint: 'Your note: ' + r.note };
      return null;
    }).filter(Boolean);
    FILTERS.forEach(([k, , fn]) => { if (S.filters[k]) rows = rows.filter((x) => fn(x.r)); });
    const by = {
      added: (a, b) => b.r.added.localeCompare(a.r.added), name: (a, b) => a.r.name.localeCompare(b.r.name),
      time: (a, b) => a.r.time - b.r.time, kcal: (a, b) => a.r.kcal - b.r.kcal,
      protein: (a, b) => (b.r.nutrition?.protein || 0) - (a.r.nutrition?.protein || 0), ingredients: (a, b) => a.r.ingredients.length - b.r.ingredients.length
    };
    return rows.sort(by[S.sort]);
  };
  const resultsHtml = () => {
    const rows = searchResults();
    if (!rows.length) return M.empty({ title: 'Nothing here yet', body: 'Try fewer words, or clear a filter.', cta: Object.values(S.filters).some(Boolean) ? M.button('Clear filters', { variant: 'secondary', action: 'clear-filters' }) : '' });
    return `${M.label(rows.length + (rows.length === 1 ? ' recipe' : ' recipes'), { tag: 'p' })}
      ${M.list(rows.map(({ r, hint }) => M.listRow({ href: '#recipe-' + r.id, title: r.name, metaText: hint || `${fmtTime(r.time)} · ${r.kcal} kcal · ${r.nutrition?.protein ?? '–'} g protein`, media: thumb(r) })), { label: 'Results' })}`;
  };
  screens.search = () => {
    const nf = Object.values(S.filters).filter(Boolean).length;
    const sortLabel = SORTS.find((s) => s[0] === S.sort)[2];
    return { tab: 'library', html: `
      ${M.topbar({ left: M.iconButton('back', 'Back', { href: '#library' }) })}
      <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4)">
        ${M.display('Search')}
        ${M.searchField(S.q)}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2)">
          ${M.button('Sort · ' + sortLabel, { variant: 'secondary', action: 'open-sheet', data: 'sort', trailing: 'sort', block: true })}
          ${M.button('Filters' + (nf ? ' · ' + nf : ''), { variant: nf ? 'primary' : 'secondary', action: 'open-sheet', data: 'filter', trailing: 'filter', block: true })}
        </div>
        ${nf ? M.chips(FILTERS.filter(([k]) => S.filters[k]).map(([k, l]) => M.tag(l, { action: 'filter-off', data: k }))) : ''}
        <div id="results">${resultsHtml()}</div>
      </div>` };
  };

  /* ---- Recipe --------------------------------------------------------------- */
  screens.recipe = (id) => {
    const r = R(id); if (!r) return screens.notfound();
    const sv = S.servings[id] || r.servings; const f = sv / r.servings;
    const n = r.nutrition || {};
    return { tab: null, html: `
      ${M.topbar({ left: M.iconButton('back', 'Back', { href: '#library' }), right: M.iconButton('heart', r.fav ? 'Remove from favourites' : 'Add to favourites', { action: 'fav', data: r.id, pressed: r.fav }) })}
      <div style="margin-top:var(--s-3)">${M.photo({ letter: r.name, tone: tone(r), h: 320, caption: 'No photo yet · tap to add one', alt: r.name })}</div>
      <article class="mm-pad mm-stack" style="gap:var(--s-3);padding-top:var(--s-6);padding-bottom:var(--s-14)">
        ${M.label(r.source)}
        ${M.display(r.name)}
        ${M.meta([fmtTime(r.time), `${r.kcal} kcal per portion`])}
        ${M.serif(r.blurb)}
        ${M.section('Ingredients')}
        <div class="mm-row" style="justify-content:space-between">${M.label('Cooking for')}${M.stepper(sv, sv === 1 ? 'portion' : 'portions', { action: 'servings', label: 'Portions' })}</div>
        <div>${r.ingredients.map((x, k) => M.check(x[0], { qty: qty(x[1], x[2], f), id: `ing-${id}-${k}` })).join('')}</div>
        ${M.section('Method')}
        <ol class="mm-list mm-stack" style="gap:var(--s-4)">${r.steps.map((s, k) => `<li class="mm-row" style="align-items:flex-start;gap:var(--s-4)">${M.label(String(k + 1).padStart(2, '0'), { strong: true, tag: 'span' })}<p class="mm-body">${M.esc(s)}</p></li>`).join('')}</ol>
        ${M.section('Nutrition · per portion')}
        <dl style="margin:0">${[['Energy', r.kcal + ' kcal'], ['Protein', (n.protein ?? '–') + ' g'], ['Carbohydrate', (n.carbs ?? '–') + ' g'], ['  of which sugars', (n.sugars ?? '–') + ' g'], ['Fat', (n.fat ?? '–') + ' g'], ['Fibre', (n.fibre ?? '–') + ' g'], ['Salt', (n.salt ?? '–') + ' g']].map(([k, v]) => M.dataRow(k, v)).join('')}</dl>
        <p class="mm-body-s">Estimated from the ingredients. Adjust in the recipe if you know better.</p>
        ${r.note ? M.section('Your note') + M.serif(r.note) : ''}
      </article>
      ${M.actionbar(M.button('+ Menu', { variant: 'secondary', size: 'l', action: 'open-sheet', data: 'addmenu' }) + M.button('Start cooking', { size: 'l', href: '#cook-' + r.id, trailing: 'arrow', block: true }))}` };
  };

  /* ---- Step timers: any duration named in a step becomes a timer ------------- */
  const NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30, forty: 40 };
  const timesIn = (txt) => {
    const re = /\b(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty)\s*(?:(?:–|-|to)\s*(\d+)\s*)?(hours?|hrs?|h|minutes?|mins?|seconds?|secs?)\b/gi;
    const out = []; let m;
    while ((m = re.exec(txt)) && out.length < 2) {
      const n = +(m[2] || (NUMW[m[1].toLowerCase()] ?? m[1])); const u = m[3][0].toLowerCase();
      const sec = Math.round(n * (u === 'h' ? 3600 : u === 'm' ? 60 : 1));
      if (sec > 0 && !out.some((t) => t.sec === sec)) out.push({ sec, label: u === 'h' ? `${n} h` : u === 'm' ? `${n} min` : `${n} sec` });
    }
    return out;
  };
  const timerLeft = (t) => (t.end ? Math.max(0, Math.ceil((t.end - Date.now()) / 1000)) : t.left);
  const timerState = (t) => (!t ? 'idle' : t.done ? 'done' : t.end ? 'running' : t.left < t.total ? 'paused' : 'idle');
  const timerHtml = (key, sec, label) => { const t = S.timers[key]; return M.timer({ key, label, left: t ? timerLeft(t) : sec, state: timerState(t) }); };

  screens.cook = (id) => {
    const r = R(id); if (!r) return screens.notfound();
    const k = Math.min(S.step, r.steps.length - 1);
    const last = k === r.steps.length - 1;
    const here = timesIn(r.steps[k]).map((t) => timerHtml(`${id}:${k}:${t.sec}`, t.sec, t.label));
    const elsewhere = Object.entries(S.timers).filter(([key, t]) => key.startsWith(id + ':') && +key.split(':')[1] !== k && t.end)
      .map(([key, t]) => timerHtml(key, t.total, `Step ${+key.split(':')[1] + 1} · ${t.label}`));
    const timers = [...here, ...elsewhere];
    return { tab: null, html: `
      ${M.topbar({ left: M.iconButton('close', 'Leave cook mode', { href: '#recipe-' + id }), title: M.label(`Step ${k + 1} of ${r.steps.length}`, { tag: 'span', strong: true }) })}
      <div class="mm-pad mm-stack" style="gap:var(--s-6);padding-top:var(--s-4)">
        ${M.progress(((k + 1) / r.steps.length) * 100, { label: 'Progress' })}
        ${M.label(r.name)}
        <div aria-live="polite">${M.display(r.steps[k], { tag: 'p' })}</div>
        ${timers.length ? `<div class="mm-timers">${timers.join('')}</div>` : ''}
      </div>
      ${M.actionbar(M.button('Back', { variant: 'secondary', size: 'l', action: 'step', data: '-1', disabled: k === 0 }) + M.button(last ? 'Done' : 'Next step', { size: 'l', action: last ? 'cook-done' : 'step', data: last ? id : '1', trailing: last ? 'check' : 'arrow', block: true }))}` };
  };

  /* ---- Collections (Option 2 · index, no photos; drag the number to reorder) */
  const inCol = (cid) => S.recipes.filter((r) => r.collections?.includes(cid));
  screens.collections = () => ({ tab: 'collections', html: `
    ${M.topbar({ left: M.monogram({ href: '#library' }) })}
    <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4)">
      ${M.display('Collections')}
      ${M.chips([M.chip('All', { href: '#collection-all', count: S.recipes.length }), M.chip('Favourites', { href: '#collection-fav', count: S.recipes.filter((r) => r.fav).length }), M.chip('Unsorted', { href: '#collection-unsorted', count: S.recipes.filter((r) => !r.collections?.length).length })])}
      ${M.section('Hold a number and drag to reorder')}
      <ul class="mm-list" id="cols" aria-label="Collections">${S.collections.map((c, k) => {
        const n = inCol(c.id).length;
        return M.indexRow({ n: k + 1, title: c.name, count: n, countLabel: n === 1 ? 'recipe' : 'recipes', href: '#collection-' + c.id, drag: c.id });
      }).join('')}${M.indexRow({ title: 'New collection', add: true, action: 'open-sheet', data: 'newcol' })}</ul>
    </div>` });

  screens.collection = (cid) => {
    const c = cid === 'all' ? { name: 'All recipes' } : cid === 'fav' ? { name: 'Favourites' } : cid === 'unsorted' ? { name: 'Unsorted' } : S.collections.find((x) => x.id === cid);
    if (!c) return screens.notfound();
    const rs = cid === 'all' ? S.recipes : cid === 'fav' ? S.recipes.filter((r) => r.fav) : cid === 'unsorted' ? S.recipes.filter((r) => !r.collections?.length) : inCol(cid);
    return { tab: 'collections', html: `
      ${M.topbar({ left: M.iconButton('back', 'Back to collections', { href: '#collections' }) })}
      <div class="mm-pad mm-stack" style="gap:var(--s-3);padding-top:var(--s-4)">
        ${M.label(rs.length + ' recipes')}
        ${M.display(c.name)}
        ${rs.length ? M.list(rs.map((r) => M.listRow({ href: '#recipe-' + r.id, title: r.name, metaText: `${fmtTime(r.time)} · ${r.kcal} kcal`, media: thumb(r) }))) : M.empty({ title: 'Empty for now', body: 'Recipes you file here will show up on this shelf.', cta: M.button('Add a recipe', { href: '#import' }) })}
      </div>` };
  };

  /* ---- Import --------------------------------------------------------------- */
  screens.import = () => ({ tab: 'import', html: `
    ${M.topbar({ left: M.monogram({ href: '#library' }) })}
    <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4)">
      ${M.label('Import')}
      ${M.display('Add a recipe')}
      ${M.serif('From a link, a screenshot, or your own hands. You can check everything before it is saved.')}
      ${M.section('Paste a link')}
      ${M.textField('', { id: 'link', placeholder: 'https://', label: 'Recipe link', icon: 'link' })}
      ${M.button('Import from link', { size: 'l', action: 'import-link', trailing: 'arrow', block: true })}
      ${M.section('Or')}
      ${M.list([
        `<li><label class="mm-listrow" style="cursor:pointer">${M.icon('image')}<span class="mm-listrow__body"><span class="mm-listrow__title">From a screenshot</span>${M.label('We read the text for you', { tag: 'span' })}</span><input type="file" accept="image/*" class="mm-sr" data-action="import-shot"><span class="mm-listrow__chev">${M.icon('chev', { size: 's' })}</span></label></li>`,
        M.listRow({ title: 'Write it yourself', metaText: 'Start from a blank page', media: M.icon('text'), action: 'import-blank' })
      ])}
    </div>` });

  screens['import-review'] = () => {
    const d = S.draft; if (!d) { location.hash = '#import'; return screens.import(); }
    return { tab: 'import', html: `
      ${M.topbar({ left: M.iconButton('back', 'Back to import', { href: '#import' }), title: M.label('Check before saving', { tag: 'span', strong: true }) })}
      <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4);padding-bottom:var(--s-14)">
        ${M.label(d.source)}
        ${M.display(d.name || 'Untitled recipe')}
        ${M.textField(d.name, { id: 'draft-name', placeholder: 'Recipe name', label: 'Recipe name' })}
        ${M.section(`Ingredients we found · ${d.ingredients.length}`)}
        <p class="mm-body-s">Untick anything we got wrong.</p>
        <div>${d.ingredients.map((x, k) => M.check(x[0], { checked: d.keep[k], qty: qty(x[1], x[2], 1), action: 'draft-ing', data: String(k) })).join('')}</div>
        ${M.section('File it in')}
        ${M.chips(S.collections.map((c) => M.chip(c.name, { pressed: d.cols.includes(c.id), action: 'draft-col', data: c.id })))}
        <p class="mm-body-s">Optional. Unfiled recipes wait in Unsorted.</p>
      </div>
      ${M.actionbar(M.button('Save to library', { size: 'l', action: 'draft-save', trailing: 'check', block: true }))}` };
  };

  /* ---- Menu ----------------------------------------------------------------- */
  const menu = () => S.menus.find((m) => m.id === S.activeMenu) || S.menus[0];
  screens.menu = () => {
    const m = menu();
    const rs = m.items.map((it, k) => ({ ...it, k, r: R(it.rid) })).filter((x) => x.r);
    const kcal = rs.reduce((s, x) => s + x.r.kcal, 0);
    const days = DAYS.filter((d) => rs.some((x) => x.day === d));
    return { tab: 'menu', html: `
      ${M.topbar({ left: M.monogram({ href: '#library' }), right: M.iconButton('plus', 'New menu', { action: 'new-menu' }) })}
      <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4)">
        ${M.chips(S.menus.map((x) => M.chip(x.name, { pressed: x.id === m.id, action: 'menu-pick', data: x.id, count: x.items.length })))}
        ${M.label(`For ${m.people} people`)}
        ${M.display(m.name)}
        ${M.stats([[rs.length, 'Dishes'], [days.length, 'Days'], [rs.length ? Math.round(kcal / rs.length) : 0, 'Avg kcal']])}
        ${rs.length ? days.map((d) => M.section(d) + M.list(rs.filter((x) => x.day === d).map((x) =>
          M.listRow({ href: '#recipe-' + x.r.id, title: x.r.name, metaText: `${fmtTime(x.r.time)} · ${x.r.kcal} kcal`, media: thumb(x.r, 48), trailing: M.iconButton('trash', 'Remove ' + x.r.name + ' from menu', { action: 'menu-remove', data: String(x.k) }) })))).join('')
          : M.empty({ title: 'Nothing planned yet', body: 'Add recipes from any recipe page with “+ Menu”.', cta: M.button('Browse recipes', { variant: 'secondary', href: '#search' }) })}
        ${rs.length ? M.button('Make grocery list', { size: 'l', href: '#grocery', trailing: 'cart', block: true }) : ''}
      </div>` };
  };

  /* ---- Grocery -------------------------------------------------------------- */
  const aisleOf = (name) => { const n = name.toLowerCase(); const k = Object.keys(D.aisles).find((a) => n.includes(a)); return k ? D.aisles[k] : 'Other'; };
  const isPantry = (name) => D.pantry.some((p) => name.toLowerCase().includes(p));
  screens.grocery = () => {
    const m = menu();
    const items = {};
    m.items.forEach((it) => { const r = R(it.rid); if (!r) return; const f = m.people / r.servings;
      r.ingredients.forEach(([name, a, u]) => { const key = name.split(',')[0].trim();
        const e = items[key] || (items[key] = { name: key, amt: 0, unit: u, recipes: [], aisle: aisleOf(key), pantry: isPantry(key) });
        if (e.unit === u) e.amt += a * f; e.recipes.push(r.name); }); });
    const all = Object.values(items);
    const buy = all.filter((x) => !x.pantry), pantry = all.filter((x) => x.pantry);
    const ck = S.grocery[m.id] || {};
    const done = buy.filter((x) => ck[x.name]).length;
    const row = (x) => M.check(x.name, { checked: !!ck[x.name], qty: x.amt ? qty(x.amt, x.unit, 1) : '', action: 'grocery-check', data: x.name });
    let body;
    if (S.groceryView === 'aisle') {
      const groups = [...new Set(buy.map((x) => x.aisle))].sort();
      body = groups.map((g) => M.section(g) + buy.filter((x) => x.aisle === g).map(row).join('')).join('');
    } else {
      const names = [...new Set(buy.flatMap((x) => x.recipes))];
      body = names.map((n) => M.section(n) + buy.filter((x) => x.recipes.includes(n)).map(row).join('')).join('');
    }
    return { tab: 'menu', html: `
      ${M.topbar({ left: M.iconButton('back', 'Back to menu', { href: '#menu' }) })}
      <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4)">
        ${M.label(`${m.name} · ${m.people} people`)}
        ${M.display('Grocery list')}
        <div class="mm-stack" style="gap:var(--s-2)">${M.label(`${done} of ${buy.length} in the basket`, { strong: true })}${M.progress(buy.length ? (done / buy.length) * 100 : 0, { label: 'Shopping progress' })}</div>
        ${M.segmented([{ value: 'aisle', label: 'By aisle' }, { value: 'recipe', label: 'By recipe' }], S.groceryView, { action: 'grocery-view', label: 'Group by' })}
        <div>${body}</div>
        ${pantry.length ? M.section('Probably in your pantry') + '<p class="mm-body-s">Tick only if you need to buy it.</p>' + pantry.map(row).join('') : ''}
      </div>` };
  };

  /* ---- Me ------------------------------------------------------------------- */
  screens.me = () => ({ tab: 'me', html: `
    ${M.topbar({ left: M.monogram({ href: '#library' }) })}
    <div class="mm-pad mm-stack" style="gap:var(--s-4);padding-top:var(--s-4)">
      ${M.label('Misemio · my own cookbook')}
      ${M.display('Your kitchen')}
      ${M.stats([[S.recipes.length, 'Recipes'], [S.collections.length, 'Shelves'], [S.menus.length, 'Menus']])}
      ${M.section('Preferences')}
      <label class="mm-listrow mm-listrow--plain" for="dark"><span class="mm-listrow__body"><span class="mm-body">Dark kitchen</span>${M.label('Deep sage, for evenings', { tag: 'span' })}</span>${M.toggle('dark', S.theme === 'dark', { action: 'theme' })}</label>
      ${M.section('Your recipes are yours')}
      <p class="mm-body-s">Everything stays in this browser. Copy a full export any time.</p>
      ${M.button('Copy my recipes as JSON', { variant: 'secondary', action: 'export', block: true })}
      ${M.section('For designers')}
      ${M.list([M.listRow({ href: 'ds/index.html', title: 'Design system', metaText: 'Tokens, components and rules · v' + M.VERSION, media: M.icon('collections') })])}
      ${M.button('Replay welcome screen', { variant: 'ghost', action: 'splash-show' })}
      ${M.button('Reset sample library', { variant: 'ghost', action: 'reset' })}
    </div>` });

  screens.notfound = () => ({ tab: null, html: `${M.topbar({ left: M.iconButton('back', 'Back', { href: '#library' }) })}<div class="mm-pad">${M.empty({ title: 'This page wandered off', cta: M.button('Back to library', { href: '#library' }) })}</div>` });

  /* ================================ SHEETS ================================== */
  const sheets = {
    sort: () => M.sheet({ title: 'Sort by', body: `<div role="menu">${SORTS.map(([k, l]) => M.option(l, S.sort === k, { action: 'sort', data: k })).join('')}</div>` }),
    filter: () => {
      const n = (() => { const keep = S.q; return searchResults().length; })();
      return M.sheet({ title: 'Filters', body: `<div class="mm-stack" style="gap:var(--s-5);padding-top:var(--s-3)">${M.chips(FILTERS.map(([k, l]) => M.chip(l, { pressed: !!S.filters[k], action: 'filter', data: k })))}
        <div class="mm-row">${M.button('Clear', { variant: 'ghost', action: 'clear-filters' })}${M.button(`Show ${n} recipes`, { action: 'close-sheet', block: true })}</div></div>` });
    },
    addmenu: () => {
      const id = currentId();
      return M.sheet({ title: 'Add to menu', body: `<div class="mm-stack" style="gap:var(--s-4);padding-top:var(--s-3)">
        <div role="menu">${S.menus.map((m) => M.option(`${m.name} · ${m.people} people`, (S.addMenu || S.activeMenu) === m.id, { action: 'addmenu-pick', data: m.id })).join('')}</div>
        ${M.label('Which day')}${M.chips(DAYS.map((d) => M.chip(d, { pressed: S.addDay === d, action: 'addmenu-day', data: d })))}
        ${M.button('Add to menu', { size: 'l', action: 'addmenu-go', data: id, block: true })}</div>` });
    },
    newcol: () => M.sheet({ title: 'New collection', body: `<div class="mm-stack" style="gap:var(--s-4);padding-top:var(--s-3)">${M.textField('', { id: 'col-name', placeholder: 'e.g. Feeding friends', label: 'Collection name' })}${M.button('Create', { size: 'l', action: 'newcol-go', block: true })}</div>` })
  };

  /* ================================ RENDER ================================== */
  const route = () => {
    const h = (location.hash || '#library').slice(1);
    if (h === 'ds') { location.href = 'ds/index.html'; return { name: 'library' }; }
    const m = h.match(/^(recipe|cook|collection)-(.+)$/);
    if (m) return { name: m[1], arg: m[2] };
    return { name: screens[h] ? h : 'notfound' };
  };
  const currentId = () => route().arg;
  let toastTimer;
  const render = () => {
    document.documentElement.dataset.theme = S.theme;
    const rt = route();
    const out = screens[rt.name](rt.arg);
    $app.innerHTML = `<div class="mm-screen">${out.html}</div>${out.tab ? M.tabbar(out.tab) : ''}${S.sheet && sheets[S.sheet] ? sheets[S.sheet]() : ''}${S.toast ? M.toast(S.toast, { undo: !!S.undo }) : ''}`;
    bindDrag();
  };
  const toast = (msg, undo) => {
    S.toast = msg; S.undo = undo || null; clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { S.toast = null; S.undo = null; render(); }, 5000);
  };
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };

  /* ================================ ACTIONS ================================= */
  const A = {
    rail: (d) => { S.pick += +d; },
    shuffle: () => { S.pick += 1 + Math.floor(Math.random() * (S.recipes.length - 1)); },
    'open-sheet': (k) => { S.sheet = k; },
    'close-sheet': () => { S.sheet = null; },
    sort: (k) => { S.sort = k; S.sheet = null; },
    filter: (k) => { S.filters[k] = !S.filters[k]; },
    'filter-off': (k) => { S.filters[k] = false; },
    'clear-filters': () => { S.filters = {}; },
    fav: (id) => { const r = R(id); r.fav = !r.fav; save(); toast(r.fav ? 'Added to favourites' : 'Removed from favourites', () => { r.fav = !r.fav; save(); }); },
    servings: (d) => { const id = currentId(); const r = R(id); S.servings[id] = Math.max(1, Math.min(24, (S.servings[id] || r.servings) + +d)); },
    step: (d) => { S.step = Math.max(0, S.step + +d); },
    timer: (key) => {
      const sec = +key.split(':')[2]; const t = S.timers[key] || (S.timers[key] = { total: sec, left: sec, end: null, done: false, label: timesIn(R(key.split(':')[0]).steps[+key.split(':')[1]]).find((x) => x.sec === sec)?.label || M.clock(sec) });
      if (t.done) { t.done = false; t.left = t.total; }
      if (t.end) { t.left = timerLeft(t); t.end = null; } else { t.end = Date.now() + t.left * 1000; }
    },
    'timer-reset': (key) => { delete S.timers[key]; },
    'cook-done': (id) => { S.step = 0; toast('Nicely done. Enjoy it.', null); go('#recipe-' + id); },
    'menu-pick': (id) => { S.activeMenu = id; save(); },
    'new-menu': () => { const id = 'm' + Date.now(); S.menus.push({ id, name: 'New menu', people: 2, items: [] }); S.activeMenu = id; save(); toast('New menu created', () => { S.menus = S.menus.filter((m) => m.id !== id); S.activeMenu = 'week'; save(); }); },
    'menu-remove': (k) => { const m = menu(); const [it] = m.items.splice(+k, 1); save(); toast(`Removed ${R(it.rid)?.name}`, () => { m.items.splice(+k, 0, it); save(); }); },
    'addmenu-pick': (id) => { S.addMenu = id; },
    'addmenu-day': (d) => { S.addDay = d; },
    'addmenu-go': (rid) => { const m = S.menus.find((x) => x.id === (S.addMenu || S.activeMenu)); m.items.push({ rid, day: S.addDay }); save(); S.sheet = null;
      toast(`Added to ${m.name} · ${S.addDay}`, () => { m.items.pop(); save(); }); },
    'grocery-view': (v) => { S.groceryView = v; },
    'grocery-check': (name) => { const m = menu(); const c = S.grocery[m.id] || (S.grocery[m.id] = {}); c[name] = !c[name]; save(); },
    'newcol-go': () => { const v = (document.getElementById('col-name')?.value || '').trim(); if (!v) return; const c = { id: 'c' + Date.now(), name: v }; S.collections.push(c); S.sheet = null; save();
      toast(`Created “${v}”`, () => { S.collections = S.collections.filter((x) => x !== c); save(); }); },
    'import-link': () => { const v = (document.getElementById('link')?.value || '').trim();
      let host = 'a link'; try { host = new URL(v).hostname.replace('www.', ''); } catch (e) { /* keep */ }
      startDraft('From ' + host, 'Charred leek vinaigrette', [['leeks', 4, ''], ['dijon mustard', 1, 'tsp'], ['red wine vinegar', 1, 'tbsp'], ['olive oil', 4, 'tbsp'], ['capers', 1, 'tbsp'], ['parsley', 10, 'g']]); },
    'import-blank': () => startDraft('From my kitchen', '', []),
    'draft-ing': (k) => { S.draft.keep[+k] = !S.draft.keep[+k]; },
    'draft-col': (id) => { const c = S.draft.cols; const i = c.indexOf(id); i >= 0 ? c.splice(i, 1) : c.push(id); },
    'draft-save': () => { const d = S.draft; const name = (document.getElementById('draft-name')?.value || d.name || 'Untitled recipe').trim();
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
      const r = { id, name, tone: 1 + (S.recipes.length % 4), servings: 2, time: 20, kcal: 0, added: new Date().toISOString().slice(0, 10), source: d.source,
        collections: d.cols, fav: false, blurb: 'Freshly saved. Add a line about why you kept it.', ingredients: d.ingredients.filter((_, k) => d.keep[k]), steps: ['Add the method when you are ready.'], nutrition: {}, note: '' };
      S.recipes.unshift(r); S.draft = null; save();
      toast('Saved to your library', () => { S.recipes = S.recipes.filter((x) => x.id !== id); save(); go('#library'); }); go('#recipe-' + id); },
    theme: () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); },
    export: async () => { try { await navigator.clipboard.writeText(JSON.stringify({ recipes: S.recipes, collections: S.collections, menus: S.menus }, null, 2)); toast('Copied. Paste it anywhere safe.', null); }
      catch (e) { toast('Copy was blocked by the browser.', null); } },
    reset: () => { const snap = { r: S.recipes, c: S.collections, m: S.menus }; S.recipes = JSON.parse(JSON.stringify(D.recipes)); S.collections = [...D.collections]; save();
      toast('Sample library restored', () => { S.recipes = snap.r; S.collections = snap.c; S.menus = snap.m; save(); }); },
    undo: () => { const u = S.undo; S.toast = null; S.undo = null; clearTimeout(toastTimer); if (u) u(); }
  };
  const startDraft = (source, name, ingredients) => { S.draft = { source, name, ingredients, keep: ingredients.map(() => true), cols: [] }; go('#import-review'); };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.matches('input')) return;
    const fn = A[el.dataset.action]; if (!fn) return;
    e.preventDefault();
    Promise.resolve(fn(el.dataset.arg)).then(render);
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.action === 'import-shot' && el.files?.[0]) { startDraft('From a screenshot', el.files[0].name.replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' '), [['ingredients we could read', 0, '']]); return; }
    if (el.matches('input[type=checkbox][data-action]')) { A[el.dataset.action]?.(el.dataset.arg); render(); }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'q') { S.q = e.target.value; const box = document.getElementById('results'); if (box) box.innerHTML = resultsHtml(); }
    if (e.target.id === 'draft-name' && S.draft) S.draft.name = e.target.value;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && S.sheet) { S.sheet = null; render(); }
    const h = e.target.closest?.('[data-drag]');
    if (h && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveCol(h.dataset.drag, e.key === 'ArrowUp' ? -1 : 1); render(); document.querySelector(`[data-drag="${h.dataset.drag}"]`)?.focus(); }
  });

  /* ---- Today's pick: scroll, swipe or arrow keys move to the next pick ---- */
  let sy = null;
  document.addEventListener('pointerdown', (e) => { if (e.target.closest('[data-swipe]')) sy = e.clientY; });
  document.addEventListener('pointerup', (e) => { if (sy === null) return; const d = e.clientY - sy; sy = null;
    if (d < -40) { S.pick += 1; render(); } else if (d > 40) { S.pick -= 1; render(); } });
  // Wheel / trackpad: one pick per gesture (momentum is swallowed while locked)
  let wheelAcc = 0, wheelLock = false;
  document.addEventListener('wheel', (e) => {
    if (!e.target.closest('[data-swipe]')) return;
    e.preventDefault();
    if (wheelLock) { wheelAcc = 0; return; }
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) > 40) { S.pick += wheelAcc > 0 ? 1 : -1; wheelAcc = 0; wheelLock = true; setTimeout(() => { wheelLock = false; }, 650); render(); }
  }, { passive: false });
  document.addEventListener('keydown', (e) => {
    if (route().name !== 'library' || document.querySelector('.mm-splash') || e.target.closest?.('input, textarea, [role=button], button, a')) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); S.pick += 1; render(); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); S.pick -= 1; render(); }
  });

  /* ---- timer tick: update digits in place; on finish, toast + re-render ------- */
  setInterval(() => {
    let finished = null;
    Object.entries(S.timers).forEach(([key, t]) => {
      if (!t.end) return;
      const left = timerLeft(t);
      const el = document.querySelector(`[data-timer="${key}"]`); if (el) el.textContent = M.clock(left);
      if (left <= 0) { t.end = null; t.left = 0; t.done = true; finished = t; }
    });
    if (finished) { navigator.vibrate?.([200, 100, 200]); toast(`Timer done · ${finished.label}`, null); render(); }
  }, 250);

  /* ---- drag to reorder collections ---------------------------------------- */
  const moveCol = (id, d) => { const i = S.collections.findIndex((c) => c.id === id); const j = i + d; if (j < 0 || j >= S.collections.length) return;
    const [c] = S.collections.splice(i, 1); S.collections.splice(j, 0, c); save(); };
  function bindDrag() {
    const ul = document.getElementById('cols'); if (!ul) return;
    ul.querySelectorAll('[data-drag]').forEach((h) => h.addEventListener('pointerdown', (e) => {
      e.preventDefault(); const li = h.closest('li'); const id = h.dataset.drag; const rowH = li.offsetHeight; const y0 = e.clientY; let moved = 0;
      li.style.transition = 'none'; li.style.position = 'relative'; li.style.zIndex = '2'; li.style.background = 'var(--surface)';
      const onMove = (ev) => { li.style.transform = `translateY(${ev.clientY - y0}px)`; moved = Math.round((ev.clientY - y0) / rowH); };
      const onUp = () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp);
        if (moved) { const i = S.collections.findIndex((c) => c.id === id); const [c] = S.collections.splice(i, 1);
          S.collections.splice(Math.max(0, Math.min(S.collections.length, i + moved)), 0, c); save(); }
        render(); };
      document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
    }));
  }

  window.addEventListener('hashchange', () => { S.sheet = null; if (!location.hash.startsWith('#cook')) S.step = 0; render(); window.scrollTo(0, 0); });
  render();

  /* ---- Splash: once per browser session, outside #app so re-renders don't restart it */
  function showSplash() {
    if (document.querySelector('.mm-splash')) return;
    document.body.insertAdjacentHTML('beforeend', M.splash());
    document.documentElement.style.overflow = 'hidden';
    document.querySelector('.mm-splash [data-action="splash-close"]')?.focus({ preventScroll: true });
  }
  function closeSplash() {
    const el = document.querySelector('.mm-splash:not(.mm-splash--inline)'); if (!el || el.classList.contains('is-leaving')) return;
    try { sessionStorage.setItem('misemio.splash', '1'); } catch (e) { /* private mode: show again next time */ }
    el.classList.add('is-leaving');
    const done = () => { el.remove(); document.documentElement.style.overflow = ''; document.querySelector('#app a, #app button')?.focus({ preventScroll: true }); };
    el.addEventListener('animationend', (e) => { if (e.target === el) done(); });
    setTimeout(() => { if (el.isConnected) done(); }, 600);
  }
  A['splash-close'] = closeSplash;
  A['splash-show'] = showSplash;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.querySelector('.mm-splash')) closeSplash(); });
  let seen = false; try { seen = sessionStorage.getItem('misemio.splash') === '1'; } catch (e) { /* ignore */ }
  if (!seen) showSplash();
})();
