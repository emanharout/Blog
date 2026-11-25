// Highlights the one table-of-contents entry for the section at the very top of the window: the reader hasn't finished
// it until it scrolls out of view. Toggles `data-active` on every ToC link (sidebar and inline) to that heading, and
// stretches one faint bar beside the entries of any later sections that have come on screen.

// A heading within this many pixels of the top of the window starts the topmost section. Matches the space above the
// `##` headings, so the section before is no longer readable by then. Must exceed the headings' `scroll-margin-top`
// (input.css), so that a heading jumped to counts as the topmost.
const TOP_LINE = 48;

// Space between each end of the faint bar and the edges of its entries. Matches the active entry's bar
// (TableOfContentsHeading.astro).
const BAR_INSET = 4;

const links = [...document.querySelectorAll<HTMLAnchorElement>('.table-of-content-link')];
const tocLists = document.querySelectorAll<HTMLElement>('[data-toc-list]');
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

    // At the end of the page the last section is active, since it may be too short to ever reach the top. `innerHeight`
    // follows mobile browsers' collapsing toolbars; the 2px allow for fractional scroll positions.
    const { scrollHeight, clientHeight } = document.documentElement;
    const isScrollable = scrollHeight > clientHeight;
    if (isScrollable && window.scrollY + window.innerHeight >= scrollHeight - 2) return headings.at(-1)?.id;

    // Above the first heading (the post's image and intro), the first entry is highlighted.
    const topHeading = headings.findLast((heading) => heading.getBoundingClientRect().top <= TOP_LINE) ?? headings[0];
    return topHeading?.id;
}

function updateOnScreenBars(activeId: string | undefined) {
    const activeIndex = headings.findIndex((heading) => heading.id === activeId);
    const onScreenIds = headings
        .slice(activeIndex + 1)
        .filter((heading) => {
            const { top, bottom } = heading.getBoundingClientRect();
            return top >= 0 && bottom <= document.documentElement.clientHeight;
        })
        .map((heading) => heading.id);

    tocLists.forEach((list) => {
        const bar = list.querySelector<HTMLElement>('[data-toc-bar]');
        if (!bar) return;

        bar.toggleAttribute('data-visible', onScreenIds.length > 0);
        // Keep the last position when there is nothing to mark, so the bar fades out in place.
        if (onScreenIds.length === 0) return;

        // Sections on screen are always neighbors, so the bar runs from the first one's entry to the last one's.
        const entries = [...list.querySelectorAll<HTMLAnchorElement>('.table-of-content-link')].filter((link) =>
            onScreenIds.includes(headingId(link)),
        );
        const listTop = list.getBoundingClientRect().top;
        const top = entries[0].getBoundingClientRect().top - listTop + BAR_INSET;
        const bottom = entries[entries.length - 1].getBoundingClientRect().bottom - listTop - BAR_INSET;
        bar.style.top = `${top}px`;
        bar.style.height = `${Math.max(0, bottom - top)}px`;
    });
}

function updateActiveLinks() {
    const activeId = findActiveId();
    links.forEach((link) => link.toggleAttribute('data-active', headingId(link) === activeId));
    updateOnScreenBars(activeId);
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
    const resizeObserver = new ResizeObserver(queueUpdate);
    resizeObserver.observe(document.querySelector('.article-content') ?? document.body);
    // Web fonts can re-wrap the entries, which moves the faint bar.
    tocLists.forEach((list) => resizeObserver.observe(list));

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
