import { CATS } from "../constants.js";
import { UI } from "../sound.js";
import { C, FONT_DISPLAY } from "../theme.js";
import { Avatar, Btn } from "../ui/kit.jsx";


// ---------- match screens ----------
export function ChoiceScreen({ m, onPick }) {
  const accent = CATS.match.accent;
  const legNo = m.cur + 1;
  const first = m.base.names[m.cur % 2]; // このレグの先攻
  const opts = [
    { t: m.base.zeroOne || "701", label: m.base.zeroOne || "701", sub: "ゼロワン", color: CATS["01"].accent },
    { t: "cricket", label: "CRICKET", sub: "クリケット", color: CATS.cricket.accent },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "#0C0E11", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: "0.3em", color: accent }}>
        LEG {legNo} / BEST OF {m.legs}
      </div>
      <div className="gameon" style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, letterSpacing: "0.15em", color: C.cream, marginTop: 6 }}>CHOICE</div>
      <div style={{ fontSize: 12.5, color: C.creamDim, marginTop: 10, textAlign: "center", lineHeight: 1.7 }}>
        最終レグのゲームを選んでください
        <br />
        (このレグの先攻: <span style={{ color: C.cream, fontWeight: 700 }}>{first}</span>)
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 22, width: "100%", maxWidth: 380 }}>
        {opts.map((o) => (
          <button
            key={o.t}
            onClick={() => {
              UI.startGame();
              onPick(o.t);
            }}
            style={{ flex: 1, padding: "22px 0 18px", borderRadius: 16, cursor: "pointer", background: C.surface, border: `2px solid ${o.color}`, textAlign: "center" }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", color: o.color, lineHeight: 1 }}>{o.label}</div>
            <div style={{ fontSize: 11, color: C.creamDim, marginTop: 6 }}>{o.sub}</div>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 26, alignItems: "center" }}>
        {m.base.names.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar avatar={m.base.avatars && m.base.avatars[i]} size={26} />
            <span style={{ fontSize: 13, color: C.cream, fontWeight: 700 }}>{n}</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: accent }}>{m.wins[i]}</span>
            {i === 0 && <span style={{ color: C.creamDim, fontFamily: FONT_DISPLAY, marginLeft: 4 }}>-</span>}
          </div>
        ))}
      </div>
    </div>
  );
}


export function MatchResult({ m, onRematch, onHome }) {
  const accent = CATS.match.accent;
  const w = m.wins[0] > m.wins[1] ? 0 : 1;
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 16px 48px", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: "0.35em", color: accent }}>MATCH RESULT</div>
      <div className="gameon" style={{ marginTop: 18 }}>
        <Avatar avatar={m.base.avatars && m.base.avatars[w]} size={84} />
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, color: C.cream, marginTop: 10 }}>{m.base.names[w]}</div>
      <div style={{ fontSize: 13, color: C.creamDim, marginTop: 2 }}>マッチ勝利! 🏆</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700, color: accent, marginTop: 14, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {m.wins[0]} - {m.wins[1]}
      </div>
      <div style={{ fontSize: 11, color: C.creamDim, marginTop: 4 }}>
        {m.base.names[0]} vs {m.base.names[1]} ・ BEST OF {m.legs}
      </div>

      <div style={{ marginTop: 22, textAlign: "left" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.25em", color: C.creamDim, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>LEG RESULTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {m.log.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, letterSpacing: "0.1em", color: C.creamDim, width: 44 }}>LEG {i + 1}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: l.kind === "CRICKET" ? CATS.cricket.accent : CATS["01"].accent, flex: 1 }}>
                {l.kind}
              </div>
              <Avatar avatar={m.base.avatars && m.base.avatars[l.winner]} size={20} />
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.cream }}>{l.winnerName}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <Btn
          onClick={() => {
            UI.startGame();
            onRematch();
          }}
          style={{ flex: 1, background: accent, border: "none", fontWeight: 700, color: "#fff" }}
        >
          もう一度
        </Btn>
        <Btn
          onClick={() => {
            UI.back();
            onHome();
          }}
          style={{ flex: 1 }}
        >
          ホームへ
        </Btn>
      </div>
    </div>
  );
}
