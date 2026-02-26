"use strict";

const STORAGE_KEY = "vedic_astro_lang";

const translations = {
  en: {
    appTitle: "Jyotiṣa Kundali — Lahiri (Sidereal)",
    subtitle: "Indian Vedic Astrology • Rāśi, Nakṣatra, Vimśottarī Daśā • Client-side only",
    birthDetails: "Birth Details",
    nameOptional: "Name (optional)",
    namePlaceholder: "e.g. Rajesh",
    nameHint: "For personalization only; chart is based on date, time & place.",
    dateOfBirth: "Date of Birth",
    timeOfBirth: "Time of Birth",
    placeOfBirth: "Place of Birth",
    placePlaceholder: "Start typing city or town…",
    resolvedLocation: "Resolved Location",
    timezone: "Timezone",
    noPlaceSelected: "No place selected",
    unknown: "Unknown",
    calculateKundali: "Calculate Kundali",
    copyShareLink: "Copy Shareable Link",
    printPdf: "Print / PDF",
    loading: "Computing precise planetary positions…",
    birthSummary: "Birth Summary",
    dear: "Dear",
    janmaRashi: "Janma Rāśi",
    suryaRashi: "Surya Rāśi (Sun sign)",
    lagna: "Lagna",
    janmaNakshatra: "Janma Nakṣatra",
    pada: "Pada",
    currentMahadasha: "Current Mahādaśā",
    currentAntardasha: "Current Antardaśā",
    tropicalSiderealNote: " (tropical; sidereal: ",
    kundaliCharts: "Kundali Charts",
    d1Rashi: "D1 — Rāśi (Birth Chart)",
    d9Navamsa: "D9 — Navāṁśa",
    grahaPositions: "Graha Positions",
    planet: "Planet",
    rashi: "Rāśi",
    deg: "Deg°",
    nakshatra: "Nakṣatra",
    house: "House",
    vimshottariDasha: "Vimśottarī Daśā",
    mahadasha: "Mahādaśā",
    start: "Start",
    end: "End",
    years: "Years",
    basicInterpretations: "Basic Interpretations",
    lagnaRashi: "Lagna Rāśi",
    janmaRashiMoon: "Janma Rāśi (Moon Sign)",
    janmaNakshatraDesc: "Janma Nakṣatra",
    planetaryStrengths: "Planetary Strengths",
    yogas: "Yogas",
    debugPanel: "Debug Panel (Ctrl+Shift+D)",
    footer: "Made for traditional Jyotiṣa study. All calculations run locally in your browser.",
    alertSelectPlace: "Please select a valid place and wait for timezone resolution.",
    alertDateTime: "Please enter date and time of birth.",
    alertShareLink: "Fill birth data and place before generating a share link.",
    linkCopied: "Shareable link copied to clipboard.",
    linkCopyFailed: "Unable to copy link. You can copy it from the address bar.",
    errorCalculating: "There was an error while calculating the kundali. Please open the browser console and share the error message if this persists.",
    noMajorYogas: "No major classical yogas from this basic set are strongly indicated.",
    timezoneFailed: "Timezone lookup failed",
    sidereal: "sidereal",
    langEn: "EN",
    langAs: "অ",
    labelJanmaRashi: "🌙 Janma Rāśi",
    labelSuryaRashi: "☀ Surya Rāśi (Sun sign)",
    labelLagna: "⬆ Lagna",
    labelJanmaNakshatra: "⭐ Janma Nakṣatra",
    labelPada: "Pada",
    labelCurrentMD: "⏳ Current Mahādaśā",
    labelCurrentAD: "⏳ Current Antardaśā",
    mahadashaFormat: "%s Mahādaśā",
    antardashaFormat: "%s Antardaśā",
  },
  as: {
    appTitle: "জ্যোতিষ কুণ্ডলী — লাহিৰী (নাক্ষত্ৰিক)",
    subtitle: "ভাৰতীয় বেদীয় জ্যোতিষ • ৰাশি, নক্ষত্র, বিমশোত্তৰী দশা • ক্লায়েণ্ট-চাইড",
    birthDetails: "জন্মৰ বিৱৰণ",
    nameOptional: "নাম (ঐচ্ছিক)",
    namePlaceholder: "যেনে ৰাজেশ",
    nameHint: "কেবল ব্যক্তিগতকৰণৰ বাবে; চাৰ্ট তাৰিখ, সময় আৰু ঠাইৰ ওপৰত ভিত্তি কৰি।",
    dateOfBirth: "জন্ম তাৰিখ",
    timeOfBirth: "জন্ম সময়",
    placeOfBirth: "জন্মস্থান",
    placePlaceholder: "চহৰ বা ঠাই টাইপ কৰক…",
    resolvedLocation: "নিৰ্ধাৰিত অৱস্থান",
    timezone: "সময় অঞ্চল",
    noPlaceSelected: "কোনো ঠাই নির্বাচন কৰা হোৱা নাই",
    unknown: "অজ্ঞাত",
    calculateKundali: "কুণ্ডলী গণনা কৰক",
    copyShareLink: "শ্বেয়াৰ লিংক কপি কৰক",
    printPdf: "প্ৰিণ্ট / পিডিএফ",
    loading: "গ্ৰহ স্থান নিৰ্ণয় কৰি আছে…",
    birthSummary: "জন্ম সাৰাংশ",
    dear: "প্রিয়",
    janmaRashi: "জন্ম ৰাশি",
    suryaRashi: "সূৰ্য ৰাশি",
    lagna: "লগ্ন",
    janmaNakshatra: "জন্ম নক্ষত্র",
    pada: "পদ",
    currentMahadasha: "বৰ্তমান মহাদশা",
    currentAntardasha: "বৰ্তমান অন্তৰ্দশা",
    tropicalSiderealNote: " (ক্রান্তীয়; নাক্ষত্ৰিক: ",
    kundaliCharts: "কুণ্ডলী চাৰ্ট",
    d1Rashi: "D1 — ৰাশি (জন্ম চাৰ্ট)",
    d9Navamsa: "D9 — নৱাংশ",
    grahaPositions: "গ্ৰহ স্থান",
    planet: "গ্ৰহ",
    rashi: "ৰাশি",
    deg: "ডিগ্ৰী°",
    nakshatra: "নক্ষত্র",
    house: "গৃহ",
    vimshottariDasha: "বিমশোত্তৰী দশা",
    mahadasha: "মহাদশা",
    start: "আৰম্ভ",
    end: "শেষ",
    years: "বছৰ",
    basicInterpretations: "মূল ব্যাখ্যা",
    lagnaRashi: "লগ্ন ৰাশি",
    janmaRashiMoon: "জন্ম ৰাশি (চন্দ্ৰ ৰাশি)",
    janmaNakshatraDesc: "জন্ম নক্ষত্র",
    planetaryStrengths: "গ্ৰহ বল",
    yogas: "যোগ",
    debugPanel: "ডিবাগ পেনেল (Ctrl+Shift+D)",
    footer: "পৰম্পৰাগত জ্যোতিষ অধ্যয়নৰ বাবে। সকলো গণনা আপোনাৰ ব্ৰাউজাৰত স্থানীয়ভাৱে চলে।",
    alertSelectPlace: "অনুগ্ৰহ কৰি এটা বৈধ ঠাই নির্বাচন কৰক আৰু সময় অঞ্চল প্ৰাপ্ত হ’বলৈ অপেক্ষা কৰক।",
    alertDateTime: "অনুগ্ৰহ কৰি জন্ম তাৰিখ আৰু সময় সন্নিবিষ্ট কৰক।",
    alertShareLink: "শ্বেয়াৰ লিংক তৈয়াৰ কৰিবলৈ জন্মৰ তথ্য আৰু ঠাই পূৰণ কৰক।",
    linkCopied: "শ্বেয়াৰ লিংক ক্লিপবৰ্ডত কপি হ’ল।",
    linkCopyFailed: "লিংক কপি কৰিব পৰা নগ’ল। এড্ৰেছ বাৰৰ পৰা কপি কৰিব পাৰে।",
    errorCalculating: "কুণ্ডলী গণনা কৰোতে ত্ৰুটি হ’ল। ব্ৰাউজাৰ কনচোল খুলি ত্ৰুটিৰ বাতৰি শ্বেয়াৰ কৰক।",
    noMajorYogas: "এই মৌলিক সংহতি অনুসৰি কোনো প্ৰধান শাস্ত্ৰীয় যোগ স্পষ্ট নহয়।",
    timezoneFailed: "সময় অঞ্চল প্ৰাপ্ত কৰিব পৰা নগ’ল",
    sidereal: "নাক্ষত্ৰিক",
    langEn: "EN",
    langAs: "অ",
    labelJanmaRashi: "🌙 জন্ম ৰাশি",
    labelSuryaRashi: "☀ সূৰ্য ৰাশি",
    labelLagna: "⬆ লগ্ন",
    labelJanmaNakshatra: "⭐ জন্ম নক্ষত্র",
    labelPada: "পদ",
    labelCurrentMD: "⏳ বৰ্তমান মহাদশা",
    labelCurrentAD: "⏳ বৰ্তমান অন্তৰ্দশা",
    mahadashaFormat: "%s মহাদশা",
    antardashaFormat: "%s অন্তৰ্দশা",
  },
};

