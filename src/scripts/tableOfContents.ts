// Highlights the one table-of-contents entry for the section at the very top of the window: the reader hasn't finished
// it until it scrolls out of view. Toggles `data-active` on every ToC link (sidebar and inline) to that heading.

// A heading within this many pixels of the top of the window starts the topmost section. Matches the space above the
// `##` headings, so the section before is no longer readable by then. Must exceed the headings' `scroll-margin-top`
// (input.css), so that a heading jumped to counts as the topmost.
const TOP_LINE = 48;

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

    // Above the first heading (the post's image and intro), the first entry is highlighted.
    const topHeading = headings.findLast((heading) => heading.getBoundingClientRect().top <= TOP_LINE) ?? headings[0];
    return topHeading?.id;
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
