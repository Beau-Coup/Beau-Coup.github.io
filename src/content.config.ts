import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tag: z.string(),
    rating: z.number().int().min(0).max(3).optional(),
    excerpt: z.string(),
  }),
});

export const collections = { blog };
