import { Game } from './src/game.js';
import { stageShot } from './src/shots.js';

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const game = new Game(canvas, overlay);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? '1');

let last = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  game.update(dt);
  game.render();
  requestAnimationFrame(frame);
}

if (shot) {
  stageShot(game, shot, Number.isFinite(seed) ? seed : 1);
} else {
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
}, { passive: false });
