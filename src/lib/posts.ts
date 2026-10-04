import { getCollection } from "astro:content";

/**
 * Drafts: a post with `draft: true` in its frontmatter is unpublished.
 * It shows during `astro dev` (so you can preview it) and is left out of
 * production builds: no page, no list entry, no glossary terms.
 */
export const SHOW_DRAFTS = import.meta.env.DEV;

/** Every blog post that should appear in this build. */
export const getPosts = () =>
  getCollection("blog", ({ data }) => SHOW_DRAFTS || !data.draft);
