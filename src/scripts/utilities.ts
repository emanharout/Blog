// src/scripts/utilities.ts
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import * as Constants from './constants';

type Post = CollectionEntry<'posts'>;

function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    // Passing `undefined` respects the user's locale when available.
    return new Date(date).toLocaleDateString(undefined, options);
}

function toTitleCase(str: string): string {
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'at', 'by', 'in', 'of', 'on', 'to', 'up', 'with'];

    return str
        .split(' ')
        .map((word) => {
            if (smallWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        })
        .join(' ');
}

// Turns a tag label (e.g. "Design Patterns") into a URL-safe slug (e.g. "design-patterns").
function slugifyTag(tag: string): string {
    return tag
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function sortPostsByDateDesc(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

async function getAllPosts(): Promise<Post[]> {
    return await getCollection('posts');
}

async function getAllPostsSorted(): Promise<Post[]> {
    return sortPostsByDateDesc(await getAllPosts());
}

// Unique tags across the given posts, in first-seen order.
function getUniqueTags(posts: Post[]): string[] {
    return Array.from(new Set(posts.flatMap((post) => post.data.tags)));
}

function isValidBlogType(string: string): boolean {
    return string === Constants.WONDER_BLOG_TYPE || string === Constants.PROGRAMMING_BLOG_TYPE;
}

export {
    formatDate,
    toTitleCase,
    slugifyTag,
    sortPostsByDateDesc,
    getAllPosts,
    getAllPostsSorted,
    getUniqueTags,
    isValidBlogType,
};
