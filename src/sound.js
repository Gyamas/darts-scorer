import { UI_HARD } from "./theme.js";

// シュートアウト: 全21エリア(1-20+ブル)

// ---------- sound engine (Web Audio, arcade-style original SE) ----------
export let _actx = null;

export function ac() {
  if (!_actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _actx = new AC();
  }
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}


export function tone(freq, t0, dur, { type = "square", vol = 0.13, slide = 0 } = {}) {
  const ctx = ac();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const start = ctx.currentTime + t0;
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}


export function thock(t0 = 0) {
  // short filtered noise burst = dart hitting the board
  const ctx = ac();
  if (!ctx) return;
  const len = Math.floor(0.045 * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 950;
  const g = ctx.createGain();
  g.gain.value = 0.45;
  s.connect(f).connect(g).connect(ctx.destination);
  s.start(ctx.currentTime + t0);
}


// スティールダーツがサイザル麻ボードに刺さる「ドスッ」(電子音なし・物理音のみ)
export function steelThock(t0 = 0, { depth = 1, vol = 1 } = {}) {
  const ctx = ac();
  if (!ctx) return;
  const start = ctx.currentTime + t0;
  const jitter = 0.88 + Math.random() * 0.24; // 毎回少し違う音に
  // 1) 鋭いノイズトランジェント(突き刺さる瞬間)
  const len = Math.floor(0.035 * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = (depth > 1 ? 380 : 520) * jitter;
  const ng = ctx.createGain();
  ng.gain.value = 0.6 * vol;
  src.connect(f).connect(ng).connect(ctx.destination);
  src.start(start);
  // 2) ボードの低い「ドン」(胴鳴り) — 深く・長く
  const o = ctx.createOscillator();
  o.type = "sine";
  const fr = (depth > 1 ? 72 : 98) * jitter;
  o.frequency.setValueAtTime(fr * 1.9, start);
  o.frequency.exponentialRampToValueAtTime(fr, start + 0.06);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, start);
  og.gain.exponentialRampToValueAtTime(0.46 * vol, start + 0.007);
  og.gain.exponentialRampToValueAtTime(0.0001, start + 0.2 * depth);
  o.connect(og).connect(ctx.destination);
  o.start(start);
  // 3) ボード筐体の共鳴(壁が「ゴッ」と鳴る重さ)
  const rl = Math.floor(0.16 * ctx.sampleRate);
  const rbuf = ctx.createBuffer(1, rl, ctx.sampleRate);
  const rd = rbuf.getChannelData(0);
  for (let i = 0; i < rl; i++) rd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rl, 3.2);
  const rsrc = ctx.createBufferSource();
  rsrc.buffer = rbuf;
  const rf = ctx.createBiquadFilter();
  rf.type = "bandpass";
  rf.frequency.value = 205 * jitter;
  rf.Q.value = 1.6;
  const rg = ctx.createGain();
  rg.gain.value = 0.5 * vol;
  rsrc.connect(rf).connect(rg).connect(ctx.destination);
  rsrc.start(start + 0.004);
  o.stop(start + 0.2 * depth + 0.1); // 減衰(0.2×depth)を最後まで鳴らし切る
}


// ミス: ワイヤー弾き・バウンスアウトの「チン+カラッ」
export function steelClatter() {
  const ctx = ac();
  if (!ctx) return;
  tone(2400 + Math.random() * 600, 0, 0.05, { type: "triangle", vol: 0.1 });
  tone(1700, 0.02, 0.04, { type: "triangle", vol: 0.06 });
  const start = ctx.currentTime + 0.05;
  const len = Math.floor(0.07 * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 1300;
  const g = ctx.createGain();
  g.gain.value = 0.12;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(start);
}


// 180専用: 低いドラムブーム + 観客の歓声(ノイズスウェル)
export function oneEightySound() {
  const ctx = ac();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  // ドン!(深いブーム)
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(150, t0);
  o.frequency.exponentialRampToValueAtTime(55, t0 + 0.25);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t0);
  og.gain.exponentialRampToValueAtTime(0.5, t0 + 0.012);
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
  o.connect(og).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + 0.6);
  // 歓声(バンドパスノイズのスウェル)
  const dur = 1.3;
  const len = Math.floor(dur * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const env = t < 0.18 ? t / 0.18 : Math.pow(1 - (t - 0.18) / 0.82, 1.4);
    d[i] = (Math.random() * 2 - 1) * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 950;
  f.Q.value = 0.55;
  const g = ctx.createGain();
  g.gain.value = 0.22;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0 + 0.06);
}


