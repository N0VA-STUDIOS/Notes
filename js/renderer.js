/* ══════════════════════════════════════════════════════════
   renderer.js — Pipeline de dibujado
   ══════════════════════════════════════════════════════════ */
'use strict';

const Renderer = {
  canvas: null,
  ctx:    null,
  camX:   0,    // scroll horizontal
  targetCamX: 0,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    // Mantiene aspecto 2:1, escala al viewport
    const scale = Math.min(
      window.innerWidth  / CFG.W,
      window.innerHeight / CFG.H,
    );
    this.canvas.width  = CFG.W;
    this.canvas.height = CFG.H;
    this.canvas.style.width  = (CFG.W * scale) + 'px';
    this.canvas.style.height = (CFG.H * scale) + 'px';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = ((window.innerWidth  - CFG.W * scale) / 2) + 'px';
    this.canvas.style.top  = ((window.innerHeight - CFG.H * scale) / 2) + 'px';
  },

  updateCamera(playerX, levelWidth) {
    // Cámara sigue al jugador con suavizado
    this.targetCamX = playerX - CFG.W / 2 + 60;
    this.targetCamX = Math.max(0, Math.min(levelWidth - CFG.W, this.targetCamX));
    this.camX += (this.targetCamX - this.camX) * CFG.CAM_EASE;
  },

  draw(gameState) {
    const { ctx } = this;
    const {
      episode, levelIndex, player, enemies, boss,
      orbs, platforms, frame, levelWidth,
    } = gameState;

    const ep = episode - 1;
    const cx = this.camX;

    ctx.clearRect(0, 0, CFG.W, CFG.H);

    // 1. Fondo
    Sprites.background(ctx, CFG.W, CFG.H, ep, cx, frame);

    // 2. Plataformas
    for (const p of platforms) {
      const sx = p.x - cx;
      if (sx + p.w < -20 || sx > CFG.W + 20) continue; // culling
      Sprites.platform(ctx, sx, p.y, p.w, p.h, ep);
    }

    // 3. Partículas (detrás de entidades)
    Particles.draw(ctx, cx);

    // 4. Orbs de mosca
    for (const o of orbs) {
      Sprites.flyOrb(ctx, o.x - cx, o.y, o.r, o.frame);
    }

    // 5. Enemigos
    for (const e of enemies) {
      const sx = e.x - cx;
      if (sx + e.w < -40 || sx > CFG.W + 40) continue;
      Sprites[e.type]?.(ctx, sx, e.y, e.w, e.h, e.dir, e.frame,
                        e.hp, e.maxHp, e.hitFlash > 0);
    }

    // 6. Boss
    if (boss) {
      const sx = boss.x - cx;
      Sprites.boss(ctx, sx, boss.y, boss.w, boss.h,
                   boss.dir, boss.frame, boss.type,
                   boss.hp, boss.maxHp, boss.hitFlash > 0);
    }

    // 7. Jugador
    if (player) {
      const sx = player.x - cx;
      Sprites.player(ctx, sx, player.y, player.w, player.h,
                     player.dir, player.frame, player.state,
                     player.hp, player.maxHp);

      // Hitbox de ataque (debug visual, semi-transparente)
      if (player.attackActive) {
        const hb = getAttackHitbox(player);
        if (hb) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,0,0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(hb.x - cx, hb.y, hb.w, hb.h);
          ctx.restore();
        }
      }
    }

    // 8. Indicador de ataque en pantalla
    if (player?.attackActive) {
      const label = { punch:'GOLPE!', kick:'PATADA!', jumpAtk:'AÉREO!' }[player.attackType] || '';
      ctx.save();
      ctx.font = 'bold 20px Bangers';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8; ctx.shadowColor = '#ff8800';
      ctx.fillText(label, CFG.W / 2, CFG.H - 26);
      ctx.restore();
    }
  },
};
