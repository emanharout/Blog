// Font options for the dev-only font picker (src/components/FontPicker.astro). An option with id 'site' is what the
// site ships with (astro.config.mjs); the others load from Google Fonts, only while picked.

export interface FontOption {
    id: string;
    label: string;
    /** Google Fonts family; none for the site's own font */
    family?: string;
    /** Google Fonts axis spec: only weights and styles the family has, or Google rejects the request */
    axes?: string;
    vibe: string;
}

// The site's serif, then the others it was chosen from. Fonts with a few fixed weights list only those.
export const SERIFS: FontOption[] = [
    {
        id: 'site',
        label: 'Libre Caslon (site)',
        vibe: 'Caslon, the type of 18th-century England, from Georgian pamphlets to the first printings of the Declaration of Independence. The most tweed of the set: a gentleman’s library, leather armchairs, foxed pages.',
    },
    {
        id: 'newsreader',
        label: 'Newsreader',
        family: 'Newsreader',
        axes: 'ital,opsz,wght@0,6..72,200..800;1,6..72,200..800',
        vibe: 'Made for long-form reading on screens, and the site’s serif before Libre Caslon. Quiet confidence: linen shirts, the weekend paper at a café, a well-edited magazine essay.',
    },
    {
        id: 'eb-garamond',
        label: 'EB Garamond',
        family: 'EB Garamond',
        axes: 'ital,wght@0,400..800;1,400..800',
        vibe: 'A faithful revival of Claude Garamond’s 16th-century Paris type. Classical and graceful: Oxford college quads, Renaissance humanism, a well-thumbed Penguin Classic.',
    },
    {
        id: 'brygada',
        label: 'Brygada 1918',
        family: 'Brygada 1918',
        vibe: 'Revived from a Polish typeface of the 1920s, with sturdy, slightly quirky shapes. Old-world and characterful: interwar Europe, a café in Kraków, letterpress posters.',
    },
];

const DEFAULT_AXES = 'ital,wght@0,400;0,500;0,600;0,700;1,400;1,600';

/** One stylesheet per family, so a rejected request can't take other families down with it */
export function fontStylesheetUrl(font: FontOption): string | undefined {
    if (!font.family) return undefined;
    return (
        `https://fonts.googleapis.com/css2?family=${font.family.replaceAll(' ', '+')}` +
        `:${font.axes ?? DEFAULT_AXES}&display=swap`
    );
}

export const SERIF_FALLBACK = 'ui-serif, Georgia, serif';
