/* ══════════════════════════════════════════════════════════
   physics.js — Partículas de efectos visuales
   ══════════════════════════════════════════════════════════ */
'use strict';

const Particles = {
  list: [],

  reset() { this.list = []; },

  /* Sangre */
  blood(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 4.5;
      this.list.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
        life: 0.55 + Math.random() * 0.5,
        maxLife: 1.05,
        r: 1.5 + Math.random() * 2.5,
        color: Math.random() < 0.65 ? CFG.COLORS.blood : CFG.COLORS.bloodBright,
        type: 'blood',
      });
    }
  },

  /* Hueso */
  bone(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 4;
      this.list.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
        life: 0.7 + Math.random() * 0.5, maxLife: 1.2,
        r: 2 + Math.random() * 3,
        color: CFG.COLORS.bone, type: 'blood',
      });
    }
  },

  /* Ectoplasma */
  ectoplasm(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1 + Math.random() * 3;
      this.list.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5,
        life: 0.5 + Math.random() * 0.5, maxLife: 1.0,
        r: 3 + Math.random() * 4,
        color: CFG.COLORS.ectoplasm, type: 'spark',
      });
    }
  },

  /* Chispa (impacto) */
  spark(x, y, color = '#ff8800', count = 6) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 3.5;
      this.list.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.25 + Math.random() * 0.25, maxLife: 0.5,
        r: 1.5 + Math.random() * 2,
        color, type: 'spark',
      });
    }
  },

  /* Texto flotante (daño o combo) */
  text(x, y, msg, color = '#fff') {
    this.list.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.5, vy: -2.5,
      life: 0.8, maxLife: 0.8,
      r: 0, color, type: 'text', msg,
    });
  },

  update(dt) {
    const dtS = dt / 16.667;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x  += p.vx * dtS;
      p.y  += p.vy * dtS;
      p.vx *= 0.9;
      p.vy *= 0.9;
      if (p.type === 'blood') p.vy += 0.08 * dtS;
      p.life -= dt * 0.001;
      if (p.life <= 0) this.list.splice(i, 1);
    }
  },

  draw(ctx, camX) {
    for (const p of this.list) {
      const sx = p.x - camX;
      const alpha = Math.max(0, p.life / p.maxLife);

      if (p.type === 'text') {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.font = 'bold 14px Bangers';
        ctx.textAlign = 'center';
        ctx.fillText(p.msg, sx, p.y);
        ctx.restore();
        continue;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.type === 'spark') { ctx.shadowBlur = 5; ctx.shadowColor = p.color; }
      ctx.beginPath();
      ctx.arc(sx, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },
};
