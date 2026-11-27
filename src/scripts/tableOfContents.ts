// Highlights the one table-of-contents entry for the section at the very top of the window: the reader hasn't finished
// it until it scrolls out of view. Toggles `data-active` on every ToC link (in all variants) to that heading, and
// stretches one faint bar beside the entries of every section on screen, under the active entry's solid bar.

// A heading within this many pixels of the top of the window (or of the strip covering it) starts the topmost section.
// Matches the space above the `##` headings, so the section before is no longer readable by then. Must exceed the headings' `scroll-margin-top`
// (input.css), so that a heading jumped to counts as the topmost.
const TOP_LINE = 48;

const links = [...document.querySelectorAll<HTMLAnchorElement>('.table-of-content-link')];
const segments = document.querySelectorAll<HTMLElement>('[data-toc-segment]');
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
// Where the inline ToC sits in the post: its list floats over the post when opened, so this keeps the closed one's place.
const inlinePlace = inlineToc?.parentElement;

// Scrolls a list, if it's long enough to, so its active entry is in the middle.
function revealActiveEntry(container: HTMLElement | null) {
    const scroller = container?.querySelector<HTMLElement>('[data-toc-scroller]');
    const activeLink = scroller?.querySelector('.table-of-content-link[data-active]');
    if (!scroller || !activeLink) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    scroller.scrollTop += linkRect.top + linkRect.height / 2 - (scrollerRect.top + scrollerRect.height / 2);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// The sheet's and the inline ToC's transitions, as long as the menu's (`--menu-duration`, SiteHeader.astro). The easings
// are `--ease-toc-arrive` and `--ease-toc-leave` (input.css).
const TOGGLE_DURATION_MS = 450;
const EASE_ARRIVE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
const EASE_LEAVE = 'cubic-bezier(0.45, 0, 0.25, 1)';

// Closes the sheet once it has slid away; undone if it's opened again first.
let pendingSheetClose: { cancel(): void } | undefined;

// The sheet slides in and out with `data-shown` (TableOfContents.astro), while it's open: browsers don't all animate a
// dialog entering and leaving the top layer (Safari can't keep a closing one there).
function openSheet() {
    if (!sheet) return;
    pendingSheetClose?.cancel();
    if (!sheet.open) {
        sheet.showModal();
        // Browsers that ignore `autofocus` on the dialog would focus its close button and ring it.
        sheet.focus();
        // Lays it out below the window first, so that it slides up from there.
        sheet.getBoundingClientRect();
    }
    sheet.setAttribute('data-shown', '');

    // The faint bar can only be measured while the sheet is displayed.
    updateActiveLinks();
    revealActiveEntry(sheet);
}

function closeSheet() {
    if (!sheet?.hasAttribute('data-shown')) return;
    sheet.removeAttribute('data-shown');
    if (reducedMotion.matches) {
        sheet.close();
        return;
    }

    const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target === sheet && event.propertyName === 'translate') finish();
    };
    // In case the transition never runs or ends (a hidden tab, say).
    const timer = window.setTimeout(() => finish(), TOGGLE_DURATION_MS + 100);
    const cancel = () => {
        pendingSheetClose = undefined;
        clearTimeout(timer);
        sheet.removeEventListener('transitionend', onTransitionEnd);
    };
    const finish = () => {
        cancel();
        sheet.close();
    };
    sheet.addEventListener('transitionend', onTransitionEnd);
    pendingSheetClose = { cancel };
}

// THE INLINE TOC: its height is animated in script, since browsers can't all interpolate to `auto`. It stays open while
// it collapses; `data-expanded` turns the chevron straight away.
const inlineSummary = inlineToc?.querySelector('summary');
const inlineBody = inlineToc?.querySelector<HTMLElement>('[data-toc-inline-body]');
let inlineAnimation: Animation | undefined;

