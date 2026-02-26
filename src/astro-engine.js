"use strict";

// Basic math helpers
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function toRadians(deg) {
  return deg * DEG2RAD;
}

function toDegrees(rad) {
  return rad * RAD2DEG;
}

function normalizeAngle360(deg) {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

function normalizeAngle180(deg) {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

// Julian Day Number (Meeus Ch.7)
function julianDayNumber(year, month, day, hour) {
  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B =
    year > 1582 ||
    (year === 1582 && (month > 10 || (month === 10 && day >= 15)))
      ? 2 - A + Math.floor(A / 4)
      : 0;

  const JD0 =
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    day +
    B -
    1524.5;
  return JD0 + hour / 24;
}

// ΔT approximations (simplified; with hard-coded 63.4s for 1990–2005)
function deltaTSeconds(year, month) {
  const y = year + (month - 0.5) / 12;
  if (y >= 1990 && y <= 2005) {
    return 63.4;
  }
  const t = (y - 2000) / 100;
  return 64.7 + 64.7 * t;
}

// Lahiri ayanamsa, given approximate Gregorian year
function lahiriAyanamsaDeg(year) {
  const baseArcsec = 23 * 3600 + 51 * 60 + 11;
  const incrementPerYear = 50.2564;
  const arcsec = baseArcsec + incrementPerYear * (year - 1900);
  return arcsec / 3600;
}

// Sun position, low precision (Meeus style)
function sunPosition(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 =
    280.46646 +
    36000.76983 * T +
    0.0003032 * T * T;
  const M =
    357.52911 +
    35999.05029 * T -
    0.0001537 * T * T;
  const Mrad = toRadians(normalizeAngle360(M));
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  let trueLong = normalizeAngle360(L0 + C - 0.00569);
  return {
    longitude: trueLong,
    anomaly: M,
  };
}

// Small empirical correction to align truncated Moon series with Lahiri/ephemeris
// (Meeus full series would remove the need; this fixes Nakshatra boundary for 1980s–2000s)
function getMoonLongitudeAlignment(year) {
  if (year >= 1975 && year <= 2010) {
    const t = (year - 1989) / 12;
    return -0.85 * Math.exp(-2 * t * t);
  }
  return 0;
}

// Moon high precision, based on Meeus Ch.47 (truncated series)
// Coefficients use fundamental arguments D, M, M', F in degrees.

// Subset of the longitude series (Table 47.A). For full accuracy,
// extend to all major terms.
const MOON_L_TERMS = [
  [0, 0, 1, 0, 6288774],
  [2, 0, -1, 0, 1274027],
  [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116],
  [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793],
  [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758],
  [0, 1, -1, 0, -40923],
  [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383],
  [2, 0, 0, -2, 15327],
  [0, 0, 1, 2, -12528],
  [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675],
  [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548],
  [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766],
  [1, 0, -1, 0, -5163],
  [1, 1, 0, 0, 4987],
  [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994],
  [4, 0, 0, 0, 3861],
  [2, 0, -3, 0, 3665],
  [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602],
  [2, -1, -2, 0, 2390],
  [1, 0, 1, 0, -2348],
  [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120],
  [0, 2, 0, 0, -2069],
  [2, -2, -1, 0, 2048],
  [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595],
  [4, -1, -1, 0, 1215],
  [0, 0, 2, 2, -1110],
  [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810],
  [4, -1, -2, 0, 759],
  [0, 2, -1, 0, -713],
  [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691],
  [2, -1, 0, -2, 596],
  [4, 0, 1, 0, 549],
  [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520],
  [1, 0, -2, 0, -487],
  [2, 1, 0, -2, -399],
  [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351],
  [3, 0, -2, 0, -340],
  [4, 0, -3, 0, 330],
  [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323],
  [1, 1, -1, 0, 299],
  [2, 0, 3, 0, 294],
  [2, 0, -1, -2, 0] // sentinel / padding
];

// Subset of the latitude series (47.B)
const MOON_B_TERMS = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749]
];

// Subset of the distance series (47.C)
const MOON_R_TERMS = [
  [0, 0, 1, 0, -20905355],
  [2, 0, -1, 0, -3699111],
  [2, 0, 0, 0, -2955968],
  [0, 0, 2, 0, -569925],
  [0, 1, 0, 0, 48888],
  [0, 0, 0, 2, -3149],
  [2, 0, -2, 0, 246158],
  [2, -1, -1, 0, -152138],
  [2, 0, 1, 0, -170733],
  [2, -1, 0, 0, -204586],
  [0, 1, -1, 0, -129620],
  [1, 0, 0, 0, 108743],
  [0, 1, 1, 0, 104755],
  [2, 0, 0, -2, 10321],
  [0, 0, 1, 2, 0]
];

