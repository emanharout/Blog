// Experimental light-mode styles, for comparison in development only (see src/styles/light-styles.css,
// LightStyleBackdrop.astro and the /dev/compare page). Production always renders the default style.
// `id` is the value of <html data-light-style>; 'default' means no attribute.

export type LightStyle = {
    id: string;
    name: string;
    blurb: string;
};

export const LIGHT_STYLES: LightStyle[] = [
    { id: 'default', name: 'Refined Aero', blurb: 'The current light mode: blue sky, glass, honey light.' },
    { id: 'watercolor', name: 'Watercolor', blurb: 'Warm paper with soft blue and ochre washes; ink and sienna.' },
    { id: 'firstlight', name: 'First Light', blurb: 'The hour after night: periwinkle to peach, the last stars fading.' },
    { id: 'daybreak', name: 'Daybreak', blurb: 'A little after First Light: the sun just risen, sky blue over peach and gold.' },
    { id: 'afterglow', name: 'Afterglow', blurb: 'Just after sunset: dusky blue over mauve and rose, the first few stars.' },
    { id: 'bluehour', name: 'Blue Hour', blurb: 'Like First Light, later in the evening: deeper blues just after dusk, more stars.' },
    { id: 'nightfall', name: 'Nightfall', blurb: 'Later than Blue Hour: deeper indigo, many stars, a thin crescent moon.' },
    { id: 'atlas', name: 'Celestial Atlas', blurb: 'An old star chart by daylight: cream, navy ink, brass rings and constellations.' },
    { id: 'atlas-armillary', name: 'Celestial Atlas · Armillary', blurb: 'Warm ivory, sepia and brass: an engraved armillary sphere and scattered stars.' },
    { id: 'atlas-planisphere', name: 'Celestial Atlas · Planisphere', blurb: 'A star wheel with an hour ring and star field; warm parchment, sepia and copper.' },
    { id: 'bauhaus', name: 'Bauhaus Soft', blurb: 'Modernist calm: off-white with muted blue, red and yellow geometry.' },
    { id: 'bauhaus-circles', name: 'Bauhaus · Circles', blurb: 'Overlapping translucent circles after Kandinsky; warm brick, ochre and mustard.' },
    { id: 'illuminated', name: 'Illuminated', blurb: 'A manuscript page: vellum, lapis, rubric red and a gilt frame.' },
    { id: 'illuminated-pale', name: 'Illuminated · Pale Vellum', blurb: 'The manuscript style, softened: paler vellum, a finer gilt rule, a quieter red.' },
    { id: 'kintsugi', name: 'Kintsugi', blurb: 'Plain ivory stoneware with a fine speckle; charcoal and bronze. No decoration.' },
];
