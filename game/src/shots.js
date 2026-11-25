// The screenshot scenes behind ?shot=start|play|serve|end. Each one sets the real
// world to a fixed state through the world's own staging helpers and draws it
// with the real renderer, so every frame is what a short game really looks like
// and the same seed always gives the same frame.
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best score to show. Names: start, play, serve, end (anything else is start).
 */
export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name === 'play' || name === 'serve') {
    world.stageScore(name === 'serve' ? 480 : 340, name === 'serve' ? 4 : 3,
      name === 'serve' ? 4 : 3, 2, name === 'serve' ? 62 : 47, 3);
    world.stageOrder('Classic Burger', name === 'serve' ? 21 : 32);
    world.stageOrder('Garden Burger', 18);
    world.stageOrder('Veggie Stack', 41);
    if (name === 'serve') {
      world.stagePlate(['bun', 'patty', 'cheese']);
      state.lastPoints = 140;
      state.lastServedName = 'Classic Burger';
      state.popups.push({ x: 640, y: 300, text: '+140  Classic Burger!', color: '#ffd94d', ttl: 1.2, max: 1.4 });
    } else {
      // Mid-assembly: three of the four Garden Burger ingredients on the plate.
      world.stagePlate(['bun', 'patty', 'lettuce']);
    }
    return { screen: SCREEN_PLAY, best: 480 };
  }
  if (name === 'end') {
    world.stageScore(1250, 0, 11, 4, 150, 2);
    state.bestCombo = 5;
    state.over = true;
    state.overReason = 'Shift complete — the dinner bell rings!';
    return { screen: SCREEN_OVER, best: 1250 };
  }
  // start: a quiet kitchen with two orders waiting on the board.
  world.stageOrder('Classic Burger', 44);
  world.stageOrder('Garden Burger', 36);
  return { screen: SCREEN_TITLE, best: 0 };
}
