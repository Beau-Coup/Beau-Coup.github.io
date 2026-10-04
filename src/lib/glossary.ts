import fs from "node:fs";
import path from "node:path";

// Resolved from the project root so the path is stable whether this module is
// evaluated by Vite (pages) or bundled into astro.config (rehype plugin setup).
const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

// Drafts (`draft: true` in frontmatter) are skipped in production builds, so
// no term link points at an unpublished post. This module also runs inside
// astro.config, where import.meta.env is not set, so read NODE_ENV.
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";
const isDraft = (source: string): boolean => {
  const fm = source.match(/^---\s*\n([\s\S]*?)\n---/);
  return !!fm && /^draft:\s*true\s*$/m.test(fm[1]);
};

export type GlossaryKind =
  | "definition"
  | "theorem"
  | "lemma"
  | "proposition";

export interface GlossaryItem {
  /** Display name, e.g. "Random Variable". */
  term: string;
  kind: GlossaryKind;
  /** Post id (matches CollectionEntry.id), e.g. "prob-foundations". */
  slug: string;
  /** In-page anchor, e.g. "random-variable". Matches the id rendered by the component. */
  anchor: string;
}

/** Term → link target. Must stay in lockstep with the `id` the components render. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeKind(type: string | undefined): GlossaryKind {
  const t = (type ?? "proposition").toLowerCase();
  if (t === "theorem") return "theorem";
  if (t === "lemma") return "lemma";
  if (t === "definition") return "definition";
  return "proposition";
}

function attr(raw: string, name: string): string | undefined {
  const m = raw.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : undefined;
}

function parseFile(slug: string, source: string): GlossaryItem[] {
  const items: GlossaryItem[] = [];
  const re = /<(Definition|Proposition)\b([^>]*)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const [, comp, rawAttrs] = m;
    const term = (attr(rawAttrs, "term") ?? "").trim();
    if (!term) continue; // untermed items aren't link targets and have no anchor
    const kind =
      comp === "Definition" ? "definition" : normalizeKind(attr(rawAttrs, "type"));
    items.push({ term, kind, slug, anchor: slugify(term) });
  }
  return items;
}

function buildGlossary(): GlossaryItem[] {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f: string) => f.endsWith(".md") || f.endsWith(".mdx"));
  const items: GlossaryItem[] = [];
  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const source = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    if (!SHOW_DRAFTS && isDraft(source)) continue;
    items.push(...parseFile(slug, source));
  }
  return items.sort((a, b) => a.term.localeCompare(b.term));
}

/** Every termed definition/theorem/lemma/proposition across the blog. */
export const GLOSSARY: GlossaryItem[] = buildGlossary();

export interface TermTarget {
  slug: string;
  anchor: string;
}

/**
 * Lowercased term → link target, for the auto-linker. Definitions only:
 * theorems/lemmas are rarely referenced by a bare noun phrase in prose.
 * First definition wins on the rare cross-post term collision.
 */
export const TERM_MAP: Record<string, TermTarget> = (() => {
  const map: Record<string, TermTarget> = {};
  for (const item of GLOSSARY) {
    if (item.kind !== "definition") continue;
    const key = item.term.toLowerCase();
    if (!map[key]) map[key] = { slug: item.slug, anchor: item.anchor };
  }
  return map;
})();
