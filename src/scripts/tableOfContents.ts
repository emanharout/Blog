// Highlights the one table-of-contents entry for the section being read: the last heading scrolled past a "reading
// line" near the top of the window. Toggles `data-active` on every ToC link (sidebar and inline) to that heading.

// The reading line's distance from the top, as a fraction of the window height. Must sit below the headings'
// `scroll-margin-top` (input.css), so that a heading jumped to counts as scrolled past.
const READING_LINE = 0.25;

const links = [...document.querySelectorAll<HTMLAnchorElement>('.table-of-content-link')];
const headingId = (link: HTMLAnchorElement) => decodeURIComponent(link.hash.slice(1));

// Both ToC variants link to the same headings; the Set removes the duplicates and keeps document order.
const headings = [...new Set(links.map(headingId))]
    .map((id) => document.getElementById(id))
    .filter((heading) => heading !== null);

// A clicked entry stays highlighted until the reader scrolls on their own. Near the end of the page its heading may
// not be able to reach the top of the window.
let clickedId: string | undefined;

function findActiveId(): string | undefined {
    if (clickedId !== undefined) return clickedId;

    const { scrollHeight, clientHeight } = document.documentElement;
    const maxScroll = scrollHeight - clientHeight;
    const readingLine = clientHeight * READING_LINE;

    // Over the last stretch of the page the line slides down to the bottom of the window, so that every heading passes
    // it, including those of short sections at the end.
    const slideDistance = clientHeight - readingLine;
    const slideStart = Math.max(0, maxScroll - slideDistance);
    const slide = maxScroll > 0 ? Math.min(1, Math.max(0, (window.scrollY - slideStart) / (maxScroll - slideStart))) : 0;
    const line = readingLine + slide * slideDistance;

    // Above the first heading (the post's image and intro), the first entry is highlighted.
    const activeHeading = headings.findLast((heading) => heading.getBoundingClientRect().top <= line) ?? headings[0];
    return activeHeading?.id;
}

function updateActiveLinks() {
    const activeId = findActiveId();
    links.forEach((link) => link.toggleAttribute('data-active', headingId(link) === activeId));
}

let isUpdateQueued = false;
function queueUpdate() {
    if (isUpdateQueued) return;
    isUpdateQueued = true;
    requestAnimationFrame(() => {
        isUpdateQueued = false;
        updateActiveLinks();
    });
}

if (headings.length > 0) {
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);
    // Late-loading images and opening the inline ToC move the headings.
    new ResizeObserver(queueUpdate).observe(document.querySelector('.article-content') ?? document.body);

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            // These open the link elsewhere and leave this page where it is.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            clickedId = headingId(link);
            queueUpdate();
        });
    });
    // Input that can start a scroll (pointerdown: dragging the scrollbar). These fire before `click`.
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((type) => {
        window.addEventListener(type, () => (clickedId = undefined), { passive: true });
    });

    updateActiveLinks();
}
