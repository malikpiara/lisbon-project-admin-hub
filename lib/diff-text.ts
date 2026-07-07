// Word-level text diff (LCS over whitespace-preserving tokens). Powers the
// "what exactly changed" rendering in version history and the review queue —
// the field-level diff in lib/diff-versions.js says WHICH field changed; this
// says which words changed inside it. Ported from Malik's V0 prototype.

export type DiffType = "equal" | "insert" | "delete";

export type DiffOp = {
  type: DiffType;
  value: string;
};

// LCS is O(n·m) time and memory. Article bodies are a few hundred tokens;
// anything past this cap (pathological paste) falls back to replace-all
// rather than freezing the tab.
const MAX_TOKENS = 2000;

function tokenize(input: string): string[] {
  return input.match(/\s+|[^\s]+/g) ?? [];
}

export function diffWords(before: string, after: string): DiffOp[] {
  if (before === after) {
    return before ? [{ type: "equal", value: before }] : [];
  }

  const a = tokenize(before);
  const b = tokenize(after);
  const n = a.length;
  const m = b.length;

  if (n > MAX_TOKENS || m > MAX_TOKENS) {
    const ops: DiffOp[] = [];
    if (before) ops.push({ type: "delete", value: before });
    if (after) ops.push({ type: "insert", value: after });
    return ops;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", value: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "delete", value: a[i] });
      i++;
    } else {
      ops.push({ type: "insert", value: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "delete", value: a[i++] });
  while (j < m) ops.push({ type: "insert", value: b[j++] });

  return mergeOps(ops);
}

// Collapse runs of same-type ops so each highlighted span covers a phrase,
// not a single word — fewer DOM nodes and a calmer rendering.
function mergeOps(ops: DiffOp[]): DiffOp[] {
  const merged: DiffOp[] = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.value += op.value;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

export type DiffStats = {
  additions: number;
  deletions: number;
  unchanged: number;
};

export function diffStats(ops: DiffOp[]): DiffStats {
  const count = (s: string) => (s.match(/[^\s]+/g) ?? []).length;
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  for (const op of ops) {
    if (op.type === "insert") additions += count(op.value);
    else if (op.type === "delete") deletions += count(op.value);
    else unchanged += count(op.value);
  }
  return { additions, deletions, unchanged };
}
