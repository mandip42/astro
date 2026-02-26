"use strict";

// Simple Lagna-based compatibility on a 0–36 scale.
// Uses cyclic distance between Lagna signs as a proxy:
// score = max(0, 36 - 5 * minDiff), where minDiff is 0..6.

function computeLagnaCompatibilityScore(myLagnaIndex, partnerLagnaIndex) {
  if (
    !Number.isFinite(myLagnaIndex) ||
    !Number.isFinite(partnerLagnaIndex)
  ) {
    return null;
  }
  const a = ((myLagnaIndex % 12) + 12) % 12;
  const b = ((partnerLagnaIndex % 12) + 12) % 12;
  const diff = Math.abs(a - b);
  const minDiff = Math.min(diff, 12 - diff);
  const raw = 36 - 5 * minDiff;
  const clamped = Math.max(0, Math.min(36, raw));
  return Math.round(clamped);
}

function getBand(score) {
  if (score == null) return { key: "matchingBandUnknown" };
  if (score < 18) return { key: "matchingBandLow" };
  if (score < 25) return { key: "matchingBandAverage" };
  if (score < 32) return { key: "matchingBandGood" };
  return { key: "matchingBandExcellent" };
}

window.MarriageMatching = {
  computeLagnaCompatibilityScore,
  getBand,
};

