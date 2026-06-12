import { CRCU_SEQ, HALFIT_SEQ } from "../constants.js";
import { BOARD_ORDER, boardPalette, isCricketTarget, isDeadNumber, sectorPath } from "../engine/board.js";
import { UI } from "../sound.js";
import { C, FONT_DISPLAY } from "../theme.js";


// ボードに刺さったダーツ(ティップ位置=x,y、プレイヤーカラーのフライト)
export function DartPin({ x, y, color, tilt }) {
  return (
    <g transform={`translate(${x} ${y})`} style={{ pointerEvents: "none" }}>
      <ellipse cx="1.6" cy="1.2" rx="3.2" ry="1.5" fill="rgba(0,0,0,0.45)" />
      <g className="dartanim">
        <g transform={`rotate(${tilt})`}>
          <line x1="0" y1="-2" x2="0" y2="-26" stroke="#C9CDD6" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="0" y1="-7" x2="0" y2="-17" stroke="#3A3F49" strokeWidth="4.6" strokeLinecap="round" />
          <path d="M -6.5 -38 L 0 -26 L 6.5 -38 L 0 -34.5 Z" fill={color} stroke="#0C0E11" strokeWidth="0.7" />
          <circle cx="0" cy="0" r="1.7" fill="#0C0E11" />
        </g>
      </g>
    </g>
  );
}


// 練習ゲーム: ターゲット以外のセグメントを暗転(クリケットの潰れ演出と同系)
export function dimPractice(g, num, mult) {
  if (g.finished) return false;
  if (g.kind === "halfit") {
    const t = HALFIT_SEQ[Math.min(g.round, HALFIT_SEQ.length) - 1];
    if (t === "D") return mult !== 2;
    if (t === "T") return mult !== 3;
    if (t === "B") return true;
    return num !== t;
  }
  if (g.kind === "crcu") {
    const t = CRCU_SEQ[Math.min(g.round, CRCU_SEQ.length) - 1];
    return t === "B" ? true : num !== t;
  }
  if (g.kind === "shoot") return g.shootOpen[g.current].includes(num); // 開拓済みエリアは消灯
  return false;
}

export function dimPracticeBull(g, mult) {
  if (g.finished) return false;
  if (g.kind === "halfit") {
    const t = HALFIT_SEQ[Math.min(g.round, HALFIT_SEQ.length) - 1];
    if (t === "B") return false;
    if (t === "D") return mult !== 2; // インナーブルはダブル扱い
    return true;
  }
  if (g.kind === "crcu") return CRCU_SEQ[Math.min(g.round, CRCU_SEQ.length) - 1] !== "B";
  if (g.kind === "shoot") {
    if (g.shootOpen[g.current].length >= 21) return false; // BULLチャレンジ: ブル復活!
    return g.shootOpen[g.current].includes("B");
  }
  return false;
}


