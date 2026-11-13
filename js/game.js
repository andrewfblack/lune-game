'use strict';
/* ═══════════════════════════════════════════════════════════════
   LUNE: Legend of the Pillow Fort — a squishy story adventure
   Based on Lune & Rei's legendary ChatGPT roleplay (Nov 2026)
   ═══════════════════════════════════════════════════════════════ */

// Comfort preferences are browser-local, never part of a story save/migration.
const SETTINGS_KEY = 'luneComfortSettingsV1';
function loadSettings() {
  const defaults = { muted:false, reducedMotion:!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, instantText:false, largeDialogue:false };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    for (const key of Object.keys(defaults)) if (typeof saved?.[key] === 'boolean') defaults[key] = saved[key];
  } catch (e) { /* unavailable or invalid storage: use safe defaults */ }
  return defaults;
}
const settings = loadSettings();

// ───────────────────────── AUDIO (tiny WebAudio synth) ─────────────────────────
const SFX = (() => {
  let ctx = null;
  let master = null;
  const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());
  function tone(freq, dur = 0.12, type = 'square', vol = 0.18, when = 0) {
    if (settings.muted) return;
    try {
      const a = ac(), o = a.createOscillator(), g = a.createGain();
      if (!master) { master = a.createGain(); master.connect(a.destination); }
      o.type = type; o.frequency.value = freq;
      const t = a.currentTime + when;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + dur + 0.03);
    } catch (e) { /* audio not available — stay silent */ }
  }
  return {
    setMuted: () => { if (master) master.gain.setValueAtTime(settings.muted ? 0 : 1, ctx.currentTime); },
    click:   () => tone(880, 0.06, 'square', 0.12),
    blip:    () => tone(660, 0.05, 'square', 0.08),
    sparkle: () => { [1319, 1568, 2093].forEach((f, i) => tone(f, .18, 'sine', .18, i * .09)); },
  };
})();

// Story, characters, locations and encounter definitions live in content.js.
const { CHARACTERS, ITEMS, BLOOPERS, CHAPTERS, EPISODES, SCENES } = window.LUNE_CONTENT;

// ───────────────────────── SAVE STATE ─────────────────────────
const SAVE_KEY = 'luneLegendSaveV1';
let S = null; // live state
let saveFailureShown = false;
const defaultState = () => ({
  storyVersion: 2,
  chapter: 1, joined: ['lune','rei'],
  flags: {}, bloopers: [], done: {},
  inventory: {},
  progress: null,
});

function sceneCheckpoint(sceneId, index, extra = {}) {
  const version = EPISODES.find(episode => episode.id === sceneId)?.checkpointVersion;
  return { sceneId, index, ...(version ? { sceneVersion: version } : {}), ...extra };
}

function saveGame(silent) {
  let saved = false;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); saved = true; } catch (e) { console.error('savefailed', e && e.message); }
  if (saved) {
    saveFailureShown = false;
    if (!silent) toast('💾 Game saved! (Bworple is watching)');
  } else if (!saveFailureShown) {
    saveFailureShown = true;
    toast('⚠ Your browser could not save this change. Keep this tab open.', 7000, true);
  }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const state = { ...defaultState(), ...saved };
    state.flags = state.flags || {};
    state.done = state.done || {};
    state.inventory = state.inventory || {};
    state.joined = Array.isArray(state.joined) ? state.joined.filter(id => CHARACTERS[id]) : ['lune','rei'];
    // Retain old XP and party data in older saves, but never use it for progression.
    state.bloopers = Array.isArray(state.bloopers) ? state.bloopers : [];
    // Give existing players passport keepsakes for episodes they completed.
    // Other fields from old saves are retained, but XP/party no longer drive the game.
    for (const episode of EPISODES) {
      if (state.done[episode.id] && episode.keepsake && !state.inventory[episode.keepsake]) {
        state.inventory[episode.keepsake] = 1;
      }
    }
    // Version 2 inserts the origin chapter. Migrate unversioned saves once,
    // keeping episode IDs/checkpoints and collectibles. The old prototype's
    // chapter 3 was a removed finale, not today's chapter 3: clamp BEFORE shifting.
    if (!saved.storyVersion || saved.storyVersion < 2) {
      state.chapter = Math.max(1, Math.min(Number(saved.chapter) || 1, 2)) + 1;
      state.storyVersion = 2;
    }
    if (state.completed) state.flags.previousPrototypeEnding = true;
    delete state.completed;
    state.chapter = Math.max(1, Math.min(Number(state.chapter) || 1, Math.max(...Object.keys(CHAPTERS).map(Number))));
    let progress = state.progress;
    const episode = progress && EPISODES.find(e => e.id === progress.sceneId);
    // Expanded episodes can map an older release's numeric checkpoints to
    // named story landmarks. Preserve a selected reply without reapplying it.
    if (episode?.checkpointVersion && (progress.sceneVersion || 1) !== episode.checkpointVersion) {
      // Recover actions actually recorded in an earlier dialogue format. These
      // are explicit per-episode mappings, not guessed responses or new rewards.
      for (const fact of episode.legacyChoiceFlags?.[progress.sceneVersion || 1] || []) {
        if (fact.values.includes(state.flags[fact.from])) state.flags[fact.to] = true;
      }
      const migration = Number.isInteger(progress.index)
        ? episode.checkpointMigrations?.[progress.sceneVersion || 1]?.[progress.index] : null;
      const landmark = migration?.checkpointId || ((progress.sceneVersion || 1) === 1 && Number.isInteger(progress.index)
        ? episode.legacyStepIds?.[progress.index] : null);
      const index = landmark ? episode.steps.findIndex(step => step.checkpointId === landmark) : -1;
      progress = index >= 0 ? sceneCheckpoint(progress.sceneId, index, {
        ...(progress.phase === 'reply' && !migration?.reask ? { phase: progress.phase, selection: progress.selection } : {}),
      }) : null;
      state.progress = progress;
    }
    const steps = progress && episode ? episode.steps : null;
    // Ignore stale checkpoints from removed episodes or changed story data.
    if (!steps || !Number.isInteger(progress.index) || progress.index < 0 || progress.index >= steps.length || (episode && state.done[episode.id])) {
      state.progress = null;
    } else if (progress.phase !== 'reply' || !steps[progress.index].choice || !Number.isInteger(progress.selection) || !steps[progress.index].choice[progress.selection]) {
      state.progress = sceneCheckpoint(progress.sceneId, progress.index);
    }
    return state;
  } catch (e) { return null; }
}
function continueInfo() {
  const d = loadGame(); if (!d) return null;
  return { chapter: d.chapter || 1, bloopers: BLOOPERS.filter(b => !b.comingSoon && d.bloopers.includes(b.id)).length, inScene: !!d.progress };
}

