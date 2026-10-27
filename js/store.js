/* Stars for 玩家 A and 玩家 B, kept in this browser only. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.IfQuestStore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const KEY = "if-quest-v1";
  const PLAYERS = ["A", "B"];
  const LEVELS = ["match", "fill", "situation", "mixed"];

  function emptyLevel() {
    return { stars: 0, points: 0, max: 0, plays: 0 };
  }

  function emptyPlayer() {
    const levels = {};
    LEVELS.forEach((id) => {
      levels[id] = emptyLevel();
    });
    return { levels };
  }

  function fresh() {
    return {
      player: "A",
      scores: { A: emptyPlayer(), B: emptyPlayer() },
    };
  }

  function normalize(raw) {
    const data = fresh();
    if (!raw || typeof raw !== "object") return data;
    if (raw.player === "B") data.player = "B";
    PLAYERS.forEach((player) => {
      const source = raw.scores && raw.scores[player];
      if (!source || !source.levels) return;
      LEVELS.forEach((levelId) => {
        const level = source.levels[levelId];
        if (!level) return;
        data.scores[player].levels[levelId] = {
          stars: clampStar(level.stars),
          points: clampNumber(level.points),
          max: clampNumber(level.max),
          plays: clampNumber(level.plays),
        };
      });
    });
    return data;
  }

  function clampStar(value) {
    const number = clampNumber(value);
    if (number > 3) return 3;
    return number;
  }

  function clampNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) return 0;
    return Math.floor(number);
  }

  function createStore(storage) {
    let data = fresh();
    let persistent = true;

    function read() {
      if (!storage) {
        persistent = false;
        return;
      }
      try {
        const raw = storage.getItem(KEY);
        if (!raw) return;
        data = normalize(JSON.parse(raw));
      } catch (error) {
        persistent = false;
        data = fresh();
      }
    }

    function write() {
      if (!storage) {
        persistent = false;
        return;
      }
      try {
        storage.setItem(KEY, JSON.stringify(data));
      } catch (error) {
        persistent = false;
      }
    }

    read();

    return {
      get data() {
        return data;
      },
      get persistent() {
        return persistent;
      },
      setPlayer(player) {
        if (PLAYERS.indexOf(player) === -1) return;
        data.player = player;
        write();
      },
      record(player, levelId, result) {
        if (!data.scores[player] || !data.scores[player].levels[levelId]) {
          return { improved: false, firstClear: false, best: emptyLevel() };
        }
        const level = data.scores[player].levels[levelId];
        const firstClear = level.plays === 0;
        const better =
          result.stars > level.stars ||
          (result.stars === level.stars && result.points > level.points);
        if (firstClear || better) {
          level.stars = clampStar(result.stars);
          level.points = clampNumber(result.points);
          level.max = clampNumber(result.max);
        }
        level.plays += 1;
        write();
        return {
          improved: Boolean(better && !firstClear),
          firstClear,
          best: {
            stars: level.stars,
            points: level.points,
            max: level.max,
            plays: level.plays,
          },
        };
      },
      clear() {
        const player = data.player;
        data = fresh();
        data.player = player;
        write();
      },
      totalStars(player) {
        const scores = data.scores[player];
        if (!scores) return 0;
        return LEVELS.reduce((sum, levelId) => sum + scores.levels[levelId].stars, 0);
      },
    };
  }

  return {
    KEY,
    PLAYERS,
    LEVELS,
    fresh,
    normalize,
    createStore,
  };
});
