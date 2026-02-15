# emanharout.com

Personal site and blog built with Astro, MDX, and Tailwind CSS v4.

## Project Structure

```text
/
├── public/
├── src/
│   ├── components/
│   ├── content/posts/
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Requirements

- Node.js `>=20.19.0`
- npm (the version bundled with your Node install is fine)

Use the pinned Node version in this repo:

```bash
nvm use
```

## Commands

- `npm install`: Install dependencies
- `npm run dev` (or `npm start`): Start local dev server at `http://localhost:4321`
- `npm run build`: Run `astro check` and build production output to `dist/`
- `npm run preview`: Serve the built site locally
- `npm run astro -- --help`: Show Astro CLI help

## Deployment (Cloudflare Pages)

Set Cloudflare Pages to use Node `20.19.0` or newer.

Recommended setup:

1. In Cloudflare Pages project settings, set environment variable `NODE_VERSION=20.19.0`.
2. Keep build command as `npm run build`.
3. Keep output directory as `dist`.

## Verification Checklist

After significant changes:

1. Run `npm run build`.
2. Verify key routes in `npm run preview`:
   - `/`
   - `/blog`
   - `/blog/programming`
   - `/blog/wonder`
   - `/tags`
   - `/search`
3. Spot-check one blog post page and RSS routes.
