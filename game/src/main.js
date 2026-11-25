// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between four screens: title, play, paused
// and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, LAYOUT, STEP, binRect, ticketRect } from './config.js';
import { createRandom } from './random.js';
import {
  EVENT_ADD, EVENT_EXPIRE, EVENT_LEVEL, EVENT_OVER, EVENT_SERVE_BAD,
  EVENT_SERVE_OK, EVENT_TICK, EVENT_TRASH, createWorld,
} from './world.js';
import {
  ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_SERVE, ACTION_TRASH,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import {
  SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, createRenderer,
} from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const errlog = document.getElementById('errlog');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
renderer.setTargetGetter(() => world.targetOrder());
const audio = createAudio();

window.addEventListener('error', (event) => {
  const msg = `ERROR: ${event.message} @ ${event.filename}:${event.lineno}`;
  if (errlog) errlog.textContent += `${msg}\n`;
  document.title = msg;
});

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

/** Map a click (canvas CSS pixels) to a game action. Returns event flags. */
function handleClick(click) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = 1280 / rect.width;
  const scaleY = 720 / rect.height;
  const x = click.x * scaleX;
  const y = click.y * scaleY;
  for (let i = 0; i < 6; i += 1) {
    if (inRect(x, y, binRect(i))) return world.addIngredient(i);
  }
  if (inRect(x, y, LAYOUT.serve)) return world.serve();
  if (inRect(x, y, LAYOUT.trash)) return world.trashPlate();
  for (let i = 0; i < world.state.orders.length; i += 1) {
    if (inRect(x, y, ticketRect(i))) return world.serve();
  }
  return 0;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, world.shiftLeft, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    audio.unlock();
    announce('Playing. Build the dishes on the order board before their timers run out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    audio.over();
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Shift over. Score ${world.state.score}. Best ${best}.`);
  }

  function react(events) {
    if (events & EVENT_ADD) audio.add();
    if (events & EVENT_SERVE_OK) {
      audio.serve();
      announce(`Served ${world.state.lastServedName} for ${world.state.lastPoints} points.`);
    }
    if (events & EVENT_SERVE_BAD) {
      audio.bad();
      announce('Wrong dish! That plate does not match any order.');
    }
    if (events & EVENT_TRASH) audio.trash();
    if (events & EVENT_EXPIRE) {
      audio.expire();
      announce(`Order lost. ${world.state.hearts} hearts left.`);
    }
    if (events & EVENT_TICK) audio.tick();
    if (events & EVENT_LEVEL) {
      audio.level();
      announce(`Level ${world.state.level}! Orders arrive faster.`);
    }
    if (events & EVENT_OVER) endGame();
  }

  function handleActions() {
    const actions = input.takeActions();
    const ing = input.takeIngredient();
    const clicks = input.takeClicks();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      if (actions & ACTION_CONFIRM) startGame();
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (ing >= 0) react(world.addIngredient(ing));
    for (const click of clicks) react(handleClick(click));
    if (actions & ACTION_SERVE) react(world.serve());
    if (actions & ACTION_TRASH) react(world.trashPlate());
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        react(world.step(STEP));
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, world.shiftLeft, audio.muted);
  }

  // Leaving the tab pauses a running game rather than letting orders expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Sizzle and Serve. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
