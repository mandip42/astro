"use strict";

const placeInput = document.getElementById("birth-place");
const placeSuggestions = document.getElementById("place-suggestions");
const placeDisplay = document.getElementById("place-display");
const tzDisplay = document.getElementById("timezone-display");
const birthForm = document.getElementById("birth-form");
const birthDateInput = document.getElementById("birth-date");
const birthTimeInput = document.getElementById("birth-time");
const birthAmPmInput = document.getElementById("birth-am-pm");
const loadingIndicator = document.getElementById("loading-indicator");
const summarySection = document.getElementById("summary-section");
const chartsSection = document.getElementById("charts-section");
const positionsSection = document.getElementById("positions-section");
const dashaSection = document.getElementById("dasha-section");
const interpSection = document.getElementById("interpretation-section");
const rashiChartContainer = document.getElementById("rashi-chart-container");
const navamsaChartContainer = document.getElementById("navamsa-chart-container");
const planetTableBody = document.querySelector("#planet-table tbody");
const dashaTimelineDiv = document.getElementById("dasha-timeline");
const dashaTableBody = document.querySelector("#dasha-table tbody");
const shareLinkBtn = document.getElementById("share-link-btn");
const printBtn = document.getElementById("print-btn");

const debugPanel = document.getElementById("debug-panel");
const debugFields = {
  jd: document.getElementById("debug-jd"),
  deltat: document.getElementById("debug-deltat"),
  ayanamsa: document.getElementById("debug-ayanamsa"),
  moonTrop: document.getElementById("debug-moon-tropical"),
  moonSid: document.getElementById("debug-moon-sidereal"),
  nakIdx: document.getElementById("debug-nakshatra-idx"),
  nakDeg: document.getElementById("debug-nakshatra-deg"),
  gmst: document.getElementById("debug-gmst"),
  ramc: document.getElementById("debug-ramc"),
  asc: document.getElementById("debug-asc"),
  tz: document.getElementById("debug-tz"),
  utc: document.getElementById("debug-utc")
};

const summaryGreeting = document.getElementById("summary-greeting");
const summaryMoonRashi = document.getElementById("summary-moon-rashi");
const summarySunRashi = document.getElementById("summary-sun-rashi");
const summaryLagna = document.getElementById("summary-lagna");
const summaryNakshatra = document.getElementById("summary-nakshatra");
const summaryPada = document.getElementById("summary-pada");
const summaryMD = document.getElementById("summary-md");
const summaryAD = document.getElementById("summary-ad");
const nativeNameInput = document.getElementById("native-name");

const interpLagna = document.getElementById("interp-lagna");
const interpMoon = document.getElementById("interp-moon");
const interpNak = document.getElementById("interp-nakshatra");
const interpStrengths = document.getElementById("interp-planet-strengths");
const interpYogas = document.getElementById("interp-yogas");

const matchingSection = document.getElementById("matching-section");
const matchingYourLagna = document.getElementById("matching-your-lagna");
const matchingPartnerLagnaSelect = document.getElementById("matching-partner-lagna");
const matchingBtn = document.getElementById("matching-btn");
const matchingResultScore = document.getElementById("matching-result-score");
const matchingResultText = document.getElementById("matching-result-text");

let selectedPlace = null;
let selectedTimezone = null;
let currentKundali = null;
let currentTimeline = null;

function t(key) {
  return window.i18n && window.i18n.t ? window.i18n.t(key) : key;
}
function getRashiName(idx, useLocalized) {
  return window.i18n && window.i18n.getRashiName ? window.i18n.getRashiName(idx, useLocalized) : null;
}
function getNakshatraName(idx, useLocalized) {
  return window.i18n && window.i18n.getNakshatraName ? window.i18n.getNakshatraName(idx, useLocalized) : null;
}
function getPlanetName(key, useLocalized) {
  return window.i18n && window.i18n.getPlanetName ? window.i18n.getPlanetName(key, useLocalized) : null;
}

function setLoading(on) {
  loadingIndicator.classList.toggle("hidden", !on);
  birthForm.querySelectorAll("input,select,button").forEach(el => {
    if (el === shareLinkBtn || el === printBtn) return;
    el.disabled = on;
  });
}

