const fs = require("fs");
const content = fs.readFileSync("routes/leaveRoutes.js", "utf8");

let braceStack = [];
let parenStack = [];
let lineNum = 1;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === "\n") lineNum++;
  if (char === "{") braceStack.push(lineNum);
  if (char === "}") {
    if (braceStack.length === 0) console.log(`Extra close brace at line ${lineNum}`);
    else braceStack.pop();
  }
  if (char === "(") parenStack.push(lineNum);
  if (char === ")") {
    if (parenStack.length === 0) console.log(`Extra close paren at line ${lineNum}`);
    else parenStack.pop();
  }
}

console.log("Unclosed Braces opened at lines:", braceStack);
console.log("Unclosed Parens opened at lines:", parenStack);
