/* ══════════════════════════════════════════════════════════
   ZOMBIE SURVIVAL 2D — game.js
   N0va Studios — v2.0 (Enhanced)
   ══════════════════════════════════════════════════════════ */

'use strict';

// ── CANVAS SETUP ─────────────────────────────────────────
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); });

// ── CONSTANTS ─────────────────────────────────────────────
const TILE        = 40;
const PLAYER_R    = 14;
const ZOMBIE_R    = 13;
const BULLET_R    = 4;
const BULLET_SPD  = 11;
const MAX_AMMO    = 12;
const RELOAD_TIME = 1800; // ms

// Colors
const C = {
  bg:        '#0a0a0a',
  grid:      'rgba(255,255,255,0.028)',
  gridAccent:'rgba(139,0,0,0.06)',
  player:    '#e8e8e8',
  playerOut: '#cc0000',
  gun:       '#888',
  gunDark:   '#444',
  bullet:    '#ffd700',
  bulletGlow:'rgba(255,215,0,0.4)',
  zombie:    ['#2d5a2d','#3a6b3a','#1e4a1e','#4a7a4a'],
  zombieOut: '#1a3a1a',
  blood:     '#8b0000',
  bloodBright:'#cc2200',
  wall:      '#1c1c1c',
  wallTop:   '#2a2a2a',
  wallLine:  '#333',
  floor:     '#111',
  particle:  '#cc2200',
  xpOrb:     '#39ff14',
  medkit:    '#ff4444',
  ammoBox:   '#ffd700',
};

// ── STATE ─────────────────────────────────────────────────
let state = 'menu'; // 'menu' | 'playing' | 'paused' | 'dead'

let player, bullets, zombies, particles, pickups;
let wave, score, kills, bestScore, frameId;
let waveTimer, waveActive, spawnQueue;
let reloading, reloadTimer, ammo;
let mousePos = { x: 0, y: 0 };
let mouseDown = false;
let keys = {};
let shootCooldown = 0;
let fireRateMobile = false;

// ── MAP ───────────────────────────────────────────────────
const MAP_W = 32, MAP_H = 22;
let map = [];

function generateMap() {
  map = [];
  for (let y = 0; y < MAP_H; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      // border walls
      if (x === 0 || y === 0 || x === MAP_W-1 || y === MAP_H-1) {
        map[y][x] = 1;
      } else {
        map[y][x] = 0;
      }
    }
  }

  // inner obstacles (deterministic layout)
  const walls = [
    [3,3,2,4],[7,2,4,2],[12,4,2,3],[17,3,3,2],[22,2,2,4],[26,5,2,3],
    [3,8,4,2],[9,7,2,5],[14,8,2,4],[19,6,2,2],[24,8,3,2],[28,7,2,4],
    [5,13,3,2],[11,12,2,4],[16,13,4,2],[21,11,2,3],[25,13,2,4],
    [3,16,2,3],[8,17,4,2],[14,16,3,3],[20,15,2,4],[27,16,2,3],
    [6,19,3,2],[13,19,5,1],[22,18,3,2],
  ];
  for (const [wx,wy,ww,wh] of walls) {
    for (let dy = 0; dy < wh; dy++)
      for (let dx = 0; dx < ww; dx++)
        if (wy+dy < MAP_H-1 && wx+dx < MAP_W-1)
          map[wy+dy][wx+dx] = 1;
  }
}

function tileAt(wx, wy) {
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 1;
  return map[ty][tx];
}

function isPassable(wx, wy) {
  return tileAt(wx, wy) === 0;
}

// ── CAMERA ────────────────────────────────────────────────
const cam = { x: 0, y: 0 };

function updateCamera() {
  if (!player) return;
  cam.x = player.x - canvas.width / 2;
  cam.y = player.y - canvas.height / 2;
  // clamp
  cam.x = Math.max(0, Math.min(MAP_W * TILE - canvas.width, cam.x));
  cam.y = Math.max(0, Math.min(MAP_H * TILE - canvas.height, cam.y));
}

function toScreen(wx, wy) {
  return { sx: wx - cam.x, sy: wy - cam.y };
}

