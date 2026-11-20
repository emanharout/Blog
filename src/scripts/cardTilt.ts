// Press-tilt for post cards ([data-tilt] with the `tilt-card` utility in src/styles/input.css).
// The card tilts toward the pointer as if pressed where it rests: the corner under the pointer dips away and the card
// sinks slightly. Mouse and trackpad only, and never with reduced motion; touch and pen leave cards still.

const MAX_TILT_DEG = 6;
const PRESS_PX = -10;

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setUpTilt(card: HTMLElement) {
    // Measured when the pointer enters, in page coordinates, so the tilt itself and page scrolling don't skew it
    let box: { left: number; top: number; width: number; height: number } | null = null;
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const render = () => {
        frame = 0;
        if (!box || !pointer) return;
        const x = Math.min(Math.max((pointer.x - box.left) / box.width, 0), 1);
        const y = Math.min(Math.max((pointer.y - box.top) / box.height, 0), 1);
        // Positive rotateY pushes the right edge away; positive rotateX pushes the top edge away.
        card.style.setProperty('--tilt-y', `${((x - 0.5) * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
        card.style.setProperty('--tilt-x', `${((0.5 - y) * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
        card.style.setProperty('--tilt-press', `${PRESS_PX}px`);
    };

    card.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse' || !finePointer.matches || reduceMotion.matches) return;
        const rect = card.getBoundingClientRect();
        box = { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height };
        card.dataset.tilting = '';
    });

    card.addEventListener('pointermove', (event) => {
        if (!box) return;
        pointer = { x: event.pageX, y: event.pageY };
        if (!frame) frame = requestAnimationFrame(render);
    });

    card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        frame = 0;
        box = null;
        pointer = null;
        delete card.dataset.tilting;
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
        card.style.removeProperty('--tilt-press');
    });
}

document.querySelectorAll<HTMLElement>('[data-tilt]').forEach(setUpTilt);