let placeDebounceTimer = null;
placeInput.addEventListener("input", () => {
  const q = placeInput.value.trim();
  selectedPlace = null;
  selectedTimezone = null;
  placeDisplay.textContent = t("noPlaceSelected");
  placeDisplay.classList.add("muted");
  tzDisplay.textContent = t("unknown");
  tzDisplay.classList.add("muted");
  if (!q) {
    placeSuggestions.classList.add("hidden");
    placeSuggestions.innerHTML = "";
    return;
  }
  if (placeDebounceTimer) clearTimeout(placeDebounceTimer);
  placeDebounceTimer = setTimeout(() => fetchPlaces(q), 400);
});

async function fetchPlaces(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=5`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" }
    });
    const data = await res.json();
    placeSuggestions.innerHTML = "";
    if (!data.length) {
      placeSuggestions.classList.add("hidden");
      return;
    }
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = item.display_name;
      div.addEventListener("click", () => selectPlace(item));
      placeSuggestions.appendChild(div);
    });
    placeSuggestions.classList.remove("hidden");
  } catch (err) {
    console.error("Place search error", err);
    placeSuggestions.classList.add("hidden");
  }
}

async function selectPlace(item) {
  placeSuggestions.classList.add("hidden");
  placeInput.value = item.display_name;
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  selectedPlace = {
    name: item.display_name,
    lat,
    lon
  };
  placeDisplay.textContent = `${item.display_name} (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`;
  placeDisplay.classList.remove("muted");
  await resolveTimezone(lat, lon);
}

// India (IST) bounding box — use +5:30 if API fails or returns 0
function isInIndia(lat, lon) {
  return lat >= 8 && lat <= 35 && lon >= 68 && lon <= 97;
}
const IST_OFFSET_HOURS = 5.5;

function parseOffsetFromApi(data) {
  let offsetSeconds = undefined;
  if (data && data.timeZone && data.timeZone.currentUtcOffset && typeof data.timeZone.currentUtcOffset.seconds === "number") {
    offsetSeconds = data.timeZone.currentUtcOffset.seconds;
  } else if (typeof data.currentUtcOffset === "number") {
    offsetSeconds = data.currentUtcOffset * 60; // minutes -> seconds
  } else if (typeof data.rawOffset === "number") {
    offsetSeconds = data.rawOffset;
  } else if (typeof data.utc_offset === "string") {
    const match = data.utc_offset.match(/^([+-]?)(\d{1,2}):(\d{2})$/);
    if (match) {
      const sign = match[1] === "-" ? -1 : 1;
      offsetSeconds = sign * (parseInt(match[2], 10) * 3600 + parseInt(match[3], 10) * 60);
    }
  }
  if (Number.isFinite(offsetSeconds)) return offsetSeconds / 3600;
  return null;
}

async function resolveTimezone(lat, lon) {
  try {
    const url = `https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`;
    const res = await fetch(url);
    const data = await res.json();

    let offsetHours = parseOffsetFromApi(data);
    if (offsetHours === null || !Number.isFinite(offsetHours)) {
      offsetHours = 0;
    }
    // Fallback: India must be IST (+5:30). If API returned 0 for Indian coords, override.
    if (isInIndia(lat, lon) && Math.abs(offsetHours) < 0.01) {
      offsetHours = IST_OFFSET_HOURS;
    }

    selectedTimezone = {
      name: (data && data.timeZone && data.timeZone.name) ? data.timeZone.name : (data && data.timeZone) ? String(data.timeZone) : "Unknown",
      offsetHours
    };
    const sign = offsetHours >= 0 ? "+" : "-";
    const abs = Math.abs(offsetHours);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    tzDisplay.textContent = `${selectedTimezone.name} (UTC${sign}${h}:${m.toString().padStart(2, "0")})`;
    tzDisplay.classList.remove("muted");
  } catch (err) {
    console.error("Timezone lookup failed", err);
    if (selectedPlace && isInIndia(selectedPlace.lat, selectedPlace.lon)) {
      selectedTimezone = { name: "Asia/Kolkata (IST fallback)", offsetHours: IST_OFFSET_HOURS };
      tzDisplay.textContent = "Asia/Kolkata (UTC+5:30)";
      tzDisplay.classList.remove("muted");
    } else {
      tzDisplay.textContent = t("timezoneFailed");
      tzDisplay.classList.remove("muted");
    }
  }
}

birthForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!selectedPlace || !selectedTimezone) {
    alert(t("alertSelectPlace"));
    return;
  }
  const dateStr = birthDateInput.value;
  const timeStr = birthTimeInput.value;
  if (!dateStr || !timeStr) {
    alert(t("alertDateTime"));
    return;
  }
  const [hourLocal, minuteLocal] = timeStr.split(":").map(Number);
  let hour24 = hourLocal % 12;
  if (birthAmPmInput.value === "PM") hour24 += 12;
  const localDate = new Date(`${dateStr}T${hour24.toString().padStart(2, "0")}:${minuteLocal.toString().padStart(2, "0")}:00`);

  const offsetMs = selectedTimezone.offsetHours * 3600000;
  const utcMs = localDate.getTime() - offsetMs;
  const utcDate = new Date(utcMs);

  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hourUT = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600;

  setLoading(true);
  try {
    if (!window.VedicAstroEngine || !window.VimshottariDasha) {
      throw new Error("Astrology engine scripts failed to load.");
    }

    const result = window.VedicAstroEngine.computeKundali({
      year,
      month,
      day,
      hourUT,
      latitudeDeg: selectedPlace.lat,
      longitudeDeg: selectedPlace.lon,
      tzOffsetHours: selectedTimezone.offsetHours
    });
    currentKundali = result;

    const moonNak = result.moonNakshatra;
    const birthDateUtcCopy = new Date(utcDate.getTime());
    const timeline = window.VimshottariDasha.computeVimshottariTimeline(
      birthDateUtcCopy,
      moonNak.index,
      moonNak.degreeWithin
    );
    currentTimeline = timeline;
    const { currentMD, currentAD } = window.VimshottariDasha.findCurrentDasha(
      timeline,
      new Date()
    );

    fillSummary(result, currentMD, currentAD);
    fillPlanetsTable(result);
    fillDashaTable(timeline, currentMD);
    renderCharts(result);
    fillInterpretations(result, currentMD, currentAD);
    fillDebug(result, utcDate);
    updateMatchingBase(result);

    summarySection.classList.remove("hidden");
    chartsSection.classList.remove("hidden");
    positionsSection.classList.remove("hidden");
    dashaSection.classList.remove("hidden");
    interpSection.classList.remove("hidden");
  } catch (err) {
    console.error("Error while calculating kundali:", err);
    alert(t("errorCalculating"));
  } finally {
    setLoading(false);
  }
});

function fillSummary(kundali, currentMD, currentAD) {
  const name = (nativeNameInput && nativeNameInput.value) ? nativeNameInput.value.trim() : "";
  if (summaryGreeting) {
    if (name) {
      summaryGreeting.textContent = `${t("dear")} ${name},`;
      summaryGreeting.classList.remove("hidden");
    } else {
      summaryGreeting.textContent = "";
      summaryGreeting.classList.add("hidden");
    }
  }

  const lag = kundali.lagnaRashi;
  const moonR = kundali.moonRashi;
  const sunR = kundali.sunRashi;
  const sunRTropical = kundali.sunRashiTropical || sunR;
  const nk = kundali.moonNakshatra;

  const moonRashiDisp = getRashiName(moonR.index, true) || moonR.name;
  const sunRashiDisp = getRashiName(sunRTropical.index, true) || sunRTropical.name;
  const lagDisp = getRashiName(lag.index, true) || lag.name;
  const nkDisp = getNakshatraName(nk.index, true) || nk.name;

  summaryMoonRashi.textContent = `${moonRashiDisp} (${moonR.eng})`;
  summarySunRashi.textContent = `${sunRashiDisp} (${sunRTropical.eng})`;
  const sunNoteEl = document.getElementById("summary-sun-rashi-note");
  if (sunNoteEl) {
    if (sunRTropical.index !== sunR.index) {
      const siderealRashiDisp = getRashiName(sunR.index, true) || sunR.name;
      sunNoteEl.textContent = t("tropicalSiderealNote") + siderealRashiDisp + ")";
      sunNoteEl.classList.remove("hidden");
    } else {
      sunNoteEl.textContent = "";
      sunNoteEl.classList.add("hidden");
    }
  }
  summaryLagna.textContent = `${lagDisp} (${lag.eng})`;
  summaryNakshatra.textContent = nkDisp;
  summaryPada.textContent = `${nk.pada} ${t("pada").toLowerCase()}`;
  const mdPlanetDisp = currentMD ? (getPlanetName(currentMD.planet, true) || currentMD.planet) : "";
  const adPlanetDisp = currentAD ? (getPlanetName(currentAD.planet, true) || currentAD.planet) : "";
  summaryMD.textContent = currentMD ? t("mahadashaFormat").replace("%s", mdPlanetDisp) : "—";
  summaryAD.textContent = currentAD ? t("antardashaFormat").replace("%s", adPlanetDisp) : "—";
}

function updateMatchingBase(kundali) {
  if (!matchingSection || !matchingYourLagna) return;
  const lag = kundali.lagnaRashi;
  const lagDisp = getRashiName(lag.index, true) || lag.name;
  matchingYourLagna.textContent = `${lagDisp} (${lag.eng})`;
  matchingSection.classList.remove("hidden");
}

function computeMatching() {
  if (!currentKundali || !matchingPartnerLagnaSelect) return;
  const value = matchingPartnerLagnaSelect.value;
  if (value === "") {
    matchingResultScore.textContent = "";
    matchingResultText.textContent = "";
    return;
  }
  const partnerIdx = parseInt(value, 10);
  const myIdx = currentKundali.lagnaRashi.index;
  if (!window.MarriageMatching) return;
  const score = window.MarriageMatching.computeLagnaCompatibilityScore(myIdx, partnerIdx);
  const band = window.MarriageMatching.getBand(score);
  matchingResultScore.textContent = `${score} / 36`;
  const myName = getRashiName(myIdx, true) || currentKundali.lagnaRashi.name;
  const partnerName = getRashiName(partnerIdx, true) || window.VedicAstroEngine.RASHIS[partnerIdx].name;
  const bandText = t(band.key);
  matchingResultText.textContent = `${bandText} (${myName} & ${partnerName}).`;
}

function formatDeg(deg) {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  return `${d.toString().padStart(2, "0")}°${m.toString().padStart(2, "0")}'`;
}

function fillPlanetsTable(kundali) {
  planetTableBody.innerHTML = "";
  kundali.planets.forEach(p => {
    const rashi = window.VedicAstroEngine.RASHIS[p.rashiIndex];
    const nk = window.VedicAstroEngine.NAKSHATRAS[p.nakshatraIndex];
    if (!rashi || !nk) return;
    const planetDisp = getPlanetName(p.key, true) || p.name;
    const rashiDisp = getRashiName(p.rashiIndex, true) || rashi.name;
    const nkDisp = getNakshatraName(p.nakshatraIndex, true) || nk.name;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${planetDisp}</td>
      <td>${rashiDisp}</td>
      <td>${formatDeg(p.siderealLon % 30)}</td>
      <td>${nkDisp}</td>
      <td>${p.nakshatraPada}</td>
      <td>${p.house}</td>
      <td>${p.retrograde ? "R" : ""}</td>
    `;
    planetTableBody.appendChild(tr);
  });
}

function fillDashaTable(timeline, currentMD) {
  dashaTableBody.innerHTML = "";
  dashaTimelineDiv.innerHTML = "";
  if (!timeline.length) return;

  // Filter out any malformed entries to avoid invalid Date errors
  const cleanTimeline = timeline.filter(
    md =>
      md &&
      md.start instanceof Date &&
      md.end instanceof Date &&
      !Number.isNaN(md.start.getTime()) &&
      !Number.isNaN(md.end.getTime())
  );
  if (!cleanTimeline.length) return;

  const totalMillis =
    cleanTimeline[cleanTimeline.length - 1].end.getTime() - cleanTimeline[0].start.getTime();

  cleanTimeline.forEach(md => {
    const tr = document.createElement("tr");
    const startStr = md.start.toISOString().substring(0, 10);
    const endStr = md.end.toISOString().substring(0, 10);
    const planetDisp = getPlanetName(md.planet, true) || md.planet;
    tr.innerHTML = `
      <td>${planetDisp}</td>
      <td>${startStr}</td>
      <td>${endStr}</td>
      <td>${md.years}</td>
    `;
    if (currentMD && currentMD.planet === md.planet && currentMD.start.getTime() === md.start.getTime()) {
      tr.style.color = "#e8b86d";
      tr.style.fontWeight = "600";
    }
    dashaTableBody.appendChild(tr);

    const widthPercent =
      ((md.end.getTime() - md.start.getTime()) / totalMillis) * 100;
    const bar = document.createElement("div");
    bar.className = "dasha-bar";
    bar.style.flexBasis = `${widthPercent}%`;
    const span = document.createElement("span");
    bar.appendChild(span);
    if (currentMD && currentMD.planet === md.planet && currentMD.start.getTime() === md.start.getTime()) {
      bar.classList.add("current");
    }
    dashaTimelineDiv.appendChild(bar);
  });
}

function renderCharts(kundali) {
  window.KundaliChart.renderNorthIndianChart(rashiChartContainer, kundali, {
    title: t("d1Rashi")
  });
  const navHouses = window.KundaliChart.buildNavamsaHouses(kundali);
  const navKundali = {
    houses: navHouses,
    lagnaRashi: kundali.lagnaRashi
  };
  window.KundaliChart.renderNorthIndianChart(navamsaChartContainer, navKundali, {
    title: t("d9Navamsa")
  });
}

const LAGNA_DESCRIPTIONS = {
  0: "Mesha Lagna natives are pioneering, energetic and direct, often taking initiative with courage.",
  1: "Vrishabha Lagna gives stability, love of comfort, beauty and strong material instincts.",
  2: "Mithuna Lagna makes the native curious, communicative, versatile and mentally agile.",
  3: "Karka Lagna brings sensitivity, nurturing instinct and strong attachment to family and home.",
  4: "Simha Lagna natives are proud, dignified, expressive and seek creative self-expression.",
  5: "Kanya Lagna emphasizes analysis, service, precision and attention to practical details.",
  6: "Tula Lagna seeks harmony, partnership, fairness and aesthetic balance in life.",
  7: "Vrischika Lagna is intense, deep, private, and oriented toward transformation and control.",
  8: "Dhanu Lagna loves freedom, philosophy, travel and higher knowledge.",
  9: "Makara Lagna is disciplined, ambitious, responsible and pragmatic.",
  10: "Kumbha Lagna is idealistic, unconventional, humanitarian and intellectually oriented.",
  11: "Meena Lagna is imaginative, compassionate, mystical and impressionable."
};

const MOON_SIGN_DESCRIPTIONS = {
  0: "With Moon in Mesha, the emotional nature is quick, bold and independent.",
  1: "Moon in Vrishabha gives steady emotions, love of comfort and sensual pleasures.",
  2: "Moon in Mithuna shows a restless, curious, talkative and adaptable mind.",
  3: "Moon in Karka is nurturing, protective, moody and deeply attached to family.",
  4: "Moon in Simha seeks emotional recognition, warmth and dramatic self-expression.",
  5: "Moon in Kanya is analytical, service-oriented and sensitive to details.",
  6: "Moon in Tula craves harmony, companionship and balance in relationships.",
  7: "Moon in Vrischika is intense, secretive, passionate and emotionally powerful.",
  8: "Moon in Dhanu is optimistic, idealistic and drawn to philosophy and travel.",
  9: "Moon in Makara is controlled, serious, ambitious and careful with emotions.",
  10: "Moon in Kumbha is detached, idealistic, sociable and future-oriented.",
  11: "Moon in Meena is dreamy, empathetic, intuitive and imaginative."
};

const NAKSHATRA_DESCRIPTIONS = {
  5: "Ārdrā Nakṣatra is ruled by Rudra; it brings intensity, stormy transformation, powerful intellect and deep emotional capacity."
};

const EXALTATION_SIGNS = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
  Rahu: 2,
  Ketu: 8
};

const DEBILITATION_SIGNS = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
  Rahu: 8,
  Ketu: 2
};

function fillInterpretations(kundali, currentMD, currentAD) {
  const lagIdx = kundali.lagnaRashi.index;
  const moonIdx = kundali.moonRashi.index;
  interpLagna.textContent = LAGNA_DESCRIPTIONS[lagIdx] || "";
  interpMoon.textContent = MOON_SIGN_DESCRIPTIONS[moonIdx] || "";
  interpNak.textContent =
    NAKSHATRA_DESCRIPTIONS[kundali.moonNakshatra.index] ||
    "The birth Nakṣatra describes the mind, emotional tone and major karmic patterns.";

  interpStrengths.innerHTML = "";
  kundali.planets.forEach(p => {
    const li = document.createElement("li");
    const rIdx = p.rashiIndex;
    if (EXALTATION_SIGNS[p.key] === rIdx) {
      li.textContent = `${p.name} is exalted in ${window.VedicAstroEngine.RASHIS[rIdx].name}, giving strong positive expression.`;
    } else if (DEBILITATION_SIGNS[p.key] === rIdx) {
      li.textContent = `${p.name} is debilitated in ${window.VedicAstroEngine.RASHIS[rIdx].name}, requiring conscious effort to integrate.`;
    } else {
      return;
    }
    interpStrengths.appendChild(li);
  });

  interpYogas.innerHTML = "";
  const planetsByHouse = {};
  kundali.planets.forEach(p => {
    if (!planetsByHouse[p.house]) planetsByHouse[p.house] = [];
    planetsByHouse[p.house].push(p);
  });

  const moon = kundali.planets.find(p => p.key === "Moon");
  const jupiter = kundali.planets.find(p => p.key === "Jupiter");
  if (moon && jupiter) {
    const diff = (jupiter.house - moon.house + 12) % 12;
    if ([0, 3, 6, 9].includes(diff)) {
      const li = document.createElement("li");
      li.textContent =
        "Gaja-Kesarī Yoga: Jupiter is in a kendra from Moon, indicating protection, wisdom and popularity.";
      interpYogas.appendChild(li);
    }
  }

  const sun = kundali.planets.find(p => p.key === "Sun");
  const mercury = kundali.planets.find(p => p.key === "Mercury");
  if (sun && mercury && sun.house === mercury.house) {
    const li = document.createElement("li");
    li.textContent =
      "Budha-Aditya Yoga: Sun and Mercury together strengthen intellect, communication and administrative capacity.";
    interpYogas.appendChild(li);
  }

  const mars = kundali.planets.find(p => p.key === "Mars");
  if (moon && mars && moon.house === mars.house) {
    const li = document.createElement("li");
    li.textContent =
      "Chandra-Maṅgal Yoga: Moon with Mars gives drive, initiative and financial potential with emotional intensity.";
    interpYogas.appendChild(li);
  }

  if (!interpYogas.children.length) {
    const li = document.createElement("li");
    li.textContent = t("noMajorYogas");
    interpYogas.appendChild(li);
  }
}

function fillDebug(kundali, utcBirth) {
  const d = kundali.debug;
  if (!d) return;
  if (Number.isFinite(d.jd)) debugFields.jd.textContent = d.jd.toFixed(5);
  if (Number.isFinite(d.deltaT)) debugFields.deltat.textContent = d.deltaT.toFixed(2);
  if (Number.isFinite(d.ayanamsa)) debugFields.ayanamsa.textContent = d.ayanamsa.toFixed(4);
  if (Number.isFinite(d.tropicalMoon)) debugFields.moonTrop.textContent = d.tropicalMoon.toFixed(4);
  if (Number.isFinite(d.siderealMoon)) debugFields.moonSid.textContent = d.siderealMoon.toFixed(4);
  if (Number.isFinite(d.nakshatraIndex)) debugFields.nakIdx.textContent = String(d.nakshatraIndex);
  if (Number.isFinite(d.nakshatraDegree)) debugFields.nakDeg.textContent = d.nakshatraDegree.toFixed(4);
  if (Number.isFinite(d.gmst)) debugFields.gmst.textContent = d.gmst.toFixed(5);
  if (Number.isFinite(d.ramc)) debugFields.ramc.textContent = d.ramc.toFixed(4);
  if (Number.isFinite(d.ascDeg)) debugFields.asc.textContent = d.ascDeg.toFixed(4);
  if (Number.isFinite(d.tzOffset)) debugFields.tz.textContent = d.tzOffset.toFixed(2);
  if (utcBirth instanceof Date && !Number.isNaN(utcBirth.getTime())) {
    debugFields.utc.textContent = utcBirth.toISOString();
  }
}

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
    debugPanel.classList.toggle("hidden");
  }
});

shareLinkBtn.addEventListener("click", () => {
  if (!selectedPlace || !selectedTimezone || !birthDateInput.value || !birthTimeInput.value) {
    alert(t("alertShareLink"));
    return;
  }
  const params = new URLSearchParams();
  params.set("dob", birthDateInput.value);
  params.set("tob", birthTimeInput.value + birthAmPmInput.value);
  params.set("place", selectedPlace.name);
  params.set("lat", String(selectedPlace.lat));
  params.set("lng", String(selectedPlace.lon));
  params.set("tz", String(selectedTimezone.offsetHours));
  if (nativeNameInput && nativeNameInput.value.trim()) {
    params.set("name", nativeNameInput.value.trim());
  }
  const url = `${location.origin}${location.pathname}?${params.toString()}`;
  navigator.clipboard
    .writeText(url)
    .then(() => alert(t("linkCopied")))
    .catch(() => alert(t("linkCopyFailed")));
});

printBtn.addEventListener("click", () => {
  window.print();
});

function parseInitialParamsAndCalculate() {
  const params = new URLSearchParams(location.search);
  const dob = params.get("dob");
  const tob = params.get("tob");
  const place = params.get("place");
  const lat = parseFloat(params.get("lat"));
  const lng = parseFloat(params.get("lng"));
  const tz = parseFloat(params.get("tz"));
  const name = params.get("name");

  if (dob && tob && place && !Number.isNaN(lat) && !Number.isNaN(lng) && !Number.isNaN(tz)) {
    birthDateInput.value = dob;
    const time = tob.slice(0, 5);
    const suffix = tob.slice(5);
    birthTimeInput.value = time;
    birthAmPmInput.value = suffix === "PM" ? "PM" : "AM";
    if (nativeNameInput && name) nativeNameInput.value = name;

    selectedPlace = { name: place, lat, lon: lng };
    selectedTimezone = { name: "Custom", offsetHours: tz };
    placeDisplay.textContent = `${place} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
    placeDisplay.classList.remove("muted");
    tzDisplay.textContent = `UTC${tz >= 0 ? "+" : "-"}${Math.abs(tz).toFixed(1)}`;
    tzDisplay.classList.remove("muted");

    setTimeout(() => birthForm.dispatchEvent(new Event("submit")), 200);
  }
}

window.onLanguageChange = function () {
  if (!currentKundali || !currentTimeline) return;
  const { currentMD, currentAD } = window.VimshottariDasha.findCurrentDasha(currentTimeline, new Date());
  fillSummary(currentKundali, currentMD, currentAD);
  fillPlanetsTable(currentKundali);
  fillDashaTable(currentTimeline, currentMD);
  fillInterpretations(currentKundali, currentMD, currentAD);
  renderCharts(currentKundali);
  updateMatchingBase(currentKundali);
  computeMatching();
};

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (window.i18n) window.i18n.setLanguage(btn.getAttribute("data-lang"));
  });
});

