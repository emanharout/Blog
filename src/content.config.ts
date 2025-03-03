import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
    author: z.string(),
    tags: z.array(z.string()),
    date: z.date(),
    featured: z.boolean().default(false),
    imageAlt: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    blog: z.array(z.string()),
})

// We add `image` to our `postSchema` here because running `npm run build` gives an error when we access
// `image` outside of `defineCollection` call.
const blogPostsCollection = defineCollection({
    loader: glob({ pattern:  ['**/[^_]*.md', '**/[^_]*.mdx'], base: "./src/content/posts" }), // also seen '**.md' for `pattern:`
    schema: ({ image }) => postSchema.extend({
        image: image().optional(),
    }),
});

 export const collections = {
    'posts': blogPostsCollection,
};
