/* ══════════════════════════════════════════════════════════
   enemies.js — Los 5 tipos de enemigos y su IA
   ══════════════════════════════════════════════════════════ */
'use strict';

/* ─── FACTORY ─────────────────────────────────────────── */
const Enemies = {
  create(type, x, y, episode, levelIndex, waveIndex) {
    const ep = episode - 1;
    const hpMult   = CFG.LEVEL_HP_MULT(episode, levelIndex + 1)
                   * CFG.WAVE_SCALE.hp[waveIndex];
    const spdMult  = CFG.LEVEL_SPEED_MULT(episode, levelIndex + 1)
                   * CFG.WAVE_SCALE.speed[waveIndex];

    const templates = {
      zombie:   { w:26, h:40, hp:60,  spd:1.4, dmg:10, score:CFG.SCORE.zombie   },
      skeleton: { w:22, h:42, hp:45,  spd:1.7, dmg:8,  score:CFG.SCORE.skeleton },
      bat:      { w:28, h:20, hp:35,  spd:2.2, dmg:7,  score:CFG.SCORE.bat,      flying:true },
      ghost:    { w:30, h:36, hp:40,  spd:1.6, dmg:9,  score:CFG.SCORE.ghost,    flying:true, phasing:true },
      fly:      { w:24, h:20, hp:30,  spd:2.0, dmg:6,  score:CFG.SCORE.fly,      flying:true, shoots:true },
    };

    const tmpl = templates[type];
    if (!tmpl) return null;

    return {
      type,
      x, y,
      w: tmpl.w, h: tmpl.h,
      vx: 0, vy: 0,
      hp:    Math.ceil(tmpl.hp  * hpMult),
      maxHp: Math.ceil(tmpl.hp  * hpMult),
      speed: tmpl.spd * spdMult,
      dmg:   Math.ceil(tmpl.dmg * (1 + ep * 0.3)),
      score: tmpl.score + ep * 5 + levelIndex,
      dir: -1,
      frame: 0,
      flying:  !!tmpl.flying,
      phasing: !!tmpl.phasing,
      shoots:  !!tmpl.shoots,

      onGround: false,
      stagger:  0,    // ms de stagger tras recibir golpe
      hitFlash: 0,    // ms de destello blanco

      // IA estado
      aiState:  'patrol',   // patrol | chase | attack | flee | shoot
      aiTimer:  0,
      patrolDir: Math.random() < 0.5 ? 1 : -1,
      patrolTimer: 0,

      // Para mosca: cooldown de disparo
      shootCD: 0,
    };
  },
};

/* ─── ACTUALIZAR TODOS LOS ENEMIGOS ─────────────────────
   orbs: array compartido de proyectiles enemigos
   ─────────────────────────────────────────────────────── */
function updateEnemies(enemies, player, platforms, orbs, dt) {
  const dtS = dt / 16.667;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.frame++;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    if (e.stagger  > 0) e.stagger  -= dt;

    _updateAI(e, player, orbs, dt, dtS);

    if (!e.flying && !e.phasing) {
      // Gravedad
      e.vy += CFG.GRAVITY * dtS;
      if (e.vy > CFG.MAX_FALL) e.vy = CFG.MAX_FALL;
    }

    e.x += e.vx * dtS;
    e.y += e.vy * dtS;

    // Colisiones de plataforma (no fantasmas)
    if (!e.phasing) {
      e.onGround = false;
      EntityCollision.resolve(e, platforms);
    }

    // Si cae al vacío, eliminar
    if (e.y > CFG.H + 200) {
      enemies.splice(i, 1);
      continue;
    }

    // Límites del mapa horizontal (rebota)
    if (e.x < 0) { e.x = 0; e.patrolDir = 1; }
  }
}

