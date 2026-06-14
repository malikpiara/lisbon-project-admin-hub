// Minimal, dependency-free syntax highlighter for the short JS/TS/JSX/bash
// snippets in the component docs. It is a single-pass tokenizer (not regex
// soup), so it never colours inside strings or comments. Input is our own
// trusted doc strings; output is HTML with `tk-*` token spans (styled in
// globals.css).

const KEYWORDS = new Set([
  "import", "from", "export", "default", "const", "let", "var", "return",
  "function", "async", "await", "new", "if", "else", "for", "while", "true",
  "false", "null", "undefined", "type", "interface", "extends", "as",
]);

function esc(ch) {
  if (ch === "&") return "&amp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  return ch;
}

function escStr(s) {
  let out = "";
  for (const ch of s) out += esc(ch);
  return out;
}

const isWordStart = (c) => c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_" || c === "$";
const isWord = (c) => isWordStart(c) || c >= "0" && c <= "9";

export function highlightCode(code) {
  const n = code.length;
  let i = 0;
  let out = "";

  while (i < n) {
    const c = code[i];
    const next = code[i + 1];

    // line comment
    if (c === "/" && next === "/") {
      let j = i;
      while (j < n && code[j] !== "\n") j++;
      out += `<span class="tk-c">${escStr(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    // block comment
    if (c === "/" && next === "*") {
      let j = i + 2;
      while (j < n && !(code[j] === "*" && code[j + 1] === "/")) j++;
      j = Math.min(j + 2, n);
      out += `<span class="tk-c">${escStr(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    // string (single, double, or template — no nested interpolation handling needed here)
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n && code[j] !== c) {
        if (code[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, n);
      out += `<span class="tk-s">${escStr(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    // JSX/HTML tag open: `<Name` or `</Name`
    if (c === "<" && (isWordStart(next) || next === "/")) {
      const closing = next === "/";
      out += `<span class="tk-p">&lt;${closing ? "/" : ""}</span>`;
      i += closing ? 2 : 1;
      let j = i;
      while (j < n && (isWord(code[j]) || code[j] === ".")) j++;
      const name = code.slice(i, j);
      if (name) out += `<span class="tk-t">${escStr(name)}</span>`;
      i = j;
      continue;
    }
    if (c === "/" && next === ">") {
      out += `<span class="tk-p">/&gt;</span>`;
      i += 2;
      continue;
    }
    if (c === ">") {
      out += `<span class="tk-p">&gt;</span>`;
      i++;
      continue;
    }
    // number
    if (c >= "0" && c <= "9") {
      let j = i;
      while (j < n && (isWord(code[j]) || code[j] === ".")) j++;
      out += `<span class="tk-n">${escStr(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    // word: keyword / attribute (word=) / Component (Capitalised) / identifier
    if (isWordStart(c)) {
      let j = i;
      while (j < n && isWord(code[j])) j++;
      const word = code.slice(i, j);
      let cls = null;
      if (KEYWORDS.has(word)) cls = "tk-k";
      else if (code[j] === "=" && code[j + 1] !== "=") cls = "tk-a";
      else if (word[0] >= "A" && word[0] <= "Z") cls = "tk-comp";
      out += cls ? `<span class="${cls}">${escStr(word)}</span>` : escStr(word);
      i = j;
      continue;
    }

    out += esc(c);
    i++;
  }
  return out;
}
