/* Check js/questions.js before publishing a new set of sentences. */
const bank = require("../js/questions");

const CJK = /[\u4e00-\u9fff]/;
const WILL = /\bwill\b/i;
const WOULD = /\bwould\b/i;
const WAS = /\bwas\b/i;

function validateBank(source) {
  const errors = [];
  const ids = new Set();

  function claim(id, label) {
    if (!id || typeof id !== "string") {
      errors.push(label + " is missing an id");
      return;
    }
    if (ids.has(id)) errors.push("Duplicate id: " + id);
    ids.add(id);
  }

  if (!source || source.version !== "1.0") errors.push("version should be 1.0");
  if (source.footer !== "Peter's If Quest (v1.0)") errors.push("footer brand changed");
  ["zero", "first", "second"].forEach((type) => {
    if (!source.typeRules || !CJK.test(source.typeRules[type] || "")) {
      errors.push("typeRules." + type + " needs Traditional Chinese");
    }
  });
  if (!Array.isArray(source.levelOrder) || source.levelOrder.join() !== "match,fill,situation,mixed") {
    errors.push("levelOrder must be match, fill, situation, mixed");
  }
  if (!Array.isArray(source.notes) || source.notes.length < 4) errors.push("notes need at least 4 sections");
  (source.notes || []).forEach((note) => {
    claim(note.id, "note");
    if (!CJK.test((note.lines || []).join(""))) errors.push("note " + note.id + " needs Chinese lines");
    (note.examples || []).forEach((example, index) => {
      if (!/[A-Za-z]/.test(example.en || "")) errors.push("note " + note.id + " example " + index + " needs English");
      if (!CJK.test(example.zh || "")) errors.push("note " + note.id + " example " + index + " needs Chinese");
      if (WILL.test(ifClause(example.en)) || WAS.test(example.en)) {
        errors.push("note " + note.id + " example looks off: " + example.en);
      }
    });
  });

  const match = source.levels && source.levels.match;
  if (!match || !Array.isArray(match.rounds) || match.rounds.length < 3) {
    errors.push("match needs at least 3 rounds");
  }
  (match && match.rounds ? match.rounds : []).forEach((round) => {
    claim(round.id, "round");
    if (!round.pairs || round.pairs.length !== 4) errors.push(round.id + " should have 4 pairs");
    const types = new Set();
    (round.pairs || []).forEach((pair) => {
      claim(pair.id, "pair");
      types.add(pair.type);
      if (pair.type !== "zero" && pair.type !== "first") errors.push(pair.id + " type must be zero or first");
      if (!/^If\b/.test(pair.ifClause || "") || !String(pair.ifClause).trim().endsWith(",")) {
        errors.push(pair.id + " if-clause should start with If and end with a comma");
      }
      if (!String(pair.result || "").trim().endsWith(".")) errors.push(pair.id + " result should end with a full stop");
      if (WILL.test(pair.ifClause) || WOULD.test(pair.ifClause) || WAS.test(pair.ifClause)) {
        errors.push(pair.id + " if-clause should not use will, would, or was");
      }
      if (pair.type === "zero" && (WILL.test(pair.result) || WOULD.test(pair.result))) {
        errors.push(pair.id + " zero result should not use will or would");
      }
      if (pair.type === "first" && (!WILL.test(pair.result) || WOULD.test(pair.result))) {
        errors.push(pair.id + " first result should use will and not would");
      }
    });
    if (!types.has("zero") || !types.has("first")) errors.push(round.id + " should mix zero and first");
  });

  checkChoiceLevel(source.levels && source.levels.fill, "fill", errors, claim);
  checkChoiceLevel(source.levels && source.levels.situation, "situation", errors, claim);
  checkChoiceLevel(source.levels && source.levels.mixed, "mixed", errors, claim);

  const situation = source.levels.situation.questions.filter((item) => item.type === "first" || item.type === "second");
  const firsts = source.levels.situation.questions.filter((item) => item.type === "first").length;
  const seconds = source.levels.situation.questions.filter((item) => item.type === "second").length;
  if (situation.length < 6 || firsts < 3 || seconds < 3) {
    errors.push("situation level should emphasise first vs second");
  }
  if (source.levels.mixed.questions.length !== 10) errors.push("mixed level should have 10 questions");

  const sentences = allCorrectSentences(source);
  const startsWithIf = sentences.some((sentence) => /^If\b/.test(sentence));
  const middleIf = sentences.some((sentence) => /\sif\s/i.test(sentence) && !/^If\b/.test(sentence));
  if (!startsWithIf || !middleIf) errors.push("include if at the start and in the middle");

  return errors;
}