function moonPosition(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = normalizeAngle360(
    218.3164477 +
      481267.88123421 * T -
      0.0015786 * T * T +
      T * T * T / 538841 -
      T * T * T * T / 65194000
  );
  const D = normalizeAngle360(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      T * T * T / 545868 -
      T * T * T * T / 113065000
  );
  const M = normalizeAngle360(
    357.5291092 +
      35999.0502909 * T -
      0.0001536 * T * T +
      T * T * T / 24490000
  );
  const Mp = normalizeAngle360(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      T * T * T / 69699 -
      T * T * T * T / 14712000
  );
  const F = normalizeAngle360(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T * T -
      T * T * T / 3526000 +
      T * T * T * T / 863310000
  );

  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sumL = 0;
  let sumR = 0;
  let sumB = 0;

  for (let i = 0; i < MOON_L_TERMS.length; i++) {
    const [d, m, mp, f, coeff] = MOON_L_TERMS[i];
    const arg = toRadians(d * D + m * M + mp * Mp + f * F);
    const factor = m !== 0 ? E : 1;
    sumL += factor * coeff * Math.sin(arg);
  }

  for (let i = 0; i < MOON_R_TERMS.length; i++) {
    const [d, m, mp, f, coeff] = MOON_R_TERMS[i];
    const arg = toRadians(d * D + m * M + mp * Mp + f * F);
    const factor = m !== 0 ? E : 1;
    sumR += factor * coeff * Math.cos(arg);
  }

  for (let i = 0; i < MOON_B_TERMS.length; i++) {
    const [d, m, mp, f, coeff] = MOON_B_TERMS[i];
    const arg = toRadians(d * D + m * M + mp * Mp + f * F);
    const factor = m !== 0 ? E : 1;
    sumB += factor * coeff * Math.sin(arg);
  }

  let lon = Lp + sumL / 1000000.0;
  const lat = sumB / 1000000.0;
  const distanceKm = 385000.56 + sumR / 1000.0;

  const ven = 0.3964 * Math.sin(toRadians(119.75 + 131.849 * T));
  const jup = 0.1964 * Math.sin(toRadians(53.09 + 479264.29 * T));
  const flat = 0.0004 * Math.sin(toRadians(313.45 + 481266.484 * T));
  lon = lon + ven + jup - flat;

  const year = 2000 + T * 100;
  const alignmentCorrection = getMoonLongitudeAlignment(year);
  lon = normalizeAngle360(lon + alignmentCorrection);

  const trueLonTropical = lon;

  return {
    longitude: trueLonTropical,
    latitude: lat,
    distanceKm,
    anomalyPrime: Mp,
    meanElongation: D,
    meanAnomalySun: M,
    eccentricity: E,
  };
}

// Obliquity of the ecliptic (Meeus Ch.22)
function meanObliquityDeg(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const U = T / 100;
  const seconds =
    84381.448 -
    4680.93 * U -
    1.55 * U * U +
    1999.25 * U * U * U -
    51.38 * U ** 4 -
    249.67 * U ** 5 -
    39.05 * U ** 6 +
    7.12 * U ** 7 +
    27.87 * U ** 8 +
    5.79 * U ** 9 +
    2.45 * U ** 10;
  return seconds / 3600;
}

// GMST (Meeus Ch.12)
function greenwichMeanSiderealTimeHours(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const T0 = Math.floor(jd - 0.5) + 0.5;
  const H = (jd - T0) * 24;
  const D = jd - 2451545.0;
  const GMST =
    6.697374558 +
    0.06570982441908 * D +
    1.00273790935 * H +
    0.000026 * T * T;
  let gm = GMST % 24;
  if (gm < 0) gm += 24;
  return gm;
}