// ───────────────────────── HELPERS ─────────────────────────
function $(sel, root) {
  const base = (typeof document !== 'undefined' && document) ? document : (typeof window !== 'undefined' && window && window.document ? window.document : null);
  if (!base) return null;
  return base.querySelector(sel);
}
const el = (tag, cls, html) => { const e = (typeof window !== 'undefined' ? window.document : document).createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const $$ = (sel, root) => [...( (typeof window !== 'undefined' ? window.document : document) || root )?.querySelectorAll?.(sel) || []];

const wait = ms => new Promise(r => setTimeout(r, ms));

let settingsOpener = null;
let settingsBackground = [];
let settingsPreviousInert = false;
function settingsOpen() { return !$('#settings-modal').classList.contains('hidden'); }
function applySettings() {
  document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  document.documentElement.classList.toggle('large-dialogue', settings.largeDialogue);
  SFX.setMuted();
  if (settings.instantText && $('#dlg-text')._skip) {
    const finish = $('#dlg-text')._skip;
    $('#dlg-text')._skip = null;
    finish();
  }
}
function closeSettings() {
  $('#settings-modal').classList.add('hidden');
  $('#settings-modal').inert = settingsPreviousInert;
  for (const [node, inert] of settingsBackground) node.inert = inert;
  settingsBackground = [];
  settingsOpener?.focus();
}
function wireSettings() {
  applySettings();
  for (const id of ['btn-settings-title', 'btn-settings-hub', 'btn-settings-dialogue']) {
    $('#' + id).addEventListener('click', event => {
      event.stopPropagation();
      settingsOpener = event.currentTarget;
      settingsPreviousInert = $('#settings-modal').inert;
      $('#settings-modal').inert = false;
      settingsBackground = [...document.querySelectorAll('.screen, .modal')]
        .filter(node => node.id !== 'settings-modal').map(node => [node, node.inert]);
      for (const [node] of settingsBackground) node.inert = true;
      for (const key of Object.keys(settings)) $('#setting-' + key).checked = settings[key];
      $('#settings-status').textContent = '';
      $('#settings-modal').classList.remove('hidden');
      $('#setting-muted').focus();
    });
  }
  for (const key of Object.keys(settings)) {
    $('#setting-' + key).addEventListener('change', event => {
      settings[key] = event.target.checked;
      applySettings();
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        $('#settings-status').textContent = 'Settings saved in this browser.';
      } catch (e) {
        $('#settings-status').textContent = 'Applied for now. Browser storage is unavailable, so settings may not survive closing.';
      }
    });
  }
  $('#settings-close').addEventListener('click', closeSettings);
}
const availableBloopers = () => BLOOPERS.filter(b => !b.comingSoon);
const availableBlooperCount = () => S ? availableBloopers().filter(b => S.bloopers.includes(b.id)).length : 0;

let activeToast = null;
const toastQueue = [];
function showToast(notice) {
  activeToast = notice;
  const t = document && document.querySelector('#toast');
  if (!t) { activeToast = null; if (toastQueue.length) showToast(toastQueue.shift()); return; }
  t.textContent = notice.msg; t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    activeToast = null;
    if (toastQueue.length) showToast(toastQueue.shift());
    else t.classList.add('hidden');
  }, notice.ms);
}
function toast(msg, ms = 2400, announcement = false) {
  // Friend/reward announcements must finish before the next one replaces them.
  // Routine feedback (Skip, Save, Welcome back) stays replaceable and cannot
  // bury these announcements in a queue of repeated button presses.
  if (activeToast?.announcement) {
    if (announcement) toastQueue.push({ msg, ms, announcement });
    return;
  }
  showToast({ msg, ms, announcement });
}
function clearToasts() {
  clearTimeout($('#toast')._timer);
  activeToast = null;
  toastQueue.length = 0;
  $('#toast').classList.add('hidden');
}
function showScreen(id) {
  $$('.screen').forEach(s => {
    const selected = s.id === id;
    s.classList.toggle('active', selected);
    s.classList.toggle('hidden', !selected);
  });
}
function gainBlooper(id) {
  if (S.bloopers.includes(id)) return;
  S.bloopers.push(id);
  const b = BLOOPERS.find(b => b.id === id);
  SFX.sparkle(); toast(`🎬 Blooper #${b.num} saved to the Flop-O-Matic 3000!`, 3400, true);
  saveGame(true); updateBlooperCounters();
}
function gainItem(id, n = 1) {
  if (!ITEMS[id] || S.inventory[id]) return;
  S.inventory[id] = n;
  SFX.sparkle(); toast(`${ITEMS[id].emoji} Keepsake: ${ITEMS[id].name}!`, 3000, true);
}
function updateBlooperCounters() {
  const doc = (typeof window !== 'undefined' ? window.document : (typeof document !== 'undefined' ? document : null));
  if (doc) {
    const title = doc.querySelector('#blooper-count-title');
    if (title) title.textContent = `${availableBlooperCount()}/${availableBloopers().length}`;
    const modal = doc.querySelector('#blooper-count');
    if (modal) modal.textContent = `${availableBlooperCount()}/${availableBloopers().length}`;
    const hub = doc.querySelector('#hub-bloopers');
    if (hub) hub.textContent = availableBlooperCount();
  }
}

// ═══════════════════════ SCREENS & TITLE ═══════════════════════
function refreshContinueButton() {
  const button = $('#btn-continue');
  const info = continueInfo();
  button.classList.toggle('hidden', !info);
  if (info) button.innerHTML = `↻ Continue <small style="display:block;font-size:.6em;opacity:.8">Chapter ${info.chapter}${info.inScene ? ' · in conversation' : ''} · 🎬 ${info.bloopers}/${availableBloopers().length}</small>`;
}
function wireTitle() {
  const btnNew = $('#btn-new');
  let confirmReset = false, confirmTimer = null;
  btnNew.addEventListener('click', () => {
    SFX.click();
    const existing = continueInfo();
    if (existing && !confirmReset) {
      confirmReset = true;
      btnNew.textContent = '⚠ Replace Save? Click Again';
      confirmTimer = setTimeout(() => { confirmReset = false; btnNew.textContent = '▶ New Game'; }, 3000);
      return;
    }
    clearTimeout(confirmTimer); confirmReset = false; btnNew.textContent = '▶ New Game';
    clearToasts();
    saveFailureShown = false;
    S = defaultState();
    saveGame(true);
    showScreen('screen-hub');
    renderHub();
  });
  const btnContinue = $('#btn-continue');
  refreshContinueButton();
  btnContinue.addEventListener('click', () => {
    SFX.click();
    S = loadGame() || defaultState();
    saveGame(true); // Commit one-time chapter migration before a resumed line waits.
    if (S.progress) { runScene(S.progress.sceneId, S.progress.index); toast('Welcome back! Picking up where you left off. 🛋️'); }
    else { showScreen('screen-hub'); renderHub(); toast('Welcome back to the pillow fort! 🛋️'); }
  });
  $('#btn-howto').addEventListener('click', () => { SFX.click(); $('#howto-modal').classList.remove('hidden'); });
  $('#howto-close').addEventListener('click', () => { SFX.click(); $('#howto-modal').classList.add('hidden'); });
  $('#btn-bloopers-title').addEventListener('click', () => { SFX.click(); openBloopers(); });
}