const rashiNamesAs = [
  "মেষ", "বৃষ", "মিথুন", "কৰ্কট", "সিংহ", "কন্যা",
  "তুলা", "বৃশ্চিক", "ধনু", "মকৰ", "কুম্ভ", "মীন"
];

const nakshatraNamesAs = [
  "অশ্বিনী", "ভৰণী", "কৃত্তিকা", "ৰোহিণী", "মৃগশীৰ্ষ", "আৰ্দ্ৰা",
  "পুনৰ্বসু", "পুষ্যা", "আশ্লেষা", "মঘা", "পূৰ্বা ফাল্গুনী", "উত্তৰা ফাল্গুনী",
  "হস্ত", "চিত্রা", "স্বাতী", "বিশাখা", "অনুৰাধা", "জ্যেষ্ঠা",
  "মূলা", "পূৰ্বাষাঢ়া", "উত্তৰাষাঢ়া", "শ্ৰবণা", "ধনিষ্ঠা", "শতভিষা",
  "পূৰ্ব ভাদ্ৰপদ", "উত্তৰ ভাদ্ৰপদ", "ৰেৱতী"
];

const planetNamesAs = {
  Sun: "সূৰ্য",
  Moon: "চন্দ্ৰ",
  Mars: "মঙ্গল",
  Mercury: "বুধ",
  Jupiter: "বৃহস্পতি",
  Venus: "শুক্ৰ",
  Saturn: "শনি",
  Rahu: "ৰাহু",
  Ketu: "কেতু",
};

