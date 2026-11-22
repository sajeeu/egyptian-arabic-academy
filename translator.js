/* Conversation Translator: upload a recorded conversation in Egyptian Arabic and get the Arabic transcript, an English
   translation, a summary, explanations and phrases to learn. Its own tab (views "tr" and "trrec").
   Loaded before the main script in index.html; everything here runs after it has loaded. Every name starts with "tr"
   or "TR" so nothing clashes with the main script.

   Lesson progress is never touched. Recordings and results live in their own browser database (IndexedDB
   "eaa_translator"). The only localStorage keys used here are "eaa_translator" (the preview switch, until the tab is
   switched on for everyone) and "eaa_tr_quota" (which free Gemini models are used up for today).

   Processing runs as a job that saves every finished step, so if the phone stops the page it carries on from that step
   the next time the app is open. While a job runs, a near-silent audio loop keeps the page running with the screen off
   or in another app (Android treats it like a music app), and the phone's media notification shows the progress.
   A notification says when it is ready. */

var TR_ON = (function(){
  try {
    const q = new URLSearchParams(location.search), v = q.get('translator');
    if (v === 'on') localStorage.setItem('eaa_translator', '1');
    if (v === 'off') localStorage.removeItem('eaa_translator');
    if (v){ q.delete('translator'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); }
    return localStorage.getItem('eaa_translator') === '1';
  } catch { return false; }
})();
var TR_VERSION = 'translator-test v6';
var TR_NET_RETRY_MS = [5000, 10000, 20000, 30000];   // waits before trying again when the phone drops the connection
var TR_API = 'https://generativelanguage.googleapis.com';
var TR_STEP_SEC = 600;                                    // long recordings are done in 10-minute parts
var TR_FIRST_DATA_MS = 120000, TR_ANSWER_MS = 300000;     // give up on a model that sends nothing for 2 minutes
var TR_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-4-hydrogen', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
var TR_MIME = { mp3: 'audio/mp3', m4a: 'audio/m4a', mp4: 'audio/m4a', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/opus', flac: 'audio/flac', webm: 'audio/webm', aiff: 'audio/aiff', amr: null, '3gp': null };
var TR_ICONS = {
  upload: '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/>',
  wave: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', left: '<path d="m15 18-6-6 6-6"/>', alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>', vol: '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/>', bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
};
var trI = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${TR_ICONS[n] || ''}</svg>`;
var trEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
var trKey = () => { try { return localStorage.getItem('gemini_key') || ''; } catch { return ''; } };
var trMMSS = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
var trSecs = t => { const p = String(t || '').split(':').map(Number); return p.some(isNaN) ? 0 : p.reduce((a, v) => a * 60 + v, 0); };
var trSleep = ms => new Promise(r => setTimeout(r, ms));
var trWhen = ms => new Date(ms).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/* ---------- Storage (its own database; never the lesson progress) ---------- */
var trDBp = null;
function trDB(){
  return trDBp || (trDBp = new Promise((res, rej) => {
    const r = indexedDB.open('eaa_translator', 1);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('recs')) d.createObjectStore('recs', { keyPath: 'id' }); if (!d.objectStoreNames.contains('audio')) d.createObjectStore('audio'); };
    r.onsuccess = () => res(r.result); r.onerror = () => { trDBp = null; rej(r.error); };
  }));
}
async function trTx(store, mode, fn){
  const d = await trDB();
  return new Promise((res, rej) => { const t = d.transaction(store, mode); let out; const q = fn(t.objectStore(store)); if (q) q.onsuccess = () => { out = q.result; };
    t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('Storage was interrupted')); });
}
var trGet = id => trTx('recs', 'readonly', s => s.get(id));
var trAll = async () => (await trTx('recs', 'readonly', s => s.getAll()) || []).sort((a, b) => b.created - a.created);
var trPut = rec => trTx('recs', 'readwrite', s => s.put(rec));
var trGetAudio = id => trTx('audio', 'readonly', s => s.get(id));
async function trDelete(id){ await trTx('recs', 'readwrite', s => s.delete(id)); await trTx('audio', 'readwrite', s => s.delete(id)); }
async function trLog(rec, line){ (rec.log = rec.log || []).push(`${new Date().toLocaleTimeString()} ${line}`); if (rec.log.length > 80) rec.log.splice(0, rec.log.length - 80); }

/* ---------- Which free models are used up today ---------- */
var trQuota = () => { try { return JSON.parse(localStorage.getItem('eaa_tr_quota')) || {}; } catch { return {}; } };
function trQuotaSet(model, until){ const q = trQuota(); q[model] = until; for (const k in q) if (q[k] < Date.now()) delete q[k]; try { localStorage.setItem('eaa_tr_quota', JSON.stringify(q)); } catch {} }
var trQuotaOk = m => !((trQuota()[m] || 0) > Date.now());
function trRetryIn(msg){ const m = /retry in\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:([\d.]+)s)?/i.exec(msg || ''); const ms = m ? ((+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0)) * 1000 : 0; return ms || 3600000; }

/* ---------- Gemini calls ---------- */
var trModelsCache = null;
async function trApi(path, opts = {}){
  const r = await fetch(TR_API + path, { ...opts, headers: { 'x-goog-api-key': trKey(), ...(opts.headers || {}) } });   // the key goes in a header, never in a URL
  const text = await r.text(); let j = null; try { j = JSON.parse(text); } catch {}
  if (!r.ok) throw new Error(`${r.status} ${(j && j.error && j.error.message) || text.slice(0, 300)}`);
  return j;
}
async function trModels(){
  if (trModelsCache && trModelsCache.at > Date.now() - 3600000) return trModelsCache.list;
  let list = [], tok = '';
  do { const j = await trApi(`/v1beta/models?pageSize=200${tok ? '&pageToken=' + tok : ''}`); list = list.concat(j.models || []); tok = j.nextPageToken || ''; } while (tok);
  const out = {}; list.filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).forEach(m => { out[m.name.replace('models/', '')] = m.outputTokenLimit || 8192; });
  trModelsCache = { at: Date.now(), list: out }; return out;
}
async function trUpload(blob, mime, signal){
  const start = await fetch(TR_API + '/upload/v1beta/files', { method: 'POST', signal, headers: { 'x-goog-api-key': trKey(), 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start',
    'X-Goog-Upload-Header-Content-Length': String(blob.size), 'X-Goog-Upload-Header-Content-Type': mime, 'Content-Type': 'application/json' }, body: JSON.stringify({ file: { display_name: 'translator' } }) });
  if (!start.ok) throw new Error(`${start.status} upload: ${(await start.text()).slice(0, 200)}`);
  const url = start.headers.get('x-goog-upload-url'); if (!url) throw new Error('Upload address not readable');
  const done = await fetch(url, { method: 'POST', signal, headers: { 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' }, body: blob });
  const j = await done.json().catch(() => null);
  if (!done.ok || !j?.file) throw new Error(`${done.status} upload: ${JSON.stringify(j).slice(0, 200)}`);
  let f = j.file;
  for (let i = 0; f.state === 'PROCESSING' && i < 90; i++){ await trSleep(2000); f = await trApi('/v1beta/' + f.name); }
  if (f.state !== 'ACTIVE') throw new Error('The uploaded file was not accepted: ' + f.state);
  return { name: f.name, uri: f.uri, at: Date.now() };
}
// Streams the answer; gives up if nothing arrives in time, or when Stop is pressed.
async function trStream(model, body, signal, timeoutMs = TR_ANSWER_MS){
  const ac = new AbortController(); let why = 'total';
  const cap = setTimeout(() => ac.abort(), timeoutMs), first = setTimeout(() => { why = 'first'; ac.abort(); }, Math.min(TR_FIRST_DATA_MS, timeoutMs));
  const onStop = () => { why = 'stop'; ac.abort(); }; signal?.addEventListener('abort', onStop);
  const t0 = performance.now(); let text = '', finish = null, gotData = false, firstData = null;
  try {
    const r = await fetch(`${TR_API}/v1beta/models/${model}:streamGenerateContent?alt=sse`, { method: 'POST', signal: ac.signal, headers: { 'x-goog-api-key': trKey(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok){ const tx = await r.text(); let j = null; try { j = JSON.parse(tx); } catch {} throw new Error(`${r.status} ${(j && (j.error || j[0]?.error)?.message) || tx.slice(0, 300)}`); }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '';
    for (;;){
      const { done, value } = await rd.read(); if (done) break;
      if (!gotData){ gotData = true; firstData = Math.round((performance.now() - t0) / 1000); clearTimeout(first); }
      buf += dec.decode(value, { stream: true });
      let k; while ((k = buf.indexOf('\n')) >= 0){
        const line = buf.slice(0, k).trim(); buf = buf.slice(k + 1);
        if (!line.startsWith('data:')) continue;
        let j; try { j = JSON.parse(line.slice(5)); } catch { continue; }
        if (j.error) throw new Error(`${j.error.code || 500} ${j.error.message || 'stream error'}`);
        const c = j.candidates?.[0]; text += (c?.content?.parts || []).map(p => (p.thought ? '' : p.text || '')).join('');
        if (c?.finishReason) finish = c.finishReason;
      }
    }
    return { text, finish, firstData, seconds: Math.round((performance.now() - t0) / 1000) };
  } catch (e){
    if (e.name === 'AbortError') throw new Error(why === 'stop' ? 'STOPPED' : why === 'first' ? `TIMEOUT ${model} sent nothing in ${Math.round(TR_FIRST_DATA_MS / 1000)} s` : `TIMEOUT ${model} took longer than ${Math.round(timeoutMs / 1000)} s`);
    throw e;
  } finally { clearTimeout(cap); clearTimeout(first); signal?.removeEventListener('abort', onStop); }
}
// An answer that repeats the same run of words over and over is broken (the model looped).
function trLooped(text){ const w = text.split(/\s+/).filter(Boolean), seen = new Map();
  for (let i = 0; i + 6 <= w.length; i++){ const k = w.slice(i, i + 6).join(' '), c = (seen.get(k) || 0) + 1; if (c > 4) return true; seen.set(k, c); } return false; }
var TR_NO_THINK = new Set();
async function trGen(model, parts, schema, o){
  const tries = [{ responseMimeType: 'application/json', responseSchema: schema, thinkingConfig: { thinkingLevel: 'low' } }, { responseMimeType: 'application/json', responseSchema: schema },
    { responseMimeType: 'application/json', responseJsonSchema: schema }, { responseMimeType: 'application/json' }];
  let last;
  for (let t = TR_NO_THINK.has(model) ? 1 : 0; t < tries.length; t++){
    for (let attempt = 1; attempt <= 2; attempt++){
      try {
        const res = await trStream(model, { contents: [{ role: 'user', parts }], generationConfig: { maxOutputTokens: Math.min(o.limits[model] || 8192, o.maxOut || 65536), ...tries[t] } }, o.signal);
        if (trLooped(res.text)){ const e = new Error('LOOP the answer kept repeating itself'); e.loop = true; throw e; }
        const m = res.text.match(/\{[\s\S]*\}/); if (!m) throw new Error(`No usable answer (finish: ${res.finish})`);
        o.rec && trLog(o.rec, `${o.label}: ${model} answered: first data after ${res.firstData} s, finished after ${res.seconds} s (${res.finish || 'no finish reason'})`);
        return JSON.parse(m[0]);
      } catch (e){
        last = e;
        if (/^400/.test(e.message) && /schema|Unknown name|Invalid JSON payload|response|thinking|JSON mode|not enabled|not supported/i.test(e.message)){ if (t === 0) TR_NO_THINK.add(model); break; }
        if ((e.loop || e instanceof SyntaxError) && attempt === 1){ o.rec && trLog(o.rec, `${o.label}: broken answer from ${model}, asking again`); continue; }
        throw e;
      }
    }
    if (!/^400/.test(last?.message || '')) throw last;
  }
  throw last;
}
/* Tries the models in turn. Busy (503/500/504): wait and retry, then the next model; out of free quota (429): remember
   it for today and use the next model; no reply in time: next model. If every model is busy, it keeps trying for a while. */
async function trGenAny(parts, schema, o){
  const limits = o.limits = await trModels();
  const avail = TR_MODELS.filter(m => limits[m]);
  if (!avail.length) throw new Error('No suitable Gemini model is available for this key.');
  let last, soonest = Infinity, net = 0; const skip = new Set();      // models that looped or didn't reply for this request
  for (let round = 0; round < 6; round++){
    const open = avail.filter(trQuotaOk);
    if (!open.length){ const e = new Error('QUOTA'); e.quota = true; e.retryAt = Math.min(...avail.map(m => trQuota()[m] || Date.now() + 3600000)); throw e; }
    const usable = open.filter(m => !skip.has(m));
    if (!usable.length) throw last;                                     // every free model looped or didn't reply: report it for this part
    const order = [...new Set([o.prefer || o.rec?.models?.at(-1), ...usable].filter(m => m && usable.includes(m)))];
    for (const model of order){
      for (let t = 0; t < 2; t++){
        if (o.signal?.aborted) throw new Error('STOPPED');
        try { trLive.detail = ''; trTick(); o.rec && trLog(o.rec, `${o.label || 'step'}: asking ${model}`); const j = await trGen(model, parts, schema, o); o.prefer = model; o.rec && (o.rec.models = [...new Set([...(o.rec.models || []), model])]); return j; }
        catch (e){
          last = e; const m = e.message || '';
          if (/^STOPPED/.test(m)) throw e;
          if (/^TIMEOUT/.test(m)){ o.rec && trLog(o.rec, `${o.label || 'step'}: ${m}`); skip.add(model); break; }
          if (e.loop || e instanceof SyntaxError || /^No usable answer/.test(m)){ o.rec && trLog(o.rec, `${o.label || 'step'}: ${model} gave a broken answer twice; trying another model`); skip.add(model); break; }
          if (/^429/.test(m)){ const until = Date.now() + trRetryIn(m); trQuotaSet(model, until); soonest = Math.min(soonest, until); o.rec && trLog(o.rec, `${model}: free limit reached for now`); break; }
          if (!/^(503|500|502|504)/.test(m) && !(e instanceof TypeError)) throw e;
          if (e instanceof TypeError){                                      // the phone dropped the connection: try again straight away, even with the screen off
            if (net < TR_NET_RETRY_MS.length){ const wait = TR_NET_RETRY_MS[net++]; o.rec && trLog(o.rec, `${o.label || 'step'}: connection dropped; trying again in ${Math.round(wait / 1000)} s`);
              await trWaitNet(wait, o.signal); t--; continue; }
            const err = new Error('OFFLINE'); err.offline = true; throw err; }
          o.rec && trLog(o.rec, `${o.label || 'step'}: ${model} busy (${m.slice(0, 60)})`);
          if (t === 0) await trWaitBusy(6000, o.signal);
        }
      }
    }
    { const left = avail.filter(trQuotaOk); if (left.length && left.every(m => skip.has(m))) throw last; }   // nothing left to try for this part (all used up: the next round says so)
    await trWaitBusy(Math.min(30000 + round * 15000, 90000), o.signal);       // every model was busy: wait a bit longer, then go round again
  }
  const e = new Error(`BUSY ${last?.message || ''}`); e.busy = true; throw e;
}
async function trWaitNet(ms, signal){
  const end = Date.now() + ms;
  while (Date.now() < end || !navigator.onLine){ if (signal?.aborted) throw new Error('STOPPED'); if (Date.now() > end + 120000) break;
    trLive.detail = navigator.onLine ? `The connection dropped. Trying again in ${Math.max(0, Math.ceil((end - Date.now()) / 1000))} s.` : 'The phone is offline. It continues as soon as the connection is back.'; trTick(); await trSleep(1000); }
  trLive.detail = ''; trTick();
}
async function trWaitBusy(ms, signal){
  const end = Date.now() + ms;
  while (Date.now() < end){ if (signal?.aborted) throw new Error('STOPPED'); trLive.detail = `The free Gemini service is busy right now. Trying again in ${Math.ceil((end - Date.now()) / 1000)} s. This is normal.`; trTick(); await trSleep(1000); }
  trLive.detail = ''; trTick();
}

/* ---------- Prompts and answer checks ---------- */
var TR_SEG_SCHEMA = { type: 'object', properties: { segments: { type: 'array', items: { type: 'object', properties: {
  start: { type: 'string' }, end: { type: 'string' }, speaker: { type: 'string' }, role: { type: 'string' }, ar: { type: 'string' }, en: { type: 'string' },
  unclear: { type: 'boolean' }, check: { type: 'boolean' } }, required: ['start', 'end', 'speaker', 'ar', 'en'] } } }, required: ['segments'] };
var TR_ITEM = { type: 'object', properties: { text: { type: 'string' }, status: { type: 'string', enum: ['stated', 'suggested', 'uncertain'] }, times: { type: 'array', items: { type: 'string' } } }, required: ['text', 'status'] };
var TR_LIST = { type: 'array', maxItems: 8, items: TR_ITEM };
var TR_SUM_SCHEMA = { type: 'object', properties: { overview: { type: 'string' }, key_points: TR_LIST, symptoms_findings: TR_LIST, treatment_medication: TR_LIST, decisions_next_steps: TR_LIST, important_details: TR_LIST }, required: ['overview'] };
var TR_LEARN_SCHEMA = { type: 'object', properties: { learn: { type: 'array', maxItems: 8, items: { type: 'object', properties: { ar: { type: 'string' }, lat: { type: 'string' }, en: { type: 'string' }, usage: { type: 'string' }, medical_context: { type: 'string' },
  register: { type: 'string', enum: ['everyday', 'formal medical'] }, alternatives: { type: 'array', maxItems: 2, items: { type: 'object', properties: { ar: { type: 'string' }, lat: { type: 'string' }, en: { type: 'string' } }, required: ['ar', 'lat', 'en'] } } }, required: ['ar', 'lat', 'en', 'usage', 'medical_context', 'register'] } } }, required: ['learn'] };

var trSegPrompt = (from, to, speakers) => `You are transcribing a pre-recorded conversation in Egyptian colloquial Arabic (Cairo dialect), most likely in a hospital or clinic. Speakers may include doctors, nurses, patients, parents and hospital staff.
Transcribe ONLY the part of the audio from ${from} to ${to} (timestamps from the start of the recording).
Rules:
- Write the Arabic exactly as spoken, in Egyptian Arabic spelling (for example: مش، دلوقتي، عايز، إزيك، كده), not Modern Standard Arabic. Words said in English (often medical terms or drug names) stay in English, in Latin letters, as spoken.
- Make a new segment at every change of speaker, and split long turns into sentences. Give start and end as M:SS or H:MM:SS from the start of the whole recording.
- Label speakers consistently as "Speaker 1", "Speaker 2", and so on.${speakers.length ? ` Speakers found earlier in this recording: ${speakers.join('; ')}. Keep the same labels for the same voices.` : ''} Set role to doctor, nurse, patient, parent, staff or unknown, only from what the conversation supports.
- Translate each segment into natural English that keeps the intended meaning, not word for word. Do not add explanations to the translation.
- Where words are unclear or inaudible, write [غير واضح] in the Arabic and [unclear] in the English at that spot and set unclear to true. Never guess, complete or invent missing words.
- Write medicine names, doses, numbers and instructions exactly as heard; set check to true if you are not fully sure of them.
- If nobody speaks in this part, return an empty segments list.
Return JSON: {"segments":[{"start","end","speaker","role","ar","en","unclear","check"}]}.`;
var TR_ONLY = 'Use ONLY what is in the transcript below. Never add facts, diagnoses, drugs or doses that are not said. Keep every text short and plain (at most 2 sentences).';
var trSumPrompt = tr => `Below is a transcript of a conversation in Egyptian Arabic, most likely in a hospital or clinic, with an English translation of each line. ${TR_ONLY}
Write a structured English summary as JSON: overview (2-3 sentences: what the conversation was about); key_points; symptoms_findings; treatment_medication (exact doses only if said); decisions_next_steps; important_details (things that must not be overlooked).
Each item: text, status ("stated" = clearly said; "suggested" = proposed or recommended but not agreed; "uncertain" = unclear, hedged or contradictory), times (start times of the lines it comes from).
Say who said or suggested each thing (by name if a name is used in the conversation, otherwise by speaker label), and check it against the lines.
Put every request someone makes, every plan and every agreed action under decisions_next_steps (for example: "Speaker 1 asked for two tickets for Friday").
If nothing was said about a topic, return an EMPTY list for it. Never write items like "nothing was mentioned".
Transcript (time | speaker | Arabic | English):
${tr}`;
var trLearnPrompt = tr => `Below is a transcript of a conversation in Egyptian Arabic, with an English translation of each line. ${TR_ONLY}
Pick 5 to 8 useful expressions that appear in this transcript, for a doctor learning Egyptian Arabic. Copy each expression exactly as it appears in the transcript. Keep every field short: one sentence at most. Do not repeat yourself.
Each item, as JSON: ar, lat (accurate Egyptian transliteration, e.g. "ezzayyak", "delwa'ti"), en, usage (1-2 sentences: when and how it is used), medical_context (1 sentence: how it could be used in a hospital or clinic), register ("everyday" or "formal medical"), alternatives (up to 2 other ways Egyptians say it, each with ar, lat, en).
Transcript (time | speaker | Arabic | English):
${tr}`;
var trNormAr = t => String(t || '').replace(/[ً-ٰٟـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^ء-ي\s]/g, ' ').replace(/\s+/g, ' ').trim();
function trGrounded(ar, trNorm, words){ const a = trNormAr(ar); if (!a) return false; if (trNorm.includes(a)) return true; const w = a.split(' '); return w.filter(x => words.has(x)).length / w.length >= 0.8; }
var trTooLong = o => Object.values(o || {}).some(v => typeof v === 'string' && v.length > 500);
var trEmptyItem = x => { const t = String(x?.text || '').trim(); return /^(no|none|nothing)\b/i.test(t) && /mention|discuss|said|given|none|nothing/i.test(t) || /\bnot (mentioned|discussed|said)\b/i.test(t); };
var trTranscriptText = rec => rec.segments.map(s => `${s.start} | ${s.speaker}${s.role && s.role !== 'unknown' ? ' (' + s.role + ')' : ''} | ${s.ar} | ${s.en}`).join('\n');
function trClean(kind, val, rec){
  const trNorm = trNormAr(rec.segments.map(s => s.ar).join(' ')), words = new Set(trNorm.split(' ')), dropped = rec.dropped = rec.dropped || [];
  if (kind === 'summary'){ for (const k of ['key_points', 'symptoms_findings', 'treatment_medication', 'decisions_next_steps', 'important_details'])
    val[k] = (Array.isArray(val[k]) ? val[k] : []).filter(x => { const bad = trEmptyItem(x) || trTooLong(x); if (bad) dropped.push({ where: 'summary', text: String(x.text).slice(0, 100) }); return !bad; }); return val; }
  return (val || []).filter(x => { const why = !trGrounded(x.ar, trNorm, words) ? 'not in transcript' : trTooLong(x) ? 'too long' : ''; if (why) dropped.push({ where: kind, why, ar: String(x.ar).slice(0, 60) }); return !why; });
}

/* ---------- Keep running with the screen off, and say when it's ready ---------- */
var trAudioEl = null, trAwake = false, trAudioOn = false;
function trSilentWav(){   // 2 seconds of near-silence (tiny noise, inaudible), so the phone treats the page as playing audio
  const sr = 8000, n = sr * 2, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, (Math.random() * 3 | 0) - 1, true);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
}
function trKeepAwake(on){      // call from a tap when turning on: phones only start audio after a tap
  try {
    if (on){
      if (!trAudioEl){ trAudioEl = new Audio(trSilentWav()); trAudioEl.loop = true; trAudioEl.setAttribute('playsinline', ''); trAudioEl.addEventListener('pause', () => { if (trAwake) trEvent('screen-off audio was paused by the phone'); trAudioOn = false; }); trAudioEl.addEventListener('playing', () => { if (!trAudioOn) trEvent('screen-off audio playing'); trAudioOn = true; }); }
      const p = trAudioEl.play(); trAwake = true;
      if (p && p.catch) p.catch(() => { trAwake = false; trTick(); });
      trMedia();
    } else if (trAudioEl){ trAudioEl.pause(); trAwake = false; if ('mediaSession' in navigator){ navigator.mediaSession.playbackState = 'none'; navigator.mediaSession.metadata = null; } }
  } catch { trAwake = false; }
}
function trMedia(){
  if (!('mediaSession' in navigator) || !trAwake) return;
  try {
    const step = trLive.stepText || 'Working…';
    navigator.mediaSession.metadata = new MediaMetadata({ title: 'Translating your recording', artist: step, album: 'Egyptian Arabic Academy', artwork: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }] });
    navigator.mediaSession.playbackState = 'playing';
    ['pause', 'stop', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'].forEach(a => { try { navigator.mediaSession.setActionHandler(a, () => {}); } catch {} });   // the notification's buttons do nothing
  } catch {}
}
var trSWp = null;
function trSW(){ if (!('serviceWorker' in navigator)) return Promise.resolve(null); return trSWp || (trSWp = navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).catch(() => null)); }
async function trNotify(rec){
  const body = rec.status === 'done' ? `${rec.name} · tap to see the translation` : `${rec.name} · ${rec.error || 'it stopped'}`;
  try { if (window.Notification && Notification.permission === 'granted'){ const reg = await trSW(); if (reg){ await reg.showNotification(rec.status === 'done' ? 'Translation ready' : 'Translation paused', { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'tr-' + rec.id, data: { id: rec.id, url: location.pathname } }); return; } } } catch {}
  if (document.visibilityState === 'visible' && typeof toast === 'function') toast(rec.status === 'done' ? `Translation ready: ${trEsc(rec.name)}` : `Translation paused: ${trEsc(rec.error || '')}`);
}

/* ---------- The job: upload, transcribe in parts, summary, explanations, phrases ---------- */
var trLive = { id: null, step: '', stepText: '', detail: '', started: 0 };
var trRunning = false, trCtl = null, trWasOffline = false;
var TR_STEPS = [['upload', 'Uploading the recording'], ['transcribe', 'Writing the Arabic and the English'], ['summary', 'Summarising the conversation'], ['learn', 'Choosing phrases to learn']];
var TR_SECTIONS = ['summary', 'learn'];
function trTick(){ trMedia(); trRefreshLoader(); }
var trCurRec = null;
function trSetStep(rec, step, text){ trLog(rec, `step: ${text}`); trLive.id = rec.id; trLive.step = step; trLive.stepText = text; trLive.detail = ''; trTick(); }
async function trRun(){
  if (trRunning) return; trRunning = true; trWasOffline = false;
  if (!trAwake) trKeepAwake(true);                                   // allowed if she has tapped in the app before; otherwise the loader offers a button
  try {
    for (;;){
      if (!trKey()) break;
      const all = await trAll();
      for (const r of all) if (trFixFinished(r)) await trPut(r);
      const recs = all.filter(r => r.status === 'working' || (r.status === 'waiting' && (r.retryAt || 0) <= Date.now()) || (r.status === 'done' && r.redo?.length && (r.redoAt || 0) <= Date.now())).sort((a, b) => a.created - b.created);
      if (!recs.length) break;
      const ok = await trProcess(recs[0]); trRefreshResult(recs[0].id);
      if (!ok){ trWasOffline = true; break; }           // paused by the phone or the network: carry on when the app is back
    }
  } finally { trRunning = false; trCtl = null; trLive.id = null; if (!trWasOffline) trKeepAwake(false); trRefreshLoader(); trRefreshHome();
    if (trWasOffline) setTimeout(trResume, navigator.onLine ? 30000 : 5000); }
}
// A recording that had finished but was put back to "working" (Try again on one part, in an older version) is finished
// again, with that part to redo quietly. Returns true when it changed the record.
function trFixFinished(r){
  if (r.status !== 'working' || !r.doneAt || !r.segments) return false;
  r.status = 'done'; r.redo = TR_SECTIONS.filter(k => r[k] === undefined || r[k]?.error); if (!r.redo.length) delete r.redo; return true;
}
async function trRefreshResult(id){ if (trViewing !== id || !document.getElementById('trRes')) return; const rec = await trGet(id).catch(() => null); if (rec && trViewing === id) trPane(rec); }
async function trProcess(rec){
  const redo = rec.status === 'done';                                 // only redoing a part of a finished recording: it stays finished
  trCtl = new AbortController(); const signal = trCtl.signal; trCurRec = rec;
  trLog(rec, `job ${redo ? 'redoing ' + (rec.redo || []).join(', ') : rec.parts?.length || rec.segments ? 'resumed' : 'started'} (screen-off mode ${trAwake ? 'on' : 'off'}, notifications ${window.Notification ? Notification.permission : 'not available'})`);
  if (!redo){ rec.status = 'working'; rec.error = ''; rec.retryAt = 0; rec.startedAt = rec.startedAt || Date.now(); }
  delete rec.waitNet; delete rec.redoNote; trLive.started = Date.now(); await trPut(rec);
  const o = { signal, rec, prefer: rec.models?.at(-1) };
  try {
    if (!rec.segments && (!rec.file || Date.now() - rec.file.at > 44 * 3600000)){   // Gemini keeps uploads for 48 hours; not needed once the transcript exists
      trSetStep(rec, 'upload', 'Uploading the recording');
      const blob = await trGetAudio(rec.id); if (!blob) throw new Error('The audio file is missing from this phone.');
      for (let k = 0; ; k++){
        try { rec.file = await trUpload(blob, rec.mime, signal); break; }
        catch (e){ if (e.name === 'AbortError') throw new Error('STOPPED');
          if (e instanceof TypeError){ if (k < TR_NET_RETRY_MS.length){ trLog(rec, `upload: connection dropped; trying again in ${Math.round(TR_NET_RETRY_MS[k] / 1000)} s`); await trWaitNet(TR_NET_RETRY_MS[k], signal); continue; }
            const x = new Error('OFFLINE'); x.offline = true; throw x; }
          throw e; } }
      trLog(rec, 'uploaded'); await trPut(rec);
    }
    const total = Math.max(1, Math.ceil((rec.duration || TR_STEP_SEC) / TR_STEP_SEC));
    rec.parts = rec.parts || [];
    for (let i = rec.parts.length; i < total; i++){
      trSetStep(rec, 'transcribe', total > 1 ? `Writing the Arabic and the English · part ${i + 1} of ${total}` : 'Writing the Arabic and the English');
      const from = trMMSS(i * TR_STEP_SEC), to = trMMSS(Math.min(rec.duration || TR_STEP_SEC, (i + 1) * TR_STEP_SEC) + (i === total - 1 ? 5 : 0));
      const prev = rec.parts.flat(), speakers = [...new Map(prev.map(s => [s.speaker, `${s.speaker}${s.role && s.role !== 'unknown' ? ' (' + s.role + ')' : ''}`])).values()];
      const j = await trGenAny([{ file_data: { mime_type: rec.mime, file_uri: rec.file.uri } }, { text: trSegPrompt(from, to, speakers) }], TR_SEG_SCHEMA, { ...o, label: `part ${i + 1}` });
      o.prefer = o.prefer || rec.models?.at(-1);
      rec.parts[i] = (j.segments || []).filter(s => s && (s.ar || s.en)); await trPut(rec);
    }
    if (!rec.segments){
      const segs = rec.parts.flat().sort((a, b) => trSecs(a.start) - trSecs(b.start));
      segs.forEach((x, i) => { const nx = segs[i + 1]; if (!x.end || trSecs(x.end) <= trSecs(x.start)) x.end = nx ? nx.start : trMMSS(rec.duration || trSecs(x.start) + 5); });
      rec.segments = segs; await trPut(rec);
      if (!segs.length){ rec.summary = { overview: '' }; rec.learn = []; }
    }
    const tr = rec.segments.length ? trTranscriptText(rec) : '';
    // The summary and the phrases only need the transcript, so they are asked for at the same time.
    const section = async (key, prompt, schema, max, pick) => {
      if (rec[key] !== undefined && !rec[key]?.error) return;
      try { const j = await trGenAny([{ text: prompt(tr) }], schema, { ...o, label: key, maxOut: max }); rec[key] = trClean(key, pick(j), rec); }
      catch (e){ if (e.quota || e.offline || e.busy || /^STOPPED/.test(e.message)) throw e; rec[key] = { error: trPlain(e) }; trLog(rec, `${key}: ${e.message}`); }
      await trPut(rec);
    };
    if (TR_SECTIONS.some(k => rec[k] === undefined || rec[k]?.error)){
      trSetStep(rec, 'analysis', redo ? 'Creating it again' : 'Writing the summary and the phrases');
      const res = await Promise.allSettled([
        section('summary', trSumPrompt, TR_SUM_SCHEMA, 4096, j => j),
        section('learn', trLearnPrompt, TR_LEARN_SCHEMA, 3072, j => j.learn || [])]);
      const bad = res.filter(r => r.status === 'rejected').map(r => r.reason);
      if (bad.length) throw bad.find(e => /^STOPPED/.test(e.message)) || bad.find(e => e.quota) || bad.find(e => e.offline) || bad[0];
    }
    if (redo){ delete rec.redo; trLog(rec, 'redo done'); await trPut(rec); return true; }
    rec.status = 'done'; rec.doneAt = Date.now(); trLog(rec, 'done'); await trPut(rec);
    if (rec.file){ trApi('/v1beta/' + rec.file.name, { method: 'DELETE' }).catch(() => {}); }
    trNotify(rec);
    return true;
  } catch (e){
    if (redo){                                                          // the recording stays finished; say why this part is waiting
      if (/^STOPPED/.test(e.message)){ delete rec.redo; await trPut(rec); return true; }
      if (e.offline){ trLog(rec, 'redo: connection lost; trying again in 30 s'); await trPut(rec); return false; }
      rec.redoAt = e.quota ? e.retryAt : Date.now() + 10 * 60000;
      rec.redoNote = e.quota ? `Today's free Gemini limit is used up. It tries again by itself after ${trWhen(rec.redoAt)}.` : e.busy ? 'The free Gemini service is busy. It tries again by itself in about 10 minutes.' : trPlain(e);
      if (!e.quota && !e.busy) delete rec.redo;
      trLog(rec, 'redo: ' + e.message); await trPut(rec); return true;
    }
    if (/^STOPPED/.test(e.message)){ rec.status = 'paused'; rec.error = 'Stopped by you'; await trPut(rec); return true; }
    if (e.offline){ trLog(rec, 'connection still lost after several tries; trying again in 30 s, or when the page is opened'); rec.waitNet = Date.now(); await trPut(rec); return false; }
    if (e.quota){ rec.status = 'waiting'; rec.retryAt = e.retryAt; rec.error = `Today's free Gemini limit is used up. It continues by itself after ${trWhen(e.retryAt)} while the Translator is open.`; }
    else if (e.busy){ rec.status = 'waiting'; rec.retryAt = Date.now() + 10 * 60000; rec.error = 'The free Gemini service stayed busy. It tries again in about 10 minutes while the Translator is open.'; }
    else { rec.status = 'failed'; rec.error = trPlain(e); }
    trLog(rec, e.message); await trPut(rec); trNotify(rec);
    return true;
  }
}
function trPlain(e){ const m = e?.message || String(e);
  if (/API key not valid|API_KEY_INVALID|^403/.test(m)) return 'Your Gemini key was not accepted. Check it in Settings.';
  if (/^400/.test(m) && /audio|mime|format|unsupported/i.test(m)) return 'Gemini could not read this audio format. Try MP3, M4A or WAV.';
  if (/missing/.test(m)) return m;
  return 'Something went wrong: ' + m.replace(/^\d{3}\s*/, '').slice(0, 160); }
