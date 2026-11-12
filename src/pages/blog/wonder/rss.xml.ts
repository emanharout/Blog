import type { APIContext } from 'astro';
import { WONDER_BLOG_TYPE } from '../../../scripts/constants';
import { buildFeed } from '../../../scripts/rss';

export function GET(context: APIContext) {
    return buildFeed(context, {
        title: 'Wonder Blog',
        filter: (post) => post.data.blog.includes(WONDER_BLOG_TYPE),
    });
}
