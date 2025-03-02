import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPostsSorted } from '../../../scripts/utilities.ts';
import { WONDER_BLOG_TYPE } from '../../../scripts/constants.ts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function GET(context: APIContext) {
  const allBlogPosts = await getAllPostsSorted();
  const wonderPosts = allBlogPosts.filter((post) => {
    return post.data.blog.includes(WONDER_BLOG_TYPE);
  });
  return rss({
    title: 'Eman Harout | Blog',
    description: 'A blog that explores topics which spark intrigue.',
    site: context.site?.toString() ?? '',
    items: wonderPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.subtitle,
      link: `/blog/${post.id}`,
      content: sanitizeHtml(parser.render(post.body ??  '')),
      image: post.data.image,
    })),
    customData: `<language>en-us</language>`,
  });
}