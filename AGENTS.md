# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro-based personal blog.
- `src/pages/`: route files (`.astro`, dynamic routes like `blog/[...id].astro`, RSS endpoints).
- `src/components/`: reusable UI components (headers, cards, pagination, search, tags).
- `src/layouts/`: shared page/layout wrappers.
- `src/content/posts/`: blog content in `.mdx` plus post images under `src/content/posts/images/`.
- `src/scripts/`: client-side and utility scripts (navigation, search, theme toggle, TOC).
- `src/styles/`: Tailwind input and syntax-highlighting styles.
- `public/`: static assets served as-is.
- `dist/`: build output (generated).

## Build, Test, and Development Commands
Run from repo root:
- `npm install`: install dependencies.
- `npm run dev` (or `npm start`): start local dev server at `http://localhost:4321`.
- `npm run build`: run `astro check` then create production build in `dist/`.
- `npm run preview`: serve the built site locally for final verification.
- `npm run astro -- --help`: inspect Astro CLI options.

## Coding Style & Naming Conventions
- Use TypeScript/ES module syntax where applicable.
- Use 2-space indentation in Astro, TS, JS, and config files.
- Keep component and layout names in PascalCase (e.g., `BlogGridCard.astro`, `MainLayout.astro`).
- Keep utility/client scripts in camelCase (e.g., `navHighlighter.ts`).
- Use descriptive route and content filenames; preserve existing slug patterns for posts.
- Tailwind is the primary styling approach; keep shared styles in `src/styles/input.css`.

## Testing Guidelines
There is no separate unit-test suite configured today. Treat the following as required checks:
- `npm run build` must pass (`astro check` + production build).
- Manually verify key pages in `npm run dev`/`npm run preview` (home, blog list, post page, search, tags, RSS).
- For content changes, validate frontmatter and image paths in `src/content/posts/`.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects (e.g., `Fix typo`, `Update astro`, `Fixes in article`). Follow the same style:
- Keep subject concise, present tense, and specific.
- Group related changes in one commit.
- In PRs, include: purpose, changed paths, verification steps, and screenshots for UI changes.
- Link related issues/tasks when applicable.
