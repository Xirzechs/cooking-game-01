// The game's rules and state, with no drawing and no browser in it: the order
// board, the plate, scoring, combo, hearts, level and the shift timer. step()
// advances one fixed step and returns what happened as bit flags, so the caller
// can react (sounds, announcements) without the world knowing about screens.
import {
  FIELD, HEARTS, INGREDIENTS, LEVEL, MAX_ORDERS, ORDER_TIME, PLATE_MAX,
  RECIPES, SHIFT_SECONDS, SPAWN, WRONG_SERVE_PENALTY,
} from './config.js';

export const EVENT_ADD = 1;
export const EVENT_SERVE_OK = 2;
export const EVENT_SERVE_BAD = 4;
export const EVENT_EXPIRE = 8;
export const EVENT_TRASH = 16;
export const EVENT_LEVEL = 32;
export const EVENT_OVER = 64;
export const EVENT_TICK = 128;

let nextOrderId = 1;

function countsOf(list) {
  const counts = {};
  for (const id of list) counts[id] = (counts[id] || 0) + 1;
  return counts;
}
function sameMultiset(a, b) {
  const ca = countsOf(a);
  const cb = countsOf(b);
  const keys = new Set([...Object.keys(ca), ...Object.keys(cb)]);
  for (const k of keys) if ((ca[k] || 0) !== (cb[k] || 0)) return false;
  return true;
}
/** True when every ingredient on the plate is part of the recipe (dish in progress). */
function plateFitsRecipe(plate, recipe) {
  const need = countsOf(recipe.needs);
  const have = countsOf(plate);
  for (const [id, n] of Object.entries(have)) {
    if ((need[id] || 0) < n) return false;
  }
  return plate.length > 0;
}

function orderTimeFor(level) {
  return Math.max(ORDER_TIME.min, ORDER_TIME.base - ORDER_TIME.perLevel * (level - 1));
}
function spawnIntervalFor(level) {
  return Math.max(SPAWN.min, SPAWN.base - SPAWN.perLevel * (level - 1));
}