let currentLang = "en";

function getStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "as" || stored === "en") return stored;
  } catch (_) {}
  return "en";
}

function t(key) {
  const map = translations[currentLang] || translations.en;
  return map[key] != null ? map[key] : (translations.en[key] || key);
}

function getRashiName(rashiIndex, useLocalized) {
  if (useLocalized && currentLang === "as" && rashiNamesAs[rashiIndex]) {
    return rashiNamesAs[rashiIndex];
  }
  return null;
}

function getNakshatraName(nakshatraIndex, useLocalized) {
  if (useLocalized && currentLang === "as" && nakshatraNamesAs[nakshatraIndex]) {
    return nakshatraNamesAs[nakshatraIndex];
  }
  return null;
}

function getPlanetName(planetKey, useLocalized) {
  if (useLocalized && currentLang === "as" && planetNamesAs[planetKey]) {
    return planetNamesAs[planetKey];
  }
  return null;
}

function setLanguage(lang) {
  if (lang !== "en" && lang !== "as") return;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (_) {}
  document.documentElement.lang = lang === "as" ? "as" : "en";
  applyLanguage();
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const l = btn.getAttribute("data-lang");
    const active = l === lang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
    btn.textContent = l === "en" ? t("langEn") : t("langAs");
  });
  if (typeof window.onLanguageChange === "function") {
    window.onLanguageChange();
  }
}

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.placeholder = t(key);
  });
  const title = document.querySelector("title");
  if (title) title.textContent = t("appTitle");
  const placeDisplay = document.getElementById("place-display");
  const tzDisplay = document.getElementById("timezone-display");
  if (placeDisplay && placeDisplay.classList.contains("muted")) placeDisplay.textContent = t("noPlaceSelected");
  if (tzDisplay && tzDisplay.classList.contains("muted")) tzDisplay.textContent = t("unknown");
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const l = btn.getAttribute("data-lang");
    btn.classList.toggle("active", l === currentLang);
    btn.setAttribute("aria-pressed", l === currentLang);
    btn.textContent = l === "en" ? t("langEn") : t("langAs");
  });
}

currentLang = getStoredLang();
document.documentElement.lang = currentLang === "as" ? "as" : "en";
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyLanguage);
} else {
  applyLanguage();
}

window.i18n = {
  t,
  setLanguage,
  get currentLang() {
    return currentLang;
  },
  getRashiName,
  getNakshatraName,
  getPlanetName,
};
