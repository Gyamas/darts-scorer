import { useState } from "react";
import { CATS, GAMES } from "../constants.js";
import { AVATAR_COLORS, AVATAR_EMOJIS, EMPTY_STATS, RATING_MODE, STATS_MODE, dartsOf, ensure80, ensureModes, flightOf, fmt01, fmtCr, fmtRt, hardAvg, profileRating, profileRatingPx, ratingDisplay, rtFrom01, rtFromCr, setStatsMode, statsFor, withStatsMode } from "../profiles.js";
import { UI } from "../sound.js";
import { C, FONT_BODY, FONT_DISPLAY } from "../theme.js";
import { Avatar, Btn, RatingModeToggle, StatCard } from "../ui/kit.jsx";


export function PlayersScreen({ profiles, upsertProfile, deleteProfile, ratingMode, onRatingMode, appMode, onHome }) {
  const accent = C.brass;
  const [viewMode, setViewMode] = useState(appMode || "soft"); // ソフト/ハードどちらの成績を見るか
  setStatsMode(viewMode); // この画面のレンダリング中は選択ビューのスタッツを参照
  const hv = viewMode === "hard";
  const [selId, setSelId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const prof = selId ? profiles.find((p) => p.id === selId) : null;

  const header = (title, onBack) => (
    <div style={{ background: accent, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={() => {
          UI.back();
          onBack();
        }}
        style={{ border: "1.5px solid rgba(0,0,0,0.55)", background: "transparent", color: "#1A1C20", borderRadius: 9, padding: "7px 10px", fontFamily: FONT_DISPLAY, fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", fontWeight: 700 }}
      >
        {prof ? "← BACK" : "⌂ HOME"}
      </button>
      <div style={{ color: "#1A1C20", fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, letterSpacing: "0.2em" }}>{title}</div>
    </div>
  );

  // ---- 詳細ビュー ----
  if (prof) {
    const s = statsFor(prof); // viewModeに応じたsoft/hard枝
    const cu = s.cu || { rounds: 0, points: 0, best: 0 };
    const px = ratingMode === "px";
    ensure80(s);
    const rd = ratingDisplay(prof);
    const ppr = s.s01.r80 ? s.s01.p80 / s.s01.r80 : null; // DL: 80%スタッツ
    const ppd = s.s01.rounds ? s.s01.points / dartsOf(s.s01) : null; // PX: 100%スタッツ
    const mpr = px || hv ? (s.cr.rounds ? s.cr.marks / s.cr.rounds : null) : s.cr.r80 ? s.cr.m80 / s.cr.r80 : null; // ハードは100%
    const avg = hardAvg(s);
    const coRate = s.s01.coAtt ? Math.round((s.s01.coHit / s.s01.coAtt) * 100) : null;
    const rt01 = !px && s.s01.rounds >= 3 ? rtFrom01(ppr) : null;
    const rtCr = !px && s.cr.rounds >= 3 ? rtFromCr(mpr) : null;
    const pxr = profileRatingPx(prof);
    const dlr = profileRating(prof);
    const hasRt = rd.text !== "-";
    // もう一方の方式を小さく併記
    const otherLine = px
      ? dlr != null
        ? `DARTSLIVE換算: Rt ${dlr.toFixed(2)}(${flightOf(dlr)} FLIGHT)`
        : null
      : pxr != null
      ? `PHOENIX換算: Rt ${pxr.rt}(${pxr.cls})`
      : null;
    const winRate = s.games ? Math.round((s.wins / s.games) * 100) : null;
    return (
      <div>
        {header("PLAYER DATA", () => setSelId(null))}
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 48px" }}>
          <div style={{ background: C.surface, border: `1.5px solid ${accent}`, borderRadius: 16, padding: "18px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar avatar={prof.avatar} size={72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 21, fontWeight: 700, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prof.name}</div>
              <div style={{ fontSize: 11, color: C.creamDim, marginTop: 3 }}>
                {s.games}試合 {s.wins}勝{winRate != null ? ` ・ 勝率${winRate}%` : ""}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9.5, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY }}>
                {hv ? "3-DARTS AVG" : <>RATING <span style={{ opacity: 0.7 }}>({px ? "PHOENIX" : "DARTSLIVE"})</span></>}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{rd.text}</div>
              {rd.badge && (
                <div style={{ marginTop: 4, fontSize: 11, fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: "0.12em", color: "#1A1C20", background: accent, borderRadius: 6, padding: "2px 8px", display: "inline-block" }}>
                  {rd.badge}
                  {px ? "" : " FLIGHT"}
                </div>
              )}
            </div>
          </div>
          {!hv && hasRt && otherLine && (
            <div style={{ fontSize: 10.5, color: C.creamDim, margin: "8px 2px 0", textAlign: "right" }}>{otherLine}</div>
          )}
          {/* 二刀流カード: ハードとソフトの顔を並べる */}
          {(() => {
            ensureModes(prof.stats);
            const hb = ensure80(prof.stats.hard);
            const sbb = ensure80(prof.stats.soft);
            const hAvg = hardAvg(hb);
            const hCo = hb.s01.coAtt ? Math.round((hb.s01.coHit / hb.s01.coAtt) * 100) : null;
            const sRd = withStatsMode("soft", () => ratingDisplay(prof));
            const sMpr = withStatsMode("soft", () => {
              const px2 = RATING_MODE === "px";
              return px2 ? (sbb.cr.rounds ? sbb.cr.marks / sbb.cr.rounds : null) : sbb.cr.r80 ? sbb.cr.m80 / sbb.cr.r80 : null;
            });
            if (!hb.games && !sbb.games) return null; // 両方未プレイなら出さない
            const half = (emoji, label, accent2, big, unit, badge, subParts, dim) => (
              <div style={{ flex: 1, minWidth: 0, padding: "11px 13px", background: `linear-gradient(0deg, ${accent2}14, ${accent2}14), ${C.surface}`, opacity: dim ? 0.55 : 1 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", color: accent2, fontFamily: FONT_DISPLAY, marginBottom: 5 }}>
                  {emoji} {label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: C.cream, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{big}</span>
                  <span style={{ fontSize: 9.5, color: C.creamDim, fontFamily: FONT_DISPLAY, letterSpacing: "0.1em" }}>{unit}</span>
                  {badge && (
                    <span style={{ fontSize: 9.5, fontFamily: FONT_DISPLAY, fontWeight: 700, letterSpacing: "0.1em", color: "#1A1C20", background: accent2, borderRadius: 5, padding: "1px 6px" }}>{badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 9.5, color: C.creamDim, marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subParts}</div>
              </div>
            );
            return (
              <div style={{ display: "flex", alignItems: "stretch", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}`, marginTop: 12 }}>
                {half(
                  "🎯",
                  "STEEL",
                  C.brass,
                  hAvg != null ? hAvg.toFixed(1) : "-",
                  "AVG",
                  null,
                  hb.games ? `CO ${hCo != null ? hCo + "%" : "-"} ・ 180×${hb.s01.t180 || 0} ・ ${hb.games}試合` : "未プレイ",
                  !hb.games
                )}
                <div style={{ width: 1, background: C.line }} />
                {half(
                  "🕹",
                  "SOFT",
                  "#4A90D9",
                  sRd.text,
                  sRd.label,
                  sRd.badge,
                  sbb.games ? `MPR ${sMpr != null ? sMpr.toFixed(2) : "-"} ・ ${sbb.games}試合` : "未プレイ",
                  !sbb.games
                )}
              </div>
            );
          })()}
          {!hasRt && (
            <div style={{ fontSize: 11, color: C.creamDim, margin: "8px 2px 0", lineHeight: 1.7 }}>
              {hv
                ? "アベレージはハードモードで01をプレイすると表示されます"
                : "Rtは01またはクリケットを3ラウンド以上プレイすると表示されます(目安値)"}
            </div>
          )}

          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY, margin: "20px 2px 8px" }}>01 GAMES</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {hv ? (
              <>
                <StatCard label="AVG" value={avg != null ? avg.toFixed(1) : "-"} sub={`3ダーツ平均 ・ ${s.s01.rounds}R`} accent={CATS["01"].accent} />
                <StatCard
                  label="FIRST 9"
                  value={s.s01.d9 ? ((s.s01.p9 / s.s01.d9) * 3).toFixed(1) : "-"}
                  sub="最初の9投の平均"
                />
                <StatCard
                  label="CHECKOUT"
                  value={coRate != null ? `${coRate}%` : "-"}
                  sub={s.s01.coAtt ? `${s.s01.coHit}/${s.s01.coAtt} 成功` : "D/Mアウトで計測"}
                  accent={C.brass}
                />
              </>
            ) : (
              <>
                <StatCard
                  label="01 STATS"
                  value={px ? (ppd != null ? ppd.toFixed(2) : "-") : ppr != null ? ppr.toFixed(1) : "-"}
                  sub={px ? "PPD(100%スタッツ)" : "PPR(80%スタッツ)"}
                  accent={CATS["01"].accent}
                />
                <StatCard label="ROUNDS" value={s.s01.rounds || "-"} sub="累計ラウンド" />
                <StatCard
                  label="RT(01)"
                  value={px ? (pxr && pxr.rt01 != null ? pxr.rt01 : "-") : rt01 != null ? rt01.toFixed(2) : "-"}
                  sub="01由来のRt"
                />
              </>
            )}
          </div>
          {hv && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
              <StatCard label="TON (100+)" value={s.s01.t100 + s.s01.t140 + s.s01.t180 || "-"} sub={`内訳 100+:${s.s01.t100} 140+:${s.s01.t140}`} />
              <StatCard label="180" value={s.s01.t180 || "-"} sub="ワンエイティ" accent={s.s01.t180 ? C.red : undefined} />
              <StatCard label="HIGH CO" value={s.s01.hiCo || "-"} sub="最高チェックアウト" accent={s.s01.hiCo >= 100 ? C.brass : undefined} />
            </div>
          )}

          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY, margin: "18px 2px 8px" }}>CRICKET</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <StatCard label="MPR" value={mpr != null ? mpr.toFixed(2) : "-"} sub={hv ? "MPR(100%)" : px ? "MPR(100%スタッツ)" : "MPR(80%スタッツ)"} accent={CATS.cricket.accent} />
            {hv && <StatCard label="FIRST 9" value={s.cr.r9 ? (s.cr.m9 / s.cr.r9).toFixed(2) : "-"} sub="最初の3R平均MPR" />}
            <StatCard label="ROUNDS" value={s.cr.rounds || "-"} sub="累計ラウンド" />
            {!hv && (
              <StatCard
                label="RT(CR)"
                value={px ? (pxr && pxr.rtCr != null ? pxr.rtCr : "-") : rtCr != null ? rtCr.toFixed(2) : "-"}
                sub="クリケット由来のRt"
              />
            )}
          </div>

          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.creamDim, fontFamily: FONT_DISPLAY, margin: "18px 2px 8px" }}>PRACTICE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatCard label="COUNT-UP" value={cu.best || "-"} sub="自己ベスト" accent={CATS.practice.accent} />
            <StatCard label="CU AVG / R" value={cu.rounds ? (cu.points / cu.rounds).toFixed(1) : "-"} sub={`累計${cu.rounds}ラウンド`} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            {hv ? (
              <>
                <StatCard label="ATC" value={s.pr && s.pr.atcBest ? `${s.pr.atcBest}投` : "-"} sub="完走の最少投数" />
                <StatCard label="BOB'S 27" value={s.pr && s.pr.bobBest ? s.pr.bobBest : "-"} sub="ハイスコア" />
                <StatCard label="121" value={s.pr && s.pr.p121Best ? s.pr.p121Best : "-"} sub="最高到達点" accent={s.pr && s.pr.p121Best >= 121 ? C.brass : undefined} />
              </>
            ) : (
              <>
                <StatCard label="SHOOT OUT" value={s.pr && s.pr.shootBest ? s.pr.shootBest : "-"} sub="ハイスコア" />
                <StatCard label="CR CU" value={s.pr && s.pr.crcuBest ? s.pr.crcuBest : "-"} sub="クリカン最高マーク" />
                <StatCard label="HALF-IT" value={s.pr && s.pr.halfBest ? s.pr.halfBest : "-"} sub="ハイスコア" />
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <Btn
              onClick={() => {
                UI.modal();
                setEditing(prof);
              }}
              style={{ flex: 1, fontWeight: 700 }}
            >
              ✎ 編集
            </Btn>
            <Btn
              onClick={() => {
                UI.tick();
                setDelConfirm(!delConfirm);
              }}
              style={{ flex: 1, color: C.creamDim }}
            >
              🗑 削除
            </Btn>
          </div>
          {delConfirm && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: C.surface, border: `1px solid ${C.red}`, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ flex: 1, fontSize: 12, color: C.red }}>スタッツごと完全に削除します。よろしいですか?</div>
              <Btn
                onClick={() => {
                  UI.back();
                  setDelConfirm(false);
                  setSelId(null);
                  deleteProfile(prof.id);
                }}
                style={{ padding: "6px 14px", fontSize: 12, background: C.red, border: "none", color: "#fff" }}
              >
                削除する
              </Btn>
            </div>
          )}

          {editing && (
            <ProfileEditor
              initial={editing}
              accent={accent}
              onSave={(p) => {
                upsertProfile(p);
                setEditing(null);
              }}
              onClose={() => setEditing(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // ---- 一覧ビュー ----
  return (
    <div>
      {header("PLAYER DATA", onHome)}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 48px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[
              ["hard", "🎯 ハードダーツ", "AVG ・ チェックアウト率"],
              ["soft", "🟦 ソフトダーツ", `Rt ・ ${ratingMode === "px" ? "100%" : "80%"}スタッツ`],
            ].map(([m, label, sub]) => (
              <button
                key={m}
                onClick={() => {
                  UI.toggle();
                  setViewMode(m);
                }}
                style={{
                  flex: 1,
                  padding: "9px 0 7px",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "center",
                  color: viewMode === m ? "#fff" : C.creamDim,
                  background: viewMode === m ? C.surface2 : C.surface,
                  border: `1.5px solid ${viewMode === m ? C.cream : C.line}`,
                }}
              >
                <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 9, marginTop: 1, opacity: 0.8 }}>{sub}</div>
              </button>
            ))}
          </div>
          {!hv && <RatingModeToggle ratingMode={ratingMode} onRatingMode={onRatingMode} />}
          {hv && (
            <div style={{ fontSize: 10, color: C.creamDim, margin: "0 2px" }}>
              ハードダーツの成績はソフトとは別に記録されます(レーティングではなく3ダーツアベレージで表示)
            </div>
          )}
        </div>
        {profiles.length === 0 && (
          <div style={{ fontSize: 13, color: C.creamDim, textAlign: "center", padding: "28px 0", lineHeight: 1.9 }}>
            登録プレイヤーがまだいません。
            <br />
            登録して対戦すると、スタッツとRtがここに貯まっていきます。
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {profiles.map((p) => {
            const rd = ratingDisplay(p);
            return (
              <button
                key={p.id}
                onClick={() => {
                  UI.tap();
                  setSelId(p.id);
                }}
                style={{ display: "flex", alignItems: "center", gap: 12, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 12px", cursor: "pointer", textAlign: "left" }}
              >
                <Avatar avatar={p.avatar} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: C.creamDim, marginTop: 2 }}>
                    01: {fmt01(p)} ・ CR: {fmtCr(p)} ・ {statsFor(p).games}試合 {statsFor(p).wins}勝
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", color: C.creamDim, fontFamily: FONT_DISPLAY }}>
                    {rd.label}
                    {rd.badge ? ` ・ ${rd.badge}` : ""}
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>{rd.text}</div>
                </div>
                <div style={{ color: C.creamDim, fontSize: 16 }}>›</div>
              </button>
            );
          })}
        </div>
        <Btn
          onClick={() => {
            UI.modal();
            setEditing({});
          }}
          style={{ width: "100%", marginTop: 14, fontWeight: 700 }}
        >
          ＋ 新規プレイヤーを登録
        </Btn>

        {editing && (
          <ProfileEditor
            initial={editing.id ? editing : null}
            accent={accent}
            onSave={(p) => {
              upsertProfile(p);
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        )}
      </div>
    </div>
  );
}


export function ProfileEditor({ initial, accent, onSave, onClose }) {
  const [name, setName] = useState(initial ? initial.name : "");
  const [tab, setTab] = useState(initial && initial.avatar && initial.avatar.kind === "photo" ? "photo" : "emoji");
  const [emoji, setEmoji] = useState(initial && initial.avatar && initial.avatar.kind === "emoji" ? initial.avatar.emoji : "🎯");
  const [color, setColor] = useState(initial && initial.avatar && initial.avatar.kind === "emoji" ? initial.avatar.color : AVATAR_COLORS[0]);
  const [photo, setPhoto] = useState(initial && initial.avatar && initial.avatar.kind === "photo" ? initial.avatar.data : null);
  const avatar = tab === "photo" && photo ? { kind: "photo", data: photo } : { kind: "emoji", emoji, color };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const sz = 96;
        c.width = sz;
        c.height = sz;
        const ctx = c.getContext("2d");
        const m = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, sz, sz);
        setPhoto(c.toDataURL("image/jpeg", 0.82));
        setTab("photo");
        UI.tap();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  };

  const save = () => {
    if (!name.trim()) return;
    UI.tap();
    onSave({
      id: initial ? initial.id : `p_${Date.now()}`,
      name: name.trim(),
      avatar,
      stats: initial ? initial.stats : EMPTY_STATS(),
      createdAt: initial ? initial.createdAt : Date.now(),
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(8,9,12,0.92)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 14, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: C.surface, border: `1.5px solid ${accent}`, borderRadius: 18, padding: "18px 16px", margin: "auto 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, letterSpacing: "0.2em", color: accent }}>{initial ? "EDIT PLAYER" : "NEW PLAYER"}</div>
          <Btn
            onClick={() => {
              UI.close();
              onClose();
            }}
            style={{ padding: "4px 12px", fontSize: 13, color: C.creamDim }}
          >
            ✕
          </Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <Avatar avatar={avatar} size={64} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            placeholder="プレイヤー名"
            style={{ flex: 1, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 12px", color: C.cream, fontFamily: FONT_BODY, fontSize: 16, outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[
            ["emoji", "絵文字"],
            ["photo", "写真"],
          ].map(([t, label]) => (
            <button
              key={t}
              onClick={() => {
                UI.toggle();
                setTab(t);
              }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: tab === t ? C.cream : C.creamDim, background: tab === t ? C.surface2 : "transparent", border: `1.5px solid ${tab === t ? accent : C.line}` }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "emoji" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, marginTop: 12 }}>
              {AVATAR_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    UI.tick();
                    setEmoji(em);
                  }}
                  style={{ fontSize: 19, padding: "5px 0", borderRadius: 8, cursor: "pointer", background: emoji === em ? C.surface2 : "transparent", border: `1.5px solid ${emoji === em ? accent : "transparent"}`, lineHeight: 1.3 }}
                >
                  {em}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "space-between" }}>
              {AVATAR_COLORS.map((cl) => (
                <button
                  key={cl}
                  onClick={() => {
                    UI.tick();
                    setColor(cl);
                  }}
                  style={{ flex: 1, height: 30, borderRadius: 8, cursor: "pointer", background: cl, border: `2.5px solid ${color === cl ? "#fff" : "transparent"}` }}
                />
              ))}
            </div>
          </>
        ) : (
          <label
            style={{ display: "block", marginTop: 12, padding: "20px 0", borderRadius: 12, border: `1.5px dashed ${C.line}`, textAlign: "center", color: C.creamDim, fontSize: 13, cursor: "pointer" }}
          >
            📷 写真を選ぶ(自動で正方形に切り抜き)
            <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </label>
        )}

        <button
          onClick={save}
          disabled={!name.trim()}
          style={{ marginTop: 16, width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: name.trim() ? "pointer" : "default", opacity: name.trim() ? 1 : 0.4, background: accent, color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: "0.15em" }}
        >
          保存
        </button>
      </div>
    </div>
  );
}


export function ProfilePicker({ profiles, usedIds, accent, onPick, onCreate, onEdit, onDelete, onClose }) {
  const [delId, setDelId] = useState(null);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(8,9,12,0.92)", zIndex: 58, display: "flex", alignItems: "center", justifyContent: "center", padding: 14, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, maxHeight: "88vh", overflowY: "auto", background: C.surface, border: `1.5px solid ${accent}`, borderRadius: 18, padding: "18px 14px", margin: "auto 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, letterSpacing: "0.2em", color: accent }}>PLAYER SELECT</div>
          <Btn
            onClick={() => {
              UI.close();
              onClose();
            }}
            style={{ padding: "4px 12px", fontSize: 13, color: C.creamDim }}
          >
            ✕
          </Btn>
        </div>

        {profiles.length === 0 && (
          <div style={{ fontSize: 13, color: C.creamDim, textAlign: "center", padding: "16px 0", lineHeight: 1.8 }}>
            登録プレイヤーがまだいません。
            <br />
            登録するとスタッツとRtが記録されます。
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {profiles.map((prof) => {
            const used = usedIds.includes(prof.id);
            return (
              <div key={prof.id} style={{ background: C.surface2, borderRadius: 12, padding: "9px 10px", opacity: used ? 0.45 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => {
                      if (used) return;
                      UI.tap();
                      onPick(prof);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, background: "transparent", border: "none", cursor: used ? "default" : "pointer", textAlign: "left", padding: 0 }}
                  >
                    <Avatar avatar={prof.avatar} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {prof.name}
                        {used && <span style={{ fontSize: 10.5, color: C.creamDim, marginLeft: 6 }}>(選択済み)</span>}
                      </div>
                      <div style={{ fontSize: 10.5, color: C.creamDim, marginTop: 2 }}>
                        01: {fmt01(prof)} ・ CR: {fmtCr(prof)} ・ {statsFor(prof).games}試合 {statsFor(prof).wins}勝
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.15em", color: C.creamDim, fontFamily: FONT_DISPLAY }}>{STATS_MODE === "hard" ? "AVG" : "RT"}</div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>{fmtRt(prof)}</div>
                    </div>
                  </button>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Btn
                      onClick={() => {
                        UI.modal();
                        onEdit(prof);
                      }}
                      style={{ padding: "3px 9px", fontSize: 11 }}
                    >
                      ✎
                    </Btn>
                    <Btn
                      onClick={() => {
                        UI.tick();
                        setDelId(delId === prof.id ? null : prof.id);
                      }}
                      style={{ padding: "3px 9px", fontSize: 11, color: C.creamDim }}
                    >
                      🗑
                    </Btn>
                  </div>
                </div>
                {delId === prof.id && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.line}` }}>
                    <div style={{ flex: 1, fontSize: 11.5, color: C.red }}>スタッツごと削除します。よろしいですか?</div>
                    <Btn
                      onClick={() => {
                        UI.back();
                        setDelId(null);
                        onDelete(prof.id);
                      }}
                      style={{ padding: "5px 12px", fontSize: 12, background: C.red, border: "none", color: "#fff" }}
                    >
                      削除
                    </Btn>
                    <Btn
                      onClick={() => {
                        UI.tick();
                        setDelId(null);
                      }}
                      style={{ padding: "5px 12px", fontSize: 12 }}
                    >
                      やめる
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Btn
          onClick={() => {
            UI.modal();
            onCreate();
          }}
          style={{ width: "100%", marginTop: 12, fontFamily: FONT_BODY, fontWeight: 700 }}
        >
          ＋ 新規プレイヤーを登録
        </Btn>
      </div>
    </div>
  );
}
