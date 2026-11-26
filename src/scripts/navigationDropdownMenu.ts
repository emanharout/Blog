// Disclosure behavior for the site header:
// - The mobile menu button (#site-nav-button) shows/hides the nav panel below `md`.
// - The chevron next to "Blog" (#blog-submenu-button) shows/hides the blog sections list. On desktop that list is a
//   dropdown, so it also closes on outside clicks.
// Escape closes whatever is open and returns focus to the button that opened it.
// Open state is expressed as `aria-expanded` on the button and a `data-open` attribute on the controlled element,
// which the markup styles with Tailwind's `data-open:` variant.

function setupDisclosure(button: HTMLButtonElement) {
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    if (!panel) return undefined;

    const setOpen = (open: boolean) => {
        button.setAttribute('aria-expanded', String(open));
        panel.toggleAttribute('data-open', open);
    };
    const isOpen = () => button.getAttribute('aria-expanded') === 'true';

    button.addEventListener('click', () => setOpen(!isOpen()));
    return { button, panel, setOpen, isOpen };
}

const menuButton = document.getElementById('site-nav-button');
const submenuButton = document.getElementById('blog-submenu-button');

const menu = menuButton instanceof HTMLButtonElement ? setupDisclosure(menuButton) : undefined;
const submenu = submenuButton instanceof HTMLButtonElement ? setupDisclosure(submenuButton) : undefined;

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (submenu?.isOpen()) {
        submenu.setOpen(false);
        submenu.button.focus();
    } else if (menu?.isOpen()) {
        menu.setOpen(false);
        menu.button.focus();
    }
});

// Leaving the page from the open mobile menu fades to the next page while the menu folds back into its button (the
// animation is in HeaderNav.astro). Every other page change, and any with reduced motion, loads as usual. `pageswap`
// only fires in browsers that fade between pages.
window.addEventListener('pageswap', (event) => {
    const transition = (event as Event & { viewTransition?: { skipTransition(): void } | null }).viewTransition;
    if (!transition) return;
    const fromOpenMenu = menu?.isOpen() && !window.matchMedia('(min-width: 48rem)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fromOpenMenu || reduceMotion) transition.skipTransition();
});

// Outside clicks close the desktop dropdown and the mobile menu card (including taps on the blurred backdrop behind it)
document.addEventListener('click', (event) => {
    const target = event.target as Node | null;
    const outside = (disclosure: NonNullable<typeof menu>) =>
        !disclosure.button.contains(target) && !disclosure.panel.contains(target);
    const desktop = window.matchMedia('(min-width: 48rem)').matches;

    if (submenu?.isOpen() && desktop && outside(submenu)) submenu.setOpen(false);
    if (menu?.isOpen() && !desktop && outside(menu)) menu.setOpen(false);
});
