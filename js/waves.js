/* ══════════════════════════════════════════════════════════
   waves.js — Sistema de 5 oleadas por nivel
   Oleada 1 = fácil, Oleada 5 = boss
   ══════════════════════════════════════════════════════════ */
'use strict';

const WaveSystem = {
  // Estado actual
  currentWave: 0,   // 1..5
  spawnQueue:  [],  // enemigos pendientes de spawn
  spawnTimer:  0,
  waveCleared: false,
  allWavesCleared: false,
  spawnInterval: 0, // ms entre spawns

  reset() {
    this.currentWave     = 0;
    this.spawnQueue      = [];
    this.spawnTimer      = 0;
    this.waveCleared     = false;
    this.allWavesCleared = false;
  },

  /* Inicia una oleada (waveIndex 0..4) */
  startWave(waveIndex, episode, levelIndex) {
    this.currentWave = waveIndex + 1;
    this.waveCleared = false;
    this.spawnQueue  = [];
    this.spawnTimer  = 0;

    const isBoss = waveIndex === 4; // oleada 5 = boss
    if (isBoss) {
      // La cola de boss es manejada por Game.spawnBoss()
      return { isBoss: true };
    }

    // Cantidad de enemigos según oleada y nivel
    const count = CFG.WAVE_SCALE.count[waveIndex]
                + Math.floor(levelIndex / 3)
                + (episode - 1) * 2;

    // Pool de tipos para este episodio
    const pool = CFG.EP_ENEMIES[episode - 1];

    // Ola 1: solo zombie/bat
    // Ola 2..4: mezcla progresiva del pool
    for (let i = 0; i < count; i++) {
      let type;
      if (waveIndex === 0) {
        type = pool[0]; // más fácil
      } else {
        // Más variedad en oleadas avanzadas
        const maxTypes = Math.min(pool.length, 1 + waveIndex);
        type = pool[Math.floor(Math.random() * maxTypes)];
      }
      this.spawnQueue.push(type);
    }

    // Intervalo entre spawns (más rápido en oleadas difíciles)
    this.spawnInterval = Math.max(400, 1600 - waveIndex * 280 - levelIndex * 30);

    return { isBoss: false, count };
  },

  /* Llamado cada frame; devuelve el tipo a spawnear o null */
  tick(dt, enemiesAlive) {
    if (this.spawnQueue.length === 0) {
      // Todos spawneados; espera a que mueran
      if (enemiesAlive === 0 && !this.waveCleared) {
        this.waveCleared = true;
      }
      return null;
    }

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      return this.spawnQueue.shift();
    }
    return null;
  },

  isLastWave() { return this.currentWave === 5; },
};
