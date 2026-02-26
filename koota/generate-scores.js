// One-time script to generate koota/scores.json from the same formula as matching.js
const GANA = [0,1,1,1,1,2,1,0,2,1,1,1,0,0,0,1,0,1,1,1,1,1,1,1,1,1,0];
function score(i, j) {
  if (i === j) return 0;
  const gi = GANA[i], gj = GANA[j];
  if ((gi === 0 && gj === 2) || (gi === 2 && gj === 0)) return 22;
  let diff = Math.abs(i - j);
  if (diff > 13) diff = 27 - diff;
  if (diff === 9 || diff === 18) return 8;
  return Math.max(0, Math.min(36, 36 - 2 * diff));
}
const grid = [];
for (let i = 0; i < 27; i++) {
  const row = [];
  for (let j = 0; j < 27; j++) row.push(score(i, j));
  grid.push(row);
}
const fs = require("fs");
const path = require("path");
fs.writeFileSync(path.join(__dirname, "scores.json"), JSON.stringify(grid, null, 0));
