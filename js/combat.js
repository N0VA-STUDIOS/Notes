/* ══════════════════════════════════════════════════════════
   combat.js — Detección de golpes, daño, knockback
   ══════════════════════════════════════════════════════════ */
'use strict';

const Combat = {

  /* Rectángulo de ataque del jugador vs enemigos + boss */
  checkPlayerAttack(player, enemies, boss, particles) {
    const hitbox = getAttackHitbox(player);
    if (!hitbox) return;

    let hitSomething = false;

    // vs enemigos normales
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (_rectsOverlap(hitbox, e)) {
        _damageEnemy(e, hitbox.dmg, hitbox.kb, player.dir, particles);
        hitSomething = true;
        if (e.hp <= 0) {
          _onEnemyDeath(e, particles);
          enemies.splice(i, 1);
          Game.addScore(e.score);
          Game.kills++;
          Game.combo();
          HUD.addKillFeed(e.type);
        }
      }
    }

    // vs boss
    if (boss && _rectsOverlap(hitbox, boss)) {
      _damageEnemy(boss, hitbox.dmg, hitbox.kb, player.dir, particles);
      hitSomething = true;
      HUD.updateBossHP(boss.hp, boss.maxHp);
      if (boss.hp <= 0) {
        _onBossDeath(boss, particles);
        Game.addScore(CFG.SCORE.boss + Game.levelIndex * 20);
        Game.kills++;
        Game.combo();
        Game.bossDefeated();
      }
    }

    if (hitSomething) {
      Particles.spark(hitbox.x + hitbox.w/2, hitbox.y + hitbox.h/2, '#fff', 5);
    }
  },

  /* Enemigos/boss tocan al jugador */
  checkEnemyContact(player, enemies, boss, orbs, particles) {
    if (player.invincible > 0) return;

    // Contacto cuerpo a cuerpo
    for (const e of enemies) {
      if (_rectsOverlap(player, e)) {
        _damagePlayer(player, e.dmg, e.dir, particles);
        return;
      }
    }

    // Boss
    if (boss && _rectsOverlap(player, boss)) {
      _damagePlayer(player, boss.dmg, boss.dir, particles);
      return;
    }

    // Orbs
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i];
      const orbRect = { x: o.x - o.r, y: o.y - o.r, w: o.r*2, h: o.r*2 };
      if (_rectsOverlap(player, orbRect)) {
        _damagePlayer(player, o.dmg, o.vx > 0 ? 1 : -1, particles);
        Particles.spark(o.x, o.y, CFG.COLORS.flyOrb, 5);
        orbs.splice(i, 1);
        return;
      }
    }
  },
};

/* ─── HELPERS ─────────────────────────────────────────── */
function _rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function _damageEnemy(e, dmg, kb, playerDir, particles) {
  e.hp       -= dmg;
  e.hitFlash  = 180;
  e.stagger   = 200;
  e.vx        = playerDir * kb;
  e.vy        = -3;

  // Partícula de daño
  const cx = e.x + e.w/2, cy = e.y + e.h/2;
  if (e.type === 'skeleton') Particles.bone(cx, cy, 5);
  else if (e.type === 'ghost') Particles.ectoplasm(cx, cy, 6);
  else Particles.blood(cx, cy, 7);
  Particles.text(cx, cy - e.h, `-${dmg}`, '#ff4444');
}

function _damagePlayer(player, dmg, sourceDir, particles) {
  player.hp        -= dmg;
  player.invincible = CFG.PLAYER.INVINCIBLE_MS;
  player.vx         = -sourceDir * 4;
  player.vy         = -4;
  player.combo      = 0;
  Particles.blood(player.x + player.w/2, player.y + player.h/2, 6);
  HUD.flashHit();
  HUD.updateHealth(player.hp, player.maxHp);
  if (player.hp <= 0) Game.playerDied();
}

function _onEnemyDeath(e, particles) {
  const cx = e.x + e.w/2, cy = e.y + e.h/2;
  if (e.type === 'skeleton') {
    Particles.bone(cx, cy, 14);
  } else if (e.type === 'ghost') {
    Particles.ectoplasm(cx, cy, 16);
  } else {
    Particles.blood(cx, cy, 18);
  }
  Particles.text(cx, cy - e.h - 10, `+${e.score}`, '#ffd700');
}

function _onBossDeath(boss, particles) {
  // Gran explosión de partículas
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (!particles) return;
      Particles.blood(boss.x + boss.w/2, boss.y + boss.h/2, 25);
      Particles.spark(boss.x + boss.w/2, boss.y + boss.h/2, '#ffd700', 14);
    }, i * 120);
  }
}