if (matchingBtn) {
  matchingBtn.addEventListener("click", computeMatching);
}

window.addEventListener("load", () => {
  const testDateLocal = new Date(Date.UTC(1995, 8, 18, 6, 30));
  const year = testDateLocal.getUTCFullYear();
  const month = testDateLocal.getUTCMonth() + 1;
  const day = testDateLocal.getUTCDate();
  const hourUT = testDateLocal.getUTCHours() + testDateLocal.getUTCMinutes() / 60;

  const res = window.VedicAstroEngine.computeKundali({
    year,
    month,
    day,
    hourUT,
    latitudeDeg: 22.5726,
    longitudeDeg: 88.3639,
    tzOffsetHours: 5.5
  });

  const moonSid = res.debug.siderealMoon;
  const rashi = window.VedicAstroEngine.rashiFromLongitude(moonSid);
  const nak = window.VedicAstroEngine.nakshatraFromLongitude(moonSid);
  const inMithuna = rashi.index === 2;
  const inArdra = nak.index === 5;
  if (inMithuna && inArdra) {
    console.log("Validation PASS: 18 Sep 1995 Moon in Mithuna / Ardra", {
      siderealMoon: moonSid,
      rashi: rashi,
      nakshatra: nak
    });
  } else {
    console.warn("Validation FAIL: 18 Sep 1995 target not reached", {
      siderealMoon: moonSid,
      rashi: rashi,
      nakshatra: nak
    });
  }

  parseInitialParamsAndCalculate();
});

