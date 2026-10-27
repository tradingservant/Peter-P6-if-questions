/* Scoring and answer checks for If Quest. No DOM here. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.IfQuestLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const THREE_STAR_RATIO = 0.85;
  const TWO_STAR_RATIO = 0.6;

  function pointsForWrongCount(wrongCount) {
    const wrongs = Number(wrongCount) || 0;
    if (wrongs <= 0) return 3;
    if (wrongs === 1) return 2;
    return 1;
  }

  function starsForPoints(points, maxPoints) {
    const earned = Number(points) || 0;
    const max = Number(maxPoints) || 0;
    if (earned <= 0 || max <= 0) return 0;
    const ratio = earned / max;
    if (ratio >= THREE_STAR_RATIO) return 3;
    if (ratio >= TWO_STAR_RATIO) return 2;
    return 1;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function rng() {
      value = (value + 0x6d2b79f5) >>> 0;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function newSeed() {
    return Math.floor(Math.random() * 0x100000000);
  }

  function shuffle(items, rng) {
    const copy = items.slice();
    const random = rng || Math.random;
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      const hold = copy[index];
      copy[index] = copy[swap];
      copy[swap] = hold;
    }
    return copy;
  }

  function checkChoice(question, optionText) {
    const options = question && question.options ? question.options : [];
    const option = options.find((item) => item.text === optionText);
    if (!option) return { ok: false, tip: "請再選一次。" };
    if (optionText === question.answer) {
      return { ok: true, rule: question.rule, type: question.type };
    }
    return { ok: false, tip: option.tip || question.rule, type: question.type };
  }

  function matchMismatchTip(clause, result) {
    if (!clause || !result) return "請再配一次。";
    if (clause.type !== result.type) {
      if (clause.type === "zero") {
        return "這兩句不是一對。左邊是零條件句，用來講事實或建議。結果用現在式、should 或祈使句，不用 will。";
      }
      return "這兩句不是一對。左邊是第一條件句，用來講有可能發生的事。結果要用 will。";
    }
    return "這兩句類型相近，但意思還沒配上。請再讀一次兩邊在說什麼。";
  }

  return {
    THREE_STAR_RATIO,
    TWO_STAR_RATIO,
    pointsForWrongCount,
    starsForPoints,
    mulberry32,
    newSeed,
    shuffle,
    checkChoice,
    matchMismatchTip,
  };
});
