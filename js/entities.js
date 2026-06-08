/* ══════════════════════════════════════════════════════════
   entities.js — Jugador y proyectiles
   ══════════════════════════════════════════════════════════ */
'use strict';

/* ─── JUGADOR ─────────────────────────────────────────── */
function createPlayer(x, y) {
  return {
    x, y,
    w: CFG.PLAYER.W,
    h: CFG.PLAYER.H,
    vx: 0,
    vy: 0,
    dir: 1,            // 1=derecha, -1=izquierda
    onGround: false,
    jumpsLeft: 2,      // doble salto

    hp: CFG.PLAYER.MAX_HP,
    maxHp: CFG.PLAYER.MAX_HP,
    invincible: 0,     // ms restantes de invencibilidad

    // Estado de animación
    state: 'idle',     // idle | walk | jump | fall | punch | kick | jumpAtk
    frame: 0,
    stateTimer: 0,     // ms en el estado actual

    // Cooldowns de ataque (ms)
    punchCD:   0,
    kickCD:    0,
    jumpAtkCD: 0,

    // Combo
    combo: 0,
    comboTimer: 0,

    // Flags
    attackActive: false,
    attackType: null,  // 'punch' | 'kick' | 'jumpAtk'
    attackTimer: 0,    // ms que dura el hitbox activo
  };
}

/* ─── PROYECTIL (orb de mosca) ───────────────────────── */
function createOrb(x, y, vx, vy) {
  return {
    x, y,
    vx, vy,
    r: 5,
    dmg: 8,
    frame: 0,
    life: 4000, // ms antes de desaparecer
  };
}

/* ─── ACTUALIZAR JUGADOR ─────────────────────────────── */
function updatePlayer(player, dt, input, platforms, levelWidth) {
  const P = CFG.PLAYER;
  const dtS = dt / 16.667; // normalizado a 60fps

  // ── Cooldowns ──────────────────────────────────────
  if (player.punchCD   > 0) player.punchCD   -= dt;
  if (player.kickCD    > 0) player.kickCD    -= dt;
  if (player.jumpAtkCD > 0) player.jumpAtkCD -= dt;
  if (player.invincible > 0) player.invincible -= dt;
  if (player.comboTimer > 0) {
    player.comboTimer -= dt;
    if (player.comboTimer <= 0) player.combo = 0;
  }
  if (player.attackTimer > 0) {
    player.attackTimer -= dt;
    if (player.attackTimer <= 0) {
      player.attackActive = false;
      player.attackType   = null;
    }
  }

  // ── Movimiento horizontal ──────────────────────────
  const isAttacking = player.state === 'punch' || player.state === 'kick';
  if (!isAttacking) {
    if (input.left)  { player.vx = -P.SPEED; player.dir = -1; }
    else if (input.right) { player.vx = P.SPEED;  player.dir = 1;  }
    else player.vx *= CFG.FRICTION;
  } else {
    player.vx *= 0.6; // ralentiza al atacar
  }

  // ── Salto ──────────────────────────────────────────
  if (input.jumpPressed) {
    if (player.jumpsLeft > 0) {
      const force = player.jumpsLeft === 2 ? P.JUMP_FORCE : P.DOUBLE_JUMP_FORCE;
      player.vy = force;
      player.jumpsLeft--;

      // Salto + golpe simultáneo
      if (input.punch && player.jumpAtkCD <= 0) {
        _activateAttack(player, 'jumpAtk', P.JUMP_ATK_CD, P.JUMP_BOX, P.JUMP_DMG, 180);
      }
    }
    input.jumpPressed = false; // consume
  }

  // ── Ataques ─────────────────────────────────────────
  if (input.punch && player.punchCD <= 0 && player.state !== 'jumpAtk') {
    _activateAttack(player, 'punch', P.PUNCH_CD, P.PUNCH_BOX, P.PUNCH_DMG, 140);
  }
  if (input.kick && player.kickCD <= 0 && player.state !== 'jumpAtk') {
    _activateAttack(player, 'kick', P.KICK_CD, P.KICK_BOX, P.KICK_DMG, 160);
  }
  input.punch = false;
  input.kick  = false;

  // ── Gravedad ────────────────────────────────────────
  player.vy += CFG.GRAVITY * dtS;
  if (player.vy > CFG.MAX_FALL) player.vy = CFG.MAX_FALL;

  // ── Movimiento + colisiones ─────────────────────────
  player.x += player.vx * dtS;
  player.y += player.vy * dtS;

  // Límites del nivel
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > levelWidth) player.x = levelWidth - player.w;

  // Colisión con plataformas
  const wasOnGround = player.onGround;
  player.onGround = false;
  _resolveCollisions(player, platforms);

  if (player.onGround && !wasOnGround) {
    player.jumpsLeft = 2; // restaura saltos al aterrizar
  }

  // Si cae fuera del mundo
  if (player.y > CFG.H + 100) {
    player.hp = 0;
  }

  // ── Estado de animación ─────────────────────────────
  player.frame++;
  player.stateTimer += dt;

  if (player.attackActive) {
    // estado ya seteado por _activateAttack
  } else if (!player.onGround) {
    player.state = player.vy < 0 ? 'jump' : 'fall';
  } else if (Math.abs(player.vx) > 0.5) {
    player.state = 'walk';
  } else {
    player.state = 'idle';
  }
}

