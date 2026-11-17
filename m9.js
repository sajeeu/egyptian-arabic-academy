/* Module 09 (Pediatrics): data hook-up and pages.
   Loaded after curriculum.js and module9.js, before the main script in index.html.
   Lesson IDs are M09_L01..M09_L36, so progress for Modules 01-08 is never touched. Progress uses the same
   saved format as every other lesson; the only new saved field is the optional S.m9 { seen, ticks }.
   Markup below uses the designer's class names; m9px() adds the "m9-" prefix that m9.css expects.
   Class attributes in single quotes are left alone (they use the app's own styles, e.g. the tutor box). */
var M9 = typeof MODULE9 !== 'undefined' ? MODULE9 : null;
if (M9) CURRICULUM.push(...M9.lessons);

var M9I = {
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>', right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chevr: '<path d="m9 18 6-6-6-6"/>', chevd: '<path d="m6 9 6 6 6-6"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  play: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  chat: '<path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  volume: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  slow: '<path d="m12 14-4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  retry: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  steth: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>'
};
function m9i(name, size = 18){ return `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${M9I[name]}</svg>`; }
function m9px(html){ return html.replace(/class="([^"]*)"/g, (m, c) => 'class="' + c.split(/\s+/).filter(Boolean).map(x => 'm9-' + x).join(' ') + '"'); }
var M9_ST = '<circle class="ring" cx="12" cy="12" r="9"/><path class="half" d="M12 3a9 9 0 0 1 0 18z"/><path class="tick" d="m8 12.5 2.8 2.8 5.4-5.7"/>';

/* ---------- State helpers ---------- */
var m9pad = n => String(n).padStart(2, '0');
var m9code = L => `M09 · L${m9pad(L.lesson)}`;
var m9unitText = L => `Unit ${m9pad(L.unit)} · ${M9.units[L.unit - 1].title}`;
var m9mine = (L, e) => e.who === L.learner;
// All turns confirmed but "Complete lesson" not tapped yet: the End of lesson page is waiting.
var m9Pending = id => { const s = S.lessons[id]; return !!s && !isDone(id) && s.confirmed.length >= byId[id].ex.length; };
// Her next pediatric lesson: one she has started, otherwise the first one not complete.
function m9Next(){ return M9.lessons.find(l => status(l.id) === 'in_progress') || M9.lessons.find(l => !isDone(l.id)) || null; }
var m9st = id => ({ complete: 'c', in_progress: 'p', not_started: 'n' }[status(id)]);
function m9Track(n, idx, confirmed, scenesOf){
  let h = '';
  for (let k = 1; k <= n; k++) h += `<span class="${confirmed.includes(k) ? 'done' : k === idx ? 'now' : ''}${k > 1 && scenesOf && scenesOf[k - 1].scene ? ' brk' : ''}"></span>`;
  return h;
}

/* ---------- Shell: render, clicks, audio, first-open note ---------- */
var m9Says = [], m9Open = null, m9LabOpen = {}, m9CaseOpen = {};
function m9Render(html, cls = '', style = ''){
  m9Says = [];
  $app.classList.add('wide');
  $app.innerHTML = m9px(`<div class="eaa"><div class="page ${cls}"${style ? ` style="${style}"` : ''}>${typeof html === 'function' ? html() : html}</div></div>`);
  const root = $app.firstElementChild;
  root.addEventListener('click', m9Click);
  m9Sheet(root);
  return root;
}
function m9say(text){ m9Says.push(text); return m9Says.length - 1; }
function m9Click(e){
  const go = e.target.closest('[data-go]');
  if (go){ const [v, id] = go.dataset.go.split(':'); return m9Go(v, id); }
  const say = e.target.closest('[data-say]');
  if (say) return m9Play(say, m9Says[+say.dataset.say]);
  const acc = e.target.closest('[data-acc]');
  if (acc){
    const card = acc.closest('.m9-card'), open = card.classList.toggle('m9-open'), [kind, key] = acc.dataset.acc.split(':');
    acc.setAttribute('aria-expanded', open);
    ({ unit: m9Open, lab: m9LabOpen, case: m9CaseOpen }[kind])[key] = open;
  }
}
function m9Go(v, id){
  if (v === 'start'){ startLesson(id); return show('lesson', id); }
  if (v === 'settings') return show('progress', null, { askKey: true });
  if (v === 'home') return show('dashboard');
  show(v, id);
}
// Tap to hear: the row lights up while its audio plays.
var m9Lit = null, m9LitTimer = 0;
function m9Play(el, text){
  const clear = () => { clearTimeout(m9LitTimer); if (m9Lit){ m9Lit.classList.remove('m9-on'); m9Lit.setAttribute('aria-pressed', 'false'); m9Lit = null; } };
  const again = m9Lit === el; clear();
  if (again){ if ('speechSynthesis' in window) speechSynthesis.cancel(); return; }
  m9Lit = el; el.classList.add('m9-on'); el.setAttribute('aria-pressed', 'true');
  m9LitTimer = setTimeout(clear, 20000);
  speak(text, 0.85, t => { if (t && /^(Playing|Starting|Getting)/.test(t)) return; if (m9Lit === el) clear(); if (t) toast(t); });
}
// Safety and scope note: shown once, the first time any Module 09 page opens. Always available in the Module guide.
function m9Sheet(root){
  const old = document.getElementById('m9sheet'); if (old) old.remove();
  if (S.m9 && S.m9.seen) return;
  document.body.insertAdjacentHTML('beforeend', m9px(`<div class="eaa scrim" id="m9sheet"><div class="sheet stack g16" role="dialog" aria-modal="true" aria-labelledby="m9sheet-h">
    <div class="row g12"><span class="tile amber">${m9i('shield', 22)}</span><div class="stack"><span class="eyebrow">Before you start Module 09</span><h2 class="h2" id="m9sheet-h">Safety and scope</h2></div></div>
    <p class="sm" style="color: var(--ink)">${esc(M9.intro.safety).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>
    <p class="note">${m9i('info', 16)}<span>Shown once. You can read it again any time in Module guide › Safety and scope.</span></p>
    <button type="button" class="btn primary block" id="m9sheetOk">I understand, continue</button></div></div>`));
  const ok = document.getElementById('m9sheetOk');
  ok.onclick = () => { S.m9 = { ...(S.m9 || {}), seen: true }; save(); document.getElementById('m9sheet').remove(); };
  ok.focus({ preventScroll: true });
}
function m9Head(backLabel, backGo, right){
  return `<div class="row between wrap g12"><button type="button" class="btn ghost sm back" data-go="${backGo}">${m9i('back', 16)}${backLabel}</button>${right}</div>`;
}
function m9Turns(L){
  return L.ex.map(e => { const you = m9mine(L, e);
    return `<li><button type="button" class="turn ${you ? 'you' : 'other'}" aria-pressed="false" data-say="${m9say(e.ar)}"><span class="turn-n">${e.n}</span><span class="who ${you ? 'you' : 'other'}">${esc(e.who)}${you ? ' · you say' : ''}</span><span class="spk" aria-hidden="true">${m9i('volume', 18)}</span><span class="ar ar-md" lang="ar" dir="rtl">${esc(e.ar)}</span><span class="tl">${esc(e.lat)}</span><span class="en">${esc(e.en)}</span></button></li>`; }).join('');
}

