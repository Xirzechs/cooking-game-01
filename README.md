# Sizzle & Serve — The Golden Ladle Kitchen

A complete original cooking game for the make.fun
`best-cooking-game-20261125-0137` competition. Static files only: open
`game/index.html` in a desktop browser and play — no network requests, no
build step.

## How to play

Orders land on the **order board** at the top of the kitchen, each with its
own countdown timer. Build the dish on your plate by clicking the ingredient
bins on the counter (or pressing **1–6**), then hit **SERVE** (or **Space**,
or click the matching ticket) while the plate matches an order.

- **Scoring:** base points per recipe + a speed bonus for time left on the
  ticket + a combo bonus for serving dishes back-to-back.
- **Wrong dish:** serving a plate that matches no order costs 25 points.
- **Lost order:** an order whose timer runs out costs one of your 3 hearts.
- **Difficulty:** every 4 dishes served raises the level — orders arrive
  faster, timers get shorter, and new recipes (Tower Burger, Onion Deluxe)
  join the board.
- **Shift:** one run lasts 2½ minutes. Lose all 3 hearts, or finish the
  shift, and the run ends with your score, dishes served and best combo.
- **Del** clears the plate, **P** pauses, **M** mutes the WebAudio sounds.

## Files

- `game/` — the playable game (`index.html` + ES modules under `src/`)
- `game/src/config.js` — tuning, layout, palette
- `game/src/world.js` — orders, plate, scoring, hearts, levels, shift timer
- `game/src/render.js` — all kitchen and food art, drawn with canvas paths
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — WebAudio sound effects (no audio files)
- `game/src/shots.js` — the staged screenshot scenes (`?shot=start|play|serve|end`)
- `main.ts` — hands `game/` and `screenshots/` in with a dossier
- `vendor/makefun-game.ts` — the kit's library, unchanged
- `screenshots/` — 4 real renders of the game: title, mid-assembly play,
  a served plate, and the end of a shift

## Run it

```sh
node serve.ts        # serves game/ on http://localhost:8080
```

Screenshot scenes (deterministic, same seed every time):

```sh
http://localhost:8080/?shot=start&seed=7
http://localhost:8080/?shot=play&seed=7
http://localhost:8080/?shot=serve&seed=7
http://localhost:8080/?shot=end&seed=7
```

## License

MIT — see `LICENSE`.
