import { defineConfig, fontProviders } from 'astro/config';
import icon from "astro-icon";
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import remarkSectionize from 'remark-sectionize';
import {
  // [!code --] and [!code ++]
  // <pre class="has-diff">
  // <span class="line diff add">
  // <span class="line diff remove">
  transformerNotationDiff,

  // [!code highlight]
  // <pre class="has-highlighted">
  // <span class="line highlighted">
  transformerNotationHighlight,

  // Create codefence with lang, then select which lines to highlight between curly brackets
  // ```swift {1,3-4}
  // <span class="line highlighted">
  transformerMetaHighlight,

  // [!code word:MyRandomWord] or specify number of lines to match: [!code word:Hello:2]
  // <span class="highlighted-word">MyRandomWord</span>
  transformerNotationWordHighlight,

  // Create codefence with lang, then select which substring to highlight, highlights all matches
  //  throughout code block.
  // ```swift /MyRandomWordToHighlight/
  // <span class="highlighted-word">MyRandomWordToHighlight</span>
  transformerMetaWordHighlight,

  // [!code focus] or specify number of lines to match: // [!code focus:2]
  // <pre class="has-focused">
  // <span class="line focused">
  transformerNotationFocus,

  // [!code error], [!code warning] or [!code info]
  // <pre class="has-highlighted">
  // error: <span class="line highlighted error">
  // warning: <span class="line highlighted warning">
  // info: <span class="line highlighted info">
  transformerNotationErrorLevel,
} from '@shikijs/transformers';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [
    icon({
      iconDir: "src/assets/icons",
    }),
    mdx(),
    sitemap(),
    // Dev-only pages (not part of the built site): /dev/compare shows the experimental light styles side by side.
    {
      name: 'dev-only-pages',
      hooks: {
        'astro:config:setup': ({ command, injectRoute }) => {
          if (command === 'dev') {
            injectRoute({ pattern: '/dev/compare', entrypoint: './src/dev/compare.astro' });
          }
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  // Self-hosted from the @fontsource-variable packages (no network needed at build time).
  // Rendered and preloaded by <Font /> in RootLayout.astro, and used by Tailwind's `font-serif` and
  // `font-sans` via src/styles/input.css. Astro also generates metric-matched fallback fonts, which
  // reduces layout shift while the web fonts load.
  //
  // Only the Latin subset is included: posts don't use other scripts, and `local` variants can't be
  // tagged by subset, so adding more files would make <Font preload /> preload all of them.
  // (Astro 7.4's `npm` provider would pick subsets itself, but fails to read files from node_modules.)
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Frank Ruhl Libre Variable',
      options: {
        variants: [{
          src: ['@fontsource-variable/frank-ruhl-libre/files/frank-ruhl-libre-latin-wght-normal.woff2'],
          weight: '300 900',
          style: 'normal',
        }],
      },
      cssVariable: '--font-frank-ruhl-libre',
      fallbacks: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    },
    {
      provider: fontProviders.local(),
      name: 'Inter Variable',
      options: {
        variants: [{
          src: ['@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'],
          weight: '100 900',
          style: 'normal',
        }],
      },
      cssVariable: '--font-inter',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],
  markdown: {
    // Astro 7 defaults to the Sätteri processor; keep remark/rehype for our plugins.
    processor: unified({
      remarkPlugins: [remarkSectionize],
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: '_blank', // Open links in a new tab
            rel: ['nofollow', 'noopener', 'noreferrer'], // Security attributes
          },
        ],
      ],
    }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      defaultColor: false,
      themes: {
        light: 'github-light',
        dark: 'houston',
      },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerMetaHighlight(),
        transformerNotationWordHighlight(),
        transformerMetaWordHighlight(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
      ],
    },
  },
  site: 'https://emanharout.com',
  // Astro 7 changed the default to 'jsx', which strips whitespace between inline elements.
  compressHTML: true,
});
