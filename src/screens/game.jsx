import { useState, useEffect } from "react";
import { CATS, CRCU_SEQ, CRICKET_NUMS, GAMES, HALFIT_SEQ, P121_CHALLENGES, deep, halfitLabel, kindKey } from "../constants.js";
import { dartLabel, isDeadNumber, isFatBull } from "../engine/board.js";
import { checkoutRoute } from "../engine/checkout.js";
import { applyDart, detectAward, endTurn } from "../engine/game.js";
import { roboThrow } from "../engine/robo.js";
import { RATING_MODE } from "../profiles.js";
import { SFX, UI, oneEightySound, playHit } from "../sound.js";
import { C, FONT_BODY, FONT_DISPLAY } from "../theme.js";
import { DartBoard, Keypad } from "../ui/board.jsx";
import { Avatar, Btn, Mark, PLAYER_COLORS, useViewport } from "../ui/kit.jsx";


// ---------- score panels ----------
export function PlayerPanel({ g, i, accent }) {
  const active = g.current === i && !g.finished;
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: active ? C.surface2 : C.surface,
        border: `1.5px solid ${active ? accent : C.line}`,
        borderRadius: 14,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: active ? accent : C.creamDim,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: FONT_BODY,
        }}
      >
        {active ? "▶ " : ""}
        {g.players[i]}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.1,
          color: C.cream,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {g.kind === "atc" ? (g.atc[i] <= 20 ? g.atc[i] : g.atc[i] === 21 ? "BULL" : "🏁") : g.scores[i]}
      </div>
      {g.kind === "atc" && (
        <div style={{ fontSize: 10, color: C.creamDim, marginTop: 2 }}>
          {g.atc[i] >= 22 ? "完走!" : `次のターゲット ・ ${Math.min(g.atc[i] - 1, 20)}/20${g.atc[i] >= 21 ? "+B" : ""}`}
        </div>
      )}
      {g.kind === "bob" && (
        <div style={{ fontSize: 10, marginTop: 2 }}>
          {g.bobOut[i] ? (
            <span style={{ color: C.red, fontWeight: 700 }}>BUST ・ 脱落</span>
          ) : g.bobT[i] > 21 ? (
            <span style={{ color: C.brass, fontWeight: 700 }}>完走! 🏁</span>
          ) : (
            <span style={{ color: C.creamDim }}>
              狙い: <span style={{ color: C.cream, fontWeight: 700, fontFamily: FONT_DISPLAY }}>{g.bobT[i] === 21 ? "D-BULL" : `D${g.bobT[i]}`}</span> ({g.bobT[i]}/21)
            </span>
          )}
        </div>
      )}
      {g.kind === "crcu" && (() => {
        // ライブMPR: マーク÷実投数×3(ラウンド途中でも分母が動くので不自然に膨らまない)
        const dn = g.pstats[i].darts + (g.current === i && !g.finished ? g.darts.length : 0);
        return (
          <div style={{ fontSize: 10, color: C.creamDim, marginTop: 2 }}>
            MPR <span style={{ color: C.cream, fontWeight: 700 }}>{dn ? ((g.crcuMarks[i] / dn) * 3).toFixed(2) : "-"}</span>
            {" "}({g.crcuMarks[i]}マーク)
          </div>
        );
      })()}
      {g.kind === "shoot" && (
        <div style={{ fontSize: 10, color: C.creamDim, marginTop: 2 }}>
          {g.shootOpen[i].length >= 21 ? (
            <span style={{ color: C.red, fontWeight: 700 }}>BULLチャレンジ ×21</span>
          ) : (
            `${g.shootOpen[i].length}/21エリア ・ 次×${g.shootOpen[i].length + 1}`
          )}
        </div>
      )}
      {g.kind === "halfit" && !g.finished && (
        <div style={{ fontSize: 10, color: C.creamDim, marginTop: 2 }}>
          R{g.round}/{HALFIT_SEQ.length} ・ 狙い: <span style={{ color: C.cream, fontWeight: 700 }}>{halfitLabel(HALFIT_SEQ[g.round - 1])}</span>
        </div>
      )}
      {g.kind === "p121" && (
        <div style={{ fontSize: 10, color: C.creamDim, marginTop: 2 }}>
          TARGET {g.p121T[i]} ・ 挑戦{Math.min(g.p121N[i] + 1, P121_CHALLENGES)}/{P121_CHALLENGES} ・ ターン{g.p121Turn[i] + 1}/3
          {g.p121Best[i] > 0 ? ` ・ BEST ${g.p121Best[i]}` : ""}
        </div>
      )}
    </div>
  );
}


