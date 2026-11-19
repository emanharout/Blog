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
    { id: 'glasshouse', name: 'Glasshouse', blurb: 'A Victorian conservatory: cream light, faint glazing bars, fern fronds.' },
    { id: 'watercolor', name: 'Watercolor', blurb: 'Warm paper with soft blue and ochre washes; ink and sienna.' },
    { id: 'firstlight', name: 'First Light', blurb: 'The hour after night: periwinkle to peach, the last stars fading.' },
    { id: 'atlas', name: 'Celestial Atlas', blurb: 'An old star chart by daylight: cream, navy ink, brass rings and constellations.' },
    { id: 'chapel', name: 'Chapel Light', blurb: 'Sun through stained glass onto pale limestone; soft jewel-toned light.' },
    { id: 'marbled', name: 'Marbled Endpaper', blurb: 'Inside an old book cover: indigo and ochre marbling framing cream pages.' },
    { id: 'sumie', name: 'Sumi-e', blurb: 'Ink-wash mountains on washi paper, with one vermilion sun.' },
    { id: 'bauhaus', name: 'Bauhaus Soft', blurb: 'Modernist calm: off-white with muted blue, red and yellow geometry.' },
];