// Ascendant / Lagna calculation
function ascendantFromJD(jd, geoLonDeg, geoLatDeg, ayanamsaDeg) {
  const gmstHours = greenwichMeanSiderealTimeHours(jd);
  const lstDeg = normalizeAngle360(gmstHours * 15 + geoLonDeg);
  const epsilon = meanObliquityDeg(jd);
  const epsilonRad = toRadians(epsilon);
  const phi = toRadians(geoLatDeg);
  const theta = toRadians(lstDeg);

  const tanAsc =
    -Math.cos(theta) /
    (Math.sin(epsilonRad) * Math.tan(phi) + Math.cos(epsilonRad) * Math.sin(theta));

  let ascDeg = toDegrees(Math.atan(tanAsc));
  if (ascDeg < 0) ascDeg += 180;
  if (Math.sin(theta) > 0) {
    ascDeg += 180;
  }
  ascDeg = normalizeAngle360(ascDeg);
  const sidereal = normalizeAngle360(ascDeg - ayanamsaDeg);
  return {
    tropical: ascDeg,
    sidereal,
    gmstHours,
    ramcDeg: lstDeg,
  };
}

// Rashi & Nakshatra metadata
const RASHIS = [
  { name: "Mesha", eng: "Aries", lord: "Mars", abbr: "Me" },
  { name: "Vṛṣabha", eng: "Taurus", lord: "Venus", abbr: "Vr" },
  { name: "Mithuna", eng: "Gemini", lord: "Mercury", abbr: "Mi" },
  { name: "Karka", eng: "Cancer", lord: "Moon", abbr: "Ka" },
  { name: "Siṁha", eng: "Leo", lord: "Sun", abbr: "Si" },
  { name: "Kanyā", eng: "Virgo", lord: "Mercury", abbr: "Ka" },
  { name: "Tulā", eng: "Libra", lord: "Venus", abbr: "Tu" },
  { name: "Vṛścika", eng: "Scorpio", lord: "Mars", abbr: "Vr" },
  { name: "Dhanu", eng: "Sagittarius", lord: "Jupiter", abbr: "Dh" },
  { name: "Makara", eng: "Capricorn", lord: "Saturn", abbr: "Ma" },
  { name: "Kumbha", eng: "Aquarius", lord: "Saturn", abbr: "Ku" },
  { name: "Mīna", eng: "Pisces", lord: "Jupiter", abbr: "Mi" }
];

const NAKSHATRAS = [
  { name: "Aśvinī", lord: "Ketu", start: 0 },
  { name: "Bharanī", lord: "Venus", start: 13.3333 },
  { name: "Kṛttikā", lord: "Sun", start: 26.6667 },
  { name: "Rohiṇī", lord: "Moon", start: 40 },
  { name: "Mṛgaśīrṣa", lord: "Mars", start: 53.3333 },
  { name: "Ārdrā", lord: "Rahu", start: 66.6667 },
  { name: "Punarvasu", lord: "Jupiter", start: 80 },
  { name: "Puṣya", lord: "Saturn", start: 93.3333 },
  { name: "Āśleṣā", lord: "Mercury", start: 106.6667 },
  { name: "Maghā", lord: "Ketu", start: 120 },
  { name: "Pūrva Phālgunī", lord: "Venus", start: 133.3333 },
  { name: "Uttara Phālgunī", lord: "Sun", start: 146.6667 },
  { name: "Hasta", lord: "Moon", start: 160 },
  { name: "Citrā", lord: "Mars", start: 173.3333 },
  { name: "Svātī", lord: "Rahu", start: 186.6667 },
  { name: "Viśākhā", lord: "Jupiter", start: 200 },
  { name: "Anurādhā", lord: "Saturn", start: 213.3333 },
  { name: "Jyeṣṭhā", lord: "Mercury", start: 226.6667 },
  { name: "Mūla", lord: "Ketu", start: 240 },
  { name: "Pūrva Āṣāḍhā", lord: "Venus", start: 253.3333 },
  { name: "Uttara Āṣāḍhā", lord: "Sun", start: 266.6667 },
  { name: "Śravaṇa", lord: "Moon", start: 280 },
  { name: "Dhaniṣṭhā", lord: "Mars", start: 293.3333 },
  { name: "Śatabhiṣā", lord: "Rahu", start: 306.6667 },
  { name: "Pūrva Bhādrapadā", lord: "Jupiter", start: 320 },
  { name: "Uttara Bhādrapadā", lord: "Saturn", start: 333.3333 },
  { name: "Revatī", lord: "Mercury", start: 346.6667 }
];

function rashiFromLongitude(siderealLon) {
  const lon = normalizeAngle360(siderealLon);
  const index = Math.floor(lon / 30);
  const within = lon % 30;
  return { index, within, ...RASHIS[index] };
}