function setInlineOpen(open: boolean) {
    if (!(inlineToc instanceof HTMLDetailsElement) || !inlineBody) return;
    if (open === inlineToc.hasAttribute('data-expanded')) return;
    inlineToc.toggleAttribute('data-expanded', open);
    // From wherever an unfinished animation has got to
    const fromHeight = inlineToc.open ? inlineBody.getBoundingClientRect().height : 0;
    inlineAnimation?.cancel();
    inlineAnimation = undefined;
    inlineToc.open = true;
    if (reducedMotion.matches) {
        inlineToc.open = open;
        return;
    }

    const toHeight = open ? inlineBody.scrollHeight : 0;
    inlineBody.style.overflow = 'hidden';
    const animation = inlineBody.animate(
        { height: [`${fromHeight}px`, `${toHeight}px`] },
        { duration: TOGGLE_DURATION_MS, easing: open ? EASE_ARRIVE : EASE_LEAVE },
    );
    inlineAnimation = animation;
    animation.addEventListener('finish', () => {
        inlineAnimation = undefined;
        inlineBody.style.overflow = '';
        inlineToc.open = open;
    });
}

// The button stands in for the inline ToC once that has scrolled away. It isn't displayed at `sm` and up.
function updateSheetButton() {
    if (!sheetButton || !sheet || !inlinePlace) return;
    const isDisplayed = sheetButton.getClientRects().length > 0;
    sheetButton.toggleAttribute('data-shown', isDisplayed && inlinePlace.getBoundingClientRect().bottom <= 0);
    if (!isDisplayed && sheet.open) {
        pendingSheetClose?.cancel();
        sheet.removeAttribute('data-shown');
        sheet.close();
    }
}

// THE STRIP (from `sm` to `lg`): a bar at the top of the window that names the current section and drops down the list.
const strip = document.querySelector<HTMLElement>('[data-toc-strip]');
// Not the button beside it that brings back the sidebar
const stripButton = strip?.querySelector<HTMLButtonElement>('button[aria-controls]');
const stripPanel = document.getElementById(stripButton?.getAttribute('aria-controls') ?? '');
const stripScroller = stripPanel?.querySelector<HTMLElement>('[data-toc-scroller]');
const stripCurrent = strip?.querySelector<HTMLElement>('[data-toc-strip-current]');
const stripParent = strip?.querySelector<HTMLElement>('[data-toc-strip-parent]');
const article = document.querySelector<HTMLElement>('.article-content');

// With a mouse, hovering the strip opens its list, and leaving closes it again. The delays ignore a pointer that's only
// passing through or that slips out for a moment. (Not the sheet: it's modal, so opening it on hover would take over.)
const HOVER_OPEN_DELAY_MS = 120;
const HOVER_CLOSE_DELAY_MS = 300;

function createDelay() {
    let timer: number | undefined;
    return {
        start(ms: number, callback: () => void) {
            timer ??= window.setTimeout(() => {
                timer = undefined;
                callback();
            }, ms);
        },
        cancel() {
            clearTimeout(timer);
            timer = undefined;
        },
    };
}

// Only real movement: scrolling can slide the strip in under a pointer at rest, which shouldn't open it.
const isMouseMovement = (event: PointerEvent) =>
    event.pointerType === 'mouse' && (event.movementX !== 0 || event.movementY !== 0);

const stripHoverDelay = createDelay();
// Opened by hovering rather than by a click or key, so leaving closes it again.
let isOpenedByHover = false;
// After closing under the pointer, it stays closed until the pointer leaves and comes back.
let isHoverSpent = false;

const isStripOpen = () => stripButton?.getAttribute('aria-expanded') === 'true';

function setStripOpen(open: boolean) {
    if (!stripButton || !stripPanel || open === isStripOpen()) return;
    stripButton.setAttribute('aria-expanded', String(open));
    stripPanel.toggleAttribute('data-open', open);
    isOpenedByHover = false;
    updateStripPanelHeight();
    if (!open) {
        isHoverSpent = stripButton.parentElement?.matches(':hover') ?? false;
        return;
    }

    updateActiveLinks();
    revealActiveEntry(stripPanel);
}

