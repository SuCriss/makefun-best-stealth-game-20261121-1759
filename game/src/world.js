import { circleRectCollide, dist, clamp } from './utils.js';

export class World {
  constructor(level) {
    this.level = level;
    this.walls = level.walls;
  }

  collidesCircle(x, y, r) {
    return this.walls.some(w => circleRectCollide(x, y, r, w));
  }

  moveCircle(entity, dx, dy, radius) {
    let nx = entity.x + dx;
    let ny = entity.y + dy;
    // Resolve axis separately for sliding along walls
    if (!this.collidesCircle(nx, entity.y, radius)) {
      entity.x = nx;
    } else {
      // push out minimally
      const step = Math.sign(dx) * 0.5;
      for (let i = 0; i < Math.abs(dx) * 2 + 2; i++) {
        if (!this.collidesCircle(entity.x + step, entity.y, radius)) entity.x += step;
        else break;
      }
    }
    if (!this.collidesCircle(entity.x, ny, radius)) {
      entity.y = ny;
    } else {
      const step = Math.sign(dy) * 0.5;
      for (let i = 0; i < Math.abs(dy) * 2 + 2; i++) {
        if (!this.collidesCircle(entity.x, entity.y + step, radius)) entity.y += step;
        else break;
      }
    }
  }

  hasLineOfSight(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const d = Math.hypot(dx, dy);
    if (d === 0) return true;
    const steps = Math.ceil(d / 6);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = ax + dx * t;
      const y = ay + dy * t;
      for (const w of this.walls) {
        if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return false;
      }
    }
    return true;
  }

  nearestPointOnRect(x, y, r) {
    return { x: clamp(x, r.x, r.x + r.w), y: clamp(y, r.y, r.y + r.h) };
  }

  isInExit(entity, radius) {
    const e = this.level.exit;
    const nx = clamp(entity.x, e.x, e.x + e.w);
    const ny = clamp(entity.y, e.y, e.y + e.h);
    return dist(entity, { x: nx, y: ny }) < radius;
  }
}