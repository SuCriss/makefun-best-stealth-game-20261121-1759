import { COLORS, TILE, WIDTH, HEIGHT } from './config.js';
import { formatTime } from './utils.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function renderGame(ctx, state) {
  const { level, player, guards, timeLeft, message, messageTimer } = state;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Floor
  for (let y = 0; y < HEIGHT; y += TILE) {
    for (let x = 0; x < WIDTH; x += TILE) {
      const alt = ((x / TILE + y / TILE) % 2) === 0;
      ctx.fillStyle = alt ? COLORS.floor : COLORS.floorAlt;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    }
  }

  // Exit
  const ex = level.exit;
  const allCollected = level.objectives.every(o => o.taken);
  ctx.fillStyle = allCollected ? 'rgba(150,255,167,0.16)' : 'rgba(255,138,91,0.12)';
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = allCollected ? COLORS.exitOpen : COLORS.exitLocked;
  ctx.lineWidth = 2;
  ctx.strokeRect(ex.x + 1, ex.y + 1, ex.w - 2, ex.h - 2);
  ctx.fillStyle = allCollected ? COLORS.exitOpen : COLORS.exitLocked;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(allCollected ? 'EXIT' : 'LOCKED', ex.x + ex.w / 2, ex.y + ex.h / 2 + 4);

  // Glass decorations
  ctx.fillStyle = 'rgba(111,200,255,0.25)';
  for (const g of level.glass) ctx.fillRect(g.x, g.y, g.w, g.h);

  // Decorations
  for (const d of level.decorations) {
    ctx.fillStyle = 'rgba(130,170,210,0.12)';
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.strokeStyle = 'rgba(130,170,210,0.25)';
    ctx.strokeRect(d.x, d.y, d.w, d.h);
  }

  // Objectives
  for (const o of level.objectives) {
    if (o.taken) continue;
    const pulse = 0.5 + Math.sin(state.time * 3 + o.x * 0.01) * 0.2;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = `rgba(142,240,255,${0.25 + pulse * 0.25})`;
    ctx.fillRect(-16, -16, 32, 32);
    ctx.strokeStyle = COLORS.objective;
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.restore();
    ctx.fillStyle = COLORS.objective;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(o.label, o.x, o.y - 20);
  }

  // Guard vision cones
  for (const g of guards) {
    const alert = g.state === 'chase';
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.facing);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 185, -0.72 * Math.PI / 2, 0.72 * Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = alert ? COLORS.visionAlert : COLORS.vision;
    ctx.fill();
    ctx.restore();
  }

  // Walls
  for (const w of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(w.x, w.y, w.w, Math.min(4, w.h));
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }

  // Guards
  for (const g of guards) {
    const alert = g.state === 'chase';
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, g.radius + 2, g.radius * 0.9, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = alert ? COLORS.guardAlert : COLORS.guard;
    ctx.beginPath(); ctx.arc(0, 0, g.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1208';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(g.facing) * (g.radius + 8), Math.sin(g.facing) * (g.radius + 8));
    ctx.stroke();
    // flashlight/body marker
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Player
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, player.radius + 2, player.radius * 0.9, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.playerCloak;
  ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = COLORS.player;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, player.radius - 2, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(player.facing) * (player.radius + 7), Math.sin(player.facing) * (player.radius + 7));
  ctx.stroke();
  if (player.sneaking) {
    ctx.strokeStyle = 'rgba(142,240,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();

  // HUD hierarchy: objective/shards first, detection/mode state second, timer third, controls/restart cues last.
  ctx.fillStyle = 'rgba(5,12,20,0.55)';
  ctx.fillRect(12, 12, 420, 72);
  ctx.strokeStyle = 'rgba(142,240,255,0.2)';
  ctx.strokeRect(12, 12, 420, 72);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NIGHT SHIFT: THE GLASS ARCHIVE', 24, 34);
  ctx.font = '13px monospace';
  const collected = level.objectives.filter(o => o.taken).length;
  ctx.fillStyle = '#cfe3f3';
  ctx.fillText(`Shards: ${collected}/3   Time: ${formatTime(timeLeft)}`, 24, 54);
  const stealthState = player.sneaking ? 'SNEAK' : player.sprinting ? 'SPRINT' : 'WALK';
  ctx.fillStyle = player.sprinting ? '#ffbf69' : player.sneaking ? '#96ffa7' : '#8ef0ff';
  ctx.fillText(`Mode: ${stealthState}`, 24, 72);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#cfe3f3';
  ctx.font = '12px monospace';
  ctx.fillText('WASD/Arrows move  •  Shift sneak  •  Space sprint  •  R restart', WIDTH - 16, HEIGHT - 16);

  if (messageTimer > 0 && message) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    const tw = ctx.measureText(message).width;
    ctx.fillRect(WIDTH / 2 - tw / 2 - 16, 86, tw + 32, 34);
    ctx.fillStyle = '#e8f4ff';
    ctx.fillText(message, WIDTH / 2, 109);
  }
}

export function overlayHTML(title, subtitle, lines, stats = [], cta = 'Press Enter to start') {
  const statHtml = stats.length ? `<div class="stat-row">${stats.map(s => `<div class="stat ${s.cls || ''}">${s.label}: <strong>${s.value}</strong></div>`).join('')}</div>` : '';
  const linesHtml = lines.length ? `<ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>` : '';
  return `<div class="panel">
    <h1>${title}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ''}
    ${linesHtml}
    ${statHtml}
    <p class="cta">${cta}</p>
  </div>`;
}