function toWorld(sx, sy) {
  return { wx: sx + cam.x, wy: sy + cam.y };
}

// ── PLAYER ────────────────────────────────────────────────
function createPlayer() {
  return {
    x: MAP_W / 2 * TILE,
    y: MAP_H / 2 * TILE,
    vx: 0, vy: 0,
    hp: 100, maxHp: 100,
    speed: 3.2,
    angle: 0,
    radius: PLAYER_R,
    invincible: 0,
    trail: [],
  };
}

function updatePlayer(dt) {
  if (!player) return;

  // input
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']    || mobileKeys.up)    dy -= 1;
  if (keys['s'] || keys['arrowdown']  || mobileKeys.down)  dy += 1;
  if (keys['a'] || keys['arrowleft']  || mobileKeys.left)  dx -= 1;
  if (keys['d'] || keys['arrowright'] || mobileKeys.right) dx += 1;

  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

  const spd = player.speed;
  const nx = player.x + dx * spd;
  const ny = player.y + dy * spd;

  if (isPassable(nx, player.y)) player.x = nx;
  if (isPassable(player.x, ny)) player.y = ny;

  // aim angle toward mouse (world space)
  const wm = toWorld(mousePos.x, mousePos.y);
  player.angle = Math.atan2(wm.wy - player.y, wm.wx - player.x);

  // trail
  player.trail.push({ x: player.x, y: player.y, a: 0.18 });
  if (player.trail.length > 6) player.trail.shift();
  player.trail.forEach(t => t.a -= 0.025);

  // invincibility frames
  if (player.invincible > 0) player.invincible -= dt;

  // shoot
  if (shootCooldown > 0) shootCooldown -= dt;
  if ((mouseDown || fireRateMobile) && !reloading && ammo > 0 && shootCooldown <= 0) {
    shoot();
  }

  // auto-reload if empty
  if (ammo <= 0 && !reloading) startReload();

  // reload timer
  if (reloading) {
    reloadTimer -= dt;
    if (reloadTimer <= 0) {
      ammo = MAX_AMMO;
      reloading = false;
      updateAmmoHUD();
    }
  }
}

function shoot() {
  if (!player) return;
  const spread = (Math.random() - 0.5) * 0.06;
  const angle = player.angle + spread;
  const speed = BULLET_SPD;
  bullets.push({
    x: player.x + Math.cos(angle) * (PLAYER_R + 6),
    y: player.y + Math.sin(angle) * (PLAYER_R + 6),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: BULLET_R,
    life: 1,
    owner: 'player',
  });
  ammo--;
  shootCooldown = 120;
  updateAmmoHUD();

  // muzzle flash particle
  for (let i = 0; i < 4; i++) {
    const a = angle + (Math.random() - 0.5) * 0.8;
    const s = 2 + Math.random() * 3;
    particles.push({
      x: player.x + Math.cos(angle) * (PLAYER_R + 8),
      y: player.y + Math.sin(angle) * (PLAYER_R + 8),
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.4, maxLife: 0.4,
      r: 3, color: '#ffd700', type: 'spark',
    });
  }
}

function startReload() {
  if (ammo === MAX_AMMO) return;
  reloading = true;
  reloadTimer = RELOAD_TIME;
  document.getElementById('reloadFlash').style.opacity = '1';
  setTimeout(() => document.getElementById('reloadFlash').style.opacity = '0', 150);
}

// ── ZOMBIES ───────────────────────────────────────────────
const ZOMBIE_TYPES = [
  { name: 'walker',  hp: 60,  spd: 1.1, dmg: 8,  score: 10, r: ZOMBIE_R,   color: 0 },
  { name: 'runner',  hp: 35,  spd: 2.0, dmg: 5,  score: 15, r: ZOMBIE_R-2, color: 1 },
  { name: 'brute',   hp: 200, spd: 0.7, dmg: 20, score: 30, r: ZOMBIE_R+5, color: 3 },
  { name: 'crawler', hp: 45,  spd: 1.4, dmg: 6,  score: 12, r: ZOMBIE_R-3, color: 2 },
];