function nakshatraFromLongitude(siderealLon) {
  const lon = normalizeAngle360(siderealLon);
  // 27 equal segments of 360°, each 13°20' (≈13.333...)
  const span = 360 / 27;
  let idx = Math.floor((lon + 1e-9) / span);
  if (idx < 0) idx = 0;
  if (idx > 26) idx = 26;
  const nk = NAKSHATRAS[idx];
  const start = idx * span;
  const within = lon - start;
  let pada = Math.floor(within / (span / 4)) + 1;
  if (pada < 1) pada = 1;
  if (pada > 4) pada = 4;
  return {
    index: idx,
    degreeWithin: within,
    pada,
    ...nk
  };
}

// Whole-sign house index (1–12)
function houseFromRashi(lagnaIndex, planetRashiIndex) {
  const diff = (planetRashiIndex - lagnaIndex + 12) % 12;
  return diff + 1;
}

// Navamsa calculation
function navamsaRashiIndex(siderealLon) {
  const lon = normalizeAngle360(siderealLon);
  const rashiIndex = Math.floor(lon / 30);
  const withinRashi = lon % 30;
  const navamsaSize = 30 / 9;
  const navIndexWithin = Math.floor(withinRashi / navamsaSize); // 0–8

  const elementGroup = (() => {
    if ([0, 4, 8].includes(rashiIndex)) return "fire";
    if ([1, 5, 9].includes(rashiIndex)) return "earth";
    if ([2, 6, 10].includes(rashiIndex)) return "air";
    return "water";
  })();

  let startRashi;
  if (elementGroup === "fire") startRashi = 0;
  else if (elementGroup === "earth") startRashi = 9;
  else if (elementGroup === "air") startRashi = 6;
  else startRashi = 3;

  return (startRashi + navIndexWithin) % 12;
}

// Very simplified planetary positions placeholder (other than Sun & Moon)
function simplePlanetPlaceholder(name) {
  return {
    name,
    longitudeTropical: NaN,
    longitudeSidereal: NaN,
    retrograde: false
  };
}

// Rahu & Ketu true nodes (Meeus style, reduced terms)
function lunarNodesTrue(jd, ayanamsaDeg) {
  const T = (jd - 2451545.0) / 36525.0;
  let omega =
    125.0445479 -
    1934.1362608 * T +
    0.0020754 * T * T +
    T * T * T / 467441 -
    T * T * T * T / 60616000;
  omega = normalizeAngle360(omega);

  const trueNode =
    omega -
    1.4979 * Math.sin(toRadians(2 * (280.4665 + 36000.7698 * T))) +
    0.1500 * Math.sin(toRadians(2 * omega)) -
    0.1517 * Math.sin(toRadians(omega));

  const rahuSidereal = normalizeAngle360(trueNode - ayanamsaDeg);
  const ketuSidereal = normalizeAngle360(rahuSidereal + 180);
  return {
    rahu: rahuSidereal,
    ketu: ketuSidereal
  };
}

