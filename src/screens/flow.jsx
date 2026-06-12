import { useState, useEffect } from "react";
import { CATS, GAMES, medleySeq, roundLimitOf } from "../constants.js";
import { roboRtText, roboSpec01, roboSpecMpr, roboStatText } from "../engine/robo.js";
import { PX_01, PX_CR, RATING_MODE, STATS_MODE, flightOf, fmt01, fmtCr, fmtRt, pxClass, pxRtFrom, statsFor } from "../profiles.js";
import { ProfileEditor, ProfilePicker } from "./players.jsx";
import { UI } from "../sound.js";
import { C, FONT_BODY, FONT_DISPLAY } from "../theme.js";
import { DartBoard } from "../ui/board.jsx";
import { Avatar, Btn, CatIcon, FlowNav, OptionChips, PLAYER_COLORS, Stepper } from "../ui/kit.jsx";


export function OptionModal({ kind, accent, outRule, setOutRule, inRule, setInRule, sepaBull, setSepaBull, onClose }) {
  const row = (label, content) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: C.creamDim, margin: "0 0 6px 2px", fontFamily: FONT_DISPLAY, letterSpacing: "0.15em" }}>{label}</div>
      {content}
    </div>
  );
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(8,9,12,0.85)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, padding: "18px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, letterSpacing: "0.15em", color: C.cream }}>OPTION SETTINGS</div>
          <Btn onClick={onClose} style={{ padding: "4px 12px", fontSize: 13, color: C.creamDim }}>
            ✕
          </Btn>
        </div>
        {kind === "01" &&
          row(
            "IN ー 始め方",
            <OptionChips
              accent={accent}
              value={inRule}
              onChange={setInRule}
              options={[
                ["open", "オープン", "1投目から得点"],
                ["double", "ダブル", "ダブルで開始"],
              ]}
            />
          )}
        {kind === "01" &&
          row(
            "OUT ー 上がり方",
            <OptionChips
              accent={accent}
              value={outRule}
              onChange={setOutRule}
              options={[
                ["open", "オープン", "なんでもOK"],
                ["double", "ダブル", "D・D-ブルのみ"],
                ["master", "マスター", "D・T・ブル"],
              ]}
            />
          )}
        {kind !== "cricket" &&
          row(
            "BULL",
            <OptionChips
              accent={accent}
              value={sepaBull}
              onChange={setSepaBull}
              options={[
                [false, "50 / 50", "どこでも50点"],
                [true, "25 / 50", "セパレートブル"],
              ]}
            />
          )}
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", background: accent, color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600, letterSpacing: "0.15em", marginTop: 4 }}
        >
          OK
        </button>
      </div>
    </div>
  );
}


