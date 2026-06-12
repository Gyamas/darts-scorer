import { describe, it, expect } from "vitest";
import { newGame, applyDart, endTurn } from "../src/engine/game.js";
import { CRCU_SEQ } from "../src/constants.js";
import { dimPractice, dimPracticeBull } from "../src/ui/board.jsx";

const cfg = (type, over = {}) => ({ type, names: ["A"], mode: "hard", outRule: "open", inRule: "open", sepaBull: true, ...over });

describe("AROUND THE CLOCK", () => {
  it("倍率で進む・ブルで完走", () => {
    let g = newGame(cfg("atc"));
    g = applyDart(g, 1, 1);
    expect(g.atc[0]).toBe(2);
    g = applyDart(g, 2, 3);
    expect(g.atc[0]).toBe(5);
    g = applyDart(g, 9, 1); // 外れ
    expect(g.atc[0]).toBe(5);
    g = endTurn(g);
    g.atc[0] = 19;
    g = applyDart(g, 19, 3); // 21(BULL)でキャップ
    expect(g.atc[0]).toBe(21);
    g = applyDart(g, "B", 1);
    expect(g.finished).toBe(true);
    expect(g.winners).toEqual([0]);
  });
});

describe("BOB'S 27", () => {
  it("加点・全外し減点・脱落", () => {
    let g = newGame(cfg("bob", { names: ["A", "B"] }));
    expect(g.scores).toEqual([27, 27]);
    g = applyDart(g, 1, 2); g = applyDart(g, 1, 2); g = applyDart(g, 5, 1);
    g = endTurn(g);
    expect(g.scores[0]).toBe(31); // D1×2 = +4
    expect(g.bobT[0]).toBe(2);
    g = applyDart(g, 5, 1); g = applyDart(g, 0, 1); g = applyDart(g, 1, 1);
    g = endTurn(g);
    expect(g.scores[1]).toBe(25); // 全外し -2
  });
});

describe("121", () => {
  it("成功+1・3ターン失敗-1・全挑戦で終了", () => {
    let g = newGame(cfg("p121", { outRule: "double" }));
    g = applyDart(g, 20, 3); g = applyDart(g, 15, 3); g = applyDart(g, 8, 2);
    expect(g.succ).toBe(true);
    g = endTurn(g);
    expect(g.p121T[0]).toBe(122);
    expect(g.p121Best[0]).toBe(121);
    for (let t = 0; t < 3; t++) { g = applyDart(g, 1, 1); g = applyDart(g, 1, 1); g = applyDart(g, 1, 1); g = endTurn(g); }
    expect(g.p121T[0]).toBe(121);
    expect(g.p121N[0]).toBe(2);
  });
});

describe("クリカン(ラウンドターゲット・点数式・MPR)", () => {
  it("ターゲット順とセパブル点数", () => {
    expect(CRCU_SEQ).toEqual([20, 19, 18, 17, 16, 15, "B", "B"]);
    let g = newGame(cfg("crcu", { mode: "soft", sepaBull: false }));
    g = applyDart(g, 20, 3); g = applyDart(g, 20, 1); g = applyDart(g, 19, 3); // 19は無効
    expect(g.scores[0]).toBe(80);
    expect(g.crcuMarks[0]).toBe(4);
    g = endTurn(g);
    for (let r = 2; r <= 6; r++) { g = applyDart(g, 0, 1); g = applyDart(g, 0, 1); g = applyDart(g, 0, 1); g = endTurn(g); }
    g = applyDart(g, "B", 2); g = applyDart(g, "B", 1); // R7: 50+25
    expect(g.scores[0]).toBe(155);
  });
});

describe("HALF-IT", () => {
  it("加点・半減・D/Tラウンド判定", () => {
    let g = newGame(cfg("halfit", { mode: "soft", sepaBull: false }));
    expect(g.scores[0]).toBe(40);
    g = applyDart(g, 15, 1); g = applyDart(g, 20, 3); g = applyDart(g, 0, 1);
    g = endTurn(g);
    expect(g.scores[0]).toBe(55);
    g = applyDart(g, 15, 1); g = applyDart(g, 0, 1); g = applyDart(g, 20, 1);
    g = endTurn(g);
    expect(g.scores[0]).toBe(28); // ceil(55/2)
    g = applyDart(g, 5, 2); g = applyDart(g, "B", 2); g = applyDart(g, 5, 1); // Dラウンド
    g = endTurn(g);
    expect(g.scores[0]).toBe(88);
  });
});

describe("SHOOT OUT(公式: 点数×開いたエリア数)", () => {
  it("倍率進行・開拓済み無効・プレイヤー独立", () => {
    let g = newGame(cfg("shoot", { names: ["A", "B"], mode: "soft", sepaBull: false }));
    g = applyDart(g, 1, 1);
    g = applyDart(g, 1, 3); // 無効
    g = applyDart(g, 2, 1);
    expect(g.scores[0]).toBe(5); // 1×1 + 2×2
    expect(g.shootOpen[0].length).toBe(2);
    g = endTurn(g);
    g = applyDart(g, 1, 1);
    expect(g.scores[1]).toBe(1); // Bは独立
  });
  it("全21エリア開拓でブル復活(毎投×21)", () => {
    let g = newGame(cfg("shoot", { mode: "soft", sepaBull: false }));
    for (let n = 1; n <= 20; n++) {
      g = applyDart(g, n, 1);
      if (g.darts.length >= 3 && !g.finished) g = endTurn(g);
    }
    g = applyDart(g, "B", 1); // 21個目: 25×21
    const base = g.scores[0];
    expect(dimPracticeBull(g, 2)).toBe(false); // ブル復活
    expect(dimPractice(g, 20, 3)).toBe(true); // 数字は消灯
    if (g.darts.length >= 3) g = endTurn(g);
    g = applyDart(g, "B", 2);
    expect(g.scores[0]).toBe(base + 1050); // 50×21
    g = applyDart(g, 20, 3); // ボーナス中の数字は無効
    expect(g.scores[0]).toBe(base + 1050);
  });
});
