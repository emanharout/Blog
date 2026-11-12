// Shared RSS feed builder used by /rss.xml, /blog/programming/rss.xml and /blog/wonder/rss.xml.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import { loadRenderers } from 'astro:container';
import { render, type CollectionEntry } from 'astro:content';
import { SITE_DESCRIPTION, SITE_NAME } from './constants';
import { getAllPostsSorted } from './utilities';

type Post = CollectionEntry<'posts'>;

type FeedOptions = {
    title: string;
    description?: string;
    filter?: (post: Post) => boolean;
};

// Render each post with Astro itself so MDX (imports, components, `{frontmatter.title}`) becomes real HTML.
async function renderPostHTML(container: AstroContainer, post: Post, site: URL): Promise<string> {
    const { Content } = await render(post);
    const html = await container.renderToString(Content);
    // Feed readers need absolute URLs for images and links.
    return html.replace(/(src|href)="\/(?!\/)/g, `$1="${site.origin}/`);
}

export async function buildFeed(context: APIContext, { title, description = SITE_DESCRIPTION, filter }: FeedOptions) {
    const site = context.site ?? new URL(context.url.origin);
    const posts = (await getAllPostsSorted()).filter(filter ?? (() => true));

    const renderers = await loadRenderers([getMDXRenderer()]);
    const container = await AstroContainer.create({ renderers });

    const items = await Promise.all(
        posts.map(async (post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            link: `/blog/${post.id}/`,
            categories: post.data.tags,
            author: post.data.author,
            content: await renderPostHTML(container, post, site),
        })),
    );

    return rss({
        title: `${SITE_NAME} | ${title}`,
        description,
        site,
        items,
        customData: '<language>en-us</language>',
    });
}