// Pick up unfinished work when the app opens or comes back to the screen.
function trResume(){ if (TR_ON && trKey()) trRun(); }
addEventListener('load', () => {
  if (!TR_ON) return;
  const tab = document.querySelector('#nav [data-v="tr"]'); if (tab) tab.hidden = false;
  trSW();
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data?.trOpen) show('trrec', e.data.trOpen); });
  try { const q = new URLSearchParams(location.search), id = q.get('tr'); if (id){ q.delete('tr'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); show('trrec', id); } } catch {}
  setTimeout(trResume, 1500);
});
function trEvent(text){ if (trRunning && trCurRec) trLog(trCurRec, 'phone: ' + text); }
document.addEventListener('visibilitychange', () => { trEvent(document.visibilityState === 'hidden' ? 'page hidden (screen off or another app)' : 'page visible again'); if (document.visibilityState === 'visible') trResume(); });
addEventListener('online', () => { trEvent('back online'); trResume(); });
addEventListener('offline', () => trEvent('went offline'));

/* ---------- Pages ---------- */
var trPicked = null, trViewing = null;
function trHome(){
  trViewing = null;
  const key = !!trKey();
  $app.innerHTML = `<div class="tr">
    <div class="tr-head"><h1 class="title">Conversation Translator</h1>
      <p class="muted">Upload a recorded conversation in Egyptian Arabic. You get the Arabic transcript, an English translation, a summary, explanations and phrases to learn.</p></div>
    ${key ? '' : `<div class="card tr-nokey">${trI('alert')}<div><b>Add your Gemini key first.</b><p class="muted">The Translator uses the same key as the voice tutor. Add it in Settings.</p></div><button class="btn primary" onclick="show('progress')">Open Settings</button></div>`}
    <section class="card tr-up" aria-labelledby="tr-up-h">
      <h2 id="tr-up-h" class="tr-h2">${trI('upload')}Upload a recording</h2>
      <div id="trPick">
        <label class="btn ghost block tr-choose${key ? '' : ' tr-dis'}">${trI('wave')}<span>Choose an audio file</span><input type="file" id="trFile" accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.opus,.flac,.webm" ${key ? '' : 'disabled'}></label>
        <p class="muted small">MP3, M4A, WAV, AAC or OGG, recorded on any device. Long recordings with several speakers are fine.</p>
      </div>
      <div id="trChosen" hidden></div>
    </section>
    <section class="tr-hist" aria-labelledby="tr-hist-h">
      <div class="tr-hist-top"><h2 id="tr-hist-h" class="tr-h2">History</h2></div>
      <div id="trList" class="tr-list"><p class="muted small">Loading…</p></div>
    </section></div>`;
  const inp = document.getElementById('trFile'); if (inp) inp.onchange = () => trChoose(inp.files[0]);
  trRefreshHome();
}
function trChoose(f){
  if (!f) return;
  const ext = (f.name.split('.').pop() || '').toLowerCase(), mime = TR_MIME[ext] !== undefined ? TR_MIME[ext] : (/^audio\//.test(f.type) ? null : undefined);
  const box = document.getElementById('trChosen'), pick = document.getElementById('trPick');
  if (!mime){ box.hidden = false; box.innerHTML = `<div class="tr-err">${trI('alert')}<span><b>${trEsc(f.name)}</b> can't be used. Choose an MP3, M4A, WAV, AAC or OGG file.</span></div>`; return; }
  trPicked = { file: f, mime, duration: 0 };
  const url = URL.createObjectURL(f);
  pick.hidden = true; box.hidden = false;
  box.innerHTML = `<div class="tr-file">${trI('wave')}<div class="grow"><b>${trEsc(f.name)}</b><span class="muted small" id="trMeta">${(f.size / 1048576).toFixed(1)} MB · reading length…</span></div></div>
    <audio controls src="${url}" id="trPrev" class="tr-audio"></audio>
    <button class="btn primary block lg" id="trStart" disabled>${trI('play')}Start translating</button>
    <button class="btn ghost block" id="trOther">Choose a different file</button>`;
  const a = document.getElementById('trPrev');
  const ready = () => { const d = isFinite(a.duration) ? a.duration : 0; trPicked.duration = d;
    document.getElementById('trMeta').textContent = `${(f.size / 1048576).toFixed(1)} MB · ${d ? trMMSS(d) : 'length unknown'}`;
    const s = document.getElementById('trStart'); if (d > 9.5 * 3600){ s.disabled = true; document.getElementById('trMeta').textContent += ' · too long (9½ hours at most)'; } else s.disabled = false; };
  a.onloadedmetadata = ready; a.onerror = ready; setTimeout(() => { if (document.getElementById('trStart')?.disabled && !trPicked.duration) ready(); }, 4000);
  document.getElementById('trOther').onclick = () => { trPicked = null; trHome(); };
  document.getElementById('trStart').onclick = () => trStart();
}
function trStart(){
  if (!trPicked) return;
  trKeepAwake(true);                                                   // must start inside the tap
  try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission().then(() => trSW()); } catch {}
  const { file, mime, duration } = trPicked; trPicked = null;
  const id = 'r' + Date.now().toString(36);
  const rec = { id, name: file.name, size: file.size, mime, duration, created: Date.now(), status: 'working', parts: [], log: [] };
  (async () => {
    try { await trTx('audio', 'readwrite', s => s.put(file, id)); await trPut(rec); }
    catch (e){ trKeepAwake(false); toast('The recording could not be saved on this phone. Free up some space and try again.'); return; }
    show('trrec', id); trRun();
  })();
}
async function trRefreshHome(){
  const list = document.getElementById('trList'); if (!list) return;
  let recs = []; try { recs = await trAll(); } catch { list.innerHTML = `<p class="muted small">History isn't available in this browser.</p>`; return; }
  if (!document.getElementById('trList')) return;
  const tag = r => r.status === 'done' ? '<span class="tag green">Ready</span>' : r.status === 'working' ? `<span class="tag sand">${trLive.id === r.id ? 'Translating…' : 'Waiting to continue'}</span>`
    : r.status === 'waiting' ? '<span class="tag sand">Waiting</span>' : r.status === 'paused' ? '<span class="tag">Stopped</span>' : '<span class="tag tr-bad">Failed</span>';
  list.innerHTML = recs.length ? recs.map(r => `<button class="card tr-row" data-id="${r.id}">${trI('wave')}<span class="grow"><b>${trEsc(r.name)}</b><span class="muted small">${trWhen(r.created)}${r.duration ? ' · ' + trMMSS(r.duration) : ''}</span></span>${tag(r)}</button>`).join('')
    : `<p class="muted small">No recordings yet. Upload one above.</p>`;
  list.querySelectorAll('.tr-row').forEach(b => b.onclick = () => show('trrec', b.dataset.id));
}

