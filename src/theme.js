import { useState, useEffect } from "react";


// ---------- design tokens (dartboard palette) ----------
// ソフト用テーマ: 現行のアーケード調(チャコール×クールグレー)
export const THEME_SOFT = {
  bg: "#14161A",
  surface: "#1E2127",
  surface2: "#272B33",
  line: "rgba(140,150,170,0.18)",
  cream: "#F2EAD8",
  creamDim: "#A8A294",
  red: "#D3433B",
  green: "#1F8A5A",
  brass: "#C9A035",
};

// ハード用テーマ: 英国パブ調(ウォルナット×サイザル×ボードの緑赤×真鍮)
export const THEME_HARD = {
  bg: "#26190E",
  surface: "#34230F",
  surface2: "#412D15",
  line: "rgba(218,184,124,0.24)",
  cream: "#F4E9CB",
  creamDim: "#BCA67E",
  red: "#C8503A",
  green: "#338a55",
  brass: "#DCB44C",
};

// 表示モードに応じてアプリ全体のパレットを切替(Appがレンダリングごとに同期)
export let C = THEME_HARD;

export let UI_HARD = true; // UI効果音もモード連動(ハード=木のノック音系)

export const setAppTheme = (mode) => {
  C = mode === "hard" ? THEME_HARD : THEME_SOFT;
  FONT_DISPLAY = mode === "hard" ? FONT_DISPLAY_HARD : FONT_DISPLAY_SOFT;
  UI_HARD = mode === "hard";
};


export const FONT_DISPLAY_SOFT = "'Oswald', sans-serif"; // アーケードのコンデンスド

export const FONT_DISPLAY_HARD = "'Bitter', 'Georgia', serif"; // パブ看板のスラブセリフ

export let FONT_DISPLAY = FONT_DISPLAY_HARD;

export const FONT_BODY = "'Noto Sans JP', sans-serif";
