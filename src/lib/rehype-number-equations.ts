/**
 * Build-time rehype plugin: gives every display-math (`$$…$$`) block a
 * document-wide equation number and resolves `\eqref`/`\ref` cross-references
 * to clickable links.
 *
 * Runs BEFORE rehype-katex, so each math block is still a plain
 * `<div class="math math-display">` / `<span class="math math-inline">` whose
 * single text child is the raw TeX. We rewrite that TeX (inject `\tag{n}`,
 * resolve refs) and let KaTeX render the numbers natively. The counter is
 * per-file, so numbering restarts at (1) for each post.
 *
 * KaTeX has no global counter and no `\label`/`\eqref` support, which is why
 * this has to happen at build time rather than in KaTeX itself.
 */

// Auto-numbering environments (KaTeX would add its own per-line numbers); we
// swap them for the starred, unnumbered variant so our single block-level
// `\tag{n}` is the only number. `aligned`/`align*`/`split` are already
// unnumbered and pass through untouched.
const NUMBERED_ENVS = [
  "equation",
  "align",
  "alignat",
  "flalign",
  "gather",
  "multline",
  "eqnarray",
];

function classList(node: any): string[] {
  const cn = node?.properties?.className;
  if (Array.isArray(cn)) return cn.map(String);
  if (typeof cn === "string") return cn.split(/\s+/);
  return [];
}

function isDisplayMath(node: any): boolean {
  return node?.type === "element" && classList(node).includes("math-display");
}

function isMath(node: any): boolean {
  if (node?.type !== "element") return false;
  const cl = classList(node);
  return cl.includes("math-display") || cl.includes("math-inline");
}

/** Concatenated raw TeX from a math node's text children. */
function getTeX(node: any): string {
  return (node.children ?? [])
    .filter((c: any) => c?.type === "text")
    .map((c: any) => c.value)
    .join("");
}

function setTeX(node: any, value: string): void {
  node.children = [{ type: "text", value }];
}

function starifyEnvs(tex: string): string {
  let out = tex;
  for (const env of NUMBERED_ENVS) {
    // Only match the exact env name (not an already-starred `env*`).
    const begin = new RegExp(`\\\\begin\\{${env}\\}`, "g");
    const end = new RegExp(`\\\\end\\{${env}\\}`, "g");
    out = out.replace(begin, `\\begin{${env}*}`).replace(end, `\\end{${env}*}`);
  }
  return out;
}

/** Author opt-out / manual-override: leave these blocks un-numbered. */
function isManual(tex: string): boolean {
  return /\\notag\b|\\nonumber\b|\\tag\{/.test(tex);
}

export default function rehypeNumberEquations() {
  return (tree: any) => {
    const labels = new Map<string, number>();
    // number assigned to each display node, in document order
    const numbers = new WeakMap<object, number>();
    // cleaned TeX (labels stripped) stashed for pass B
    const cleaned = new WeakMap<object, string>();
    let counter = 0;

    // Pass A: assign numbers, collect + strip labels.
    const passA = (node: any): void => {
      if (isDisplayMath(node)) {
        let tex = getTeX(node);
        if (!isManual(tex)) {
          const num = ++counter;
          numbers.set(node, num);
          tex = tex.replace(/\\label\{([^}]+)\}/g, (_m, key) => {
            labels.set(key, num);
            return "";
          });
          cleaned.set(node, tex);
        }
        return; // never recurse into math
      }
      const children = node.children;
      if (Array.isArray(children)) for (const c of children) passA(c);
    };

    // Resolve \eqref / \ref against the collected label map.
    const resolveRefs = (tex: string): string =>
      tex.replace(/\\(eq)?ref\{([^}]+)\}/g, (_m, eq, key) => {
        const n = labels.get(key);
        if (n === undefined) return "\\text{(?)}";
        return eq ? `\\href{#eq-${n}}{(${n})}` : `\\href{#eq-${n}}{${n}}`;
      });

    // Pass B: resolve refs everywhere, render numbers on display blocks.
    const passB = (node: any): void => {
      if (isMath(node)) {
        if (isDisplayMath(node) && numbers.has(node)) {
          const num = numbers.get(node)!;
          const tex = starifyEnvs(resolveRefs(cleaned.get(node)!));
          // The id must live inside the TeX: rehype-katex replaces this whole
          // element with KaTeX output, so any wrapper property is discarded.
          // `\htmlId` emits `id="eq-N"` on a span in the rendered markup, which
          // is the `\eqref` scroll target. `\tag{N}` renders the number.
          setTeX(node, `\\htmlId{eq-${num}}{${tex}} \\tag{${num}}`);
        } else {
          // inline math, or a manual/opt-out display block: refs still resolve
          const tex = resolveRefs(getTeX(node));
          setTeX(node, tex);
        }
        return; // never recurse into math
      }
      const children = node.children;
      if (Array.isArray(children)) for (const c of children) passB(c);
    };

    passA(tree);
    passB(tree);
  };
}