function spawnZombie() {
  // Spawn on map edges (out of view)
  const side = Math.floor(Math.random() * 4);
  let x, y;
  const M = TILE;

  if (side === 0) { x = M + Math.random() * (MAP_W-2)*TILE; y = M; }
  else if (side === 1) { x = (MAP_W-1)*TILE - M; y = M + Math.random() * (MAP_H-2)*TILE; }
  else if (side === 2) { x = M + Math.random() * (MAP_W-2)*TILE; y = (MAP_H-1)*TILE - M; }
  else { x = M; y = M + Math.random() * (MAP_H-2)*TILE; }

  // Choose type weighted by wave
  const wv = wave;
  const weights = [
    10,
    Math.min(wv * 2, 8),
    Math.max(0, wv - 3),
    Math.min(wv * 1.5, 6),
  ];
  const total = weights.reduce((a,b) => a+b, 0);
  let rand = Math.random() * total;
  let typeIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) { typeIdx = i; break; }
  }

  const type = ZOMBIE_TYPES[typeIdx];
  const hpMult = 1 + (wave - 1) * 0.18;

  zombies.push({
    x, y,
    vx: 0, vy: 0,
    hp: Math.floor(type.hp * hpMult),
    maxHp: Math.floor(type.hp * hpMult),
    speed: type.spd + wave * 0.04,
    dmg: type.dmg,
    scoreVal: type.score,
    radius: type.r,
    color: C.zombie[type.color],
    name: type.name,
    angle: 0,
    stagger: 0,
    pathTimer: 0,
    tx: x, ty: y, // target
    hitFlash: 0,
  });
}

function updateZombies(dt) {
  for (let i = zombies.length - 1; i >= 0; i--) {
    const z = zombies[i];

    if (z.stagger > 0) { z.stagger -= dt; }

    // Pathfinding: simple direct chase with wall avoidance
    z.pathTimer -= dt;
    if (z.pathTimer <= 0 && player) {
      z.pathTimer = 200 + Math.random() * 300;
      z.tx = player.x;
      z.ty = player.y;
    }

    if (player && z.stagger <= 0) {
      const pdx = z.tx - z.x;
      const pdy = z.ty - z.y;
      const dist = Math.hypot(pdx, pdy);
      if (dist > 1) {
        const nx = z.x + (pdx / dist) * z.speed;
        const ny = z.y + (pdy / dist) * z.speed;
        // slide along walls
        if (isPassable(nx, z.y)) z.x = nx;
        if (isPassable(z.x, ny)) z.y = ny;
        z.angle = Math.atan2(pdy, pdx);
      }

      // Attack player
      const dToPlayer = Math.hypot(player.x - z.x, player.y - z.y);
      if (dToPlayer < player.radius + z.radius + 2 && player.invincible <= 0) {
        player.hp -= z.dmg;
        player.invincible = 500;
        z.stagger = 200;
        updateHealthHUD();
        flashHit();
        if (player.hp <= 0) endGame();
      }
    }

    z.hitFlash = Math.max(0, z.hitFlash - dt * 0.005);
  }
}

// ── BULLETS ───────────────────────────────────────────────
function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life -= 0.012;

    // hit wall
    if (tileAt(b.x, b.y) === 1 || b.life <= 0) {
      spawnImpactParticles(b.x, b.y, C.bullet, 4);
      bullets.splice(i, 1);
      continue;
    }

    // hit zombie
    let hit = false;
    for (let j = zombies.length - 1; j >= 0; j--) {
      const z = zombies[j];
      if (Math.hypot(b.x - z.x, b.y - z.y) < z.radius + b.radius) {
        z.hp -= 25 + wave * 2;
        z.hitFlash = 1;
        z.stagger = 120;
        spawnBloodParticles(b.x, b.y, 8);
        bullets.splice(i, 1);
        hit = true;

        if (z.hp <= 0) {
          score += z.scoreVal + wave * 2;
          kills++;
          spawnBloodParticles(z.x, z.y, 20);
          dropPickup(z.x, z.y);
          addKillFeed(z.name);
          zombies.splice(j, 1);
          updateScoreHUD();
        }
        break;
      }
    }
    if (hit) continue;
  }
}

