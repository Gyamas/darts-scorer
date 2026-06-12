import { useState, useEffect } from "react";
import { AVATAR_COLORS } from "../profiles.js";
import { UI } from "../sound.js";
import { C, FONT_BODY, FONT_DISPLAY } from "../theme.js";


// ---------- small UI pieces ----------
export function Mark({ n }) {
  const common = { stroke: C.cream, strokeWidth: 2.4, strokeLinecap: "round", fill: "none" };
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, opacity: n === 0 ? 0.12 : 1 }}>
      {n === 0 && <circle cx="12" cy="12" r="8" {...common} />}
      {n >= 1 && <line x1="6" y1="18" x2="18" y2="6" {...common} />}
      {n >= 2 && <line x1="6" y1="6" x2="18" y2="18" {...common} />}
      {n >= 3 && <circle cx="12" cy="12" r="9.5" {...common} stroke={C.brass} />}
    </svg>
  );
}


export function Btn({ children, onClick, style, disabled, sfx }) {
  return (
    <button
      data-sfx={sfx}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FONT_BODY,
        fontWeight: 500,
        border: `1px solid ${C.line}`,
        background: C.surface2,
        color: C.cream,
        borderRadius: 10,
        padding: "10px 14px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}


export function CatIcon({ cat, color }) {
  const s = { stroke: color, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  if (cat === "01")
    return (
      <svg viewBox="0 0 32 32" style={{ width: 30, height: 30 }}>
        <circle cx="19" cy="13" r="9" {...s} />
        <circle cx="19" cy="13" r="3.5" {...s} />
        <path d="M4 28 L13.5 18.5" {...s} />
        <path d="M4 28 L4 22.5 M4 28 L9.5 28" {...s} />
      </svg>
    );
  if (cat === "countup")
    return (
      <svg viewBox="0 0 32 32" style={{ width: 30, height: 30 }}>
        <path d="M5 27 L5 20 M12 27 L12 15 M19 27 L19 10" {...s} />
        <path d="M22 9 L27 4 M27 4 L27 9.5 M27 4 L21.5 4" {...s} />
      </svg>
    );
  if (cat === "match")
    return (
      <svg viewBox="0 0 32 32" style={{ width: 30, height: 30 }}>
        <path d="M16 4 L19.6 11.5 L28 12.7 L22 18.5 L23.4 26.8 L16 22.9 L8.6 26.8 L10 18.5 L4 12.7 L12.4 11.5 Z" {...s} />
      </svg>
    );
  if (cat === "practice")
    return (
      <svg viewBox="0 0 32 32" style={{ width: 30, height: 30 }}>
        {/* ダンベル: 練習・トレーニング */}
        <path d="M11.5 16 L20.5 16" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <rect x="6" y="10" width="4.5" height="12" rx="1.6" stroke={color} strokeWidth="2.2" fill="none" />
        <rect x="21.5" y="10" width="4.5" height="12" rx="1.6" stroke={color} strokeWidth="2.2" fill="none" />
        <path d="M3 13 L3 19 M29 13 L29 19" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (cat === "robo")
    return (
      <svg viewBox="0 0 32 32" style={{ width: 30, height: 30 }}>
        <rect x="7" y="11" width="18" height="14" rx="3" {...s} />
        <path d="M16 11 L16 6" {...s} />
        <circle cx="16" cy="5" r="1.6" {...s} />
        <circle cx="12.5" cy="17" r="1.6" {...s} />
        <circle cx="19.5" cy="17" r="1.6" {...s} />
        <path d="M12.5 21.5 L19.5 21.5" {...s} />
      </svg>
    );
  return (
    <svg viewBox="0 0 32 32" style={{ width: 30, height: 30 }}>
      <path d="M3 21 L10 11" {...s} />
      <path d="M13 11 L20 21 M20 11 L13 21" {...s} />
      <circle cx="27" cy="16" r="5" {...s} />
      <path d="M24 19 L30 13" {...s} />
    </svg>
  );
}


export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 12, padding: "12px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 9.5, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY }}>{label}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: accent || C.cream, marginTop: 4, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: C.creamDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}


export function RatingModeToggle({ ratingMode, onRatingMode }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          ["dl", "DARTSLIVE方式", "Rt 1〜18 ・ フライト"],
          ["px", "PHOENIX方式", "Rt 1〜30 ・ クラス"],
        ].map(([m, label, sub]) => (
          <button
            key={m}
            onClick={() => {
              UI.toggle();
              onRatingMode(m);
            }}
            style={{
              flex: 1,
              padding: "9px 0 7px",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "center",
              color: ratingMode === m ? "#1A1C20" : C.creamDim,
              background: ratingMode === m ? C.brass : C.surface,
              border: `1.5px solid ${ratingMode === m ? C.brass : C.line}`,
            }}
          >
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 9, marginTop: 1, opacity: 0.8 }}>{sub}</div>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: C.creamDim, margin: "6px 2px 0" }}>換算方式の表示切替です。記録データは共通なのでいつでも変更できます</div>
    </div>
  );
}