/* Loader: shown from upload until everything is finished. All the work happens out of sight. */
async function trRec(id){
  trViewing = id;
  const rec = await trGet(id).catch(() => null);
  if (trViewing !== id) return;
  if (!rec){ $app.innerHTML = `<div class="tr"><button class="btn ghost back" onclick="show('tr')">${trI('left', 'sm')}Translator</button><div class="card"><p>This recording isn't on this phone any more.</p></div></div>`; return; }
  if (trFixFinished(rec)){ await trPut(rec); trRun(); }
  if (rec.status === 'done') return trResult(rec);
  $app.innerHTML = `<div class="tr" id="trLoader" data-id="${id}">
    <button class="btn ghost back" onclick="show('tr')">${trI('left', 'sm')}Translator</button>
    <section class="card tr-load">
      <div class="tr-spin" id="trSpin" aria-hidden="true"></div>
      <h1 class="title" id="trLoadT">Translating your recording</h1>
      <p class="muted tr-name">${trEsc(rec.name)}${rec.duration ? ' · ' + trMMSS(rec.duration) : ''}</p>
      <p class="tr-msg" id="trMsg" role="status" aria-live="polite"></p>
      <ol class="tr-steps" id="trSteps"></ol>
      <p class="muted small tr-elapsed" id="trElapsed"></p>
      <div class="tr-load-btns" id="trBtns"></div>
      <button class="tr-report" id="trReportBtn">Copy report for Claude</button>
      <textarea class="tr-report-box" id="trReportBox" readonly hidden aria-label="Report"></textarea>
    </section></div>`;
  document.getElementById('trReportBtn').onclick = () => trCopyReport(id);
  trRefreshLoader();
}
var trLoaderTimer = setInterval(() => { if (document.getElementById('trLoader')) trRefreshLoader(); }, 1000);
async function trRefreshLoader(){
  const el = document.getElementById('trLoader'); if (!el) return;
  const id = el.dataset.id, rec = await trGet(id).catch(() => null); if (!rec || !document.getElementById('trLoader')) return;
  if (rec.status === 'done'){ if (trViewing === id) trResult(rec); return; }
  const live = trLive.id === id && trRunning, state = rec.status;
  const doneOf = k => k === 'upload' ? !!rec.file : k === 'transcribe' ? !!rec.segments : rec[k] !== undefined && !rec[k]?.error;
  const reached = k => k === 'upload' ? true : k === 'transcribe' ? !!rec.file : !!rec.segments;
  const firstOpen = TR_STEPS.findIndex(([k]) => !doneOf(k));
  document.getElementById('trSteps').innerHTML = TR_STEPS.map(([k, t], i) => { const d = doneOf(k), cur = !d && reached(k) && (i === firstOpen || i >= 2 && firstOpen >= 2);
    const label = cur && live && k === 'transcribe' ? trLive.stepText : t;
    return `<li class="${d ? 'done' : cur ? (live ? 'now' : 'next') : ''}"><span class="tr-dot">${d ? trI('check') : ''}</span><span>${trEsc(label)}</span></li>`; }).join('');
  const msg = document.getElementById('trMsg'), spin = document.getElementById('trSpin'), btns = document.getElementById('trBtns'), title = document.getElementById('trLoadT');
  let html = '', b = '';
  if (live){
    title.textContent = 'Translating your recording'; spin.classList.remove('off');
    const notif = !!(window.Notification && Notification.permission === 'granted');
    html = trLive.detail ? trEsc(trLive.detail) : `This takes a few minutes. ${trAwake ? `You can lock your phone or use other apps: it keeps working${notif ? ', and you will get a notification when it is ready' : ''}.` : 'Keep the app open, or tap below so it keeps working with the screen off.'}`;
    if (!trAwake) b += `<button class="btn pale block" id="trAwakeBtn">${trI('bell')}Keep working with the screen off</button>`;
    b += `<button class="btn ghost block" id="trStop">Stop</button>`;
    document.getElementById('trElapsed').textContent = `Working for ${trMMSS((Date.now() - trLive.started) / 1000)}`;
  } else {
    spin.classList.add('off'); document.getElementById('trElapsed').textContent = '';
    title.textContent = state === 'failed' ? 'Translation stopped' : state === 'paused' ? 'Translation stopped' : state === 'waiting' ? 'Translation is waiting' : 'Translation will continue';
    html = trEsc(rec.error || (state === 'working' ? (rec.waitNet ? 'The phone stopped the connection. It tries again by itself every 30 seconds, and straight away when you open this page.' : 'It continues by itself while the Translator is open.') : ''));
    b += `<button class="btn primary block" id="trGo">${trI('play')}${state === 'working' ? 'Continue now' : 'Try again now'}</button>`;
    b += `<button class="btn danger block" id="trDel">${trI('trash', 'sm')}Delete this recording</button>`;
  }
  msg.innerHTML = html;
  if (btns.dataset.k !== b){ btns.dataset.k = b; btns.innerHTML = b; trWireLoader(id); }
}
function trWireLoader(id){
  const go = document.getElementById('trGo'), stop = document.getElementById('trStop'), del = document.getElementById('trDel'), aw = document.getElementById('trAwakeBtn');
  if (aw) aw.onclick = () => { trKeepAwake(true); try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); } catch {} trRefreshLoader(); };
  if (go) go.onclick = async () => { trKeepAwake(true); const rec = await trGet(id); rec.status = 'working'; rec.retryAt = 0; rec.error = ''; await trPut(rec); trRun(); trRefreshLoader(); };
  if (stop) trTwoTap(stop, 'Tap again to stop', () => { trCtl?.abort(); });
  if (del) trTwoTap(del, 'Tap again to delete', async () => { if (trLive.id === id) trCtl?.abort(); await trDelete(id); show('tr'); });
}
function trTwoTap(btn, armedText, fn){
  const idle = btn.innerHTML;
  btn.onclick = () => {
    if (!btn.classList.contains('armed')){ btn.classList.add('armed'); btn.textContent = armedText; clearTimeout(btn._t); btn._t = setTimeout(() => { if (btn.isConnected){ btn.classList.remove('armed'); btn.innerHTML = idle; } }, 4000); return; }
    clearTimeout(btn._t); fn();
  };
}