/* ---------- Home, Settings and Search hooks (used by index.html; plain classes, no prefixing) ---------- */
function m9HomeCard(){
  const L = m9Next(); if (!L || primary() === L) return '';
  const s = S.lessons[L.id], n = L.ex.length, idx = s ? s.idx : 1, conf = s ? s.confirmed : [], pend = m9Pending(L.id);
  const meta = pend ? 'All turns confirmed' : s ? `Turn ${idx} of ${n}` : `${n} turns`;
  return `<button type="button" class="m9-peds" id="m9peds" onclick="show('lesson','${L.id}')" aria-label="${s ? 'Resume' : 'Open'} Pediatrics lesson ${label(L.id)}, ${esc(L.title)}, ${meta}">
    <span class="m9-peds-ic">${ic('steth')}</span>
    <span class="m9-peds-b"><span><span class="m9-peds-k">Next in Pediatrics</span><span class="m9-peds-t">${esc(L.title)}</span><span class="m9-peds-m">${m9code(L)} · ${meta}</span></span>
      <span class="m9-ptrack" aria-hidden="true">${m9Track(n, pend ? 0 : idx, conf)}</span></span>
    <span class="m9-peds-go">${ic('playCircle')}</span></button>`;
}
function m9HomeRow(){
  const ls = M9.lessons, c = ls.filter(l => isDone(l.id)).length, p = ls.filter(l => status(l.id) === 'in_progress').length, full = c === ls.length;
  const dots = M9.units.map(u => { const us = u.lessons.map(status); return `<span class="dot ${us.every(x => x === 'complete') ? 'c' : us.some(x => x !== 'not_started') ? 'p' : ''}"></span>`; }).join('');
  return `<button type="button" class="mod m9-modrow${c || p ? ' active' : ''}${full ? ' done' : ''}" id="m9row" onclick="show('m9')"><span class="mod-num"${full ? ' aria-label="Module 09 complete"' : ''}>${full ? ic('check') : '09'}</span>
    <span class="grow"><span class="mod-h">Module 09${full ? `<span class="mod-done">${ic('checkCircle', 'sm')}Module complete</span>` : ''}</span><span class="mod-name">${esc(MODULE_NAMES[9])}</span>
      <span class="mod-count">${full ? `All ${ls.length} lessons complete` : `${c}/${ls.length} complete${p ? ` · ${p} in progress` : ''} · ${M9.units.length} units`}</span></span>
    <span class="dots" aria-hidden="true">${dots}</span><span class="chev-box">${ic('right')}</span></button>`;
}
// Settings: one segment per unit, filled as its 4 lessons are completed; amber shows a lesson in progress.
function m9SettingsBar(c, p){
  return `<div class="m9-sbar" role="img" aria-label="${c} of ${M9.lessons.length} lessons complete${p ? `, ${p} in progress` : ''}">` + M9.units.map(u => {
    const uc = u.lessons.filter(isDone).length, up = u.lessons.filter(id => status(id) === 'in_progress').length;
    return `<span><i class="p" style="width:${(uc + up) * 100 / u.lessons.length}%"></i><i style="width:${uc * 100 / u.lessons.length}%"></i></span>`; }).join('') +
    `</div><span class="m9-sbar-n">${M9.units.length} units · one segment per unit, filled as its ${M9.units[0].lessons.length} lessons are completed</span>`;
}
// Search: vocabulary terms are their own result type and open the unit's vocabulary page.
function m9SearchVocab(t, norm){
  const hits = [];
  for (const u of M9.units) for (const v of u.vocab) if ([v.ar, v.lat, v.en].some(x => norm(x).includes(t))) hits.push([u, v]);
  if (!hits.length) return '';
  return m9px(`<div class="eaa" id="m9vhits"><section class="stack g10" style="margin-bottom: 16px"><div class="row between base"><h2 class="h3">Vocabulary</h2><span class="xs">${hits.length} ${hits.length === 1 ? 'term' : 'terms'}</span></div>` +
    hits.slice(0, 12).map(([u, v]) => `<button type="button" class="card hit" onclick="show('m9vocab',${u.n})"><span class="tile sm">${m9i('book', 16)}</span>
      <span class="grow stack g6"><span class="row between wrap g8"><span class="pill green">Vocabulary term</span><span class="xs">Unit ${m9pad(u.n)} vocabulary · Module 09</span></span>
        <span class="row between g12"><span class="stack g2"><span class="tl" style="font-size: 17px">${esc(v.lat)}</span><span class="en">${esc(v.en)}</span></span><span class="ar ar-md" lang="ar" dir="rtl" style="flex: 0 1 auto; max-width: 56%">${esc(v.ar)}</span></span></span>
      <span class="chevr">${m9i('chevr', 18)}</span></button>`).join('') + `</section></div>`);
}
function m9SearchWho(L, e){
  if (L.module !== 9) return '';
  const you = m9mine(L, e);
  return `<span class="m9-swho ${you ? 'you' : 'other'}">${esc(e.who)}${you ? ' · you say' : ''}</span>`;
}

