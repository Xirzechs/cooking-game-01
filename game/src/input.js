// Keyboard and pointer input. One-shot presses (start, serve, trash, pause, mute)
// are queued as bit flags and taken once by the loop, so a press between two frames
// is never lost and never counted twice. Pointer clicks are queued as positions;
// the loop maps them to bins, buttons and tickets.
export const ACTION_CONFIRM = 1;
export const ACTION_SERVE = 2;
export const ACTION_TRASH = 4;
export const ACTION_PAUSE = 8;
export const ACTION_MUTE = 16;

import { INGREDIENTS } from './config.js';

const ING_KEYS = new Map(INGREDIENTS.map((ing, i) => [ing.key, i]));

export function createInput(target) {
  let actions = 0;
  let ingredient = -1;
  const clicks = [];

  window.addEventListener('keydown', (event) => {
    if (ING_KEYS.has(event.code)) {
      if (!event.repeat) ingredient = ING_KEYS.get(event.code);
    } else if (event.code === 'Space' || event.code === 'Enter') {
      if (!event.repeat) actions |= ACTION_CONFIRM | ACTION_SERVE;
    } else if (event.code === 'Backspace' || event.code === 'Delete') {
      if (!event.repeat) actions |= ACTION_TRASH;
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (event.code === 'KeyM') {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else {
      return;
    }
    event.preventDefault();
  });

  target.addEventListener('pointerdown', (event) => {
    const rect = target.getBoundingClientRect();
    clicks.push({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    // A click anywhere also confirms (start / restart) on title and game-over screens.
    actions |= ACTION_CONFIRM;
  });

  return {
    /** One-shot action flags since the last call. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Index of the ingredient bin pressed with keys 1-6, or -1. */
    takeIngredient() {
      const taken = ingredient;
      ingredient = -1;
      return taken;
    },
    /** Click positions (CSS pixels, canvas element space) since the last call. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
