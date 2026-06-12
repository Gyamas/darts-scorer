import { C } from "./theme.js";


// ---------- player data screen ----------
export function flightOf(rt) {
  if (rt == null) return null;
  if (rt < 4) return "C";
  if (rt < 6) return "CC";
  if (rt < 8) return "B";
  if (rt < 10) return "BB";
  if (rt < 12) return "A";
  if (rt < 14) return "AA";
  return "SA";
}


// ---------- profiles, rating & storage ----------
export const AVATAR_EMOJIS = ["🎯", "🐼", "🦊", "🐯", "🦁", "🐸", "🐙", "🦄", "🤖", "😎", "🔥", "⚡", "🌙", "🍀", "💀", "👑", "🌸", "⭐", "🍣", "🎱"];

export const AVATAR_COLORS = ["#D3433B", "#2B50C9", "#2FA56C", "#C9A035", "#8B5CF6", "#E0568C", "#2BA8A0", "#5A6270"];


// 1モード分の空スタッツ(ソフト/ハードでそれぞれ持つ)
export const EMPTY_MODE_STATS = () => ({
  s01: { rounds: 0, points: 0, darts: 0, r80: 0, p80: 0, coAtt: 0, coHit: 0, t60: 0, t100: 0, t140: 0, t180: 0, p9: 0, d9: 0, r9: 0, hiCo: 0 },
  cr: { rounds: 0, marks: 0, r80: 0, m80: 0, m9: 0, r9: 0 },
  cu: { rounds: 0, points: 0, best: 0 },
  pr: { atcBest: 0, bobBest: 0, p121Best: 0, crcuBest: 0, halfBest: 0, shootBest: 0 }, // 練習レコード(atcBestは最少投数)
  games: 0,
  wins: 0,
});

export const EMPTY_STATS = () => ({ soft: EMPTY_MODE_STATS(), hard: EMPTY_MODE_STATS() });


// 表示・計上対象のモード("soft" | "hard")。Appが現在モードと同期する
export let STATS_MODE = "soft";

export function setStatsMode(m) {
  STATS_MODE = m;
}


// 旧データ移行: 80%フィールド近似初期化
export function ensure80(branch) {
  if (branch.s01.r80 == null) {
    branch.s01.r80 = branch.s01.rounds;
    branch.s01.p80 = branch.s01.points;
  }
  if (branch.cr.r80 == null) {
    branch.cr.r80 = branch.cr.rounds;
    branch.cr.m80 = branch.cr.marks;
  }
  if (branch.s01.coAtt == null) {
    branch.s01.coAtt = 0;
    branch.s01.coHit = 0;
  }
  if (branch.s01.t100 == null) {
    branch.s01.t60 = 0;
    branch.s01.t100 = 0;
    branch.s01.t140 = 0;
    branch.s01.t180 = 0;
    branch.s01.p9 = 0;
    branch.s01.d9 = 0;
    branch.s01.r9 = 0;
    branch.s01.hiCo = 0;
  }
  if (branch.cr.m9 == null) {
    branch.cr.m9 = 0;
    branch.cr.r9 = 0;
  }
  if (!branch.pr) branch.pr = { atcBest: 0, bobBest: 0, p121Best: 0, crcuBest: 0, halfBest: 0 };
  if (branch.pr.crcuBest == null) {
    branch.pr.crcuBest = 0;
    branch.pr.halfBest = 0;
  }
  if (branch.pr.shootBest == null) branch.pr.shootBest = 0;
  return branch;
}

// 旧フラット形式 → soft実績として移行(モード別記録が無かった時代のデータ)
export function ensureModes(stats) {
  if (!stats.soft) {
    const flat = { s01: stats.s01, cr: stats.cr, cu: stats.cu || { rounds: 0, points: 0, best: 0 }, games: stats.games || 0, wins: stats.wins || 0 };
    delete stats.s01;
    delete stats.cr;
    delete stats.cu;
    delete stats.games;
    delete stats.wins;
    stats.soft = flat;
    stats.hard = EMPTY_MODE_STATS();
  }
  ensure80(stats.soft);
  ensure80(stats.hard);
  return stats;
}

// 現在のモードのスタッツ枝を取得(全アクセサの共通入口)
export function statsFor(prof) {
  ensureModes(prof.stats);
  return prof.stats[STATS_MODE === "hard" ? "hard" : "soft"];
}

// 指定モードとしてfnを実行(二刀流カードなど、両モードの値を同時に出すとき用)
export function withStatsMode(m, fn) {
  const prev = STATS_MODE;
  STATS_MODE = m;
  const r = fn();
  STATS_MODE = prev;
  return r;
}

// ハード用: スリーダーツアベレージ(100%、上がりまで込み)
export function hardAvg(branch) {
  return branch.s01.darts ? (branch.s01.points / branch.s01.darts) * 3 : null;
}

export async function loadProfiles() {
  try {
    const r = await window.storage.get("profiles");
    return r ? JSON.parse(r.value) : [];
  } catch (e) {
    return []; // 初回はキーが無いのでエラー → 空でOK
  }
}
export async function loadSettings() {
  try {
    const r = await window.storage.get("settings");
    return r ? JSON.parse(r.value) : {};
  } catch (e) {
    return {};
  }
}
export async function saveSettings(obj) {
  try {
    await window.storage.set("settings", JSON.stringify(obj));
  } catch (e) {}
}
export async function saveProfiles(list) {
  try {
    await window.storage.set("profiles", JSON.stringify(list));
  } catch (e) {
    console.error("profile save failed", e);
  }
}


// レーティング表示方式: "dl"(ダーツライブ風) | "px"(フェニックス風)。表示のみで保存データは共通
export let RATING_MODE = "dl";

