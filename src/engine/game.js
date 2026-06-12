import { CRCU_SEQ, CRICKET_NUMS, GAMES, HALFIT_SEQ, P121_CHALLENGES, deep, roundLimitOf } from "../constants.js";
import { dartLabel, dartValue, isFatBull, segmentPoint } from "./board.js";


// ---------- game logic ----------
export function newGame(cfg) {
  // cfg: { type, names, mode, outRule, inRule, sepaBull, teamCricket }
  const kind = GAMES[cfg.type].kind;
  const start = kind === "01" ? parseInt(cfg.type, 10) : kind === "p121" ? 121 : kind === "bob" ? 27 : kind === "halfit" ? 40 : 0;
  const team = !!cfg.teamCricket && kind === "cricket";
  const slots = team ? [0, 1] : cfg.names; // チーム戦はスコア・マークをチーム単位で持つ
  return {
    type: cfg.type,
    kind,
    mode: cfg.mode, // "soft" | "hard"
    teamCricket: team,
    outRule: cfg.outRule, // "open" | "master" | "double"
    inRule: cfg.inRule || "open", // "open" | "double"
    sepaBull: !!cfg.sepaBull, // true: 25/50セパレートブル, false: 50点統一
    roundLimit: roundLimitOf(kind, cfg.type, cfg.mode, team), // 0 = 無制限
    gid: Date.now(), // スタッツ保存の重複防止用ID
    robo: cfg.robo || null, // ROBO RIVAL設定 {lv, idx}
    profileIds: cfg.profileIds || cfg.names.map(() => null),
    avatars: cfg.avatars || cfg.names.map(() => null),
    // rounds/points/darts/marks = 100%スタッツ(PHOENIX用)、r80/p80/m80 = 80%スタッツ(DL用)
    // coAtt/coHit = チェックアウト率(上がれる状態で投げた数/上がった数、D・Mアウトのみ)
    // t60-t180=ターン得点帯カウント、p9/d9/m9/r9=ファースト9、co=チェックアウト点(上がりターンの開始残り)
    pstats: cfg.names.map(() => ({ rounds: 0, points: 0, marks: 0, darts: 0, r80: 0, p80: 0, m80: 0, locked: false, coAtt: 0, coHit: 0, t60: 0, t100: 0, t140: 0, t180: 0, p9: 0, d9: 0, m9: 0, r9: 0, co: 0 })),
    turnMarks: 0,
    players: cfg.names,
    opened: cfg.names.map(() => (cfg.inRule || "open") !== "double"), // ダブルイン用
    scores: slots.map(() => start),
    marks: slots.map(() => ({ 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, B: 0 })),
    current: 0,
    round: 1,
    darts: [],
    turnStart: kind === "p121" ? 121 : start,
    bust: false,
    finished: false,
    winners: [],
    // --- 練習ゲーム用ステート ---
    atc: kind === "atc" ? cfg.names.map(() => 1) : null, // 現在のターゲット(1-20, 21=BULL, 22=完走)
    bobT: kind === "bob" ? cfg.names.map(() => 1) : null, // 現在のダブルターゲット(1-20, 21=D-BULL)
    bobOut: kind === "bob" ? cfg.names.map(() => false) : null, // バースト脱落
    p121T: kind === "p121" ? cfg.names.map(() => 121) : null, // 現在の挑戦ターゲット
    p121Best: kind === "p121" ? cfg.names.map(() => 0) : null, // クリアした最高値
    p121Turn: kind === "p121" ? cfg.names.map(() => 0) : null, // 挑戦内のターン数(0-2)
    p121N: kind === "p121" ? cfg.names.map(() => 0) : null, // 消化した挑戦数
    succ: false, // p121: このターンでチェックアウト成功
    halfHit: false, // halfit: このターンでターゲットに当てたか
    shootOpen: kind === "shoot" ? cfg.names.map(() => []) : null, // シュートアウト: 開いたエリア(プレイヤー別)
    crcuMarks: kind === "crcu" ? cfg.names.map(() => 0) : null, // クリカン: MPR計測用マーク数
  };
}