/* Results: conversation (Arabic, English, side by side), summary, explanations, phrases to learn */
var trTab = 'conv', trLastRes = null;
async function trResult(rec){
  const blob = await trGetAudio(rec.id).catch(() => null);
  if (trViewing !== rec.id) return;
  if (trLastRes !== rec.id){ trLastRes = rec.id; trTab = 'conv'; }          // another recording opens on its transcript
  const url = blob ? URL.createObjectURL(blob) : '', speakers = new Set((rec.segments || []).map(s => s.speaker)).size;
  $app.innerHTML = `<div class="tr tr-res" id="trRes" data-id="${rec.id}">
    <button class="btn ghost back" onclick="show('tr')">${trI('left', 'sm')}Translator</button>
    <div class="tr-head"><h1 class="title tr-title">${trEsc(rec.name)}</h1>
      <p class="muted small">${trWhen(rec.created)}${rec.duration ? ' · ' + trMMSS(rec.duration) : ''} · ${rec.segments.length} lines · ${speakers} ${speakers === 1 ? 'speaker' : 'speakers'}</p></div>
    <div class="tr-player">${url ? `<audio controls src="${url}" id="trAudio" class="tr-audio"></audio>` : '<p class="muted small">The audio is no longer on this phone.</p>'}</div>
    <div class="tr-tabs" role="tablist">${[['conv', 'Transcript'], ['sum', 'Summary'], ['learn', 'Learn']].map(([k, t]) => `<button role="tab" data-t="${k}" aria-selected="${trTab === k}">${t}</button>`).join('')}</div>
    <div id="trPane"></div>
    <details class="tr-tech"><summary>Technical details</summary><p class="muted small">Models used: ${trEsc((rec.models || []).join(', ') || '–')}. Finished in ${trMMSS(((rec.doneAt || Date.now()) - (rec.startedAt || rec.created)) / 1000)}.${rec.dropped?.length ? ` The checks removed ${rec.dropped.length} item(s) that were not in the transcript or not usable.` : ''}</p>
      <button class="btn ghost" id="trCopy">Copy report for Claude</button><textarea class="tr-report-box" id="trReportBox" readonly hidden aria-label="Report"></textarea></details>
    <button class="btn danger block" id="trDelRes">${trI('trash', 'sm')}Delete this recording</button></div>`;
  $app.querySelectorAll('.tr-tabs button').forEach(b => b.onclick = () => { trTab = b.dataset.t; $app.querySelectorAll('.tr-tabs button').forEach(x => x.setAttribute('aria-selected', x === b)); trPane(rec); });
  trTwoTap(document.getElementById('trDelRes'), 'Tap again to delete', async () => { await trDelete(rec.id); show('tr'); });
  document.getElementById('trCopy').onclick = () => trCopyReport(rec.id);
  trPane(rec);
}
/* Report for Claude: what happened, step by step, with timings and phone events. Never includes the key. */
function trReport(rec){
  const live = trRunning && trLive.id === rec.id, r = {
    page: TR_VERSION, at: new Date().toString(),
    recording: { name: rec.name, sizeMB: +(rec.size / 1048576).toFixed(2), type: rec.mime, length: trMMSS(rec.duration), created: new Date(rec.created).toString() },
    status: rec.status, message: rec.error || '', waitingUntil: rec.retryAt ? new Date(rec.retryAt).toString() : '',
    now: live ? { step: trLive.stepText, detail: trLive.detail, workingFor: trMMSS((Date.now() - trLive.started) / 1000) } : 'not running',
    totalTime: rec.doneAt ? trMMSS((rec.doneAt - (rec.startedAt || rec.created)) / 1000) : trMMSS((Date.now() - (rec.startedAt || rec.created)) / 1000) + ' so far',
    progress: { uploaded: !!rec.file, partsDone: (rec.parts || []).length, partsTotal: Math.max(1, Math.ceil((rec.duration || TR_STEP_SEC) / TR_STEP_SEC)), lines: rec.segments?.length ?? null,
      summary: rec.summary === undefined ? 'not yet' : rec.summary?.error ? 'error' : 'done', learn: rec.learn === undefined ? 'not yet' : rec.learn?.error ? 'error' : 'done' },
    modelsUsed: rec.models || [], log: rec.log || [], removedByChecks: rec.dropped || [],
    phone: { installedApp: matchMedia('(display-mode: standalone)').matches, online: navigator.onLine, visible: document.visibilityState, screenOffMode: trAwake, screenOffAudioPlaying: !!(trAudioEl && !trAudioEl.paused),
      notifications: window.Notification ? Notification.permission : 'not available', browser: navigator.userAgent },
    freeLimitsUsedUp: Object.fromEntries(Object.entries(trQuota()).map(([m, t]) => [m, new Date(t).toString()])),
    redo: rec.redo || [], redoNote: rec.redoNote || '', transcript: rec.segments || (rec.parts || []).flat(), summary: rec.summary, learn: rec.learn,
  };
  return JSON.stringify(r, null, 1);
}
// While a job runs, its newest log lines are in memory and not saved yet, so the report uses the live record.
async function trReportText(id){ const rec = trRunning && trCurRec?.id === id ? trCurRec : await trGet(id).catch(() => null); return rec ? trReport(rec) : ''; }
async function trCopyReport(id){
  const text = await trReportText(id); if (!text) return;
  try { await navigator.clipboard.writeText(text); toast('Report copied. Paste it in the chat with Claude.'); return; } catch {}
  try { const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; document.body.append(t); t.select();
    const ok = document.execCommand('copy'); t.remove(); if (ok){ toast('Report copied. Paste it in the chat with Claude.'); return; } } catch {}
  const box = document.getElementById('trReportBox');                 // copying not allowed: show it so it can be selected by hand
  if (box){ box.hidden = false; box.value = text; box.focus(); box.select(); toast('Select all the text in the box and copy it.'); }
}

