


// ---------- チェックアウト提案(定石チャート) ----------
// 標準的なアウトチャート(2-170、ボギーナンバー除く)。最後のダーツが必ずダブル/ブル
export const CHECKOUT_CHART = {
  170: "T20 T20 BULL", 167: "T20 T19 BULL", 164: "T20 T18 BULL", 161: "T20 T17 BULL",
  160: "T20 T20 D20", 158: "T20 T20 D19", 157: "T20 T19 D20", 156: "T20 T20 D18",
  155: "T20 T19 D19", 154: "T20 T18 D20", 153: "T20 T19 D18", 152: "T20 T20 D16",
  151: "T20 T17 D20", 150: "T20 T18 D18", 149: "T20 T19 D16", 148: "T20 T20 D14",
  147: "T20 T17 D18", 146: "T20 T18 D16", 145: "T20 T15 D20", 144: "T20 T20 D12",
  143: "T20 T17 D16", 142: "T20 T14 D20", 141: "T20 T19 D12", 140: "T20 T20 D10",
  139: "T19 T14 D20", 138: "T20 T18 D12", 137: "T20 T19 D10", 136: "T20 T20 D8",
  135: "T20 T17 D12", 134: "T20 T14 D16", 133: "T20 T19 D8", 132: "T20 T16 D12",
  131: "T20 T13 D16", 130: "T20 T18 D8", 129: "T19 T16 D12", 128: "T18 T14 D16",
  127: "T20 T17 D8", 126: "T19 T19 D6", 125: "25 T20 D20", 124: "T20 T16 D8",
  123: "T20 T13 D12", 122: "T18 T20 D4", 121: "T20 T15 D8", 120: "T20 20 D20",
  119: "T19 T10 D16", 118: "T20 18 D20", 117: "T20 17 D20", 116: "T20 16 D20",
  115: "T20 15 D20", 114: "T20 14 D20", 113: "T20 13 D20", 112: "T20 12 D20",
  111: "T20 11 D20", 110: "T20 BULL", 109: "T20 9 D20", 108: "T20 16 D16",
  107: "T19 BULL", 106: "T20 6 D20", 105: "T20 13 D16", 104: "T18 BULL",
  103: "T19 6 D20", 102: "T20 10 D16", 101: "T17 BULL", 100: "T20 D20",
  99: "T19 10 D16", 98: "T20 D19", 97: "T19 D20", 96: "T20 D18", 95: "T19 D19",
  94: "T18 D20", 93: "T19 D18", 92: "T20 D16", 91: "T17 D20", 90: "T18 D18",
  89: "T19 D16", 88: "T20 D14", 87: "T17 D18", 86: "T18 D16", 85: "T15 D20",
  84: "T20 D12", 83: "T17 D16", 82: "T14 D20", 81: "T19 D12", 80: "T20 D10",
  79: "T13 D20", 78: "T18 D12", 77: "T19 D10", 76: "T20 D8", 75: "T17 D12",
  74: "T14 D16", 73: "T19 D8", 72: "T16 D12", 71: "T13 D16", 70: "T18 D8",
  69: "T19 D6", 68: "T20 D4", 67: "T17 D8", 66: "T10 D18", 65: "T19 D4",
  64: "T16 D8", 63: "T13 D12", 62: "T10 D16", 61: "T15 D8", 60: "20 D20",
  59: "19 D20", 58: "18 D20", 57: "17 D20", 56: "16 D20", 55: "15 D20",
  54: "14 D20", 53: "13 D20", 52: "12 D20", 51: "11 D20", 50: "BULL",
  49: "9 D20", 48: "16 D16", 47: "15 D16", 46: "6 D20", 45: "13 D16",
  44: "12 D16", 43: "11 D16", 42: "10 D16", 41: "9 D16", 40: "D20",
  39: "7 D16", 38: "D19", 37: "5 D16", 36: "D18", 35: "3 D16", 34: "D17",
  33: "1 D16", 32: "D16", 31: "15 D8", 30: "D15", 29: "13 D8", 28: "D14",
  27: "11 D8", 26: "D13", 25: "9 D8", 24: "D12", 23: "7 D8", 22: "D11",
  21: "5 D8", 20: "D10", 19: "3 D8", 18: "D9", 17: "9 D4", 16: "D8",
  15: "7 D4", 14: "D7", 13: "5 D4", 12: "D6", 11: "3 D4", 10: "D5",
  9: "1 D4", 8: "D4", 7: "3 D2", 6: "D3", 5: "1 D2", 4: "D2", 3: "1 D1", 2: "D1",
};


export function oneDartOut(s, fat) {
  if (s === 50) return ["BULL"];
  if (s >= 2 && s <= 40 && s % 2 === 0) return [`D${s / 2}`];
  return null;
}

// 2投ルートの組み立て(残し32>40>16を優先する慣習)
export const CO_FIRST = [
  ["T20", 60], ["T19", 57], ["T18", 54], ["T17", 51], ["T16", 48], ["T15", 45],
  ["BULL", 50], ["25", 25],
  ["20", 20], ["19", 19], ["18", 18], ["17", 17], ["16", 16], ["15", 15], ["14", 14], ["13", 13],
  ["12", 12], ["11", 11], ["10", 10], ["9", 9], ["8", 8], ["7", 7], ["6", 6], ["5", 5], ["4", 4], ["3", 3], ["2", 2], ["1", 1],
];

export function twoDartOut(s, fat) {
  const d1 = oneDartOut(s, fat);
  if (d1) return d1;
  // チャートに2投以内の定石があればそれを使う(3投ルートの「続き」と必ず一致させるため)
  const c = CHECKOUT_CHART[s];
  if (c) {
    const r = c.split(" ");
    if (r.length <= 2 && !(fat && r.includes("25"))) return r;
  }
  let best = null;
  let bestRank = Infinity;
  for (let i = 0; i < CO_FIRST.length; i++) {
    const [lab, v] = CO_FIRST[i];
    if (fat && lab === "25") continue;
    const rem = s - v;
    if (rem < 2) continue;
    const fin = oneDartOut(rem, fat);
    if (!fin) continue;
    const remRank = rem === 32 ? 0 : rem === 40 ? 1 : rem === 16 ? 2 : rem === 50 ? 3 : rem === 8 ? 4 : 5;
    const rank = remRank * 100 + i;
    if (rank < bestRank) {
      bestRank = rank;
      best = [lab, ...fin];
    }
  }
  return best;
}

export function threeDartOut(s, fat) {
  for (let i = 0; i < CO_FIRST.length; i++) {
    const [lab, v] = CO_FIRST[i];
    if (fat && lab === "25") continue;
    const rem = s - v;
    if (rem < 2) continue;
    const rest = twoDartOut(rem, fat);
    if (rest) return [lab, ...rest];
  }
  return null;
}

// 残り点と持ちダーツ数からアウトルートを返す(null = 提案なし)
export function checkoutRoute(score, dartsLeft, fat) {
  if (score < 2 || score > 170 || dartsLeft <= 0) return null;
  const d1 = oneDartOut(score, fat);
  if (d1) return d1;
  if (dartsLeft === 1) return null;
  if (dartsLeft >= 3) {
    const c = CHECKOUT_CHART[score];
    if (c) {
      const r = c.split(" ");
      if (!(fat && r.includes("25"))) return r; // ファットブル時は25を含む定石を回避
      return threeDartOut(score, fat) || twoDartOut(score, fat);
    }
    return null; // ボギーナンバー(159,162,163,165,166,168,169)
  }
  return twoDartOut(score, fat); // 持ち2投
}
