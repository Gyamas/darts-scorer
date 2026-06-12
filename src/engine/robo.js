import { CRICKET_NUMS } from "../constants.js";
import { isDeadNumber, isFatBull, pointToSegment, segAim } from "./board.js";
import { PX_01, PX_CR, RATING_MODE, STATS_MODE, pxClass, pxRtFrom } from "../profiles.js";


export function gauss2() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  const m = Math.sqrt(-2 * Math.log(u));
  return [m * Math.cos(2 * Math.PI * v), m * Math.sin(2 * Math.PI * v)];
}


// モンテカルロ校正済みσ(Lv n = Rt 2n相当: 01=30+10n / MPR=0.9+0.4n)
export const ROBO_SIGMA01 = [0, 68.6, 39.8, 27.3, 21.9, 18.7, 16.5, 14.6, 13.2, 11.9]; // [lv]

export const ROBO_SIGMA_CR = [0, 61.6, 45.3, 34.7, 28.3, 23.7, 20.9, 18.8, 17.0, 15.6]; // 流れ弾マーク込みで校正

export const ROBO_SIGMA_BULL = [0, 106.1, 81.3, 54.1, 40.0, 33.5, 29.2, 25.9, 23.1, 20.5]; // ファットブル時のブル狙いで校正

export const roboSpec01 = (lv) => 30 + 10 * lv;

export const roboSpecMpr = (lv) => 0.9 + 0.4 * lv;

// 表示方式に応じたロボのRt表記
export function roboRtText(lv) {
  if (STATS_MODE === "hard") return `AVG ${roboSpec01(lv).toFixed(0)} 相当`;
  if (RATING_MODE === "px") {
    const r = Math.round((pxRtFrom(roboSpec01(lv) / 3, PX_01) + pxRtFrom(roboSpecMpr(lv), PX_CR)) / 2);
    return `PX Rt ${r}(${pxClass(r)})相当`;
  }
  return `Rt ${2 * lv} 相当`;
}

export function roboStatText(lv) {
  if (RATING_MODE === "px") return `PPD: ${(roboSpec01(lv) / 3).toFixed(1)} / MPR: ${roboSpecMpr(lv).toFixed(1)}`;
  return `01: ${roboSpec01(lv).toFixed(0)} / MPR: ${roboSpecMpr(lv).toFixed(1)}`;
}


// ロボの狙い決定(状況判断)
export function roboAim(g) {
  const i = g.robo.idx;
  if (g.kind === "countup") return isFatBull(g) ? segAim("B", 2) : segAim(20, 3); // セオリー: 50点ブルならブル直行
  if (g.kind === "cricket") {
    // 自陣未クローズの最上位 → なければ得点源(生きている自陣)
    for (const n of CRICKET_NUMS) {
      if (isDeadNumber(g, n)) continue;
      if (g.marks[i][n] < 3) return n === "B" ? segAim("B", 2) : segAim(n, 3);
    }
    for (const n of CRICKET_NUMS) {
      if (!isDeadNumber(g, n) && g.marks[i][n] === 3) return n === "B" ? segAim("B", 2) : segAim(n, 3);
    }
    return segAim("B", 2);
  }
  // 01
  if (g.inRule === "double" && g.opened && !g.opened[i]) return segAim(20, 2);
  const s = g.scores[i];
  const fat = isFatBull(g);
  if (g.outRule === "open") {
    if (s > 60) return fat ? segAim("B", 2) : segAim(20, 3); // ファットブルはブル直行がセオリー
    if (s === 50) return segAim("B", 2);
    if (fat && s > 50) return segAim("B", 2); // 51-60: ブルで残り1桁に
    if (s <= 20) return segAim(s, 1);
    if (s === 25 && !fat) return segAim("B", 1);
    if (s <= 40 && s % 2 === 0) return segAim(s / 2, 2);
    if (s <= 40) return segAim(s - 20, 1);
    return segAim(s - 40, 1); // 41-60 → 残り40に
  }
  // ダブル/マスターアウト
  if (s === 50) return segAim("B", 2);
  if (s <= 40 && s % 2 === 0 && s >= 2) return segAim(s / 2, 2);
  if (s > 60) return fat ? segAim("B", 2) : segAim(20, 3); // ファットブルはD扱いなのでブル削りOK
  const cand = [s - 32, s - 40, s - 20].find((v) => v >= 1 && v <= 20);
  return segAim(cand || 1, 1);
}


// 1投シミュレーション: 狙い + 正規分布ノイズ → 着弾セグメント
export function roboThrow(g) {
  const lv = g.robo.lv;
  const sigma = g.kind === "cricket" ? ROBO_SIGMA_CR[lv] : isFatBull(g) ? ROBO_SIGMA_BULL[lv] : ROBO_SIGMA01[lv];
  const aim = roboAim(g);
  const [gx, gy] = gauss2();
  let x = aim.x + gx * sigma;
  let y = aim.y + gy * sigma;
  // 大外しでも盤外すぐ近くに刺さる(viewBox内にクランプ)
  const r = Math.hypot(x - 200, y - 200);
  if (r > 192) {
    x = 200 + ((x - 200) * 192) / r;
    y = 200 + ((y - 200) * 192) / r;
  }
  const seg = pointToSegment(x, y);
  return { num: seg.num, mult: seg.mult, pt: { x, y } };
}
