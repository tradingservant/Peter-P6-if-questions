/*
 * If Quest question bank — edit this file to change practice sentences.
 *
 * Sentences are original. Do not paste copyrighted textbook exercises.
 * Hints (tip, rule, situation, notes) are Traditional Chinese 書面語.
 * Practice sentences (stem, options, ifClause, result, examples) are English.
 *
 * After editing, run: node scripts/validate-questions.js
 *
 * Match rounds
 *   pairs[].type      "zero" or "first"
 *   pairs[].ifClause  starts with "If" and ends with a comma
 *   pairs[].result    the matching ending, including the full stop
 *   Wrong-pair tips are generated from the two types.
 *
 * Fill questions
 *   kind: "fill"
 *   stem contains ______
 *   slot: "if" (the blank is inside the if-clause),
 *         "result" (the blank is in the result),
 *         or "imperative" (base verb used as a command)
 *   answer: exact text of the correct option
 *   every wrong option needs a Chinese tip
 *
 * Situation questions
 *   kind: "situation"
 *   situation: Chinese context
 *   options: full English sentences
 *   answer: exact text of the correct sentence
 *
 * Mixed questions use kind "fill" or "situation" in one list of about 10.
 * The app shuffles mixed questions, match results, and every set of options.
 */
(function (root, factory) {
  const bank = factory();
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (root) root.IF_QUEST_BANK = bank;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    version: "1.0",
    footer: "Peter's If Quest (v1.0)",
    title: "If Quest",
    subtitle: "條件句小挑戰",
    levelOrder: ["match", "fill", "situation", "mixed"],
    typeRules: {
      zero: "零條件句：講事實、習慣或建議。If 用現在式，結果用現在式、should 或祈使句。",
      first: "第一條件句：講有可能發生的事。If 用現在式，結果用 will。if 裡面不要用 will。",
      second: "第二條件句：講不真實或很不可能的想像。If 用過去式，結果用 would。be 動詞用 were。",
    },
    levels: {
      match: {
        id: "match",
        index: "1",
        title: "配對",
        en: "Match",
        blurb: "把 if 子句和結果配成一句",
        help: "點選左右兩邊，或把一邊拖到另一邊。零條件句對現在式、should 或祈使句；第一條件句對 will。配錯會留下提示，直到配對為止。",
        rounds: [
          {
            id: "r1",
            pairs: [
              {
                id: "r1a",
                type: "zero",
                ifClause: "If you mix red and yellow,",
                result: "you get orange.",
              },
              {
                id: "r1b",
                type: "zero",
                ifClause: "If you have a fever,",
                result: "you should stay in bed.",
              },
              {
                id: "r1c",
                type: "first",
                ifClause: "If the pool is open on Saturday,",
                result: "we will go swimming.",
              },
              {
                id: "r1d",
                type: "first",
                ifClause: "If Peter forgets his lunch box,",
                result: "his mum will bring it to school.",
              },
            ],
          },
          {
            id: "r2",
            pairs: [
              {
                id: "r2a",
                type: "zero",
                ifClause: "If the traffic light is red,",
                result: "cars stop.",
              },
              {
                id: "r2b",
                type: "zero",
                ifClause: "If your pencil is blunt,",
                result: "sharpen it.",
              },
              {
                id: "r2c",
                type: "first",
                ifClause: "If we finish the project today,",
                result: "the teacher will put it on the board.",
              },
              {
                id: "r2d",
                type: "first",
                ifClause: "If it is sunny after school,",
                result: "we will walk to the MTR.",
              },
            ],
          },
          {
            id: "r3",
            pairs: [
              {
                id: "r3a",
                type: "zero",
                ifClause: "If you do not charge your phone,",
                result: "the battery runs out.",
              },
              {
                id: "r3b",
                type: "zero",
                ifClause: "If you make a mistake,",
                result: "you should try again.",
              },
              {
                id: "r3c",
                type: "first",
                ifClause: "If Grandma calls tonight,",
                result: "I will tell her about the school picnic.",
              },
              {
                id: "r3d",
                type: "first",
                ifClause: "If the bookshop has the new comic,",
                result: "I will buy it with my pocket money.",
              },
            ],
          },
        ],
      },
      fill: {
        id: "fill",
        index: "2",
        title: "填空",
        en: "Fill",
        blurb: "選出正確的動詞形式",
        help: "空格可能在 if 裡面，也可能在結果。看清楚是事實、可能發生的事，還是想像。答錯的選項會留在畫面上，直到選對為止。",
        questions: [
          {
            id: "f1",
            kind: "fill",
            type: "zero",
            slot: "if",
            stem: "If people ______ too much junk food, they feel sick.",
            answer: "eat",
            rule: "零條件句講事實：if 後面用現在式，不用 will。",
            options: [
              { text: "eat" },
              { text: "will eat", tip: "這句講一般事實。if 後面不要用 will，要用現在式。" },
              { text: "ate", tip: "過去式用於第二條件句的想像。這裡是事實，用現在式。" },
              { text: "would eat", tip: "would 用來談想像。這句是事實，if 後面用現在式。" },
            ],
          },
          {
            id: "f2",
            kind: "fill",
            type: "zero",
            slot: "if",
            stem: "Plants die if they ______ enough water.",
            answer: "do not get",
            rule: "If 放在句中，意思一樣。講事實時，if 後面仍用現在式。",
            options: [
              { text: "do not get" },
              { text: "will not get", tip: "if 後面不要用 will。植物缺水會枯，這是事實，用現在式。" },
              { text: "did not get", tip: "這不是過去的一次事件，也不是想像。用現在式。" },
              { text: "would not get", tip: "would 用於第二條件句。這句是事實。" },
            ],
          },
          {
            id: "f3",
            kind: "fill",
            type: "zero",
            slot: "imperative",
            stem: "If you feel dizzy, ______ down and tell a teacher.",
            answer: "sit",
            rule: "零條件句的建議可以用祈使句。祈使句用動詞原形，不加 s。",
            options: [
              { text: "sit" },
              { text: "sits", tip: "這是祈使句，用來給指示。動詞用原形 sit，不加 s。" },
              { text: "will sit", tip: "這是當下的建議，不是預測將來。用祈使句 sit。" },
              { text: "would sit", tip: "would 用於想像。這裡是實在的建議，用祈使句。" },
            ],
          },
          {
            id: "f4",
            kind: "fill",
            type: "first",
            slot: "result",
            stem: "If we catch the 7:30 bus, we ______ at school on time.",
            answer: "will arrive",
            rule: "第一條件句講有可能發生的事：If + 現在式，will + 原形動詞。",
            options: [
              { text: "will arrive" },
              { text: "arrive", tip: "趕上班次車是有可能發生的事。第一條件句的結果要用 will arrive。" },
              { text: "would arrive", tip: "這件事有可能發生，不是空想。結果用 will，不用 would。" },
              { text: "arrived", tip: "結果不是過去式。第一條件句用 will + 原形動詞。" },
            ],
          },
          {
            id: "f5",
            kind: "fill",
            type: "first",
            slot: "if",
            stem: "If Amy ______ the race, she will get a medal.",
            answer: "wins",
            rule: "第一條件句的 if 裡面用現在式，不要用 will。will 放在結果。",
            options: [
              { text: "wins" },
              { text: "will win", tip: "if 後面不要用 will。用現在式 wins。" },
              { text: "won", tip: "比賽有可能贏，不是想像。if 用現在式 wins。" },
              { text: "would win", tip: "would 不放在 if 後面。這句 if 用現在式 wins。" },
            ],
          },
          {
            id: "f6",
            kind: "fill",
            type: "second",
            slot: "if",
            stem: "If I ______ a time machine, I would visit old Hong Kong.",
            answer: "had",
            rule: "第二條件句談想像：If + 過去式，would + 原形動詞。",
            options: [
              { text: "had" },
              { text: "have", tip: "沒有時光機，這是想像。if 用過去式 had，不用現在式 have。" },
              { text: "will have", tip: "if 後面不要用 will。想像的情況用過去式 had。" },
              { text: "would have", tip: "would 放在結果子句。if 裡面用 had。" },
            ],
          },
          {
            id: "f7",
            kind: "fill",
            type: "second",
            slot: "if",
            stem: "If he ______ a better swimmer, he would join the school team.",
            answer: "were",
            rule: "第二條件句裡，所有人稱的 be 動詞都用 were。",
            options: [
              { text: "were" },
              { text: "is", tip: "他現在並不是更好的游泳選手。想像時 be 動詞用 were。" },
              { text: "will be", tip: "if 後面不要用 will。第二條件句的 be 用 were。" },
              { text: "would be", tip: "would 放在後半句。if 裡面的 be 用 were。" },
            ],
          },
          {
            id: "f8",
            kind: "fill",
            type: "second",
            slot: "if",
            stem: "I would travel by ferry every day if I ______ on an island.",
            answer: "lived",
            rule: "If 可以放在句中。第二條件句的 if 仍然用過去式。",
            options: [
              { text: "lived" },
              { text: "live", tip: "住在島上是假設。第二條件句的 if 用過去式 lived。" },
              { text: "will live", tip: "即使 if 放在句中，if 後面也不用 will。用 lived。" },
              { text: "would live", tip: "would 已經用在前半句。if 裡面用過去式 lived。" },
            ],
          },
        ],
      },
      situation: {
        id: "situation",
        index: "3",
        title: "情境",
        en: "Situation",
        blurb: "看情境，選出正確句子",
        help: "先讀中文情境，再判斷是有可能發生（第一條件句），還是不真實的想像（第二條件句）。答錯會留下提示，直到選對為止。",
        questions: [
          {
            id: "s1",
            kind: "situation",
            type: "first",
            situation: "明天可能下雨。Peter 和妹妹正在商量放學後做什麼。",
            answer: "If it rains tomorrow, we will stay in and draw.",
            rule: "有可能發生的將來，用第一條件句：If + 現在式，will + 原形動詞。",
            options: [
              { text: "If it rains tomorrow, we will stay in and draw." },
              {
                text: "If it rained tomorrow, we would stay in and draw.",
                tip: "明天下雨是有可能的，不是空想。用第一條件句：If + 現在式，will。",
              },
              {
                text: "If it will rain tomorrow, we will stay in and draw.",
                tip: "if 後面不要用 will。用 rains。",
              },
            ],
          },
          {
            id: "s2",
            kind: "situation",
            type: "second",
            situation: "Peter 沒有會說話的鸚鵡，他只是在幻想。",
            answer: "If I had a talking parrot, I would teach it my name.",
            rule: "不真實的想像用第二條件句：If + 過去式，would + 原形動詞。",
            options: [
              { text: "If I had a talking parrot, I would teach it my name." },
              {
                text: "If I have a talking parrot, I will teach it my name.",
                tip: "他其實沒有這隻鸚鵡，所以不是「有可能發生」。用第二條件句：過去式 + would。",
              },
              {
                text: "If I had a talking parrot, I will teach it my name.",
                tip: "前半用了過去式 had，後半就要用 would，不能用 will。",
              },
            ],
          },
          {
            id: "s3",
            kind: "situation",
            type: "second",
            situation: "同學想抄功課。Peter 說「如果我是你」——他並不是那位同學。",
            answer: "If I were you, I would do the homework myself.",
            rule: "「如果我是你」不是事實。所有人稱都用 were，結果用 would。",
            options: [
              { text: "If I were you, I would do the homework myself." },
              {
                text: "If I am you, I will do the homework myself.",
                tip: "「如果我是你」不是事實。be 動詞用 were，結果用 would。",
              },
              {
                text: "If I were you, I will do the homework myself.",
                tip: "were 要配 would，不要配 will。",
              },
            ],
          },
          {
            id: "s4",
            kind: "situation",
            type: "first",
            situation: "星期日有可能放晴。班上真的計劃去野餐。",
            answer: "We will have a picnic if it is sunny on Sunday.",
            rule: "If 放在句中，意思相同。有可能發生的事仍用 will，if 後面用現在式。",
            options: [
              { text: "We will have a picnic if it is sunny on Sunday." },
              {
                text: "We would have a picnic if it were sunny on Sunday.",
                tip: "星期日放晴是有可能的。這句是第二條件句，用於不真實的想像。這裡要用 will。",
              },
              {
                text: "We will have a picnic if it will be sunny on Sunday.",
                tip: "即使 if 放在句中，if 後面仍然不用 will。",
              },
            ],
          },
          {
            id: "s5",
            kind: "situation",
            type: "second",
            situation: "人現在不能住在月球。Peter 正在寫一篇想像文。",
            answer: "If people lived on the Moon, they would miss the blue sky.",
            rule: "很不可能的想像用第二條件句：過去式 + would。",
            options: [
              { text: "If people lived on the Moon, they would miss the blue sky." },
              {
                text: "If people live on the Moon, they will miss the blue sky.",
                tip: "現在不能住在月球，這是不太可能的想像。用第二條件句：過去式 + would。",
              },
              {
                text: "If people lived on the Moon, they will miss the blue sky.",
                tip: "lived 是過去式，結果要用 would，不是 will。",
              },
            ],
          },
          {
            id: "s6",
            kind: "situation",
            type: "first",
            situation: "星期五有英文小測。Peter 今晚還來得及溫習。",
            answer: "If Peter revises tonight, he will feel more ready on Friday.",
            rule: "做得到的計劃用第一條件句：If + 現在式，will + 原形動詞。",
            options: [
              { text: "If Peter revises tonight, he will feel more ready on Friday." },
              {
                text: "If Peter revised tonight, he would feel more ready on Friday.",
                tip: "他今晚真的可以溫習，這是做得到的事。用第一條件句：現在式 + will。",
              },
              {
                text: "If Peter will revise tonight, he feels more ready on Friday.",
                tip: "if 後面不要用 will。這也不是講事實的零條件句。",
              },
            ],
          },
          {
            id: "s7",
            kind: "situation",
            type: "zero",
            situation: "水在零度或以下會結冰。這是自然事實，不是幻想。",
            answer: "If the temperature drops below 0°C, water freezes.",
            rule: "科學事實用零條件句：If + 現在式，現在式。",
            options: [
              { text: "If the temperature drops below 0°C, water freezes." },
              {
                text: "If the temperature drops below 0°C, water will freeze.",
                tip: "這是科學事實。零條件句用現在式 + 現在式，不必加 will。",
              },
              {
                text: "If the temperature dropped below 0°C, water would freeze.",
                tip: "水在 0°C 結冰是事實，不是想像。兩邊都用現在式。",
              },
            ],
          },
          {
            id: "s8",
            kind: "situation",
            type: "zero",
            situation: "妹妹現在真的會緊張。Peter 給她一個做得到的建議。",
            answer: "If you feel nervous, you should breathe slowly.",
            rule: "現在的建議可以用零條件句：If + 現在式，should + 原形動詞。",
            options: [
              { text: "If you feel nervous, you should breathe slowly." },
              {
                text: "If you feel nervous, you would breathe slowly.",
                tip: "這是現在的建議。可以用 should，不用 would。",
              },
              {
                text: "If you felt nervous, you would breathe slowly.",
                tip: "妹妹現在真的會緊張，不是假設。用 If + 現在式，should。",
              },
            ],
          },
        ],
      },
      mixed: {
        id: "mixed",
        index: "4",
        title: "綜合",
        en: "Mixed",
        blurb: "混合十題，然後看星星",
        help: "題目順序會洗牌。一次答對得 3 分，錯一次後答對得 2 分，再錯則得 1 分。答錯會留下中文提示，直到改正。",
        questions: [
          {
            id: "x1",
            kind: "fill",
            type: "zero",
            slot: "result",
            stem: "If you add sugar to tea, it ______ sweeter.",
            answer: "tastes",
            rule: "零條件句講事實：結果用現在式，不加 will。",
            options: [
              { text: "tastes" },
              { text: "will taste", tip: "加糖後茶會更甜，這是事實。零條件句的結果用現在式 tastes。" },
              { text: "would taste", tip: "would 用於想像。這句是事實，用 tastes。" },
              { text: "tasted", tip: "這不是過去式。講事實的結果用現在式 tastes。" },
            ],
          },
          {
            id: "x2",
            kind: "situation",
            type: "first",
            situation: "下個月家人可能帶 Peter 去日本探親，大家正在討論這次行程。",
            answer: "If we go to Japan, I will try ramen.",
            rule: "行程有可能成行。用第一條件句：If + 現在式，will。",
            options: [
              { text: "If we go to Japan, I will try ramen." },
              {
                text: "If we went to Japan, I would try ramen.",
                tip: "這次旅行有可能發生，不是空想。用第一條件句：現在式 + will。",
              },
              {
                text: "If we will go to Japan, I try ramen.",
                tip: "if 後面不要用 will。用 go，結果用 will try。",
              },
            ],
          },
          {
            id: "x3",
            kind: "fill",
            type: "second",
            slot: "if",
            stem: "If I ______ the principal for one day, I would add a longer recess.",
            answer: "were",
            rule: "第二條件句的 be 動詞，所有人稱都用 were。",
            options: [
              { text: "were" },
              { text: "am", tip: "Peter 不是校長。想像時 be 動詞用 were，不用 am。" },
              { text: "will be", tip: "if 後面不要用 will。這是想像，用 were。" },
              { text: "would be", tip: "would 放在結果。if 裡面的 be 用 were。" },
            ],
          },
          {
            id: "x4",
            kind: "fill",
            type: "first",
            slot: "if",
            stem: "The team will celebrate if they ______ the final.",
            answer: "win",
            rule: "If 在句中時，if 後面仍然用現在式，will 放在結果。",
            options: [
              { text: "win" },
              { text: "will win", tip: "if 後面不要用 will。用現在式 win。" },
              { text: "won", tip: "決賽有可能贏。這是第一條件句，if 用現在式 win。" },
              { text: "would win", tip: "would 不放在 if 後面。這裡用現在式 win。" },
            ],
          },
          {
            id: "x5",
            kind: "situation",
            type: "first",
            situation: "明天如果不塞車，他們會準時到達博物館。這是有可能發生的事。",
            answer: "They will arrive at the museum on time if the traffic is light tomorrow.",
            rule: "If 放句首或句中都可以。有可能發生的事用 will，if 後面用現在式。",
            options: [
              { text: "They will arrive at the museum on time if the traffic is light tomorrow." },
              {
                text: "They will arrive at the museum on time if the traffic will be light tomorrow.",
                tip: "即使 if 放在句中，if 後面也不用 will。用 is。",
              },
              {
                text: "They would arrive at the museum on time if the traffic is light tomorrow.",
                tip: "有可能發生的事不要用 would。前半用 will，if 後面用現在式。",
              },
            ],
          },
          {
            id: "x6",
            kind: "fill",
            type: "zero",
            slot: "imperative",
            stem: "If the noodles are too hot, ______ on them.",
            answer: "blow",
            rule: "給指示時可以用祈使句。祈使句用動詞原形。",
            options: [
              { text: "blow" },
              { text: "blows", tip: "祈使句用原形 blow，不加 s。" },
              { text: "will blow", tip: "這是提醒人立刻做的事，用祈使句 blow，不用 will。" },
              { text: "would blow", tip: "would 用於想像。這裡是實在的指示，用 blow。" },
            ],
          },
          {
            id: "x7",
            kind: "situation",
            type: "second",
            situation: "Peter 不會魔法，這只是想像。",
            answer: "If I knew magic, I would tidy my room in one second.",
            rule: "不真實的想像用第二條件句：過去式 + would。",
            options: [
              { text: "If I knew magic, I would tidy my room in one second." },
              {
                text: "If I know magic, I will tidy my room in one second.",
                tip: "他不會魔法，不是有可能發生的事。用第二條件句：過去式 + would。",
              },
              {
                text: "If I knew magic, I will tidy my room in one second.",
                tip: "knew 是過去式，結果要用 would，不能用 will。",
              },
            ],
          },
          {
            id: "x8",
            kind: "fill",
            type: "first",
            slot: "result",
            stem: "If the No. 8 typhoon signal is up tomorrow, we ______ at home.",
            answer: "will stay",
            rule: "明天有可能發生的事，用第一條件句：結果用 will + 原形動詞。",
            options: [
              { text: "will stay" },
              { text: "stay", tip: "這是明天有可能發生的事，不是只講日常事實。結果用 will stay。" },
              { text: "would stay", tip: "八號風球明天可能懸掛，不是空想。用 will，不用 would。" },
              { text: "stayed", tip: "結果用 will + 原形，不是過去式。" },
            ],
          },
          {
            id: "x9",
            kind: "situation",
            type: "zero",
            situation: "老師在說明圖書館的常規：大聲說話會打擾別人。這是一般情況，不是在預測某一天，也不是幻想。",
            answer: "If you talk loudly in the library, you disturb other people.",
            rule: "常規和事實用零條件句：If + 現在式，現在式。",
            options: [
              { text: "If you talk loudly in the library, you disturb other people." },
              {
                text: "If you talk loudly in the library, you will disturb other people.",
                tip: "這是圖書館的常規，用零條件句：現在式 + 現在式，不必加 will。",
              },
              {
                text: "If you talked loudly in the library, you would disturb other people.",
                tip: "這不是想像。講常規時，兩邊都用現在式。",
              },
            ],
          },
          {
            id: "x10",
            kind: "fill",
            type: "second",
            slot: "if",
            stem: "She would lend you a ruler if you ______ her.",
            answer: "asked",
            rule: "第二條件句：結果用 would，if 裡面用過去式。",
            options: [
              { text: "asked" },
              { text: "ask", tip: "前半用了 would，這是想像。if 用過去式 asked。" },
              { text: "will ask", tip: "if 後面不要用 will。這句用過去式 asked。" },
              { text: "would ask", tip: "would 已經在前半句。if 裡面用過去式 asked。" },
            ],
          },
        ],
      },
    },
    notes: [
      {
        id: "zero",
        type: "zero",
        title: "零條件句",
        en: "Zero conditional",
        lines: [
          "用來講事實、習慣，或者給一個現在做得到的建議。",
          "If 後面用現在式。結果也用現在式。",
          "建議可以改用 should + 原形動詞，或直接用祈使句（動詞原形）。",
        ],
        examples: [
          { en: "If you heat ice, it melts.", zh: "事實：兩邊都用現在式。" },
          { en: "If you are tired, you should rest.", zh: "建議：結果用 should。" },
          { en: "If the soup is hot, blow on it.", zh: "建議：結果用祈使句，動詞用原形。" },
        ],
        watch: ["講事實時不要加 will，也不要用 would。"],
      },
      {
        id: "first",
        type: "first",
        title: "第一條件句",
        en: "First conditional",
        lines: [
          "用來講將來有可能發生的事，以及那時的結果。",
          "句式：If + 現在式，will + 原形動詞。",
          "will 放在結果，不要放在 if 後面。",
        ],
        examples: [
          { en: "If it rains tomorrow, we will stay at home.", zh: "明天下雨是有可能的。" },
          { en: "We will be late if we miss the bus.", zh: "If 放在句中，意思一樣。" },
        ],
        watch: [
          "錯誤：If it will rain, we will stay at home.",
          "正確：If it rains, we will stay at home.",
        ],
      },
      {
        id: "second",
        type: "second",
        title: "第二條件句",
        en: "Second conditional",
        lines: [
          "用來講現在不真實，或很不可能的想像。",
          "句式：If + 過去式，would + 原形動詞。",
          "be 動詞不論哪一個人稱，都用 were。",
        ],
        examples: [
          { en: "If I had a robot, I would ask it for help.", zh: "現在沒有機器人，只是想像。" },
          { en: "If I were you, I would tell the truth.", zh: "我不是你，所以用 were。" },
          { en: "If she were a bird, she would fly.", zh: "she 也用 were，不用 was。" },
        ],
        watch: ["想像的情況不要用 will。would 放在結果，不放在 if 裡面。"],
      },
      {
        id: "position",
        type: "first",
        title: "If 的位置",
        en: "Where to put if",
        lines: [
          "If 可以放在句首，也可以放在句中，意思相同。",
          "放在句首時，兩部分中間加逗號。放在句中時，通常不加逗號。",
          "不論放哪裡，時態的規則都一樣。",
        ],
        examples: [
          { en: "If you practise, you will improve.", zh: "If 在句首，中間有逗號。" },
          { en: "You will improve if you practise.", zh: "If 在句中，意思相同。" },
        ],
        watch: ["不要因為 if 搬了位置，就在 if 後面加上 will。"],
      },
      {
        id: "choose",
        type: "zero",
        title: "怎樣選擇",
        en: "Which one?",
        lines: [
          "先問：這件事是事實、有可能發生，還是想像？",
          "事實、習慣或建議 → 零條件句。",
          "將來有可能 → 第一條件句。",
          "現在不真實或很不可能 → 第二條件句。",
        ],
        examples: [
          { en: "If you mix red and blue, you get purple.", zh: "事實：零條件句。" },
          { en: "If it rains tomorrow, we will stay in.", zh: "有可能：第一條件句。" },
          { en: "If I were a bird, I would fly.", zh: "想像：第二條件句。" },
        ],
        watch: [
          "if 後面加了 will，通常要改成現在式。",
          "想像句卻用 will，通常要改成 would。",
          "第二條件句的 be，用 were，不用 was 或 am。",
        ],
      },
    ],
  };
});
