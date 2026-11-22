import { formatTime, seeded } from './utils.js';

function placeGuardsAtWaypoints(game, rand) {
  game.guards.forEach((g, i) => {
    const idx = Math.floor(rand() * g.path.length) % g.path.length;
    const p = g.path[idx];
    const next = g.path[(idx + 1) % g.path.length];
    g.x = p.x;
    g.y = p.y;
    g.pathIndex = idx;
    g.facing = Math.atan2(next.y - p.y, next.x - p.x);
    g.state = 'patrol';
    g.alertTimer = 0;
    g.investigatePoint = null;
    g.investigateTimer = 0;
    g.suspicion = 0;
    g.lastKnownPlayer = null;
    // tiny deterministic offset to avoid exact overlap-looking stillness
    g.facing += (i % 2 === 0 ? 0 : 0.001);
  });
}

function stageStart(game) {
  game.reset('title');
  game.time = 1.2;
  game.timeLeft = 150;
  game.message = '';
  game.messageTimer = 0;
  game.updateOverlay();
}

function stagePlay(game, seed) {
  const rand = seeded(seed);
  game.reset('playing');
  game.time = 37.5;
  game.timeLeft = 112;
  game.score = 500;
  game.level.objectives[0].taken = true;
  game.message = 'Shard A secured.';
  game.messageTimer = 2;
  // Player tucked in cover behind a wall segment, sneaking.
  game.player.x = 3.5 * 40;
  game.player.y = 12.6 * 40;
  game.player.facing = Math.PI * 0.1;
  game.player.sneaking = true;
  game.player.sprinting = false;
  game.player.moveSpeed = 0;
  game.player.noise = 0;
  placeGuardsAtWaypoints(game, rand);
  game.updateOverlay();
}

function stageEnd(game, seed) {
  const rand = seeded(seed);
  game.reset('won');
  game.time = 118 + Math.floor(rand() * 5);
  game.timeLeft = 32;
  game.score = 1500;
  game.level.objectives.forEach(o => { o.taken = true; });
  // Place player at exit for a coherent victory frame.
  game.player.x = game.level.exit.x + game.level.exit.w / 2;
  game.player.y = game.level.exit.y + game.level.exit.h / 2;
  game.player.facing = -Math.PI / 2;
  placeGuardsAtWaypoints(game, seeded(seed + 7));
  game.caughtReason = '';
  game.message = '';
  game.messageTimer = 0;
  // Ensure overlay reflects final score with bonus
  game.updateOverlay();
  // Keep displayed time/score deterministic in case overlay computes bonus
  game.overlay.innerHTML = game.overlay.innerHTML.replace(/Score: <strong>[^<]+<\/strong>/, `Score: <strong>${game.score + Math.ceil(game.timeLeft * 10)}</strong>`);
}

export function stageShot(game, scene, seed = 1) {
  const s = String(scene || 'start').toLowerCase();
  if (s === 'play') stagePlay(game, seed);
  else if (s === 'end' || s === 'win') stageEnd(game, seed);
  else stageStart(game, seed);

  game.render();
  game.render();
  window.__shotReady = true;
}