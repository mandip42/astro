"use strict";

const PLANET_ABBRS = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke"
};

const PLANET_COLORS = {
  Sun: "#FF6B35",
  Moon: "#E8E8E8",
  Mars: "#FF4444",
  Mercury: "#44FF44",
  Jupiter: "#FFD700",
  Venus: "#FF99CC",
  Saturn: "#9966CC",
  Rahu: "#666666",
  Ketu: "#996633"
};

function createSvgElement(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    el.setAttribute(k, v);
  }
  return el;
}

function renderNorthIndianChart(container, kundali, opts) {
  container.innerHTML = "";
  const svg = createSvgElement("svg", {
    viewBox: "0 0 100 100",
    class: "chart-svg"
  });

  const outer = createSvgElement("rect", {
    x: 1.5,
    y: 1.5,
    width: 97,
    height: 97,
    rx: 2,
    fill: "none",
    stroke: "#c9a84c",
    "stroke-width": 1.2
  });
  svg.appendChild(outer);

  for (let i = 1; i < 4; i++) {
    const pos = 2 + (96 / 4) * i;
    const v = createSvgElement("line", {
      x1: pos,
      y1: 2,
      x2: pos,
      y2: 98,
      stroke: "#4a4a9e",
      "stroke-width": 0.6
    });
    const h = createSvgElement("line", {
      x1: 2,
      y1: pos,
      x2: 98,
      y2: pos,
      stroke: "#4a4a9e",
      "stroke-width": 0.6
    });
    svg.appendChild(v);
    svg.appendChild(h);
  }

  const centerBg = createSvgElement("rect", {
    x: 38,
    y: 38,
    width: 24,
    height: 24,
    rx: 1.5,
    fill: "rgba(10, 10, 46, 0.9)",
    stroke: "rgba(201, 168, 76, 0.5)",
    "stroke-width": 0.5
  });
  svg.appendChild(centerBg);

  const centerLabel = createSvgElement("text", {
    x: 50,
    y: 50,
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    fill: "#e8b86d",
    "font-size": "6",
    "font-family": "Cinzel, serif",
    "font-weight": "600"
  });
  centerLabel.textContent = opts.title || "D1";
  svg.appendChild(centerLabel);

  const houseCells = [
    { house: 12, x: 2, y: 2, w: 24, h: 24 },
    { house: 1, x: 26, y: 2, w: 24, h: 24 },
    { house: 2, x: 50, y: 2, w: 24, h: 24 },
    { house: 3, x: 74, y: 2, w: 24, h: 24 },
    { house: 11, x: 2, y: 26, w: 24, h: 24 },
    { house: 4, x: 74, y: 26, w: 24, h: 24 },
    { house: 10, x: 2, y: 50, w: 24, h: 24 },
    { house: 5, x: 74, y: 50, w: 24, h: 24 },
    { house: 9, x: 2, y: 74, w: 24, h: 24 },
    { house: 8, x: 26, y: 74, w: 24, h: 24 },
    { house: 7, x: 50, y: 74, w: 24, h: 24 },
    { house: 6, x: 74, y: 74, w: 24, h: 24 }
  ];

  const houses = kundali.houses;
  const lagnaHouse = 1;
  const houseNumSize = 4.2;
  const rashiSize = 3.8;
  const planetSize = 4.5;
  const planetLineHeight = 5.5;
  const lagnaSize = 5;

  houseCells.forEach(cell => {
    const houseData = houses[cell.house];
    const rashiIndex = houseData ? houseData.rashiIndex : null;
    const rashi = rashiIndex != null ? window.VedicAstroEngine.RASHIS[rashiIndex] : null;

    const label = createSvgElement("text", {
      x: cell.x + 3,
      y: cell.y + 4,
      "text-anchor": "start",
      "dominant-baseline": "hanging",
      fill: "#c9a84c",
      "font-size": String(houseNumSize),
      "font-weight": "600"
    });
    label.textContent = String(cell.house);
    svg.appendChild(label);

    if (rashi) {
      const rashiLabel = createSvgElement("text", {
        x: cell.x + cell.w - 3,
        y: cell.y + 4,
        "text-anchor": "end",
        "dominant-baseline": "hanging",
        fill: "#b8a890",
        "font-size": String(rashiSize)
      });
      rashiLabel.textContent = rashi.abbr;
      svg.appendChild(rashiLabel);
    }

    const planets = (houseData && houseData.planets) || [];
    planets.forEach((p, idx) => {
      const px = cell.x + cell.w / 2;
      const py = cell.y + 11 + idx * planetLineHeight;
      const text = createSvgElement("text", {
        x: px,
        y: py,
        "text-anchor": "middle",
        "dominant-baseline": "hanging",
        fill: PLANET_COLORS[p.key] || "#ffffff",
        "font-size": String(planetSize),
        "font-weight": "600"
      });
      let labelText = PLANET_ABBRS[p.key] || p.key[0];
      if (p.retrograde) labelText += "(R)";
      text.textContent = labelText;
      svg.appendChild(text);
    });

    if (cell.house === lagnaHouse) {
      const lg = createSvgElement("text", {
        x: cell.x + cell.w / 2,
        y: cell.y + cell.h - 4,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        fill: "#e8b86d",
        "font-size": String(lagnaSize),
        "font-weight": "700"
      });
      lg.textContent = "Lg";
      svg.appendChild(lg);
    }
  });

  container.appendChild(svg);
}

function buildNavamsaHouses(kundali) {
  const houses = {};
  for (let h = 1; h <= 12; h++) {
    houses[h] = {
      number: h,
      rashiIndex: (kundali.lagnaRashi.index + h - 1) % 12,
      planets: []
    };
  }
  kundali.planets.forEach(p => {
    const rIndex = p.navamsaRashiIndex;
    if (!Number.isFinite(rIndex)) return;
    const houseNo = ((rIndex - kundali.lagnaRashi.index + 12) % 12) + 1;
    if (!Number.isFinite(houseNo) || houseNo < 1 || houseNo > 12 || !houses[houseNo]) {
      return;
    }
    houses[houseNo].planets.push({
      key: p.key,
      retrograde: p.retrograde
    });
  });
  return houses;
}

window.KundaliChart = {
  renderNorthIndianChart,
  buildNavamsaHouses
};

