# Peter's If Quest

Static English mini-game for Hong Kong Primary 5–6 students (Peter) practising **zero, first, and second conditionals**.

Practice sentences are in English. Hints, score feedback, and the teaching notes are in Traditional Chinese（書面語）.

兩位同學可以用同一部手機或電腦輪流玩。選 **玩家 A** 或 **玩家 B**。星星只存在這個瀏覽器，直到有人按 **清除成績**。

## Play locally

There is no build step and no server to install.

1. Clone this repository.
2. Open `index.html` in a browser.

Some browsers block `localStorage` on `file://` pages. If the stars do not stay after a refresh, start a static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### How a round works

1. **配對 Match** — join an if-clause to its result. Tap the two halves, or drag one onto the other. This level separates zero conditionals (present + present, `should`, or an imperative) from first conditionals (present + `will`).
2. **填空 Fill** — choose the verb form: present, `will`, `would`, `were`, `should`, or an imperative.
3. **情境 Situation** — read a short situation and pick the sentence. This level contrasts first (possible) and second (unreal or unlikely, with `were` for every subject).
4. **綜合 Mixed** — ten shuffled questions, then stars.

A wrong answer stays on the screen with a short Chinese rule until it is corrected. The first try scores 3 points, a correct answer after one miss scores 2, and later corrections score 1. A finished level earns three stars at 85%, two stars at 60%, and one star once it is completed.

`If` may start the sentence or sit in the middle. The meaning is the same.

Refreshing the page keeps saved stars and restarts any level that was not finished.

## GitHub Pages

The site is ready to be published from the **main** branch at the repository **root** (`index.html` is in the root). `.nojekyll` is included so Pages will serve the files as they are.

**Publishing waits for Eri's approval.** This project does not turn GitHub Pages on.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | App shell. Open this file to play. |
| `css/styles.css` | Phone-first layout. |
| `js/questions.js` | Editable question bank and Chinese notes. |
| `js/logic.js` | Scoring and answer checks. |
| `js/store.js` | Player stars in `localStorage` (`if-quest-v1`). |
| `js/app.js` | Screens, tapping, and dragging. |
| `manifest.webmanifest` | Light installable-app manifest. No service worker. |
| `scripts/validate-questions.js` | Checks the question bank. |
| `scripts/test-logic.js` | Scoring, storage, and bank checks. |

## Edit the sentences

Change `js/questions.js`. Keep the practice sentences original — do not paste copyrighted textbook exercises. Put new hints and notes in Traditional Chinese.

Then run:

```bash
node scripts/validate-questions.js
node scripts/test-logic.js
```

Match rounds use `ifClause` plus `result`. Fill questions put `______` in `stem` and set `slot` to `if`, `result`, or `imperative`. Situation questions give a Chinese `situation` and full English options. The `answer` field must match the correct option text exactly. Mixed questions are one list of about ten `fill` or `situation` items.

## Grammar covered

- **Zero:** facts, habits, and advice. Present + present. Advice may use `should` or an imperative in the result.
- **First:** a possible future result. Present + `will`. No `will` in the if-clause.
- **Second:** unreal or unlikely. Past + `would`. `were` for every subject, including `I`, `he`, and `she`.

## Privacy

No accounts, no server, and no secrets. Scores never leave the browser. The page does not load third-party scripts or fonts.
