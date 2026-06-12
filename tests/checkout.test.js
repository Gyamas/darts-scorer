import { describe, it, expect } from "vitest";
import { CHECKOUT_CHART, checkoutRoute, twoDartOut } from "../src/engine/checkout.js";

const val = (d) => (d === "BULL" ? 50 : d === "25" ? 25 : d[0] === "T" ? +d.slice(1) * 3 : d[0] === "D" ? +d.slice(1) * 2 : +d);
const isFinish = (d) => d === "BULL" || d[0] === "D";

describe("チェックアウト定石チャート", () => {
  it("全エントリ: 合計一致・最終投がダブル/ブル・3投以内", () => {
    for (const [score, str] of Object.entries(CHECKOUT_CHART)) {
      const r = str.split(" ");
      expect(r.reduce((a, d) => a + val(d), 0)).toBe(+score);
      expect(isFinish(r[r.length - 1])).toBe(true);
      expect(r.length).toBeLessThanOrEqual(3);
    }
  });
  it("ボギーナンバーは3投でも上がれない", () => {
    for (const b of [169, 168, 166, 165, 163, 162, 159]) expect(checkoutRoute(b, 3, false)).toBeNull();
  });
  it("継続性: 提案通りに投げ続けても提案が変わらない", () => {
    for (const score of Object.keys(CHECKOUT_CHART).map(Number)) {
      let s = score, left = 3;
      let route = checkoutRoute(s, left, false);
      if (!route) continue;
      while (route.length > 1) {
        s -= val(route[0]);
        left -= 1;
        const next = checkoutRoute(s, left, false);
        expect(next, `score ${score} → 残り${s}`).toEqual(route.slice(1));
        route = next;
      }
    }
  });
  it("持ちダーツ数に応じたルート", () => {
    expect(checkoutRoute(170, 3, false)).toEqual(["T20", "T20", "BULL"]);
    expect(checkoutRoute(170, 2, false)).toBeNull();
    expect(checkoutRoute(100, 2, false)).toEqual(["T20", "D20"]);
    expect(checkoutRoute(50, 1, false)).toEqual(["BULL"]);
    expect(checkoutRoute(39, 1, false)).toBeNull();
  });
  it("ファットブル時は25を含む定石を回避", () => {
    const r = checkoutRoute(125, 3, true);
    expect(r).not.toContain("25");
    expect(r.reduce((a, d) => a + val(d), 0)).toBe(125);
  });
  it("2投ルートの健全性(2-110)", () => {
    for (let s = 2; s <= 110; s++) {
      const r = twoDartOut(s, false);
      if (!r) continue;
      expect(r.reduce((a, d) => a + val(d), 0)).toBe(s);
      expect(isFinish(r[r.length - 1])).toBe(true);
      expect(r.length).toBeLessThanOrEqual(2);
    }
  });
});