/* ---------- Module 09 overview ---------- */
function m9Overview(){
  const ls = M9.lessons, done = ls.filter(l => isDone(l.id)).length, next = m9Next(), allDone = done === ls.length;
  const started = ls.some(l => status(l.id) !== 'not_started');
  if (!m9Open){ m9Open = {}; m9Open[next ? next.unit : 1] = true; }
  const ubar = M9.units.map(u => { const c = u.lessons.filter(isDone).length, p = u.lessons.filter(id => status(id) === 'in_progress').length;
    return `<span><i class="p" style="width: ${(c + p) * 25}%"></i><i style="width: ${c * 25}%"></i></span>`; }).join('');
  let nextCard = '';
  if (allDone) nextCard = `<section class="card pad stack g12" aria-labelledby="done-h" style="border-color: var(--pri)">
      <div class="row g12"><span class="tile" style="background: var(--pri); color: var(--on-pri)">${m9i('check', 22)}</span><div class="stack"><h2 class="h3" id="done-h">Module 09 complete</h2><span class="xs">All ${ls.length} lessons confirmed by you</span></div></div>
      <div class="row wrap g10"><button type="button" class="btn soft sm grow" data-go="m9guide:check">Mastery checklist</button><button type="button" class="btn ghost sm grow" data-go="m9lab">Conversation Lab</button></div></section>`;
  else {
    const s = S.lessons[next.id], n = next.ex.length, pend = m9Pending(next.id);
    nextCard = s ? `<section class="card pad stack g12" aria-labelledby="next-h">
      <div class="row between g12"><span class="eyebrow">Next lesson</span><span class="pill amber">In progress</span></div>
      <div class="stack g4"><span class="xs">${m9code(next)} · Unit ${m9pad(next.unit)}</span><h2 class="h3" id="next-h">${esc(next.title)}</h2></div>
      <div class="stack g8"><div class="row between base"><span class="xs b">${pend ? 'All turns confirmed' : `Turn ${s.idx} of ${n}`}</span><span class="xs tc">${s.confirmed.length} confirmed</span></div>
        <div class="track" aria-hidden="true">${m9Track(n, pend ? 0 : s.idx, s.confirmed, next.ex)}</div></div>
      <button type="button" class="btn primary block" data-go="lesson:${next.id}">${m9i('play', 18)}${pend ? 'Finish lesson' : 'Resume lesson'}</button></section>`
    : `<section class="card pad stack g12" aria-labelledby="start-h">
      <span class="eyebrow">${started ? 'Next lesson' : 'Start here'}</span>
      <div class="stack g4"><span class="xs">${m9code(next)} · Unit ${m9pad(next.unit)} · ${n} turns</span><h2 class="h3" id="start-h">${esc(next.title)}</h2></div>
      <div class="row wrap g10"><button type="button" class="btn primary grow" data-go="start:${next.id}">${m9i('play', 18)}Start lesson</button>
        <button type="button" class="btn ghost" data-go="overview:${next.id}">${m9i('eye', 18)}Preview</button></div></section>`;
  }
  const unitsDone = M9.units.filter(u => u.lessons.every(isDone)).length;
  const units = M9.units.map(u => {
    const c = u.lessons.filter(isDone).length, p = u.lessons.filter(id => status(id) === 'in_progress').length, open = !!m9Open[u.n], num = m9pad(u.n);
    return `<div class="card ${open ? 'open' : ''}">
      <h3 style="font: inherit"><button type="button" class="acc-head" aria-expanded="${open}" data-acc="unit:${u.n}">
        <span class="mnum ${c === 4 ? 'done' : c || p ? 'active' : ''}">${num}</span>
        <span class="grow stack g2"><span class="eyebrow">Unit ${num}</span><span class="ut">${esc(u.title)}</span><span class="xs">${c} of ${u.lessons.length} complete${p ? ` · ${p} in progress` : ''}</span></span>
        <span class="dots wide-only" aria-hidden="true">${u.lessons.map(id => `<span class="dot ${m9st(id)}"></span>`).join('')}</span>
        <span class="chev">${m9i('chevd', 18)}</span></button></h3>
      <div class="acc"><div class="acc-in"><div class="acc-body stack g2">
        <p class="xs" style="padding: 4px 10px 8px">${esc(u.focus)}</p>` +
        u.lessons.map(id => { const l = byId[id], x = m9st(id), s = S.lessons[id], n = l.ex.length;
          const st = x === 'c' ? 'Complete' : x === 'p' ? (m9Pending(id) ? 'In progress · all turns confirmed' : `In progress · turn ${s.idx} of ${n}`) : `${n} turns`;
          return `<button type="button" class="lrow" data-go="overview:${id}"><svg class="st ${x}" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${M9_ST}</svg><span class="grow stack"><span class="xs">L${m9pad(l.lesson)} · <span class="${x === 'c' ? 'tc' : x === 'p' ? 'tp' : ''}">${st}</span></span><span class="lt">${esc(l.title)}</span></span><span class="chevr">${m9i('chevr', 18)}</span></button>`; }).join('') +
        `<button type="button" class="lrow" data-go="m9vocab:${u.n}"><span class="tile sm gray" style="width: 20px; height: 20px; background: none">${m9i('book', 18)}</span><span class="grow stack"><span class="xs">${u.vocab.length} terms</span><span class="lt">Unit vocabulary</span></span><span class="chevr">${m9i('chevr', 18)}</span></button>
      </div></div></div></div>`; }).join('');
  const vocabN = M9.units.reduce((n, u) => n + u.vocab.length, 0);
  m9Render(`${m9Head('Home', 'home', '<span class="pill green">Module 09</span>')}
    <div class="stack g4"><h1 class="h1">${esc(M9.title)}<span class="ar ar-h" lang="ar" dir="rtl">${esc(M9.titleAr)}</span></h1>
      <p class="xs">${M9.units.length} units · ${ls.length} lessons · ${vocabN} vocabulary terms</p></div>
    <div class="layout"><div class="stack g16">
      <section class="card pad stack g12" aria-labelledby="mp-h">
        <div class="row between base g12"><h2 class="h3" id="mp-h">Module progress</h2><span class="xs b">${done} of ${ls.length} lessons complete</span></div>
        <div class="ubar" role="img" aria-label="${done} of ${ls.length} lessons complete">${ubar}</div>
        <p class="note">${m9i('info', 16)}<span>One bar segment per unit. Each unit has 4 lessons.</span></p></section>
      ${nextCard}
      <div role="navigation" class="card divide" aria-label="Module 09 extras" style="padding: 6px">
        <button type="button" class="lrow" data-go="m9lab"><span class="tile sm">${m9i('chat', 16)}</span><span class="grow stack"><span class="lt">Conversation Lab</span><span class="xs">${M9.lab.length} short dialogues · extra practice</span></span><span class="chevr">${m9i('chevr', 18)}</span></button>
        <button type="button" class="lrow" data-go="m9guide"><span class="tile sm">${m9i('book', 16)}</span><span class="grow stack"><span class="lt">Module guide</span><span class="xs">Register and gender · patterns · practice cases · checklist</span></span><span class="chevr">${m9i('chevr', 18)}</span></button>
        <button type="button" class="lrow" data-go="m9guide:safety"><span class="tile sm amber">${m9i('shield', 16)}</span><span class="grow stack"><span class="lt">Safety and scope</span><span class="xs">Language practice, not a clinical protocol</span></span><span class="chevr">${m9i('chevr', 18)}</span></button>
      </div></div>
      <section class="stack g12" aria-labelledby="units-h">
        <div class="row between base"><h2 class="h2" id="units-h">Units</h2><span class="xs">${unitsDone} of ${M9.units.length} units complete</span></div>${units}</section></div>`);
}