// 1ラウンド分のスタッツをプレイヤーに計上(ターン終了・上がり時)
// 「この残り点から1投で上がれるか」(D=ダブル系のみ / M=+トリプル・アウターブル)
export function checkoutReady(s, outRule, fat) {
  if (outRule === "open") return false;
  const dbl = s === 50 || (s >= 2 && s <= 40 && s % 2 === 0);
  if (outRule === "double") return dbl;
  return dbl || (s >= 3 && s <= 60 && s % 3 === 0) || (!fat && s === 25); // master
}


export function commitTurn(g) {
  const p = g.current;
  const st = g.pstats[p];
  st.rounds += 1;
  st.darts += g.darts.length; // PPD(フェニックス)用の実投数
  if (g.kind === "01") {
    const scored = Math.max(0, g.turnStart - g.scores[p]);
    st.points += scored;
    if (scored >= 180) st.t180 += 1;
    else if (scored >= 140) st.t140 += 1;
    else if (scored >= 100) st.t100 += 1;
    else if (scored >= 60) st.t60 += 1;
    if (st.rounds <= 3) {
      st.p9 += scored;
      st.d9 += g.darts.length;
      st.r9 += 1;
    }
    // DL 80%スタッツ: 残りが開始点の20%以下になったラウンドまでで確定(701→140, 501→100, 301→60)
    if (!st.locked) {
      st.r80 += 1;
      st.p80 += scored;
      if (g.scores[p] <= parseInt(g.type, 10) * 0.2) st.locked = true;
    }
  } else if (g.kind === "countup") {
    st.points += Math.max(0, g.scores[p] - g.turnStart);
  } else if (g.kind === "cricket") {
    st.marks += g.turnMarks;
    if (st.rounds <= 3) {
      st.m9 += g.turnMarks;
      st.r9 += 1;
    }
    // DL 80%スタッツ: 自分が7エリア中6つオープンした時点で確定
    if (!st.locked) {
      st.r80 += 1;
      st.m80 += g.turnMarks;
      const t = g.teamCricket ? p % 2 : p;
      const opened = CRICKET_NUMS.filter((n) => g.marks[t][n] === 3).length;
      if (opened >= 6) st.locked = true;
    }
  }
  g.turnMarks = 0;
}


export function maxOther(arr, idx) {
  return Math.max(...arr.filter((_, i) => i !== idx), 0);
}



