/* Scoring, storage, and question-bank checks. No browser required. */
const assert = require("assert");
const logic = require("../js/logic");
const storeApi = require("../js/store");
const bank = require("../js/questions");
const { validateBank } = require("./validate-questions");

const errors = validateBank(bank);
assert.deepStrictEqual(errors, [], errors.join("\n"));

assert.strictEqual(logic.pointsForWrongCount(0), 3);
assert.strictEqual(logic.pointsForWrongCount(1), 2);
assert.strictEqual(logic.pointsForWrongCount(2), 1);
assert.strictEqual(logic.pointsForWrongCount(5), 1);

assert.strictEqual(logic.starsForPoints(24, 24), 3);
assert.strictEqual(logic.starsForPoints(21, 24), 3);
assert.strictEqual(logic.starsForPoints(20, 24), 2);
assert.strictEqual(logic.starsForPoints(15, 24), 2);
assert.strictEqual(logic.starsForPoints(14, 24), 1);
assert.strictEqual(logic.starsForPoints(8, 24), 1);
assert.strictEqual(logic.starsForPoints(0, 24), 0);

const original = ["a", "b", "c", "d"];
const shuffled = logic.shuffle(original, logic.mulberry32(7));
assert.deepStrictEqual(original, ["a", "b", "c", "d"]);
assert.deepStrictEqual(shuffled.slice().sort(), original.slice().sort());
assert.deepStrictEqual(logic.shuffle(original, logic.mulberry32(7)), shuffled);

const zero = { type: "zero" };
const first = { type: "first" };
assert.ok(logic.matchMismatchTip(zero, first).includes("零條件句"));
assert.ok(logic.matchMismatchTip(first, zero).includes("第一條件句"));
assert.ok(logic.matchMismatchTip(zero, { type: "zero" }).includes("意思"));

const sample = bank.levels.fill.questions[0];
assert.strictEqual(logic.checkChoice(sample, sample.answer).ok, true);
const wrong = sample.options.find((option) => option.text !== sample.answer);
assert.strictEqual(logic.checkChoice(sample, wrong.text).ok, false);
assert.ok(logic.checkChoice(sample, wrong.text).tip.includes("現在式") || logic.checkChoice(sample, wrong.text).tip.length > 4);

function memoryStorage(initial) {
  const data = Object.assign({}, initial);
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; },
    dump: data,
  };
}

const memory = memoryStorage();
const store = storeApi.createStore(memory);
assert.strictEqual(store.totalStars("A"), 0);
const firstClear = store.record("A", "fill", { stars: 2, points: 16, max: 24 });
assert.strictEqual(firstClear.firstClear, true);
assert.strictEqual(store.data.scores.A.levels.fill.stars, 2);
const worse = store.record("A", "fill", { stars: 1, points: 8, max: 24 });
assert.strictEqual(worse.improved, false);
assert.strictEqual(store.data.scores.A.levels.fill.stars, 2);
assert.strictEqual(store.data.scores.A.levels.fill.points, 16);
const better = store.record("A", "fill", { stars: 3, points: 24, max: 24 });
assert.strictEqual(better.improved, true);
assert.strictEqual(store.totalStars("A"), 3);
store.setPlayer("B");
assert.strictEqual(store.data.player, "B");
store.record("B", "match", { stars: 1, points: 12, max: 36 });
assert.strictEqual(store.totalStars("A"), 3);
assert.strictEqual(store.totalStars("B"), 1);
store.clear();
assert.strictEqual(store.totalStars("A"), 0);
assert.strictEqual(store.totalStars("B"), 0);
assert.strictEqual(store.data.player, "B");

const reloaded = storeApi.createStore(memory);
assert.strictEqual(reloaded.data.player, "B");
assert.strictEqual(reloaded.totalStars("A"), 0);

const broken = memoryStorage({ "if-quest-v1": "{" });
const recovered = storeApi.createStore(broken);
assert.strictEqual(recovered.persistent, false);
assert.strictEqual(recovered.data.player, "A");

const clamped = storeApi.normalize({
  player: "nope",
  scores: { A: { levels: { fill: { stars: 9, points: -4, max: 3.8, plays: 2 } } } },
});
assert.strictEqual(clamped.player, "A");
assert.strictEqual(clamped.scores.A.levels.fill.stars, 3);
assert.strictEqual(clamped.scores.A.levels.fill.points, 0);
assert.strictEqual(clamped.scores.A.levels.match.plays, 0);

const snapshot = JSON.stringify(bank);
logic.shuffle(bank.levels.mixed.questions, logic.mulberry32(3));
assert.strictEqual(JSON.stringify(bank), snapshot);

console.log("logic tests OK");
