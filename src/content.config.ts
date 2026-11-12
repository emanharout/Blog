import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const postSchema = z.object({
    author: z.string(),
    tags: z.array(z.string()),
    date: z.date(),
    featured: z.boolean().default(false),
    imageAlt: z.string().optional(),
    title: z.string(),
    // One-sentence summary used for the meta description, social cards, RSS and search.
    description: z.string().min(1),
    blog: z.array(z.string()),
});

// We add `image` to our `postSchema` here because running `npm run build` gives an error when we access
// `image` outside of `defineCollection` call.
const blogPostsCollection = defineCollection({
    loader: glob({ pattern: ['**/[^_]*.md', '**/[^_]*.mdx'], base: './src/content/posts' }),
    schema: ({ image }) =>
        postSchema.extend({
            image: image().optional(),
        }),
});

export const collections = {
    posts: blogPostsCollection,
};