export function setRatingModeGlobal(m) {
  RATING_MODE = m;
}


// PHOENIX換算表(公開されている基準値): index i = Rt(i+1) の下限
export const PX_01 = [0, 10.65, 11.9, 13.15, 14.4, 15.65, 16.9, 18.15, 19.45, 20.75, 22.05, 23.35, 24.65, 25.95, 27.3, 28.65, 30.0, 31.35, 32.7, 34.05, 35.4, 36.8, 38.2, 39.6, 41.0, 42.4, 43.8, 45.2, 46.6, 48.0]; // PPD

export const PX_CR = [0, 1.1, 1.2, 1.31, 1.46, 1.61, 1.76, 1.91, 2.06, 2.21, 2.36, 2.51, 2.66, 2.81, 2.96, 3.11, 3.26, 3.41, 3.56, 3.71, 3.86, 4.07, 4.28, 4.49, 4.7, 4.96, 5.22, 5.48, 5.74, 6.0]; // MPR


export function pxRtFrom(val, bounds) {
  for (let i = bounds.length - 1; i >= 0; i--) if (val >= bounds[i]) return i + 1;
  return 1;
}

export function pxClass(rt) {
  if (rt <= 1) return "N";
  if (rt <= 3) return "C";
  if (rt <= 5) return "CC";
  if (rt <= 7) return "CCC";
  if (rt <= 9) return "B";
  if (rt <= 11) return "BB";
  if (rt <= 13) return "BBB";
  if (rt <= 16) return "A";
  if (rt <= 20) return "AA";
  if (rt <= 24) return "AAA";
  if (rt <= 27) return "MASTER";
  return "GRANDMASTER";
}

export const dartsOf = (x) => (x.darts ? x.darts : x.rounds * 3); // 旧データはラウンド×3で近似


export const clampRt = (v) => Math.max(1, Math.min(18, v));

// ダーツライブ風の目安レーティング(公開されている対応表ベースの近似値)
export const rtFrom01 = (ppr) => clampRt((ppr - 30) / 5);

export const rtFromCr = (mpr) => clampRt((mpr - 0.9) / 0.2);


export function profileRating(prof) {
  const s = statsFor(prof);
  // DL方式は80%スタッツ(確定時点まで)で算出
  const ppr = s.s01.r80 >= 3 ? s.s01.p80 / s.s01.r80 : null;
  const mpr = s.cr.r80 >= 3 ? s.cr.m80 / s.cr.r80 : null;
  const r1 = ppr != null ? rtFrom01(ppr) : null;
  const r2 = mpr != null ? rtFromCr(mpr) : null;
  if (r1 != null && r2 != null) return (r1 + r2) / 2;
  return r1 != null ? r1 : r2;
}

// PHOENIX方式: PPD/MPRから整数Rt(1-30)。両方あれば平均を四捨五入
export function profileRatingPx(prof) {
  const s = statsFor(prof);
  const ppd = s.s01.rounds >= 3 ? s.s01.points / dartsOf(s.s01) : null;
  const mpr = s.cr.rounds >= 3 ? s.cr.marks / s.cr.rounds : null;
  const r1 = ppd != null ? pxRtFrom(ppd, PX_01) : null;
  const r2 = mpr != null ? pxRtFrom(mpr, PX_CR) : null;
  if (r1 == null && r2 == null) return null;
  const rt = Math.round(r1 != null && r2 != null ? (r1 + r2) / 2 : r1 != null ? r1 : r2);
  return { rt, cls: pxClass(rt), rt01: r1, rtCr: r2 };
}


// 選択中の方式での表示文字列
export const fmtRt = (prof) => {
  if (STATS_MODE === "hard") {
    const a = hardAvg(statsFor(prof));
    return a == null ? "-" : a.toFixed(1);
  }
  if (RATING_MODE === "px") {
    const r = profileRatingPx(prof);
    return r == null ? "-" : String(r.rt);
  }
  const r = profileRating(prof);
  return r == null ? "-" : r.toFixed(2);
};

// {text, badge} 形式で値+クラス/フライトを返す
export function ratingDisplay(prof) {
  if (STATS_MODE === "hard") {
    const a = hardAvg(statsFor(prof));
    return { text: a == null ? "-" : a.toFixed(1), badge: null, label: "AVG" };
  }
  if (RATING_MODE === "px") {
    const r = profileRatingPx(prof);
    return r == null ? { text: "-", badge: null, label: "RT" } : { text: String(r.rt), badge: r.cls, label: "RT" };
  }
  const r = profileRating(prof);
  return r == null ? { text: "-", badge: null, label: "RT" } : { text: r.toFixed(2), badge: flightOf(r), label: "RT" };
}

export const fmtPpd = (prof) => {
  const s = statsFor(prof);
  return s.s01.rounds ? (s.s01.points / dartsOf(s.s01)).toFixed(2) : "-";
};

export const fmt01 = (prof) => {
  const s = statsFor(prof);
  if (RATING_MODE === "px") return s.s01.rounds ? (s.s01.points / dartsOf(s.s01)).toFixed(2) : "-"; // PPD(100%)
  return s.s01.r80 ? (s.s01.p80 / s.s01.r80).toFixed(1) : "-"; // PPR(80%)
};

export const fmtCr = (prof) => {
  const s = statsFor(prof);
  if (RATING_MODE === "px") return s.cr.rounds ? (s.cr.marks / s.cr.rounds).toFixed(2) : "-"; // MPR(100%)
  return s.cr.r80 ? (s.cr.m80 / s.cr.r80).toFixed(2) : "-"; // MPR(80%)
};