// ═══════════════════════ HUB ═══════════════════════
let hubChapter = 1;
let hubStoryChapter = null;
const hubEpisodeIcons = {
  'first-ah': 'star', 'captain-duckula': 'lifebuoy',
  'moon-key': 'moon-key', 'bworple-castle': 'slime-castle',
  karaoke: 'microphone', kitchen: 'slime-machine', slimmarchives: 'slime-machine',
  bworplevoice: 'smoothie-stand', secret: 'moon-lock-key', 'miku-cover': 'microphone',
};
function hubIcon(name, className = '') {
  return `<img class="ui-icon ${className}" src="assets/ui/${name}.webp" alt="" draggable="false" onerror="this.hidden=true">`;
}
function renderHub() {
  if (hubStoryChapter !== S.chapter) { hubChapter = S.chapter; hubStoryChapter = S.chapter; }
  const knownChapter = number => number <= S.chapter || EPISODES.some(episode => episode.chapter === number && S.done[episode.id]);
  if (!CHAPTERS[hubChapter] || !knownChapter(hubChapter)) hubChapter = S.chapter;
  const chapter = CHAPTERS[hubChapter];
  const _hubBg = (window && window.document) ? window.document.querySelector('.hub-bg') : null;
  if (_hubBg) { _hubBg.style.backgroundImage = hubChapter === 1 ? "url('assets/bg/laboratory.jpg')" : ''; _hubBg.dataset.background = hubChapter === 1 ? 'laboratory' : 'pillowfort'; }
  const allAvailableEpisodesDone = EPISODES.filter(e => e.chapter <= S.chapter).every(e => S.done[e.id]);
  const hubChapterEl = (typeof window !== 'undefined' && window.document) ? window.document.querySelector('#hub-chapter') : null;
  if (hubChapterEl) hubChapterEl.textContent = chapter.title + (hubChapter === S.chapter && allAvailableEpisodesDone && !CHAPTERS[S.chapter + 1] ? ' · To be continued…' : '');
  const chapterEpisodes = EPISODES.filter(episode => episode.chapter === hubChapter);
  const _hcp = (typeof window !== 'undefined' && window && window.document) ? window.document.querySelector('#hub-chapter-progress') : null;
  if (_hcp) _hcp.textContent = `${chapterEpisodes.filter(episode => S.done[episode.id]).length} of ${chapterEpisodes.length} chapter memories kept. Take the next one at your own pace.`;
  const _hubStamps = (typeof window !== 'undefined' && window && window.document) ? window.document.querySelector('#hub-stamps') : document.querySelector('#hub-stamps');
  if (_hubStamps) _hubStamps.textContent = `${EPISODES.filter(e => S.done[e.id]).length}/${EPISODES.length}`;
  $('#hub-bloopers').textContent = availableBlooperCount();
  updateBlooperCounters();

  const tabs = $('#hub-chapter-tabs'); tabs.replaceChildren();
  for (const key of Object.keys(CHAPTERS)) {
    const number = Number(key);
    if (!knownChapter(number)) continue;
    const tab = el('button', 'hub-chapter-tab', `Chapter ${number}`);
    tab.type = 'button'; tab.dataset.chapter = number;
    tab.setAttribute('aria-pressed', String(number === hubChapter));
    tab.addEventListener('click', () => { SFX.click(); hubChapter = number; renderHub(); $('#hub-scroll').scrollTop = 0; $('#hub-chapter-tabs').querySelector(`[data-chapter="${number}"]`).focus(); });
    tabs.appendChild(tab);
  }

  const wrap = $('#hub-locations'); wrap.replaceChildren();
  for (const key of Object.keys(CHAPTERS)) {
    const number = Number(key);
    const episodes = EPISODES.filter(episode => episode.chapter === number);
    const section = el('section', 'hub-chapter-section' + (number === hubChapter ? '' : ' hidden'));
    section.dataset.chapter = number;
    section.hidden = number !== hubChapter;
    const completeCount = episodes.filter(episode => S.done[episode.id]).length;
    const chapterList = el('div', 'chapter-episode-list');
    chapterList.innerHTML = '<h2>In this chapter</h2>';
    const rows = el('div', 'chapter-episode-rows'); chapterList.appendChild(rows);
    const available = episodes.filter(episode => !S.done[episode.id] && S.chapter >= episode.chapter && !(episode.requires || []).some(id => !S.done[id]));
    const next = available.find(episode => episode.id === S.progress?.sceneId) || available[0];
    for (const [episodeIndex, loc] of episodes.entries()) {
      const done = !!S.done[loc.id];
      const missingRequirement = loc.requires?.find(id => !S.done[id]);
      // Previously completed episodes stay revisitable after new prerequisites.
      const unlocked = done || (S.chapter >= loc.chapter && !missingRequirement);
      const prerequisite = EPISODES.find(e => e.id === missingRequirement);
      const prerequisiteVisible = prerequisite && S.chapter >= prerequisite.chapter && !(prerequisite.requires || []).some(id => !S.done[id]);
      const lockedReason = S.chapter < loc.chapter
        ? `Unlocks in Chapter ${loc.chapter}`
        : prerequisiteVisible ? `Finish ${prerequisite.name} first` : 'Continue the sleepover story to unlock';
      const featured = next?.id === loc.id;
      const resuming = S.progress?.sceneId === loc.id;
      const icon = !unlocked ? hubIcon('moon-lock') : hubEpisodeIcons[loc.id] ? hubIcon(hubEpisodeIcons[loc.id]) : loc.emoji;
      const makeCard = feature => {
        const card = el('button', feature ? 'adventure-feature next-adventure' : 'loc-card chapter-episode-row');
        card.type = 'button'; card.dataset.episode = loc.id;
        card.classList.toggle('locked', !unlocked);
        card.classList.toggle('completed-memory', done);
        card.classList.toggle('is-next', !feature && featured);
        const description = feature ? loc.desc : `Episode ${episodeIndex + 1} · ${done ? 'Tap to revisit' : !unlocked ? lockedReason : resuming ? 'Continue where you left off' : featured ? 'Your next adventure' : 'Ready when you are'}`;
        card.innerHTML = `${feature ? `<span class="adventure-eyebrow">${resuming ? 'BACK TO YOUR STORY' : 'YOUR NEXT ADVENTURE'}</span>` : ''}
          <span class="loc-emoji" aria-hidden="true">${icon}</span>
          <span class="loc-copy"><span class="loc-name">${unlocked ? loc.name : 'A memory still to come'}</span>
          <span class="loc-desc">${description}</span></span>
          ${feature ? `<span class="hub-play">${resuming ? 'Continue your story' : 'Play this episode'} <span aria-hidden="true">→</span></span>` : `<span class="episode-state${done ? ' loc-done' : ''}">${done ? '✓ Done' : !unlocked ? 'Locked' : featured ? 'Next' : 'Ready'}</span>`}`;
        card.disabled = !unlocked;
        if (unlocked) {
          card.setAttribute('aria-label', `${done ? 'Revisit' : resuming ? 'Continue' : 'Play'} ${loc.name}`);
          card.addEventListener('click', () => {
            SFX.click(); runScene(loc.id, S.progress?.sceneId === loc.id ? S.progress.index : 0);
          });
        }
        return card;
      };
      if (featured) section.appendChild(makeCard(true));
      rows.appendChild(makeCard(false));
    }
    if (!available.length && completeCount === episodes.length) {
      const finished = el('div', 'hub-chapter-finished');
      finished.innerHTML = `<span aria-hidden="true">🌙</span><h2>A chapter full of memories</h2><p>They’re safe in your Memory Book. Revisit a moment below, or choose another chapter above.</p>`;
      section.appendChild(finished);
    }
    section.appendChild(chapterList);
    wrap.appendChild(section);
  }

  const pp = $('#hub-friends'); pp.innerHTML = '';
  const friends = [...new Set(S.joined)].filter(id => CHARACTERS[id]);
  $('#friends-count').textContent = friends.length;
  const preview = $('#friends-preview'); preview.replaceChildren();
  for (const id of friends.slice(0, 3)) {
    const img = el('img'); img.src = CHARACTERS[id].img; img.alt = ''; img.draggable = false;
    preview.appendChild(img);
  }
  $('#btn-friends').setAttribute('aria-label', `Friends of the Fort, ${friends.length} friends met. Open friends drawer.`);
  for (const id of friends) {
    const c = CHARACTERS[id];
    if (!c) continue;
    const chip = el('button', 'friend-chip');
    chip.type = 'button';
    chip.style.setProperty('--friend-color', c.color);
    chip.dataset.character = id;
    chip.setAttribute('aria-label', `Read about ${c.name}`);
    chip.setAttribute('aria-haspopup', 'dialog');
    chip.setAttribute('aria-controls', 'character-modal');
    chip.innerHTML = `<img src="${c.img}" alt="${c.name}" onerror="this.onerror=null;this.src='assets/characters/bworple.jpg'">
      <span class="friend-name">${c.name}</span>`;
    chip.addEventListener('click', () => openCharacterCard(id, chip));
    pp.appendChild(chip);
  }
}

