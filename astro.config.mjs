import { defineConfig } from 'astro/config';
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
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
