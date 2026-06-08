/* ══════════════════════════════════════════════════════════
   hud.js — Gestión del HUD y pantallas overlay
   ══════════════════════════════════════════════════════════ */
'use strict';

const HUD = {
  /* ─── HELPERS DOM ─────────────────────────────────── */
  _el(id) { return document.getElementById(id); },

  /* ─── VIDA ────────────────────────────────────────── */
  updateHealth(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp) * 100;
    this._el('healthFill').style.width = pct + '%';
    this._el('healthValue').textContent = Math.max(0, Math.ceil(hp));
    // Cambio de color al bajar la vida
    const fill = this._el('healthFill');
    if (pct < 25) fill.style.background = 'linear-gradient(90deg,#5a0000,#ff2020)';
    else if (pct < 50) fill.style.background = 'linear-gradient(90deg,#8b0000,#ff6600)';
    else fill.style.background = 'linear-gradient(90deg,var(--blood),var(--gore))';
  },

  /* ─── OLEADA / EPISODIO ───────────────────────────── */
  updateWave(wave, episode, levelIndex) {
    this._el('waveValue').textContent = wave;
    this._el('episodeLabel').textContent =
      `EP ${episode} · NIV ${levelIndex + 1}`;
  },

  /* ─── PUNTUACIÓN ──────────────────────────────────── */
  updateScore(score) {
    this._el('scoreValue').textContent = score.toLocaleString();
  },

  /* ─── BOSS ────────────────────────────────────────── */
  showBossBar(name) {
    const bar = this._el('bossHPBar');
    bar.classList.remove('hidden');
    this._el('bossName').textContent = name;
    this._el('bossFill').style.width = '100%';
  },
  hideBossBar() {
    this._el('bossHPBar').classList.add('hidden');
  },
  updateBossHP(hp, maxHp) {
    const pct = Math.max(0, hp / maxHp) * 100;
    this._el('bossFill').style.width = pct + '%';
  },

  /* ─── FLASH DE IMPACTO ────────────────────────────── */
  flashHit() {
    const ov = this._el('hitOverlay');
    ov.style.opacity = '1';
    clearTimeout(this._hitTimeout);
    this._hitTimeout = setTimeout(() => { ov.style.opacity = '0'; }, 90);
  },

  /* ─── BANNER DE OLEADA ────────────────────────────── */
  showWaveBanner(text) {
    const b = this._el('waveBanner');
    b.textContent = text;
    b.classList.add('show');
    clearTimeout(this._bannerTimeout);
    this._bannerTimeout = setTimeout(() => b.classList.remove('show'), 2000);
  },

  /* ─── KILL FEED ───────────────────────────────────── */
  addKillFeed(type) {
    const feed = this._el('killFeed');
    const names = {
      zombie:'Zombie', skeleton:'Esqueleto', bat:'Murciélago',
      ghost:'Fantasma', fly:'Mosca',
    };
    const el = document.createElement('div');
    el.className = 'kill-entry';
    el.textContent = `⚰ ${names[type] || type} eliminado`;
    feed.appendChild(el);
    setTimeout(() => el.remove(), 2000);
    while (feed.children.length > 5) feed.firstChild.remove();
  },

  /* ─── PANTALLAS ───────────────────────────────────── */
  _screens: ['screenMenu','screenPause','screenLevelClear','screenEpClear','screenDead'],

  showScreen(id) {
    this._screens.forEach(s => {
      const el = this._el(s);
      if (el) el.classList.add('hidden');
    });
    if (id) {
      const el = this._el(id);
      if (el) el.classList.remove('hidden');
    }
    // Mostrar/ocultar HUD y hint
    const inGame = !id;
    const hud = this._el('hud');
    if (hud) hud.classList.toggle('hidden', !inGame);
  },

  /* ─── HUD VISIBLE ─────────────────────────────────── */
  showHUD() {
    const hud = this._el('hud');
    if (hud) hud.classList.remove('hidden');
  },

  /* ─── PANTALLA DE MUERTE ──────────────────────────── */
  showDeadScreen(score, wave, episode, levelIndex, kills, best) {
    const stats = this._el('deadStats');
    stats.innerHTML = `
      <div class="stat-item"><div class="stat-num">${score.toLocaleString()}</div><div class="stat-name">Puntos</div></div>
      <div class="stat-item"><div class="stat-num">${wave}</div><div class="stat-name">Oleada</div></div>
      <div class="stat-item"><div class="stat-num">${kills}</div><div class="stat-name">Bajas</div></div>
      <div class="stat-item"><div class="stat-num">${best.toLocaleString()}</div><div class="stat-name">Récord</div></div>
    `;
    this.showScreen('screenDead');
  },

  /* ─── PANTALLA NIVEL COMPLETADO ───────────────────── */
  showLevelClear(score, kills, levelIndex, episode) {
    const stats = this._el('levelStats');
    stats.innerHTML = `
      <div class="stat-item"><div class="stat-num">${score.toLocaleString()}</div><div class="stat-name">Puntos</div></div>
      <div class="stat-item"><div class="stat-num">${kills}</div><div class="stat-name">Bajas</div></div>
      <div class="stat-item"><div class="stat-num">EP ${episode} · NIV ${levelIndex+1}</div><div class="stat-name">Completado</div></div>
    `;
    this.showScreen('screenLevelClear');
  },

  /* ─── PANTALLA EPISODIO COMPLETADO ───────────────── */
  showEpClear(episode) {
    const titles = ['I — EL CEMENTERIO','II — LA CRIPTA','III — EL INFIERNO'];
    this._el('epClearTitle').textContent = `EPISODIO ${titles[episode-1] || episode}\nCOMPLETADO`;
    const btn = this._el('btnNextEp');
    if (episode >= 3) {
      btn.textContent = 'JUEGO COMPLETADO';
      btn.onclick = () => HUD.showScreen('screenMenu');
    }
    this.showScreen('screenEpClear');
  },

  /* ─── COMBO DISPLAY ───────────────────────────────── */
  showCombo(n) {
    let el = document.getElementById('comboDisplay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'comboDisplay';
      document.body.appendChild(el);
    }
    if (n >= 3) {
      el.textContent = `${n}x COMBO!`;
      el.classList.add('show');
      clearTimeout(this._comboTimeout);
      this._comboTimeout = setTimeout(() => el.classList.remove('show'), 1200);
    } else {
      el.classList.remove('show');
    }
  },

  /* ─── MENÚ: EP DESBLOQUEADOS ──────────────────────── */
  updateEpisodeSelect(unlockedEp) {
    for (let i = 2; i <= 3; i++) {
      const btn = this._el(`ep${i}Btn`);
      if (btn) btn.disabled = i > unlockedEp;
    }
    const best = parseInt(localStorage.getItem('zombieBest') || '0');
    this._el('bestScoreMenu').textContent = `RÉCORD: ${best.toLocaleString()}`;
  },
};
