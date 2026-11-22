import { WIDTH, HEIGHT } from './config.js';
import { LEVEL } from './level.js';
import { Input } from './input.js';
import { AudioManager } from './audio.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Guard } from './guard.js';
import { renderGame, overlayHTML } from './render.js';
import { dist, formatTime } from './utils.js';

function cloneLevel() {
  return {
    ...LEVEL,
    objectives: LEVEL.objectives.map(o => ({ ...o })),
    exit: { ...LEVEL.exit },
  };
}

export class Game {
  constructor(canvas, overlay) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.ctx = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    this.input = new Input();
    this.audio = new AudioManager();
    this.reset('title');
  }

  reset(state = 'playing') {
    this.level = cloneLevel();
    this.world = new World(this.level);
    this.player = new Player(this.level.playerStart.x, this.level.playerStart.y);
    this.guards = this.level.guards.map(g => new Guard(g));
    this.state = state;
    this.time = 0;
    this.timeLeft = 150;
    this.score = 0;
    this.message = '';
    this.messageTimer = 0;
    this.caughtReason = '';
    this.ending = null;
    this.updateOverlay();
  }

  collectedCount() {
    return this.level.objectives.filter(o => o.taken).length;
  }

  allCollected() {
    return this.collectedCount() === this.level.objectives.length;
  }

  showMessage(text, sec = 1.8) {
    this.message = text;
    this.messageTimer = sec;
  }

  updateOverlay() {
    if (this.state === 'title') {
      this.overlay.classList.remove('hidden');
      this.overlay.innerHTML = overlayHTML(
        'NIGHT SHIFT: THE GLASS ARCHIVE',
        'Slip through a midnight museum, steal three data shards, and reach the exit before the patrol locks you down.',
        [
          '<span class="kbd">WASD</span> / Arrows to move',
          '<span class="kbd">Shift</span> to sneak (quieter, slower)',
          '<span class="kbd">Space</span> to sprint (fast, loud)',
          'Avoid guard vision cones. Noise attracts investigation.',
        ],
        [],
        'Press <span class="kbd">Enter</span> to infiltrate'
      );
    } else if (this.state === 'won') {
      this.overlay.classList.remove('hidden');
      const bonus = Math.ceil(this.timeLeft * 10);
      this.overlay.innerHTML = overlayHTML(
        'ARCHIVE BREACHED',
        'You extracted every shard and vanished into the service lift.',
        [],
        [
          { label: 'Shards', value: '3/3', cls: 'good' },
          { label: 'Time Left', value: formatTime(this.timeLeft), cls: 'good' },
          { label: 'Score', value: this.score + bonus, cls: 'good' },
        ],
        'Press <span class="kbd">Enter</span> or <span class="kbd">R</span> to play again'
      );
    } else if (this.state === 'lost') {
      this.overlay.classList.remove('hidden');
      this.overlay.innerHTML = overlayHTML(
        'CAUGHT IN THE GLASS',
        this.caughtReason || 'The archive security net snapped shut.',
        [],
        [
          { label: 'Shards', value: `${this.collectedCount()}/3`, cls: this.collectedCount() === 3 ? 'good' : 'bad' },
          { label: 'Time Left', value: formatTime(this.timeLeft) },
          { label: 'Score', value: this.score, cls: 'bad' },
        ],
        'Press <span class="kbd">Enter</span> or <span class="kbd">R</span> to retry'
      );
    } else {
      this.overlay.classList.add('hidden');
      this.overlay.innerHTML = '';
    }
  }

  lose(reason) {
    if (this.state !== 'playing') return;
    this.state = 'lost';
    this.caughtReason = reason;
    this.audio.caught();
    this.updateOverlay();
  }

  win() {
    if (this.state !== 'playing') return;
    this.state = 'won';
    this.audio.win();
    this.updateOverlay();
  }

  update(dt) {
    if (this.input.wasPressed('enter')) {
      this.audio.ensure();
      if (this.state !== 'playing') this.reset('playing');
      this.input.consume('enter');
    }
    if (this.input.wasPressed('r')) {
      this.audio.ensure();
      this.reset('playing');
      this.input.consume('r');
    }

    if (this.state !== 'playing') {
      this.input.endFrame();
      return;
    }

    this.time += dt;
    this.timeLeft -= dt;
    if (this.messageTimer > 0) this.messageTimer -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.lose('Time ran out. The morning lockdown sealed the archive.');
      this.input.endFrame();
      return;
    }

    this.player.update(dt, this.input, this.world, this.audio);

    // Objectives
    for (const o of this.level.objectives) {
      if (o.taken) continue;
      if (dist(this.player, o) < this.player.radius + o.r) {
        o.taken = true;
        this.score += 500;
        this.audio.pickup();
        if (this.allCollected()) this.showMessage('All shards collected. Reach the exit!');
        else this.showMessage(`${o.label} secured.`);
      }
    }

    // Detection asymmetry: suspicion rises fast on sight/sound cues but decays slowly, so guards keep short memory.
    let anyChase = false;
    for (const g of this.guards) {
      const before = g.state;
      const info = g.update(dt, this.player, this.world);
      if (g.state === 'chase') anyChase = true;
      if (before !== 'chase' && g.state === 'chase') this.audio.alert();
      if (info.seesPlayer && dist(g, this.player) < g.radius + this.player.radius - 2) {
        this.lose('A guard caught you in direct sight.');
        this.input.endFrame();
        return;
      }
      if (dist(g, this.player) < g.radius + this.player.radius - 4) {
        this.lose('A patrol closed in before you could slip away.');
        this.input.endFrame();
        return;
      }
    }

    if (anyChase) this.score = Math.max(0, this.score - dt * 10);

    // Exit
    if (this.allCollected() && this.world.isInExit(this.player, this.player.radius)) {
      this.win();
    }

    this.input.endFrame();
  }

  render() {
    renderGame(this.ctx, {
      level: this.level,
      player: this.player,
      guards: this.guards,
      time: this.time,
      timeLeft: this.timeLeft,
      message: this.message,
      messageTimer: this.messageTimer,
    });
  }
}