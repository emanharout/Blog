import { getAllPosts } from '../scripts/utilities.ts';
import type { SearchablePostData } from '../scripts/search.ts';

// Upper bound on indexed body text per post, so the index doesn't grow without limit as posts get longer.
const MAX_BODY_CHARS = 8000;

// Reduce raw MDX to plain, searchable text: drop imports/exports, JSX/HTML tags, footnote markers and markdown syntax.
function toPlainText(mdx: string): string {
    return mdx
        .replace(/^\s*(import|export)\s.*$/gm, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\{[^}]*\}/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[\^[^\]]+\]:?/g, ' ')
        .replace(/[#>*_`~|-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_BODY_CHARS);
}

// Astro calls this when building `/search.json`. Not user-facing; the search page fetches it to run queries.
export async function GET(): Promise<Response> {
    const allPosts = await getAllPosts();
    const postsData: SearchablePostData[] = allPosts.map((post) => ({
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        tags: post.data.tags,
        date: post.data.date,
        body: toPlainText(post.body ?? ''),
    }));

    return new Response(JSON.stringify(postsData), {
        headers: { 'Content-Type': 'application/json' },
    });
}
