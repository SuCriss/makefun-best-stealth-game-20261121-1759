export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Determinism rule: the same seed must produce identical guard patrol/layout state so runs and screenshots match byte for byte.
export function seeded(seed) {
  let s = (Number(seed) || 1) >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
export function len(x, y) { return Math.hypot(x, y); }
export function norm(x, y) {
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}
export function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function angleTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
export function angleDiff(a, b) {
  let d = (b - a + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return d;
}
export function lerp(a, b, t) { return a + (b - a) * t; }
export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function circleRectCollide(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}
export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
export function formatTime(s) {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
}