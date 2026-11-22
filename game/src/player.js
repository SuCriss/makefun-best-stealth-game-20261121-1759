import { PLAYER } from './config.js';
import { clamp } from './utils.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = PLAYER.radius;
    this.facing = -Math.PI / 2;
    this.moveSpeed = 0;
    this.noise = 0;
    this.sneaking = false;
    this.sprinting = false;
    this.stepTimer = 0;
  }

  update(dt, input, world, audio) {
    const axis = input.axis();
    const moving = axis.x !== 0 || axis.y !== 0;
    this.sneaking = input.down('shift');
    this.sprinting = input.down(' ') && !this.sneaking;

    let speed = PLAYER.walkSpeed;
    let noise = PLAYER.noiseWalk;
    if (this.sneaking) { speed = PLAYER.sneakSpeed; noise = PLAYER.noiseSneak; }
    if (this.sprinting) { speed = PLAYER.sprintSpeed; noise = PLAYER.noiseSprint; }
    if (!moving) { speed = 0; noise = 0; }

    this.moveSpeed = speed;
    this.noise = noise;

    if (moving) {
      this.facing = Math.atan2(axis.y, axis.x);
      world.moveCircle(this, axis.x * speed * dt, axis.y * speed * dt, this.radius);
      this.stepTimer -= dt;
      const interval = this.sprinting ? 0.22 : this.sneaking ? 0.55 : 0.34;
      if (this.stepTimer <= 0) {
        audio.step();
        this.stepTimer = interval;
      }
    } else {
      this.stepTimer = 0;
    }

    this.x = clamp(this.x, 20, 1260);
    this.y = clamp(this.y, 20, 700);
  }
}