/* ---------- Lesson preview (the whole conversation; never changes progress) ---------- */
function m9Preview(id){
  const L = byId[id], st = status(id), s = S.lessons[id], n = L.ex.length, mine = L.ex.filter(e => m9mine(L, e)).length;
  const others = L.speakers.split(',').map(x => x.trim()).filter(x => x.toLowerCase() !== L.learner.toLowerCase());
  const pend = m9Pending(id);
  const cta = st === 'complete'
    ? `<div class="row g12"><span class="tile" style="background: var(--pri); color: var(--on-pri)">${m9i('check', 22)}</span><div class="grow stack"><span class="b">Lesson complete</span><span class="xs">Confirmed by you · tap a turn to hear it again</span></div></div>`
    : st === 'in_progress'
    ? `<p class="note">${m9i('info', 16)}<span>${pend ? 'You have confirmed every turn. Finish the lesson when you are ready.' : `You are on turn ${s.idx} of ${n}, with ${s.confirmed.length} confirmed.`}</span></p>
       <button type="button" class="btn primary block" data-go="lesson:${id}">${m9i('play', 18)}${pend ? 'Finish lesson' : 'Resume lesson'}</button>`
    : `<p class="note">${m9i('eye', 16)}<span>Previewing never changes your progress.</span></p>
       <button type="button" class="btn primary block" data-go="start:${id}">${m9i('play', 18)}Start lesson</button>`;
  const pill = st === 'complete' ? '<span class="pill green">Complete</span>' : st === 'in_progress' ? '<span class="pill amber">In progress</span>' : `<span class="pill">${m9i('eye', 14)}Preview only</span>`;
  m9Render(() => `${m9Head('Module 09', 'm9', `<div class="row g8">${pill}<span class="pill green">${m9code(L)}</span></div>`)}
    <div class="stack g4"><h1 class="h1">${esc(L.title)}</h1><p class="xs">${esc(m9unitText(L))}</p></div>
    <div class="layout"><div class="stack g16">
      <section class="card pad stack g16" aria-label="About this lesson">
        <div class="stack g8"><span class="eyebrow">Speakers</span>
          <div class="row wrap g6"><span class="who you">${m9i('mic', 14)}${esc(L.learner)} · your lines</span>${others.map(p => `<span class="who other">${esc(p)}</span>`).join('')}</div></div>
        <div class="stack g4"><span class="eyebrow">Clinical arc</span><p style="font-size: 15px; line-height: 1.5">${esc(L.arc)}</p></div>
        <div class="stack g6"><span class="eyebrow">Learning objectives</span>
          <ul class="stack g4">${L.objectives.split('; ').map(o => `<li class="obj">${m9i('check', 16)}<span>${esc(o)}</span></li>`).join('')}</ul></div>
      </section>
      <div class="caution">${m9i('alert', 20)}<div class="stack g2"><span class="eyebrow" style="color: inherit">Clinical language caution</span><p>${esc(L.caution)}</p></div></div>
      <section class="card pad stack g12" aria-label="Start">${cta}</section></div>
      <section class="stack g12" aria-labelledby="tr-h">
        <div class="row between base wrap g8"><h2 class="h2" id="tr-h">Conversation</h2><span class="xs">${n} turns · ${mine} yours</span></div>
        <p class="sm">The whole conversation in order. Green turns are yours to say; blue turns are the ones you need to understand. Tap a turn to hear it.</p>
        <div class="card"><ol class="divide" style="padding: 6px">${m9Turns(L)}</ol></div>
        ${st === 'not_started' ? `<button type="button" class="btn primary block" data-go="start:${id}">${m9i('play', 18)}Start lesson</button>` : ''}
      </section></div>`);
}

