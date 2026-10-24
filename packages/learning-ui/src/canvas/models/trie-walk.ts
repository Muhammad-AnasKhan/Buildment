// 23.3 "Keep the best three at every node". The trie of the chapter code, with
// the best k queries stored on every node, and the walk the picture draws:
// one step for each letter typed, and nothing read below the node reached.
// Pure functions, no React.

export const K = 3;
/** The box holds this many characters; "shower curtain" is the longest query. */
export const MAX_TYPED = 14;

/** Nine made-up queries with counts, frozen (chapter 23.3). */
export const QUERIES: readonly (readonly [string, number])[] = [
  ["shoes", 9200],
  ["shirt", 7000],
  ["watch", 5200],
  ["shorts", 4100],
  ["shoes red", 3100],
  ["sheets", 2600],
  ["shower curtain", 1800],
  ["shoulder bag", 1500],
  ["shoelaces", 900],
];

/** The keys on the picture, in two rows of seven. The last is the backspace key. */
export const KEYS = ["s", "h", "o", "e", "r", "w", "a", "t", "i", "u", "c", "l", " ", "back"] as const;
export type Key = (typeof KEYS)[number];

export type Entry = readonly [string, number];

export type TrieNode = {
  /** The letters from the root to this node. */
  prefix: string;
  next: Map<string, TrieNode>;
  /** The best k queries that start with the prefix, best first. */
  top: Entry[];
};

export type Trie = { root: TrieNode; nodes: number; characters: number };

/** The build of the chapter: every query is offered to every node on its path; a node keeps the best k. */
export function buildTrie(queries: readonly Entry[] = QUERIES, k = K): Trie {
  const root: TrieNode = { prefix: "", next: new Map(), top: [] };
  let nodes = 1;
  let characters = 0;
  for (const [text, count] of queries) {
    characters += text.length;
    let node = root;
    for (const ch of text) {
      if (!node.next.has(ch)) {
        node.next.set(ch, { prefix: node.prefix + ch, next: new Map(), top: [] });
        nodes += 1;
      }
      node = node.next.get(ch) as TrieNode;
      node.top.push([text, count]);
      node.top.sort((a, b) => b[1] - a[1]);
      if (node.top.length > k) node.top.pop();
    }
  }
  return { root, nodes, characters };
}

export const TRIE = buildTrie();

export type Walk = {
  typed: string;
  /** Nodes from the root to the node reached (the root first). */
  path: TrieNode[];
  /** The node the walk stands on, or null when a letter had no child. */
  node: TrieNode | null;
  /** The first letter that had no child; the walk stops there. */
  dead: string | null;
  /** Letters walked, counting the one that failed. */
  steps: number;
  /** The answer: the list stored on the node. Empty when the walk is dead or nothing is typed. */
  answer: Entry[];
  /** Letters (and the space) that lead on from the node, in order. */
  children: string[];
  /** Queries read below the node. Always 0: the answer is stored. */
  readBelow: 0;
};

export function walk(typed: string, trie: Trie = TRIE): Walk {
  const path: TrieNode[] = [trie.root];
  let node: TrieNode = trie.root;
  let dead: string | null = null;
  for (const ch of typed) {
    const child = node.next.get(ch);
    if (!child) {
      dead = ch;
      break;
    }
    node = child;
    path.push(node);
  }
  const alive = dead === null;
  const steps = alive ? typed.length : path.length;
  return {
    typed,
    path,
    node: alive ? node : null,
    dead,
    steps,
    answer: alive ? node.top : [],
    children: alive ? [...node.next.keys()].sort() : [],
    readBelow: 0,
  };
}

/** The box after a key: a letter or space is added (up to MAX_TYPED), the back key removes the last one. */
export function press(typed: string, key: Key): string {
  if (key === "back") return typed.slice(0, -1);
  return typed.length >= MAX_TYPED ? typed : typed + key;
}

export type Verdict = { text: string; tone: "accent" | "good" | "warn" };

/** At most 38 characters. */
export function trieVerdict(w: Walk): Verdict {
  if (w.typed.length === 0) return { text: "Type a letter to walk down", tone: "accent" };
  if (w.answer.length > 0) return { text: "Answer read from 1 node", tone: "good" };
  return { text: "No query starts with this", tone: "warn" };
}

/** The keys that lead on from the walk's node, as a set of key names. */
export function nextKeys(w: Walk): Set<string> {
  return new Set(w.children);
}

export const keyName = (key: Key) => (key === " " ? "space" : key === "back" ? "backspace" : key);

/** The typed text in quotes, for a screen reader. */
export const typedText = (typed: string) => (typed.length === 0 ? "nothing typed" : `"${typed}"`);

/** One entry as the picture writes it: "shoes 9200". */
export const entryText = ([text, count]: Entry) => `${text} ${count}`;

/** The live-region sentence: what is typed and what the node answers. */
export function walkSentence(w: Walk): string {
  const head = `Typed ${typedText(w.typed)}, ${w.steps} ${w.steps === 1 ? "step" : "steps"}, read below the node: 0.`;
  if (w.typed.length === 0) return `${head} Type a letter to walk down.`;
  if (w.dead !== null) return `${head} No query starts with this.`;
  if (w.answer.length === 0) return `${head} Nothing is stored here.`;
  return `${head} Answer: ${w.answer.map(entryText).join(", ")}.`;
}
