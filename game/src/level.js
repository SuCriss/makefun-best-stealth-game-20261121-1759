import { TILE } from './config.js';

function W(x, y, w, h) { return { x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE }; }

export const LEVEL = {
  name: 'The Glass Archive',
  playerStart: { x: 2.5 * TILE, y: 15.5 * TILE },
  walls: [
    W(0, 0, 32, 1), W(0, 17, 32, 1), W(0, 0, 1, 18), W(31, 0, 1, 18),
    W(4, 1, 1, 4), W(4, 6, 1, 3), W(1, 8, 7, 1), W(9, 1, 1, 5),
    W(12, 1, 1, 4), W(12, 6, 1, 3), W(9, 8, 7, 1),
    W(19, 1, 1, 8), W(23, 1, 1, 4), W(23, 6, 1, 3), W(19, 8, 5, 1),
    W(27, 1, 1, 8), W(27, 8, 4, 1),
    W(1, 11, 6, 1), W(8, 11, 1, 4), W(11, 11, 5, 1), W(15, 11, 1, 3),
    W(19, 11, 4, 1), W(22, 11, 1, 4), W(25, 11, 6, 1),
    W(4, 14, 4, 1), W(12, 14, 4, 1), W(19, 14, 3, 1),
  ],
  // Decorative glass panels (non-blocking, visual only)
  glass: [
    W(5, 2, 3, 0.2), W(13, 2, 5, 0.2), W(24, 2, 2, 0.2),
    W(2, 12, 2, 0.2), W(28, 12, 2, 0.2),
  ],
  objectives: [
    { id: 'A', x: 6.5 * TILE, y: 3.5 * TILE, r: 14, label: 'Shard A', taken: false },
    { id: 'B', x: 15.5 * TILE, y: 3.5 * TILE, r: 14, label: 'Shard B', taken: false },
    { id: 'C', x: 29.0 * TILE, y: 14.5 * TILE, r: 14, label: 'Shard C', taken: false },
  ],
  exit: { x: 1.2 * TILE, y: 1.2 * TILE, w: 1.6 * TILE, h: 1.2 * TILE },
  guards: [
    {
      x: 6.5 * TILE, y: 6.5 * TILE, facing: 0,
      path: [{ x: 6.5 * TILE, y: 6.5 * TILE }, { x: 10.5 * TILE, y: 6.5 * TILE }, { x: 10.5 * TILE, y: 2.5 * TILE }, { x: 6.5 * TILE, y: 2.5 * TILE }],
    },
    {
      x: 16.5 * TILE, y: 9.5 * TILE, facing: Math.PI,
      path: [{ x: 16.5 * TILE, y: 9.5 * TILE }, { x: 16.5 * TILE, y: 15.5 * TILE }, { x: 20.5 * TILE, y: 15.5 * TILE }, { x: 20.5 * TILE, y: 9.5 * TILE }],
    },
    {
      x: 25.0 * TILE, y: 4.5 * TILE, facing: Math.PI / 2,
      path: [{ x: 25.0 * TILE, y: 4.5 * TILE }, { x: 29.5 * TILE, y: 4.5 * TILE }, { x: 29.5 * TILE, y: 9.5 * TILE }, { x: 25.0 * TILE, y: 9.5 * TILE }],
    },
    {
      x: 13.0 * TILE, y: 12.8 * TILE, facing: 0,
      path: [{ x: 13.0 * TILE, y: 12.8 * TILE }, { x: 5.0 * TILE, y: 12.8 * TILE }, { x: 5.0 * TILE, y: 15.5 * TILE }, { x: 13.0 * TILE, y: 15.5 * TILE }],
    },
  ],
  decorations: [
    { x: 2 * TILE, y: 2 * TILE, w: 1.2 * TILE, h: 0.7 * TILE, label: 'desk' },
    { x: 14 * TILE, y: 5 * TILE, w: 1.2 * TILE, h: 0.7 * TILE, label: 'desk' },
    { x: 28 * TILE, y: 2 * TILE, w: 1.2 * TILE, h: 0.7 * TILE, label: 'desk' },
    { x: 17.2 * TILE, y: 12.2 * TILE, w: 1.2 * TILE, h: 0.7 * TILE, label: 'desk' },
  ],
};