export function CricketTable({ g, accent }) {
  const heads = g.teamCricket ? ["TEAM A", "TEAM B"] : g.players;
  const activeCol = g.teamCricket ? g.current % 2 : g.current;
  const cols = `64px repeat(${heads.length}, 1fr)`;
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 10,
        marginTop: 10,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 4, alignItems: "center" }}>
        <div />
        {heads.map((p, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: 11,
              color: activeCol === i && !g.finished ? accent : C.creamDim,
              fontFamily: g.teamCricket ? FONT_DISPLAY : FONT_BODY,
              letterSpacing: g.teamCricket ? "0.1em" : 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p}
          </div>
        ))}
        {CRICKET_NUMS.map((n) => {
          const dead = isDeadNumber(g, n);
          return [
            <div
              key={`n${n}`}
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 18,
                fontWeight: 600,
                color: dead ? "rgba(168,162,148,0.5)" : C.cream,
                textDecoration: dead ? "line-through" : "none",
                textAlign: "center",
                background: dead ? "transparent" : C.surface2,
                border: dead ? `1px dashed ${C.line}` : "1px solid transparent",
                borderRadius: 8,
                padding: "2px 0",
              }}
            >
              {n === "B" ? "BULL" : n}
            </div>,
            ...heads.map((_, i) => (
              <div key={`m${n}-${i}`} style={{ display: "flex", justifyContent: "center", padding: "2px 0", opacity: dead ? 0.3 : 1 }}>
                <Mark n={g.marks[i][n]} />
              </div>
            )),
          ];
        })}
      </div>
    </div>
  );
}


// 提案バー(01・D/Mアウト時のみ表示)
export function CheckoutBar({ g }) {
  if ((g.kind !== "01" && g.kind !== "p121") || g.finished || g.bust || g.succ) return null;
  if (g.kind === "01" && g.outRule === "open") return null;
  if (g.kind === "01" && g.inRule === "double" && g.opened && !g.opened[g.current]) return null;
  if (g.robo && g.current === g.robo.idx) return null; // ロボのターンは非表示
  const score = g.scores[g.current];
  const left = 3 - g.darts.length;
  if (left <= 0 || score > 170 || score < 2) return null;
  const fat = isFatBull(g);
  const route = checkoutRoute(score, left, fat);
  const bogey = !route && left >= 3 && score <= 170;
  if (!route && !bogey) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "8px 12px", borderRadius: 10, background: `linear-gradient(0deg, rgba(201,160,53,0.10), rgba(201,160,53,0.10)), ${C.surface}`, border: `1px solid ${C.brass}55` }}>
      <span style={{ fontSize: 9, letterSpacing: "0.2em", color: C.brass, fontFamily: FONT_DISPLAY, flexShrink: 0 }}>CHECKOUT</span>
      {route ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {route.map((d, i) => [
            i > 0 && (
              <span key={`a${i}`} style={{ color: C.creamDim, fontSize: 11 }}>
                →
              </span>
            ),
            <span
              key={i}
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "2px 9px",
                borderRadius: 7,
                color: i === route.length - 1 ? "#1A1C20" : C.cream,
                background: i === route.length - 1 ? C.brass : C.surface2,
              }}
            >
              {d}
            </span>,
          ])}
        </div>
      ) : (
        <span style={{ fontSize: 11.5, color: C.creamDim }}>ノーフィニッシュ(この残りでは1ターンで上がれません)</span>
      )}
    </div>
  );
}


