import { C } from "../theme.js";


export function dartLabel(num, mult, fatBull) {
  if (num === 0) return "MISS";
  if (num === "B") return fatBull ? "BULL" : mult >= 2 ? "D-BULL" : "BULL";
  return (mult === 3 ? "T" : mult === 2 ? "D" : "") + num;
}


export function dartValue(num, mult, fatBull) {
  if (num === 0) return 0;
  if (num === "B") return fatBull || mult >= 2 ? 50 : 25;
  return num * mult;
}


export function isFatBull(g) {
  // セパブルOFFならブルは常に50点(01・カウントアップ)。クリケットはマーク制なので対象外
  return g.kind !== "cricket" && !g.sepaBull;
}


// ---------- tappable dartboard ----------
export const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];


// テンキー入力時にダーツを置く代表座標(セグメント内のそれっぽい位置+ジッター)
export function segmentPoint(num, mult) {
  if (num === 0) return null; // MISSは刺さらない
  if (num === "B") {
    const a = Math.random() * Math.PI * 2;
    const r = mult >= 2 ? Math.random() * 11 : 21 + Math.random() * 9;
    return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
  }
  const k = BOARD_ORDER.indexOf(num);
  if (k < 0) return null;
  const a = ((-90 + k * 18 + (Math.random() * 10 - 5)) * Math.PI) / 180;
  const r = mult === 3 ? 105 + Math.random() * 10 : mult === 2 ? 151 + Math.random() * 13 : 122 + Math.random() * 20;
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
}


// ---------- ROBO RIVAL: 着弾シミュレーションAI ----------
// 着弾点(x,y)→セグメント変換(DartBoardのRと完全一致させること)
export function pointToSegment(x, y) {
  const dx = x - 200, dy = y - 200;
  const r = Math.hypot(dx, dy);
  if (r <= 17) return { num: "B", mult: 2 };
  if (r <= 34) return { num: "B", mult: 1 };
  if (r > 170) return { num: 0, mult: 1 };
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const idx = Math.round((deg + 90) / 18);
  const num = BOARD_ORDER[((idx % 20) + 20) % 20];
  const mult = r >= 98 && r <= 120 ? 3 : r >= 146 ? 2 : 1;
  return { num, mult };
}


// 狙い点(セグメント中心)
export function segAim(num, mult) {
  if (num === "B") return { x: 200, y: 200 };
  const k = BOARD_ORDER.indexOf(num);
  const a = ((-90 + k * 18) * Math.PI) / 180;
  const r = mult === 3 ? 109 : mult === 2 ? 158 : 132;
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
}


export function boardPalette(mode) {
  if (mode === "soft") {
    // ソフトボード(DARTSLIVE Home系): 黒列=赤リング, 白列=青リング, 赤ブル, 青フレーム
    return {
      singleDark: "#1F2126",
      singleLight: "#EDE6D2",
      ringOnDark: "#C8434A",
      ringOnLight: "#2B50C9",
      bullOuter: "#C8434A",
      bullInner: "#1A1C20",
      frame: "#2B50C9",
    };
  }
  // スティールボード: 黒列=赤リング, クリーム列=緑リング, 緑/赤ブル
  return {
    singleDark: "#23262C",
    singleLight: C.cream,
    ringOnDark: C.red,
    ringOnLight: C.green,
    bullOuter: C.green,
    bullInner: C.red,
    frame: null,
  };
}


export function sectorPath(cx, cy, r0, r1, a0, a1) {
  const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${pt(r1, a0)} A ${r1} ${r1} 0 0 1 ${pt(r1, a1)} L ${pt(r0, a1)} A ${r0} ${r0} 0 0 0 ${pt(r0, a0)} Z`;
}


export function isCricketTarget(num) {
  return num === "B" || (num >= 15 && num <= 20);
}


// 全プレイヤー(チーム)が3マーク埋めて得点が入らなくなったエリア
export function isDeadNumber(g, num) {
  return g.kind === "cricket" && isCricketTarget(num) && g.marks.every((m) => m[num] === 3);
}
