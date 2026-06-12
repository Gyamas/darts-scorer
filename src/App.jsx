import { useState, useEffect } from "react";
import { CATS, deep, kindKey, medleySeq } from "./constants.js";
import { newGame } from "./engine/game.js";
import { ensureModes, loadProfiles, loadSettings, saveProfiles, saveSettings, setRatingModeGlobal, setStatsMode } from "./profiles.js";
import { Flow, GameOnSplash } from "./screens/flow.jsx";
import { Game } from "./screens/game.jsx";
import { Home } from "./screens/home.jsx";
import { ChoiceScreen, MatchResult } from "./screens/match.jsx";
import { PlayersScreen } from "./screens/players.jsx";
import { setSoundOn } from "./sound.js";
import { C, FONT_BODY, setAppTheme } from "./theme.js";


// ---------- app ----------
export default function DartsScorer() {
  const [mode, setMode] = useState("hard"); // メインターゲット=ハードダーツ
  setAppTheme(mode); // モードに応じてアプリ全体のテーマを切替(木目パブ調 ⇔ アーケード調)
  const [sound, setSound] = useState(true);
  const [screen, setScreen] = useState("home"); // home | flow | gameon | game
  const [flowCat, setFlowCat] = useState("01");
  const [game, setGame] = useState(null);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [savedGid, setSavedGid] = useState(null);
  const [match, setMatch] = useState(null); // メドレーマッチの進行状態
  const [ratingMode, setRatingMode] = useState("dl"); // レーティング表示方式

  useEffect(() => {
    loadProfiles().then(setProfiles);
    loadSettings().then((st) => {
      if (st.ratingMode) {
        setRatingModeGlobal(st.ratingMode);
        setRatingMode(st.ratingMode);
      }
    });
  }, []);
  setRatingModeGlobal(ratingMode); // レンダリングとグローバルを同期
  setStatsMode(mode); // 表示・計上スタッツを現在のプレイモード(ソフト/ハード)と同期
  const changeRatingMode = (m) => {
    setRatingModeGlobal(m);
    setRatingMode(m);
    saveSettings({ ratingMode: m });
  };

  const upsertProfile = (prof) => {
    setProfiles((ps) => {
      const exists = ps.some((p) => p.id === prof.id);
      const next = exists ? ps.map((p) => (p.id === prof.id ? prof : p)) : [...ps, prof];
      saveProfiles(next);
      return next;
    });
  };
  const deleteProfile = (id) => {
    setProfiles((ps) => {
      const next = ps.filter((p) => p.id !== id);
      saveProfiles(next);
      return next;
    });
  };

  // ゲーム終了時: 登録プレイヤーにスタッツを計上(1ゲーム1回)
  const onFinished = (g) => {
    if (!g.gid || savedGid === g.gid) return;
    setSavedGid(g.gid);
    setProfiles((ps) => {
      const next = deep(ps);
      g.players.forEach((_, i) => {
        const pid = g.profileIds && g.profileIds[i];
        if (!pid) return;
        const prof = next.find((p) => p.id === pid);
        if (!prof) return;
        const st = g.pstats[i];
        ensureModes(prof.stats);
        const ms = prof.stats[g.mode === "hard" ? "hard" : "soft"]; // プレイしたモードの枝にだけ計上(干渉なし)
        if (g.kind === "01") {
          ms.s01.rounds += st.rounds;
          ms.s01.points += st.points;
          ms.s01.darts = (ms.s01.darts || (ms.s01.rounds - st.rounds) * 3) + st.darts; // 旧データは近似で初期化
          ms.s01.r80 += st.r80;
          ms.s01.p80 += st.p80;
          ms.s01.coAtt += st.coAtt || 0;
          ms.s01.coHit += st.coHit || 0;
          ms.s01.t60 += st.t60 || 0;
          ms.s01.t100 += st.t100 || 0;
          ms.s01.t140 += st.t140 || 0;
          ms.s01.t180 += st.t180 || 0;
          ms.s01.p9 += st.p9 || 0;
          ms.s01.d9 += st.d9 || 0;
          ms.s01.r9 += st.r9 || 0;
          ms.s01.hiCo = Math.max(ms.s01.hiCo || 0, st.co || 0);
        } else if (g.kind === "countup") {
          ms.cu.rounds += st.rounds;
          ms.cu.points += st.points;
          ms.cu.best = Math.max(ms.cu.best || 0, g.scores[i] || 0);
        } else if (g.kind === "cricket") {
          ms.cr.rounds += st.rounds;
          ms.cr.marks += st.marks;
          ms.cr.r80 += st.r80;
          ms.cr.m80 += st.m80;
          ms.cr.m9 += st.m9 || 0;
          ms.cr.r9 += st.r9 || 0;
        } else if (g.kind === "atc") {
          if (g.atc[i] >= 22) ms.pr.atcBest = ms.pr.atcBest ? Math.min(ms.pr.atcBest, st.darts) : st.darts; // 完走時のみ・最少投数
        } else if (g.kind === "bob") {
          if (!g.bobOut[i]) ms.pr.bobBest = Math.max(ms.pr.bobBest || 0, g.scores[i]); // 完走スコア
        } else if (g.kind === "p121") {
          ms.pr.p121Best = Math.max(ms.pr.p121Best || 0, g.p121Best[i] || 0);
        } else if (g.kind === "crcu") {
          ms.pr.crcuBest = Math.max(ms.pr.crcuBest || 0, g.scores[i] || 0);
        } else if (g.kind === "halfit") {
          ms.pr.halfBest = Math.max(ms.pr.halfBest || 0, g.scores[i] || 0);
        } else if (g.kind === "shoot") {
          ms.pr.shootBest = Math.max(ms.pr.shootBest || 0, g.scores[i] || 0);
        }
        ms.games += 1;
        const won = g.teamCricket ? g.winners.includes(i % 2) : g.winners.includes(i);
        if (won) ms.wins += 1;
      });
      saveProfiles(next);
      return next;
    });
  };

  // マッチの1レグを開始(choiceKindはCHOICEレグで選んだゲーム)
  const beginLeg = (m, idx, choiceKind) => {
    const legType = m.seq[idx] === "choice" ? choiceKind : m.seq[idx];
    if (!legType) {
      setMatch({ ...m, cur: idx });
      setScreen("choice");
      return;
    }
    const order = idx % 2 === 0 ? [0, 1] : [1, 0]; // レグごとに先攻交代
    const b = m.base;
    const cfg = {
      type: legType,
      names: order.map((i) => b.names[i]),
      profileIds: order.map((i) => (b.profileIds ? b.profileIds[i] : null)),
      avatars: order.map((i) => (b.avatars ? b.avatars[i] : null)),
      mode: b.mode,
      outRule: b.outRule,
      inRule: b.inRule,
      sepaBull: b.sepaBull,
      teamCricket: false,
      robo: b.robo ? { lv: b.robo.lv, idx: order.indexOf(b.robo.idx) } : undefined,
    };
    const g = newGame(cfg);
    g.match = {
      legNo: idx + 1,
      total: m.legs,
      need: m.need,
      order,
      wins: order.map((i) => m.wins[i]), // レグ内の並び順に合わせたマッチスコア
      seqLabel: legType === "cricket" ? "CRICKET" : legType,
    };
    setMatch({ ...m, cur: idx });
    setConfig(cfg);
    setGame(g);
    setHistory([]);
    setScreen("gameon");
  };

  // レグ終了 → 勝敗反映して次へ(引き分けは同レグ再戦)
  const onNextLeg = (g) => {
    if (!match) return;
    if (g.winners.length === 1) {
      const orig = g.match.order[g.winners[0]];
      const wins = [...match.wins];
      wins[orig] += 1;
      const log = [...match.log, { kind: g.match.seqLabel, winner: orig, winnerName: match.base.names[orig] }];
      const m2 = { ...match, wins, log };
      setMatch(m2);
      if (wins[orig] >= match.need) {
        setGame(null);
        setHistory([]);
        setScreen("matchresult");
        return;
      }
      beginLeg(m2, match.cur + 1, null);
    } else {
      // 引き分け: 同じレグを同じゲームで再戦
      beginLeg(match, match.cur, match.seq[match.cur] === "choice" ? config.type : null);
    }
  };

  const startGame = (cfg) => {
    if (cfg.type === "match") {
      const m = {
        legs: cfg.legs,
        need: Math.ceil(cfg.legs / 2),
        seq: medleySeq(cfg.legs, cfg.zeroOne || (cfg.mode === "hard" ? "501" : "701"), cfg.mode),
        wins: [0, 0],
        cur: 0,
        log: [],
        base: cfg,
      };
      setMatch(m);
      beginLeg(m, 0, null);
      return;
    }
    setMatch(null);
    setConfig(cfg);
    setGame(newGame(cfg));
    setHistory([]);
    setScreen("gameon");
  };
  const restart = () => {
    setGame(newGame(config));
    setHistory([]);
    setScreen("gameon");
  };
  const goHome = () => {
    setScreen("home");
    setGame(null);
    setHistory([]);
    setMatch(null);
  };
  const toggleSound = () => {
    setSound((v) => {
      setSoundOn(!v);
      return !v;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        // ハードは背景レイヤーに木目(カードや文字の下に敷かれるので視認性に影響しない)
        backgroundImage:
          mode === "hard"
            ? "repeating-linear-gradient(88deg, rgba(255,214,150,0.05) 0px, rgba(0,0,0,0) 4px, rgba(0,0,0,0.06) 9px, rgba(0,0,0,0) 13px, rgba(255,214,150,0.035) 17px, rgba(0,0,0,0) 23px), repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 128px), radial-gradient(ellipse at 50% 12%, rgba(255,196,110,0.06), rgba(0,0,0,0) 55%), radial-gradient(ellipse at 50% 112%, rgba(0,0,0,0.38), rgba(0,0,0,0) 62%)"
            : undefined,
        backgroundAttachment: "fixed",
        fontFamily: FONT_BODY,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Bitter:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap');
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.brass}; outline-offset: 2px; }
        .seg { cursor: pointer; }
        .seg:active { filter: brightness(1.6); }
        .hitflash { animation: hitpop 0.85s ease-out forwards; }
        @keyframes hitpop {
          0% { transform: scale(0.3); opacity: 0; }
          18% { transform: scale(1.18); opacity: 1; }
          55% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.02); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .hitflash { animation: hitfade 0.85s linear forwards; } }
        @keyframes hitfade { 0% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
        .awardwrap { animation: awardfade 2.2s ease forwards; }
        .awardname { animation: awardzoom 2.2s cubic-bezier(.2,1.5,.3,1) forwards; }
        @keyframes awardfade { 0% { opacity: 0; } 8% { opacity: 1; } 78% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes awardzoom { 0% { transform: scale(0.25) rotate(-4deg); } 14% { transform: scale(1.18) rotate(1deg); } 24% { transform: scale(1) rotate(0deg); } 100% { transform: scale(1.04); } }
        .awardbanner { animation: awardslide 2.2s ease forwards; }
        @keyframes awardslide { 0% { transform: translate(-50%, -34px); opacity: 0; } 12% { transform: translate(-50%, 0); opacity: 1; } 80% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -8px); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .awardwrap, .awardname, .awardbanner { animation: hitfade 2.2s linear forwards; } }
        .shufflerow { animation: slidein 0.4s ease both; }
        @keyframes slidein { from { transform: translateX(-18px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .shufflerow { animation: none; } }
        .gameon { animation: gameonpop 0.7s cubic-bezier(.2,1.5,.3,1) both; }
        @keyframes gameonpop { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .gameon { animation: none; } }
        .dartanim { transform-box: fill-box; transform-origin: 50% 85%; animation: dartstick 0.16s ease-out both; }
        @keyframes dartstick { 0% { transform: scale(2.6); opacity: 0; } 60% { opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .dartanim { animation: none; } }
        .robopulse { animation: robopulse 1.1s ease-in-out infinite; }
        @keyframes robopulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @media (prefers-reduced-motion: reduce) { .robopulse { animation: none; } }`}</style>
      {screen === "home" && (
        <Home
          mode={mode}
          setMode={setMode}
          sound={sound}
          toggleSound={toggleSound}
          onPick={(k) => {
            setFlowCat(k);
            setScreen("flow");
          }}
          onPlayers={() => setScreen("players")}
        />
      )}
      {screen === "players" && (
        <PlayersScreen
          profiles={profiles}
          upsertProfile={upsertProfile}
          deleteProfile={deleteProfile}
          ratingMode={ratingMode}
          onRatingMode={changeRatingMode}
          appMode={mode}
          onHome={goHome}
        />
      )}
      {screen === "flow" && (
        <Flow
          key={flowCat + mode}
          cat={flowCat}
          mode={mode}
          profiles={profiles}
          upsertProfile={upsertProfile}
          deleteProfile={deleteProfile}
          onHome={goHome}
          onStart={startGame}
        />
      )}
      {screen === "choice" && match && <ChoiceScreen m={match} onPick={(t) => beginLeg(match, match.cur, t)} />}
      {screen === "matchresult" && match && (
        <MatchResult
          m={match}
          onHome={goHome}
          onRematch={() => {
            const m2 = { ...match, wins: [0, 0], cur: 0, log: [] };
            setMatch(m2);
            beginLeg(m2, 0, null);
          }}
        />
      )}
      {screen === "gameon" && game && (
        <GameOnSplash g={game} profiles={profiles} accent={CATS[kindKey(game.kind)].accent} onDone={() => setScreen("game")} />
      )}
      {screen === "game" && game && (
        <Game
          g={game}
          setG={setGame}
          history={history}
          setHistory={setHistory}
          onQuit={goHome}
          onRestart={restart}
          sound={sound}
          toggleSound={toggleSound}
          onFinished={onFinished}
          onNextLeg={onNextLeg}
        />
      )}
    </div>
  );
}
