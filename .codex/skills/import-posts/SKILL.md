---
name: import-posts
description: Publish blog-ready Markdown files by copying them into the Astro `src/content/posts` directory, inserting standardized frontmatter, transforming title/image markup, and moving the originals and images from "3 Ready to Publish" into "4 Published". Use for end-to-end blog post publishing preparation.
---

# Import Posts

## Overview

Run a deterministic publishing flow for files in the Ready-to-Publish folder. Keep the original markdown unchanged: copy it into `./src/content/posts` (same filename, still `.md`) and edit only that copy, then move the original and copy the images to the published and Astro content destinations.

## Paths

Path base rule: All relative paths in this skill are resolved from the repository root (the command working directory), not from this file's location. So `./` means repo root and `../` means one directory above repo root.

Primary paths (as provided):

- Ready posts: `../Posts/Production Content/3 Ready to Publish`
- Ready images: `../Posts/Production Content/3 Ready to Publish/images`
- Published posts: `../Posts/Production Content/4 Published`
- Published images: `../Posts/Production Content/4 Published/images`
- Astro posts destination: `./src/content/posts`
- Astro images destination: `./src/content/posts/images`

Use overrides only when the user explicitly provides them.

## Inputs and Defaults

Accept user-provided values for these frontmatter variables:

- `tags`
- `date` (`YYYY-MM-DD`)
- `image`
- `imageAlt`
- `description` (one-sentence summary used for meta description, social cards, and RSS)
- `blog` (allowed: `programming`, `wonder`)

Auto-resolve:

- `title`: extract from the first and only level-1 Markdown heading (`# ...`).

If a value is missing, keep the frontmatter key and leave its value empty so the user can fill it later.

## End-to-End Workflow

1. Find the source `.md` file in ready posts.
2. Copy it into `./src/content/posts` with the same filename. Posts are plain Markdown (`.md`); the site doesn't support `.mdx`.
3. Never edit the original `.md` content.
4. In the copy, insert frontmatter using the required template.
5. Extract the title from the first `#` heading, set `title`, then delete that heading line. The site layout renders the title from frontmatter, so the body must not contain an `<h1>`.
6. Remove cover image markup if present: `![[blog_some-cover-image-file-name.jpg]]` above or below the title.
7. Convert image wiki links (`![[image-name.jpg]]`) to Markdown image paths under `./images/...`.
8. Normalize image references in the copy so filenames with spaces become either URL-encoded (`%20`) or underscore-formatted names.
9. Keep footnotes as plain Markdown footnotes (`[^1]` and `[^1]: ...`); the site shows them as side notes (see reference file).
10. Move the original `.md` from ready posts to published posts.
11. Copy any referenced images into `./src/content/posts/images`.
12. Move all related images from ready images to published images.
13. Ensure the original and the copy share the same filename.

## Required Frontmatter Template

Use this template in the copy in `./src/content/posts`.

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
description: [ADD_ONE_SENTENCE_SUMMARY]
blog:
  - programming
  - wonder
---
```

Apply this fill logic:

- If user values are provided, replace bracket placeholders with real values.
- If user values are not provided, keep the key but leave value blank.
- For `blog`, only allow `programming` and/or `wonder`; if unknown or missing, keep `blog:` with no list values.
- Quote `title` and `description` when they contain special characters such as `:`.
- `description` is required by the content schema; a blank value fails `npm run build` until it is filled in.

## Execution Notes

- Support both modes per run:
  - Full automation mode: fill all known values and perform file/image moves.
  - Manual-fill mode: keep missing values blank and continue.
- Show a dry-run summary before file moves whenever the user asks.
- Preserve original file contents exactly; all content edits happen in the copy in `./src/content/posts`.

## Additional Rules

Apply ordered rules in `references/additional-processing.md` for details on image conversion and footnote tooltip formatting.
