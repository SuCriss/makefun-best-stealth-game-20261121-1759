export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set();
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLower();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  down(key) { return this.keys.has(key); }
  wasPressed(key) { return this.pressed.has(key); }
  consume(key) { this.pressed.delete(key); }
  endFrame() { this.pressed.clear(); }

  axis() {
    let x = 0;
    let y = 0;
    if (this.down('a') || this.down('arrowleft')) x -= 1;
    if (this.down('d') || this.down('arrowright')) x += 1;
    if (this.down('w') || this.down('arrowup')) y -= 1;
    if (this.down('s') || this.down('arrowdown')) y += 1;
    if (x && y) {
      const inv = 1 / Math.sqrt(2);
      x *= inv; y *= inv;
    }
    return { x, y };
  }
}