/* ---------- Tutor box (the app's own tutor UI and styles) ---------- */
var M9_TUTORBOX = `<div id="tutorBox" hidden><div class='log' id="log"></div><div id="tstatus" class='tstatus'></div>
  <div class='compose' id="composeRow" hidden><input type="text" id="typed" placeholder="…or type a message" class='grow'><button class='btn ghost' id="send" aria-label="Send message"></button></div></div>`;
function m9WireTutor(L, ex, prompt){
  const b = document.getElementById('tutorStart'); if (!b) return;
  document.getElementById('send').innerHTML = ic('send');
  tutorBtn(false);
  b.onclick = () => { if (tutor){ stopTutor(); setStatus('Conversation ended.'); endTutorUI(true); } else startTutor(L, ex, prompt); };
  const typed = document.getElementById('typed');
  const send = () => { const t = typed.value.trim(); if (t && tutor && tutor.ready){ typed.value = ''; sendTyped(t); } };
  document.getElementById('send').onclick = send;
  typed.onkeydown = e => { if (e.key === 'Enter') send(); };
}
var M9_TUTOR_BASE = 'You are a warm, patient Egyptian Arabic tutor in a live voice conversation. The learner is a female doctor in Egypt who is training in pediatrics. Explain in English; practise in Egyptian colloquial Arabic (Cairo dialect, not Modern Standard Arabic). Speak Arabic slowly and clearly. This is language practice only: never give clinical advice, doses or treatment decisions.';
function m9Script(L){ return L.ex.map(e => `${e.n}. ${e.who}: ${e.ar} | ${e.lat} | ${e.en}`).join('\n'); }
function m9TurnPrompt(L, ex){
  const you = m9mine(L, ex);
  return `${M9_TUTOR_BASE}

Current lesson: ${label(L.id)} — ${L.title}. The learner plays the ${L.learner}. Other speakers: ${L.speakers}.
The lesson conversation (use these EXACT lines; do not invent other lesson lines):
${m9Script(L)}

Focus now on turn ${ex.n}, spoken by the ${ex.who}: ${ex.ar} (${ex.lat}) — "${ex.en}".
${you ? 'This is a line the learner says. Greet briefly, say the line slowly, and invite her to repeat it.' : 'This is a line the learner needs to understand. Greet briefly, say the line slowly as that speaker would, and check that she understands it.'} Then help her practise: answer questions about meaning or pronunciation, give short gentle tips, and act out this part of the conversation with her, you taking the other speakers.
Keep each turn short (one to three sentences) and then let the learner speak. Never tell the learner the turn or lesson is complete; she taps "Complete" in the app herself when she feels ready.`;
}
function m9RolePrompt(L){
  return `${M9_TUTOR_BASE}

The learner has just finished lesson ${label(L.id)} — ${L.title}. She plays the ${L.learner}. This was the lesson conversation:
${m9Script(L)}

Now run this role-play with her: ${L.roleplay}
You play the other people (${L.speakers}) in Egyptian Arabic, giving varied and sometimes incomplete answers; she replies as the doctor. Start by setting the scene in one English sentence, then speak your first line in Arabic. If she is stuck, offer a line from the lesson. Keep each turn short and let her speak. Never tell her the lesson is complete; she confirms that herself in the app.`;
}
function m9CasePrompt(c){
  return `${M9_TUTOR_BASE}

Run this unscripted practice case with her. Case ${c.id} — ${c.title}: ${c.text}
You play the family members and staff in Egyptian Arabic; she is the doctor. Start by setting the scene in one English sentence, then speak your first line in Arabic. Keep each turn short and let her speak. If she is stuck, suggest a simple Egyptian Arabic phrase she could use.`;
}