// ---------- game screen ----------
export function Game({ g, setG, history, setHistory, onQuit, onRestart, sound, toggleSound, onFinished, onNextLeg }) {
  const [mult, setMult] = useState(1);
  const [inputMode, setInputMode] = useState("board");
  const [flash, setFlash] = useState(null);
  const [award, setAward] = useState(null);
  // 横画面対応: 横長なら「左=スコア情報 / 右=ボード入力」の2カラム
  const vp = useViewport();
  const ls = vp.w > vp.h * 1.15 && vp.w >= 640 && !g.finished;

  const TH = CATS[kindKey(g.kind)];

  useEffect(() => {
    if (g.finished && onFinished) onFinished(g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.finished, g.gid]);

  // ROBO RIVAL: ロボのターンを自動進行(1投ごとにディレイ、ターン終了で自動交代)
  useEffect(() => {
    if (!g.robo || g.finished || g.current !== g.robo.idx) return;
    if (g.darts.length >= 3 || g.bust) {
      const t = setTimeout(() => setG(endTurn(g)), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const { num, mult, pt } = roboThrow(g);
      onDart(num, mult, pt);
    }, g.darts.length === 0 ? 1100 : 800 + Math.random() * 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g]);

  const push = (next) => {
    setHistory([...history, deep(g)]);
    setG(next);
  };

  const onDart = (n, m, pt) => {
    const g2 = applyDart(g, n, m, pt);
    push(g2);
    setMult(1);
    // クリケット: マークが増えていない=ノーカウント(対象外ナンバー or 潰れたエリア)
    const counted =
      g.kind === "cricket"
        ? g2.finished || n === 0 || g2.turnMarks > g.turnMarks
        : g.kind === "crcu" || g.kind === "halfit" || g.kind === "shoot"
        ? g2.finished || n === 0 || g2.scores[g.current] > g.scores[g.current]
        : true;
    if (g2.kind === "p121" && g2.succ && !g.succ) {
      // 121: チェックアウト成功!
      if (sound) {
        try { SFX.win(); } catch (e) {}
      }
      setFlash({ label: "CHECKOUT!", color: C.brass, key: Date.now() });
      push(g2);
      setMult(1);
      return;
    }
    if (sound) playHit(g2, n, m, counted);
    const label = g2.bust ? "BUST!" : dartLabel(n, m, isFatBull(g2));
    const color = g2.bust
      ? C.red
      : !counted
      ? C.creamDim
      : n === 0
      ? C.creamDim
      : n === "B"
      ? C.red
      : m === 3
      ? "#3FBF7F"
      : m === 2
      ? "#E66059"
      : C.cream;
    setFlash({ label, color, key: Date.now() });

    // クリケット: エリアが潰れた瞬間の音
    if (g.kind === "cricket" && sound) {
      const newlyDead = CRICKET_NUMS.some((nn) => !isDeadNumber(g, nn) && isDeadNumber(g2, nn));
      if (newlyDead) setTimeout(() => UI.dead(), 300);
    }

    // アワード判定(3投目終了時)
    const awardKind = g2.kind === "01" || g2.kind === "countup" || g2.kind === "cricket";
    if (awardKind && ((g2.darts.length === 3 && !g2.bust && !g2.finished) || (g2.finished && g2.mode === "hard" && g2.darts.reduce((s, x) => s + x.value, 0) === 180))) {
      const aw = detectAward(g2);
      if (aw) {
        setTimeout(() => {
          setAward({ ...aw, key: Date.now() });
          if (sound) {
            try {
              if (aw.tier === "oneighty") oneEightySound();
              else if (g.mode === "hard") SFX.awardHard();
              else if (aw.tier === "big") SFX.awardBig();
              else SFX.awardMid();
            } catch (e) {}
          }
        }, 550);
      }
    }
  };

  const undo = () => {
    if (!history.length) return;
    UI.back();
    setG(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  const nextPlayer = () => {
    const g2 = endTurn(g);
    if (g.kind === "halfit" && g2.scores[g.current] < g.scores[g.current]) {
      // 全外しで半減!
      setFlash({ label: "HALVED!", color: C.red, key: Date.now() });
      if (sound) {
        try { UI.dead(); } catch (e) {}
      }
    } else if (sound) {
      try { SFX.turn(); } catch (e) {}
    }
    setG(g2);
  };

  const turnOver = (g.darts.length >= 3 || g.bust || g.succ) && !g.finished;
  const isRoboTurn = !!(g.robo && g.current === g.robo.idx && !g.finished);
  const limit = g.roundLimit > 0 ? g.roundLimit : null;
  const winnerName = (w) => (g.teamCricket ? `TEAM ${w === 0 ? "A" : "B"}` : g.players[w]);

  return (
    <div style={{ maxWidth: ls ? 1080 : 560, margin: "0 auto", padding: "16px 12px 40px" }}>
      {/* match progress strip */}
      {g.match && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "rgba(232,147,47,0.12)", border: `1px solid ${CATS.match.accent}55`, borderRadius: 10, padding: "6px 10px", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.cream, maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.players[0]}</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: CATS.match.accent, fontVariantNumeric: "tabular-nums" }}>
            {g.match.wins[0]} - {g.match.wins[1]}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.cream, maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.players[1]}</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 10, letterSpacing: "0.15em", color: C.creamDim, marginLeft: 4 }}>
            LEG {g.match.legNo}/{g.match.total}
          </div>
        </div>
      )}
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
        <Btn
          onClick={() => {
            UI.back();
            onQuit();
          }}
          style={{ padding: "6px 12px", fontSize: 12, color: C.creamDim }}
        >
          ← 終了
        </Btn>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: "0.15em", color: TH.accent, lineHeight: 1.1 }}>
            {GAMES[g.type].name}
            {g.teamCricket ? " 2vs2" : ""}
            {g.kind === "01" && g.outRule === "double" ? " ・ D-OUT" : g.kind === "01" && g.outRule === "master" ? " ・ M-OUT" : ""}
            {g.kind === "01" && g.inRule === "double" ? " ・ D-IN" : ""}
          </div>
          <div style={{ fontSize: 9.5, color: C.creamDim, letterSpacing: "0.25em", fontFamily: FONT_DISPLAY }}>
            {TH.label} ・ {g.mode === "soft" ? "SOFT" : "STEEL"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Btn onClick={toggleSound} style={{ padding: "6px 10px", fontSize: 13 }}>
            {sound ? "🔊" : "🔇"}
          </Btn>
          <div style={{ fontSize: 12, color: C.creamDim, fontVariantNumeric: "tabular-nums", minWidth: 44, textAlign: "right" }}>
            R {Math.min(g.round, limit || g.round)}
            {limit ? `/${limit}` : ""}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: ls ? "row" : "column", gap: ls ? 18 : 0, alignItems: ls ? "flex-start" : "stretch" }}>
      <div style={{ flex: ls ? "1 1 46%" : undefined, minWidth: 0 }}>

      {/* scores */}
      {g.teamCricket ? (
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1].map((t) => {
            const active = g.current % 2 === t && !g.finished;
            const members = g.players.filter((_, i) => i % 2 === t);
            return (
              <div
                key={t}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: active ? C.surface2 : C.surface,
                  border: `1.5px solid ${active ? TH.accent : C.line}`,
                  borderRadius: 14,
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 12, fontFamily: FONT_DISPLAY, letterSpacing: "0.12em", color: active ? TH.accent : C.creamDim }}>
                  TEAM {t === 0 ? "A" : "B"}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, lineHeight: 1.1, color: C.cream, fontVariantNumeric: "tabular-nums" }}>
                  {g.scores[t]}
                </div>
                <div style={{ fontSize: 10.5, color: C.creamDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {members.map((m, j) => {
                    const pIdx = t + j * 2;
                    const throwing = pIdx === g.current && !g.finished;
                    return (
                      <span key={j} style={{ color: throwing ? TH.accent : C.creamDim, fontWeight: throwing ? 700 : 400 }}>
                        {throwing ? "▶ " : ""}
                        {m}
                        {j < members.length - 1 ? " ・ " : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          {g.players.map((_, i) => (
            <PlayerPanel key={i} g={g} i={i} accent={TH.accent} />
          ))}
        </div>
      )}
      {g.kind === "cricket" && <CricketTable g={g} accent={TH.accent} />}

      {/* current throw */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 10,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 0",
              borderRadius: 10,
              background: g.darts[i] ? C.surface2 : "transparent",
              border: `1px dashed ${g.darts[i] ? "transparent" : C.line}`,
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              fontWeight: 600,
              color: g.darts[i] ? C.cream : C.creamDim,
            }}
          >
            {g.darts[i] ? g.darts[i].label : `${i + 1}投目`}
          </div>
        ))}
        <Btn onClick={undo} disabled={!history.length || isRoboTurn} style={{ fontSize: 12, padding: "10px 12px" }}>
          ↩ 戻す
        </Btn>
      </div>

      {g.bust && (
        <div style={{ marginTop: 10, textAlign: "center", color: C.red, fontFamily: FONT_DISPLAY, fontSize: 22, letterSpacing: "0.3em" }}>
          BUST!
        </div>
      )}

      {!g.finished && g.kind === "01" && g.inRule === "double" && !g.opened[g.current] && (
        <div style={{ marginTop: 8, textAlign: "center", color: C.creamDim, fontSize: 12 }}>
          ダブルイン待ち ー ダブルに入れるまで得点しません
        </div>
      )}

      {/* finished panel / next player */}
      {g.finished ? (
        <div
          style={{
            marginTop: 16,
            background: C.surface,
            border: `1.5px solid ${TH.accent}`,
            borderRadius: 14,
            padding: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: "0.3em", color: TH.accent }}>
            {g.players.length === 1 ? "FINISH" : g.winners.length > 1 ? "DRAW" : "GAME SHOT"}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 700, color: C.cream, margin: "6px 0 2px" }}>
            {g.winners.map(winnerName).join(" / ")}
          </div>
          <div style={{ fontSize: 13, color: C.creamDim }}>
            {g.players.length === 1 ? "おつかれさまでした 🎯" : g.winners.length > 1 ? "引き分けです" : "の勝利です 🎯"}
          </div>

          {/* このゲームのプレイヤー別スタッツ */}
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.creamDim, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>GAME STATS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {g.players.map((n, i) => {
                const st = g.pstats[i];
                const isWin = g.teamCricket ? g.winners.includes(i % 2) : g.winners.includes(i);
                const pxMode = RATING_MODE === "px";
                const hardG = g.mode === "hard"; // ハードのゲームはAVG/100%表示
                const val =
                  g.kind === "shoot"
                    ? `${g.scores[i]}`
                    : g.kind === "crcu"
                    ? `${g.scores[i]}`
                    : g.kind === "halfit"
                    ? `${g.scores[i]}`
                    : g.kind === "atc"
                    ? String(st.darts)
                    : g.kind === "bob"
                    ? String(g.scores[i])
                    : g.kind === "p121"
                    ? String(g.p121Best[i] || "-")
                    : hardG
                  ? g.kind === "cricket"
                    ? st.rounds
                      ? (st.marks / st.rounds).toFixed(2)
                      : "-"
                    : st.darts
                    ? ((st.points / st.darts) * 3).toFixed(1)
                    : "-"
                  :
                  g.kind === "cricket"
                    ? pxMode
                      ? st.rounds
                        ? (st.marks / st.rounds).toFixed(2)
                        : "-"
                      : st.r80
                      ? (st.m80 / st.r80).toFixed(2)
                      : "-"
                    : g.kind === "countup"
                    ? st.rounds
                      ? (st.points / st.rounds).toFixed(1)
                      : "-"
                    : pxMode
                    ? st.darts
                      ? (st.points / st.darts).toFixed(2)
                      : "-"
                    : st.r80
                    ? (st.p80 / st.r80).toFixed(1)
                    : "-";
                const lab =
                  g.kind === "shoot" ? "SCORE" : g.kind === "crcu" ? "MARKS" : g.kind === "halfit" ? "SCORE" : g.kind === "atc" ? "DARTS" : g.kind === "bob" ? "SCORE" : g.kind === "p121" ? "BEST" : g.kind === "cricket" ? "MPR" : hardG ? "AVG" : g.kind !== "countup" && pxMode ? "PPD" : "PPR";
                return (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface2, borderRadius: 10, padding: "7px 10px", border: `1px solid ${isWin ? TH.accent : "transparent"}` }}
                  >
                    <Avatar avatar={g.avatars && g.avatars[i]} size={26} />
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: isWin ? 700 : 400, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {n}
                        {g.teamCricket ? <span style={{ fontSize: 10, color: C.creamDim, marginLeft: 5 }}>({i % 2 === 0 ? "A" : "B"})</span> : null}
                        {isWin ? <span style={{ fontSize: 10, color: TH.accent, marginLeft: 5 }}>WIN</span> : null}
                      </div>
                      {hardG && g.kind === "01" && (
                        <div style={{ fontSize: 9.5, color: C.creamDim, marginTop: 2 }}>
                          F9 {st.d9 ? ((st.p9 / st.d9) * 3).toFixed(1) : "-"} ・ 100+:{(st.t100 || 0) + (st.t140 || 0) + (st.t180 || 0)}
                          {st.t180 ? ` ・ 180×${st.t180}` : ""}
                          {st.co ? ` ・ CO ${st.co}` : ""}
                        </div>
                      )}
                      {hardG && g.kind === "cricket" && (
                        <div style={{ fontSize: 9.5, color: C.creamDim, marginTop: 2 }}>F9 MPR {st.r9 ? (st.m9 / st.r9).toFixed(2) : "-"}</div>
                      )}
                      {g.kind === "crcu" && (
                        <div style={{ fontSize: 9.5, color: C.creamDim, marginTop: 2 }}>MPR {st.darts ? ((g.crcuMarks[i] / st.darts) * 3).toFixed(2) : "-"} ・ {g.crcuMarks[i]}マーク</div>
                      )}
                      {g.kind === "shoot" && (
                        <div style={{ fontSize: 9.5, color: C.creamDim, marginTop: 2 }}>{g.shootOpen[i].length}/21エリア開拓</div>
                      )}
                    </div>
                    <div style={{ fontSize: 10.5, color: C.creamDim, fontVariantNumeric: "tabular-nums" }}>
                      {st.rounds}R
                      {hardG && g.kind === "01" && st.coAtt ? ` ・ CO ${Math.round((st.coHit / st.coAtt) * 100)}%` : ""}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 70 }}>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: isWin ? TH.accent : C.cream, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                      <span style={{ fontSize: 9, color: C.creamDim, marginLeft: 4, fontFamily: FONT_DISPLAY, letterSpacing: "0.1em" }}>{lab}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {g.profileIds && g.profileIds.some(Boolean) && (
              <div style={{ fontSize: 10, color: C.creamDim, marginTop: 8 }}>登録プレイヤーの累計スタッツ・Rtに反映済み</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {g.match ? (
              <Btn
                onClick={() => {
                  UI.startGame();
                  onNextLeg(g);
                }}
                style={{ flex: 2, background: CATS.match.accent, border: "none", fontWeight: 700, color: "#fff" }}
              >
                {g.winners.length > 1
                  ? "同じレグを再戦"
                  : g.match.wins[g.winners[0]] + 1 >= g.match.need
                  ? "マッチ結果へ 🏆"
                  : `次のレグへ(LEG ${g.match.legNo + 1})`}
              </Btn>
            ) : (
              <Btn
                onClick={() => {
                  UI.startGame();
                  onRestart();
                }}
                style={{ flex: 1, background: TH.accent, border: "none", fontWeight: 700, color: "#fff" }}
              >
                もう一度
              </Btn>
            )}
            <Btn
              onClick={() => {
                UI.back();
                onQuit();
              }}
              style={{ flex: 1 }}
            >
              {g.match ? "マッチ中断" : "ホームへ"}
            </Btn>
          </div>
        </div>
      ) : isRoboTurn ? (
        <div
          className="robopulse"
          style={{ marginTop: 12, width: "100%", padding: "14px 0", borderRadius: 12, textAlign: "center", background: "rgba(139,92,246,0.13)", border: `1.5px solid ${CATS.robo.accent}`, color: CATS.robo.accent, fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: "0.15em", fontWeight: 700 }}
        >
          🤖 ROBO Lv.{g.robo.lv} スローイング…
        </div>
      ) : turnOver ? (
        <button
          onClick={nextPlayer}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            background: TH.accent,
            color: "#fff",
            fontFamily: FONT_DISPLAY,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.12em",
          }}
        >
          次のプレイヤーへ →
        </button>
      ) : null}

      </div>

      <div style={{ flex: ls ? "1 1 54%" : undefined, minWidth: 0 }}>
      <div style={{ maxWidth: ls ? "calc(100vh - 110px)" : undefined, width: "100%", margin: "0 auto" }}>

      {/* checkout suggestion */}
      {!g.finished && <CheckoutBar g={g} />}
      {!g.finished && (g.kind === "halfit" || g.kind === "crcu") && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, padding: "8px 12px", borderRadius: 10, background: `linear-gradient(0deg, rgba(47,165,108,0.10), rgba(47,165,108,0.10)), ${C.surface}`, border: `1px solid ${CATS.practice.accent}66` }}>
          <span style={{ fontSize: 9, letterSpacing: "0.2em", color: CATS.practice.accent, fontFamily: FONT_DISPLAY }}>TARGET</span>
          <span key={g.round} className="hitpop" style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: C.cream, display: "inline-block" }}>
            {g.kind === "halfit"
              ? halfitLabel(HALFIT_SEQ[Math.min(g.round, HALFIT_SEQ.length) - 1])
              : (() => {
                  const t = CRCU_SEQ[Math.min(g.round, CRCU_SEQ.length) - 1];
                  return t === "B" ? "BULL" : String(t);
                })()}
          </span>
          <span style={{ fontSize: 10.5, color: C.creamDim }}>
            {g.kind === "halfit" ? "外すと半減!" : `R${g.round}/8`}
          </span>
        </div>
      )}
      {!g.finished && g.kind === "shoot" && (g.shootOpen[g.current].length >= 21 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, padding: "8px 12px", borderRadius: 10, background: `linear-gradient(0deg, rgba(201,72,60,0.14), rgba(201,72,60,0.14)), ${C.surface}`, border: `1.5px solid ${C.red}` }}>
          <span className="hitpop" style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: C.red, letterSpacing: "0.1em", display: "inline-block" }}>🎯 BULLチャレンジ!</span>
          <span style={{ fontSize: 10.5, color: C.cream }}>ブル復活 ・ 毎投 <span style={{ color: C.brass, fontWeight: 700 }}>×21</span></span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, padding: "8px 12px", borderRadius: 10, background: `linear-gradient(0deg, rgba(47,165,108,0.10), rgba(47,165,108,0.10)), ${C.surface}`, border: `1px solid ${CATS.practice.accent}66` }}>
          <span style={{ fontSize: 9, letterSpacing: "0.2em", color: CATS.practice.accent, fontFamily: FONT_DISPLAY }}>NEXT</span>
          <span key={g.shootOpen[g.current].length} className="hitpop" style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: C.brass, display: "inline-block" }}>
            ×{g.shootOpen[g.current].length + 1}
          </span>
          <span style={{ fontSize: 10.5, color: C.creamDim }}>残り{21 - g.shootOpen[g.current].length}エリア ・ 開けた所は無効</span>
        </div>
      ))}

      {/* input area */}
      {!g.finished && (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {[
              ["board", "🎯 ボード入力"],
              ["pad", "🔢 テンキー入力"],
            ].map(([m, label]) => (
              <button
                key={m}
                onClick={() => {
                  UI.tick();
                  setInputMode(m);
                }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: FONT_BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  color: inputMode === m ? C.cream : C.creamDim,
                  background: inputMode === m ? C.surface2 : "transparent",
                  border: `1px solid ${inputMode === m ? TH.accent : C.line}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {inputMode === "board" ? (
            <>
              <DartBoard
                g={g}
                disabled={turnOver || isRoboTurn}
                onSegment={onDart}
                pins={g.darts
                  .map((d, i) => (d.x != null ? { x: d.x, y: d.y, color: PLAYER_COLORS[g.current % 4], tilt: -26 - i * 9 } : null))
                  .filter(Boolean)}
              />
              <Btn
                onClick={() => onDart(0, 1)}
                disabled={turnOver}
                style={{ width: "100%", marginTop: 4, color: C.creamDim, letterSpacing: "0.2em", fontFamily: FONT_DISPLAY }}
              >
                MISS(ボード外)
              </Btn>
            </>
          ) : (
            <Keypad g={g} mult={mult} setMult={setMult} onDart={onDart} locked={isRoboTurn} />
          )}

          {/* hit label flash */}
          {flash && (
            <div
              key={flash.key}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                className="hitflash"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 76,
                  letterSpacing: "0.06em",
                  color: flash.color,
                  textShadow: "0 0 24px rgba(0,0,0,0.9), 0 4px 18px rgba(0,0,0,0.8)",
                }}
              >
                {flash.label}
              </div>
            </div>
          )}
        </div>
      )}

      </div>
      </div>
      </div>


      {/* award overlay */}
      {award &&
        (g.mode === "soft" || award.tier === "oneighty" ? (
          <div
            key={award.key}
            className="awardwrap"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle, rgba(8,9,12,0.0) 30%, rgba(8,9,12,0.6) 100%)",
            }}
          >
            <div style={{ textAlign: "center", padding: "0 12px" }}>
              <div
                className="awardname"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: award.tier === "oneighty" ? 44 : 56,
                  lineHeight: 1.1,
                  letterSpacing: "0.08em",
                  color: award.tier === "oneighty" ? C.red : TH.accent,
                  textShadow: award.tier === "oneighty" ? `0 0 40px ${C.red}, 0 4px 24px rgba(0,0,0,0.95)` : `0 0 34px ${TH.accent}, 0 4px 24px rgba(0,0,0,0.95)`,
                }}
              >
                {award.name}
              </div>
              {award.tier === "oneighty" && (
                <div className="awardname" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1, color: C.cream, textShadow: "0 0 44px rgba(255,255,255,0.5), 0 6px 28px rgba(0,0,0,0.95)", marginTop: 6 }}>
                  180
                </div>
              )}
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.cream,
                  marginTop: 8,
                  textShadow: "0 2px 12px rgba(0,0,0,0.95)",
                }}
              >
                {award.sub}
              </div>
            </div>
          </div>
        ) : (
          <div
            key={award.key}
            className="awardbanner"
            style={{
              position: "fixed",
              top: 12,
              left: "50%",
              zIndex: 60,
              pointerEvents: "none",
              background: C.surface2,
              border: `1px solid ${TH.accent}`,
              borderRadius: 12,
              padding: "8px 18px",
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              letterSpacing: "0.1em",
              color: TH.accent,
              whiteSpace: "nowrap",
              boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
            }}
          >
            {award.name}
            <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.creamDim, marginLeft: 8 }}>{award.sub}</span>
          </div>
        ))}
    </div>
  );
}