// The list's height can't be animated from 0 to `auto`, so it's measured (again when the window resizes).
function updateStripPanelHeight() {
    if (!stripPanel || !stripScroller) return;
    stripPanel.style.height = isStripOpen() ? `${stripScroller.offsetHeight}px` : '';
}

function setUpStripHover(box: HTMLElement) {
    box.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse') isHoverSpent = false;
    });
    box.addEventListener('pointermove', (event) => {
        if (!isMouseMovement(event)) return;
        if (isStripOpen()) {
            stripHoverDelay.cancel();
        } else if (!isHoverSpent) {
            stripHoverDelay.start(HOVER_OPEN_DELAY_MS, () => {
                if (!strip?.hasAttribute('data-shown')) return;
                setStripOpen(true);
                isOpenedByHover = true;
            });
        }
    });
    box.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'mouse') return;
        stripHoverDelay.cancel();
        if (!isOpenedByHover) return;
        stripHoverDelay.start(HOVER_CLOSE_DELAY_MS, () => {
            if (isOpenedByHover) setStripOpen(false);
        });
    });
}

// The strip stands in for the inline ToC, from when that has scrolled away until the end of the article.
function updateStrip() {
    if (!strip || !stripButton || !inlinePlace || !article) return;
    const isShown =
        strip.getClientRects().length > 0 &&
        inlinePlace.getBoundingClientRect().bottom <= 0 &&
        article.getBoundingClientRect().bottom > stripBottom();
    strip.toggleAttribute('data-shown', isShown);
    if (!isShown) setStripOpen(false);
    updateStripPanelHeight();
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

// Where the closed strip ends, measured from the top of the window. Layout offsets, so sliding in doesn't change it.
function stripBottom(): number {
    const box = stripButton?.parentElement;
    return box && stripButton ? box.offsetTop + box.clientTop + stripButton.offsetHeight : 0;
}

// How much of the top of the window the strip covers
function stripHeight(): number {
    return strip?.hasAttribute('data-shown') ? stripBottom() : 0;
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

function updateOnScreenMarks(activeId: string | undefined) {
    // From the topmost section (even if its heading has scrolled away) to the last one whose heading is fully on screen.
    const firstIndex = Math.max(0, findTopIndex());
    const lastIndex = headings.findLastIndex(
        (heading) => heading.getBoundingClientRect().bottom <= document.documentElement.clientHeight,
    );
    const isAnyOnScreen = lastIndex >= firstIndex;

    segments.forEach((segment) => {
        const index = headings.findIndex((heading) => heading.id === segment.dataset.tocSegment);
        const isActive = headings[index]?.id === activeId;
        segment.toggleAttribute('data-active', isActive);
        segment.toggleAttribute('data-on-screen', !isActive && index >= firstIndex && index <= lastIndex);
    });

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

        // The same inset as the active entry's bar (TableOfContentsHeading.astro)
        const inset = parseFloat(getComputedStyle(list).getPropertyValue('--toc-bar-inset')) || 0;
        const listTop = list.getBoundingClientRect().top;
        bar.style.top = `${firstRect.top - listTop + inset}px`;
        bar.style.height = `${Math.max(0, lastRect.bottom - firstRect.top - 2 * inset)}px`;
    });
}

// The sidebar follows along, if its list is too long for the window.
const sidebar = document.querySelector<HTMLElement>('[data-toc-sidebar]');
let revealedId: string | undefined;