export const SFX = {
  single() { thock(); tone(540, 0.01, 0.09); },
  double() { thock(); tone(540, 0.01, 0.07); tone(810, 0.09, 0.11); },
  triple() { thock(); tone(523, 0.01, 0.07); tone(659, 0.08, 0.07); tone(784, 0.15, 0.14); },
  bull() { thock(); tone(440, 0.01, 0.11, { type: "sawtooth" }); tone(660, 0.1, 0.11, { type: "sawtooth" }); tone(880, 0.19, 0.2, { type: "sawtooth" }); },
  dbull() {
    thock();
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.01 + i * 0.07, 0.12, { type: "sawtooth" }));
    tone(1568, 0.3, 0.28, { type: "triangle", vol: 0.18 });
  },
  miss() { tone(170, 0, 0.16, { type: "triangle", slide: -90, vol: 0.16 }); },
  // ---- スティール(ハード)モード: 電子音なしの物理音 ----
  sSingle() { steelThock(); },
  sDouble() { steelThock(0, { vol: 1.15 }); steelThock(0.018, { vol: 0.35 }); },
  sTriple() { steelThock(0, { vol: 1.25, depth: 1.1 }); steelThock(0.02, { vol: 0.45 }); },
  sBull() { steelThock(0, { depth: 1.5, vol: 1.2 }); },
  sDbull() { steelThock(0, { depth: 1.6, vol: 1.3 }); steelThock(0.05, { depth: 1.3, vol: 0.5 }); },
  sMiss() { steelClatter(); },
  sWhiff() { steelThock(0, { vol: 0.55 }); },
  whiff() {
    // クリケットでノーカウント(対象外ナンバー・潰れたエリア)の「スカッ」という外れ音
    tone(340, 0, 0.09, { type: "triangle", vol: 0.13, slide: -190 });
    tone(210, 0.08, 0.11, { type: "triangle", vol: 0.08, slide: -90 });
  },
  bust() {
    if (UI_HARD) {
      steelThock(0, { depth: 1.6, vol: 1.05 });
      woodKnock(0.16, { pitch: 0.58, vol: 1.15 });
      return;
    }
    tone(320, 0, 0.18, { type: "sawtooth", slide: -190, vol: 0.16 });
    tone(230, 0.18, 0.32, { type: "sawtooth", slide: -150, vol: 0.16 });
  },
  win() {
    if (UI_HARD) {
      steelThock(0, { depth: 1.5, vol: 1.25 });
      woodKnock(0.14, { pitch: 1.0, vol: 0.95 });
      woodKnock(0.26, { pitch: 1.25, vol: 1.0 });
      // 小さな歓声(180演出の縮小版)
      const ctx = ac();
      if (ctx) {
        const t0 = ctx.currentTime + 0.1;
        const dur = 0.8;
        const len = Math.floor(dur * ctx.sampleRate);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          const t = i / len;
          const env = t < 0.22 ? t / 0.22 : Math.pow(1 - (t - 0.22) / 0.78, 1.5);
          d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1000;
        f.Q.value = 0.6;
        const g2 = ctx.createGain();
        g2.gain.value = 0.13;
        src.connect(f).connect(g2).connect(ctx.destination);
        src.start(t0);
      }
      return;
    }
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.16, { vol: 0.15 }));
    tone(1319, 0.74, 0.55, { vol: 0.15 });
  },
  turn() {
    if (UI_HARD) {
      woodKnock(0, { pitch: 0.9, vol: 0.6 });
      woodKnock(0.08, { pitch: 1.1, vol: 0.5 });
      return;
    }
    tone(660, 0, 0.06, { type: "triangle" });
    tone(880, 0.06, 0.09, { type: "triangle" });
  },
  awardBig() {
    [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.14, { vol: 0.16 }));
    tone(1047, 0.38, 0.4, { vol: 0.17 });
    tone(784, 0.38, 0.4, { type: "triangle", vol: 0.12 });
    tone(1319, 0.64, 0.5, { vol: 0.14 });
  },
  awardMid() { tone(523, 0, 0.1); tone(784, 0.1, 0.1); tone(1047, 0.2, 0.26, { vol: 0.16 }); },
  awardHard() {
    woodKnock(0, { pitch: 0.85, vol: 1.1 });
    woodKnock(0.1, { pitch: 1.15, vol: 0.9 });
    steelThock(0.2, { depth: 1.2, vol: 0.7 });
  },
};


