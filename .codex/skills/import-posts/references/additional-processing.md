# Additional Processing Instructions

## Ordered Processing Rules

Apply these in order to the copy in `./src/content/posts`, after creating it.

1. Remove cover image `![[blog_some-cover-image-file-name.jpg]]` near the original H1.
2. Extract title from first level-1 heading (`# Title`) and delete that heading line (the layout renders the title from frontmatter).
3. Set frontmatter `title` from extracted heading text.
4. Convert wiki image syntax `![[file name.jpg]]` to Markdown image syntax using `./images/...` paths.
5. Normalize image references with spaces in filenames:
   - URL-encoded form is acceptable: `EmanHarout%20Blog%20-%20Image.jpg`
   - Underscore form is acceptable: `EmanHarout_Blog_-_Image.jpg`
6. Update frontmatter `image` to match the cover/imported image path under `./images/...`.
7. Keep footnotes as plain Markdown footnotes (see below).

## Frontmatter Fill Rules

- Fill placeholders when user provides values.
- Leave keys present with blank values when not provided.
- `blog` accepts only:
  - `programming`
  - `wonder`

## Footnotes

Write footnotes as plain Markdown footnotes. The site turns each one into a side note next to its number (or a note that opens in place on small screens), so they need no extra markup:

```md
This sentence ends with a footnote.[^1]

[^1]: This is the footnote.
```

Notes:
- Don't use MDX syntax such as `{frontmatter.someKey}` or `<span tip={...}>`: posts are `.md`, so it would show up as literal text.

## File Placement Rules

After content edits are complete:

Path base rule: Resolve `./` and `../` from repository root (execution working directory), not from this reference file's location.

1. Move the original `.md` to `../Posts/Production Content/4 Published`.
2. Copy referenced images to `./src/content/posts/images`.
3. Move related images from `../Posts/Production Content/3 Ready to Publish/images` to `../Posts/Production Content/4 Published/images`.

## Verification Checklist

- Original markdown file unchanged (except relocation).
- The copy in `./src/content/posts` is `.md` and has the same filename as the original.
- Frontmatter exists and keys are present.
- Title is sourced from first `#` heading.
- Body contains no `# Title` heading or `<h1>`; the title lives only in frontmatter.
- No remaining Obsidian wiki image syntax unless user explicitly requests it.
- Referenced images exist in both Published and Astro image destinations.