/* ---------- Lesson in progress: one turn per card ---------- */
function m9Lesson(id, opts = {}){
  const L = byId[id], st = status(id);
  if (st === 'not_started' || st === 'complete') return m9Preview(id);
  if (m9Pending(id)) return m9End(id);
  const s = S.lessons[id], n = L.ex.length, ex = L.ex[s.idx - 1], prev = L.ex[s.idx - 2], you = m9mine(L, ex), len = ex.ar.length;
  const scenes = L.ex.filter(e => e.scene).map(e => ({ from: e.n, ...e.scene }));
  let scene = null; scenes.forEach(x => { if (s.idx >= x.from) scene = x; });
  const tile = (key, name, lead, icon) => `<button type="button" class="atile${lead ? ' lead' : ''}" id="${key}" aria-pressed="false"><span class="atile-ic">${m9i(icon, 22)}</span>${name}</button>`;
  m9Render(`${opts.justFinished ? `<div data-raw="finish"></div>` : ''}
    ${m9Head('Module 09', 'm9', `<span class="pill green">${m9code(L)}</span>`)}
    <div class="stack g12">
      <div class="stack g2"><h1 class="h2">${esc(L.title)}</h1><span class="xs">${esc(m9unitText(L))}</span></div>
      <div class="stack g8" id="m9prog">
        <div class="row between base g12"><span class="b" style="font-size: 14px">Turn ${s.idx} of ${n}</span><span class="xs tc" style="color: var(--gink)">${s.confirmed.length} confirmed</span></div>
        <div class="track" role="img" aria-label="Turn ${s.idx} of ${n}, ${s.confirmed.length} confirmed">${m9Track(n, s.idx, s.confirmed, L.ex)}</div>
        ${scene ? `<div class="row wrap g8"><span class="pill blue">${esc(scene.title)}</span><span class="xs">Scene ${scene.n} of ${scenes.length}</span></div>` : ''}
      </div></div>
    <div class="layout rev">
      <div class="stack g12">
        ${scene && scene.from === s.idx ? `<div class="inset row g12"><span class="tile sm gray">${m9i('list', 16)}</span><div class="stack"><span class="eyebrow">New scene</span><span class="b">${esc(scene.title)}</span><span class="xs">${esc(scene.setting)}</span></div></div>` : ''}
        ${prev ? `<div class="prev"><span class="xs none">Before</span><span class="who none ${m9mine(L, prev) ? 'you' : 'other'}">${esc(prev.who)}</span><span class="ar" lang="ar" dir="rtl">${esc(prev.ar)}</span></div>` : ''}
        <section class="card turncard grow ${you ? 'you' : 'other'}" aria-label="${you ? 'You say this' : 'You hear this'}">
          <div class="band">${m9i(you ? 'mic' : 'ear', 18)}<span>${you ? 'You say this' : 'You hear this'}</span><span class="name">${esc(ex.who)}</span></div>
          <div class="turn-body stack g8 grow" style="justify-content: center">
            <p class="ar ${len <= 22 ? 'ar-xl' : len <= 54 ? 'ar-lg' : 'ar-long'}" lang="ar" dir="rtl">${esc(ex.ar)}</p>
            <p class="tl" style="font-size: 18px">${esc(ex.lat)}</p><p class="en" style="font-size: 16px">${esc(ex.en)}</p></div>
          <div style="width: 100%; display: flex; justify-content: center; padding: 16px clamp(16px, 4cqw, 36px) clamp(20px, 4cqw, 32px)">
            <div class="tiles" role="group" aria-label="Audio practice">${tile('play', 'Listen', !you, 'volume')}${tile('slow', 'Slowly', false, 'slow')}${tile('mic', 'Say it', you, 'mic')}</div></div>
          <div class="heard" id="heard"></div>
        </section></div>
      <div class="stack g16">
        <section class='card tutor-card' aria-labelledby="tutor-h">
          <div class='tutor-head'><span class='tutor-ico'>${ic('headset')}</span>
            <div class='grow'><h2 id="tutor-h" class='tutor-t'>Practise with your tutor</h2>
              <p class='tutor-d'>Talk out loud about this turn: say it, ask what it means, or role-play the scene. Stop whenever you like.</p></div></div>
          <button type="button" class='btn pale block' id="tutorStart" aria-pressed="false"></button>${M9_TUTORBOX}</section>
        <div class="stack g10 acts">
          <button type="button" class="btn primary lg block go" id="ok">Complete &amp; Next${m9i('right', 20)}</button>
          <button type="button" class="btn ghost block" id="again">${m9i('retry', 17)}Not Complete — Practice Again</button>
          <div id="againMsg"></div>
          <p class="note">${m9i('info', 16)}<span>Tap Complete when <em>you</em> feel ready. It’s your own confirmation, not a pronunciation score.</span></p>
        </div></div></div>`, '', 'max-width: 1080px');
  const raw = $app.querySelector('[data-raw="finish"]'); if (raw) raw.outerHTML = finishNote(opts.justFinished);
  document.getElementById('m9prog').classList.add('lprog');          // the app scrolls here when moving to the next turn on a phone
  const heard = document.getElementById('heard');
  const tiles = { play: document.getElementById('play'), slow: document.getElementById('slow'), mic: document.getElementById('mic') };
  let lit = null, litTimer = 0;
  const light = k => { Object.entries(tiles).forEach(([key, b]) => { b.classList.toggle('m9-on', key === k); b.setAttribute('aria-pressed', key === k); });
    lit = k; clearTimeout(litTimer); if (k) litTimer = setTimeout(() => light(null), 20000); };
  const audioMsg = t => { heard.innerHTML = t ? note('volume', t) : ''; if (!t || !/^(Playing|Starting|Getting)/.test(t)) light(null); };
  tiles.play.onclick = () => { light('play'); speak(ex.ar, 0.85, audioMsg); };
  tiles.slow.onclick = () => { light('slow'); speak(ex.ar, 0.55, audioMsg); };
  tiles.mic.onclick = () => { light('mic'); listen(heard, () => { if (lit === 'mic') light(null); }); };
  m9WireTutor(L, ex, m9TurnPrompt(L, ex));
  document.getElementById('ok').onclick = e => { e.currentTarget.disabled = true; m9Confirm(id, s.idx); };
  document.getElementById('again').onclick = () => {
    document.getElementById('againMsg').innerHTML = note('retry', 'No problem, nothing has changed. Listen again, say it slowly a few times, or talk it through with the tutor.');
  };
}
// She confirms the current turn. The last turn opens End of lesson; the lesson is complete only when she says so there.
function m9Confirm(id, n){
  const L = byId[id], st = S.lessons[id];
  if (!st || isDone(id) || st.idx !== n || st.confirmed.includes(n)) return;
  st.confirmed.push(n);
  if (n < L.ex.length){ st.idx = n + 1; save(); return show('lesson', id); }
  save(); show('m9end', id);
}

