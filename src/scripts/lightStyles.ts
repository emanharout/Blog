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
    { id: 'mist', name: 'Morning Mist', blurb: 'Pale grey-blue haze over soft, layered hills. Quiet and almost still.' },
    { id: 'porcelain', name: 'Porcelain', blurb: 'Gallery white, ink and one cobalt accent. No decoration at all.' },
    { id: 'watercolor', name: 'Watercolor', blurb: 'Warm paper with soft blue and ochre washes; ink and sienna.' },
    { id: 'firstlight', name: 'First Light', blurb: 'The hour after night: periwinkle to peach, the last stars fading.' },
    { id: 'atlas', name: 'Celestial Atlas', blurb: 'An old star chart by daylight: cream, navy ink, brass rings and constellations.' },
    { id: 'chapel', name: 'Chapel Light', blurb: 'Sun through stained glass onto pale limestone; soft jewel-toned light.' },
    { id: 'sumie', name: 'Sumi-e', blurb: 'Ink-wash mountains on washi paper, with one vermilion sun.' },
    { id: 'bauhaus', name: 'Bauhaus Soft', blurb: 'Modernist calm: off-white with muted blue, red and yellow geometry.' },
    { id: 'cyanotype', name: 'Cyanotype', blurb: 'Sun prints: Prussian blue fern prints at the corners of cream paper.' },
    { id: 'dappled', name: 'Dappled Light', blurb: 'Sunlight through leaves onto warm plaster; soft shadows sway.' },
    { id: 'illuminated', name: 'Illuminated', blurb: 'A manuscript page: vellum, lapis, rubric red and a gilt frame.' },
    { id: 'cartographer', name: 'Cartographer', blurb: 'A survey map: parchment, teal and brick, contour lines and a compass.' },
    { id: 'notebook', name: 'Field Notebook', blurb: 'Dot-grid notebook paper, ink blue and a red ribbon bookmark.' },
    { id: 'seaglass', name: 'Sea Glass', blurb: 'A calm shoreline: pale sky, quiet waves and frosted aqua glass.' },
    { id: 'kintsugi', name: 'Kintsugi', blurb: 'Ivory stoneware mended with fine gold seams; charcoal and bronze.' },
    { id: 'dunes', name: 'Dunes', blurb: 'A still desert morning: apricot sky over layered sand.' },
];
