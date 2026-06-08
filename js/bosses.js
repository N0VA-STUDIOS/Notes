/* ══════════════════════════════════════════════════════════
   bosses.js — Bosses (oleada 5 de cada nivel)
   ══════════════════════════════════════════════════════════ */
'use strict';

const Bosses = {
  create(type, x, y, episode, levelIndex) {
    const ep = episode - 1;
    // Bosses son más grandes y tienen 8x la vida de un enemigo normal
    const hpBase = {
      bigZombie:   400, bigSkeleton: 340, bigBat:    280,
      bigGhost:    320, bigFly:      300,
    }[type] || 400;

    const hpMult = 1 + ep * 0.5 + levelIndex * 0.08;

    const flying   = type === 'bigBat' || type === 'bigGhost' || type === 'bigFly';
    const phasing  = type === 'bigGhost';
    const shoots   = type === 'bigFly' || type === 'bigGhost';

    // Tamaño doble
    const baseW = { bigZombie:52, bigSkeleton:44, bigBat:56, bigGhost:60, bigFly:48 }[type] || 52;
    const baseH = { bigZombie:80, bigSkeleton:84, bigBat:40, bigGhost:72, bigFly:40 }[type] || 80;

    return {
      type,
      x, y,
      w: baseW, h: baseH,
      vx: 0, vy: 0,
      hp:    Math.ceil(hpBase * hpMult),
      maxHp: Math.ceil(hpBase * hpMult),
      speed: 1.6 + ep * 0.2 + levelIndex * 0.03,
      dmg:   18 + ep * 8 + levelIndex * 1.5,
      dir: -1,
      frame: 0,
      flying, phasing, shoots,
      onGround: false,

      // Fases del boss (3 fases según % vida)
      phase: 1,       // 1, 2, 3

      // Patrón de ataque
      aiState: 'approach',
      aiTimer: 0,
      shootCD: 0,
      jumpCD:  0,
      chargeCD: 0,
      rageMode: false,

      stagger:  0,
      hitFlash: 0,

      // Para pantalla de boss
      name: _bossName(type),
    };
  },
};

/* ─── NOMBRES DE BOSS ─────────────────────────────────── */
function _bossName(type) {
  return {
    bigZombie:   '☠ ZOMBI COLOSAL',
    bigSkeleton: '💀 REY ESQUELETO',
    bigBat:      '🦇 MURCIÉLAGO GIGANTE',
    bigGhost:    '👻 SEÑOR FANTASMA',
    bigFly:      '🪰 MOSCA REINA',
  }[type] || 'BOSS';
}

/* ─── ACTUALIZAR BOSS ─────────────────────────────────── */
function updateBoss(boss, player, platforms, orbs, particles, dt) {
  if (!boss) return;

  const dtS = dt / 16.667;

  boss.frame++;
  if (boss.hitFlash > 0) boss.hitFlash -= dt;
  if (boss.stagger  > 0) boss.stagger  -= dt;
  if (boss.shootCD  > 0) boss.shootCD  -= dt;
  if (boss.jumpCD   > 0) boss.jumpCD   -= dt;
  if (boss.chargeCD > 0) boss.chargeCD -= dt;

  // Fase según % vida
  const hpPct = boss.hp / boss.maxHp;
  if (hpPct < 0.33 && boss.phase < 3) {
    boss.phase = 3;
    boss.rageMode = true;
    boss.speed *= 1.3;
    _bossRoarParticles(boss, particles);
  } else if (hpPct < 0.66 && boss.phase < 2) {
    boss.phase = 2;
    boss.speed *= 1.15;
  }

  if (boss.stagger > 0) { boss.vx *= 0.5; return; }

  // Dispatch IA por tipo
  switch (boss.type) {
    case 'bigZombie':   _aiBigZombie(boss, player, orbs, particles, dt, dtS); break;
    case 'bigSkeleton': _aiBigSkeleton(boss, player, orbs, particles, dt, dtS); break;
    case 'bigBat':      _aiBigBat(boss, player, orbs, particles, dt, dtS); break;
    case 'bigGhost':    _aiBigGhost(boss, player, orbs, particles, dt, dtS); break;
    case 'bigFly':      _aiBigFly(boss, player, orbs, particles, dt, dtS); break;
  }

  // Física
  if (!boss.flying && !boss.phasing) {
    boss.vy += CFG.GRAVITY * dtS;
    if (boss.vy > CFG.MAX_FALL) boss.vy = CFG.MAX_FALL;
  }

  boss.x += boss.vx * dtS;
  boss.y += boss.vy * dtS;

  if (!boss.phasing) {
    boss.onGround = false;
    EntityCollision.resolve(boss, platforms);
  }

  // Límites
  if (boss.x < 0) boss.x = 0;
}

