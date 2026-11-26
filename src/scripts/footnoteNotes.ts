// Runs the footnote notes that src/plugins/rehypeFootnoteNotes.mjs places after each footnote number (styles in
// src/styles/input.css):
// - From MARGIN_NOTES_QUERY up, notes sit in the right margin, level with their number. Long notes only do when the
//   article has data-long-notes="margin"; otherwise they stay closed in the text. A note that would overlap the one
//   above is pushed down below it, and a note fades out while it's under the sticky table of contents.
// - Clicking a number points out its note when it's showing in the margin (no scrolling). Otherwise, as on a phone,
//   the note opens under the line; a second click closes it, as does Escape.
// - Hovering a number shows the note in a tooltip (mouse and trackpad only), unless it's open under the line.
//   Hovering a number beside a margin note also highlights the note, and the other way round.
// - The footnote list at the end of the post is closed behind a "Footnotes" button. A link into it opens it.
// Without JavaScript the numbers link to the footnote list, and short notes still show in the margin.
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

// Must match the @media rule for `.fn-note` in input.css.
const MARGIN_NOTES_QUERY = window.matchMedia('(width >= 72rem)');
// Space kept between stacked margin notes, and between a margin note and the table of contents.
const GAP = 12;

const article = document.querySelector<HTMLElement>('.article-content');
const refs = [...document.querySelectorAll<HTMLAnchorElement>('.article-content a[data-footnote-ref]')];
const notes = [...document.querySelectorAll<HTMLElement>('.fn-note')];
const toc = document.querySelector<HTMLElement>('[data-toc-sidebar]');
const footnoteList = document.querySelector<HTMLDetailsElement>('[data-footnotes-toggle]');

const noteFor = (ref: HTMLAnchorElement) => document.getElementById(ref.getAttribute('aria-controls') ?? '');

// Whether a note is placed in the margin right now (the same test as the CSS).
const isInMargin = (note: HTMLElement) =>
    MARGIN_NOTES_QUERY.matches &&
    !note.hasAttribute('data-open') &&
    (note.dataset.fnSize === 'short' || article?.dataset.longNotes === 'margin');

// In the margin, not hidden by the table of contents, and on screen.
function isShowingInMargin(note: HTMLElement) {
    if (!isInMargin(note) || note.hasAttribute('data-faded')) return false;
    const rect = note.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
}

function setOpen(ref: HTMLAnchorElement, note: HTMLElement, open: boolean) {
    note.toggleAttribute('data-open', open);
    ref.setAttribute('aria-expanded', String(open));
}

function setHighlight(ref: HTMLAnchorElement, note: HTMLElement | null, on: boolean) {
    ref.toggleAttribute('data-highlight', on);
    note?.toggleAttribute('data-highlight', on);
}

// A brief glow around a margin note (restarted if it's already playing).
function pointOut(note: HTMLElement) {
    note.removeAttribute('data-pointed-out');
    void note.offsetWidth;
    note.setAttribute('data-pointed-out', '');
}

// The footnote's text from the list at the end of the post, without its "back to text" link.
function tooltipContent(ref: HTMLAnchorElement) {
    const footnote = document.getElementById(decodeURIComponent(ref.hash.slice(1)));
    const content = document.createElement('div');
    if (!footnote) return content;
    content.innerHTML = footnote.innerHTML;
    content.querySelectorAll('[data-footnote-backref]').forEach((link) => link.remove());
    content.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    return content;
}

for (const ref of refs) {
    const note = noteFor(ref);

    const tooltip = tippy(ref, {
        content: tooltipContent(ref),
        animation: 'shift-away',
        duration: [350, 250],
        interactive: true,
        interactiveBorder: 10,
        maxWidth: 380,
        offset: [0, 18],
        // A tap opens the note instead.
        touch: false,
        // Inside the number's <sup> it would be squeezed to the number's width.
        appendTo: () => document.body,
        // Returning false cancels the tooltip: not needed while the note is open under the line.
        onShow: () => (note?.hasAttribute('data-open') ? false : undefined),
    });

    // Without a copy (a footnote with lists or code), the number links to the list as usual.
    if (!note) continue;

    ref.addEventListener('click', (event) => {
        event.preventDefault();
        if (note.hasAttribute('data-open')) {
            setOpen(ref, note, false);
        } else if (isShowingInMargin(note)) {
            pointOut(note);
        } else {
            tooltip.hide();
            setOpen(ref, note, true);
        }
    });
    note.addEventListener('animationend', () => note.removeAttribute('data-pointed-out'));

    for (const target of [ref, note]) {
        target.addEventListener('mouseenter', () => isShowingInMargin(note) && setHighlight(ref, note, true));
        target.addEventListener('mouseleave', () => setHighlight(ref, note, false));
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const ref of refs) {
        const note = noteFor(ref);
        if (note?.hasAttribute('data-open')) setOpen(ref, note, false);
    }
});

// THE FOOTNOTE LIST: a link into it (a number without a note, or the URL) opens it first, so the browser can scroll
// to the footnote.
function openListFor(hash: string) {
    const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (footnoteList && target && footnoteList.contains(target)) footnoteList.open = true;
}
document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (link) openListFor(link.hash);
});
window.addEventListener('hashchange', () => openListFor(location.hash));
openListFor(location.hash);

// MARGIN NOTES

// Hides each margin note while it's under (or just next to) the table of contents.
function fadeUnderToc() {
    const tocRect = toc && toc.getClientRects().length > 0 ? toc.getBoundingClientRect() : undefined;
    for (const note of notes) {
        if (!isInMargin(note)) continue;
        const rect = note.getBoundingClientRect();
        const isUnder = tocRect !== undefined && rect.top < tocRect.bottom + GAP && rect.bottom > tocRect.top - GAP;
        note.toggleAttribute('data-faded', isUnder);
    }
}

// Each note starts level with its number. One that would overlap the note above is pushed down below it.
function layOutMarginNotes() {
    for (const note of notes) {
        note.style.translate = '';
        note.removeAttribute('data-faded');
    }
    let previousBottom = -Infinity;
    for (const note of notes.filter(isInMargin)) {
        const rect = note.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const shift = Math.max(0, previousBottom + GAP - top);
        if (shift > 0) note.style.translate = `0 ${shift}px`;
        previousBottom = top + shift + rect.height;
    }
    fadeUnderToc();
}

if (notes.length > 0) {
    let frame = 0;
    window.addEventListener(
        'scroll',
        () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(fadeUnderToc);
        },
        { passive: true },
    );

    // Text reflowing (resizing, fonts loading, a note opening) moves the numbers the notes line up with.
    if (article) new ResizeObserver(layOutMarginNotes).observe(article);
    MARGIN_NOTES_QUERY.addEventListener('change', layOutMarginNotes);
    // For pages that change data-long-notes after loading (the dev-only /dev/notes page).
    document.addEventListener('footnote-notes:layout', layOutMarginNotes);

    layOutMarginNotes();
}
