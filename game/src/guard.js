import { GUARD } from './config.js';
import { dist, angleTo, angleDiff, norm } from './utils.js';

export class Guard {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.path = def.path.map(p => ({ ...p }));
    this.pathIndex = 0;
    this.facing = def.facing || 0;
    this.radius = GUARD.radius;
    this.state = 'patrol'; // patrol, investigate, chase
    this.investigatePoint = null;
    this.investigateTimer = 0;
    this.alertTimer = 0;
    this.lastKnownPlayer = null;
    this.suspicion = 0;
  }

  currentTarget() {
    return this.path[this.pathIndex];
  }

  advancePatrol() {
    this.pathIndex = (this.pathIndex + 1) % this.path.length;
  }

  // Vision cone: visible only within range and FOV; cover blocks sight via line-of-sight ray checks.
  canSeePlayer(player, world) {
    const d = dist(this, player);
    if (d > GUARD.viewDist) return false;
    const a = angleTo(this, player);
    const diff = Math.abs(angleDiff(this.facing, a));
    if (diff > GUARD.fov / 2) return false;
    return world.hasLineOfSight(this.x, this.y, player.x, player.y);
  }

  hearPlayer(player) {
    const d = dist(this, player);
    const range = GUARD.hearDist * (0.4 + player.noise);
    return player.noise > 0 && d < range;
  }

  update(dt, player, world) {
    let speed = GUARD.speed;
    let target = null;
    const sees = this.canSeePlayer(player, world);

    if (sees) {
      this.state = 'chase';
      this.alertTimer = GUARD.alertTime;
      this.lastKnownPlayer = { x: player.x, y: player.y };
      this.suspicion = 1;
    } else if (this.state === 'chase') {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.state = this.investigatePoint ? 'investigate' : 'patrol';
      }
    } else if (this.hearPlayer(player)) {
      this.investigatePoint = { x: player.x, y: player.y };
      this.investigateTimer = GUARD.investigateTime;
      if (this.state !== 'chase') this.state = 'investigate';
      this.suspicion = Math.min(1, this.suspicion + dt * 0.8);
    }

    if (this.state === 'chase') {
      speed = GUARD.chaseSpeed;
      target = this.lastKnownPlayer || { x: player.x, y: player.y };
    } else if (this.state === 'investigate') {
      speed = GUARD.speed * 1.05;
      target = this.investigatePoint;
      if (target && dist(this, target) < 10) {
        this.investigateTimer -= dt;
        // scan by slowly rotating
        this.facing += dt * 1.8;
        if (this.investigateTimer <= 0) {
          this.investigatePoint = null;
          this.state = 'patrol';
          this.suspicion = Math.max(0, this.suspicion - dt);
        }
        target = null;
      }
    } else {
      speed = GUARD.speed;
      target = this.currentTarget();
      if (target && dist(this, target) < 8) this.advancePatrol();
      this.suspicion = Math.max(0, this.suspicion - dt * 0.25);
    }

    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d > 1) {
        const n = norm(dx, dy);
        world.moveCircle(this, n.x * speed * dt, n.y * speed * dt, this.radius);
        this.facing = Math.atan2(n.y, n.x);
      }
    }

    return { seesPlayer: sees };
  }
}