// COLLAPSING THE SIDEBAR: its title collapses it, into a round button in its place from `lg` to `xl`, and into the
// inline ToC (and the strip) from `xl` up. `data-toc-collapsed` on <html> drives the CSS (TableOfContents.astro); the
// choice is kept for later visits and applied before first paint (BlogArticle.astro).
const COLLAPSED_KEY = 'toc-collapsed';
const collapseButton = sidebar?.querySelector<HTMLButtonElement>('[data-toc-collapse]');
// The sidebar's own round button, and the buttons in the inline ToC and the strip that bring the sidebar back
const expandButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-toc-expand]')];
let sidebarAnimation: Animation | undefined;

const isSidebarCollapsed = () => document.documentElement.hasAttribute('data-toc-collapsed');
const isDisplayed = (element: Element | null | undefined) => (element?.getClientRects().length ?? 0) > 0;
const isOnScreen = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
};

// THE HAND-OFF (from `xl` up): the ToC glides between the sidebar and its place in the post. A stand-in panel moves and
// resizes from one to the other, showing what it's leaving and then what it's becoming, and fades into the real one as
// it lands. Meanwhile the place in the post opens or closes, so the text below it moves smoothly rather than jumping.
// Once the place has scrolled away, the ToC glides to and from the strip at the top of the window instead. With neither
// on screen (past the end of the post), the sidebar only fades away or in.
const GLIDE_DURATION_MS = 550;
const EASE_GLIDE = 'cubic-bezier(0.5, 0, 0.2, 1)';
// Where in the glide the stand-in shows what it's leaving, then what it's becoming, then hands over to the real one
const LEAVING_UNTIL = 0.5;
const BECOMING_FROM = 0.25;
const BECOMING_BY = 0.75;
const LANDING_FROM = 0.85;
const FADE_SHIFT = '0.75rem';

let handOffAnimations: Animation[] = [];
let handOffGhost: HTMLElement | undefined;

function cancelHandOff() {
    const animations = handOffAnimations;
    handOffAnimations = [];
    animations.forEach((animation) => animation.cancel());
    handOffGhost?.remove();
    handOffGhost = undefined;
    inlinePlace?.style.removeProperty('display');
    inlinePlace?.querySelector<HTMLElement>('[data-toc-expand]')?.style.removeProperty('display');
}

// Runs once every animation of the hand-off has finished, unless it's cancelled first.
function trackHandOff(animations: Animation[], onFinish: () => void) {
    handOffAnimations = animations;
    Promise.all(animations.map((animation) => animation.finished)).then(
        () => {
            if (handOffAnimations !== animations) return;
            handOffAnimations = [];
            onFinish();
            document.dispatchEvent(new Event('footnote-notes:layout'));
        },
        // Cancelled
        () => {},
    );
}

// What the sidebar or the inline ToC looks like right now: where it is, its corners, and a copy of its contents
type Snapshot = { rect: DOMRect; radius: string; layer: HTMLElement };
// The strip's glass card, which stands in for the inline ToC once that has scrolled away
const stripCard = strip?.querySelector<HTMLElement>('[data-toc-strip-card]');

// A copy of an element, unlinked from the page, at its size and pinned to the stand-in's top left (inside its border)
function copyLayer(element: HTMLElement, rect: DOMRect) {
    const layer = element.cloneNode(true) as HTMLElement;
    [layer, ...layer.querySelectorAll('*')].forEach((node) => {
        node.removeAttribute('id');
        [...node.attributes].forEach(({ name }) => {
            if (name.startsWith('data-toc') || name.startsWith('aria-')) node.removeAttribute(name);
        });
    });
    // The stand-in draws the glass, and the copy keeps the look it had even as the collapsed state changes.
    [layer, ...layer.querySelectorAll('*')].forEach((node) =>
        node.classList.remove(...[...node.classList].filter((name) => name.includes('toc-collapsed:'))),
    );
    layer.classList.remove('glass', 'glass-clear', 'sticky');
    Object.assign(layer.style, {
        position: 'absolute',
        top: '-1px',
        left: '-1px',
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
    });
    return layer;
}

