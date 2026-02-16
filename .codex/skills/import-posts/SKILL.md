---
name: import-posts
description: Publish blog-ready Markdown files by duplicating to `.mdx`, inserting standardized frontmatter, transforming title/image/footnote markup, and moving/copying files and images from "3 Ready to Publish" into "4 Published" and the Astro `src/content/posts` directories. Use for end-to-end blog post publishing preparation.
---

# Import Posts

## Overview

Run a deterministic publishing flow for files in the Ready-to-Publish folder. Keep the original markdown unchanged, create and edit a `.mdx` duplicate, then move/copy the required files and images to published and Astro content destinations.

## Paths

Primary paths (as provided):

- Ready posts: `~/../Posts/Production Content/3 Ready to Publish`
- Ready images: `~/../Posts/Production Content/3 Ready to Publish/images`
- Published posts: `~/../Posts/Production Content/4 Published`
- Published images: `~/../Posts/Production Content/4 Published/images`
- Astro posts destination: `~/src/content/posts`
- Astro images destination: `~/src/content/posts/images`

Use overrides only when the user explicitly provides them.

## Inputs and Defaults

Accept user-provided values for these frontmatter variables:

- `tags`
- `date` (`YYYY-MM-DD`)
- `image`
- `imageAlt`
- `blog` (allowed: `programming`, `wonder`)

Auto-resolve:

- `title`: extract from the first and only level-1 Markdown heading (`# ...`).

If a value is missing, keep the frontmatter key and leave its value empty so the user can fill it later.

## End-to-End Workflow

1. Find the source `.md` file in ready posts.
2. Duplicate it and change duplicate extension to `.mdx`.
3. Never edit the original `.md` content.
4. In the `.mdx` duplicate, insert frontmatter using the required template.
5. Extract the title from the first `#` heading, set `title`, then replace that heading with `<h1>{frontmatter.title}</h1>`.
6. Remove cover image markup if present: `![[blog_some-cover-image-file-name.jpg]]` above or below the title.
7. Convert image wiki links (`![[image-name.jpg]]`) to Markdown image paths under `./images/...`.
8. Normalize image references in `.mdx` so filenames with spaces become either URL-encoded (`%20`) or underscore-formatted names.
9. Add footnote tooltip format when requested (see reference file).
10. Move original `.md` and generated `.mdx` from ready posts to published posts.
11. Move all related images from ready images to published images.
12. Copy the final `.mdx` into `~/src/content/posts`.
13. Copy any referenced images into `~/src/content/posts/images`.
14. Ensure original and duplicate share the same basename (different extensions only).

## Required Frontmatter Template

Use this template in the duplicate `.mdx`.

```yaml
---
author: Eman Harout
tags:
  - [ADD_TAGS]
date: [ADD_DATE_FORMAT_2021-04-14]
featured: false
image: [ADD_IMAGE_REF_./images/blog_intro-to-swift-metatypes.webp]
imageAlt: [ADD_IMAGE_ALT_A Photoshoot]
title: [ADD_TITLE_FROM_H1_HEADER]
blog:
  - programming
  - wonder
---

<h1>{frontmatter.title}</h1>
```

Apply this fill logic:

- If user values are provided, replace bracket placeholders with real values.
- If user values are not provided, keep the key but leave value blank.
- For `blog`, only allow `programming` and/or `wonder`; if unknown or missing, keep `blog:` with no list values.
- Quote `title` when it contains special characters such as `:`.

## Execution Notes

- Support both modes per run:
  - Full automation mode: fill all known values and perform file/image moves.
  - Manual-fill mode: keep missing values blank and continue.
- Show a dry-run summary before file moves whenever the user asks.
- Preserve original file contents exactly; all content edits happen in the `.mdx` duplicate.

## Additional Rules

Apply ordered rules in `references/additional-processing.md` for details on image conversion and footnote tooltip formatting.
