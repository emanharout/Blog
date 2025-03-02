// src/scripts/utilities.ts
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import * as Constants from './constants'

function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    // Passing `undefined` respects the user's locale when available.
    return new Date(date).toLocaleDateString(undefined, options);
    // Pass in post's date: formatDate(post.data.date)
}

function capitalize(str: string): string {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toTitleCase(str: string): string {
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'at', 'by', 'in', 'of', 'on', 'to', 'up', 'with'];
  
    return str.split(' ')
      .map(word => {
        if (smallWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
      })
      .join(' ');
  }

async function getAllPosts(): Promise<CollectionEntry<'posts'>[]> {
    return await getCollection('posts')
}

async function getAllPostsSorted(): Promise<CollectionEntry<'posts'>[]> {
    return (await getAllPosts()).sort((a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) => {
        return b.data.date.valueOf() - a.data.date.valueOf();
    });
}

function isValidBlogType(string: string): boolean {
    if (string === Constants.WONDER_BLOG_TYPE || string === Constants.PROGRAMMING_BLOG_TYPE) {
        return true;
    } else {
        return false;
    }
}

export { formatDate, capitalize, toTitleCase, getAllPosts, getAllPostsSorted, isValidBlogType };