/* ─── IA ──────────────────────────────────────────────── */
function _updateAI(e, player, orbs, dt, dtS) {
  if (e.stagger > 0) { e.vx *= 0.7; return; }

  const distToPlayer = _dist(e, player);
  const DETECT = 320;
  const ATTACK = e.w + player.w + 6;

  switch (e.type) {

    case 'zombie':
      // Lento pero persistente. Patrulla y persigue.
      if (distToPlayer < DETECT) {
        e.aiState = 'chase';
        const dx = player.x - e.x;
        e.dir = dx > 0 ? 1 : -1;
        e.vx  = e.dir * e.speed;
      } else {
        _patrol(e, dt);
      }
      break;

    case 'skeleton':
      // Más rápido, intenta mantenerse a distancia media y ataca
      if (distToPlayer < DETECT) {
        const dx = player.x - e.x;
        e.dir = dx > 0 ? 1 : -1;
        if (distToPlayer > ATTACK + 40) {
          e.vx = e.dir * e.speed;
        } else if (distToPlayer < ATTACK - 10) {
          e.vx = -e.dir * e.speed * 0.6; // retrocede un poco
        } else {
          e.vx *= 0.8;
        }
      } else {
        _patrol(e, dt);
      }
      break;

    case 'bat':
      // Vuela en arcos descendentes hacia el jugador
      if (distToPlayer < DETECT + 80) {
        const dx = player.x + player.w/2 - (e.x + e.w/2);
        const dy = player.y - 40 - e.y; // apunta ligeramente arriba
        const mag = Math.hypot(dx, dy) || 1;
        e.vx = (dx / mag) * e.speed;
        e.vy = (dy / mag) * e.speed * 0.7;
        e.dir = dx > 0 ? 1 : -1;
      } else {
        // Orbita
        e.aiTimer += dt;
        e.vx = Math.sin(e.aiTimer * 0.002) * e.speed;
        e.vy = Math.cos(e.aiTimer * 0.002) * e.speed * 0.5;
      }
      break;

    case 'ghost':
      // Se mueve en olas, ignora plataformas
      e.aiTimer += dt;
      if (distToPlayer < DETECT + 100) {
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const mag = Math.hypot(dx, dy) || 1;
        e.vx = (dx / mag) * e.speed + Math.sin(e.aiTimer * 0.003) * 1.5;
        e.vy = (dy / mag) * e.speed * 0.5 + Math.cos(e.aiTimer * 0.002) * 1.5;
        e.dir = dx > 0 ? 1 : -1;
      } else {
        e.vx = Math.sin(e.aiTimer * 0.0015) * e.speed;
        e.vy = Math.cos(e.aiTimer * 0.002) * e.speed * 0.4;
      }
      // Mantener dentro de pantalla verticalmente
      if (e.y < 40)         e.vy = Math.abs(e.vy);
      if (e.y > CFG.H - 80) e.vy = -Math.abs(e.vy);
      break;

    case 'fly':
      // Vuela errático y dispara orbs verdes
      e.aiTimer += dt;
      if (distToPlayer < DETECT + 60) {
        const dx = player.x - e.x;
        const dy = player.y - 80 - e.y;
        const mag = Math.hypot(dx, dy) || 1;
        e.vx = (dx / mag) * e.speed + Math.sin(e.aiTimer * 0.004) * 2;
        e.vy = (dy / mag) * e.speed * 0.4 + Math.sin(e.aiTimer * 0.006) * 1.5;
        e.dir = dx > 0 ? 1 : -1;

        // Disparo
        if (e.shootCD <= 0 && distToPlayer < 300) {
          _shootOrb(e, player, orbs);
          e.shootCD = 1800 + Math.random() * 800;
        }
      } else {
        e.vx = Math.cos(e.aiTimer * 0.002) * e.speed;
        e.vy = Math.sin(e.aiTimer * 0.003) * e.speed * 0.5;
      }
      if (e.shootCD > 0) e.shootCD -= dt;
      if (e.y < 40)         e.vy = Math.abs(e.vy);
      if (e.y > CFG.H - 80) e.vy = -Math.abs(e.vy);
      break;
  }
}

function _patrol(e, dt) {
  e.patrolTimer -= dt;
  if (e.patrolTimer <= 0) {
    e.patrolDir   = -e.patrolDir;
    e.patrolTimer = 1200 + Math.random() * 1000;
  }
  e.vx  = e.patrolDir * e.speed * 0.5;
  e.dir = e.patrolDir;
}

function _shootOrb(e, player, orbs) {
  const dx = (player.x + player.w/2) - (e.x + e.w/2);
  const dy = (player.y + player.h/2) - (e.y + e.h/2);
  const mag = Math.hypot(dx, dy) || 1;
  const speed = 3.5;
  orbs.push(createOrb(
    e.x + e.w / 2,
    e.y + e.h / 2,
    (dx / mag) * speed,
    (dy / mag) * speed,
  ));
}

function _dist(a, b) {
  const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2, by = b.y + b.h / 2;
  return Math.hypot(ax - bx, ay - by);
}

/* ─── ACTUALIZAR ORBS ────────────────────────────────── */
function updateOrbs(orbs, platforms, dt) {
  const dtS = dt / 16.667;
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i];
    o.x    += o.vx * dtS;
    o.y    += o.vy * dtS;
    o.life -= dt;
    o.frame++;

    // Colisión con plataformas
    let hit = false;
    for (const p of platforms) {
      if (o.x > p.x && o.x < p.x + p.w && o.y > p.y && o.y < p.y + p.h) {
        hit = true; break;
      }
    }
    if (hit || o.life <= 0 || o.y > CFG.H + 50) {
      orbs.splice(i, 1);
    }
  }
}