function checkChoiceLevel(level, expected, errors, claim) {
  if (!level || !Array.isArray(level.questions) || level.questions.length < 8) {
    errors.push(expected + " needs at least 8 questions");
    return;
  }
  level.questions.forEach((question) => {
    claim(question.id, expected);
    if (!question.rule || !CJK.test(question.rule)) errors.push(question.id + " needs a Chinese rule");
    if (!["zero", "first", "second"].includes(question.type)) errors.push(question.id + " has a bad type");
    const kind = question.kind;
    if (expected === "fill" && kind !== "fill") errors.push(question.id + " should be fill");
    if (expected === "situation" && kind !== "situation") errors.push(question.id + " should be situation");
    if (expected === "mixed" && kind !== "fill" && kind !== "situation") errors.push(question.id + " needs a kind");
    if (!question.options || question.options.length < 3) errors.push(question.id + " needs at least 3 options");
    const texts = (question.options || []).map((option) => option.text);
    if (new Set(texts).size !== texts.length) errors.push(question.id + " has duplicate options");
    if (!texts.includes(question.answer)) errors.push(question.id + " answer is not one of the options");
    (question.options || []).forEach((option) => {
      if (option.text === question.answer) return;
      if (!option.tip || !CJK.test(option.tip)) errors.push(question.id + " missing Chinese tip for: " + option.text);
    });
    if (kind === "fill") checkFill(question, errors);
    if (kind === "situation") checkSituation(question, errors);
    if (WAS.test(question.answer || "")) errors.push(question.id + " should use were, not was");
  });
}

function checkFill(question, errors) {
  const parts = String(question.stem || "").split("______");
  if (parts.length !== 2) errors.push(question.id + " stem needs one ______ blank");
  const answer = question.answer || "";
  const hasWill = WILL.test(answer);
  const hasWould = WOULD.test(answer);
  if (!["if", "result", "imperative"].includes(question.slot)) errors.push(question.id + " needs slot if, result, or imperative");
  if (question.slot === "imperative") {
    if (question.type !== "zero") errors.push(question.id + " imperative advice belongs to zero");
    if (/\s/.test(answer) || hasWill || hasWould) errors.push(question.id + " imperative answer should be a base verb");
  }
  if (question.type === "zero" && (hasWill || hasWould)) errors.push(question.id + " zero answer should not use will or would");
  if (question.type === "first" && question.slot === "if" && (hasWill || hasWould)) {
    errors.push(question.id + " do not put will or would in the if-clause");
  }
  if (question.type === "first" && question.slot === "result" && (!hasWill || hasWould)) {
    errors.push(question.id + " first result should use will");
  }
  if (question.type === "second" && question.slot === "if" && (hasWill || hasWould)) {
    errors.push(question.id + " second if-clause should be past or were");
  }
  if (question.type === "second" && question.slot === "result" && !hasWould) {
    errors.push(question.id + " second result should use would");
  }
}

function checkSituation(question, errors) {
  if (!CJK.test(question.situation || "")) errors.push(question.id + " needs a Chinese situation");
  const answer = question.answer || "";
  if (WILL.test(ifClause(answer))) errors.push(question.id + " correct if-clause contains will");
  if (question.type === "zero" && (WILL.test(answer) || WOULD.test(answer))) {
    errors.push(question.id + " zero sentence should not use will or would");
  }
  if (question.type === "first" && (!WILL.test(answer) || WOULD.test(answer))) {
    errors.push(question.id + " first sentence should use will and not would");
  }
  if (question.type === "second" && !WOULD.test(answer)) errors.push(question.id + " second sentence should use would");
}

function ifClause(sentence) {
  const text = String(sentence || "").trim();
  if (/^if\b/i.test(text)) {
    const comma = text.indexOf(",");
    return comma === -1 ? text : text.slice(0, comma);
  }
  const at = text.toLowerCase().indexOf(" if ");
  if (at === -1) return "";
  return text.slice(at + 1);
}

function allCorrectSentences(source) {
  const sentences = [];
  source.levels.match.rounds.forEach((round) => {
    round.pairs.forEach((pair) => sentences.push(pair.ifClause + " " + pair.result));
  });
  ["situation", "mixed"].forEach((levelId) => {
    source.levels[levelId].questions.forEach((question) => {
      if (question.kind === "situation") sentences.push(question.answer);
    });
  });
  return sentences;
}

if (require.main === module) {
  const errors = validateBank(bank);
  if (errors.length) {
    errors.forEach((error) => console.error("• " + error));
    console.error(errors.length + " problem(s)");
    process.exit(1);
  }
  const counts = {
    pairs: bank.levels.match.rounds.reduce((sum, round) => sum + round.pairs.length, 0),
    fill: bank.levels.fill.questions.length,
    situation: bank.levels.situation.questions.length,
    mixed: bank.levels.mixed.questions.length,
  };
  console.log("OK", counts);
}

module.exports = { validateBank, ifClause };
