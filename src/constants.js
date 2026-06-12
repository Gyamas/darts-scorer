


// ---------- game categories & themes ----------
export const CATS = {
  "01": {
    label: "01 GAMES",
    jp: "ゼロワン",
    accent: "#D3433B",
    soft: "rgba(211,67,59,0.13)",
    desc: "持ち点をちょうど0に削り切るカウントダウン。終盤の一投に痺れる定番。",
    tagline: "COUNT DOWN TO ZERO",
  },
  countup: {
    label: "COUNT-UP",
    jp: "カウントアップ",
    accent: "#2FA56C",
    soft: "rgba(47,165,108,0.13)",
    desc: "8ラウンドの合計点をひたすら積み上げる。腕試しと練習の王道。",
    tagline: "STACK IT HIGH",
  },
  cricket: {
    label: "CRICKET",
    jp: "クリケット",
    accent: "#3D8BD4",
    soft: "rgba(61,139,212,0.13)",
    desc: "15〜20とブルを3マークで自分の陣地に。奪い合いの頭脳戦。",
    tagline: "CLAIM YOUR GROUND",
  },
  practice: {
    label: "PRACTICE",
    jp: "練習",
    accent: "#2FA56C",
    soft: "rgba(47,165,108,0.13)",
    desc: "カウントアップ、Around the Clock、Bob's 27、121。一人でも積み上がる練習メニュー。",
    tagline: "TRAIN YOUR GAME",
  },
  match: {
    label: "MATCH",
    jp: "マッチ(メドレー)",
    accent: "#E8932F",
    soft: "rgba(232,147,47,0.13)",
    desc: "01とクリケットを交互に戦うレグ制の本格対戦。先に過半数のレグを取った方が勝者。",
    tagline: "MEDLEY BATTLE",
  },
  robo: {
    label: "ROBO RIVAL",
    jp: "ロボ対戦",
    accent: "#8B5CF6",
    soft: "rgba(139,92,246,0.13)",
    desc: "実力校正済みのダーツロボとガチンコ勝負。Lv.1(Rt2)からLv.9(Rt18)まで、自分のRtに合う相手と練習できる。",
    tagline: "BEAT THE MACHINE",
  },
};


// マッチのレグ構成
// ソフト: メドレー(01⇔クリケット交互、最終レグはCHOICE=その場で選択)
// ハード: スティール標準の同一01連戦(レグ形式)
export function medleySeq(legs, zo, mode) {
  if (mode === "hard") return Array.from({ length: legs }, () => zo);
  if (legs === 3) return [zo, "cricket", "choice"];
  if (legs === 5) return [zo, "cricket", zo, "cricket", "choice"];
  return [zo, "cricket", zo, "cricket", zo, "cricket", "choice"];
}


export const GAMES = {
  301: { name: "301", kind: "01" },
  501: { name: "501", kind: "01" },
  701: { name: "701", kind: "01" },
  901: { name: "901", kind: "01" },
  1101: { name: "1101", kind: "01" },
  1501: { name: "1501", kind: "01" },
  countup: { name: "カウントアップ", kind: "countup" },
  atc: { name: "アラウンド・ザ・クロック", kind: "atc" },
  crcu: { name: "CRカウントアップ", kind: "crcu" },
  shoot: { name: "シュートアウト", kind: "shoot" },
  halfit: { name: "ハーフイット", kind: "halfit" },
  bob: { name: "BOB'S 27", kind: "bob" },
  p121: { name: "121", kind: "p121" },
  cricket: { name: "クリケット", kind: "cricket" },
};


export const CRICKET_NUMS = [20, 19, 18, 17, 16, 15, "B"];

export const COUNTUP_ROUNDS = 8;

export const CRICKET_ROUNDS = 15;

export const CRICKET_TEAM_ROUNDS = 10;

export const ROUNDS01 = { 301: 15, 501: 15, 701: 20, 901: 20, 1101: 25, 1501: 25 }; // ソフトの01ラウンド上限(DL準拠)


export function roundLimitOf(kind, type, mode, team) {
  if (kind === "atc" || kind === "bob" || kind === "p121") return 0; // 進行ベースで終了
  if (kind === "crcu") return 8; // クリカン: 8ラウンド
  if (kind === "shoot") return 8; // シュートアウト: 8ラウンド
  if (kind === "halfit") return HALFIT_SEQ.length; // ハーフイット: ターゲット数ぶん
  if (kind === "countup") return COUNTUP_ROUNDS;
  if (kind === "cricket") return team ? CRICKET_TEAM_ROUNDS : CRICKET_ROUNDS;
  return mode === "soft" ? ROUNDS01[type] || 15 : 0; // 0 = 無制限(ハード)
}


export const deep = (o) => JSON.parse(JSON.stringify(o));

export const P121_CHALLENGES = 10; // 121の挑戦回数


export const PRACTICE_KINDS = ["countup", "atc", "bob", "p121", "crcu", "halfit", "shoot"];

export const kindKey = (kind) => (kind === "01" ? "01" : PRACTICE_KINDS.includes(kind) ? "practice" : kind);


// ハーフイットのターゲット順(DL準拠)
export const HALFIT_SEQ = [15, 16, "D", 17, 18, "T", 19, 20, "B"];

export const halfitLabel = (t) => (t === "D" ? "ダブル" : t === "T" ? "トリプル" : t === "B" ? "BULL" : String(t));

// クリカンのラウンドターゲット(DL準拠: 20→…→15→ブル×2)
export const CRCU_SEQ = [20, 19, 18, 17, 16, 15, "B", "B"];


// ---------- home & flow ----------
export const SOON_CATS = {};

export const HOME_TILES = ["01", "cricket", "practice", "match", "robo"];

export const catOf = (k) => CATS[k] || SOON_CATS[k];
