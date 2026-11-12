import type { APIContext } from 'astro';
import { PROGRAMMING_BLOG_TYPE } from '../../../scripts/constants';
import { buildFeed } from '../../../scripts/rss';

export function GET(context: APIContext) {
    return buildFeed(context, {
        title: 'Programming Blog',
        filter: (post) => post.data.blog.includes(PROGRAMMING_BLOG_TYPE),
    });
}