function snapshotSidebar(): Snapshot | undefined {
    if (!sidebar || !isDisplayed(sidebar)) return undefined;
    const rect = sidebar.getBoundingClientRect();
    const layer = copyLayer(sidebar, rect);
    layer.style.display = 'flex';
    const scroller = sidebar.querySelector('[data-toc-scroller]');
    const copiedScroller = layer.querySelector<HTMLElement>('.overflow-y-auto');
    // Keeps the list scrolled where it was, once the copy is in the page.
    if (scroller && copiedScroller) requestAnimationFrame(() => (copiedScroller.scrollTop = scroller.scrollTop));
    return { rect, radius: getComputedStyle(sidebar).borderRadius, layer };
}

// The inline ToC closed: its title bar
function snapshotCard(): Snapshot | undefined {
    const summary = inlineToc?.querySelector('summary');
    if (!inlineToc || !summary || !isDisplayed(inlineToc)) return undefined;
    const rect = summary.getBoundingClientRect();
    return { rect, radius: getComputedStyle(inlineToc).borderRadius, layer: copyLayer(summary, rect) };
}

// The strip's card, if it's showing
function snapshotStrip(): Snapshot | undefined {
    if (!stripCard || !strip?.hasAttribute('data-shown') || !isDisplayed(stripCard)) return undefined;
    // Where it slides to: the stand-in brings it in instead.
    strip.getAnimations().forEach((animation) => animation.finish());
    const rect = stripCard.getBoundingClientRect();
    return { rect, radius: getComputedStyle(stripCard).borderRadius, layer: copyLayer(stripCard, rect) };
}

// The stand-in: an empty glass panel, fixed over the page, holding the copies
function createGhost(rect: DOMRect, layers: HTMLElement[]) {
    const ghost = document.createElement('div');
    ghost.className = 'glass';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    Object.assign(ghost.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        overflow: 'hidden',
        zIndex: '35',
        pointerEvents: 'none',
    });
    ghost.append(...layers);
    document.body.append(ghost);
    handOffGhost = ghost;
    return ghost;
}

const fadeKeyframes = (pairs: [offset: number, opacity: number][]) =>
    pairs.map(([offset, opacity]) => ({ offset, opacity }));
const linear = { duration: GLIDE_DURATION_MS, easing: 'linear', fill: 'both' } as const;

// Moves the stand-in from one snapshot to the other, then hands over to `arrivals`, the real elements it becomes.
function glide(from: Snapshot, to: Snapshot, arrivals: Element[]) {
    const ghost = createGhost(from.rect, [from.layer, to.layer]);
    const toRect = to.rect;
    return [
        ghost.animate(
            {
                top: [`${from.rect.top}px`, `${toRect.top}px`],
                left: [`${from.rect.left}px`, `${toRect.left}px`],
                width: [`${from.rect.width}px`, `${toRect.width}px`],
                height: [`${from.rect.height}px`, `${toRect.height}px`],
                borderRadius: [from.radius, to.radius],
            },
            { duration: GLIDE_DURATION_MS, easing: EASE_GLIDE, fill: 'forwards' },
        ),
        ghost.animate(fadeKeyframes([[0, 1], [LANDING_FROM, 1], [1, 0]]), linear),
        from.layer.animate(fadeKeyframes([[0, 1], [LEAVING_UNTIL, 0], [1, 0]]), linear),
        to.layer.animate(fadeKeyframes([[0, 0], [BECOMING_FROM, 0], [BECOMING_BY, 1], [1, 1]]), linear),
        ...arrivals.map((element) => element.animate(fadeKeyframes([[0, 0], [LANDING_FROM, 0], [1, 1]]), linear)),
    ];
}

// The place's height and margins, from nothing to what they are now
function animatePlace(place: HTMLElement, opening: boolean) {
    const style = getComputedStyle(place);
    return place.animate(
        {
            height: ['0px', style.height],
            marginTop: ['0px', style.marginTop],
            marginBottom: ['0px', style.marginBottom],
        },
        { duration: GLIDE_DURATION_MS, easing: EASE_GLIDE, direction: opening ? 'normal' : 'reverse', fill: 'forwards' },
    );
}