export function createWorld(random) {
  const state = {
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    hearts: HEARTS,
    level: 1,
    elapsed: 0,
    orders: [],
    plate: [],
    popups: [],
    shake: 0,
    flash: null,
    spawnTimer: 0,
    lastPoints: 0,
    lastServedName: '',
    over: false,
    overReason: '',
  };

  function reset() {
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.failed = 0;
    state.hearts = HEARTS;
    state.level = 1;
    state.elapsed = 0;
    state.orders = [];
    state.plate = [];
    state.popups = [];
    state.shake = 0;
    state.flash = null;
    state.spawnTimer = 2.5;
    state.lastPoints = 0;
    state.lastServedName = '';
    state.over = false;
    state.overReason = '';
    nextOrderId = 1;
  }

  function availableRecipes() {
    return RECIPES.filter((r) => (r.minLevel || 1) <= state.level);
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const pool = availableRecipes();
    const recipe = pool[Math.floor(random() * pool.length)];
    const timeMax = orderTimeFor(state.level);
    state.orders.push({
      id: nextOrderId++,
      recipe,
      timeLeft: timeMax,
      timeMax,
      born: state.elapsed,
    });
  }

  function addPopup(x, y, text, color) {
    state.popups.push({ x, y, text, color, ttl: 1.4, max: 1.4 });
    if (state.popups.length > 8) state.popups.shift();
  }

  function addIngredient(index) {
    if (state.over || state.plate.length >= PLATE_MAX) return 0;
    const ing = INGREDIENTS[index];
    if (!ing) return 0;
    state.plate.push(ing.id);
    return EVENT_ADD;
  }

  function matchingOrder() {
    for (const order of state.orders) {
      if (sameMultiset(state.plate, order.recipe.needs)) return order;
    }
    return null;
  }

  /** The open order the plate is part of (or completing), for the board highlight. */
  function targetOrder() {
    if (state.plate.length === 0) return null;
    for (const order of state.orders) {
      if (sameMultiset(state.plate, order.recipe.needs)) return order;
    }
    for (const order of state.orders) {
      if (plateFitsRecipe(state.plate, order.recipe)) return order;
    }
    return null;
  }

  function serve() {
    if (state.over) return 0;
    if (state.plate.length === 0) return 0;
    const order = matchingOrder();
    if (!order) {
      state.score = Math.max(0, state.score - WRONG_SERVE_PENALTY);
      state.combo = 0;
      state.shake = 0.35;
      state.flash = 'bad';
      addPopup(FIELD.width / 2, 300, `Wrong dish! -${WRONG_SERVE_PENALTY}`, '#ff6b5e');
      return EVENT_SERVE_BAD;
    }
    const timeBonus = Math.round(order.timeLeft) * 2;
    const comboBonus = state.combo * 10;
    const points = order.recipe.points + timeBonus + comboBonus;
    state.score += points;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.lastPoints = points;
    state.lastServedName = order.recipe.name;
    state.orders.splice(state.orders.indexOf(order), 1);
    state.plate = [];
    state.flash = 'good';
    addPopup(FIELD.width / 2, 300, `+${points}  ${order.recipe.name}!`, '#ffd94d');
    let events = EVENT_SERVE_OK;
    const newLevel = Math.min(LEVEL.max, 1 + Math.floor(state.served / LEVEL.servedPerLevel));
    if (newLevel > state.level) {
      state.level = newLevel;
      events |= EVENT_LEVEL;
      addPopup(FIELD.width / 2, 250, `Level ${newLevel} — orders get faster!`, '#7be495');
    }
    return events;
  }

  function trashPlate() {
    if (state.plate.length === 0) return 0;
    state.plate = [];
    return EVENT_TRASH;
  }

  /** One fixed step. Returns event flags. */
  function step(dt) {
    let events = 0;
    if (state.over) return events;
    state.elapsed += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.flash) state.flash = null;
    for (const p of state.popups) p.ttl -= dt;
    state.popups = state.popups.filter((p) => p.ttl > 0);

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnOrder();
      state.spawnTimer += spawnIntervalFor(state.level);
    }

    let ticked = false;
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      const before = order.timeLeft;
      order.timeLeft -= dt;
      if (before > 5 && order.timeLeft <= 5) ticked = true;
      if (order.timeLeft <= 0) {
        state.orders.splice(i, 1);
        state.hearts -= 1;
        state.failed += 1;
        state.combo = 0;
        state.shake = 0.4;
        state.flash = 'bad';
        addPopup(FIELD.width / 2, 300, `Order lost: ${order.recipe.name}`, '#ff6b5e');
        events |= EVENT_EXPIRE;
        if (state.hearts <= 0) {
          state.over = true;
          state.overReason = 'Too many orders lost — the lunch rush won.';
          events |= EVENT_OVER;
          return events;
        }
      }
    }
    if (ticked) events |= EVENT_TICK;

    if (state.elapsed >= SHIFT_SECONDS) {
      state.over = true;
      state.overReason = 'Shift complete — the dinner bell rings!';
      events |= EVENT_OVER;
    }
    return events;
  }

  // ---- staging helpers for the screenshot scenes (real state, real rules) ----
  function stageOrder(recipeName, timeLeft) {
    const recipe = RECIPES.find((r) => r.name === recipeName);
    if (!recipe) return;
    const timeMax = orderTimeFor(state.level);
    state.orders.push({ id: nextOrderId++, recipe, timeLeft, timeMax, born: state.elapsed });
  }
  function stagePlate(ids) {
    state.plate = [...ids];
  }
  function stageScore(score, combo, served, level, elapsed, hearts) {
    state.score = score;
    state.combo = combo;
    state.bestCombo = Math.max(state.bestCombo, combo);
    state.served = served;
    state.level = level;
    state.elapsed = elapsed;
    state.hearts = hearts;
  }

  reset();
  return {
    state, reset, step, spawnOrder, addIngredient, serve, trashPlate,
    matchingOrder, targetOrder, stageOrder, stagePlate, stageScore,
    get shiftLeft() {
      return Math.max(0, SHIFT_SECONDS - state.elapsed);
    },
  };
}
