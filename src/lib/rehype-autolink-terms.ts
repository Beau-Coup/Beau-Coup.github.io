import { slugify, type TermTarget } from "./glossary";

/**
 * Build-time rehype plugin: wraps every prose occurrence of a known definition
 * term in a subtle link to its definition anchor.
 *
 * Runs BEFORE rehype-katex, so math is still a plain `<span class="math …">`
 * subtree (skipped here) rather than rendered KaTeX markup. Also skips code,
 * headings, existing links, and a term inside its own defining callout.
 */

interface Options {
  terms: Record<string, TermTarget>;
}

interface Ctx {
  skip: boolean;
  /** Anchors whose term must not be linked in the current subtree (self-definition). */
  suppress: Set<string>;
}

// Standard hast element tags whose text should never be linkified.
const SKIP_TAGS = new Set([
  "a",
  "code",
  "pre",
  "script",
  "style",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

// MDX JSX component names whose text should never be linkified.
const SKIP_JSX = new Set(["a", "code", "pre"]);

// Components that define a term; their own term is suppressed inside.
const DEFINING_JSX = new Set(["Definition", "Proposition", "Proof"]);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function classList(node: any): string[] {
  const cn = node?.properties?.className;
  if (Array.isArray(cn)) return cn.map(String);
  if (typeof cn === "string") return cn.split(/\s+/);
  return [];
}

function jsxAttr(node: any, name: string): string | undefined {
  const attrs = node?.attributes;
  if (!Array.isArray(attrs)) return undefined;
  const found = attrs.find(
    (a: any) => a?.type === "mdxJsxAttribute" && a.name === name && typeof a.value === "string",
  );
  return found?.value;
}

export default function rehypeAutolinkTerms(options: Options) {
  const terms = options?.terms ?? {};
  const keys = Object.keys(terms);
  if (keys.length === 0) return () => {};

  // Longest terms first so multi-word terms win over substrings at a position.
  const byLength = [...keys].sort((a, b) => b.length - a.length);
  const pattern = byLength.map(escapeRegExp).join("|");
  // Whole-word, case-insensitive, optional trailing plural "s".
  const re = new RegExp(`\\b(${pattern})(s)?\\b`, "gi");

  function linkify(value: string, suppress: Set<string>): any[] | null {
    re.lastIndex = 0;
    const out: any[] = [];
    let last = 0;
    let found = false;
    let m: RegExpExecArray | null;
    while ((m = re.exec(value))) {
      const info = terms[m[1].toLowerCase()];
      if (!info || suppress.has(info.anchor)) continue;
      found = true;
      if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
      out.push({
        type: "element",
        tagName: "a",
        properties: { className: ["termref"], href: `/posts/${info.slug}#${info.anchor}` },
        children: [{ type: "text", value: m[0] }],
      });
      last = m.index + m[0].length;
    }
    if (!found) return null;
    if (last < value.length) out.push({ type: "text", value: value.slice(last) });
    return out;
  }

  function childCtx(node: any, ctx: Ctx): Ctx {
    const type = node.type;
    if (type === "element") {
      if (SKIP_TAGS.has(node.tagName)) return { ...ctx, skip: true };
      if (classList(node).some((c) => c.includes("math") || c.includes("katex")))
        return { ...ctx, skip: true };
      return ctx;
    }
    if (type === "mdxJsxFlowElement" || type === "mdxJsxTextElement") {
      const name = node.name ?? "";
      if (SKIP_JSX.has(name)) return { ...ctx, skip: true };
      if (DEFINING_JSX.has(name)) {
        const term = jsxAttr(node, "term");
        if (term) {
          const suppress = new Set(ctx.suppress);
          suppress.add(slugify(term));
          return { ...ctx, suppress };
        }
      }
      return ctx;
    }
    return ctx;
  }

  function walk(node: any, ctx: Ctx): void {
    const children = node.children;
    if (!Array.isArray(children)) return;
    let out: any[] | null = null;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === "text" && !ctx.skip) {
        const replaced = linkify(child.value, ctx.suppress);
        if (replaced) {
          if (!out) out = children.slice(0, i);
          out.push(...replaced);
          continue;
        }
      } else {
        walk(child, childCtx(child, ctx));
      }
      if (out) out.push(child);
    }
    if (out) node.children = out;
  }

  return (tree: any) => {
    walk(tree, { skip: false, suppress: new Set() });
  };
}
