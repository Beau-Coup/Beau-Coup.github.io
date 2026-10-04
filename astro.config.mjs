// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeAutolinkTerms from './src/lib/rehype-autolink-terms';
import rehypeNumberEquations from './src/lib/rehype-number-equations';
import { TERM_MAP } from './src/lib/glossary';
import { KATEX_MACROS } from './src/lib/katex-macros';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  // Self-host the fonts (downloaded at build) and generate metric-matched
  // fallbacks, so text doesn't reflow when the web font swaps in.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['400', '500', '600'],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'serif'],
      options: { experimental: { variableAxis: { opsz: [['6', '72']] } } },
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      weights: ['400', '500', '600'],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: ['400', '500'],
      styles: ['normal'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    // Auto-link term references before KaTeX renders math, so the linker only
    // ever sees plain prose text (never KaTeX markup). Then number every
    // display equation and resolve \eqref links, still on raw TeX, before
    // rehype-katex renders it. `trust` lets the injected \htmlId (anchor id)
    // and \href (eqref link) through; `strict` allows the \htmlId extension.
    rehypePlugins: [
      [rehypeAutolinkTerms, { terms: TERM_MAP }],
      rehypeNumberEquations,
      [
        rehypeKatex,
        {
          macros: KATEX_MACROS,
          trust: (/** @type {{ command: string }} */ ctx) =>
            ctx.command === '\\href' || ctx.command === '\\htmlId',
          strict: (/** @type {string} */ code) =>
            code === 'htmlExtension' ? 'ignore' : 'warn',
        },
      ],
    ],
  },
});