export function DartBoard({ g, disabled, onSegment, corkMode, corkMarks, onCork, pins }) {
  const cx = 200, cy = 200;
  const R = { bullIn: 17, bullOut: 34, tripIn: 98, tripOut: 120, dblIn: 146, dblOut: 170, label: 186, rim: 199 };
  const P = boardPalette(g.mode);
  const hit = (num, mult, e) => {
    if (corkMode || disabled) return;
    let pt = null;
    if (e) {
      const svg = e.currentTarget.ownerSVGElement;
      if (svg && svg.createSVGPoint) {
        const sp = svg.createSVGPoint();
        sp.x = e.clientX;
        sp.y = e.clientY;
        const q = sp.matrixTransform(svg.getScreenCTM().inverse());
        pt = { x: q.x, y: q.y };
      }
    }
    onSegment(num, mult, pt);
  };
  const svgClick = (e) => {
    // コーク: タップした正確な位置をSVG座標に変換して中心からの距離を測る
    if (!corkMode || disabled) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    onCork && onCork({ x: p.x, y: p.y, d: Math.hypot(p.x - cx, p.y - cy) });
  };
  const segs = [];
  BOARD_ORDER.forEach((num, k) => {
    const a0 = ((-90 + k * 18 - 9) * Math.PI) / 180;
    const a1 = ((-90 + k * 18 + 9) * Math.PI) / 180;
    const dark = k % 2 === 0;
    const single = dark ? P.singleDark : P.singleLight;
    const ring = dark ? P.ringOnDark : P.ringOnLight;
    const dead = g.kind === "cricket" && isDeadNumber(g, num);
    const dim = (g.kind === "cricket" && !isCricketTarget(num)) || dead;
    const mk = (r0, r1, fill, mult) => (
      <path
        key={`${num}-${mult}-${r0}`}
        className="seg"
        d={sectorPath(cx, cy, r0, r1, a0, a1)}
        fill={fill}
        opacity={dead ? 0.15 : dim || dimPractice(g, num, mult) ? 0.25 : 1}
        stroke="#101216"
        strokeWidth="1"
        onClick={(e) => hit(num, mult, e)}
      />
    );
    segs.push(
      mk(R.bullOut, R.tripIn, single, 1),
      mk(R.tripIn, R.tripOut, ring, 3),
      mk(R.tripOut, R.dblIn, single, 1),
      mk(R.dblIn, R.dblOut, ring, 2)
    );
    const la = ((-90 + k * 18) * Math.PI) / 180;
    segs.push(
      <text
        key={`t${num}`}
        x={cx + R.label * Math.cos(la)}
        y={cy + R.label * Math.sin(la)}
        textAnchor="middle"
        dominantBaseline="central"
        fill={dim ? C.creamDim : C.cream}
        opacity={dead ? 0.25 : dim || dimPractice(g, num, 1) ? 0.4 : 1}
        textDecoration={dead ? "line-through" : "none"}
        fontFamily={FONT_DISPLAY}
        fontWeight="600"
        fontSize="19"
        style={{ pointerEvents: "none" }}
      >
        {num}
      </text>
    );
  });

  return (
    <div style={{ marginTop: 10, opacity: disabled ? 0.45 : 1, transition: "opacity .15s" }}>
      <svg
        viewBox="0 0 400 400"
        onClick={corkMode ? svgClick : undefined}
        style={{ width: "100%", display: "block", touchAction: "manipulation", cursor: corkMode ? "crosshair" : "default" }}
      >
        <circle cx={cx} cy={cy} r={R.rim} fill="#0C0E11" />
        {P.frame && <circle cx={cx} cy={cy} r={195.5} fill="none" stroke={P.frame} strokeWidth="7" />}
        {segs}
        <circle className="seg" cx={cx} cy={cy} r={R.bullOut} fill={P.bullOuter} opacity={(g.kind === "cricket" && isDeadNumber(g, "B")) || dimPracticeBull(g, 1) ? 0.15 : 1} stroke="#101216" onClick={(e) => hit("B", 1, e)} />
        <circle className="seg" cx={cx} cy={cy} r={R.bullIn} fill={P.bullInner} opacity={(g.kind === "cricket" && isDeadNumber(g, "B")) || dimPracticeBull(g, 2) ? 0.15 : 1} stroke={g.mode === "soft" ? "rgba(255,255,255,0.5)" : "#101216"} onClick={(e) => hit("B", 2, e)} />
        {corkMarks &&
          corkMarks.map((m, i) => (
            <g key={i} style={{ pointerEvents: "none" }}>
              <circle cx={m.x} cy={m.y} r="7" fill={m.color} stroke="#fff" strokeWidth="1.6" />
              <text x={m.x} y={m.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily={FONT_DISPLAY}>
                {i + 1}
              </text>
            </g>
          ))}
        {pins && pins.map((p, i) => <DartPin key={i} x={p.x} y={p.y} color={p.color} tilt={p.tilt} />)}
      </svg>
    </div>
  );
}


// ---------- keypad ----------
export function Keypad({ g, mult, setMult, onDart, locked }) {
  const turnOver = locked || g.darts.length >= 3 || g.bust || g.finished;
  const multBtn = (m, label, color) => (
    <button
      key={m}
      onClick={() => {
        UI.tick();
        setMult(m);
      }}
      style={{
        flex: 1,
        padding: "10px 0",
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: FONT_DISPLAY,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: mult === m ? (m === 1 ? "#1A1C20" : C.cream) : C.creamDim,
        background: mult === m ? color : C.surface,
        border: `1.5px solid ${mult === m ? color : C.line}`,
      }}
    >
      {label}
    </button>
  );

  const numBtn = (n) => {
    const dead = isDeadNumber(g, n);
    const dimmed = (g.kind === "cricket" && !isCricketTarget(n) && n !== 0) || dead;
    return (
      <button
        key={n}
        disabled={turnOver}
        onClick={() => onDart(n, mult)}
        style={{
          padding: "12px 0",
          borderRadius: 10,
          cursor: turnOver ? "default" : "pointer",
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          fontWeight: 600,
          color: dimmed ? C.creamDim : C.cream,
          textDecoration: dead ? "line-through" : "none",
          opacity: turnOver ? 0.35 : dead ? 0.3 : dimmed ? 0.45 : 1,
          background: n === "B" ? C.red : n === 0 ? "transparent" : C.surface2,
          border: `1px solid ${n === 0 ? C.line : "transparent"}`,
        }}
      >
        {n === "B" ? "BULL" : n === 0 ? "MISS" : n}
      </button>
    );
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {multBtn(1, "SINGLE", C.cream)}
        {multBtn(2, "DOUBLE", C.red)}
        {multBtn(3, "TRIPLE", C.green)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {Array.from({ length: 20 }, (_, i) => numBtn(i + 1))}
        {numBtn("B")}
        {numBtn(0)}
      </div>
    </div>
  );
}
