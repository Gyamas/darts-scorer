import { describe, it, expect } from "vitest";
import { newGame, applyDart, endTurn, detectAward } from "../src/engine/game.js";
import { medleySeq } from "../src/constants.js";

const cfg = (over = {}) => ({ type: "701", names: ["A"], mode: "hard", outRule: "open", inRule: "open", sepaBull: true, ...over });
const turn = (g, a, b, c) => {
  g = applyDart(g, ...a); g = applyDart(g, ...b); g = applyDart(g, ...c);
  return g.finished ? g : endTurn(g);
};

describe("01エンジン: トン帯・ファースト9・チェックアウト点", () => {
  it("ターン得点帯カウント(排他)とF9", () => {
    let g = newGame(cfg());
    g = turn(g, [20, 3], [20, 3], [20, 3]); // 180
    g = turn(g, [20, 3], [20, 3], [20, 1]); // 140
    g = turn(g, [20, 3], [20, 1], [20, 1]); // 100
    g = turn(g, [20, 1], [20, 1], [20, 1]); // 60
    const st = g.pstats[0];
    expect([st.t180, st.t140, st.t100, st.t60]).toEqual([1, 1, 1, 1]);
    expect(st.p9).toBe(420);
    expect(st.d9).toBe(9);
  });
  it("チェックアウト点=上がりターン開始の残り", () => {
    let g = newGame(cfg({ type: "301", outRule: "double" }));
    g.scores[0] = 121; g.turnStart = 121;
    g = applyDart(g, 20, 3); g = applyDart(g, 15, 3); g = applyDart(g, 8, 2);
    expect(g.finished).toBe(true);
    expect(g.pstats[0].co).toBe(121);
  });
  it("ハードのアワード: 180/TON40/TON、95は無し", () => {
    const mk = (darts) => {
      let g = newGame(cfg());
      for (const [n, m] of darts) g = applyDart(g, n, m);
      return detectAward(g);
    };
    expect(mk([[20, 3], [20, 3], [20, 3]]).tier).toBe("oneighty");
    expect(mk([[20, 3], [20, 3], [20, 1]]).name).toBe("TON 40");
    expect(mk([[20, 3], [15, 3], [0, 1]]).name).toBe("TON");
    expect(mk([[19, 3], [19, 1], [19, 1]])).toBeNull();
  });
});

describe("マッチ構成", () => {
  it("ソフトはメドレー、ハードは同一01連戦", () => {
    expect(medleySeq(5, "701", "soft")).toEqual(["701", "cricket", "701", "cricket", "choice"]);
    expect(medleySeq(5, "501", "hard")).toEqual(["501", "501", "501", "501", "501"]);
  });
});
