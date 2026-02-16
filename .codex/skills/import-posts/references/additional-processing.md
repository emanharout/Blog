# Additional Processing Instructions

## Ordered Processing Rules

Apply these in order after creating the `.mdx` duplicate.

1. Remove cover image `![[blog_some-cover-image-file-name.jpg]]` near the original H1.
2. Extract title from first level-1 heading (`# Title`) and replace that heading with `<h1>{frontmatter.title}</h1>`.
3. Set frontmatter `title` from extracted heading text.
4. Convert wiki image syntax `![[file name.jpg]]` to Markdown image syntax using `./images/...` paths.
5. Normalize image references with spaces in filenames:
   - URL-encoded form is acceptable: `EmanHarout%20Blog%20-%20Image.jpg`
   - Underscore form is acceptable: `EmanHarout_Blog_-_Image.jpg`
6. Update frontmatter `image` to match the cover/imported image path under `./images/...`.
7. Apply footnote tooltip format when the user requests tooltips.

## Frontmatter Fill Rules

- Fill placeholders when user provides values.
- Leave keys present with blank values when not provided.
- `blog` accepts only:
  - `programming`
  - `wonder`

## Footnote Tooltip Format

Use this style when adding tooltips:

```mdx
---
firstFootnote: This is a test footnote.
---

This sentence ends with a footnote<span tip={frontmatter.firstFootnote}>[^1]</span>.

[^1]: {frontmatter.firstFootnote}
```

Notes:
- Add one frontmatter key per reusable footnote value.
- Keep footnote index and frontmatter variable aligned.

## File Placement Rules

After content edits are complete:

1. Move original `.md` and new `.mdx` to `~/../Posts/Production Content/4 Published`.
2. Move related images from `~/../Posts/Production Content/3 Ready to Publish/images` to `~/../Posts/Production Content/4 Published/images`.
3. Copy `.mdx` to `~/src/content/posts`.
4. Copy referenced images to `~/src/content/posts/images`.

## Verification Checklist

- Original markdown file unchanged (except relocation).
- Duplicate file extension is `.mdx`.
- Frontmatter exists and keys are present.
- Title is sourced from first `#` heading.
- Body uses `<h1>{frontmatter.title}</h1>`.
- No remaining Obsidian wiki image syntax unless user explicitly requests it.
- Referenced images exist in both Published and Astro image destinations.
