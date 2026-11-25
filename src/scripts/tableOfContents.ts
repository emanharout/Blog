// Highlights the one table-of-contents entry for the section at the very top of the window: the reader hasn't finished
// it until it scrolls out of view. Toggles `data-active` on every ToC link (sidebar and inline) to that heading, and
// stretches one faint bar beside the entries of every section on screen, under the active entry's solid bar.

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

// The section at the very top of the window, or -1 above the first heading (the post's image and intro).
function findTopIndex(): number {
    return headings.findLastIndex((heading) => heading.getBoundingClientRect().top <= TOP_LINE);
}

function findActiveId(): string | undefined {
    if (clickedId !== undefined) return clickedId;

    // At the end of the page the last section is active, since it may be too short to ever reach the top. `innerHeight`
    // follows mobile browsers' collapsing toolbars; the 2px allow for fractional scroll positions.
    const { scrollHeight, clientHeight } = document.documentElement;
    const isScrollable = scrollHeight > clientHeight;
    if (isScrollable && window.scrollY + window.innerHeight >= scrollHeight - 2) return headings.at(-1)?.id;

    // Above the first heading, the first entry is highlighted.
    return headings[Math.max(0, findTopIndex())]?.id;
}

function updateOnScreenBars() {
    // From the topmost section (even if its heading has scrolled away) to the last one whose heading is fully on screen.
    const firstIndex = Math.max(0, findTopIndex());
    const lastIndex = headings.findLastIndex(
        (heading) => heading.getBoundingClientRect().bottom <= document.documentElement.clientHeight,
    );
    const isAnyOnScreen = lastIndex >= firstIndex;

    tocLists.forEach((list) => {
        const bar = list.querySelector<HTMLElement>('[data-toc-bar]');
        if (!bar) return;

        bar.toggleAttribute('data-visible', isAnyOnScreen);
        // Keep the last position when there is nothing to mark, so the bar fades out in place.
        if (!isAnyOnScreen) return;

        const listLinks = [...list.querySelectorAll<HTMLAnchorElement>('.table-of-content-link')];
        const rectOf = (index: number) =>
            listLinks.find((link) => headingId(link) === headings[index].id)?.getBoundingClientRect();
        const firstRect = rectOf(firstIndex);
        const lastRect = rectOf(lastIndex);
        if (!firstRect || !lastRect) return;

        const listTop = list.getBoundingClientRect().top;
        bar.style.top = `${firstRect.top - listTop + BAR_INSET}px`;
        bar.style.height = `${Math.max(0, lastRect.bottom - firstRect.top - 2 * BAR_INSET)}px`;
    });
}

function updateActiveLinks() {
    const activeId = findActiveId();
    links.forEach((link) => link.toggleAttribute('data-active', headingId(link) === activeId));
    updateOnScreenBars();
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