export function Stepper({ accent, step, onHome }) {
  const steps = ["GAME SELECT", "PLAYER SELECT", "GAME START"];
  return (
    <div style={{ background: accent, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={onHome}
        style={{
          border: "1.5px solid rgba(255,255,255,0.9)",
          background: "transparent",
          color: "#fff",
          borderRadius: 9,
          padding: "7px 10px",
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          letterSpacing: "0.08em",
          cursor: "pointer",
          lineHeight: 1.2,
        }}
      >
        ⌂ HOME
      </button>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i === 0 ? "0 1 auto" : "1 1 auto" }}>
            {i > 0 && <div style={{ flex: 1, height: 1.5, background: "rgba(255,255,255,0.5)", margin: "0 8px", minWidth: 8 }} />}
            <div
              style={{
                color: "#fff",
                opacity: i === step ? 1 : 0.5,
                fontFamily: FONT_DISPLAY,
                fontSize: i === step ? 13 : 9.5,
                fontWeight: i === step ? 700 : 500,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export function FlowNav({ accent, onBack, onNext, nextLabel }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
      {onBack ? (
        <Btn onClick={onBack} style={{ flex: 1, fontFamily: FONT_DISPLAY, letterSpacing: "0.12em" }}>
          ← BACK
        </Btn>
      ) : null}
      {onNext ? (
        <button
          onClick={onNext}
          style={{
            flex: 2,
            padding: "13px 0",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            background: accent,
            color: "#fff",
            fontFamily: FONT_DISPLAY,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "0.16em",
          }}
        >
          {nextLabel || "NEXT →"}
        </button>
      ) : null}
    </div>
  );
}


export function OptionChips({ value, options, onChange, accent }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(([v, label, sub]) => (
        <button
          key={String(v)}
          onClick={() => {
            UI.tick();
            onChange(v);
          }}
          style={{
            flex: 1,
            padding: sub ? "8px 0 6px" : "10px 0",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: FONT_BODY,
            color: value === v ? "#fff" : C.creamDim,
            background: value === v ? accent : C.surface2,
            border: "none",
            lineHeight: 1.3,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{label}</div>
          {sub && <div style={{ fontSize: 9.5, opacity: 0.85 }}>{sub}</div>}
        </button>
      ))}
    </div>
  );
}


export function Avatar({ avatar, size = 36 }) {
  const r = Math.round(size * 0.28);
  if (avatar && avatar.kind === "photo" && avatar.data)
    return <img src={avatar.data} alt="" style={{ width: size, height: size, borderRadius: r, objectFit: "cover", flexShrink: 0, display: "block" }} />;
  if (avatar && avatar.kind === "emoji")
    return (
      <div style={{ width: size, height: size, borderRadius: r, background: avatar.color || AVATAR_COLORS[0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, flexShrink: 0, lineHeight: 1 }}>
        {avatar.emoji}
      </div>
    );
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: C.surface2, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.55, height: size * 0.55 }}>
        <circle cx="12" cy="8.5" r="3.6" fill="none" stroke={C.creamDim} strokeWidth="1.8" />
        <path d="M5 20 C5 15.5 19 15.5 19 20" fill="none" stroke={C.creamDim} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}


export const PLAYER_COLORS = ["#D3433B", "#2B50C9", "#2FA56C", "#C9A035"];


// 画面サイズ監視(縦横対応): 横長判定に使う
export function useViewport() {
  const [v, setV] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 800, h: typeof window !== "undefined" ? window.innerHeight : 600 });
  useEffect(() => {
    const f = () => setV({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", f);
    window.addEventListener("orientationchange", f);
    return () => {
      window.removeEventListener("resize", f);
      window.removeEventListener("orientationchange", f);
    };
  }, []);
  return v;
}