// ── PARTICLES ─────────────────────────────────────────────
function spawnBloodParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.5 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.6 + Math.random() * 0.6,
      maxLife: 1.2,
      r: 1.5 + Math.random() * 2.5,
      color: Math.random() < 0.7 ? C.blood : C.bloodBright,
      type: 'blood',
    });
  }
}

function spawnImpactParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.3 + Math.random() * 0.3, maxLife: 0.6,
      r: 1 + Math.random() * 2,
      color, type: 'spark',
    });
  }
}

function updateParticles(dt) {
  const dtF = dt / 16.67;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dtF;
    p.y += p.vy * dtF;
    p.vx *= 0.91;
    p.vy *= 0.91;
    p.vy += (p.type === 'blood' ? 0.06 : 0.02) * dtF;
    p.life -= dt * 0.001;
    if (p.life <= 0) { particles.splice(i, 1); }
  }
}

// ── PICKUPS ───────────────────────────────────────────────
function dropPickup(x, y) {
  const r = Math.random();
  if (r < 0.08) {
    pickups.push({ x, y, type: 'medkit', life: 8000, r: 8, pulse: 0 });
  } else if (r < 0.18) {
    pickups.push({ x, y, type: 'ammo', life: 8000, r: 7, pulse: 0 });
  }
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.life -= dt;
    p.pulse += dt * 0.003;
    if (p.life <= 0) { pickups.splice(i, 1); continue; }
    if (!player) continue;
    if (Math.hypot(p.x - player.x, p.y - player.y) < player.radius + p.r + 4) {
      if (p.type === 'medkit') {
        player.hp = Math.min(player.maxHp, player.hp + 30);
        updateHealthHUD();
        spawnImpactParticles(p.x, p.y, '#ff4444', 8);
      } else {
        ammo = MAX_AMMO;
        reloading = false;
        reloadTimer = 0;
        updateAmmoHUD();
        spawnImpactParticles(p.x, p.y, '#ffd700', 8);
      }
      pickups.splice(i, 1);
    }
  }
}

// ── WAVE SYSTEM ───────────────────────────────────────────
function startWave(n) {
  wave = n;
  const count = 5 + n * 3 + Math.floor(n * n * 0.5);
  spawnQueue = count;
  waveActive = true;
  document.getElementById('waveValue').textContent = n;
  showWaveBadge(n);
}

function showWaveBadge(n) {
  const badge = document.getElementById('waveBadge');
  badge.textContent = `OLEADA ${n}`;
  badge.classList.add('show');
  setTimeout(() => badge.classList.remove('show'), 2200);
}

let spawnInterval = null;

function startSpawning() {
  if (spawnInterval) clearInterval(spawnInterval);
  const delay = Math.max(400, 1200 - wave * 60);
  spawnInterval = setInterval(() => {
    if (state !== 'playing' || !waveActive) return;
    if (spawnQueue > 0) {
      spawnZombie();
      spawnQueue--;
    }
  }, delay);
}

// ── DRAW ──────────────────────────────────────────────────
function drawMap() {
  const startTX = Math.max(0, Math.floor(cam.x / TILE));
  const startTY = Math.max(0, Math.floor(cam.y / TILE));
  const endTX = Math.min(MAP_W, startTX + Math.ceil(canvas.width / TILE) + 2);
  const endTY = Math.min(MAP_H, startTY + Math.ceil(canvas.height / TILE) + 2);

  for (let ty = startTY; ty < endTY; ty++) {
    for (let tx = startTX; tx < endTX; tx++) {
      const sx = tx * TILE - cam.x;
      const sy = ty * TILE - cam.y;
      const tile = map[ty] && map[ty][tx];

      if (tile === 1) {
        // Wall
        ctx.fillStyle = C.wall;
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = C.wallTop;
        ctx.fillRect(sx, sy, TILE, 4);
        ctx.strokeStyle = C.wallLine;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx + 0.5, sy + 0.5, TILE - 1, TILE - 1);
        // brick texture
        if ((tx + ty) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.02)';
          ctx.fillRect(sx + TILE*0.1, sy + TILE*0.1, TILE*0.35, TILE*0.35);
          ctx.fillRect(sx + TILE*0.55, sy + TILE*0.55, TILE*0.35, TILE*0.35);
        }
      } else {
        // Floor
        ctx.fillStyle = C.floor;
        ctx.fillRect(sx, sy, TILE, TILE);
        // subtle grid
        ctx.strokeStyle = (tx % 4 === 0 || ty % 4 === 0) ? C.gridAccent : C.grid;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, TILE, TILE);
      }
    }
  }
}

