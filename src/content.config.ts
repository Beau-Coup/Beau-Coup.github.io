import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
    /** Unpublished: shown in `astro dev`, left out of production builds. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