/* ─── IA BOSSES ───────────────────────────────────────── */
function _aiBigZombie(boss, player, orbs, particles, dt, dtS) {
  const dx = player.x - boss.x;
  boss.dir = dx > 0 ? 1 : -1;
  const dist = Math.abs(dx);

  boss.aiTimer += dt;

  // Fase 1: lento y directo
  // Fase 2: carga (dash)
  // Fase 3: carga + salta

  if (boss.phase >= 2 && boss.chargeCD <= 0 && dist < 300) {
    // Carga
    boss.vx = boss.dir * boss.speed * 3.5;
    boss.chargeCD = 2500;
    // Crear partículas de carga
    _chargeParticles(boss, particles);
  } else {
    boss.vx += (boss.dir * boss.speed - boss.vx) * 0.06;
  }

  if (boss.phase === 3 && boss.jumpCD <= 0 && boss.onGround && dist < 350) {
    boss.vy = CFG.PLAYER.JUMP_FORCE * 1.1;
    boss.jumpCD = 2000;
  }
}

function _aiBigSkeleton(boss, player, orbs, particles, dt, dtS) {
  const dx = player.x - boss.x;
  boss.dir = dx > 0 ? 1 : -1;
  const dist = Math.abs(dx);
  boss.aiTimer += dt;

  // Mantiene distancia media y salta para atacar
  if (dist > 180) {
    boss.vx += (boss.dir * boss.speed - boss.vx) * 0.06;
  } else {
    boss.vx *= 0.85;
  }

  // Salto de ataque
  if (boss.jumpCD <= 0 && boss.onGround && dist < 260) {
    boss.vy = CFG.PLAYER.JUMP_FORCE * (boss.phase >= 2 ? 1.2 : 1.0);
    boss.jumpCD = 1800;
  }

  // Fase 3: lanza "huesos" (orbs blancos)
  if (boss.phase === 3 && boss.shootCD <= 0) {
    _shootBossOrbs(boss, player, orbs, 3, 'bone');
    boss.shootCD = 1200;
  }
}

function _aiBigBat(boss, player, orbs, particles, dt, dtS) {
  boss.aiTimer += dt;
  // Orbita al jugador en círculos
  const angle = boss.aiTimer * 0.0015 * boss.speed;
  const orbitR = 160 - boss.phase * 30;
  const targetX = player.x + Math.cos(angle) * orbitR;
  const targetY = player.y - 60 + Math.sin(angle * 0.7) * 60;
  boss.vx += (targetX - boss.x) * 0.04;
  boss.vy += (targetY - boss.y) * 0.04;
  boss.vx *= 0.92; boss.vy *= 0.92;
  boss.dir = boss.vx > 0 ? 1 : -1;

  // Fase 2+: pica en línea recta
  if (boss.phase >= 2 && boss.chargeCD <= 0) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const mag = Math.hypot(dx, dy) || 1;
    boss.vx = (dx/mag) * boss.speed * 4;
    boss.vy = (dy/mag) * boss.speed * 4;
    boss.chargeCD = 2200;
  }

  // Fase 3: invoca mini-murciélagos (orbs)
  if (boss.phase === 3 && boss.shootCD <= 0) {
    _shootBossOrbs(boss, player, orbs, 4, 'bat');
    boss.shootCD = 1600;
  }

  if (boss.y < 30) boss.vy = Math.abs(boss.vy);
  if (boss.y > CFG.H - 80) boss.vy = -Math.abs(boss.vy);
}