// ---------- UI sounds (場面別の操作音) ----------
export let SOUND_ON = true;

export function setSoundOn(v) {
  SOUND_ON = v;
}


// 木のノック音(ハードモードのUI用): コツッという打音+低い木の胴鳴り
export function woodKnock(t0 = 0, { pitch = 1, vol = 1 } = {}) {
  const ctx = ac();
  if (!ctx) return;
  const start = ctx.currentTime + t0;
  const j = 0.93 + Math.random() * 0.14;
  // 打音(短いバンドパスノイズ)
  const len = Math.floor(0.02 * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 760 * pitch * j;
  f.Q.value = 1.8;
  const ng = ctx.createGain();
  ng.gain.value = 0.34 * vol;
  src.connect(f).connect(ng).connect(ctx.destination);
  src.start(start);
  // 木の胴鳴り(ごく短い低音)
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(185 * pitch * j, start);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, start);
  og.gain.exponentialRampToValueAtTime(0.16 * vol, start + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
  o.connect(og).connect(ctx.destination);
  o.start(start);
  o.stop(start + 0.1);
}


export const UI = {
  guard(fn) {
    if (!SOUND_ON) return;
    try {
      fn();
    } catch (e) {}
  },
  // 軽いチップ選択(オプション・タブ類)
  tick() {
    this.guard(() => {
      if (UI_HARD) return woodKnock(0, { pitch: 1.3, vol: 0.55 });
      tone(950, 0, 0.045, { type: "square", vol: 0.07 });
    });
  },
  // カード・タイルの選択
  tap() {
    this.guard(() => {
      if (UI_HARD) return woodKnock(0, { pitch: 1, vol: 1 });
      tone(620, 0, 0.05, { type: "triangle", vol: 0.12 });
      tone(930, 0.05, 0.06, { type: "triangle", vol: 0.1 });
    });
  },
  // 次へ進む(上昇)
  nav() {
    this.guard(() => {
      if (UI_HARD) {
        woodKnock(0, { pitch: 0.95, vol: 0.9 });
        woodKnock(0.07, { pitch: 1.2, vol: 0.8 });
        return;
      }
      tone(660, 0, 0.06, { type: "triangle", vol: 0.11 });
      tone(990, 0.06, 0.08, { type: "triangle", vol: 0.11 });
    });
  },
  // 戻る(下降)
  back() {
    this.guard(() => {
      if (UI_HARD) {
        woodKnock(0, { pitch: 1.15, vol: 0.8 });
        woodKnock(0.07, { pitch: 0.82, vol: 0.7 });
        return;
      }
      tone(880, 0, 0.05, { type: "triangle", vol: 0.1 });
      tone(587, 0.05, 0.08, { type: "triangle", vol: 0.1 });
    });
  },
  // モーダルを開く(ポップ)
  modal() {
    this.guard(() => {
      if (UI_HARD) return woodKnock(0, { pitch: 0.78, vol: 1.1 });
      tone(520, 0, 0.1, { type: "sine", vol: 0.12, slide: 220 });
    });
  },
  // モーダルを閉じる
  close() {
    this.guard(() => {
      if (UI_HARD) return woodKnock(0, { pitch: 0.72, vol: 0.75 });
      tone(700, 0, 0.09, { type: "sine", vol: 0.1, slide: -200 });
    });
  },
  // トグル(モード切替など)
  toggle() {
    this.guard(() => {
      if (UI_HARD) {
        woodKnock(0, { pitch: 1, vol: 0.85 });
        woodKnock(0.05, { pitch: 1.18, vol: 0.7 });
        return;
      }
      tone(440, 0, 0.035, { type: "square", vol: 0.09 });
      tone(660, 0.04, 0.04, { type: "square", vol: 0.09 });
    });
  },
  // ゲーム開始
  startGame() {
    this.guard(() => {
      if (UI_HARD) {
        // ノック3つ→ダーツがドスッと刺さる
        woodKnock(0, { pitch: 0.9, vol: 0.9 });
        woodKnock(0.1, { pitch: 1.05, vol: 0.95 });
        woodKnock(0.2, { pitch: 1.2, vol: 1 });
        steelThock(0.34, { depth: 1.3, vol: 1.1 });
        return;
      }
      [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.1, { vol: 0.13 }));
      tone(1047, 0.22, 0.22, { vol: 0.14 });
    });
  },
  // シャッフル(ランダムな連打音)
  shuffle() {
    this.guard(() => {
      if (UI_HARD) {
        [1.1, 0.85, 1.25, 0.95, 1.35].forEach((p, i) => woodKnock(i * 0.055, { pitch: p, vol: 0.7 }));
        woodKnock(0.32, { pitch: 0.8, vol: 1.1 });
        return;
      }
      [700, 520, 820, 600, 920].forEach((f, i) => tone(f, i * 0.055, 0.05, { type: "square", vol: 0.08 }));
      tone(1100, 0.3, 0.14, { type: "triangle", vol: 0.12 });
    });
  },
  // クリケットのエリアが潰れた(重い音)
  dead() {
    this.guard(() => {
      if (UI_HARD) {
        steelThock(0, { depth: 1.5, vol: 0.9 });
        woodKnock(0.12, { pitch: 0.65, vol: 1 });
        return;
      }
      tone(280, 0, 0.12, { type: "sawtooth", vol: 0.14, slide: -120 });
      tone(180, 0.12, 0.2, { type: "sawtooth", vol: 0.12, slide: -80 });
    });
  },
  // 1投戻す
  undo() {
    this.guard(() => {
      if (UI_HARD) return woodKnock(0, { pitch: 0.68, vol: 0.5 });
      tone(760, 0, 0.06, { type: "square", vol: 0.07, slide: -400 });
    });
  },
  // コークの刺さり音
  cork() {
    this.guard(() => {
      thock();
      tone(500, 0.01, 0.06, { vol: 0.09 });
    });
  },
};


export function playHit(g2, num, mult, counted = true) {
  if (!SOUND_ON) return;
  try {
    const steel = g2.mode === "hard"; // ハード=刺さる物理音、ソフト=電子音
    if (g2.finished) return SFX.win();
    if (g2.bust) return SFX.bust();
    if (num === 0) return steel ? SFX.sMiss() : SFX.miss();
    if (!counted) return steel ? SFX.sWhiff() : SFX.whiff(); // クリケットのノーカウントヒット
    if (steel) {
      if (num === "B") return mult >= 2 ? SFX.sDbull() : SFX.sBull();
      if (mult === 3) return SFX.sTriple();
      if (mult === 2) return SFX.sDouble();
      return SFX.sSingle();
    }
    if (num === "B") return mult >= 2 ? SFX.dbull() : SFX.bull();
    if (mult === 3) return SFX.triple();
    if (mult === 2) return SFX.double();
    SFX.single();
  } catch (e) {
    /* audio unavailable */
  }
}