export function GameOnSplash({ g, profiles, accent, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const statOf = (i) => {
    if (g.robo && i === g.robo.idx) {
      // ロボはスペック値を表示
      if (g.kind === "cricket") return roboSpecMpr(g.robo.lv).toFixed(2);
      return roboSpec01(g.robo.lv).toFixed(1);
    }
    const pid = g.profileIds && g.profileIds[i];
    const prof = pid ? profiles.find((p) => p.id === pid) : null;
    if (!prof) return "-";
    if (g.kind === "cricket") return fmtCr(prof);
    if (g.kind === "atc") {
      const b = statsFor(prof).pr;
      return b && b.atcBest ? `${b.atcBest}投` : "-";
    }
    if (g.kind === "crcu") {
      const b = statsFor(prof).pr;
      return b && b.crcuBest ? String(b.crcuBest) : "-";
    }
    if (g.kind === "shoot") {
      const b = statsFor(prof).pr;
      return b && b.shootBest ? String(b.shootBest) : "-";
    }
    if (g.kind === "halfit") {
      const b = statsFor(prof).pr;
      return b && b.halfBest ? String(b.halfBest) : "-";
    }
    if (g.kind === "bob") {
      const b = statsFor(prof).pr;
      return b && b.bobBest ? String(b.bobBest) : "-";
    }
    if (g.kind === "p121") {
      const b = statsFor(prof).pr;
      return b && b.p121Best ? String(b.p121Best) : "-";
    }
    if (g.kind === "countup") {
      const cu = statsFor(prof).cu;
      return cu && cu.best ? String(cu.best) : "-";
    }
    return fmt01(prof);
  };
  const statLabel =
    g.kind === "cricket" ? "MPR" : g.kind === "countup" ? "BEST SCORE" : g.kind === "atc" ? "BEST(最少投数)" : g.kind === "bob" ? "HIGH SCORE" : g.kind === "p121" ? "BEST TARGET" : g.kind === "crcu" ? "BEST MARKS" : g.kind === "halfit" || g.kind === "shoot" ? "BEST SCORE" : "01 STATS";
  return (
    <div
      onClick={onDone}
      style={{ position: "fixed", inset: 0, zIndex: 70, background: "#0C0E11", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" }}
    >
      <div className="gameon" style={{ fontFamily: FONT_DISPLAY, fontSize: 54, fontWeight: 700, letterSpacing: "0.18em", color: C.cream, lineHeight: 1 }}>
        GAME ON
      </div>
      {g.match && (
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: "0.2em", color: CATS.match.accent, marginTop: 10 }}>
          LEG {g.match.legNo} / BEST OF {g.match.total} ・ {g.match.seqLabel}
        </div>
      )}
      <div style={{ fontSize: 11, letterSpacing: "0.45em", color: C.creamDim, marginTop: 8, fontFamily: FONT_DISPLAY }}>STATS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18, alignItems: "center", justifyContent: "center" }}>
        {g.players.map((n, i) => [
          i > 0 && (
            <div key={`vs${i}`} style={{ fontFamily: FONT_DISPLAY, color: C.creamDim, fontSize: 14, letterSpacing: "0.1em" }}>
              VS
            </div>
          ),
          <div
            key={i}
            className="shufflerow"
            style={{ animationDelay: `${i * 0.16}s`, minWidth: 150, background: C.surface, borderTop: `3px solid ${PLAYER_COLORS[i % 4]}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <Avatar avatar={g.avatars && g.avatars[i]} size={30} />
              <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: C.cream, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{statOf(i)}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY }}>{statLabel}</div>
          </div>,
        ])}
      </div>
      <div style={{ marginTop: 24, fontSize: 11, color: C.creamDim }}>タップでスキップ</div>
    </div>
  );
}


export function CorkModal({ players, mode, accent, teamLocked, onDone, onClose }) {
  const [marks, setMarks] = useState([]);
  const done = marks.length >= players.length;
  const fakeG = { mode, kind: "cork", marks: [] };
  const handleCork = (p) => {
    UI.cork();
    setMarks((ms) => (ms.length >= players.length ? ms : [...ms, { ...p, player: players[ms.length], color: PLAYER_COLORS[ms.length % 4] }]));
  };
  const order = done ? [...marks].sort((a, b) => a.d - b.d) : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,9,12,0.92)", zIndex: 55, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 12, overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 440, background: C.surface, border: `1.5px solid ${accent}`, borderRadius: 18, padding: "16px 14px", margin: "auto 0" }}>
        <div style={{ textAlign: "center", fontFamily: FONT_DISPLAY, fontSize: 15, letterSpacing: "0.25em", color: accent }}>CORK START</div>
        {!done ? (
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <div style={{ fontSize: 15, color: C.cream }}>
              <span style={{ color: PLAYER_COLORS[marks.length % 4], fontWeight: 700 }}>{players[marks.length].name}</span> の番({marks.length + 1}/{players.length})
            </div>
            <div style={{ fontSize: 11.5, color: C.creamDim, marginTop: 3 }}>ブルを狙って1本投げて、刺さった位置をボードでタップ</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", fontSize: 12, color: C.creamDim, marginTop: 4 }}>センターに近い順に投げ順が決まりました!</div>
        )}

        <DartBoard g={fakeG} onSegment={() => {}} corkMode={!done} corkMarks={marks} onCork={handleCork} />

        {done ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {order.map((m, i) => (
                <div
                  key={i}
                  className="shufflerow"
                  style={{
                    animationDelay: `${i * 0.18}s`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: i === 0 ? `${accent}22` : C.surface2,
                    border: `1.5px solid ${i === 0 ? accent : "transparent"}`,
                    borderRadius: 12,
                    padding: "8px 12px",
                  }}
                >
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: i === 0 ? accent : C.creamDim, width: 24, textAlign: "center" }}>{i + 1}</div>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: m.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: i === 0 ? 700 : 400, color: C.cream }}>
                    {teamLocked ? `[${i % 2 === 0 ? "A" : "B"}] ` : ""}
                    {m.player.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.creamDim, fontVariantNumeric: "tabular-nums" }}>中心から{m.d.toFixed(0)}mm</div>
                  {i === 0 && <div style={{ fontSize: 10, fontFamily: FONT_DISPLAY, letterSpacing: "0.12em", color: accent }}>FIRST</div>}
                </div>
              ))}
            </div>
            <button
              onClick={() => onDone(order.map((m) => m.player))}
              style={{ marginTop: 14, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: accent, color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, letterSpacing: "0.15em" }}
            >
              この順番でスタート →
            </button>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn
                onClick={() => {
                  UI.tick();
                  setMarks([]);
                }}
                style={{ flex: 1, fontSize: 13 }}
              >
                ↻ やり直し
              </Btn>
              <Btn
                onClick={() => {
                  UI.close();
                  onClose();
                }}
                style={{ flex: 1, fontSize: 13, color: C.creamDim }}
              >
                キャンセル
              </Btn>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {marks.length > 0 && (
              <Btn
                onClick={() => {
                  UI.undo();
                  setMarks((ms) => ms.slice(0, -1));
                }}
                style={{ flex: 1, fontSize: 13 }}
              >
                ↩ 1本戻す
              </Btn>
            )}
            <Btn
              onClick={() => {
                UI.close();
                onClose();
              }}
              style={{ flex: 1, fontSize: 13, color: C.creamDim }}
            >
              キャンセル
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}


export function Flow({ cat, mode, profiles, upsertProfile, deleteProfile, onHome, onStart }) {
  const TH = CATS[cat];
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState("501");
  const [team, setTeam] = useState(false);
  const [count, setCount] = useState(cat === "robo" || cat === "practice" ? 1 : 2);
  const [names, setNames] = useState(
    cat === "robo" || cat === "practice"
      ? [{ name: "プレイヤー 1", pid: null, avatar: null }]
      : [
          { name: "プレイヤー 1", pid: null, avatar: null },
          { name: "プレイヤー 2", pid: null, avatar: null },
        ]
  );
  const [roboGame, setRoboGame] = useState("501");
  const [pracGame, setPracGame] = useState("countup");
  const [roboLv, setRoboLv] = useState(3);
  const [pickerFor, setPickerFor] = useState(null); // プロフィール選択中のスロット
  const [editing, setEditing] = useState(null); // {profile?, forSlot?}
  const [outRule, setOutRule] = useState(mode === "hard" ? "double" : "open");
  const [inRule, setInRule] = useState("open");
  const [sepaBull, setSepaBull] = useState(mode === "hard");
  const [optOpen, setOptOpen] = useState(false);
  const [shuffled, setShuffled] = useState(null); // シャッフル結果(確認待ち)
  const [corkOpen, setCorkOpen] = useState(false); // コークスタート

  const [legs, setLegs] = useState(3);
  const [zeroOne, setZeroOne] = useState(mode === "hard" ? "501" : "701"); // スティール標準は501連戦
  const type = cat === "01" ? variant : cat === "robo" ? roboGame : cat === "practice" ? pracGame : cat;
  const kind = type === "match" ? "match" : GAMES[type].kind;
  const teamLocked = cat === "cricket" && team;
  const limit = type === "match" ? 0 : roundLimitOf(kind, type, mode, teamLocked);

  const resize = (n) => {
    setCount(n);
    setNames((ns) => Array.from({ length: n }, (_, i) => ns[i] || { name: `プレイヤー ${i + 1}`, pid: null, avatar: null }));
  };
  const pickTeam = (t) => {
    setTeam(t);
    if (t) resize(4);
  };
  const setName = (i, v) => setNames((ns) => ns.map((p, j) => (j === i ? { ...p, name: v } : p)));
  const assignProfile = (i, prof) =>
    setNames((ns) => ns.map((p, j) => (j === i ? { name: prof.name, pid: prof.id, avatar: prof.avatar } : p)));
  const clearSlot = (i) => setNames((ns) => ns.map((p, j) => (j === i ? { name: `プレイヤー ${i + 1}`, pid: null, avatar: null } : p)));
  const trimP = (p) => ({ ...p, name: p.name.trim() || "プレイヤー" });
  const roboPlayer = () => ({ name: `ROBO Lv.${roboLv}`, pid: null, avatar: { kind: "emoji", emoji: "🤖", color: "#8B5CF6" }, robo: true });
  const fullPlayers = () => (cat === "robo" ? [...names.map(trimP), roboPlayer()] : names.map(trimP));

  const launch = (ps) => {
    UI.startGame();
    onStart({
      type,
      names: ps.map((p) => p.name),
      profileIds: ps.map((p) => p.pid || null),
      avatars: ps.map((p) => p.avatar || null),
      mode,
      outRule,
      inRule,
      sepaBull,
      teamCricket: teamLocked,
      legs: type === "match" ? legs : undefined,
      zeroOne: type === "match" ? zeroOne : undefined,
      robo: cat === "robo" ? { lv: roboLv, idx: ps.findIndex((p) => p.robo) } : undefined,
    });
  };
  const doShuffle = () => {
    UI.shuffle();
    const ns = fullPlayers();
    for (let i = ns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ns[i], ns[j]] = [ns[j], ns[i]];
    }
    setShuffled({ players: ns, key: Date.now() });
  };

  const gameTitle = cat === "01" ? variant : TH.label;
  const desc =
    cat === "01"
      ? "持ち点をちょうど0にするゲーム。一番早く0にしたプレイヤーの勝利。"
      : cat === "cricket"
      ? "15〜20とブルを狙う陣取りゲーム。全エリア獲得後、スコアが高い方の勝利。"
      : cat === "match"
      ? "01とクリケットを交互に戦うレグ制メドレー。最終レグはその場でゲームを選ぶCHOICE。先攻はレグごとに交代します。"
      : cat === "robo"
      ? "実力校正済みのロボと1vs1。ロボは正規分布の着弾シミュレーションで投げるので、調子の波もリアル。"
      : cat === "practice"
      ? pracGame === "countup"
        ? "8ラウンドの合計点をひたすら積み上げる。スコアリングの基礎体力づくり。"
        : pracGame === "shoot"
        ? "当てた点数×開いたエリア数が得点。一度開けたナンバーは無効。後半ほど高倍率(最大×21)——JAPANプロ試験種目(基準5500点)。"
        : pracGame === "crcu"
        ? "ターゲット(20→19→…→15→ブル×2)に刺さった点数を加算、MPRも計測。JAPANプロ試験種目。"
        : pracGame === "halfit"
        ? "15→16→ダブル→17→18→トリプル→19→20→ブルの順に狙う。1本も当たらないとスコア半減!"
        : pracGame === "atc"
        ? "1→2→…→20→ブルを順に当てて完走。ダブルで2つ、トリプルで3つ進む。最少投数を目指せ。"
        : pracGame === "bob"
        ? "持ち点27でD1→D20→D-BULLを各3投。当てれば加点、3投全部外すとその点数を減点、0を切ったら即終了。ダブル練習の王様。"
        : "残り121から9投以内のチェックアウトに挑戦。成功で+1、失敗で-1。全10挑戦の最高到達点を記録。"
      : "8ラウンドの合計点をひたすら積み上げるゲーム。";

  return (
    <div>
      <Stepper
        accent={TH.accent}
        step={step}
        onHome={() => {
          UI.back();
          onHome();
        }}
      />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 48px" }}>
        {step === 0 && (
          <>
            <div style={{ background: `linear-gradient(0deg, ${TH.soft}, ${TH.soft}), ${C.surface}`, border: `1.5px solid ${TH.accent}`, borderRadius: 14, padding: "18px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CatIcon cat={cat} color={TH.accent} />
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, letterSpacing: "0.08em", color: C.cream }}>{gameTitle}</div>
              </div>
              <div style={{ fontSize: 12.5, color: C.creamDim, marginTop: 10, lineHeight: 1.7 }}>{desc}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, letterSpacing: "0.15em", color: TH.accent, marginTop: 10 }}>
                {type === "match" ? `BEST OF ${legs} ・ MEDLEY` : limit > 0 ? `${limit} ROUNDS` : "ラウンド無制限"}
                {kind === "01" || type === "match" ? ` ・ ${mode === "soft" ? "SOFT" : "STEEL"}` : ""}
              </div>
            </div>

            {cat === "01" && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>ゲームを選択してください</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(mode === "soft" ? ["301", "501", "701", "901", "1101", "1501"] : ["301", "501", "701"]).map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        UI.tick();
                        setVariant(v);
                      }}
                      style={{
                        flex: "1 1 30%",
                        padding: "13px 0",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontFamily: FONT_DISPLAY,
                        fontSize: 21,
                        fontWeight: 600,
                        color: variant === v ? "#fff" : C.creamDim,
                        background: variant === v ? TH.accent : C.surface,
                        border: `1.5px solid ${variant === v ? TH.accent : C.line}`,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {cat === "practice" && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>練習メニューを選択してください</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(mode === "hard"
                    ? [
                        ["countup", "COUNT-UP", "スコアリング基礎"],
                        ["atc", "AROUND THE CLOCK", "1→20→ブル"],
                        ["bob", "BOB'S 27", "ダブル練習"],
                        ["p121", "121", "チェックアウト挑戦"],
                      ]
                    : [
                        ["countup", "COUNT-UP", "ブル練習の定番"],
                        ["crcu", "CRカウントアップ", "クリカン ・ プロ試験種目"],
                        ["halfit", "HALF-IT", "外すと半減"],
                        ["shoot", "SHOOT OUT", "陣取り ・ プロ試験種目"],
                      ]
                  ).map(([v, label, sub]) => (
                    <button
                      key={v}
                      onClick={() => {
                        UI.tick();
                        setPracGame(v);
                      }}
                      style={{
                        padding: "13px 8px 11px",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "center",
                        color: pracGame === v ? "#fff" : C.creamDim,
                        background: pracGame === v ? TH.accent : C.surface,
                        border: `1.5px solid ${pracGame === v ? TH.accent : C.line}`,
                      }}
                    >
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.1 }}>{label}</div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.85, fontFamily: FONT_BODY }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {cat === "robo" && (
              <>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>ゲームを選択してください</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      ["301", "301"],
                      ["501", "501"],
                      ["701", "701"],
                      ["cricket", "CRICKET"],
                      ["countup", "COUNT-UP"],
                      ["match", "MATCH"],
                    ].map(([v, label]) => (
                      <button
                        key={v}
                        onClick={() => {
                          UI.tick();
                          setRoboGame(v);
                        }}
                        style={{
                          flex: "1 1 30%",
                          padding: "11px 0",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontFamily: FONT_DISPLAY,
                          fontSize: 15,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          color: roboGame === v ? "#fff" : C.creamDim,
                          background: roboGame === v ? TH.accent : C.surface,
                          border: `1.5px solid ${roboGame === v ? TH.accent : C.line}`,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>ロボのレベルを選択してください</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lv) => (
                      <button
                        key={lv}
                        onClick={() => {
                          UI.tick();
                          setRoboLv(lv);
                        }}
                        style={{
                          padding: "11px 0",
                          borderRadius: 9,
                          cursor: "pointer",
                          fontFamily: FONT_DISPLAY,
                          fontSize: 16,
                          fontWeight: 700,
                          color: roboLv === lv ? "#fff" : C.creamDim,
                          background: roboLv === lv ? TH.accent : C.surface,
                          border: `1.5px solid ${roboLv === lv ? TH.accent : C.line}`,
                        }}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
                    <Avatar avatar={{ kind: "emoji", emoji: "🤖", color: "#8B5CF6" }} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.cream }}>ROBO Lv.{roboLv}</div>
                      <div style={{ fontSize: 10.5, color: C.creamDim, marginTop: 2 }}>
                        {roboRtText(roboLv)} ・ {roboStatText(roboLv)}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, fontFamily: FONT_DISPLAY, letterSpacing: "0.1em", color: TH.accent, fontWeight: 700 }}>
                      {RATING_MODE === "px"
                        ? pxClass(Math.round((pxRtFrom(roboSpec01(roboLv) / 3, PX_01) + pxRtFrom(roboSpecMpr(roboLv), PX_CR)) / 2))
                        : `${flightOf(2 * roboLv)} FLIGHT`}
                    </div>
                  </div>
                </div>
              </>
            )}
            {type === "match" && (
              <>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>レグ数を選択してください</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[3, 5, 7].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          UI.tick();
                          setLegs(v);
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 0 10px",
                          borderRadius: 10,
                          cursor: "pointer",
                          color: legs === v ? "#fff" : C.creamDim,
                          background: legs === v ? TH.accent : C.surface,
                          border: `1.5px solid ${legs === v ? TH.accent : C.line}`,
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, lineHeight: 1 }}>BEST OF {v}</div>
                        <div style={{ fontSize: 10, marginTop: 3, opacity: 0.85, fontFamily: FONT_BODY }}>{Math.ceil(v / 2)}レグ先取</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>{mode === "hard" ? "レグのゲーム(全レグ共通 ・ スティール標準は501)" : "01レグのゲーム"}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["301", "501", "701"].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          UI.tick();
                          setZeroOne(v);
                        }}
                        style={{
                          flex: 1,
                          padding: "11px 0",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontFamily: FONT_DISPLAY,
                          fontSize: 18,
                          fontWeight: 600,
                          color: zeroOne === v ? "#fff" : C.creamDim,
                          background: zeroOne === v ? TH.accent : C.surface,
                          border: `1.5px solid ${zeroOne === v ? TH.accent : C.line}`,
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 12px" }}>
                  <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY, marginBottom: 7 }}>{mode === "hard" ? "LEG FORMAT" : "MEDLEY ORDER"}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {medleySeq(legs, zeroOne, mode).map((t, i) => [
                      i > 0 && (
                        <span key={`a${i}`} style={{ color: C.creamDim, fontSize: 11 }}>
                          →
                        </span>
                      ),
                      <span
                        key={i}
                        style={{ fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: t === "choice" ? "#1A1C20" : C.cream, background: t === "choice" ? C.brass : C.surface2, borderRadius: 7, padding: "4px 9px" }}
                      >
                        {t === "cricket" ? "CRICKET" : t === "choice" ? "CHOICE" : t}
                      </span>,
                    ])}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.creamDim, marginTop: 7, lineHeight: 1.6 }}>{mode === "hard" ? "スティール標準のレグ形式: 全レグ同じ01を連戦し、先にレグ数を取った方の勝ち" : "CHOICEレグは開始時に01かクリケットをその場で選べます"}</div>
                </div>
              </>
            )}
            <FlowNav
              accent={TH.accent}
              onNext={() => {
                UI.nav();
                setStep(1);
              }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: C.creamDim }}>プレイヤー数を選んでください</div>
              {cat === "cricket" && (
                <button
                  onClick={() => {
                    UI.toggle();
                    pickTeam(!team);
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: FONT_BODY,
                    fontSize: 12,
                    fontWeight: 700,
                    color: team ? "#fff" : C.creamDim,
                    background: team ? TH.accent : C.surface,
                    border: `1.5px solid ${team ? TH.accent : C.line}`,
                  }}
                >
                  TEAM FORMAT(2vs2)
                </button>
              )}
            </div>
            {cat === "match" && (
              <div style={{ fontSize: 12, color: C.cream, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 18 }}>
                マッチは <span style={{ color: TH.accent, fontWeight: 700 }}>1 vs 1</span> の2人対戦です(先攻はレグごとに交代)
              </div>
            )}
            {cat === "robo" && (
              <div style={{ fontSize: 12, color: C.cream, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 18 }}>
                <span style={{ color: TH.accent, fontWeight: 700 }}>ROBO Lv.{roboLv}</span> との1vs1対戦です。あなたのプレイヤーを設定してください
                {roboGame === "match" && <span>(メドレー: 先攻はレグごとに交代)</span>}
              </div>
            )}
            <div style={{ display: cat === "match" || cat === "robo" ? "none" : "flex", gap: 6, marginBottom: 18 }}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  disabled={teamLocked}
                  onClick={() => {
                    UI.tick();
                    resize(n);
                  }}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    cursor: teamLocked ? "default" : "pointer",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: count === n ? "#fff" : C.creamDim,
                    opacity: teamLocked && count !== n ? 0.35 : 1,
                    background: count === n ? TH.accent : C.surface,
                    border: `1.5px solid ${count === n ? TH.accent : C.line}`,
                  }}
                >
                  {n}P
                </button>
              ))}
            </div>
            {teamLocked && (
              <div style={{ fontSize: 11.5, color: C.creamDim, margin: "0 2px 10px" }}>入力順 = 投げ順。1・3人目がTEAM A、2・4人目がTEAM B</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {names.map((p, i) => {
                const prof = p.pid ? profiles.find((x) => x.id === p.pid) : null;
                return (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: C.surface, border: `1px solid ${p.pid ? TH.accent + "66" : C.line}`, borderRadius: 12, padding: "8px 10px" }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#fff",
                        background: teamLocked ? (i % 2 === 0 ? TH.accent : C.red) : C.surface2,
                        flexShrink: 0,
                        border: teamLocked ? "none" : `1px solid ${C.line}`,
                      }}
                    >
                      {teamLocked ? (i % 2 === 0 ? "A" : "B") : i + 1}
                    </div>
                    <Avatar avatar={p.avatar} size={34} />
                    {p.pid ? (
                      <>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: C.creamDim, marginTop: 1 }}>
                            {STATS_MODE === "hard" ? "AVG" : "Rt"} {prof ? fmtRt(prof) : "-"} ・ 01: {prof ? fmt01(prof) : "-"} / CR: {prof ? fmtCr(prof) : "-"}
                          </div>
                        </div>
                        <Btn
                          onClick={() => {
                            UI.tick();
                            clearSlot(i);
                          }}
                          style={{ padding: "5px 10px", fontSize: 12, color: C.creamDim }}
                        >
                          ✕
                        </Btn>
                      </>
                    ) : (
                      <>
                        <input
                          value={p.name}
                          onChange={(e) => setName(i, e.target.value)}
                          maxLength={12}
                          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: C.cream, fontFamily: FONT_BODY, fontSize: 15, outline: "none" }}
                        />
                        <Btn
                          onClick={() => {
                            UI.modal();
                            setPickerFor(i);
                          }}
                          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 700 }}
                        >
                          選ぶ
                        </Btn>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {cat === "robo" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(139,92,246,0.10)", border: `1px solid ${TH.accent}66`, borderRadius: 12, padding: "8px 10px", marginTop: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: "#fff", background: C.surface2, flexShrink: 0, border: `1px solid ${C.line}` }}>
                  2
                </div>
                <Avatar avatar={{ kind: "emoji", emoji: "🤖", color: "#8B5CF6" }} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.cream }}>ROBO Lv.{roboLv}</div>
                  <div style={{ fontSize: 10, color: C.creamDim, marginTop: 1 }}>
                    {roboRtText(roboLv)} ・ {roboStatText(roboLv)}
                  </div>
                </div>
                <div style={{ fontSize: 10, fontFamily: FONT_DISPLAY, letterSpacing: "0.1em", color: TH.accent, fontWeight: 700, padding: "0 4px" }}>CPU</div>
              </div>
            )}
            <div style={{ fontSize: 10.5, color: C.creamDim, margin: "8px 2px 0", lineHeight: 1.6 }}>
              「選ぶ」で登録プレイヤーを設定すると、スタッツとレーティング(Rt)が自動で記録されます
            </div>

            {pickerFor != null && (
              <ProfilePicker
                profiles={profiles}
                usedIds={names.map((p) => p.pid).filter(Boolean)}
                accent={TH.accent}
                onPick={(prof) => {
                  assignProfile(pickerFor, prof);
                  setPickerFor(null);
                }}
                onCreate={() => setEditing({ forSlot: pickerFor })}
                onEdit={(prof) => setEditing({ profile: prof })}
                onDelete={(id) => {
                  deleteProfile(id);
                  setNames((ns) => ns.map((p, j) => (p.pid === id ? { name: `プレイヤー ${j + 1}`, pid: null, avatar: null } : p)));
                }}
                onClose={() => setPickerFor(null)}
              />
            )}
            {editing && (
              <ProfileEditor
                initial={editing.profile || null}
                accent={TH.accent}
                onSave={(prof) => {
                  upsertProfile(prof);
                  if (editing.forSlot != null) assignProfile(editing.forSlot, prof);
                  else setNames((ns) => ns.map((p) => (p.pid === prof.id ? { name: prof.name, pid: prof.id, avatar: prof.avatar } : p)));
                  setEditing(null);
                  setPickerFor(null);
                }}
                onClose={() => setEditing(null)}
              />
            )}
            <FlowNav
              accent={TH.accent}
              onBack={() => {
                UI.back();
                setStep(0);
              }}
              onNext={() => {
                UI.nav();
                setStep(2);
              }}
            />
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, letterSpacing: "0.08em", color: TH.accent }}>{gameTitle}</div>
              <div style={{ fontSize: 12, color: C.creamDim, marginTop: 6, lineHeight: 1.8 }}>
                {limit > 0 ? `${limit} ROUNDS` : "ラウンド無制限"}
                {kind !== "cricket" && ` ・ BULL ${sepaBull ? "25/50" : "50/50"}`}
                {(kind === "01" || kind === "match") && ` ・ IN ${inRule === "double" ? "DOUBLE" : "OPEN"} ・ OUT ${outRule === "double" ? "DOUBLE" : outRule === "master" ? "MASTER" : "OPEN"}`}
                {teamLocked && " ・ 2vs2 チーム戦"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {(cat === "robo" ? fullPlayers() : names).map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.cream, background: C.surface2, borderRadius: 8, padding: "4px 9px 4px 5px" }}>
                    <Avatar avatar={p.avatar} size={20} />
                    {teamLocked ? `${i % 2 === 0 ? "A" : "B"}: ` : ""}
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {kind !== "cricket" && kind !== "atc" && kind !== "bob" && kind !== "p121" && kind !== "crcu" && kind !== "halfit" && kind !== "shoot" && (
              <Btn
                onClick={() => {
                  UI.modal();
                  setOptOpen(true);
                }}
                style={{ width: "100%", marginTop: 12, fontFamily: FONT_DISPLAY, letterSpacing: "0.15em" }}
              >
                ⚙ GAME OPTION
              </Btn>
            )}
            {(kind === "atc" || kind === "bob" || kind === "p121" || kind === "crcu" || kind === "halfit" || kind === "shoot") && (
              <div style={{ fontSize: 10.5, color: C.creamDim, marginTop: 12, lineHeight: 1.7, textAlign: "center" }}>
                {kind === "atc"
                  ? "ルール固定: シングル=1つ / ダブル=2つ / トリプル=3つ進む"
                  : kind === "bob"
                  ? "ルール固定: 各ダブルに3投 ・ 全外しで減点 ・ 0未満で即終了"
                  : kind === "p121"
                  ? "ルール固定: ダブルアウト ・ 1挑戦=9投 ・ 成功+1 / 失敗-1 ・ 全10挑戦"
                  : kind === "crcu"
                  ? "ルール固定: 8ラウンド ・ ターゲット順 20→…→15→ブル×2 ・ 刺さった点数を加算(T20=60)"
                  : kind === "shoot"
                  ? "ルール固定: 8R ・ 得点=刺さった点数×開いたエリア数 ・ 全21エリア開拓でブル復活(×21)"
                  : "ルール固定: 開始40点 ・ 9ラウンド ・ 全外しで半減(切り上げ)"}
              </div>
            )}

            <button
              onClick={() => launch(fullPlayers())}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "17px 0",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: TH.accent,
                color: "#fff",
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.2em",
              }}
            >
              GAME START
            </button>
            {(names.length > 1 || cat === "robo") && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Btn onClick={doShuffle} style={{ flex: 1, fontFamily: FONT_DISPLAY, letterSpacing: "0.06em", fontSize: 13.5 }}>
                  🔀 SHUFFLE START
                </Btn>
                {cat !== "robo" && (
                  <Btn
                    onClick={() => {
                      UI.modal();
                      setCorkOpen(true);
                    }}
                    style={{ flex: 1, fontFamily: FONT_DISPLAY, letterSpacing: "0.06em", fontSize: 13.5 }}
                  >
                    ◎ CORK START
                  </Btn>
                )}
              </div>
            )}
            <FlowNav
              accent={TH.accent}
              onBack={() => {
                UI.back();
                setStep(1);
              }}
            />

            {optOpen && (
              <OptionModal
                kind={kind === "match" ? "01" : kind}
                accent={TH.accent}
                outRule={outRule}
                setOutRule={setOutRule}
                inRule={inRule}
                setInRule={setInRule}
                sepaBull={sepaBull}
                setSepaBull={setSepaBull}
                onClose={() => {
                  UI.close();
                  setOptOpen(false);
                }}
              />
            )}

            {corkOpen && (
              <CorkModal
                players={names.map(trimP)}
                mode={mode}
                accent={TH.accent}
                teamLocked={teamLocked}
                onDone={(ns) => launch(ns)}
                onClose={() => setCorkOpen(false)}
              />
            )}

            {shuffled && (
              <div
                style={{ position: "fixed", inset: 0, background: "rgba(8,9,12,0.88)", zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
              >
                <div style={{ width: "100%", maxWidth: 420, background: C.surface, border: `1.5px solid ${TH.accent}`, borderRadius: 18, padding: "20px 18px" }}>
                  <div style={{ textAlign: "center", fontFamily: FONT_DISPLAY, fontSize: 15, letterSpacing: "0.25em", color: TH.accent }}>SHUFFLE RESULT</div>
                  <div style={{ textAlign: "center", fontSize: 12, color: C.creamDim, marginTop: 4, marginBottom: 14 }}>投げ順が決まりました!</div>
                  <div key={shuffled.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {shuffled.players.map((p, i) => (
                      <div
                        key={i}
                        className="shufflerow"
                        style={{
                          animationDelay: `${i * 0.18}s`,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: i === 0 ? `linear-gradient(0deg, ${TH.soft}, ${TH.soft}), ${C.surface}` : C.surface2,
                          border: `1.5px solid ${i === 0 ? TH.accent : "transparent"}`,
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: i === 0 ? TH.accent : C.creamDim, width: 26, textAlign: "center" }}>{i + 1}</div>
                        <Avatar avatar={p.avatar} size={26} />
                        <div style={{ flex: 1, fontSize: 15, fontWeight: i === 0 ? 700 : 400, color: C.cream }}>
                          {teamLocked ? `[${i % 2 === 0 ? "A" : "B"}] ` : ""}
                          {p.name}
                        </div>
                        {i === 0 && <div style={{ fontSize: 11, fontFamily: FONT_DISPLAY, letterSpacing: "0.15em", color: TH.accent }}>FIRST THROW</div>}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => launch(shuffled.players)}
                    style={{ marginTop: 16, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", background: TH.accent, color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, letterSpacing: "0.15em" }}
                  >
                    この順番でスタート →
                  </button>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Btn onClick={doShuffle} style={{ flex: 1, fontSize: 13 }}>
                      🔀 もう一度
                    </Btn>
                    <Btn
                      onClick={() => {
                        UI.close();
                        setShuffled(null);
                      }}
                      style={{ flex: 1, fontSize: 13, color: C.creamDim }}
                    >
                      キャンセル
                    </Btn>
                  </div>
                </div>
              </div>
            )}
            )}
          </>
        )}
      </div>
    </div>
  );
}