// The sidebar has just been hidden; `from` is how it looked.
function handOffToInline(from: Snapshot | undefined) {
    if (!from) return;
    const restoreButton = inlinePlace?.querySelector('[data-toc-expand]');
    if (inlinePlace && inlineToc && isOnScreen(inlinePlace)) {
        // Where the inline ToC lands, once its place has opened
        const to = snapshotCard();
        if (to) {
            const animations = [
                ...glide(from, to, [inlineToc, ...(restoreButton ? [restoreButton] : [])]),
                animatePlace(inlinePlace, true),
            ];
            trackHandOff(animations, () => {
                animations.forEach((animation) => animation.cancel());
                handOffGhost?.remove();
                handOffGhost = undefined;
            });
            return;
        }
    }
    // Scrolled past the place: into the strip at the top of the window
    const toStrip = stripCard && snapshotStrip();
    if (stripCard && toStrip) {
        const animations = glide(from, toStrip, [stripCard]);
        trackHandOff(animations, () => {
            animations.forEach((animation) => animation.cancel());
            handOffGhost?.remove();
            handOffGhost = undefined;
        });
        return;
    }

    const ghost = createGhost(from.rect, [from.layer]);
    const animation = ghost.animate(
        { opacity: [1, 0], transform: ['none', `translateY(${FADE_SHIFT}) scale(0.96)`] },
        { duration: TOGGLE_DURATION_MS * 0.6, easing: EASE_LEAVE, fill: 'forwards' },
    );
    trackHandOff([animation], () => {
        ghost.remove();
        handOffGhost = undefined;
    });
}

// The sidebar has just been shown again; `from` is how the inline ToC (`fromPlace`) or the strip looked, if either was
// on screen.
function handOffToSidebar(from: Snapshot | undefined, fromPlace: boolean) {
    if (!sidebar) return;
    const to = from && snapshotSidebar();
    const restoreButton = inlinePlace?.querySelector<HTMLElement>('[data-toc-expand]');
    // From the strip, which has already gone
    if (from && to && !fromPlace) {
        const animations = glide(from, to, [sidebar]);
        trackHandOff(animations, () => {
            animations.forEach((animation) => animation.cancel());
            handOffGhost?.remove();
            handOffGhost = undefined;
        });
        return;
    }
    if (!from || !to || !inlinePlace || !inlineToc) {
        const animation = sidebar.animate(
            { opacity: [0, 1], transform: [`translateY(${FADE_SHIFT}) scale(0.96)`, 'none'] },
            { duration: TOGGLE_DURATION_MS, easing: EASE_ARRIVE },
        );
        trackHandOff([animation], () => {});
        return;
    }

    // Kept displayed (its button too), unseen, while it closes up under the stand-in
    inlinePlace.style.display = 'block';
    if (restoreButton) restoreButton.style.display = 'grid';
    const hidden = { duration: GLIDE_DURATION_MS, fill: 'forwards' } as const;
    const animations = [
        ...glide(from, to, [sidebar]),
        animatePlace(inlinePlace, false),
        ...[inlineToc, ...(restoreButton ? [restoreButton] : [])].map((element) =>
            element.animate({ opacity: [0, 0] }, hidden),
        ),
    ];
    trackHandOff(animations, () => {
        animations.forEach((animation) => animation.cancel());
        handOffGhost?.remove();
        handOffGhost = undefined;
        inlinePlace.style.removeProperty('display');
        restoreButton?.style.removeProperty('display');
    });
}