export function applyDart(g0, num, mult, pt) {
  const g = deep(g0);
  const p = g.current;
  const fat = isFatBull(g);
  const label = dartLabel(num, mult, fat);
  const value = dartValue(num, mult, fat);
  const pos = pt || segmentPoint(num, mult); // タップ座標 or テンキー入力時の代表点
  g.darts.push({ num, mult, label, value, x: pos ? +pos.x.toFixed(1) : null, y: pos ? +pos.y.toFixed(1) : null });

  if (g.kind === "crcu") {
    // クリカン: ラウンドターゲット(20→…→15→ブル)に刺さった点数を加算(T20=60点)。MPRも計測
    const t = CRCU_SEQ[Math.min(g.round, CRCU_SEQ.length) - 1];
    if (t === "B" ? num === "B" : num === t) {
      // ブルはクリケット文化に合わせセパ扱い(アウター25/インナー50)
      g.scores[p] += num === "B" ? (mult >= 2 ? 50 : 25) : value;
      g.crcuMarks[p] += num === "B" ? Math.min(mult, 2) : mult;
    }
  } else if (g.kind === "shoot") {
    // シュートアウト(DL公式): 「ヒットした点数」×「開いたエリア数」。一度開けたエリアは無効
    // ブルは外25/内50のセパ扱い。全21エリア開拓後はブルが復活し、毎投×21のBULLチャレンジ
    const sv = num === "B" ? (mult >= 2 ? 50 : 25) : value;
    if (g.shootOpen[p].length >= 21) {
      if (num === "B") g.scores[p] += sv * 21; // ボーナス: 何度でも×21
    } else {
      const key = num === "B" ? "B" : num;
      if (num !== 0 && !g.shootOpen[p].includes(key)) {
        g.shootOpen[p].push(key);
        g.scores[p] += sv * g.shootOpen[p].length; // 倍率=開いたエリア数(今回含む)
      }
    }
  } else if (g.kind === "halfit") {
    // ハーフイット: ラウンドのターゲットに当てた分だけ加点
    const t = HALFIT_SEQ[g.round - 1];
    let gain = 0;
    if (t === "D") gain = mult === 2 || (num === "B" && mult >= 2) ? value : 0;
    else if (t === "T") gain = mult === 3 ? value : 0;
    else if (t === "B") gain = num === "B" ? value : 0;
    else gain = num === t ? value : 0;
    g.scores[p] += gain;
    if (gain > 0) g.halfHit = true;
  } else if (g.kind === "atc") {
    // アラウンド・ザ・クロック: ターゲットに当てたら進む(D=2つ、T=3つ進む)。21=BULL
    const t = g.atc[p];
    if (t <= 20) {
      if (num === t) g.atc[p] = Math.min(21, t + mult);
    } else if (num === "B") {
      g.atc[p] = 22; // 完走!
      g.finished = true;
      g.winners = [p];
      commitTurn(g);
    }
  } else if (g.kind === "bob") {
    // Bob's 27: ダーツは記録のみ。判定はターン終了時(endTurn)に行う
  } else if (g.kind === "p121") {
    // 121: ダブルアウトのミニ01。targetからの上がりに成功でsucc
    if (checkoutReady(g.scores[p], "double", fat)) g.pstats[p].coAtt += 1;
    const next = g.scores[p] - value;
    const isDouble = mult === 2 || (num === "B" && (mult >= 2 || !g.sepaBull));
    if (next === 0 && isDouble) {
      g.scores[p] = 0;
      g.succ = true; // 挑戦成功(ターン強制終了、処理はendTurnで)
      g.pstats[p].coHit += 1;
    } else if (next < 0 || next === 1 || next === 0) {
      g.scores[p] = g.turnStart;
      g.bust = true;
    } else {
      g.scores[p] = next;
    }
  } else if (g.kind === "countup") {
    g.scores[p] += value;
  } else if (g.kind === "01") {
    const isDouble = mult === 2 || (num === "B" && (mult >= 2 || !g.sepaBull));
    if (!g.opened[p]) {
      if (isDouble) g.opened[p] = true;
      else return g; // ダブルイン待ち: ダブルに入れるまで得点しない
    }
    // チェックアウト試投: 上がれる残り点で投げたダーツをカウント(オープンアウトは対象外)
    if (checkoutReady(g.scores[p], g.outRule, fat)) g.pstats[p].coAtt += 1;
    const next = g.scores[p] - value;
    const isMaster = mult >= 2 || num === "B"; // ダブル・トリプル・ブル
    const winOk =
      g.outRule === "open" ? true : g.outRule === "double" ? isDouble : isMaster;
    const bust = next < 0 || (g.outRule !== "open" && next === 1);
    const win = next === 0 && winOk;
    if (next === 0 && !win) {
      g.scores[p] = g.turnStart;
      g.bust = true;
    } else if (bust) {
      g.scores[p] = g.turnStart;
      g.bust = true;
    } else {
      g.scores[p] = next;
      if (win) {
        g.finished = true;
        g.winners = [p];
        g.pstats[p].coHit += g.outRule !== "open" ? 1 : 0; // チェックアウト成功
        g.pstats[p].co = g.turnStart; // チェックアウト点(上がりターン開始時の残り)
        commitTurn(g); // 上がりラウンドも統計に含める
      }
    }
  } else if (g.kind === "cricket") {
    const t = g.teamCricket ? p % 2 : p; // チーム戦: 奇数番目入力=TEAM B
    if (num === "B" || (num >= 15 && num <= 20)) {
      const hits = num === "B" ? Math.min(mult, 2) : mult;
      const cur = g.marks[t][num];
      g.marks[t][num] = Math.min(3, cur + hits);
      const overflow = Math.max(0, cur + hits - 3);
      const everyoneClosed = g.marks.every((m, i) => i === t || m[num] === 3);
      // MPR用: 盤面に乗ったマーク + 得点になったオーバーフロー分
      g.turnMarks += (Math.min(3, cur + hits) - cur) + (overflow > 0 && !everyoneClosed ? overflow : 0);
      if (overflow > 0 && !everyoneClosed) {
        g.scores[t] += overflow * (num === "B" ? 25 : num);
      }
      const allClosed = CRICKET_NUMS.every((n) => g.marks[t][n] === 3);
      if (allClosed && g.scores[t] >= maxOther(g.scores, t)) {
        g.finished = true;
        g.winners = [t];
        commitTurn(g);
      }
    }
  }
  return g;
}