function drawPickups() {
  for (const p of pickups) {
    const { sx, sy } = toScreen(p.x, p.y);
    const scale = 1 + Math.sin(p.pulse) * 0.1;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(scale, scale);

    // glow
    const gColor = p.type === 'medkit' ? 'rgba(255,60,60,0.3)' : 'rgba(255,215,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.type === 'medkit' ? '#ff4444' : '#ffd700';

    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.type === 'medkit' ? '#cc2222' : '#cc9900';
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = `bold ${p.r + 2}px Share Tech Mono`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.type === 'medkit' ? '+' : '◆', 0, 0);

    ctx.restore();
  }
}

function drawBullets() {
  for (const b of bullets) {
    const { sx, sy } = toScreen(b.x, b.y);

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = C.bulletGlow;

    // trail
    ctx.beginPath();
    ctx.moveTo(sx - b.vx * 3, sy - b.vy * 3);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = 'rgba(255,215,0,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = C.bullet;
    ctx.fill();

    ctx.restore();
  }
}

function drawZombies() {
  for (const z of zombies) {
    const { sx, sy } = toScreen(z.x, z.y);
    const r = z.radius;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(z.angle);

    // shadow
    ctx.beginPath();
    ctx.ellipse(2, 4, r * 0.8, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // body
    const flashColor = z.hitFlash > 0 ? `rgba(255,${Math.floor(255*(1-z.hitFlash))},${Math.floor(255*(1-z.hitFlash))},1)` : z.color;
    ctx.shadowBlur = z.name === 'brute' ? 14 : 0;
    ctx.shadowColor = '#1a5a1a';

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = z.hitFlash > 0 ? '#fff' : z.color;
    ctx.fill();
    ctx.strokeStyle = C.zombieOut;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // face detail
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // brute indicator
    if (z.name === 'brute') {
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();

    // HP bar (only if damaged)
    if (z.hp < z.maxHp) {
      const bw = r * 2.4;
      const bx = sx - bw / 2;
      const by = sy - r - 10;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
      ctx.fillStyle = '#cc2200';
      ctx.fillRect(bx, by, bw * (z.hp / z.maxHp), 4);
    }
  }
}

function drawPlayer() {
  if (!player) return;
  const { sx, sy } = toScreen(player.x, player.y);

  // shadow
  ctx.beginPath();
  ctx.ellipse(sx + 2, sy + 5, PLAYER_R * 0.8, PLAYER_R * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();

  ctx.save();
  ctx.translate(sx, sy);

  // trail
  for (const t of player.trail) {
    const tp = toScreen(t.x, t.y);
    ctx.beginPath();
    ctx.arc(tp.sx - sx, tp.sy - sy, PLAYER_R * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,200,200,${t.a})`;
    ctx.fill();
  }

  // invincible flicker
  if (player.invincible > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
    ctx.restore();
    return;
  }

  // body glow
  ctx.shadowBlur = 10;
  ctx.shadowColor = C.playerOut;

  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2);
  ctx.fillStyle = C.player;
  ctx.fill();
  ctx.strokeStyle = C.playerOut;
  ctx.lineWidth = 2;
  ctx.stroke();

  // gun
  ctx.rotate(player.angle);
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.gunDark;
  ctx.fillRect(PLAYER_R - 2, -3, 14, 6);
  ctx.fillStyle = C.gun;
  ctx.fillRect(PLAYER_R, -2, 12, 4);

  // muzzle if reloading
  if (reloading) {
    const prog = 1 - (reloadTimer / RELOAD_TIME);
    ctx.fillStyle = `rgba(255,215,0,${prog * 0.5})`;
    ctx.beginPath();
    ctx.arc(PLAYER_R + 12, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    const { sx, sy } = toScreen(p.x, p.y);
    const alpha = p.life / p.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.type === 'spark') {
      ctx.shadowBlur = 4;
      ctx.shadowColor = p.color;
    }
    ctx.beginPath();
    ctx.arc(sx, sy, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }
}

function drawReloadBar() {
  if (!reloading || !player) return;
  const { sx, sy } = toScreen(player.x, player.y);
  const prog = 1 - (reloadTimer / RELOAD_TIME);
  const bw = 50;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(sx - bw/2 - 1, sy + PLAYER_R + 6, bw + 2, 7);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(sx - bw/2, sy + PLAYER_R + 7, bw * prog, 5);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '8px Share Tech Mono';
  ctx.textAlign = 'center';
  ctx.fillText('RECARGANDO', sx, sy + PLAYER_R + 22);
}

// ── HUD UPDATES ───────────────────────────────────────────
function updateHealthHUD() {
  if (!player) return;
  const pct = Math.max(0, player.hp / player.maxHp);
  document.getElementById('healthFill').style.width = (pct * 100) + '%';
  document.getElementById('healthValue').textContent = Math.max(0, Math.floor(player.hp));
}

function updateAmmoHUD() {
  document.getElementById('ammoValue').textContent =
    reloading ? 'CARGANDO...' : `${ammo}/${MAX_AMMO}`;

  const bar = document.getElementById('ammoBar');
  bar.innerHTML = '';
  for (let i = 0; i < MAX_AMMO; i++) {
    const pip = document.createElement('div');
    pip.className = 'bullet-pip' + (i >= ammo ? ' empty' : '');
    bar.appendChild(pip);
  }
}

function updateScoreHUD() {
  document.getElementById('scoreValue').textContent = score;
}

function flashHit() {
  const overlay = document.getElementById('hitOverlay');
  overlay.style.opacity = '1';
  setTimeout(() => overlay.style.opacity = '0', 100);
}

function addKillFeed(type) {
  const feed = document.getElementById('killFeed');
  const el = document.createElement('div');
  el.className = 'kill-entry';
  const names = { walker: 'Walker', runner: 'Corredor', brute: 'BRUTO', crawler: 'Rastreador' };
  el.textContent = `⚰ ${names[type] || type} eliminado`;
  feed.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 2000);
  while (feed.children.length > 5) feed.removeChild(feed.firstChild);
}

// ── SCREENS ───────────────────────────────────────────────
function showScreen(id) {
  ['screenMenu','screenPause','screenDead'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });
  if (id) document.getElementById(id).classList.remove('hidden');
}

// ── GAME FLOW ─────────────────────────────────────────────
function initGame() {
  generateMap();
  player  = createPlayer();
  bullets = [];
  zombies = [];
  particles = [];
  pickups = [];
  wave    = 0;
  score   = 0;
  kills   = 0;
  ammo    = MAX_AMMO;
  reloading = false;
  reloadTimer = 0;
  fireRateMobile = false;
  shootCooldown = 0;
  mobileKeys = { up: false, down: false, left: false, right: false };

  updateHealthHUD();
  updateAmmoHUD();
  updateScoreHUD();

  if (spawnInterval) clearInterval(spawnInterval);

  startWave(1);
  startSpawning();
}

function startGame() {
  state = 'playing';
  showScreen(null);
  document.getElementById('hud').style.opacity = '1';
  document.getElementById('pauseIndicator').style.opacity = '1';
  initGame();
  if (frameId) cancelAnimationFrame(frameId);
  lastTime = performance.now();
  frameId = requestAnimationFrame(loop);
}

function pauseGame() {
  if (state !== 'playing') return;
  state = 'paused';
  showScreen('screenPause');
}

function resumeGame() {
  if (state !== 'paused') return;
  state = 'playing';
  showScreen(null);
  lastTime = performance.now();
}

function endGame() {
  state = 'dead';
  if (spawnInterval) clearInterval(spawnInterval);

  bestScore = Math.max(bestScore || 0, score);
  localStorage.setItem('zombieBest', bestScore);

  document.getElementById('statScore').textContent = score;
  document.getElementById('statWave').textContent  = wave;
  document.getElementById('statKills').textContent = kills;
  document.getElementById('statBest').textContent  = bestScore;

  setTimeout(() => showScreen('screenDead'), 600);
}

function goMenu() {
  state = 'menu';
  if (spawnInterval) clearInterval(spawnInterval);
  showScreen('screenMenu');
  document.getElementById('bestScoreMenu').textContent = `MEJOR: ${bestScore || 0} PTS`;
}

// ── MAIN LOOP ─────────────────────────────────────────────
let lastTime = 0;

function loop(ts) {
  const dt = Math.min(ts - lastTime, 50);
  lastTime = ts;

  if (state === 'playing') {
    update(dt);
    draw();

    // check wave clear
    if (waveActive && spawnQueue <= 0 && zombies.length === 0) {
      waveActive = false;
      setTimeout(() => {
        if (state === 'playing') {
          startWave(wave + 1);
          startSpawning();
        }
      }, 3000);
    }
  } else if (state === 'paused' || state === 'dead') {
    draw(); // keep drawing the game behind
  }

  frameId = requestAnimationFrame(loop);
}

function update(dt) {
  updatePlayer(dt);
  updateZombies(dt);
  updateBullets(dt);
  updateParticles(dt);
  updatePickups(dt);
  updateCamera();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPickups();
  drawParticles();
  drawBullets();
  drawZombies();
  drawPlayer();
  drawReloadBar();
}

// ── INPUT ─────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === 'escape') {
    if (state === 'playing') pauseGame();
    else if (state === 'paused') resumeGame();
  }
  if (k === 'r' && state === 'playing' && !reloading && ammo < MAX_AMMO) {
    startReload();
  }
});

document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', e => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) mouseDown = true;
});

canvas.addEventListener('mouseup', e => {
  if (e.button === 0) mouseDown = false;
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

// ── MOBILE CONTROLS ───────────────────────────────────────
let mobileKeys = { up: false, down: false, left: false, right: false };

function setupMobileBtn(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', e => { e.preventDefault(); mobileKeys[key] = true; }, { passive: false });
  el.addEventListener('touchend',   e => { e.preventDefault(); mobileKeys[key] = false; }, { passive: false });
}
setupMobileBtn('dUp',    'up');
setupMobileBtn('dDown',  'down');
setupMobileBtn('dLeft',  'left');
setupMobileBtn('dRight', 'right');

const btnFireMobile = document.getElementById('btnFireMobile');
if (btnFireMobile) {
  btnFireMobile.addEventListener('touchstart', e => { e.preventDefault(); fireRateMobile = true; }, { passive: false });
  btnFireMobile.addEventListener('touchend',   e => { e.preventDefault(); fireRateMobile = false; }, { passive: false });
}
const btnReloadMobile = document.getElementById('btnReloadMobile');
if (btnReloadMobile) {
  btnReloadMobile.addEventListener('touchstart', e => {
    e.preventDefault();
    if (state === 'playing' && !reloading) startReload();
  }, { passive: false });
}

// For mobile aiming: tap on canvas
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const t = e.touches[0];
  mousePos.x = t.clientX;
  mousePos.y = t.clientY;
}, { passive: false });

// ── BUTTON EVENTS ─────────────────────────────────────────
document.getElementById('btnPlay').addEventListener('click', startGame);
document.getElementById('btnContinue').addEventListener('click', resumeGame);
document.getElementById('btnRetry').addEventListener('click', startGame);
document.getElementById('btnMenuFromPause').addEventListener('click', goMenu);
document.getElementById('btnMenuFromDead').addEventListener('click', goMenu);

// ── INIT ──────────────────────────────────────────────────
bestScore = parseInt(localStorage.getItem('zombieBest') || '0', 10);
document.getElementById('bestScoreMenu').textContent = `MEJOR: ${bestScore} PTS`;

// Draw idle background while in menu
generateMap();
lastTime = performance.now();
frameId = requestAnimationFrame(loop);
