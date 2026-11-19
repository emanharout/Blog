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
    { id: 'porcelain', name: 'Porcelain', blurb: 'Gallery white, ink and one cobalt accent. No decoration at all.' },
    { id: 'watercolor', name: 'Watercolor', blurb: 'Warm paper with soft blue and ochre washes; ink and sienna.' },
    { id: 'firstlight', name: 'First Light', blurb: 'The hour after night: periwinkle to peach, the last stars fading.' },
    { id: 'atlas', name: 'Celestial Atlas', blurb: 'An old star chart by daylight: cream, navy ink, brass rings and constellations.' },
    { id: 'atlas-armillary', name: 'Celestial Atlas · Armillary', blurb: 'Cooler, paler paper with an engraved armillary sphere and scattered stars.' },
    { id: 'atlas-planisphere', name: 'Celestial Atlas · Planisphere', blurb: 'A star wheel with an hour ring and star field; soft cream, indigo, copper.' },
    { id: 'chapel', name: 'Chapel Light', blurb: 'Sun through stained glass onto pale limestone; soft jewel-toned light.' },
    { id: 'sumie', name: 'Sumi-e', blurb: 'Ink-wash mountains on washi paper, with one vermilion sun.' },
    { id: 'bauhaus', name: 'Bauhaus Soft', blurb: 'Modernist calm: off-white with muted blue, red and yellow geometry.' },
    { id: 'bauhaus-albers', name: 'Bauhaus · Albers', blurb: 'Nested squares after Josef Albers; warm ochre and terracotta, cool blues.' },
    { id: 'bauhaus-circles', name: 'Bauhaus · Circles', blurb: 'Overlapping translucent circles after Kandinsky; deep blue and mustard.' },
    { id: 'dappled', name: 'Dappled Light', blurb: 'Sunlight through leaves onto warm plaster; soft shadows sway.' },
    { id: 'illuminated', name: 'Illuminated', blurb: 'A manuscript page: vellum, lapis, rubric red and a gilt frame.' },
    { id: 'illuminated-pale', name: 'Illuminated · Pale Vellum', blurb: 'The manuscript style, softened: paler vellum, a finer gilt rule, a quieter red.' },
    { id: 'illuminated-lapis', name: 'Illuminated · Lapis', blurb: 'Cool white vellum, a lapis blue rule with a gold inner line, lapis name.' },
    { id: 'illuminated-ruled', name: 'Illuminated · Ruled Page', blurb: 'No frame: faint manuscript ruling, double margin rules, gold corners.' },
    { id: 'kintsugi', name: 'Kintsugi', blurb: 'Plain ivory stoneware with a fine speckle; charcoal and bronze. No decoration.' },
];
