import type { APIContext } from 'astro';
import { buildFeed } from '../scripts/rss';

export function GET(context: APIContext) {
    return buildFeed(context, { title: 'All Posts' });
}
