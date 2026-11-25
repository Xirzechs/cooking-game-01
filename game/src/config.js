// Sizzle & Serve — tuning, layout and palette in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One full shift (a run) lasts this long, in seconds. */
export const SHIFT_SECONDS = 150;

export const HEARTS = 3;

/** The six ingredients on the counter, in bin order, with their keyboard keys. */
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: 'Digit1', color: '#e8a94e', dark: '#b97e2e' },
  { id: 'patty', name: 'Patty', key: 'Digit2', color: '#8a5a33', dark: '#5f3a1e' },
  { id: 'cheese', name: 'Cheese', key: 'Digit3', color: '#f7c948', dark: '#d9a41f' },
  { id: 'lettuce', name: 'Lettuce', key: 'Digit4', color: '#5fbf4a', dark: '#3d8f2e' },
  { id: 'tomato', name: 'Tomato', key: 'Digit5', color: '#e8483f', dark: '#b02a24' },
  { id: 'onion', name: 'Onion', key: 'Digit6', color: '#b388d9', dark: '#7e57a8' },
];
export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

/** Recipes: name, the multiset of ingredients, base points. */
export const RECIPES = [
  { name: 'Classic Burger', needs: ['bun', 'patty', 'cheese'], points: 100 },
  { name: 'Garden Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'], points: 140 },
  { name: 'Veggie Stack', needs: ['bun', 'lettuce', 'tomato', 'onion'], points: 130 },
  { name: 'Cheesy Melt', needs: ['bun', 'patty', 'cheese', 'cheese'], points: 150 },
  { name: 'Tower Burger', needs: ['bun', 'patty', 'cheese', 'lettuce', 'tomato'], points: 200, minLevel: 3 },
  { name: 'Onion Deluxe', needs: ['bun', 'patty', 'onion', 'onion', 'cheese'], points: 190, minLevel: 4 },
];

export const LEVEL = { max: 6, servedPerLevel: 4 };

/** Seconds an order stays on the board at level 1, shrinking per level, floored. */
export const ORDER_TIME = { base: 50, perLevel: 3, min: 30 };
/** Seconds between new orders at level 1, shrinking per level, floored. */
export const SPAWN = { base: 10, perLevel: 0.8, min: 5.5 };
export const MAX_ORDERS = 4;
export const PLATE_MAX = 6;
export const WRONG_SERVE_PENALTY = 25;

/** Layout: every clickable zone, so input and rendering agree. */
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 54 },
  board: { x: 16, y: 62, w: 1248, h: 128 },
  ticket: { w: 250, h: 126, gap: 14, x0: 20, y: 64 },
  work: { x: 0, y: 198, w: 1280, h: 272 },
  plate: { x: 640, y: 352 },
  bins: { x0: 20, y: 486, w: 150, h: 150, gap: 12 },
  serve: { x: 996, y: 496, w: 140, h: 140 },
  trash: { x: 1148, y: 496, w: 112, h: 140 },
  hints: { x: 0, y: 664, w: 1280, h: 56 },
};

export function binRect(index) {
  const b = LAYOUT.bins;
  return { x: b.x0 + index * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
}
export function ticketRect(index) {
  const t = LAYOUT.ticket;
  return { x: t.x0 + index * (t.w + t.gap), y: t.y, w: t.w, h: t.h };
}

export const PALETTE = {
  backdrop: '#241a12',
  wall: '#f3e2c2',
  wallTile: '#ecd3a4',
  floor: '#c98f5f',
  floorDark: '#b57a4e',
  board: '#3a2f2a',
  boardEdge: '#6b4a2f',
  ticket: '#fff8e7',
  ticketHot: '#ffe9a8',
  counter: '#8a5a33',
  counterTop: '#a9713f',
  steel: '#c9ced6',
  steelDark: '#9aa1ad',
  plate: '#ffffff',
  text: '#2b1d12',
  cream: '#fff8e7',
  muted: '#7a6a58',
  red: '#d63c2f',
  green: '#3f9e4d',
  gold: '#f7c948',
  blue: '#3f7fbf',
  panel: '#2b1d12',
  panelEdge: '#f7c948',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'sizzle-and-serve.best';