// p121: そのプレイヤーが挑戦を消化し終えたか
export const p121Done = (g, i) => g.p121N[i] >= P121_CHALLENGES;


export function endTurn(g0) {
  const g = deep(g0);
  const p = g.current;
  commitTurn(g);

  if (g.kind === "bob") {
    // ターンの3投からターゲットダブルのヒット数を判定
    const t = g.bobT[p];
    const isHit = (d) => (t === 21 ? d.num === "B" && d.mult === 2 : d.num === t && d.mult === 2);
    const hits = g.darts.filter(isHit).length;
    const dv = t === 21 ? 50 : t * 2;
    if (hits > 0) g.scores[p] += hits * dv;
    else g.scores[p] -= dv;
    if (g.scores[p] < 1) {
      g.bobOut[p] = true; // バースト脱落
    } else {
      g.bobT[p] = t + 1; // 次のダブルへ(21=D-BULLの次で完走)
    }
    // 全員が完走or脱落で終了
    const done = (i) => g.bobOut[i] || g.bobT[i] > 21;
    if (g.players.every((_, i) => done(i))) {
      g.finished = true;
      const alive = g.players.map((_, i) => i).filter((i) => !g.bobOut[i]);
      const pool = alive.length ? alive : g.players.map((_, i) => i);
      const top = Math.max(...pool.map((i) => g.scores[i]));
      g.winners = pool.filter((i) => g.scores[i] === top);
    }
  }

  if (g.kind === "p121") {
    // 挑戦の進行: 成功→+1、3ターン失敗→-1(下限61)
    if (g.succ) {
      g.p121Best[p] = Math.max(g.p121Best[p], g.p121T[p]);
      g.p121N[p] += 1;
      g.p121T[p] = g.p121T[p] + 1;
      g.scores[p] = g.p121T[p];
      g.p121Turn[p] = 0;
      g.succ = false;
    } else {
      g.p121Turn[p] += 1;
      if (g.p121Turn[p] >= 3) {
        g.p121N[p] += 1;
        g.p121T[p] = Math.max(61, g.p121T[p] - 1);
        g.scores[p] = g.p121T[p];
        g.p121Turn[p] = 0;
      }
    }
    if (g.players.every((_, i) => p121Done(g, i))) {
      g.finished = true;
      const top = Math.max(...g.p121Best);
      g.winners = top > 0 ? g.p121Best.map((b, i) => (b === top ? i : -1)).filter((i) => i >= 0) : [];
    }
  }

  if (g.kind === "halfit") {
    // 3投すべて外したら半減(切り上げ)
    if (!g.halfHit) g.scores[p] = Math.ceil(g.scores[p] / 2);
    g.halfHit = false;
  }

  g.darts = [];
  g.bust = false;
  g.current = (g.current + 1) % g.players.length;
  // 練習ゲーム: 終了済み・脱落済みプレイヤーをスキップ
  if (!g.finished && (g.kind === "bob" || g.kind === "p121")) {
    let guard = 0;
    const skip = (i) => (g.kind === "bob" ? g.bobOut[i] || g.bobT[i] > 21 : p121Done(g, i));
    while (skip(g.current) && guard++ < g.players.length) g.current = (g.current + 1) % g.players.length;
  }
  if (g.current === 0) {
    g.round += 1;
    if (g.roundLimit > 0 && g.round > g.roundLimit) {
      g.finished = true;
      if (g.kind === "01") {
        // ラウンドオーバー: 残り点数が少ない方の勝ち
        const low = Math.min(...g.scores);
        g.winners = g.scores.map((s, i) => (s === low ? i : -1)).filter((i) => i >= 0);
      } else {
        const top = Math.max(...g.scores);
        g.winners = g.scores.map((s, i) => (s === top ? i : -1)).filter((i) => i >= 0);
      }
    }
  }
  if (!g.finished) g.turnStart = g.scores[g.current];
  return g;
}


