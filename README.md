# Vedic Astrology App (Lahiri / Sidereal)

This is a client-side Indian Vedic Astrology web application built for traditional Jyotiṣa study. It computes a sidereal Rāśi (D1) chart, Navāṁśa (D9), Vimśottarī Daśā, and basic interpretations, using the Lahiri ayanāṁśa and classical whole-sign houses.

All calculations run **entirely in the browser** with **no backend**. The app is suitable for deployment on Vercel as a static site.

## Features

- Lahiri (Chitrapaksha) ayanāṁśa
- Julian Day, ΔT, Sun and Moon positions (Meeus-style algorithms)
- Sidereal Rāśi and Nakṣatra calculation, including Pada
- Whole-sign houses and Lagna computation using GMST and obliquity
- Vimśottarī Daśā engine with Mahādaśā and Antardaśā timeline
- North Indian style D1 and D9 (Navāṁśa) charts rendered in SVG
- Nominatim-based place search and automatic timezone resolution
- Summary card, planetary table, daśā table and basic interpretive text
- Hidden debug panel (`Ctrl+Shift+D`) exposing raw astronomical values
- Shareable URL parameters and print-ready kundali layout

> Note: Planetary positions for planets other than Sun and Moon are currently computed with simplified placeholders rather than full VSOP87 series, but the structure is ready to accept higher-precision formulas.

## Running Locally

From the project root:

```bash
npx serve .
```

Then open `http://localhost:3000` (or the URL printed by `serve`) in your browser.

## Deploying to Vercel

1. Install the Vercel CLI if you have not already:

```bash
npm install -g vercel
```

2. From the project root, run:

```bash
vercel --prod
```

The provided `vercel.json` config uses a static build for `index.html` and routes all paths to it, so the app works with client-side navigation and shareable URLs.

## Validation Test Case

To validate that the sidereal Moon / Nakṣatra logic is working as expected, use:

- Date: **1995-09-18**
- Time: **12:00 PM** local time
- Place: **Kolkata, India** (approx. 22.5726°N, 88.3639°E, IST UTC+5:30)

Expected:

- **Janma Rāśi (Moon sign)**: Mithuna (Gemini)
- **Janma Nakṣatra**: Ārdrā

On load, the app also runs a silent validation for this case and logs **PASS/FAIL** with intermediate values in the browser console.

