// Highlights the one table-of-contents entry for the section at the very top of the window: the reader hasn't finished
// it until it scrolls out of view. Toggles `data-active` on every ToC link (in all variants) to that heading, and
// stretches one faint bar beside the entries of every section on screen, under the active entry's solid bar.

// A heading within this many pixels of the top of the window (or of the strip covering it) starts the topmost section.
// Matches the space above the `##` headings, so the section before is no longer readable by then. Must exceed the headings' `scroll-margin-top`
// (input.css), so that a heading jumped to counts as the topmost.
const TOP_LINE = 48;

// Space between each end of the faint bar and the edges of its entries. Matches the active entry's bar
// (TableOfContentsHeading.astro).
const BAR_INSET = 4;

const links = [...document.querySelectorAll<HTMLAnchorElement>('.table-of-content-link')];
const tocLists = document.querySelectorAll<HTMLElement>('[data-toc-list]');
const headingId = (link: HTMLAnchorElement) => decodeURIComponent(link.hash.slice(1));

// All ToC variants link to the same headings; the Set removes the duplicates and keeps document order.
const headings = [...new Set(links.map(headingId))]
    .map((id) => document.getElementById(id))
    .filter((heading) => heading !== null);

// A clicked entry stays highlighted until the reader scrolls on their own. Near the end of the page its heading may
// not be able to reach the top of the window.
let clickedId: string | undefined;

// THE SHEET (below `sm`): a floating button that opens the list in a modal panel at the bottom of the window.
const sheetButton = document.querySelector<HTMLButtonElement>('[data-toc-button]');
const sheet = document.querySelector<HTMLDialogElement>('[data-toc-sheet]');
const inlineToc = document.querySelector<HTMLElement>('details:has([data-toc-list])');

// Scrolls a panel's own list so its active entry is in view.
function revealActiveEntry(panel: HTMLElement) {
    const activeLink = panel.querySelector('.table-of-content-link[data-active]');
    if (!activeLink) return;
    const overflow = activeLink.getBoundingClientRect().bottom - panel.getBoundingClientRect().bottom;
    panel.scrollTop = Math.max(0, panel.scrollTop + overflow);
}

function openSheet() {
    if (!sheet || sheet.open) return;
    sheet.showModal();

    // The faint bar can only be measured while the list is visible.
    updateActiveLinks();
    revealActiveEntry(sheet);
}

// The button stands in for the inline ToC once that has scrolled away. It isn't displayed at `sm` and up.
function updateSheetButton() {
    if (!sheetButton || !sheet || !inlineToc) return;
    const isDisplayed = sheetButton.getClientRects().length > 0;
    sheetButton.toggleAttribute('data-shown', isDisplayed && inlineToc.getBoundingClientRect().bottom <= 0);
    if (!isDisplayed && sheet.open) sheet.close();
}

// THE STRIP (from `sm` to `lg`): a bar at the top of the window that names the current section and drops down the list.
const strip = document.querySelector<HTMLElement>('[data-toc-strip]');
const stripButton = strip?.querySelector<HTMLButtonElement>('button');
const stripPanel = document.getElementById(stripButton?.getAttribute('aria-controls') ?? '');
const stripCurrent = strip?.querySelector<HTMLElement>('[data-toc-strip-current]');
const stripParent = strip?.querySelector<HTMLElement>('[data-toc-strip-parent]');
const article = document.querySelector<HTMLElement>('.article-content');

const isStripOpen = () => stripButton?.getAttribute('aria-expanded') === 'true';

function setStripOpen(open: boolean) {
    if (!stripButton || !stripPanel || open === isStripOpen()) return;
    stripButton.setAttribute('aria-expanded', String(open));
    stripPanel.toggleAttribute('data-open', open);
    if (!open) return;

    updateActiveLinks();
    revealActiveEntry(stripPanel);
}

// The strip stands in for the inline ToC, from when that has scrolled away until the end of the article.
function updateStrip() {
    if (!strip || !stripButton || !inlineToc || !article) return;
    const isShown =
        strip.getClientRects().length > 0 &&
        inlineToc.getBoundingClientRect().bottom <= 0 &&
        article.getBoundingClientRect().bottom > stripButton.offsetHeight;
    strip.toggleAttribute('data-shown', isShown);
    if (!isShown) setStripOpen(false);
}

// Names the active section in the strip, after its parent section if it's nested.
function updateStripLabel(activeId: string | undefined) {
    const activeLink = [...(strip?.querySelectorAll<HTMLAnchorElement>('.table-of-content-link') ?? [])].find(
        (link) => headingId(link) === activeId,
    );
    if (!activeLink || !stripCurrent || !stripParent) return;
    const parentLink = activeLink.closest('li')?.parentElement?.closest('li')?.querySelector('a');
    stripCurrent.textContent = activeLink.textContent?.trim() ?? '';
    stripParent.textContent = parentLink?.textContent?.trim() ?? '';
}

// How much of the top of the window the strip covers
function stripHeight(): number {
    return strip?.hasAttribute('data-shown') ? (stripButton?.offsetHeight ?? 0) : 0;
}

// Using these doesn't scroll the page.
const isTocPanelEvent = (event: Event) => {
    const target = event.target as Node | null;
    return [sheet, sheetButton, strip].some((element) => element?.contains(target));
};

// The section at the very top of the window, or -1 above the first heading (the post's image and intro).
function findTopIndex(): number {
    const topLine = stripHeight() + TOP_LINE;
    return headings.findLastIndex((heading) => heading.getBoundingClientRect().top <= topLine);
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
    updateSheetButton();
    updateStrip();
    const activeId = findActiveId();
    links.forEach((link) => link.toggleAttribute('data-active', headingId(link) === activeId));
    updateStripLabel(activeId);
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
    resizeObserver.observe(article ?? document.body);
    // Web fonts can re-wrap the entries, which moves the faint bar.
    tocLists.forEach((list) => resizeObserver.observe(list));

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            // These open the link elsewhere and leave this page where it is.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            clickedId = headingId(link);
            sheet?.close();
            setStripOpen(false);
            queueUpdate();
        });
    });
    // Input that can start a scroll (pointerdown: dragging the scrollbar). These fire before `click`.
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((type) => {
        window.addEventListener(
            type,
            (event) => {
                if (!isTocPanelEvent(event)) clickedId = undefined;
            },
            { passive: true },
        );
    });

    stripButton?.addEventListener('click', () => setStripOpen(!isStripOpen()));
    // Tapping or tabbing elsewhere closes the strip's list, and so does Escape. (`pointerdown`, because iOS doesn't send
    // `click` for taps on plain text.)
    document.addEventListener('pointerdown', (event) => {
        if (!strip?.contains(event.target as Node | null)) setStripOpen(false);
    });
    strip?.addEventListener('focusout', (event) => {
        if (event.relatedTarget && !strip.contains(event.relatedTarget as Node)) setStripOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isStripOpen()) return;
        setStripOpen(false);
        stripButton?.focus();
    });

    sheetButton?.addEventListener('click', openSheet);
    sheet?.addEventListener('click', (event) => {
        // The dialog itself is only hit by taps on its backdrop; its content fills the panel.
        const isBackdrop = event.target === sheet;
        const isCloseButton = event.target instanceof Element && event.target.closest('[data-toc-close]');
        if (isBackdrop || isCloseButton) sheet.close();
    });

    updateActiveLinks();
}