var trBadge = { stated: ['Said', 'tr-said'], suggested: ['Suggested', 'tr-sugg'], uncertain: ['Unclear', 'tr-unc'] };
function trTimes(times){ return (times || []).map(t => `<button class="tr-time" data-at="${trEsc(t)}">${trEsc(t)}</button>`).join(''); }
function trSectionError(v, rec, key){
  if (rec?.redo?.includes(key)) return rec.redoNote ? `<div class="tr-err">${trI('alert')}<span>${trEsc(rec.redoNote)}</span><button class="btn ghost tr-retry" data-k="${key}">Try again now</button></div>`
    : `<div class="card tr-card tr-redo"><div class="tr-spin sm" aria-hidden="true"></div><p><b>Creating this part again.</b> You can leave this page; it keeps working.</p></div>`;
  return v && v.error ? `<div class="tr-err">${trI('alert')}<span>This part could not be created: ${trEsc(v.error)}</span><button class="btn ghost tr-retry" data-k="${key}">Try again</button></div>` : ''; }
function trPane(rec){
  const p = document.getElementById('trPane'); if (!p) return;
  const ai = `<p class="tr-ai">${trI('alert', 'sm')}Written by AI from the transcript. Tap a time to hear that part.</p>`;
  if (trTab === 'conv'){
    const canPlay = !!document.getElementById('trAudio');           // a speaker on each line shows it can be tapped to hear it
    p.innerHTML = `${canPlay && rec.segments.length ? `<p class="tr-hint">${trI('vol', 'sm')}Tap any line to hear it in the recording.</p>` : ''}<div class="tr-segs both${canPlay ? ' can-play' : ''}">${rec.segments.length ? rec.segments.map((s, i) => `<button class="tr-seg" data-i="${i}"${canPlay ? ` aria-label="Play ${trEsc(s.start)}, ${trEsc(s.speaker)}"` : ''}>
        <span class="tr-seg-top"><b>${trEsc(s.start)}</b><span class="tr-spk">${trEsc(s.speaker)}${s.role && s.role !== 'unknown' ? ' · ' + trEsc(s.role) : ''}</span>${s.unclear ? '<span class="tag sand">unclear part</span>' : ''}${s.check ? '<span class="tag sand">check the audio</span>' : ''}${canPlay ? `<span class="tr-play" aria-hidden="true">${trI('vol')}</span>` : ''}</span>
        <span class="tr-ar" lang="ar" dir="rtl">${trEsc(s.ar)}</span><span class="tr-en">${trEsc(s.en)}</span></button>`).join('') : '<p class="muted">No speech was found in this recording.</p>'}</div>`;
    p.querySelectorAll('.tr-seg').forEach(b => b.onclick = () => { const s = rec.segments[+b.dataset.i]; trPlay(trSecs(s.start), trSecs(s.end), b); });
  } else if (trTab === 'sum'){
    const s = rec.summary || {};
    const list = (t, l) => l?.length ? `<h3 class="tr-h3">${t}</h3><ul class="tr-items">${l.map(x => `<li><span class="tr-badge ${trBadge[x.status]?.[1] || ''}">${trBadge[x.status]?.[0] || ''}</span><span>${trEsc(x.text)} ${trTimes(x.times)}</span></li>`).join('')}</ul>` : '';
    p.innerHTML = trSectionError(s, rec, 'summary') || `<div class="card tr-card">${ai}<p class="tr-over">${trEsc(s.overview || 'No summary.')}</p>${list('Key discussion points', s.key_points)}${list('Symptoms and medical findings', s.symptoms_findings)}${list('Treatment and medication', s.treatment_medication)}${list('Decisions and next steps', s.decisions_next_steps)}${list('Important details', s.important_details)}</div>`;
  } else {
    const l = rec.learn;
    p.innerHTML = trSectionError(l, rec, 'learn') || `<div class="card tr-card">${ai}${(l || []).length ? l.map(x => `<div class="tr-item"><div class="tr-ar" lang="ar" dir="rtl">${trEsc(x.ar)}</div>
      <p><b>${trEsc(x.lat)}</b> · ${trEsc(x.en)} <span class="tag ${x.register === 'formal medical' ? 'sand' : 'green'}">${trEsc(x.register || '')}</span></p><p class="small">${trEsc(x.usage)}</p>${x.medical_context ? `<p class="muted small">In the hospital: ${trEsc(x.medical_context)}</p>` : ''}
      ${(x.alternatives || []).length ? `<p class="muted small">You may also hear: ${x.alternatives.map(a => `<span lang="ar" dir="rtl" class="tr-alt">${trEsc(a.ar)}</span> (${trEsc(a.lat)}, ${trEsc(a.en)})`).join('; ')}</p>` : ''}</div>`).join('') : '<p class="muted">No phrases were picked.</p>'}</div>`;
  }
  p.querySelectorAll('.tr-retry').forEach(b => b.onclick = async () => {      // redo just this part; the recording stays finished and on screen
    trKeepAwake(true); const r = await trGet(rec.id); if (!r) return;
    r.redo = [...new Set([...(r.redo || []), b.dataset.k])]; r.redoAt = 0; delete r.redoNote; if (r[b.dataset.k]?.error) delete r[b.dataset.k];
    await trPut(r); trPane(r); trRun(); });
  p.querySelectorAll('.tr-time').forEach(b => b.onclick = e => { e.stopPropagation(); const s = trSecs(b.dataset.at), seg = rec.segments.find(x => trSecs(x.start) === s); trPlay(s, seg ? trSecs(seg.end) : s + 8); });
}
function trPlay(from, to, el){
  const a = document.getElementById('trAudio'); if (!a) return;
  document.querySelectorAll('.tr-seg.on').forEach(x => x.classList.remove('on')); if (el) el.classList.add('on');
  a.currentTime = from; a.play().catch(() => {});
  clearInterval(a._t); if (to > from) a._t = setInterval(() => { if (a.currentTime >= to + 0.25 || a.paused){ a.pause(); clearInterval(a._t); el?.classList.remove('on'); } }, 150);
}

var TR_VIEWS = { tr: trHome, trrec: trRec };
