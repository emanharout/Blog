// Bead styles compared on the dev-only /dev/picker page (picker.astro, pickerFrame.astro).
export const BEAD_STYLES = [
    { id: 'white', name: '1 · Solid white', blurb: 'A raised, glossy white bead by day; a translucent frosted bead by night.' },
    { id: 'pressed', name: '4 · Pressed in', blurb: 'The bead sinks into the glass instead of rising out of it: an inner shadow and a light lip along the bottom.' },
    { id: 'pearl', name: '5A · Pearl in your colors', blurb: 'A pearly sheen of your primary, secondary and tertiary hues. Pale and glossy by day; a faint tinted glow by night.' },
    { id: 'follow', name: '8 · Follows the icon (in use)', blurb: 'Tinted by the option it sits under: sunlight, sky blue or soft gray. Pale by day; a translucent glow by night.' },
] as const;