/* ---------- End of lesson: role-play, caution, her own "Complete lesson" ---------- */
function m9End(id){
  const L = byId[id], n = L.ex.length;
  if (status(id) === 'not_started') return m9Preview(id);
  if (!isDone(id) && !m9Pending(id)) return m9Lesson(id);
  const done = isDone(id), hasKey = !!localStorage.getItem('gemini_key'), modDone = M9.lessons.every(l => isDone(l.id));
  m9Render(`${m9Head('Module 09', 'm9', `<span class="pill green">${m9code(L)}</span>`)}
    <div class="stack g12">
      <div class="stack g4"><h1 class="h1">Conversation finished</h1><span class="xs">${esc(L.title)} · ${esc(m9unitText(L))}</span></div>
      <div class="stack g8"><div class="row between base g12"><span class="b" style="font-size: 14px">Turn ${n} of ${n}</span><span class="xs" style="color: var(--gink)">${n} confirmed</span></div>
        <div class="track" role="img" aria-label="All ${n} turns confirmed">${'<span class="done"></span>'.repeat(n)}</div></div></div>
    <section class="card pad stack g16" aria-labelledby="rp-h">
      <div class="row top g12"><span class="tile">${m9i('users', 22)}</span>
        <div class="grow stack g6"><h2 class="h3" id="rp-h">Independent role-play</h2><p style="font-size: 16px; line-height: 1.55">${esc(L.roleplay)}</p></div></div>
      ${hasKey ? `<div class="stack g10"><button type="button" class='btn pale block' id="tutorStart" data-label="Practise this role-play with your tutor" aria-pressed="false"></button>${M9_TUTORBOX}
          <p class="note">${m9i('info', 16)}<span>The tutor is optional. You can also practise aloud on your own or with a partner.</span></p></div>`
        : `<div class="inset stack g10"><div class="row top g12"><span class="tile sm gray">${m9i('headset', 16)}</span><div class="grow stack g2"><span class="b">Tutor not set up</span><span class="sm">Practise aloud on your own or with a partner. To use the voice tutor, add your own key in Settings.</span></div></div>
          <button type="button" class="btn ghost sm" data-go="settings" style="align-self: flex-start">Open Settings</button></div>`}
    </section>
    <div class="caution">${m9i('alert', 20)}<div class="stack g2"><span class="eyebrow" style="color: inherit">Clinical language caution</span><p>${esc(L.caution)}</p></div></div>
    <div class="stack g10">
      ${done ? `<div class="card pad row g12" style="border-color: var(--pri)"><span class="tile" style="background: var(--pri); color: var(--on-pri)">${m9i('check', 22)}</span><div class="grow stack"><span class="b">${modDone ? 'Module 09 complete' : 'Lesson complete'}</span><span class="xs">Confirmed by you</span></div><button type="button" class="btn soft sm go" data-go="m9">Module 09${m9i('right', 16)}</button></div>`
        : `<button type="button" class="btn primary lg block" id="m9complete">${m9i('check', 20)}Complete lesson</button>`}
      <button type="button" class="btn ghost block" data-go="overview:${id}">${m9i('eye', 18)}Review the conversation</button>
      ${done ? '' : `<p class="note">${m9i('info', 16)}<span>Tap Complete when <em>you</em> feel ready. It’s your own confirmation, not a pronunciation score.</span></p>`}
    </div>`, 'narrow');
  if (hasKey) m9WireTutor(L, L.ex[0], m9RolePrompt(L));
  const c = document.getElementById('m9complete');
  if (c) c.onclick = () => { c.disabled = true; if (!isDone(id)){ S.completed.push(id); save(); } show('m9end', id); };
}

/* ---------- Unit vocabulary ---------- */
function m9Vocab(n){
  const u = M9.units[(+n || 1) - 1] || M9.units[0];
  m9Render(() => `${m9Head('Module 09', 'm9', `<span class="pill green">Unit ${m9pad(u.n)}</span>`)}
    <div class="stack g4"><h1 class="h1">Unit vocabulary</h1><p class="xs">Unit ${m9pad(u.n)} · ${esc(u.title)} · ${u.vocab.length} terms</p></div>
    <p class="note">${m9i('volume', 16)}<span>Tap a term to hear it.</span></p>
    <ul class="cols2">${u.vocab.map(v => `<li><button type="button" class="term" aria-pressed="false" data-say="${m9say(v.ar)}">
      <span class="grow stack g2"><span class="tl">${esc(v.lat)}</span><span class="en">${esc(v.en)}</span></span>
      <span class="ar ar-md" lang="ar" dir="rtl" style="flex: 0 1 auto; max-width: 56%">${esc(v.ar)}</span>
      <span class="spk" aria-hidden="true">${m9i('volume', 18)}</span></button></li>`).join('')}</ul>`);
}

/* ---------- Conversation Lab (optional; never counts towards the module) ---------- */
function m9Lab(){
  m9Render(() => `${m9Head('Module 09', 'm9', '')}
    <div class="stack g8"><h1 class="h1">Conversation Lab</h1><p class="sm">Extra practice to help you follow real conversations and answer with confidence. Try a dialogue after its matching lesson, or as a surprise role-play.</p></div>
    <div class="stack g10">${M9.lab.map(D => { const code = 'B' + m9pad(D.lab), open = !!m9LabOpen[code];
      return `<div class="card ${open ? 'open' : ''}"><h3 style="font: inherit"><button type="button" class="acc-head" aria-expanded="${open}" data-acc="lab:${code}">
        <span class="bcode">${code}</span><span class="grow stack g2"><span class="ut">${esc(D.title)}</span><span class="xs">${esc(D.speakers)} · ${esc(D.arc)}</span></span>
        <span class="pill wide-only">${D.ex.length} turns</span><span class="chev">${m9i('chevd', 18)}</span></button></h3>
        <div class="acc"><div class="acc-in"><div class="acc-body"><ol class="divide">${m9Turns(D)}</ol></div></div></div></div>`; }).join('')}</div>`, 'narrow');
}