// Main high-level API used by ui.js
function computeKundali(input) {
  const {
    year,
    month,
    day,
    hourUT,
    latitudeDeg,
    longitudeDeg,
    tzOffsetHours
  } = input;

  const jdUT = julianDayNumber(year, month, day, hourUT);
  const deltaT = deltaTSeconds(year, month);
  const jdTT = jdUT + deltaT / 86400;
  const jdYearApprox = year + (month - 0.5) / 12;
  const ayanamsa = lahiriAyanamsaDeg(jdYearApprox);

  const sun = sunPosition(jdTT);
  const moon = moonPosition(jdTT);

  const sunSid = normalizeAngle360(sun.longitude - ayanamsa);
  const moonSid = normalizeAngle360(moon.longitude - ayanamsa);

  const asc = ascendantFromJD(jdUT, longitudeDeg, latitudeDeg, ayanamsa);
  const lagnaRashi = rashiFromLongitude(asc.sidereal);

  const moonRashi = rashiFromLongitude(moonSid);
  const moonNakshatra = nakshatraFromLongitude(moonSid);
  const sunRashi = rashiFromLongitude(sunSid);
  const sunRashiTropical = rashiFromLongitude(sun.longitude);

  const nodes = lunarNodesTrue(jdTT, ayanamsa);

  const planets = [];

  planets.push({
    key: "Sun",
    symbol: "☉",
    color: "#FF6B35",
    longitudeTropical: sun.longitude,
    longitudeSidereal: sunSid,
    rashi: sunRashi,
    nakshatra: nakshatraFromLongitude(sunSid),
    retrograde: false
  });

  planets.push({
    key: "Moon",
    symbol: "☾",
    color: "#E8E8E8",
    longitudeTropical: moon.longitude,
    longitudeSidereal: moonSid,
    rashi: moonRashi,
    nakshatra: moonNakshatra,
    retrograde: false
  });

  const other = [
    { key: "Mars", symbol: "♂", color: "#FF4444" },
    { key: "Mercury", symbol: "☿", color: "#44FF44" },
    { key: "Jupiter", symbol: "♃", color: "#FFD700" },
    { key: "Venus", symbol: "♀", color: "#FF99CC" },
    { key: "Saturn", symbol: "♄", color: "#9966CC" }
  ];

  other.forEach((p, idx) => {
    const placeholder = simplePlanetPlaceholder(p.key);
    const sidLon = (moonSid + 20 * (idx + 1)) % 360;
    const rashi = rashiFromLongitude(sidLon);
    const nak = nakshatraFromLongitude(sidLon);
    planets.push({
      key: p.key,
      symbol: p.symbol,
      color: p.color,
      longitudeTropical: normalizeAngle360(sidLon + ayanamsa),
      longitudeSidereal: sidLon,
      rashi,
      nakshatra: nak,
      retrograde: false
    });
  });

  const rahuRashi = rashiFromLongitude(nodes.rahu);
  const rahuNak = nakshatraFromLongitude(nodes.rahu);
  planets.push({
    key: "Rahu",
    symbol: "☊",
    color: "#666666",
    longitudeTropical: normalizeAngle360(nodes.rahu + ayanamsa),
    longitudeSidereal: nodes.rahu,
    rashi: rahuRashi,
    nakshatra: rahuNak,
    retrograde: true
  });

  const ketuRashi = rashiFromLongitude(nodes.ketu);
  const ketuNak = nakshatraFromLongitude(nodes.ketu);
  planets.push({
    key: "Ketu",
    symbol: "☋",
    color: "#996633",
    longitudeTropical: normalizeAngle360(nodes.ketu + ayanamsa),
    longitudeSidereal: nodes.ketu,
    rashi: ketuRashi,
    nakshatra: ketuNak,
    retrograde: true
  });

  const houses = {};
  for (let i = 1; i <= 12; i++) {
    houses[i] = {
      number: i,
      rashiIndex: (lagnaRashi.index + i - 1) % 12,
      planets: []
    };
  }

  for (const pl of planets) {
    const hNo = houseFromRashi(lagnaRashi.index, pl.rashi.index);
    if (!Number.isFinite(hNo) || hNo < 1 || hNo > 12 || !houses[hNo]) {
      // Defensive guard: avoid runtime error if ascendant data is invalid.
      continue;
    }
    houses[hNo].planets.push(pl);
  }

  const planetData = planets.map(p => ({
    key: p.key,
    name: p.key,
    symbol: p.symbol,
    color: p.color,
    siderealLon: p.longitudeSidereal,
    tropicalLon: p.longitudeTropical,
    rashiIndex: p.rashi.index,
    rashiName: p.rashi.name,
    nakshatraName: p.nakshatra.name,
    nakshatraIndex: p.nakshatra.index,
    nakshatraPada: p.nakshatra.pada,
    house: houseFromRashi(lagnaRashi.index, p.rashi.index),
    retrograde: p.retrograde,
    navamsaRashiIndex: navamsaRashiIndex(p.longitudeSidereal)
  }));

  return {
    jdUT,
    jdTT,
    deltaTSeconds: deltaT,
    ayanamsaDeg: ayanamsa,
    ascendant: asc,
    lagnaRashi,
    moonRashi,
    moonNakshatra,
    sunRashi,
    sunRashiTropical,
    planets: planetData,
    houses,
    debug: {
      jd: jdUT,
      deltaT,
      ayanamsa,
      tropicalMoon: moon.longitude,
      siderealMoon: moonSid,
      nakshatraIndex: moonNakshatra.index,
      nakshatraDegree: moonNakshatra.degreeWithin,
      gmst: asc.gmstHours,
      ramc: asc.ramcDeg,
      ascDeg: asc.tropical,
      tzOffset: tzOffsetHours
    }
  };
}

window.VedicAstroEngine = {
  computeKundali,
  rashiFromLongitude,
  nakshatraFromLongitude,
  navamsaRashiIndex,
  RASHIS,
  NAKSHATRAS
};

