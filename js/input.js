/* ══════════════════════════════════════════════════════════
   input.js — Teclado y toque
   ══════════════════════════════════════════════════════════ */
'use strict';

const Input = {
  left:        false,
  right:       false,
  jumpPressed: false,   // solo true un frame
  punch:       false,   // solo true un frame
  kick:        false,   // solo true un frame
  _jumpHeld:   false,
  _keys:       {},

  init() {
    document.addEventListener('keydown', e => this._onKeyDown(e));
    document.addEventListener('keyup',   e => this._onKeyUp(e));
  },

  _onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (this._keys[k]) return; // ya estaba presionada (no repetir)
    this._keys[k] = true;

    // Movimiento
    if (k === 'a' || k === 'arrowleft')  this.left  = true;
    if (k === 'd' || k === 'arrowright') this.right = true;

    // Salto — W o ArrowUp
    if ((k === 'w' || k === 'arrowup') && !this._jumpHeld) {
      this.jumpPressed = true;
      this._jumpHeld   = true;
    }

    // Ataques
    if (k === 'j') this.punch = true;
    if (k === 'k') this.kick  = true;

    // Pausa
    if (k === 'escape') Game.togglePause();
  },

  _onKeyUp(e) {
    const k = e.key.toLowerCase();
    this._keys[k] = false;

    if (k === 'a' || k === 'arrowleft')  this.left  = false;
    if (k === 'd' || k === 'arrowright') this.right = false;
    if (k === 'w' || k === 'arrowup')    this._jumpHeld = false;
  },

  /* Llama esto al FINAL de cada update para consumir inputs de un solo frame */
  flush() {
    this.jumpPressed = false;
    this.punch       = false;
    this.kick        = false;
  },

  /* ─── SNAPSHOT para pasar a updatePlayer ────────── */
  snapshot() {
    return {
      left:        this.left,
      right:       this.right,
      jumpPressed: this.jumpPressed,
      punch:       this.punch,
      kick:        this.kick,
    };
  },
};