function setSidebarCollapsed(collapsed: boolean) {
    if (!sidebar || collapsed === isSidebarCollapsed()) return;
    const hadFocus =
        sidebar.contains(document.activeElement) || expandButtons.includes(document.activeElement as HTMLButtonElement);
    // From wherever an unfinished animation has got to
    const fromRect = isDisplayed(sidebar) ? sidebar.getBoundingClientRect() : undefined;
    const fromRadius = fromRect ? getComputedStyle(sidebar).borderRadius : '';
    sidebarAnimation?.cancel();
    sidebarAnimation = undefined;
    cancelHandOff();
    // From `xl` up, the sidebar and the inline ToC swap places: the one that's leaving is copied before it's hidden.
    const fromPlace = !collapsed && isDisplayed(inlinePlace) && isOnScreen(inlinePlace!);
    const leaving = collapsed ? snapshotSidebar() : fromPlace ? snapshotCard() : snapshotStrip();
    // The text after the inline ToC's place, which moves when the place opens or closes
    const contentBottom = article?.getBoundingClientRect().bottom;
    const isPlaceAbove = () => isDisplayed(inlinePlace) && inlinePlace!.getBoundingClientRect().bottom <= 0;
    const wasPlaceAbove = isPlaceAbove();
    // This page keeps the reader's place itself (below), so the browser mustn't as well.
    document.documentElement.style.overflowAnchor = 'none';

    document.documentElement.toggleAttribute('data-toc-collapsed', collapsed);
    try {
        if (collapsed) localStorage.setItem(COLLAPSED_KEY, 'true');
        else localStorage.removeItem(COLLAPSED_KEY);
    } catch {
        // Storage unavailable; the choice lasts until the page is left.
    }
    collapseButton?.setAttribute('aria-expanded', String(!collapsed));
    sidebar.querySelector('[data-toc-expand]')?.setAttribute('aria-expanded', String(!collapsed));
    setInlineOpen(false);
    setStripOpen(false);
    // The place opens or closes at once when it has scrolled away above the window, which would move the text being
    // read. Scrolling by as much keeps it still.
    if ((collapsed ? isPlaceAbove() : wasPlaceAbove) && article && contentBottom !== undefined) {
        const shift = article.getBoundingClientRect().bottom - contentBottom;
        if (shift !== 0) window.scrollBy({ top: shift, behavior: 'instant' });
    }
    requestAnimationFrame(() => document.documentElement.style.removeProperty('overflow-anchor'));
    // Shows or hides the strip at once, so that its button can take the focus.
    updateActiveLinks();
    revealActiveEntry(sidebar);
    // Margin notes beside the sidebar were hidden under it (footnoteNotes.ts).
    document.dispatchEvent(new Event('footnote-notes:layout'));

    // The button that was used has gone, so the focus moves to the one that undoes it.
    if (hadFocus) {
        const target = collapsed
            ? expandButtons.find((button) => isDisplayed(button) && isOnScreen(button))
            : collapseButton;
        target?.focus({ preventScroll: true });
    }

    if (reducedMotion.matches) return;
    if (fromRect && !isDisplayed(sidebar)) {
        handOffToInline(leaving);
        return;
    }
    if (!fromRect && isDisplayed(sidebar)) {
        handOffToSidebar(leaving, fromPlace);
        return;
    }

    // From `lg` to `xl` the panel shrinks into its round button, and grows back out of it.
    if (!fromRect || !isDisplayed(sidebar)) return;
    const toRect = sidebar.getBoundingClientRect();
    const toRadius = getComputedStyle(sidebar).borderRadius;
    sidebar.style.overflow = 'hidden';
    const animation = sidebar.animate(
        {
            width: [`${fromRect.width}px`, `${toRect.width}px`],
            height: [`${fromRect.height}px`, `${toRect.height}px`],
            borderRadius: [fromRadius, toRadius],
        },
        { duration: TOGGLE_DURATION_MS, easing: collapsed ? EASE_LEAVE : EASE_ARRIVE },
    );
    sidebarAnimation = animation;
    // The contents fade in as the panel opens; its button fades in as it closes.
    const contents = collapsed
        ? [sidebar.querySelector('[data-toc-expand]')]
        : [...sidebar.children].filter((child) => !child.matches('[data-toc-expand]'));
    contents.forEach((element) =>
        element?.animate(
            { opacity: [0, 1] },
            {
                duration: TOGGLE_DURATION_MS / 2,
                delay: collapsed ? TOGGLE_DURATION_MS / 2 : TOGGLE_DURATION_MS / 4,
                easing: 'ease-out',
                fill: 'backwards',
            },
        ),
    );
    animation.addEventListener('finish', () => {
        sidebarAnimation = undefined;
        sidebar.style.overflow = '';
        document.dispatchEvent(new Event('footnote-notes:layout'));
    });
}

