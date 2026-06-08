/* ══════════════════════════════════════════════════════════
   levels.js — Generador de plataformas por episodio/nivel
   ══════════════════════════════════════════════════════════ */
'use strict';

const Levels = {
  /*
   * Devuelve { platforms, width, groundY }
   * platforms: Array de { x, y, w, h }
   * width: ancho total del nivel (scroll horizontal)
   * groundY: Y del suelo principal
   */
  generate(episode, levelIndex) {
    const ep = episode - 1;            // 0-based
    const lv = levelIndex;             // 0-based (0..14)
    const H  = CFG.H;

    // El nivel se hace más ancho y complejo a medida que avanza
    const levelWidth = 1600 + lv * 120 + ep * 400;
    const groundY    = H - 60;
    const platforms  = [];

    // Suelo continuo (dividido en segmentos para detección)
    for (let gx = 0; gx < levelWidth; gx += 200) {
      platforms.push({ x: gx, y: groundY, w: 200, h: 60 });
    }

    // Huecos en el suelo (más difícil = más huecos)
    const gapCount = 2 + ep * 2 + Math.floor(lv / 4);
    const usedGaps = new Set();
    for (let g = 0; g < gapCount; g++) {
      const gapX = 300 + Math.floor(Math.random() * (levelWidth - 600) / 200) * 200;
      if (!usedGaps.has(gapX)) {
        usedGaps.add(gapX);
        // Elimina el segmento de suelo en ese punto
        const idx = platforms.findIndex(p => p.y === groundY && p.x === gapX);
        if (idx >= 0) platforms.splice(idx, 1);
        // Hueco más ancho en episodios avanzados
        if (ep >= 1) {
          const idx2 = platforms.findIndex(p => p.y === groundY && p.x === gapX + 200);
          if (idx2 >= 0) platforms.splice(idx2, 1);
        }
      }
    }

    // Plataformas flotantes — layout por episodio
    const layouts = [
      _layoutCemetery,
      _layoutCrypt,
      _layoutHell,
    ];
    layouts[ep](platforms, levelWidth, groundY, lv);

    return { platforms, width: levelWidth, groundY };
  },
};

/* ─── LAYOUT EP1: CEMENTERIO ──────────────────────────── */
function _layoutCemetery(platforms, W, groundY, lv) {
  // Lápidas como plataformas + escalones suaves
  const rows = [
    groundY - 90,
    groundY - 170,
    groundY - 240,
  ];
  const step = 160 + lv * 8;

  for (let x = 250; x < W - 300; x += step) {
    const rowY = rows[Math.floor(Math.random() * (lv < 5 ? 1 : lv < 10 ? 2 : 3))];
    const pw = 80 + Math.floor(Math.random() * 80);
    platforms.push({ x, y: rowY, w: pw, h: 14 });

    // Chance de doble plataforma
    if (lv >= 5 && Math.random() < 0.4) {
      platforms.push({ x: x + pw + 40, y: rowY - 60, w: 60, h: 14 });
    }
  }
}

/* ─── LAYOUT EP2: CRIPTA ──────────────────────────────── */
function _layoutCrypt(platforms, W, groundY, lv) {
  // Escalones estilo cripta, más verticales
  const step = 140 + lv * 6;
  let lastY = groundY - 100;

  for (let x = 200; x < W - 200; x += step) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    lastY = Math.max(groundY - 280, Math.min(groundY - 80, lastY + dir * 70));
    const pw = 70 + Math.floor(Math.random() * 60);
    platforms.push({ x, y: lastY, w: pw, h: 14 });

    // Pilares laterales
    if (lv >= 3 && Math.random() < 0.3) {
      platforms.push({ x: x - 20, y: groundY, w: 20, h: groundY - lastY });
    }

    // Plataforma volante ep2 lvl 8+
    if (lv >= 8 && Math.random() < 0.4) {
      platforms.push({ x: x + pw/2 - 30, y: lastY - 80, w: 60, h: 14 });
    }
  }
}

/* ─── LAYOUT EP3: INFIERNO ────────────────────────────── */
function _layoutHell(platforms, W, groundY, lv) {
  // Plataformas angostas y con grandes saltos
  const step = 120 + lv * 5;
  let lastY = groundY - 120;

  for (let x = 180; x < W - 180; x += step) {
    const dir = Math.random() < 0.45 ? -1 : 1;
    lastY = Math.max(groundY - 320, Math.min(groundY - 70, lastY + dir * 90));
    const pw = Math.max(40, 90 - lv * 3); // más angostas con el nivel
    platforms.push({ x, y: lastY, w: pw, h: 14 });

    // Doble salto requerido: plataforma alta
    if (lv >= 6 && Math.random() < 0.5) {
      platforms.push({ x: x + pw + 30, y: lastY - 110, w: Math.max(36, pw - 10), h: 14 });
    }

    // Paredes flotantes (obstáculos)
    if (lv >= 10 && Math.random() < 0.35) {
      platforms.push({ x: x + pw/2 - 8, y: lastY - 60, w: 16, h: 55 });
    }
  }
}
