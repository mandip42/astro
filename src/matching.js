"use strict";

// Nakshatra-based marriage compatibility (Girl star × Boy star → 0–36).
// Loads koota/scores.json from the chart in the koota folder; falls back to formula if not available.

let SCORE_MATRIX = null;
fetch("koota/scores.json")
  .then((r) => r.json())
  .then((data) => {
    if (Array.isArray(data) && data.length === 27 && data.every((row) => Array.isArray(row) && row.length === 27)) {
      SCORE_MATRIX = data;
    }
  })
  .catch(() => {});

// Gana: 0=Deva, 1=Manushya, 2=Rakshasa (fallback formula)
const GANA = [
  0, 1, 1, 1, 1, 2, 1, 0, 2, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0
];

function formulaScore(i, j) {
  if (i === j) return 0;
  const gi = GANA[i] ?? 1;
  const gj = GANA[j] ?? 1;
  if ((gi === 0 && gj === 2) || (gi === 2 && gj === 0)) return 22;
  let diff = Math.abs(i - j);
  if (diff > 13) diff = 27 - diff;
  if (diff === 9 || diff === 18) return 8;
  return Math.max(0, Math.min(36, 36 - 2 * diff));
}

function getNakshatraCompatibilityScore(girlNakIndex, boyNakIndex) {
  if (
    !Number.isFinite(girlNakIndex) ||
    !Number.isFinite(boyNakIndex) ||
    girlNakIndex < 0 || girlNakIndex > 26 ||
    boyNakIndex < 0 || boyNakIndex > 26
  ) {
    return null;
  }
  const i = girlNakIndex;
  const j = boyNakIndex;
  if (SCORE_MATRIX && SCORE_MATRIX[i] && Number.isFinite(SCORE_MATRIX[i][j])) {
    return SCORE_MATRIX[i][j];
  }
  return formulaScore(i, j);
}

function getBand(score) {
  if (score == null) return { key: "matchingBandUnknown" };
  if (score < 18) return { key: "matchingBandLow" };
  if (score < 25) return { key: "matchingBandAverage" };
  if (score < 32) return { key: "matchingBandGood" };
  return { key: "matchingBandExcellent" };
}

window.MarriageMatching = {
  getNakshatraCompatibilityScore: getNakshatraCompatibilityScore,
  getBand,
};