function checkChapterProgression() {
  const current = CHAPTERS[S.chapter], next = CHAPTERS[S.chapter + 1];
  if (current && current.requires.every(id => S.done[id])) {
    if (next) {
      S.chapter++; saveGame(true);
      setTimeout(() => { SFX.sparkle(); toast(`🌙 ${next.title} unlocked!`, 4200, true); }, 600);
    } else {
      setTimeout(() => toast('🌙 To be continued — your story, your next chapter!', 4200, true), 600);
    }
  }
}

// ═══════════════════════ PASSPORT & KEEPSAKES ═══════════════════════
let hubSheet = null;
let hubSheetBackground = [];
let hubSheetOpener = null;
function openHubSheet(id, opener) {
  if (hubSheet) closeHubSheet(false);
  SFX.click(); hubSheet = id; hubSheetOpener = opener;
  hubSheetBackground = [...document.querySelectorAll('.screen, .modal')]
    .filter(node => node.id !== id).map(node => [node, node.inert]);
  for (const [node] of hubSheetBackground) node.inert = true;
  const modal = $('#' + id); modal.inert = false; modal.classList.remove('hidden');
  if (opener?.getAttribute('aria-controls') === id) opener.setAttribute('aria-expanded', 'true');
  modal.querySelector('button')?.focus();
}
function closeHubSheet(restoreFocus = true) {
  if (!hubSheet) return;
  $('#' + hubSheet).classList.add('hidden');
  for (const [node, inert] of hubSheetBackground) node.inert = inert;
  hubSheetOpener?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) hubSheetOpener?.focus();
  hubSheet = null; hubSheetBackground = []; hubSheetOpener = null;
}
function trapModalFocus(event, modal) {
  if (event.key !== 'Tab') return;
  const controls = [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')];
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
function wireModals() {
  $('#btn-hub-menu').addEventListener('click', () => openHubSheet('hub-menu-modal', $('#btn-hub-menu')));
  $('#btn-friends').addEventListener('click', () => openHubSheet('friends-modal', $('#btn-friends')));
  for (const id of ['hub-menu-close', 'friends-close']) $('#' + id).addEventListener('click', () => { SFX.click(); closeHubSheet(); });
  for (const id of ['hub-menu-modal', 'friends-modal']) {
    $('#' + id).addEventListener('click', event => { if (event.target === event.currentTarget) closeHubSheet(); });
  }
  $('#btn-passport').addEventListener('click', openPassport);
  $('#passport-close').addEventListener('click', closePassport);
  $('#passport-prev').addEventListener('click', () => { SFX.click(); showPassportPage(passportPage - 1); });
  $('#passport-next').addEventListener('click', () => { SFX.click(); showPassportPage(passportPage + 1); });
  $('#btn-bag').addEventListener('click', () => { closeHubSheet(false); renderBag(); openHubSheet('bag-modal', $('#btn-hub-menu')); });
  $('#bag-close').addEventListener('click', () => { SFX.click(); closeHubSheet(); });
  $('#btn-bloopers-hub').addEventListener('click', () => { closeHubSheet(false); SFX.click(); openBloopers(); });
  $('#btn-hub-home').addEventListener('click', () => {
    closeHubSheet(false); saveGame(true); refreshContinueButton(); showScreen('screen-title'); $('#btn-continue').focus();
  });
  $('#bloopers-close').addEventListener('click', () => { SFX.click(); goBackFromBloopers(); });
  $('#character-close').addEventListener('click', closeCharacterCard);
}
let characterTrigger = null;
let characterBackground = [];
let characterPreviousInert = false;
function openCharacterCard(id, trigger) {
  const character = CHARACTERS[id];
  if (!character) return;
  SFX.click();
  characterTrigger = trigger;
  characterBackground = [...document.querySelectorAll('.screen, .modal')]
    .filter(node => node.id !== 'character-modal').map(node => [node, node.inert]);
  for (const [node] of characterBackground) node.inert = true;
  characterPreviousInert = $('#character-modal').inert;
  $('#character-modal').inert = false;
  const portrait = $('#character-portrait');
  portrait.src = character.img;
  portrait.alt = `Portrait of ${character.name}`;
  portrait.onerror = () => { portrait.onerror = null; portrait.src = 'assets/characters/bworple.jpg'; };
  $('#character-name').textContent = character.name;
  $('#character-name').style.color = character.color;
  $('#character-title').textContent = character.title || 'Friend of the pillow fort';
  $('#character-bio').textContent = character.bio || 'A friend Lune met during the sleepover. More of their story is still to come.';
  $('#character-close').textContent = hubSheet === 'friends-modal' ? 'Back to friends' : 'Back to the fort';
  $('#character-modal').classList.remove('hidden');
  $('#character-close').focus();
}
function closeCharacterCard() {
  SFX.click();
  $('#character-modal').classList.add('hidden');
  $('#character-modal').inert = characterPreviousInert;
  for (const [node, inert] of characterBackground) node.inert = inert;
  characterBackground = [];
  characterTrigger?.focus();
  characterTrigger = null;
}
let blooperReturn = 'screen-hub';
function openBloopers() {
  blooperReturn = $('.screen.active') ? $('.screen.active').id : 'screen-hub';
  renderBloopers(); showScreen('screen-bloopers');
}
function goBackFromBloopers() { showScreen(blooperReturn === 'screen-bloopers' ? 'screen-title' : blooperReturn); }

let passportPage = 0;
let passportBackground = [];
const memoryChapterIcons = { 1: '🌙', 2: '🛋️', 3: '🫧' };
const memoryPictures = {
  'first-ah': 'momo-star', 'moon-key': 'silver-moon-key', 'captain-duckula': 'duckula',
  'hug-alarm': 'rei', 'royal-dare': 'moon-cookie', 'bworple-castle': 'slime-castle',
  entrance: 'rei', duckdom: 'bworplejr', dares: 'gumi', pillowfort: 'karaoke-machine',
  karaoke: 'teto', nursery: 'duckling', workshop: 'robo-duck', kitchen: 'bworple',
  slimmarchives: 'slime-commander', bworplevoice: 'smoothie-stand', secret: 'silver-moon-key',
  'miku-cover': 'moon-microphone', karmacam: 'sonic', baguettecrisis: 'gumi-bunny',
};

function passportPageData() {
  const pages = [{ type: 'cover' }];
  for (const [key, chapter] of Object.entries(CHAPTERS)) {
    const number = Number(key);
    const episodes = EPISODES.filter(episode => episode.chapter === number);
    const visible = S.chapter >= number || episodes.some(episode => S.done[episode.id]);
    const required = chapter.requires || [];
    const doneCount = required.filter(id => S.done[id]).length;
    pages.push({ type: 'divider', number, chapter, visible });
    for (const episode of episodes) {
      const stamped = !!S.done[episode.id];
      const visible = stamped || (S.chapter >= episode.chapter && !(episode.requires || []).some(id => !S.done[id]));
      pages.push({ type: 'episode', number, episode, stamped, visible });
    }
    pages.push({
      type: 'chapter',
      number, visible,
      chapter,
      doneCount,
      total: required.length,
      finished: required.length > 0 && doneCount === required.length,
    });
  }
  return pages;
}

function openPassport() {
  SFX.click();
  passportPage = 0;
  renderPassport();
  passportBackground = [...document.querySelectorAll('.screen, .modal')]
    .filter(node => node.id !== 'passport-modal').map(node => [node, node.inert]);
  for (const [node] of passportBackground) node.inert = true;
  $('#passport-modal').classList.remove('hidden');
  $('#memory-tabs button').focus();
}

function closePassport() {
  SFX.click();
  $('#passport-modal').classList.add('hidden');
  for (const [node, inert] of passportBackground) node.inert = inert;
  passportBackground = [];
  $('#btn-passport').focus();
}

function showPassportPage(index) {
  const pages = $$('#passport-list .passport-page');
  if (!pages.length) return;
  passportPage = Math.max(0, Math.min(index, pages.length - 1));
  pages.forEach((page, i) => {
    const active = i === passportPage;
    page.classList.toggle('active', active);
    page.setAttribute('aria-hidden', String(!active));
  });
  const count = $('#passport-page-count');
  if (count) count.textContent = `Page ${passportPage + 1} of ${pages.length}`;
  const prev = $('#passport-prev'), next = $('#passport-next');
  if (prev) prev.disabled = passportPage === 0;
  if (next) next.disabled = passportPage === pages.length - 1;
  const data = passportPageData()[passportPage];
  $('#passport-list').scrollTop = 0;
  for (const tab of $$('#memory-tabs button')) {
    tab.setAttribute('aria-pressed', String(Number(tab.dataset.chapter) === (data.number || 0)));
  }
}

function renderPassport() {
  const count = EPISODES.filter(e => S.done[e.id]).length;
  $('#passport-summary').textContent = `${count} of ${EPISODES.length} memory stickers collected. One handmade book, a chapter at a time.`;
  const list = $('#passport-list'); list.replaceChildren();
  const pages = passportPageData();
  const tabs = $('#memory-tabs'); tabs.replaceChildren();
  for (const [number, label] of [[0, 'Cover'], ...Object.keys(CHAPTERS).map(key => [Number(key), `Ch. ${key}`])]) {
    const button = el('button', 'memory-tab');
    button.type = 'button'; button.dataset.chapter = number;
    button.textContent = label;
    button.setAttribute('aria-label', number ? `Open Chapter ${number} section` : 'Open the Memory Book cover');
    button.addEventListener('click', () => {
      SFX.click();
      showPassportPage(number ? pages.findIndex(page => page.type === 'divider' && page.number === number) : 0);
    });
    tabs.appendChild(button);
  }
  pages.forEach((page, idx) => {
    const card = el('article', 'passport-page');
    const pageNumber = `Page ${idx + 1} of ${pages.length}`;
    card.dataset.pageType = page.type;
    if (page.number) card.dataset.chapter = page.number;
    if (page.type === 'cover') {
      card.classList.add('memory-cover');
      card.innerHTML = `<span class="memory-cover-doodles" aria-hidden="true">🌙 ✦ 🦆</span>
        <div class="memory-cover-label"><span class="memory-kicker">A little place for big memories</span>
          <h3>Lune’s<br>Memory Book</h3><p>Friends, funny moments<br>and things worth keeping.</p></div>
        <span class="memory-cover-note">Paper pages. A little starlight.</span>`;
    } else if (page.type === 'divider') {
      card.classList.add('memory-divider');
      card.innerHTML = `<div class="passport-page-top"><span>Chapter ${page.number}</span><span>${pageNumber}</span></div>
        <div class="memory-divider-doodle" aria-hidden="true">${page.visible ? memoryChapterIcons[page.number] || '✦' : '☆'}</div>
        <h3>${page.visible ? page.chapter.title : 'A chapter still to discover'}</h3>
        <p class="memory-handwritten">${page.visible ? 'A fresh section for our little adventures.' : 'Blank paper, ready for another day.'}</p>
        <span class="memory-divider-note">${page.visible ? 'Turn the page for episode stickers →' : 'The story will lead us here when it’s time.'}</span>`;
    } else if (page.type === 'episode') {
      const { episode, stamped, visible } = page;
      card.classList.add('episode-page');
      card.dataset.episode = episode.id;
      if (stamped) card.classList.add('earned');
      if (!visible) card.classList.add('locked');
      const detail = stamped
        ? (episode.passport || episode.desc || 'A memory from the sleepover.')
        : visible ? 'There’s room here for a little memory. Visit this episode to add its sticker.' : 'A blank page for an adventure still to come.';
      const picture = stamped && memoryPictures[episode.id];
      card.innerHTML = `
        <div class="passport-page-top"><span>Chapter ${episode.chapter} · A little memory</span><span>${pageNumber}</span></div>
        <div class="passport-page-title">
          <span class="passport-page-emoji">${visible ? episode.emoji : '🔒'}</span>
          <span><b>${visible ? episode.name : '???'}</b><small>${stamped ? 'STICKER COLLECTED' : visible ? 'A MEMORY TO MAKE' : 'STILL TO DISCOVER'}</small></span>
        </div>
        <figure class="memory-picture${stamped ? '' : ' memory-picture-blank'}">
          <div class="memory-illustration"><span aria-hidden="true">${stamped ? episode.emoji : '✦'}</span>
          ${picture ? `<img src="assets/characters/${picture}.jpg" alt="Illustration for ${episode.name}" loading="lazy" onerror="this.hidden=true">` : ''}</div>
          <figcaption>${stamped ? 'A little illustration to keep' : 'An illustration will go here'}</figcaption>
        </figure>
        <div class="memory-page-bottom">
        <p class="passport-detail">${detail}</p>
        <div class="passport-stamp${stamped ? ' earned' : ''}" aria-hidden="true">
          <span class="stamp-icon">${stamped ? episode.emoji : '☆'}</span>
          <span>${stamped ? 'MEMORY<br>KEPT' : 'STICKER<br>GOES HERE'}</span>
        </div></div>`;
    } else {
      card.classList.add('chapter-page');
      if (page.finished) card.classList.add('earned');
      const detail = page.finished
        ? (page.chapter.passport || 'This chapter is complete.')
        : `${page.doneCount} of ${page.total} chapter memories collected. This celebration page will fill in when the chapter is complete.`;
      card.innerHTML = `
        <div class="passport-page-top"><span>Chapter ${page.number} · Celebration page</span><span>${pageNumber}</span></div>
        <div class="passport-page-title">
          <span class="passport-page-emoji">${page.finished ? '✅' : '☆'}</span>
          <span><b>${page.visible ? page.chapter.title : 'A chapter still to discover'}</b><small>${page.finished ? 'CHAPTER COMPLETE' : 'MORE MEMORIES TO MAKE'}</small></span>
        </div>
        <p class="passport-detail">${detail}</p>
        <div class="chapter-stamp${page.finished ? ' earned' : ''}" aria-hidden="true">
          <span class="memory-chapter-star">${page.finished ? memoryChapterIcons[page.number] || '🌟' : '☆'}</span>
          <span class="chapter-stamp-num">CH. ${page.number}</span>
          <span>${page.finished ? 'ALL TOGETHER' : 'SAVED A SPACE'}</span>
        </div>`;
    }
    list.appendChild(card);
  });
  showPassportPage(passportPage);
}
function renderBag() {
  const list = $('#bag-list'); list.innerHTML = '';
  const entries = Object.entries(S.inventory).filter(([id, n]) => n > 0 && ITEMS[id]);
  if (!entries.length) { list.innerHTML = '<p style="opacity:.8">No keepsakes yet. Explore an episode to find your first one!</p>'; }
  for (const [id, n] of entries) {
    const it = ITEMS[id];
    const picture = { silverMoonKey: 'moon-key', moonkey: 'moon-lock-key', castleCard: 'slime-castle', songnote: 'letter', coverdemo: 'microphone' }[id];
    const row = el('div', 'bag-row');
    row.innerHTML = `<div class="bag-emoji" aria-hidden="true">${picture ? hubIcon(picture) : it.emoji}</div><div class="bag-info"><div class="bag-name">${it.name}</div><div class="bag-desc">${it.desc}</div></div>${n > 1 ? `<div class="bag-count">×${n}</div>` : ''}`;
    list.appendChild(row);
  }
}

// ═══════════════════════ DIALOGUE ENGINE ═══════════════════════
let skipMode = false;
let advanceResolve = null;
let choiceOpen = false;
let typeTimer = null;
let sceneArt = { card: null, portraits: {} };
let sceneRun = 0;
let choiceResolve = null;

function storyHome() {
  // Invalidate the old async scene before releasing any of its pending waits.
  // Keep its existing checkpoint, including an already-selected NPC reply.
  sceneRun++;
  clearInterval(typeTimer);
  const text = $('#dlg-text');
  if (text._skip) { const finish = text._skip; text._skip = null; finish(); }
  if (advanceResolve) { const finish = advanceResolve; advanceResolve = null; finish(); }
  if (choiceResolve) { const finish = choiceResolve; choiceResolve = null; finish(null); }
  choiceOpen = false;
  skipMode = false;
  $('#dlg-choices').classList.add('hidden');
  $('#dlg-choices').innerHTML = '';
  $('.dlg-portraits').classList.remove('choosing');
  $('#dlg-skip').classList.add('hidden');
  renderSceneArt(null, 0);
  saveGame(true);
  refreshContinueButton();
  updateBlooperCounters();
  SFX.click();
  showScreen('screen-title');
  $('#btn-continue').focus();
}

function renderSceneArt(id, index, speech = null) {
  const _d = typeof document !== 'undefined' ? document : (typeof window !== 'undefined' ? window.document : null);
  const box = _d && _d.querySelector('#dlg-art');
  if (!box) return;
  sceneArt = window.LUNE_SCENE_ART.get(id, index, S.flags, S.progress, speech);
  const image = box.querySelector('#dlg-art-image');
  box.classList.toggle('hidden', !sceneArt.card);
  if (sceneArt.card) {
    image.alt = sceneArt.card.alt;
    image.onerror = () => { box.classList.add('hidden'); };
    image.src = sceneArt.card.src;
  } else {
    image.removeAttribute('src');
    image.alt = '';
  }
}

function setDlgBg(name) {
  const bg = $('#dlg-bg'); if (!bg) return;
  const file = /\.(jpg|png|webp|svg)$/.test(name) ? name : `${name}.jpg`;
  bg.style.backgroundImage = `url('assets/bg/${file}')`;
  bg.dataset.background = file.replace(/\.[^.]+$/, '');
  bg.classList.toggle('dry-castle-view', bg.dataset.background === 'secret_room'
    && S?.progress?.sceneId === 'pillowfort' && !S.flags.originCastleSlide);
  // The full room illustration includes a slide. Use its left-side room view
  // during this reveal when the player's earlier castle choice was dry/unknown.
  $('#dlg-bg').classList.toggle('dry-castle-view', $('#dlg-bg').dataset.background === 'secret_room'
    && S?.progress?.sceneId === 'pillowfort' && !S.flags.originCastleSlide);
}

function waitForAdvance() {
  return new Promise(resolve => { advanceResolve = resolve; $('#dlg-next').style.visibility = 'visible'; });
}
function advanceDialogue() {
  if (settingsOpen()) return;
  if (choiceOpen) return;
  if (advanceResolve) { SFX.blip(); const r = advanceResolve; advanceResolve = null; $('#dlg-next').style.visibility = 'hidden'; r(); }
}

async function sayStep(st) {
  const run = sceneRun;
  const narrator = st.say === 'narrator';
  const c = narrator ? { name:'STORY', color:'#ffd94a' } : CHARACTERS[st.say];
  if (!c) throw new Error(`Unknown speaker: ${st.say}`);
  const img = $('#dlg-portrait');
  img.style.visibility = narrator ? 'hidden' : 'visible';
  if (!narrator) {
    img.src = sceneArt.portraits[st.say]?.src || c.img;
    img.alt = sceneArt.portraits[st.say]?.alt || c.name;
    img.style.setProperty('--portrait-color', c.color);
    img.onerror = () => { img.onerror = null; img.src = 'assets/characters/bworple.jpg'; };
  }
  img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
  const nameEl = $('#dlg-name');
  nameEl.textContent = c.name + (st.variant === 'original' ? ' · ORIGINAL' : st.variant === 'alternate' ? ' · ALTERNATE' : '');
  nameEl.style.background = c.color;
  nameEl.style.color = '#241645';

  const textEl = $('#dlg-text');
  const full = st.text;
  $('#dlg-next').style.visibility = 'hidden';
  if (skipMode) { textEl.textContent = full; await wait(120); return; }
  clearInterval(typeTimer);
  textEl.textContent = '';
  let i = 0;
  if (settings.instantText) textEl.textContent = full;
  else await new Promise(resolve => {
    typeTimer = setInterval(() => {
      i += 1; textEl.textContent = full.slice(0, i);
      if (i % 3 === 0) SFX.blip();
      if (i >= full.length) { clearInterval(typeTimer); textEl._skip = null; resolve(); }
    }, 16);
    textEl._skip = () => { clearInterval(typeTimer); textEl.textContent = full; resolve(); };
  });
  if (run !== sceneRun) return;
  await waitForAdvance();
}

function choiceStep(options) {
  const _port = (typeof window !== 'undefined' && window && window.document) ? window.document : (typeof document !== 'undefined' ? document : null);
  if (!_port) return 0;
  const run = sceneRun;
  choiceOpen = true;
  const _portBox = (window && window.document) ? window.document.querySelector('.dlg-portraits') : null;
  if (_portBox) _portBox.classList.add('choosing');
  const portrait = (window && window.document) ? window.document.querySelector('#dlg-portrait') : null;
  if (portrait) {
    portrait.style.visibility = 'visible';
    portrait.src = sceneArt.portraits.lune?.src || CHARACTERS.lune.img;
    portrait.alt = sceneArt.portraits.lune?.alt || CHARACTERS.lune.name;
    portrait.style.setProperty('--portrait-color', CHARACTERS.lune.color);
    portrait.onerror = () => { portrait.onerror = null; portrait.src = CHARACTERS.lune.img; };
  }
  const _name = (window && window.document) ? window.document.querySelector('#dlg-name') : null;
  if (_name) { _name.textContent = 'LUNE — YOUR CHOICE'; _name.style.background = CHARACTERS.lune.color; }
  const _next = (window && window.document) ? window.document.querySelector('#dlg-next') : null;
  if (_next) _next.style.visibility = 'hidden';
  const box = (window && window.document) ? window.document.querySelector('#dlg-choices') : null;
  if (box) { box.innerHTML = ''; box.classList.remove('hidden'); }
  return new Promise(resolve => {
    choiceResolve = resolve;
    options.forEach((opt, idx) => {
      const btn = el('button', 'choice-btn');
      if (opt.optionId) btn.dataset.optionId = opt.optionId;
      if (opt.variant) {
        const badge = el('span', 'choice-source');
        badge.textContent = opt.variant === 'original' ? 'Original · from Kaidon’s chat' : 'Alternate · adapted for this scene';
        btn.appendChild(badge);
        btn.dataset.variant = opt.variant;
      }
      btn.appendChild(document.createTextNode((opt.variant ? '\n' : '') + opt.label));
      btn.addEventListener('click', () => {
        if (run !== sceneRun) return;
        choiceResolve = null;
        SFX.click(); choiceOpen = false;
        const bp = (window && window.document) ? window.document.querySelector('.dlg-portraits') : null;
        if (bp) bp.classList.remove('choosing');
        const cb = (window && window.document) ? window.document.querySelector('#dlg-choices') : null;
        if (cb) { cb.classList.add('hidden'); cb.innerHTML = ''; }
        resolve(idx);
      });
      box.appendChild(btn);
    });
  });
}

function doEffect(e) {
  switch (e.do) {
    case 'join': {
      const id = e.id;
      if (!S.joined.includes(id)) {
        S.joined.push(id);
        const c = CHARACTERS[id];
        SFX.sparkle(); toast(`💛 ${c.name} is now a friend of the fort!`, 3000, true);
        saveGame(true);
      }
      break;
    }
    case 'give': gainItem(e.item, e.n || 1); break;
    case 'take': { const it = ITEMS[e.item]; S.inventory[e.item] = Math.max(0, (S.inventory[e.item] || 0) - (e.n || 1)); if (it) toast(`${it.emoji} Used 1 ${it.name}.`); break; }
    case 'blooper': gainBlooper(e.id); break;
    case 'flag': S.flags[e.key] = e.value !== undefined ? e.value : true; break;
    case 'chapter': S.chapter = e.n; saveGame(true); break;
    case 'done':
      if (!S.done[e.id]) {
        S.done[e.id] = true;
        const episode = EPISODES.find(part => part.id === e.id);
        if (episode?.keepsake) gainItem(episode.keepsake);
        SFX.sparkle(); toast(`📒 ${episode?.name || 'Episode'} memory added to your Memory Book!`, 3500, true);
        saveGame(true); checkChapterProgression();
      }
      break;
    case 'save': saveGame(true); break;
  }
}

const DBG = () => { try { return window.localStorage.getItem('luneDebug') === '1'; } catch (e) { return false; } };
async function runScene(id, startIndex = 0) {
  const episode = EPISODES.find(e => e.id === id);
  const steps = episode ? episode.steps : SCENES[id];
  if (!steps) { console.error('Missing scene', id); returnToHub(); return; }
  const run = ++sceneRun;
  skipMode = false;
  renderSceneArt(null, 0);
  showScreen('screen-dialogue');
  const bp0 = (window && window.document) ? window.document.querySelector('.dlg-portraits') : null;
  if (bp0) bp0.classList.remove('choosing');
  const cb0 = (window && window.document) ? window.document.querySelector('#dlg-choices') : null;
  if (cb0) cb0.classList.add('hidden');
  $('#dlg-skip').classList.remove('hidden');
  if (episode && S.done[id]) {
    S.progress = null; saveGame(true);
    setDlgBg(episode.steps.find(s => s.bg)?.bg || 'pillowfort');
    await sayStep({say:'narrator', text:episode.revisit || `You visit ${episode.name} again. Everyone is happy to see you.`});
    if (run !== sceneRun) return;
    const _hideskip = $('#dlg-skip'); if (_hideskip) _hideskip.classList.add('hidden');
    returnToHub();
    return;
  }
  if (!S.progress || S.progress.sceneId !== id || S.progress.index !== startIndex) {
    S.progress = sceneCheckpoint(id, startIndex);
    saveGame(true);
  }
  // Restore the correct background even when continuing in the middle of a scene.
  const background = steps.slice(0, startIndex + 1).reverse().find(st => st.bg);
  setDlgBg(background?.bg || 'pillowfort');
  for (let si = startIndex; si < steps.length; si++) {
    const st = steps[si];
    if (DBG()) console.log('[scene-step]', si, JSON.stringify(st).slice(0,120));
    if (st.ifFlag && !S.flags[st.ifFlag]) { S.progress = sceneCheckpoint(id, si + 1); saveGame(true); continue; }
    const skipStep = st.unless && S.flags[st.unless];
    if (skipStep) { S.progress = sceneCheckpoint(id, si + 1); saveGame(true); continue; }
    renderSceneArt(id, si, st);
    if (st.bg) setDlgBg(st.bg);
    else if (st.say) await sayStep(st);
    else if (st.narrator) await sayStep({say:'narrator', text:st.narrator});
    else if (st.toast) toast(st.toast);
    else if (st.do) { console.log('CALLING DO', st.do, e => ''); doEffect(st); console.log('AFTER DO', S.done && S.done[st.id]); }
    else if (st.choice) {
      const replying = S.progress?.phase === 'reply' && S.progress.index === si;
      const idx = replying ? S.progress.selection : await choiceStep(st.choice);
      if (run !== sceneRun) return;
      const opt = st.choice[idx];
      if (!replying) {
        for (const e of opt.effects || []) doEffect(e);
        // A choice's effects are committed before its optional spoken response.
        S.progress = sceneCheckpoint(id, si, { phase:'reply', selection:idx });
        saveGame(true);
      }
      if (opt.reply) {
        renderSceneArt(id, si, opt.reply);
        await sayStep(opt.reply);
      }
    }
    else if (st.end) break;
    if (run !== sceneRun) return;
    S.progress = sceneCheckpoint(id, si + 1);
    saveGame(true);
  }
  const _finalskip = $('#dlg-skip'); if (_finalskip) _finalskip.classList.add('hidden');
  returnToHub();
}
function returnToHub() {
  try { renderSceneArt(null, 0); } catch (e) {}
  if (S.progress) { try { S.progress = null; saveGame(true); } catch (e) {} }
  try { SFX.click(); } catch (e) {}
  try { showScreen('screen-hub'); renderHub(); } catch (e) {}
}

// dialogue click / keys
$('#screen-dialogue').addEventListener('click', (ev) => {
  if (ev.target.closest('.dlg-choices') || ev.target.closest('#dlg-skip') || ev.target.closest('#dlg-home')) return;
  const textEl = $('#dlg-text');
  if (textEl._skip) { const s = textEl._skip; textEl._skip = null; s(); return; }
  advanceDialogue();
});
$('#dlg-skip').addEventListener('click', () => { skipMode = true; SFX.click(); toast('⏩ Skipping dialogue…'); if ($('#dlg-text')._skip) { const s = $('#dlg-text')._skip; $('#dlg-text')._skip = null; s(); } advanceDialogue(); });
$('#dlg-home').addEventListener('click', storyHome);

// ═══════════════════════ BLOOPER REEL ═══════════════════════
function renderBloopers() {
  $('#blooper-count').textContent = `${availableBlooperCount()}/${availableBloopers().length}`;
  const grid = $('#blooper-grid'); grid.innerHTML = '';
  for (const b of BLOOPERS) {
    const got = S && S.bloopers.includes(b.id);
    const card = el('div', 'blooper-card');
    card.innerHTML = `<div class="blooper-art ${got ? '' : 'locked'}"><span class="blooper-num">#${String(b.num).padStart(3, '0')}</span>${got ? b.emoji : '🔒'}</div>
      <div class="blooper-body"><div class="blooper-title">${got ? b.title : b.comingSoon ? 'Coming in a future episode' : '???'}</div>
      <div class="blooper-desc">${got ? b.desc : b.comingSoon ? 'Kaidon has not finished this part of the story yet.' : 'Flop-O-Matic footage not yet recovered… keep exploring the fort!'}</div></div>`;
    grid.appendChild(card);
  }
}

// ═══════════════════════ GLOBAL INPUT & INIT ═══════════════════════
document.addEventListener('keydown', (e) => {
  if (settingsOpen()) {
    if (e.key === 'Escape') { e.preventDefault(); closeSettings(); }
    else if (e.key === 'Tab') {
      const controls = [...$('#settings-modal').querySelectorAll('input, button')];
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return; // Space/Enter operate settings controls, never the dialogue underneath.
  }
  if (!$('#character-modal').classList.contains('hidden')) {
    if (e.key === 'Escape') { e.preventDefault(); closeCharacterCard(); }
    else trapModalFocus(e, $('#character-modal'));
    return;
  }
  if (hubSheet) {
    if (e.key === 'Escape') { e.preventDefault(); closeHubSheet(); }
    else trapModalFocus(e, $('#' + hubSheet));
    return;
  }
  if (!$('#passport-modal').classList.contains('hidden')) {
    if (e.key === 'Escape') { e.preventDefault(); closePassport(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      showPassportPage(passportPage + (e.key === 'ArrowRight' ? 1 : -1));
    } else if (e.key === 'Tab') {
      const controls = [...$('#passport-modal').querySelectorAll('button:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return;
  }
  if (e.key === ' ' || e.key === 'Enter') {
    if (e.target.closest('button, input, select, textarea, a')) return;
    if ($('#screen-dialogue').classList.contains('active')) { e.preventDefault(); $('#screen-dialogue').click(); }
  } else if (e.key === 'Escape') {
    if (!$('#character-modal').classList.contains('hidden')) closeCharacterCard();
    for (const m of ['#howto-modal', '#bag-modal']) $(m).classList.add('hidden');
  }
});

S = defaultState(); // until New Game / Continue is chosen
wireTitle(); wireModals(); wireSettings(); updateBlooperCounters();
showScreen('screen-title');
