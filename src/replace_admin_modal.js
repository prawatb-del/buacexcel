import fs from 'fs';

let mainCode = fs.readFileSync('src/App.tsx', 'utf8');
let replacement = fs.readFileSync('src/new_admin.txt', 'utf8');

// Find start
const startMarker = '  const renderAdminModal = () => {';
const startIdx = mainCode.indexOf(startMarker);
if (startIdx === -1) {
  console.error("Start marker not found!");
  process.exit(1);
}

// Find end (the beginning of selectedEpisode null check)
const endMarker = '  if (selectedEpisode === null) {';
const endIdx = mainCode.indexOf(endMarker);
if (endIdx === -1) {
  console.error("End marker not found!");
process.exit(1);
}

const before = mainCode.substring(0, startIdx);
const after = mainCode.substring(endIdx);

const finalCode = before + replacement + '\n\n' + after;
fs.writeFileSync('src/App.tsx', finalCode, 'utf8');
console.log("Replaced successfully!");