/* ---------- Module guide ---------- */
function m9Guide(section){
  const G = M9.guide, ticks = new Set((S.m9 && S.m9.ticks) || []), hasKey = !!localStorage.getItem('gemini_key');
  const md = s => esc(s).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Section links: the same list card as the Module 09 page (one row per section, icon, arrow down).
  const jump = (id, t, icon, tone = '') => `<button type="button" class="lrow" data-jump="${id}"><span class="tile sm${tone}">${m9i(icon, 16)}</span><span class="grow lt">${t}</span><span class="chevr">${m9i('chevd', 18)}</span></button>`;
  m9Render(`${m9Head('Module 09', 'm9', '<span class="pill green">Module 09</span>')}
    <h1 class="h1">Module guide</h1>
    <div role="navigation" class="card divide" aria-label="Guide sections" style="padding: 6px">${jump('reg', 'Register and gender', 'users')}${jump('pat', 'Communication patterns', 'list')}${jump('cases', 'Practice cases', 'steth')}${jump('check', 'Mastery checklist', 'check')}${jump('safety', 'Safety and scope', 'shield', ' amber')}</div>
    <section class="card pad stack g12" id="m9-reg" aria-labelledby="reg-h">
      <div class="stack g6"><h2 class="h2" id="reg-h">Register and gender quick guide</h2><p class="sm">${esc(G.register.intro)}</p></div>
      <div class="divide">${G.register.rows.map(r => `<div class="reg"><div class="stack"><span class="eyebrow">Female form</span><span class="ar" lang="ar" dir="rtl">${esc(r.f)}</span></div>
        <div class="stack"><span class="eyebrow">Male form</span><span class="ar" lang="ar" dir="rtl">${esc(r.m)}</span></div><p class="m sm" style="color: var(--ink)">${esc(r.note)}</p></div>`).join('')}</div>
      <h3 class="h3">Register examples</h3>
      <ul class="cols2">${G.register.examples.map(x => `<li class="inset stack g4"><span class="pill" style="align-self: flex-start">${esc(x.label)}</span><span class="ar ar-sm" lang="ar" dir="rtl">${esc(x.ar)}</span><span class="tl">${esc(x.lat)}</span><span class="en">${esc(x.en)}</span></li>`).join('')}</ul>
    </section>
    <section class="card pad stack g16" id="m9-pat" aria-labelledby="pat-h"><h2 class="h2" id="pat-h">Communication patterns</h2>
      ${G.patterns.map(p => `<div class="stack g8"><h3 class="h3">${esc(p.title)}</h3><ol class="steps">${p.text.split(p.text.includes(' → ') ? ' → ' : '; ').map((t, i) => `<li class="step"><b>${i + 1}</b><span>${esc(t)}</span></li>`).join('')}</ol></div>`).join('')}</section>
    <section class="stack g12" id="m9-cases" aria-labelledby="cases-h">
      <div class="stack g6"><h2 class="h2" id="cases-h">Practice cases</h2><p class="sm">${md(G.casesIntro)}</p></div>
      ${G.cases.map(c => { const open = !!m9CaseOpen[c.id];
        return `<div class="card ${open ? 'open' : ''}"><h3 style="font: inherit"><button type="button" class="acc-head" aria-expanded="${open}" data-acc="case:${c.id}">
          <span class="ccode">${c.id}</span><span class="grow stack"><span class="eyebrow">Case ${c.id}</span><span class="b" style="font-size: 16px; line-height: 1.3">${esc(c.title)}</span></span><span class="chev">${m9i('chevd', 18)}</span></button></h3>
          <div class="acc"><div class="acc-in"><div class="acc-body stack g12"><p style="font-size: 15px; line-height: 1.55; padding-top: 4px">${esc(c.text)}</p>
            <div class="row wrap g10"><button type="button" class="btn soft sm" data-case="${c.id}">${m9i('headset', 16)}Practise with your tutor</button><span class="pill">Optional</span></div>
            <div data-casebox="${c.id}"></div></div></div></div></div>`; }).join('')}</section>
    <section class="card pad stack g12" id="m9-check" aria-labelledby="check-h">
      <div class="row between wrap g8"><div class="stack g2"><h2 class="h2" id="check-h">Mastery checklist</h2><span class="xs">Language practice, not clinical credentialing</span></div><span class="pill green" id="m9ticked">${ticks.size} of ${G.checklist.length} ticked</span></div>
      <ul class="stack g2">${G.checklist.map((t, i) => `<li><button type="button" class="chk" role="checkbox" aria-checked="${ticks.has(i)}" data-tick="${i}"><span class="box">${m9i('check', 16)}</span><span>${esc(t)}</span></button></li>`).join('')}</ul></section>
    <section class="card pad stack g16" id="m9-safety" aria-labelledby="safety-h">
      <div class="row g12"><span class="tile amber">${m9i('shield', 22)}</span><h2 class="h2" id="safety-h">Safety and scope</h2></div>
      <p style="font-size: 15px; line-height: 1.6">${md(M9.intro.safety)}</p>
      <p style="font-size: 15px; line-height: 1.6">${md(G.review)}</p>
      <div class="stack g6"><h3 class="h3">Background reference reading</h3><span class="xs">Not incorporated treatment protocols</span></div>
      <ul class="divide">${G.references.map(f => `<li><a class="ref" href="${esc(f.url)}" target="_blank" rel="noopener"><span class="grow stack"><span class="b" style="font-size: 15px; line-height: 1.35">${esc(f.title.replace(/\*\*/g, ''))}</span><span class="xs">${esc(f.org)}${f.note ? ' · ' + md(f.note) : ''}</span></span>${m9i('ext', 18)}</a></li>`).join('')}</ul>
    </section>`, 'narrow');
  const root = $app.firstElementChild;
  const jumpTo = id => { const el = document.getElementById('m9-' + id); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - document.querySelector('.top').offsetHeight - 12); };
  root.addEventListener('click', e => {
    const j = e.target.closest('[data-jump]'); if (j) return jumpTo(j.dataset.jump);
    const t = e.target.closest('[data-tick]');
    if (t){
      const i = +t.dataset.tick, set = new Set((S.m9 && S.m9.ticks) || []);
      set.has(i) ? set.delete(i) : set.add(i);
      S.m9 = { ...(S.m9 || {}), ticks: [...set].sort((a, b) => a - b) }; save();
      t.setAttribute('aria-checked', set.has(i)); document.getElementById('m9ticked').textContent = `${set.size} of ${G.checklist.length} ticked`;
      return;
    }
    const cb = e.target.closest('[data-case]');
    if (cb){
      if (!hasKey) return show('progress', null, { askKey: true });
      const c = G.cases.find(x => x.id === cb.dataset.case);
      stopTutor(); root.querySelectorAll('[data-casebox]').forEach(b => b.innerHTML = '');
      root.querySelector(`[data-casebox="${c.id}"]`).innerHTML = `<button type="button" class='btn pale block' id="tutorStart" aria-pressed="false" style="margin-bottom:10px"></button>${M9_TUTORBOX}`;
      m9WireTutor({ id: 'M09_GUIDE', title: c.title }, null, m9CasePrompt(c));
      document.getElementById('tutorStart').click();
    }
  });
  if (section) setTimeout(() => jumpTo(section), 0);
}

var M9_VIEWS = M9 ? { m9: m9Overview, m9vocab: m9Vocab, m9lab: m9Lab, m9guide: m9Guide, m9end: m9End } : null;