// ---------- awards (evaluated after the 3rd dart of a round) ----------
export function detectAward(g) {
  const d = g.darts;
  if (d.length < 3) return null;
  const total = d.reduce((s, x) => s + x.value, 0);
  const allBull = d.every((x) => x.num === "B");
  const allInnerBull = d.every((x) => x.num === "B" && x.mult >= 2);

  if (g.kind === "cricket") {
    const triples = d.filter((x) => typeof x.num === "number" && x.num >= 15 && x.num <= 20 && x.mult === 3);
    const distinct = new Set(triples.map((x) => x.num));
    if (triples.length === 3 && distinct.size === 3)
      return { name: "WHITE HORSE", sub: "3種類のトリプル!", tier: "big" };
    if (allInnerBull) return { name: "THREE IN THE BLACK", sub: "インナーブル3連!", tier: "big" };
    if (allBull) return { name: "HAT TRICK", sub: "ブル3連発!", tier: "big" };
    const marks = d.reduce(
      (s, x) =>
        s + (x.num === "B" ? Math.min(x.mult, 2) : typeof x.num === "number" && x.num >= 15 && x.num <= 20 ? x.mult : 0),
      0
    );
    if (marks >= 9) return { name: "9 MARK", sub: "パーフェクトラウンド!", tier: "big" };
    if (marks >= 5) return { name: `${marks} MARK`, sub: "ナイスマーク!", tier: "mid" };
    return null;
  }

  // 01 / count-up
  if (g.mode === "hard") {
    // スティールのコール文化: 180は特別、以下TON 40 / TON
    if (total === 180) return { name: "ONE HUNDRED AND EIGHTY", sub: "180!!", tier: "oneighty" };
    if (total >= 140) return { name: "TON 40", sub: `${total}点!`, tier: "mid" };
    if (total >= 100) return { name: "TON", sub: `${total}点!`, tier: "mid" };
    return null;
  }
  if (total === 180) return { name: "TON 80", sub: "パーフェクト 180点!", tier: "big" };
  const sameTriple =
    typeof d[0].num === "number" && d.every((x) => x.mult === 3 && x.num === d[0].num);
  if (sameTriple) return { name: "THREE IN A BED", sub: `T${d[0].num}を3連!`, tier: "big" };
  if (allInnerBull) return { name: "THREE IN THE BLACK", sub: "インナーブル3連!", tier: "big" };
  if (allBull) return { name: "HAT TRICK", sub: "ブル3連発!", tier: "big" };
  if (total >= 151) return { name: "HIGH TON", sub: `${total}点!`, tier: "mid" };
  if (total >= 100) return { name: "LOW TON", sub: `${total}点!`, tier: "mid" };
  return null;
}
