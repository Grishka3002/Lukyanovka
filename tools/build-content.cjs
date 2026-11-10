const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const content = JSON.parse(fs.readFileSync(path.join(root, "data/content.json"), "utf8"));
fs.writeFileSync(path.join(root, "content-defaults.js"),
  "// Generated from data/content.json by tools/build-content.cjs\nwindow.MAORI_DEFAULT_CONTENT = " + JSON.stringify(content) + ";\n");
console.log("Built bundled content fallback");