function _aiBigGhost(boss, player, orbs, particles, dt, dtS) {
  boss.aiTimer += dt;
  // Se teletransporta cerca del jugador
  if (boss.chargeCD <= 0) {
    boss.x = player.x + (Math.random() < 0.5 ? -120 : 120);
    boss.y = player.y - 20;
    boss.chargeCD = 2000 / boss.phase;
    _ghostTeleportParticles(boss, particles);
  }

  const dx = player.x - boss.x;
  boss.dir = dx > 0 ? 1 : -1;
  boss.vx = boss.dir * boss.speed * (0.5 + Math.sin(boss.aiTimer * 0.002) * 0.5);
  boss.vy = Math.sin(boss.aiTimer * 0.003) * boss.speed;

  // Dispara orbs en todas direcciones
  if (boss.shootCD <= 0) {
    _shootRadialOrbs(boss, orbs, boss.phase === 3 ? 8 : 4);
    boss.shootCD = 1400;
  }

  if (boss.y < 30)         boss.vy = Math.abs(boss.vy);
  if (boss.y > CFG.H - 80) boss.vy = -Math.abs(boss.vy);
}

function _aiBigFly(boss, player, orbs, particles, dt, dtS) {
  boss.aiTimer += dt;
  // Vuela en zigzag y dispara en ráfagas
  const dx = player.x - boss.x;
  const dy = player.y - 90 - boss.y;
  boss.dir = dx > 0 ? 1 : -1;
  boss.vx += (dx * 0.02 + Math.sin(boss.aiTimer * 0.003) * 2 - boss.vx) * 0.08;
  boss.vy += (dy * 0.015 + Math.cos(boss.aiTimer * 0.004) * 2 - boss.vy) * 0.08;

  // Ráfaga de orbs
  if (boss.shootCD <= 0) {
    const burst = boss.phase === 3 ? 5 : (boss.phase === 2 ? 3 : 2);
    for (let i = 0; i < burst; i++) {
      setTimeout(() => {
        if (boss && boss.hp > 0) _shootBossOrbs(boss, player, orbs, 1, 'fly');
      }, i * 180);
    }
    boss.shootCD = 1100;
  }

  if (boss.y < 30)         boss.vy = Math.abs(boss.vy);
  if (boss.y > CFG.H - 80) boss.vy = -Math.abs(boss.vy);
}

/* ─── HELPERS ─────────────────────────────────────────── */
function _shootBossOrbs(boss, player, orbs, count, subtype) {
  for (let i = 0; i < count; i++) {
    const spread = (count > 1 ? (i / (count-1) - 0.5) * 0.6 : 0);
    const dx = (player.x + player.w/2) - (boss.x + boss.w/2);
    const dy = (player.y + player.h/2) - (boss.y + boss.h/2);
    const mag = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx) + spread;
    const speed = 4 + boss.phase * 0.5;
    const orb = createOrb(
      boss.x + boss.w/2,
      boss.y + boss.h/2,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
    orb.dmg = boss.dmg * 0.5;
    orb.subtype = subtype;
    orbs.push(orb);
  }
}

function _shootRadialOrbs(boss, orbs, count) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 3.5;
    const orb = createOrb(
      boss.x + boss.w/2,
      boss.y + boss.h/2,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
    orb.dmg = boss.dmg * 0.4;
    orbs.push(orb);
  }
}

function _chargeParticles(boss, particles) {
  if (!particles) return;
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    particles.push({
      x: boss.x + boss.w/2, y: boss.y + boss.h/2,
      vx: Math.cos(a) * (2 + Math.random() * 3),
      vy: Math.sin(a) * (2 + Math.random() * 3),
      life:0.6, maxLife:0.6, r:4,
      color:'#ff6600', type:'spark',
    });
  }
}

function _bossRoarParticles(boss, particles) {
  if (!particles) return;
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 3 + Math.random() * 5;
    particles.push({
      x: boss.x + boss.w/2, y: boss.y + boss.h/2,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life:0.8, maxLife:0.8, r: 5 + Math.random()*4,
      color:'#ff2020', type:'blood',
    });
  }
}

function _ghostTeleportParticles(boss, particles) {
  if (!particles) return;
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    particles.push({
      x: boss.x + boss.w/2, y: boss.y + boss.h/2,
      vx: Math.cos(a) * (1 + Math.random() * 3),
      vy: Math.sin(a) * (1 + Math.random() * 3),
      life:0.5, maxLife:0.5, r:3,
      color:'rgba(140,200,255,0.9)', type:'spark',
    });
  }
}