function updateActiveLinks() {
    updateSheetButton();
    updateStrip();
    const activeId = findActiveId();
    links.forEach((link) => link.toggleAttribute('data-active', headingId(link) === activeId));
    updateStripLabel(activeId);
    updateOnScreenMarks(activeId);
    if (activeId !== revealedId) {
        revealedId = activeId;
        revealActiveEntry(sidebar);
    }
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
    // Late-loading images move the headings.
    const resizeObserver = new ResizeObserver(queueUpdate);
    resizeObserver.observe(article ?? document.body);
    // Web fonts can re-wrap the entries, which moves the faint bar.
    tocLists.forEach((list) => resizeObserver.observe(list));

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            // These open the link elsewhere and leave this page where it is.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            clickedId = headingId(link);
            closeSheet();
            setStripOpen(false);
            setInlineOpen(false);
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

    stripButton?.addEventListener('click', () => {
        stripHoverDelay.cancel();
        // A click on a list that hovering just opened keeps it open; the next click closes it.
        if (isStripOpen() && isOpenedByHover) isOpenedByHover = false;
        else setStripOpen(!isStripOpen());
    });
    if (stripButton?.parentElement) setUpStripHover(stripButton.parentElement);
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
        if (isBackdrop || isCloseButton) closeSheet();
    });
    // However it closed (the browser can force a close on Escape), it's hidden again and the page scrolls.
    sheet?.addEventListener('close', () => {
        if (sheet.open) return;
        pendingSheetClose?.cancel();
        sheet.removeAttribute('data-shown');
    });
    // Escape slides it away too.
    sheet?.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeSheet();
    });

    inlineSummary?.addEventListener('click', (event) => {
        event.preventDefault();
        setInlineOpen(!inlineToc?.hasAttribute('data-expanded'));
    });
    // Its open list covers the post, so tapping or tabbing elsewhere closes it, and so does Escape.
    document.addEventListener('pointerdown', (event) => {
        if (!inlineToc?.contains(event.target as Node | null)) setInlineOpen(false);
    });
    inlineToc?.addEventListener('focusout', (event) => {
        if (event.relatedTarget && !inlineToc.contains(event.relatedTarget as Node)) setInlineOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !inlineToc?.hasAttribute('data-expanded')) return;
        setInlineOpen(false);
        inlineSummary?.focus();
    });
    // The browser can open it too (finding text in it, say).
    inlineToc?.addEventListener('toggle', () => {
        if (!inlineAnimation) inlineToc.toggleAttribute('data-expanded', (inlineToc as HTMLDetailsElement).open);
    });

    collapseButton?.addEventListener('click', () => setSidebarCollapsed(true));
    expandButtons.forEach((button) => button.addEventListener('click', () => setSidebarCollapsed(false)));
    // Collapsed before first paint on a later visit (BlogArticle.astro): the buttons say so too.
    if (isSidebarCollapsed()) {
        collapseButton?.setAttribute('aria-expanded', 'false');
        sidebar?.querySelector('[data-toc-expand]')?.setAttribute('aria-expanded', 'false');
    }

    updateActiveLinks();
}
