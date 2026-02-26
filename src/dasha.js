"use strict";

const DASHA_SEQUENCE = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 }
];

function findDashaIndexForLord(lord) {
  return DASHA_SEQUENCE.findIndex(d => d.lord === lord);
}

function addYears(date, years) {
  const d = new Date(date.getTime());
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function computeVimshottariTimeline(birthDateUtc, moonNakshatraIndex, degreeWithinNakshatra) {
  const spanDeg = 13.3333333333;
  const fractionElapsed = degreeWithinNakshatra / spanDeg;
  const fractionRemaining = 1 - fractionElapsed;

  if (!window.VedicAstroEngine || !Array.isArray(window.VedicAstroEngine.NAKSHATRAS)) {
    return [];
  }

  // Guard against invalid / fractional indices and out-of-range values
  const rawIdx = Number.isFinite(moonNakshatraIndex) ? moonNakshatraIndex : 0;
  const clampedIdx = Math.max(
    0,
    Math.min(window.VedicAstroEngine.NAKSHATRAS.length - 1, Math.floor(rawIdx))
  );
  const nak = window.VedicAstroEngine.NAKSHATRAS[clampedIdx];
  if (!nak || !nak.lord) return [];

  const startIndex = findDashaIndexForLord(nak.lord);
  if (startIndex < 0) return [];

  const firstDasha = DASHA_SEQUENCE[startIndex];
  const firstYearsRemaining = firstDasha.years * fractionRemaining;

  const timeline = [];
  let currentStart = new Date(birthDateUtc.getTime());

  const firstEnd = addDays(currentStart, Math.round(firstYearsRemaining * 365.25));
  timeline.push({
    planet: firstDasha.lord,
    start: currentStart,
    end: firstEnd,
    years: firstDasha.years,
    isFirstPartial: true
  });
  currentStart = firstEnd;

  for (let offset = 1; offset < DASHA_SEQUENCE.length * 3; offset++) {
    const idx = (startIndex + offset) % DASHA_SEQUENCE.length;
    const dasha = DASHA_SEQUENCE[idx];
    const end = addDays(currentStart, Math.round(dasha.years * 365.25));
    timeline.push({
      planet: dasha.lord,
      start: currentStart,
      end,
      years: dasha.years,
      isFirstPartial: false
    });
    currentStart = end;
    const ageYears = (currentStart.getTime() - birthDateUtc.getTime()) / (365.25 * 86400000);
    if (ageYears > 120) break;
  }

  timeline.forEach(md => {
    const antars = [];
    const totalMDMillis = md.end.getTime() - md.start.getTime();
    let adStart = new Date(md.start.getTime());
    for (const ad of DASHA_SEQUENCE) {
      const yearsFraction = (md.years * ad.years) / 120;
      const adDurationMillis = yearsFraction * 365.25 * 86400000;
      const adEnd = new Date(adStart.getTime() + adDurationMillis);
      antars.push({
        planet: ad.lord,
        start: adStart,
        end: adEnd
      });
      adStart = adEnd;
      if (adStart > md.end) break;
    }
    md.antardashas = antars;
  });

  return timeline;
}

function findCurrentDasha(timeline, now) {
  let currentMD = null;
  let currentAD = null;
  for (const md of timeline) {
    if (now >= md.start && now <= md.end) {
      currentMD = md;
      for (const ad of md.antardashas || []) {
        if (now >= ad.start && now <= ad.end) {
          currentAD = ad;
          break;
        }
      }
      break;
    }
  }
  return { currentMD, currentAD };
}

window.VimshottariDasha = {
  computeVimshottariTimeline,
  findCurrentDasha,
  DASHA_SEQUENCE
};

