/* ══════════════════════════════════════════════════════════
   config.js — Constantes globales y tuning del juego
   ══════════════════════════════════════════════════════════ */
'use strict';

const CFG = {
  // Canvas
  W: 800,
  H: 400,

  // Física
  GRAVITY:    0.55,
  MAX_FALL:   14,
  FRICTION:   0.78,

  // Cámara
  CAM_EASE:   0.12,

  // Jugador
  PLAYER: {
    W: 28, H: 46,
    SPEED:       3.8,
    JUMP_FORCE: -13,
    DOUBLE_JUMP_FORCE: -11,
    MAX_HP:     100,
    INVINCIBLE_MS: 600,
    // Hitboxes de ataques (relativo al centro del jugador)
    PUNCH_BOX:  { offX: 34, offY: -8, w: 36, h: 22 },
    KICK_BOX:   { offX: 38, offY:  6, w: 42, h: 20 },
    JUMP_BOX:   { offX: 28, offY: -20, w: 34, h: 30 },
    // Daños
    PUNCH_DMG:  18,
    KICK_DMG:   26,
    JUMP_DMG:   34,
    // Cooldowns (ms)
    PUNCH_CD:   280,
    KICK_CD:    380,
    JUMP_ATK_CD:300,
    // Knockback
    PUNCH_KB:   5,
    KICK_KB:    8,
    JUMP_KB:    7,
  },

  // Episodios y niveles
  EPISODES: 3,
  LEVELS_PER_EP: 15,
  WAVES_PER_LEVEL: 5,

  // Colores de episodio (fondo dominante)
  EP_PALETTE: [
    // Episodio 1 — Cementerio
    { sky: '#1a1a2e', ground: '#2d4a1e', accent: '#4a7a3a', fog: 'rgba(100,120,80,0.18)' },
    // Episodio 2 — Cripta
    { sky: '#0d0d1a', ground: '#1a0d2e', accent: '#4a1a6a', fog: 'rgba(80,40,120,0.2)' },
    // Episodio 3 — Infierno
    { sky: '#1a0000', ground: '#3a0800', accent: '#8b1a00', fog: 'rgba(200,50,0,0.18)' },
  ],

  // Sprites (colores de rectángulo — sustituibles por imágenes)
  COLORS: {
    // Jugador
    player:       '#e0e0e0',
    playerHead:   '#f0d0b0',
    playerDetail: '#cc0000',
    // Enemigos
    zombie:       '#3a6b2a',
    zombieHead:   '#2a5020',
    skeleton:     '#d4c9a8',
    skeletonHead: '#e8dfca',
    bat:          '#3a1a4a',
    ghost:        'rgba(180,220,255,0.55)',
    fly:          '#2a3a1a',
    flyOrb:       '#88ff44',
    // Bosses
    bossZombie:   '#1a4a10',
    bossSkeleton: '#a89870',
    bossBat:      '#5a1a7a',
    bossGhost:    'rgba(140,180,255,0.7)',
    bossFly:      '#1a2a0a',
    // Plataformas
    platform:     '#3a3a3a',
    platformTop:  '#4a4a4a',
    ground:       '#2a2a2a',
    // Partículas
    blood:        '#8b0000',
    bloodBright:  '#cc2200',
    bone:         '#d4c9a8',
    ectoplasm:    'rgba(140,220,255,0.8)',
    spark:        '#ff8800',
  },

  // Puntuaciones base por enemigo
  SCORE: {
    zombie:   10,
    skeleton: 15,
    bat:      12,
    ghost:    20,
    fly:      18,
    boss:     200,
  },

  // Escalado de dificultad por oleada (multiplicadores)
  WAVE_SCALE: {
    hp:    [1.0, 1.15, 1.35, 1.6,  2.0],   // oleadas 1..5
    speed: [1.0, 1.08, 1.18, 1.30, 1.45],
    count: [3,   5,    7,    9,    0],       // 0 = boss wave
  },

  // Escalado extra por nivel (dentro del episodio, 1..15)
  LEVEL_HP_MULT:    (ep, lv) => 1 + (ep-1)*0.4 + (lv-1)*0.06,
  LEVEL_SPEED_MULT: (ep, lv) => 1 + (ep-1)*0.2 + (lv-1)*0.02,

  // Pools de enemigos por episodio
  EP_ENEMIES: [
    ['zombie', 'bat'],                        // Ep 1
    ['zombie', 'skeleton', 'bat', 'ghost'],   // Ep 2
    ['zombie', 'skeleton', 'bat', 'ghost', 'fly'], // Ep 3
  ],

  // Boss de cada nivel (índice 0-14 → boss type)
  EPISODE_BOSSES: [
    // Ep 1: alternancia zombie grande / bat grande
    ['bigZombie','bigBat','bigZombie','bigBat','bigZombie',
     'bigBat','bigZombie','bigBat','bigZombie','bigBat',
     'bigZombie','bigBat','bigZombie','bigBat','bigZombie'],
    // Ep 2: esqueleto / fantasma
    ['bigSkeleton','bigGhost','bigSkeleton','bigGhost','bigSkeleton',
     'bigGhost','bigSkeleton','bigGhost','bigSkeleton','bigGhost',
     'bigSkeleton','bigGhost','bigSkeleton','bigGhost','bigSkeleton'],
    // Ep 3: mosca + todos reforzados
    ['bigFly','bigZombie','bigSkeleton','bigFly','bigGhost',
     'bigBat','bigFly','bigZombie','bigSkeleton','bigFly',
     'bigGhost','bigBat','bigFly','bigZombie','bigFly'],
  ],
};
