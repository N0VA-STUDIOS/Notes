/* ══════════════════════════════════════════════════════════
   sprites.js — Dibujado de rectángulos para todos los personajes
   Cada función recibe (ctx, x, y, dir, frame, options)
   dir: 1 = derecha, -1 = izquierda
   frame: contador de animación (para ciclos)
   Sustituir el cuerpo de cada función por ctx.drawImage() para sprites reales.
   ══════════════════════════════════════════════════════════ */
'use strict';

const Sprites = {

  /* ─── JUGADOR ─────────────────────────────────────── */
  player(ctx, x, y, w, h, dir, frame, state, hp, maxHp) {
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, y + h);
    ctx.scale(dir, 1);

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.55, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (animated)
    const legOff = state === 'walk' ? Math.sin(frame * 0.22) * 6 : 0;
    ctx.fillStyle = '#555';
    ctx.fillRect(-w/2 + 4, -h*0.45, w*0.36, h*0.44 + legOff);   // left leg
    ctx.fillStyle = '#444';
    ctx.fillRect(w*0.1,    -h*0.45, w*0.36, h*0.44 - legOff);   // right leg

    // Boots
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-w/2 + 2, -h*0.01 + legOff, w*0.4, h*0.1);
    ctx.fillRect(w*0.08,   -h*0.01 - legOff, w*0.4, h*0.1);

    // Body
    ctx.fillStyle = CFG.COLORS.player;
    ctx.fillRect(-w/2, -h*0.9, w, h*0.46);

    // Jacket detail
    ctx.fillStyle = '#888';
    ctx.fillRect(-w/2 + 2, -h*0.9, 5, h*0.46);

    // Attack flash arm
    if (state === 'punch' || state === 'jumpAtk') {
      ctx.fillStyle = CFG.COLORS.playerDetail;
      ctx.fillRect(w*0.3, -h*0.78, w*0.55, h*0.18); // extended arm
    } else if (state === 'kick') {
      ctx.fillStyle = '#555';
      ctx.fillRect(w*0.2, -h*0.55, w*0.6, h*0.14);  // kick leg
    } else {
      // Resting arms
      ctx.fillStyle = CFG.COLORS.playerHead;
      ctx.fillRect(-w/2 - 6, -h*0.82, 10, h*0.3);
      ctx.fillRect(w/2 - 4,  -h*0.82, 10, h*0.3);
    }

    // Head
    ctx.fillStyle = CFG.COLORS.playerHead;
    ctx.fillRect(-w/2 + 4, -h, w - 8, h*0.25);

    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-2, -h + h*0.06, 5, 5);
    ctx.fillRect(6,  -h + h*0.06, 5, 5);

    // HP glow when low
    if (hp / maxHp < 0.3) {
      ctx.strokeStyle = `rgba(255,0,0,${0.4 + Math.sin(frame*0.3)*0.3})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(-w/2, -h, w, h);
    }

    ctx.restore();
  },

  /* ─── ZOMBIE ──────────────────────────────────────── */
  zombie(ctx, x, y, w, h, dir, frame, hp, maxHp, hitFlash) {
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, y + h);
    ctx.scale(dir, 1);

    const wobble = Math.sin(frame * 0.18) * 4; // lurch

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0,2,w*0.5,4,0,0,Math.PI*2); ctx.fill();

    // Legs
    ctx.fillStyle = '#2a4a1a';
    ctx.fillRect(-w/2 + 2, -h*0.44, w*0.38, h*0.44);
    ctx.fillRect(w*0.1, -h*0.44 + wobble, w*0.38, h*0.44);

    // Body
    ctx.fillStyle = hitFlash ? '#fff' : CFG.COLORS.zombie;
    ctx.fillRect(-w/2, -h*0.88 + wobble*0.3, w, h*0.46);

    // Torn clothes detail
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-w/2 + 4, -h*0.6, 6, 14);

    // Arms (raised)
    ctx.fillStyle = hitFlash ? '#fff' : CFG.COLORS.zombie;
    ctx.fillRect(w*0.4, -h*0.85 + wobble*0.3, 10, h*0.35);
    ctx.fillRect(-w*0.5 - 8, -h*0.8, 10, h*0.28);

    // Head
    ctx.fillStyle = hitFlash ? '#fff' : CFG.COLORS.zombieHead;
    ctx.fillRect(-w/2 + 2, -h + wobble*0.2, w - 4, h*0.26);

    // Eyes (glowing red)
    ctx.fillStyle = hitFlash ? '#f00' : '#ff2020';
    ctx.fillRect(-2, -h + h*0.06, 5, 5);
    ctx.fillRect(6,  -h + h*0.06, 5, 5);

    // HP bar
    _drawHPBar(ctx, -w/2, -h - 10, w, hp, maxHp);
    ctx.restore();
  },

  /* ─── ESQUELETO ───────────────────────────────────── */
  skeleton(ctx, x, y, w, h, dir, frame, hp, maxHp, hitFlash) {
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, y + h);
    ctx.scale(dir, 1);

    const bob = Math.sin(frame * 0.2) * 3;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0,2,w*0.45,4,0,0,Math.PI*2); ctx.fill();

    // Legs (thin bones)
    const bc = hitFlash ? '#fff' : CFG.COLORS.skeleton;
    ctx.fillStyle = bc;
    ctx.fillRect(-w/2 + 5, -h*0.44, 6, h*0.44);
    ctx.fillRect(w*0.2,    -h*0.44 + bob, 6, h*0.44);

    // Pelvis
    ctx.fillRect(-w/2 + 4, -h*0.46, w - 8, 8);

    // Ribcage
    ctx.fillRect(-w/2 + 2, -h*0.88, w - 4, h*0.44);
    // rib lines
    ctx.fillStyle = hitFlash ? '#eee' : CFG.COLORS.zombieHead;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-w/2 + 3, -h*0.84 + i*10, w - 6, 3);
    }

    // Arms
    ctx.fillStyle = bc;
    ctx.fillRect(w*0.4, -h*0.88, 5, h*0.38);
    ctx.fillRect(-w*0.45 - 5, -h*0.88, 5, h*0.38);

    // Head (skull)
    ctx.fillStyle = hitFlash ? '#fff' : CFG.COLORS.skeletonHead;
    ctx.fillRect(-w/2 + 3, -h + bob*0.3, w - 6, h*0.25);
    // eye sockets
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-4, -h + h*0.05, 7, 7);
    ctx.fillRect(5,  -h + h*0.05, 7, 7);
    // jaw
    ctx.fillStyle = bc;
    ctx.fillRect(-w/2 + 5, -h*0.76 + bob*0.2, w - 10, 4);

    _drawHPBar(ctx, -w/2, -h - 10, w, hp, maxHp);
    ctx.restore();
  },

  /* ─── MURCIÉLAGO ──────────────────────────────────── */
  bat(ctx, x, y, w, h, dir, frame, hp, maxHp, hitFlash) {
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, y + h / 2);
    ctx.scale(dir, 1);

    const flapY = Math.sin(frame * 0.35) * 5;
    const flapRot = Math.sin(frame * 0.35) * 0.3;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, h*0.6, w*0.5, 3, 0, 0, Math.PI*2); ctx.fill();

    const bc = hitFlash ? '#fff' : CFG.COLORS.bat;
    // Left wing
    ctx.save();
    ctx.rotate(-flapRot);
    ctx.fillStyle = bc;
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(-w*0.9, -flapY - 4);
    ctx.lineTo(-w*0.5, flapY + 2); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.rotate(flapRot);
    ctx.fillStyle = bc;
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(w*0.9, -flapY - 4);
    ctx.lineTo(w*0.5, flapY + 2); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = hitFlash ? '#fff' : '#4a2060';
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.2, h*0.38, 0, 0, Math.PI*2); ctx.fill();

    // Eyes
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-5, -4, 4, 4);
    ctx.fillRect(2,  -4, 4, 4);

    // Ears
    ctx.fillStyle = bc;
    ctx.beginPath(); ctx.moveTo(-5,-h*0.25); ctx.lineTo(-9,-h*0.5); ctx.lineTo(-1,-h*0.28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5,-h*0.25); ctx.lineTo(9,-h*0.5); ctx.lineTo(1,-h*0.28); ctx.closePath(); ctx.fill();

    _drawHPBar(ctx, -w/2, -h*0.55, w, hp, maxHp);
    ctx.restore();
  },

  /* ─── FANTASMA ────────────────────────────────────── */
  ghost(ctx, x, y, w, h, dir, frame, hp, maxHp, hitFlash) {
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, y + h / 2);
    ctx.scale(dir, 1);

    const bob = Math.sin(frame * 0.15) * 5;
    const alpha = 0.55 + Math.sin(frame * 0.12) * 0.2;

    ctx.globalAlpha = hitFlash ? 1 : alpha;

    // Glow
    if (!hitFlash) {
      ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(140,200,255,0.7)';
    }

    ctx.fillStyle = hitFlash ? '#fff' : CFG.COLORS.ghost;

    // Body (rounded bottom)
    ctx.beginPath();
    ctx.arc(0, -h*0.15 + bob, w*0.5, Math.PI, 0);
    ctx.lineTo(w*0.5, h*0.35 + bob);
    // Wavy bottom
    const segs = 4;
    for (let i = segs; i >= 0; i--) {
      const px = (i / segs - 0.5) * w;
      const py = h*0.35 + bob + (i % 2 === 0 ? 6 : 0);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Eyes
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1a1aff';
    ctx.fillRect(-8, -h*0.22 + bob, 6, 8);
    ctx.fillRect(2,  -h*0.22 + bob, 6, 8);

    _drawHPBar(ctx, -w/2, -h*0.72 + bob, w, hp, maxHp);
    ctx.restore();
  },

  /* ─── MOSCA ───────────────────────────────────────── */
  fly(ctx, x, y, w, h, dir, frame, hp, maxHp, hitFlash) {
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, y + h / 2);
    ctx.scale(dir, 1);

    const buzz = Math.sin(frame * 0.6) * 2;
    const fc = hitFlash ? '#fff' : CFG.COLORS.fly;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, h*0.5, w*0.35, 3, 0, 0, Math.PI*2); ctx.fill();

    // Wings (semi-transparent)
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#aaffaa';
    ctx.beginPath(); ctx.ellipse(-w*0.5, -buzz - 2, w*0.4, h*0.2, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w*0.5,  -buzz - 2, w*0.4, h*0.2,  0.3, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

    // Body
    ctx.fillStyle = fc;
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.28, h*0.45, 0, 0, Math.PI*2); ctx.fill();

    // Abdomen stripes
    ctx.fillStyle = 'rgba(80,160,40,0.5)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-w*0.22, h*0.05 + i*6, w*0.44, 3);
    }

    // Eyes (compound — red)
    ctx.fillStyle = '#ff2200';
    ctx.beginPath(); ctx.ellipse(-5, -h*0.28, 5, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5,  -h*0.28, 5, 4, 0, 0, Math.PI*2); ctx.fill();

    _drawHPBar(ctx, -w/2, -h*0.6, w, hp, maxHp);
    ctx.restore();
  },

  /* ─── ORB DE MOSCA ────────────────────────────────── */
  flyOrb(ctx, x, y, r, frame) {
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = CFG.COLORS.flyOrb;
    ctx.fillStyle = CFG.COLORS.flyOrb;
    ctx.beginPath();
    ctx.arc(x, y, r + Math.sin(frame * 0.3) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  },

  /* ─── BOSS ────────────────────────────────────────── */
  boss(ctx, x, y, w, h, dir, frame, type, hp, maxHp, hitFlash) {
    // Bosses son versiones grandes de los enemigos con detalles extra
    ctx.save();
    // Aura de boss
    const pulse = 0.5 + Math.sin(frame * 0.1) * 0.3;
    ctx.shadowBlur = 24 + pulse * 8;
    ctx.shadowColor = hitFlash ? '#fff' : _bossGlowColor(type);

    // Dibuja la variante grande usando el sprite base escalado + corona
    const baseType = type.replace('big', '').toLowerCase();
    if (Sprites[baseType]) {
      ctx.save();
      ctx.translate(x + w/2, y + h);
      ctx.scale(dir, 1);
      ctx.translate(-w/2, -h);
      ctx.scale(1, 1); // ya está en dimensiones de boss
      ctx.restore();
      Sprites[baseType](ctx, x, y, w, h, dir, frame, hp, maxHp, hitFlash);
    }

    // Corona / halo de boss
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hitFlash ? '#fff' : _bossGlowColor(type);
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // Boss label
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 9px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', x + w/2, y - 2);

    ctx.restore();
  },

  /* ─── PLATAFORMA ──────────────────────────────────── */
  platform(ctx, x, y, w, h, epIndex) {
    const pal = CFG.EP_PALETTE[epIndex];
    // Base
    ctx.fillStyle = CFG.COLORS.platform;
    ctx.fillRect(x, y, w, h);
    // Top
    ctx.fillStyle = CFG.COLORS.platformTop;
    ctx.fillRect(x, y, w, 5);
    // Edge detail
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(x + 2, y + 2, w - 4, 2);
    // Mossy tint for ep1
    if (epIndex === 0) {
      ctx.fillStyle = 'rgba(60,120,40,0.25)';
      ctx.fillRect(x, y, w, 5);
    }
    // Stone for ep2
    if (epIndex === 1) {
      ctx.fillStyle = 'rgba(80,40,120,0.2)';
      ctx.fillRect(x, y, w, h);
      for (let i = 0; i < Math.floor(w/20); i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x + i*20, y, 1, h);
      }
    }
    // Lava-cracked for ep3
    if (epIndex === 2) {
      ctx.fillStyle = 'rgba(200,60,0,0.18)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,100,0,0.35)';
      ctx.fillRect(x, y, w, 3);
    }
  },

  /* ─── FONDO ───────────────────────────────────────── */
  background(ctx, W, H, epIndex, camX, frame) {
    const pal = CFG.EP_PALETTE[epIndex];

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, pal.sky);
    grad.addColorStop(1, pal.ground);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Parallax BG elements
    if (epIndex === 0) _drawCemeteryBG(ctx, W, H, camX, frame);
    if (epIndex === 1) _drawCryptBG(ctx, W, H, camX, frame);
    if (epIndex === 2) _drawHellBG(ctx, W, H, camX, frame);

    // Fog overlay
    ctx.fillStyle = pal.fog;
    ctx.fillRect(0, 0, W, H);
  },
};

/* ─── HELPERS PRIVADOS ───────────────────────────────── */
function _drawHPBar(ctx, bx, by, bw, hp, maxHp) {
  if (hp >= maxHp) return;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(bx, by, bw, 4);
  ctx.fillStyle = hp / maxHp > 0.5 ? '#44cc22' : hp / maxHp > 0.25 ? '#ffaa00' : '#ff2020';
  ctx.fillRect(bx, by, bw * (hp / maxHp), 4);
}

function _bossGlowColor(type) {
  if (type.includes('Zombie'))   return '#39ff14';
  if (type.includes('Skeleton')) return '#d4c9a8';
  if (type.includes('Bat'))      return '#aa44ff';
  if (type.includes('Ghost'))    return '#88ccff';
  if (type.includes('Fly'))      return '#88ff44';
  return '#ff2020';
}

function _drawCemeteryBG(ctx, W, H, camX, frame) {
  // Moon
  ctx.fillStyle = 'rgba(220,220,180,0.7)';
  ctx.beginPath(); ctx.arc(W*0.8, H*0.15, 28, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(150,150,100,0.5)';
  ctx.beginPath(); ctx.arc(W*0.8 + 8, H*0.15 - 5, 20, 0, Math.PI*2); ctx.fill();

  // Stars (parallax 0.1x)
  ctx.fillStyle = 'rgba(255,255,220,0.5)';
  const stars = [[50,30],[120,60],[200,20],[350,45],[500,25],[650,55],[720,35]];
  stars.forEach(([sx,sy]) => {
    const px = ((sx - camX * 0.05) % W + W) % W;
    const flicker = 0.4 + Math.sin(frame * 0.05 + sx) * 0.3;
    ctx.globalAlpha = flicker;
    ctx.fillRect(px, sy, 2, 2);
  });
  ctx.globalAlpha = 1;

  // Gravestones (parallax 0.3x)
  const stones = [80, 200, 360, 520, 680];
  stones.forEach(sx => {
    const px = ((sx - camX * 0.3) % (W + 200) + W + 200) % (W + 200) - 100;
    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(px - 12, H*0.55, 24, 42);
    ctx.beginPath(); ctx.arc(px, H*0.55, 12, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(px - 3, H*0.62, 6, 18);
  });

  // Trees (parallax 0.5x)
  [60, 300, 500, 720].forEach(sx => {
    const px = ((sx - camX * 0.5) % (W + 300) + W + 300) % (W + 300) - 150;
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(px - 5, H*0.3, 10, H*0.5);
    ctx.fillStyle = '#0a1a0a';
    ctx.beginPath(); ctx.arc(px, H*0.28, 30, 0, Math.PI*2); ctx.fill();
  });
}

function _drawCryptBG(ctx, W, H, camX, frame) {
  // Torches (flickering)
  [100, 300, 500, 700].forEach((sx, i) => {
    const px = ((sx - camX * 0.4) % (W + 300) + W + 300) % (W + 300) - 100;
    const flicker = 0.7 + Math.sin(frame * 0.2 + i) * 0.3;
    ctx.fillStyle = '#5a3000';
    ctx.fillRect(px - 3, H*0.35, 6, 22);
    ctx.fillStyle = `rgba(255,150,0,${flicker})`;
    ctx.beginPath(); ctx.arc(px, H*0.33, 8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(255,100,0,0.5)';
    ctx.fillStyle = `rgba(255,200,0,${flicker * 0.8})`;
    ctx.beginPath(); ctx.arc(px, H*0.31, 4, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Pillars
  [0, 200, 400, 600, 800].forEach(sx => {
    const px = ((sx - camX * 0.6) % (W + 400) + W + 400) % (W + 400) - 100;
    ctx.fillStyle = '#1a0d2e';
    ctx.fillRect(px - 18, H*0.1, 36, H*0.75);
    ctx.fillStyle = '#2a1a3e';
    ctx.fillRect(px - 20, H*0.1, 40, 12);
    ctx.fillRect(px - 20, H*0.78, 40, 10);
  });

  // Bats flying in BG
  for (let i = 0; i < 3; i++) {
    const bx = ((i * 250 - camX * 0.15 + frame * 0.5) % (W + 100) + W + 100) % (W + 100) - 50;
    const by = H * 0.12 + Math.sin(frame * 0.05 + i) * 20;
    ctx.fillStyle = 'rgba(50,20,70,0.5)';
    ctx.beginPath(); ctx.ellipse(bx, by, 12, 6, 0, 0, Math.PI*2); ctx.fill();
  }
}

function _drawHellBG(ctx, W, H, camX, frame) {
  // Lava pools
  [0, 200, 450, 680].forEach(sx => {
    const px = ((sx - camX * 0.4) % (W + 400) + W + 400) % (W + 400) - 100;
    const lavaAlpha = 0.6 + Math.sin(frame * 0.08 + sx) * 0.25;
    ctx.fillStyle = `rgba(255,60,0,${lavaAlpha})`;
    ctx.fillRect(px, H*0.82, 120, 16);
    ctx.fillStyle = `rgba(255,150,0,${lavaAlpha * 0.7})`;
    ctx.fillRect(px + 10, H*0.82, 80, 6);
  });

  // Fire pillars
  [100, 380, 620].forEach((sx, i) => {
    const px = ((sx - camX * 0.5) % (W + 300) + W + 300) % (W + 300) - 80;
    for (let f = 0; f < 4; f++) {
      const fh = (28 + Math.sin(frame * 0.2 + f + i) * 10);
      const alpha = (0.8 - f * 0.18) * (0.6 + Math.sin(frame*0.15 + f)*0.3);
      ctx.fillStyle = `rgba(255,${80 + f*30},0,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(px - 12 + f*2, H*0.72);
      ctx.lineTo(px, H*0.72 - fh - f*4);
      ctx.lineTo(px + 12 - f*2, H*0.72);
      ctx.closePath();
      ctx.fill();
    }
  });

  // Rocks / stalagmites
  [50, 180, 340, 500, 700].forEach(sx => {
    const px = ((sx - camX * 0.7) % (W + 300) + W + 300) % (W + 300) - 80;
    ctx.fillStyle = '#2a0800';
    ctx.beginPath();
    ctx.moveTo(px - 18, H*0.85);
    ctx.lineTo(px, H*0.55);
    ctx.lineTo(px + 18, H*0.85);
    ctx.closePath(); ctx.fill();
  });
}
