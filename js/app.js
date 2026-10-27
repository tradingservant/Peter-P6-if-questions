/* Screens, tapping, and dragging for If Quest. */
(function () {
  const bank = window.IF_QUEST_BANK;
  const logic = window.IfQuestLogic;
  const storeApi = window.IfQuestStore;
  const app = document.getElementById("app");
  const ghost = document.getElementById("drag-ghost");

  if (!bank || !logic || !storeApi || !app) {
    if (app) app.textContent = "If Quest 未能載入。請確認 js 資料夾和 index.html 在同一層。";
    return;
  }

  const store = storeApi.createStore(window.localStorage);
  const state = {
    player: store.data.player === "B" ? "B" : "A",
    view: "home",
    session: null,
    result: null,
    modal: null,
  };

  let drag = null;
  let suppressClick = false;

  const TYPE_LABEL = {
    zero: "零條件句 Zero",
    first: "第一條件句 First",
    second: "第二條件句 Second",
  };

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeType(type) {
    return Object.prototype.hasOwnProperty.call(TYPE_LABEL, type) ? type : "zero";
  }

  function clampPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function playerName(id) {
    return id === "B" ? "玩家 B" : "玩家 A";
  }

  function levelById(id) {
    return bank.levels[id];
  }

  function nextLevelId(id) {
    const order = bank.levelOrder;
    const index = order.indexOf(id);
    if (index === -1 || index === order.length - 1) return null;
    return order[index + 1];
  }

  function currentHash() {
    const raw = location.hash.replace(/^#/, "");
    return raw || "/";
  }

  function parseRoute(hash) {
    const parts = String(hash || "").split("/").filter(Boolean);
    if (parts.length === 0) return { name: "home" };
    if (parts[0] === "notes") return { name: "notes" };
    if (parts[0] === "play" && levelById(parts[1])) return { name: "play", levelId: parts[1] };
    if (parts[0] === "result" && levelById(parts[1])) return { name: "result", levelId: parts[1] };
    return { name: "home" };
  }

  function navigate(hash, mode) {
    const url = "#" + hash;
    if (mode === "push") history.pushState({ ifQuest: true }, "", url);
    else history.replaceState({ ifQuest: true }, "", url);
    applyRoute(parseRoute(hash));
  }

  function applyRoute(route) {
    if (route.name === "home") {
      state.view = "home";
      state.session = null;
      state.result = null;
      state.modal = null;
    } else if (route.name === "notes") {
      state.view = "notes";
      state.modal = null;
    } else if (route.name === "play") {
      if (!state.session || state.session.levelId !== route.levelId) {
        state.session = createSession(route.levelId);
      }
      state.view = "play";
      state.modal = null;
    } else if (route.name === "result") {
      if (!state.result || state.result.levelId !== route.levelId) {
        navigate("/", "replace");
        return;
      }
      state.view = "result";
      state.session = null;
      state.modal = null;
    }
    render();
  }

  function createSession(levelId) {
    const level = levelById(levelId);
    const rng = logic.mulberry32(logic.newSeed());
    if (levelId === "match") {
      const rounds = level.rounds.map((round) => ({
        id: round.id,
        pairs: round.pairs,
        resultOrder: logic.shuffle(round.pairs.map((pair) => pair.id), rng),
      }));
      const total = rounds.reduce((sum, round) => sum + round.pairs.length, 0);
      return {
        kind: "match",
        levelId,
        rounds,
        roundIndex: 0,
        locked: {},
        wrongCounts: {},
        selected: null,
        points: 0,
        maxPoints: total * 3,
        perfect: 0,
        retried: 0,
        tip: "",
        tipKind: "",
        lastPoints: 0,
      };
    }
    const source = level.questions;
    const ordered = levelId === "mixed" ? logic.shuffle(source, rng) : source.slice();
    const questions = ordered.map((question) => ({
      ...question,
      options: logic.shuffle(question.options, rng),
    }));
    return {
      kind: "choice",
      levelId,
      questions,
      index: 0,
      missed: {},
      wrongCount: 0,
      solved: false,
      points: 0,
      maxPoints: questions.length * 3,
      perfect: 0,
      retried: 0,
      tip: "",
      tipKind: "",
      lastPoints: 0,
    };
  }

  function startLevel(levelId, mode) {
    state.session = createSession(levelId);
    state.result = null;
    navigate("/play/" + levelId, mode || "push");
  }

  function finishLevel() {
    const session = state.session;
    if (!session) return;
    const stars = logic.starsForPoints(session.points, session.maxPoints);
    const recorded = store.record(state.player, session.levelId, {
      stars,
      points: session.points,
      max: session.maxPoints,
    });
    state.result = {
      levelId: session.levelId,
      stars,
      points: session.points,
      maxPoints: session.maxPoints,
      perfect: session.perfect,
      retried: session.retried,
      improved: recorded.improved,
      firstClear: recorded.firstClear,
      best: recorded.best,
    };
    state.session = null;
    navigate("/result/" + state.result.levelId, "replace");
  }

  function currentRound() {
    return state.session.rounds[state.session.roundIndex];
  }

  function roundCleared(session) {
    const round = session.rounds[session.roundIndex];
    return round.pairs.every((pair) => session.locked[pair.id]);
  }

  function lockedCount(session) {
    return Object.keys(session.locked).length;
  }

  function attemptMatch(clauseId, resultId) {
    const session = state.session;
    if (!session || session.kind !== "match") return;
    if (session.locked[clauseId] || session.locked[resultId]) return;
    const round = currentRound();
    const clause = round.pairs.find((pair) => pair.id === clauseId);
    const result = round.pairs.find((pair) => pair.id === resultId);
    if (!clause || !result) return;
    session.selected = null;
    session.focusId = clauseId;
    if (clauseId === resultId) {
      const wrongs = session.wrongCounts[clauseId] || 0;
      const gained = logic.pointsForWrongCount(wrongs);
      session.points += gained;
      session.lastPoints = gained;
      session.locked[clauseId] = resultId;
      if (wrongs === 0) session.perfect += 1;
      else session.retried += 1;
      session.tip = bank.typeRules[clause.type];
      session.tipKind = "ok";
      if (roundCleared(session) && session.roundIndex === session.rounds.length - 1 && lockedCount(session) === session.maxPoints / 3) {
        session.tip = "全部配對完成。" + bank.typeRules[clause.type];
      }
    } else {
      session.wrongCounts[clauseId] = (session.wrongCounts[clauseId] || 0) + 1;
      session.tip = logic.matchMismatchTip(clause, result);
      session.tipKind = "bad";
      session.shake = [clauseId, resultId];
    }
    render();
    const shakeIds = session.shake || [];
    session.shake = null;
    shakeIds.forEach((id) => {
      const el = app.querySelector('[data-chip="' + id + '"]');
      if (el) el.classList.add("is-shake");
    });
  }

  function onTapChip(side, id) {
    const session = state.session;
    if (!session || session.kind !== "match" || session.locked[id]) return;
    const selected = session.selected;
    if (!selected) {
      session.selected = { side, id };
      render();
      return;
    }
    if (selected.side === side) {
      session.selected = selected.id === id ? null : { side, id };
      render();
      return;
    }
    const clauseId = side === "clause" ? id : selected.id;
    const resultId = side === "result" ? id : selected.id;
    attemptMatch(clauseId, resultId);
  }

  function chooseOption(index) {
    const session = state.session;
    if (!session || session.kind !== "choice" || session.solved) return;
    const question = session.questions[session.index];
    const option = question.options[index];
    if (!option) return;
    if (session.missed[option.text]) {
      session.tip = option.tip || question.rule;
      session.tipKind = "bad";
      render();
      return;
    }
    const result = logic.checkChoice(question, option.text);
    if (result.ok) {
      const gained = logic.pointsForWrongCount(session.wrongCount);
      session.points += gained;
      session.lastPoints = gained;
      session.solved = true;
      if (session.wrongCount === 0) session.perfect += 1;
      else session.retried += 1;
      session.tip = question.rule;
      session.tipKind = "ok";
    } else {
      session.wrongCount += 1;
      session.missed[option.text] = true;
      session.tip = result.tip;
      session.tipKind = "bad";
    }
    render();
  }

  function nextStep() {
    const session = state.session;
    if (!session) return;
    if (session.kind === "match") {
      if (!roundCleared(session)) return;
      if (session.roundIndex >= session.rounds.length - 1) {
        finishLevel();
        return;
      }
      session.roundIndex += 1;
      session.selected = null;
      session.tip = "";
      session.tipKind = "";
      render();
      return;
    }
    if (!session.solved) return;
    if (session.index >= session.questions.length - 1) {
      finishLevel();
      return;
    }
    session.index += 1;
    session.missed = {};
    session.wrongCount = 0;
    session.solved = false;
    session.tip = "";
    session.tipKind = "";
    session.lastPoints = 0;
    render();
  }

  function endDrag() {
    drag = null;
    if (ghost) ghost.hidden = true;
    document.querySelectorAll(".is-drop-target, .is-dragging").forEach((el) => {
      el.classList.remove("is-drop-target", "is-dragging");
    });
  }

  function hitChip(x, y) {
    const el = document.elementFromPoint(x, y);
    const chip = el && el.closest ? el.closest("[data-chip]") : null;
    if (!chip || chip.disabled) return null;
    return { el: chip, side: chip.dataset.side, id: chip.dataset.chip };
  }

  function starsHtml(count) {
    const on = Math.max(0, Math.min(3, Number(count) || 0));
    const icons = [0, 1, 2]
      .map((index) => '<span class="' + (index < on ? "is-on" : "") + '" aria-hidden="true">★</span>')
      .join("");
    const label = on === 0 ? "未有星星" : on + " 粒星";
    return '<span class="stars" role="img" aria-label="' + label + '">' + icons + "</span>";
  }

  function pill(type) {
    const safe = safeType(type);
    return '<span class="pill pill-' + safe + '">' + esc(TYPE_LABEL[safe]) + "</span>";
  }

  function feedbackHtml(session) {
    if (!session || !session.tip) {
      return '<div class="feedback is-empty" role="status" aria-live="polite"></div>';
    }
    const kind = session.tipKind === "ok" ? "is-ok" : "is-bad";
    let hint = "";
    if (session.tipKind === "bad") {
      const wrongs = session.kind === "match"
        ? (session.wrongCounts[session.focusId] || 0)
        : session.wrongCount;
      if (wrongs) hint = "改正後這題得 " + logic.pointsForWrongCount(wrongs) + " 分。";
    } else if (session.lastPoints) {
      hint = "這題得 " + session.lastPoints + " 分。";
    }
    return (
      '<div class="feedback ' + kind + '" role="status" aria-live="polite">' +
      "<p>" + esc(session.tip) + "</p>" +
      (hint ? '<p class="score-hint">' + esc(hint) + "</p>" : "") +
      "</div>"
    );
  }

  function footerHtml() {
    return '<footer class="site-footer">' + esc(bank.footer) + "</footer>";
  }

  function renderHome() {
    const three = Math.round(logic.THREE_STAR_RATIO * 100);
    const two = Math.round(logic.TWO_STAR_RATIO * 100);
    const total = store.totalStars(state.player);
    const levels = bank.levelOrder.map((id) => {
      const level = levelById(id);
      const score = store.data.scores[state.player].levels[id];
      const best = score.plays > 0 ? '<span>最佳 ' + score.points + "/" + score.max + "</span>" : "<span>未玩過</span>";
      return (
        '<button type="button" class="level-card" data-action="start" data-level="' + esc(id) + '">' +
        '<span class="level-no">' + esc(level.index) + "</span>" +
        '<span class="level-copy"><span class="level-title">' + esc(level.title) + " " + esc(level.en) + "</span>" +
        '<span class="level-blurb">' + esc(level.blurb) + "</span>" +
        '<span class="level-meta">' + starsHtml(score.stars) + best + "</span></span></button>"
      );
    }).join("");
    const storageNote = store.persistent
      ? ""
      : '<p class="warn">這個瀏覽器未能儲存星星。重新整理後，這一次的成績會消失。</p>';
    return (
      '<header class="topbar"><p class="brand">P5–P6 · Conditionals</p><span class="spacer"></span>' +
      '<button type="button" class="text-btn" data-action="notes">筆記</button></header>' +
      '<section class="hero">' +
      '<div class="hero-mark"><div class="stamp" aria-hidden="true">if</div><div>' +
      '<h1 class="wordmark">' + esc(bank.title) + "</h1>" +
      '<p class="subtitle">' + esc(bank.subtitle) + "</p></div></div>" +
      '<p class="lead">英文條件句小練習：零條件句、第一條件句、第二條件句。句子是英文，提示和筆記是中文。</p>' +
      '<ul class="chips"><li>事實 Zero</li><li>可能 First</li><li>想像 Second</li></ul></section>' +
      '<section class="panel"><div class="panel-head"><h2>兩位玩家</h2>' +
      '<span class="total-stars">' + esc(playerName(state.player)) + " · " + total + "/12</span></div>" +
      '<div class="player-switch" role="radiogroup" aria-label="選擇玩家">' +
      playerButton("A") + playerButton("B") + "</div>" +
      '<p class="fine">星星只存在這個瀏覽器，直到清除成績。一次答對得 3 分，錯一次後得 2 分，再錯得 1 分。達到 ' +
      three + "% 三粒星，" + two + "% 兩粒星。</p>" + storageNote + "</section>" +
      '<div class="levels">' + levels + "</div>" +
      '<div class="actions"><button type="button" class="secondary" data-action="notes">學習筆記</button>' +
      '<button type="button" class="ghost-btn" data-action="clear-ask">清除成績</button></div>' +
      footerHtml()
    );
  }

  function playerButton(id) {
    const checked = state.player === id ? "true" : "false";
    return '<button type="button" role="radio" aria-checked="' + checked + '" data-action="player" data-player="' + id + '">' +
      esc(playerName(id)) + "</button>";
  }

  function backBar(title, detail) {
    return (
      '<header class="topbar"><button type="button" class="icon-btn" data-action="back">返回</button>' +
      '<div class="topbar-title"><strong>' + esc(title) + "</strong><span>" + esc(detail) + "</span></div>" +
      '<button type="button" class="text-btn" data-action="notes">筆記</button></header>'
    );
  }

  function renderMatch() {
    const session = state.session;
    const level = levelById(session.levelId);
    const round = currentRound();
    const cleared = roundCleared(session);
    const done = lockedCount(session);
    const total = session.maxPoints / 3;
    const percent = clampPercent((done / total) * 100);
    const clauses = round.pairs.filter((pair) => !session.locked[pair.id]);
    const results = round.resultOrder
      .filter((id) => !session.locked[id])
      .map((id) => round.pairs.find((pair) => pair.id === id))
      .filter(Boolean);
    const matched = round.pairs.filter((pair) => session.locked[pair.id]);
    const primary = cleared
      ? (session.roundIndex >= session.rounds.length - 1 ? "看星星" : "下一組")
      : "";
    return (
      backBar(level.title + " " + level.en, "第 " + (session.roundIndex + 1) + " 組，共 " + session.rounds.length + " 組") +
      '<div class="meter" aria-hidden="true"><div class="meter-bar" style="width:' + percent + '%"></div></div>' +
      '<p class="meter-label">已配對 ' + done + "/" + total + " · 得分 " + session.points + " · " + esc(playerName(state.player)) + "</p>" +
      (session.roundIndex === 0 && done === 0 && !session.tip ? '<p class="help">' + esc(level.help) + "</p>" : "") +
      (clauses.length
        ? '<div class="board"><div><p class="col-label">IF 子句</p><div class="stack">' +
          clauses.map((pair) => chipHtml("clause", pair.id, pair.ifClause, session)).join("") +
          '</div></div><div><p class="col-label">結果</p><div class="stack">' +
          results.map((pair) => chipHtml("result", pair.id, pair.result, session)).join("") +
          "</div></div></div>"
        : "") +
      (matched.length
        ? '<div class="matched"><p class="col-label">這一組已配對</p>' + matched.map(matchedHtml).join("") + "</div>"
        : "") +
      feedbackHtml(session) +
      (primary
        ? '<div class="dock"><button type="button" class="primary" data-action="next">' + esc(primary) + "</button></div>"
        : "") +
      footerHtml()
    );
  }

  function chipHtml(side, id, text, session) {
    const selected = session.selected && session.selected.side === side && session.selected.id === id;
    return (
      '<button type="button" class="chip' + (selected ? " is-selected" : "") + '" data-chip="' + esc(id) +
      '" data-side="' + side + '" aria-pressed="' + (selected ? "true" : "false") + '"><span lang="en">' +
      esc(text) + "</span>" + (selected ? '<span class="mini" aria-hidden="true">已選</span>' : "") + "</button>"
    );
  }

  function matchedHtml(pair) {
    return (
      '<article class="pair-done"><p lang="en">' + esc(pair.ifClause + " " + pair.result) + "</p>" + pill(pair.type) + "</article>"
    );
  }

  function renderChoice() {
    const session = state.session;
    const level = levelById(session.levelId);
    const question = session.questions[session.index];
    const number = session.index + 1;
    const total = session.questions.length;
    const percent = clampPercent(((session.solved ? number : number - 1) / total) * 100);
    const kind = question.kind === "situation" ? "situation" : "fill";
    const last = number === total;
    const body = kind === "situation" ? situationHtml(question, session) : fillHtml(question, session);
    return (
      backBar(level.title + " " + level.en, "第 " + number + " 題，共 " + total + " 題") +
      '<div class="meter" aria-hidden="true"><div class="meter-bar" style="width:' + percent + '%"></div></div>' +
      '<p class="meter-label">得分 ' + session.points + "/" + session.maxPoints + " · " + esc(playerName(state.player)) + "</p>" +
      (number === 1 && !session.tip ? '<p class="help">' + esc(level.help) + "</p>" : "") +
      body +
      feedbackHtml(session) +
      (session.solved
        ? '<div class="dock"><button type="button" class="primary" data-action="next">' + (last ? "看星星" : "下一題") + "</button></div>"
        : "") +
      footerHtml()
    );
  }

  function fillHtml(question, session) {
    const stem = renderStem(question, session.solved);
    const solved = session.solved ? '<p class="type-row">' + pill(question.type) + "</p>" : "";
    return stem + solved + '<div class="choice-list">' + question.options.map((option, index) => choiceHtml(option, index, question, session)).join("") + "</div>";
  }

  function renderStem(question, reveal) {
    const parts = String(question.stem).split("______");
    const spoken = reveal ? question.stem.replace("______", question.answer) : question.stem.replace("______", "blank");
    if (parts.length !== 2) {
      return '<p class="stem" lang="en">' + esc(question.stem) + "</p>";
    }
    const blank = reveal
      ? '<span class="blank is-filled">' + esc(question.answer) + "</span>"
      : '<span class="blank" aria-hidden="true">______</span>';
    return '<p class="stem" lang="en" aria-label="' + esc(spoken) + '">' + esc(parts[0]) + blank + esc(parts[1]) + "</p>";
  }

  function situationHtml(question, session) {
    return (
      '<section class="situation"><p class="kicker">情境</p><p>' + esc(question.situation) + "</p></section>" +
      '<p class="ask">選出正確的英文句子。</p>' +
      '<div class="choice-list">' + question.options.map((option, index) => choiceHtml(option, index, question, session)).join("") + "</div>" +
      (session.solved ? '<p class="type-row">' + pill(question.type) + "</p>" : "")
    );
  }

  function choiceHtml(option, index, question, session) {
    const wrong = Boolean(session.missed[option.text]);
    const right = session.solved && option.text === question.answer;
    const classes = ["choice"];
    if (wrong) classes.push("is-wrong");
    if (right) classes.push("is-right");
    const mark = right ? "✓ " : wrong ? "✗ " : "";
    return (
      '<button type="button" class="' + classes.join(" ") + '" data-action="choose" data-index="' + index + '"' +
      (session.solved ? " disabled" : "") + (wrong ? ' aria-invalid="true"' : "") + ">" +
      (mark ? '<span class="mark" aria-hidden="true">' + mark + "</span>" : "") +
      '<span lang="en">' + esc(option.text) + "</span></button>"
    );
  }

  function renderNotes() {
    const fromPlay = state.session ? "返回題目" : "返回";
    const cards = bank.notes.map((note) => {
      const examples = (note.examples || []).map((example) =>
        '<div class="example"><p lang="en">' + esc(example.en) + '</p><p class="zh">' + esc(example.zh) + "</p></div>"
      ).join("");
      const lines = (note.lines || []).map((line) => "<li>" + esc(line) + "</li>").join("");
      const watch = (note.watch || []).map((line) => "<li>" + esc(line) + "</li>").join("");
      return (
        '<article class="note-card" id="note-' + esc(note.id) + '">' + pill(note.type) +
        "<h3>" + esc(note.title) + "</h3>" +
        '<p class="en-name" lang="en">' + esc(note.en) + "</p>" +
        "<ul>" + lines + "</ul>" + examples +
        (watch ? '<p class="kicker watch-label">留意</p><ul>' + watch + "</ul>" : "") +
        "</article>"
      );
    }).join("");
    return (
      '<header class="topbar"><button type="button" class="icon-btn" data-action="back">' + fromPlay + "</button>" +
      '<div class="topbar-title"><strong>學習筆記</strong><span>零、第一、第二條件句</span></div></header>' +
      '<section class="note"><h2 class="page-title">條件句筆記</h2>' +
      '<p class="help">給 P5–P6。先看是事實、可能發生，還是想像，再選動詞形式。</p>' +
      cards + "</section>" + footerHtml()
    );
  }

  function renderResult() {
    const result = state.result;
    const level = levelById(result.levelId);
    const next = nextLevelId(result.levelId);
    const cheer = result.stars >= 3
      ? "太好了，幾乎每題都一次答對。"
      : result.stars === 2
        ? "做得好。錯的地方可以翻開筆記再看一次。"
        : "這關完成了。看看中文提示，再挑戰會更穩。";
    const record = result.improved ? "新紀錄！已儲存。" : result.firstClear ? "成績已儲存在這部裝置。" : "這次沒有刷新最佳成績。";
    return (
      backBar("完成", playerName(state.player)) +
      '<section class="result-card"><p class="kicker">' + esc(level.title) + " " + esc(level.en) + "</p>" +
      '<div class="big-stars">' + starsHtml(result.stars) + "</div>" +
      "<h2>" + esc(cheer) + "</h2>" +
      '<p class="score-line">' + result.points + " / " + result.maxPoints + " 分</p>" +
      "<p>一次答對 " + result.perfect + " 題 · 曾經答錯 " + result.retried + " 題</p>" +
      "<p>" + esc(record) + "</p>" +
      "<p>最佳成績 " + result.best.stars + " 粒星（" + result.best.points + "/" + result.best.max + "）</p></section>" +
      '<div class="actions">' +
      (next ? '<button type="button" class="primary" data-action="next-level" data-level="' + esc(next) + '">下一關</button>' : "") +
      '<button type="button" class="secondary" data-action="replay">再玩一次</button>' +
      '<button type="button" class="ghost-btn" data-action="home">回首頁</button></div>' +
      footerHtml()
    );
  }

  function modalHtml() {
    if (!state.modal) return "";
    const modal = state.modal;
    return (
      '<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<h2 id="modal-title">' + esc(modal.title) + "</h2><p>" + esc(modal.body) + "</p>" +
      '<div class="actions"><button type="button" class="secondary" data-action="modal-no">' + esc(modal.no) + "</button>" +
      '<button type="button" class="primary" data-action="modal-yes">' + esc(modal.yes) + "</button></div></div></div>"
    );
  }

  function render() {
    endDrag();
    const main = state.view === "home"
      ? renderHome()
      : state.view === "notes"
        ? renderNotes()
        : state.view === "result"
          ? renderResult()
          : state.session && state.session.kind === "match"
            ? renderMatch()
            : renderChoice();
    app.innerHTML = '<main id="main">' + main + "</main>" + modalHtml();
    const live = app.querySelector(".feedback.is-bad, .feedback.is-ok");
    if (live) live.scrollIntoView({ block: "nearest" });
  }

  function openModal(modal) {
    state.modal = modal;
    render();
    const no = app.querySelector("[data-action='modal-no']");
    if (no) no.focus();
  }

  function requestBack() {
    if (state.modal) {
      state.modal = null;
      render();
      return;
    }
    if (state.view === "play" && state.session) {
      openModal({
        title: "離開這一關？",
        body: "這一關還沒完成。現在離開不會儲存這一次的分數。",
        yes: "離開",
        no: "繼續玩",
        yesAction: "leave",
      });
      return;
    }
    if (history.length > 1) history.back();
    else navigate("/", "replace");
  }

  function confirmLeave() {
    state.session = null;
    state.modal = null;
    const hash = currentHash();
    if (history.length > 1) history.back();
    else navigate("/", "replace");
    window.setTimeout(() => {
      if (currentHash() === hash && parseRoute(hash).name !== "home") navigate("/", "replace");
    }, 80);
  }

  app.addEventListener("click", (event) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const chip = event.target.closest("[data-chip]");
    if (chip) {
      onTapChip(chip.dataset.side, chip.dataset.chip);
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "player") {
      state.player = button.dataset.player === "B" ? "B" : "A";
      store.setPlayer(state.player);
      render();
      return;
    }
    if (action === "start") startLevel(button.dataset.level, "push");
    else if (action === "notes") navigate("/notes", "push");
    else if (action === "back") requestBack();
    else if (action === "home") {
      if (history.length > 1) history.back();
      else navigate("/", "replace");
    } else if (action === "choose") chooseOption(Number(button.dataset.index));
    else if (action === "next") nextStep();
    else if (action === "replay") startLevel(state.result.levelId, "replace");
    else if (action === "next-level") startLevel(button.dataset.level, "replace");
    else if (action === "clear-ask") {
      openModal({
        title: "清除成績？",
        body: "這會清除玩家 A 和玩家 B 在這部裝置上的星星。清除後不能復原。",
        yes: "清除",
        no: "取消",
        yesAction: "clear",
      });
    } else if (action === "modal-no") {
      state.modal = null;
      render();
    } else if (action === "modal-yes") {
      const yesAction = state.modal && state.modal.yesAction;
      if (yesAction === "clear") {
        store.clear();
        state.player = store.data.player;
        state.modal = null;
        render();
      } else if (yesAction === "leave") confirmLeave();
    }
  });

  app.addEventListener("pointerdown", (event) => {
    const chip = event.target.closest("[data-chip]");
    if (!chip || event.button > 0) return;
    drag = {
      id: chip.dataset.chip,
      side: chip.dataset.side,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      source: chip,
    };
    try { chip.setPointerCapture(event.pointerId); } catch (error) { /* older browsers */ }
  });

  app.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y);
    if (distance < 8) return;
    drag.moved = true;
    drag.source.classList.add("is-dragging");
    ghost.hidden = false;
    ghost.textContent = drag.source.innerText.replace("已選", "").trim();
    ghost.style.left = event.clientX + "px";
    ghost.style.top = event.clientY + "px";
    document.querySelectorAll(".is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
    const target = hitChip(event.clientX, event.clientY);
    if (target && target.side !== drag.side) target.el.classList.add("is-drop-target");
  });

  function finishPointer(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const info = drag;
    const moved = drag.moved;
    endDrag();
    if (!moved) return;
    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 400);
    const target = hitChip(event.clientX, event.clientY);
    if (!target || target.side === info.side) return;
    const clauseId = info.side === "clause" ? info.id : target.id;
    const resultId = info.side === "result" ? info.id : target.id;
    attemptMatch(clauseId, resultId);
  }

  app.addEventListener("pointerup", finishPointer);
  app.addEventListener("pointercancel", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    endDrag();
    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 400);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.modal) {
      state.modal = null;
      render();
    }
  });

  window.addEventListener("popstate", () => {
    applyRoute(parseRoute(currentHash()));
  });

  history.replaceState({ ifQuest: true }, "", "#" + currentHash());
  applyRoute(parseRoute(currentHash()));
})();
