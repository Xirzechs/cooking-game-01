// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred, the margin filled
// with the backdrop colour. Every picture is drawn with canvas paths — the
// kitchen, the food, the buttons — no image files, no emoji.
import {
  FIELD, FONT, HEARTS, INGREDIENTS, ING_BY_ID, LAYOUT, PALETTE, SHIFT_SECONDS,
  binRect, ticketRect,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function heart(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.55, y - s * 0.25, x - s * 0.3, y - s * 0.85, x, y - s * 0.3);
  ctx.bezierCurveTo(x + s * 0.3, y - s * 0.85, x + s * 0.55, y - s * 0.25, x, y + s * 0.35);
  ctx.fill();
}

/** One ingredient pictogram, centred at (x, y), fitting in a `size` box. */
export function drawIngredient(ctx, id, x, y, size) {
  const ing = ING_BY_ID[id];
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.18);
    ctx.quadraticCurveTo(-s * 0.42, -s * 0.42, 0, -s * 0.42);
    ctx.quadraticCurveTo(s * 0.42, -s * 0.42, s * 0.42, s * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.fillRect(-s * 0.42, s * 0.18, s * 0.84, s * 0.1);
    ctx.fillStyle = '#fff3cf';
    for (const [dx, dy] of [[-0.18, -0.18], [0.05, -0.28], [0.22, -0.12], [-0.02, -0.05]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, s * 0.045, s * 0.03, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = ing.dark;
    rr(ctx, -s * 0.42, -s * 0.16, s * 0.84, s * 0.34, s * 0.14);
    ctx.fill();
    ctx.fillStyle = ing.color;
    rr(ctx, -s * 0.38, -s * 0.2, s * 0.76, s * 0.3, s * 0.12);
    ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.2, -0.06], [0.08, -0.1], [0.24, 0.02], [-0.05, 0.05]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.32);
    ctx.lineTo(s * 0.4, s * 0.32);
    ctx.lineTo(0, -s * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.12, 0.14], [0.12, 0.05], [0, 0.2]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.22, 0.05], [0, -0.08], [0.22, 0.05]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ing.color;
    for (const [dx, dy] of [[-0.22, 0.02], [0, -0.1], [0.22, 0.02]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'tomato') {
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9a8a';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd9d2';
    for (const [dx, dy] of [[-0.1, -0.05], [0.1, 0.08], [0.08, -0.1]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, s * 0.045, s * 0.07, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'onion') {
    ctx.fillStyle = '#efe6f7';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ing.color;
    ctx.lineWidth = s * 0.07;
    for (const r of [0.3, 0.18]) {
      ctx.beginPath();
      ctx.arc(0, 0, s * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** One layer of the burger stack on the plate, drawn at (cx, topY). */
function drawStackLayer(ctx, id, cx, topY, w, isTop) {
  const ing = ING_BY_ID[id];
  const h = 16;
  if (id === 'bun') {
    if (isTop) {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, topY + 16);
      ctx.quadraticCurveTo(cx - w / 2, topY - 14, cx, topY - 14);
      ctx.quadraticCurveTo(cx + w / 2, topY - 14, cx + w / 2, topY + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3cf';
      for (const dx of [-0.28, -0.08, 0.14, 0.3]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx * w, topY - 2, 4, 2.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = ing.color;
      rr(ctx, cx - w / 2, topY, w, 12, 6);
      ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.fillRect(cx - w / 2, topY + 9, w, 3);
    }
    return 16;
  }
  if (id === 'patty') {
    ctx.fillStyle = ing.dark;
    rr(ctx, cx - w / 2 - 4, topY, w + 8, h, 7);
    ctx.fill();
    ctx.fillStyle = ing.color;
    rr(ctx, cx - w / 2 - 2, topY - 1, w + 4, h - 2, 6);
    ctx.fill();
    return h;
  }
  if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, topY);
    ctx.lineTo(cx + w / 2, topY);
    ctx.lineTo(cx + w / 2 - 8, topY + h + 6);
    ctx.lineTo(cx + w / 2 - 22, topY + h);
    ctx.lineTo(cx + 6, topY + h + 5);
    ctx.lineTo(cx - 8, topY + h);
    ctx.lineTo(cx - w / 2 + 10, topY + h + 4);
    ctx.closePath();
    ctx.fill();
    return h;
  }
  if (id === 'lettuce') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 - 6, topY + 4);
    for (let x = -w / 2 - 6; x <= w / 2 + 6; x += 14) {
      ctx.quadraticCurveTo(cx + x + 7, topY - 6, cx + x + 14, topY + 4);
    }
    ctx.lineTo(cx + w / 2 + 6, topY + 12);
    ctx.lineTo(cx - w / 2 - 6, topY + 12);
    ctx.closePath();
    ctx.fill();
    return 12;
  }
  if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    rr(ctx, cx - w / 2 + 8, topY, w - 16, 12, 6);
    ctx.fill();
    ctx.fillStyle = '#ff9a8a';
    rr(ctx, cx - w / 2 + 16, topY + 2, w - 32, 8, 4);
    ctx.fill();
    return 12;
  }
  // onion
  ctx.fillStyle = '#efe6f7';
  rr(ctx, cx - w / 2 + 6, topY, w - 12, 10, 5);
  ctx.fill();
  ctx.strokeStyle = ing.color;
  ctx.lineWidth = 2;
  for (const dx of [-0.25, 0, 0.25]) {
    ctx.beginPath();
    ctx.arc(cx + dx * w, topY + 5, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  return 10;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function text(value, x, y, size, color, align = 'left', weight = '') {
    const key = `${weight}${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight} ${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawKitchen() {
    // Wall with tiles.
    context.fillStyle = PALETTE.wall;
    context.fillRect(0, 0, FIELD.width, 480);
    context.fillStyle = PALETTE.wallTile;
    for (let y = 60; y < 480; y += 56) {
      for (let x = (y / 56) % 2 === 0 ? 0 : 28; x < FIELD.width; x += 56) {
        context.fillRect(x, y, 52, 52);
      }
    }
    // Window with a sunny street, on the right of the work area.
    context.fillStyle = '#8ec9e8';
    rr(context, 1020, 216, 200, 120, 10);
    context.fill();
    context.fillStyle = '#ffd94d';
    context.beginPath();
    context.arc(1076, 256, 22, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#5fbf4a';
    context.fillRect(1020, 306, 200, 30);
    context.fillStyle = '#7a5230';
    context.fillRect(1032, 230, 176, 8);
    context.fillRect(1112, 230, 8, 76);
    context.fillStyle = '#fff8e7';
    rr(context, 1014, 210, 212, 132, 12);
    context.strokeStyle = '#7a5230';
    context.lineWidth = 5;
    context.stroke();
    // Shelf with jars, above the stove.
    context.fillStyle = '#7a5230';
    context.fillRect(44, 268, 220, 10);
    for (let i = 0; i < 4; i += 1) {
      const x = 58 + i * 52;
      context.fillStyle = ['#e8483f', '#f7c948', '#5fbf4a', '#b388d9'][i];
      rr(context, x, 226, 34, 42, 6);
      context.fill();
      context.fillStyle = '#fff8e7';
      context.fillRect(x + 8, 240, 18, 14);
    }
    // Hanging pots, between the stove and the plate.
    context.strokeStyle = '#5a4632';
    context.lineWidth = 4;
    for (const x of [330, 400, 470]) {
      context.beginPath();
      context.moveTo(x, 198);
      context.lineTo(x, 238);
      context.stroke();
      context.fillStyle = '#4a4a52';
      context.beginPath();
      context.arc(x, 256, 26, 0, Math.PI);
      context.fill();
      context.fillRect(x - 26, 252, 52, 6);
    }
    // Floor.
    for (let y = 480; y < FIELD.height; y += 60) {
      for (let x = 0; x < FIELD.width; x += 60) {
        const dark = ((x / 60 + y / 60) % 2 === 0);
        context.fillStyle = dark ? PALETTE.floorDark : PALETTE.floor;
        context.fillRect(x, y, 60, 60);
      }
    }
    // Back counter (work surface) under the plate.
    context.fillStyle = PALETTE.counter;
    context.fillRect(0, 420, FIELD.width, 66);
    context.fillStyle = PALETTE.counterTop;
    context.fillRect(0, 420, FIELD.width, 14);
    // Stove on the left with pots.
    context.fillStyle = '#3a3a42';
    rr(context, 30, 300, 260, 120, 10);
    context.fill();
    for (const [cx, col] of [[90, '#c9ced6'], [210, '#8a5a33']]) {
      context.fillStyle = col;
      context.beginPath();
      context.arc(cx, 316, 34, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#2b2b31';
      context.beginPath();
      context.arc(cx, 316, 26, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = '#ff8c42';
    for (const cx of [90, 210]) {
      context.beginPath();
      context.moveTo(cx - 10, 392);
      context.quadraticCurveTo(cx, 366, cx + 10, 392);
      context.closePath();
      context.fill();
    }
    // Heat lamp over the plate.
    context.strokeStyle = '#5a4632';
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(640, 198);
    context.lineTo(640, 226);
    context.stroke();
    context.fillStyle = '#d63c2f';
    context.beginPath();
    context.moveTo(606, 226);
    context.lineTo(674, 226);
    context.lineTo(656, 206);
    context.lineTo(624, 206);
    context.closePath();
    context.fill();
    context.fillStyle = '#ffd94d';
    context.beginPath();
    context.arc(640, 232, 8, 0, Math.PI * 2);
    context.fill();
  }

  function drawHud(state, shiftLeft, muted) {
    context.fillStyle = PALETTE.panel;
    context.fillRect(0, 0, FIELD.width, 54);
    context.fillStyle = PALETTE.panelEdge;
    context.fillRect(0, 52, FIELD.width, 2);
    text('SIZZLE & SERVE', 20, 36, 26, PALETTE.gold, 'left', 'bold ');
    text('The Golden Ladle', 250, 36, 16, PALETTE.cream, 'left');
    text(`SCORE ${state.score}`, 560, 37, 28, '#ffffff', 'center', 'bold ');
    if (state.combo >= 2) {
      text(`COMBO x${state.combo}`, 760, 36, 20, '#7be495', 'left', 'bold ');
    }
    text(`LEVEL ${state.level}`, 880, 36, 20, PALETTE.cream, 'left', 'bold ');
    for (let i = 0; i < HEARTS; i += 1) {
      heart(context, 990 + i * 34, 34, 26, i < state.hearts ? '#ff5a4d' : '#5a4632');
    }
    const mins = Math.floor(shiftLeft / 60);
    const secs = Math.floor(shiftLeft % 60);
    const timerText = `${mins}:${String(secs).padStart(2, '0')}`;
    const urgent = shiftLeft <= 20;
    text(timerText, 1260, 37, 28, urgent ? '#ff6b5e' : '#ffffff', 'right', 'bold ');
    context.fillStyle = '#5a4632';
    rr(context, 1090, 12, 120, 10, 5);
    context.fill();
    context.fillStyle = urgent ? '#ff6b5e' : PALETTE.gold;
    rr(context, 1090, 12, 120 * (shiftLeft / SHIFT_SECONDS), 10, 5);
    context.fill();
    if (muted) text('MUTED', 1010, 14, 12, PALETTE.muted, 'right');
  }

  function drawBoard(state, target) {
    context.fillStyle = PALETTE.board;
    rr(context, LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.w, LAYOUT.board.h, 12);
    context.fill();
    context.strokeStyle = PALETTE.boardEdge;
    context.lineWidth = 3;
    rr(context, LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.w, LAYOUT.board.h, 12);
    context.stroke();
    text('ORDER BOARD', 1252, 86, 15, '#c9a86a', 'right', 'bold ');
    if (state.orders.length === 0) {
      text('No orders yet — the lunch rush is coming…', 640, 140, 20, '#c9b8a0', 'center');
      return;
    }
    state.orders.forEach((order, index) => {
      const r = ticketRect(index);
      const ready = target === order;
      const complete = state.plate.length > 0 && ready
        && state.plate.length === order.recipe.needs.length
        && order.recipe.needs.every((id) => state.plate.includes(id));
      context.fillStyle = complete ? PALETTE.ticketHot : PALETTE.ticket;
      rr(context, r.x, r.y, r.w, r.h, 10);
      context.fill();
      if (ready) {
        context.strokeStyle = complete ? PALETTE.green : PALETTE.gold;
        context.lineWidth = 4;
        rr(context, r.x, r.y, r.w, r.h, 10);
        context.stroke();
      }
      text(order.recipe.name, r.x + 14, r.y + 26, 17, PALETTE.text, 'left', 'bold ');
      const frac = Math.max(0, order.timeLeft / order.timeMax);
      context.fillStyle = '#e8dcc8';
      rr(context, r.x + 14, r.y + 96, r.w - 28, 10, 5);
      context.fill();
      context.fillStyle = frac > 0.5 ? PALETTE.green : frac > 0.25 ? '#e8a13a' : PALETTE.red;
      rr(context, r.x + 14, r.y + 96, (r.w - 28) * frac, 10, 5);
      context.fill();
      text(`${Math.ceil(order.timeLeft)}s`, r.x + r.w - 14, r.y + 96, 13, frac > 0.25 ? '#7a6a58' : PALETTE.red, 'right', 'bold ');
      order.recipe.needs.forEach((id, i) => {
        drawIngredient(context, id, r.x + 34 + i * 44, r.y + 62, 36);
      });
      if (complete) {
        context.fillStyle = PALETTE.green;
        rr(context, r.x + r.w - 92, r.y + 8, 82, 24, 12);
        context.fill();
        text('READY!', r.x + r.w - 51, r.y + 25, 14, '#ffffff', 'center', 'bold ');
      }
    });
  }

  function drawPlate(state) {
    const { x, y } = LAYOUT.plate;
    // Serving tray.
    context.fillStyle = PALETTE.steelDark;
    rr(context, x - 150, y + 58, 300, 16, 8);
    context.fill();
    context.fillStyle = PALETTE.steel;
    rr(context, x - 150, y + 54, 300, 14, 7);
    context.fill();
    // Plate.
    context.fillStyle = '#e8e4da';
    context.beginPath();
    context.ellipse(x, y + 52, 118, 20, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.plate;
    context.beginPath();
    context.ellipse(x, y + 48, 104, 16, 0, 0, Math.PI * 2);
    context.fill();
    if (state.plate.length === 0) {
      text('Your plate — pick ingredients below', x, y - 40, 18, '#fff8e7', 'center');
      context.strokeStyle = 'rgba(255,248,231,0.7)';
      context.setLineDash([6, 6]);
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(x, y + 48, 70, 10, 0, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
      return;
    }
    const w = 168;
    let topY = y + 46;
    const layers = state.plate;
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const h = drawStackLayer(context, layers[i], x, topY - 14, w, i === layers.length - 1);
      topY -= h;
    }
    // Dark pill behind the count so it reads on the light wall.
    const label = `${layers.length} / 6 ingredients`;
    context.font = `bold 16px ${FONT}`;
    const lw = context.measureText(label).width + 24;
    context.fillStyle = 'rgba(43,29,18,0.85)';
    rr(context, x - lw / 2, y - 116, lw, 26, 13);
    context.fill();
    text(label, x, y - 97, 16, '#fff8e7', 'center', 'bold ');
  }

  function drawCounter(state, target) {
    // Front counter.
    context.fillStyle = PALETTE.counter;
    context.fillRect(0, 486, FIELD.width, 178);
    context.fillStyle = PALETTE.counterTop;
    context.fillRect(0, 486, FIELD.width, 12);
    INGREDIENTS.forEach((ing, i) => {
      const r = binRect(i);
      context.fillStyle = '#fff8e7';
      rr(context, r.x, r.y, r.w, r.h, 12);
      context.fill();
      context.strokeStyle = ing.color;
      context.lineWidth = 4;
      rr(context, r.x, r.y, r.w, r.h, 12);
      context.stroke();
      drawIngredient(context, ing.id, r.x + r.w / 2, r.y + 56, 84);
      text(ing.name, r.x + r.w / 2, r.y + 118, 19, PALETTE.text, 'center', 'bold ');
      context.fillStyle = ing.color;
      context.beginPath();
      context.arc(r.x + r.w - 22, r.y + 22, 15, 0, Math.PI * 2);
      context.fill();
      text(String(i + 1), r.x + r.w - 22, r.y + 27, 16, '#ffffff', 'center', 'bold ');
    });
    // Serve button.
    const s = LAYOUT.serve;
    const ready = target !== null && state.plate.length > 0
      && state.plate.length === target.recipe.needs.length
      && target.recipe.needs.every((id) => state.plate.includes(id));
    context.fillStyle = ready ? '#2f9e44' : '#3f9e4d';
    rr(context, s.x, s.y, s.w, s.h, 14);
    context.fill();
    if (ready) {
      context.strokeStyle = PALETTE.gold;
      context.lineWidth = 5;
      rr(context, s.x, s.y, s.w, s.h, 14);
      context.stroke();
    }
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.moveTo(s.x + 28, s.y + 66);
    context.quadraticCurveTo(s.x + 28, s.y + 30, s.x + 70, s.y + 30);
    context.quadraticCurveTo(s.x + 112, s.y + 30, s.x + 112, s.y + 66);
    context.closePath();
    context.fill();
    context.fillRect(s.x + 22, s.y + 66, 96, 6);
    text('SERVE', s.x + s.w / 2, s.y + 106, 24, '#ffffff', 'center', 'bold ');
    text('Space', s.x + s.w / 2, s.y + 128, 14, '#d8f3dc', 'center');
    // Trash button.
    const t = LAYOUT.trash;
    context.fillStyle = '#8a4a3a';
    rr(context, t.x, t.y, t.w, t.h, 14);
    context.fill();
    context.strokeStyle = '#5f3a1e';
    context.lineWidth = 3;
    rr(context, t.x + 34, t.y + 44, 44, 52, 6);
    context.stroke();
    context.fillStyle = '#5f3a1e';
    context.fillRect(t.x + 28, t.y + 36, 56, 8);
    text('TRASH', t.x + t.w / 2, t.y + 116, 18, '#ffffff', 'center', 'bold ');
    text('Del', t.x + t.w / 2, t.y + 134, 13, '#e8c9bd', 'center');
    // Hints.
    text('Click a bin or press 1–6 to add  •  Space to serve the matching order  •  Del clears the plate  •  P pause  •  M mute',
      640, 700, 16, '#e8dcc8', 'center');
  }

  function drawPopups(state) {
    for (const p of state.popups) {
      const alpha = Math.min(1, (p.ttl / p.max) * 2);
      const rise = (1 - p.ttl / p.max) * 30;
      context.globalAlpha = alpha;
      // Dark shadow first so the gold text reads on the light wall.
      context.font = `bold 30px ${FONT}`;
      context.textAlign = 'center';
      context.textBaseline = 'alphabetic';
      context.fillStyle = 'rgba(43,29,18,0.9)';
      context.fillText(p.text, p.x + 2, p.y - rise + 2);
      text(p.text, p.x, p.y - rise, 30, p.color, 'center', 'bold ');
      context.globalAlpha = 1;
    }
  }

  function drawPanel(title, lines, prompt, best) {
    context.fillStyle = 'rgba(20,12,6,0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const w = 640;
    const h = 150 + lines.length * 36 + 70;
    const x = (FIELD.width - w) / 2;
    const y = (FIELD.height - h) / 2;
    context.fillStyle = PALETTE.panel;
    rr(context, x, y, w, h, 16);
    context.fill();
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 3;
    rr(context, x, y, w, h, 16);
    context.stroke();
    text(title, FIELD.width / 2, y + 74, 52, PALETTE.gold, 'center', 'bold ');
    lines.forEach((line, i) => {
      text(line, FIELD.width / 2, y + 128 + i * 36, 21, PALETTE.cream, 'center');
    });
    if (best !== null && best !== undefined) {
      text(`Best score: ${best}`, FIELD.width / 2, y + 128 + lines.length * 36, 20, PALETTE.gold, 'center', 'bold ');
    }
    text(prompt, FIELD.width / 2, y + h - 28, 22, '#7be495', 'center', 'bold ');
  }

  /** Paint one frame: the kitchen, then the HUD or a panel for the screen. */
  function draw(state, screen, best, shiftLeft, muted) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    if (state.shake > 0) {
      const m = state.shake * 18;
      context.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawKitchen();
    const tgt = (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) && state.plate.length > 0
      ? currentTarget(state) : null;
    drawBoard(state, tgt);
    drawPlate(state);
    drawCounter(state, tgt);
    drawHud(state, shiftLeft, muted);
    drawPopups(state);
    if (state.flash === 'bad') {
      context.fillStyle = 'rgba(214,60,47,0.18)';
      context.fillRect(0, 0, FIELD.width, FIELD.height);
    } else if (state.flash === 'good') {
      context.fillStyle = 'rgba(247,201,72,0.14)';
      context.fillRect(0, 0, FIELD.width, FIELD.height);
    }
    context.restore();
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    if (screen === SCREEN_TITLE) {
      drawPanel('SIZZLE & SERVE', [
        'Orders land on the board — build each dish on your plate.',
        'Click the bins (or press 1–6), then SERVE the matching order.',
        'Beat the ticket timer: faster serves pay a bigger bonus.',
        'Lose 3 orders and the rush wins. One shift: 2½ minutes.',
      ], 'Click or press Space to start', best);
    } else if (screen === SCREEN_PAUSED) {
      drawPanel('Paused', ['The tickets will wait for you.'], 'Press P to keep cooking', null);
    } else if (screen === SCREEN_OVER) {
      drawPanel(state.overReason.startsWith('Shift') ? 'Shift Complete!' : 'Rush Over!',
        [
          `Final score: ${state.score}`,
          `Dishes served: ${state.served}   •   Best combo: x${state.bestCombo}`,
          state.overReason,
        ], 'Click or press Space to cook again', best);
    }
  }

  // The world exposes targetOrder(); the renderer keeps a reference set by main.
  let currentTarget = () => null;
  function setTargetGetter(fn) {
    currentTarget = fn;
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, setTargetGetter };
}
