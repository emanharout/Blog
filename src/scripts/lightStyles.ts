// Light-mode styles (see src/styles/light-styles.css and LightStyleBackdrop.astro). The site ships
// DEFAULT_LIGHT_STYLE; the others can be previewed in development only (the design tuner's picker, ?light-style=…, and
// the /dev/compare page). `id` is the value of <html data-light-style>; 'default' (Refined Aero) means no attribute.

export const DEFAULT_LIGHT_STYLE = 'daybreak';

export type LightStyle = {
    id: string;
    name: string;
    blurb: string;
};

export const LIGHT_STYLES: LightStyle[] = [
    { id: 'default', name: 'Refined Aero', blurb: 'The earlier light mode: blue sky, glass, honey light.' },
    { id: 'watercolor', name: 'Watercolor', blurb: 'Warm paper with soft blue and ochre washes; ink and sienna.' },
    { id: 'firstlight', name: 'First Light', blurb: 'The hour after night: periwinkle to peach, the last stars fading.' },
    { id: 'daybreak', name: 'Daybreak', blurb: 'The site’s light mode. A little after First Light: sky blue over peach and gold.' },
    { id: 'atlas', name: 'Celestial Atlas', blurb: 'An old star chart by daylight: cream, navy ink, brass rings and constellations.' },
    { id: 'atlas-armillary', name: 'Celestial Atlas · Armillary', blurb: 'Warm ivory, sepia and brass: an engraved armillary sphere and scattered stars.' },
    { id: 'atlas-planisphere', name: 'Celestial Atlas · Planisphere', blurb: 'A star wheel with an hour ring and star field; warm parchment, sepia and copper.' },
    { id: 'bauhaus', name: 'Bauhaus Soft', blurb: 'Modernist calm: off-white with muted blue, red and yellow geometry.' },
    { id: 'bauhaus-circles', name: 'Bauhaus · Circles', blurb: 'Overlapping translucent circles after Kandinsky; warm brick, ochre and mustard.' },
    { id: 'illuminated-pale', name: 'Illuminated · Pale Vellum', blurb: 'The manuscript style, softened: paler vellum, a finer gilt rule, a quieter red.' },
    { id: 'kintsugi', name: 'Kintsugi', blurb: 'Plain ivory stoneware with a fine speckle; charcoal and bronze. No decoration.' },
];
