"use strict";

// Nakshatra-based marriage compatibility (Girl star × Boy star → 0–36).
// Uses a 27×27 matrix. Same nakshatra = 0 (Nadi); Gana mismatch (Deva–Rakshasa) = reduced; else by distance.
// You can replace NAKSHATRA_SCORE_MATRIX with the exact table from your chart if you have the numbers.

// Gana: 0=Deva, 1=Manushya, 2=Rakshasa (for Ashtakoota Gana 6 points)
const GANA = [
  0, 1, 1, 1, 1, 2, 1, 0, 2, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0
  // Ashwini,Bharani,Krittika,Rohini,Mrigasira,Ardra,Punarvasu,Pushya,Ashlesha,Magha,P.Phalguni,U.Phalguni,Hasta,Chitra,Swati,Vishakha,Anuradha,Jyeshta,Mula,P.Ashadha,U.Ashadha,Shravana,Dhanishta,Shatabhisha,P.Bhadra,U.Bhadra,Revati
];

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
  // Same nakshatra → 0 (Nadi dosh)
  if (i === j) return 0;
  // Gana: Deva–Rakshasa = 0 points for Gana (6 lost)
  const ganaDeva = 0, ganaRakshasa = 2;
  const gi = GANA[i] ?? 1;
  const gj = GANA[j] ?? 1;
  if ((gi === ganaDeva && gj === ganaRakshasa) || (gi === ganaRakshasa && gj === ganaDeva)) {
    return Math.max(0, 36 - 6 - 8); // 22, or use a lower value if you prefer
  }
  // Cyclic distance (1–13)
  let diff = Math.abs(i - j);
  if (diff > 13) diff = 27 - diff;
  // 6th / 12th nakshatra apart (inimical) → lower score
  if (diff === 9 || diff === 18) return 8;
  // Scale by distance: 36 - 2*diff (so 34, 32, ..., 10)
  const raw = 36 - 2 * diff;
  return Math.max(0, Math.min(36, raw));
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
