import { getAllPosts } from '../scripts/utilities.ts';
import type { SearchablePostData } from '../scripts/search.ts';

// Builds searchable data
async function buildGETSearchResponse(): Promise<Response> {
    const allPosts = await getAllPosts();
    const postsData: SearchablePostData[] = allPosts.map((post) => ({
        id: post.id,
        title: post.data.title,
        date: post.data.date,
        body: post.body,
    }));

    return new Response(JSON.stringify(postsData), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

// Astro calls this method when routing to `/search.json`.
// This is not a user-facing route. I call this privately when we need JSON to execute search queries against.
export async function GET({}): Promise<Response> {
    return buildGETSearchResponse();
}
