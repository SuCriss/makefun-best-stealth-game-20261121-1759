export const TILE = 40;
export const COLS = 32;
export const ROWS = 18;
export const WIDTH = COLS * TILE;
export const HEIGHT = ROWS * TILE;

export const COLORS = {
  floor: '#0d1824',
  floorAlt: '#101d2b',
  wall: '#23384d',
  wallTop: '#355878',
  glass: '#6fc8ff',
  shadow: 'rgba(0,0,0,0.35)',
  player: '#dff7ff',
  playerCloak: '#6de0ff',
  guard: '#ffbf69',
  guardAlert: '#ff6b7a',
  vision: 'rgba(255, 210, 120, 0.18)',
  visionAlert: 'rgba(255, 90, 110, 0.22)',
  objective: '#8ef0ff',
  objectiveDone: '#96ffa7',
  exitLocked: '#ff8a5b',
  exitOpen: '#96ffa7',
  text: '#e8f4ff',
};

export const PLAYER = {
  radius: 11,
  walkSpeed: 145,
  sneakSpeed: 82,
  sprintSpeed: 210,
  noiseWalk: 0.55,
  noiseSneak: 0.15,
  noiseSprint: 1,
};

export const GUARD = {
  radius: 12,
  speed: 72,
  chaseSpeed: 128,
  fov: Math.PI * 0.72,
  viewDist: 185,
  hearDist: 130,
  investigateTime: 3.5,
  alertTime: 5.5,
};