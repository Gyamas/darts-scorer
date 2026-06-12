import { HOME_TILES, SOON_CATS, catOf } from "../constants.js";
import { RATING_MODE } from "../profiles.js";
import { UI } from "../sound.js";
import { C, FONT_BODY, FONT_DISPLAY, setAppTheme } from "../theme.js";
import { Btn, CatIcon } from "../ui/kit.jsx";


export function Home({ mode, setMode, onPick, onPlayers, sound, toggleSound }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 48px", position: "relative" }}>
      <div style={{ position: "absolute", top: 22, right: 16 }}>
        <Btn onClick={toggleSound} style={{ padding: "6px 10px", fontSize: 13 }}>
          {sound ? "🔊" : "🔇"}
        </Btn>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: "0.12em", color: C.cream, lineHeight: 1 }}>
          DARTS<span style={{ color: C.red }}> SCORER</span>
        </div>
        <div style={{ color: C.creamDim, fontSize: 13, marginTop: 8, letterSpacing: "0.2em" }}>スコア記録アプリ</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        {[
          ["hard", "🎯 ハードダーツ"],
          ["soft", "🕹 ソフトダーツ"],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => {
              setAppTheme(m); // 押した先のモードの音色で鳴らす
              UI.toggle();
              setMode(m);
            }}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: FONT_BODY,
              fontSize: 14.5,
              fontWeight: 700,
              color: mode === m ? C.cream : C.creamDim,
              background: mode === m ? C.surface2 : C.surface,
              border: `1.5px solid ${mode === m ? C.brass : C.line}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: C.creamDim, margin: "0 2px 18px", lineHeight: 1.6 }}>
        {mode === "soft"
          ? `Rt・${RATING_MODE === "px" ? "100%" : "80%"}スタッツ ・ メドレーマッチ ・ アワード演出 ・ プロ試験練習`
          : "501ダブルアウト ・ AVG&アウト提案 ・ レグ戦マッチ ・ 180コール"}
      </div>

      <div style={{ fontSize: 13, color: C.creamDim, margin: "0 0 8px 2px" }}>ゲームカテゴリ</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {HOME_TILES.map((k) => {
          const ct = catOf(k);
          const soon = !!SOON_CATS[k];
          return (
            <button
              key={k}
              onClick={() => {
                if (soon) return;
                UI.tap();
                onPick(k);
              }}
              style={{
                position: "relative",
                textAlign: "left",
                padding: "16px 14px 14px",
                borderRadius: 14,
                cursor: soon ? "default" : "pointer",
                background: C.surface,
                border: `1.5px solid ${C.line}`,
                opacity: soon ? 0.55 : 1,
              }}
            >
              {soon && (
                <div style={{ position: "absolute", top: 10, right: 10, fontSize: 9.5, fontFamily: FONT_BODY, fontWeight: 700, color: "#1A1C20", background: C.brass, borderRadius: 6, padding: "2px 7px" }}>
                  準備中
                </div>
              )}
              <CatIcon cat={k} color={ct.accent} />
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, letterSpacing: "0.06em", color: ct.accent, marginTop: 8, lineHeight: 1.1 }}>
                {ct.label}
              </div>
              <div style={{ fontSize: 11.5, color: C.cream, marginTop: 2, fontFamily: FONT_BODY }}>{ct.jp}</div>
              <div style={{ fontSize: 9, color: C.creamDim, letterSpacing: "0.22em", fontFamily: FONT_DISPLAY, marginTop: 5 }}>{ct.tagline}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          UI.tap();
          onPlayers();
        }}
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", marginTop: 14, background: C.surface, border: `1.5px solid ${C.brass}`, borderRadius: 14, padding: "14px 14px", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(201,160,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "0.08em", color: C.brass }}>PLAYER DATA</div>
          <div style={{ fontSize: 11, color: C.creamDim, marginTop: 1 }}>登録プレイヤーの成績・Rt・スタッツを見る</div>
        </div>
        <div style={{ color: C.creamDim, fontSize: 16 }}>›</div>
      </button>
    </div>
  );
}