function _activateAttack(player, type, cd, box, dmg, duration) {
  player.state       = type;
  player.attackActive= true;
  player.attackType  = type;
  player.attackTimer = duration;

  // Setea el cooldown correcto
  if (type === 'punch')   player.punchCD   = cd;
  if (type === 'kick')    player.kickCD    = cd;
  if (type === 'jumpAtk') player.jumpAtkCD = cd;
}

/* ─── HITBOX DE ATAQUE EN MUNDO ──────────────────────── */
function getAttackHitbox(player) {
  if (!player.attackActive) return null;
  const P = CFG.PLAYER;
  const box = {
    punch:   P.PUNCH_BOX,
    kick:    P.KICK_BOX,
    jumpAtk: P.JUMP_BOX,
  }[player.attackType];
  if (!box) return null;

  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;
  return {
    x: cx + box.offX * player.dir - box.w / 2,
    y: cy + box.offY - box.h / 2,
    w: box.w,
    h: box.h,
    dmg: { punch: P.PUNCH_DMG, kick: P.KICK_DMG, jumpAtk: P.JUMP_DMG }[player.attackType],
    kb:  { punch: P.PUNCH_KB,  kick: P.KICK_KB,  jumpAtk: P.JUMP_KB  }[player.attackType],
    type: player.attackType,
  };
}

/* ─── COLISIONES PLATAFORMAS ─────────────────────────── */
function _resolveCollisions(entity, platforms) {
  for (const p of platforms) {
    const overlapX = entity.x + entity.w > p.x && entity.x < p.x + p.w;
    const overlapY = entity.y + entity.h > p.y && entity.y < p.y + p.h;

    if (overlapX && overlapY) {
      // Resolver por el lado más pequeño de penetración
      const overlapLeft   = entity.x + entity.w - p.x;
      const overlapRight  = p.x + p.w - entity.x;
      const overlapTop    = entity.y + entity.h - p.y;
      const overlapBottom = p.y + p.h - entity.y;

      const minX = Math.min(overlapLeft, overlapRight);
      const minY = Math.min(overlapTop, overlapBottom);

      if (minY < minX) {
        // Colisión vertical
        if (overlapTop < overlapBottom) {
          // Aterrizando encima
          entity.y = p.y - entity.h;
          entity.vy = 0;
          if (entity.jumpsLeft !== undefined) entity.onGround = true;
        } else {
          // Cabeza contra suelo de plataforma
          entity.y = p.y + p.h;
          entity.vy = Math.abs(entity.vy) * 0.2;
        }
      } else {
        // Colisión horizontal
        if (overlapLeft < overlapRight) entity.x = p.x - entity.w;
        else entity.x = p.x + p.w;
        entity.vx = 0;
      }
    }
  }
}

// Export para physics.js
const EntityCollision = { resolve: _resolveCollisions };
