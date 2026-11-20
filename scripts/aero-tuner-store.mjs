// Saved values for the dev-only design tuner (src/components/AeroTuner.astro).
//
// Three layers decide each --aero-* / --glass-* knob:
//   1. Factory defaults: the values each theme was designed with (src/styles/input.css and light-styles.css).
//   2. Saved values: src/styles/tuned.json, compiled to src/styles/tuned.css. The tuner's Save button writes them
//      through the dev server (see the `dev-only-tuner` integration in astro.config.mjs). They ship to production for
//      the default light style and dark mode.
//   3. Working values: unsaved tweaks, kept in the browser's localStorage by the tuner.
//
// tuned.json shape: { "light": { "<style id or 'default'>": { "<knob>": "<value>" } }, "dark": { "<knob>": "<value>" } }

import { readFile, writeFile } from 'node:fs/promises';

const JSON_PATH = new URL('../src/styles/tuned.json', import.meta.url);
const CSS_PATH = new URL('../src/styles/tuned.css', import.meta.url);

const NAME = /^[a-z0-9-]{1,48}$/;
// Knob values are numbers with optional units, or hex colors. Anything else is rejected so nothing can inject CSS.
const VALUE = /^(?:-?\d+(?:\.\d+)?(?:%|px|rem|deg)?|#[0-9a-f]{3,8})$/i;

export async function readSaved() {
    try {
        const saved = JSON.parse(await readFile(JSON_PATH, 'utf8'));
        return { light: saved.light ?? {}, dark: saved.dark ?? {} };
    } catch {
        return { light: {}, dark: {} };
    }
}

function sortedEntries(values) {
    return Object.entries(values).sort(([a], [b]) => a.localeCompare(b));
}

function block(selector, values) {
    const lines = sortedEntries(values).map(([name, value]) => `        --${name}: ${value};`);
    return `    ${selector} {\n${lines.join('\n')}\n    }`;
}

export function toCss(saved) {
    const blocks = [];
    for (const [style, values] of sortedEntries(saved.light)) {
        if (Object.keys(values).length === 0) continue;
        const styleSelector = style === 'default' ? ':not([data-light-style])' : `[data-light-style='${style}']`;
        blocks.push(block(`:root[data-design='aero']${styleSelector}:not(.dark):not([data-tuner-factory])`, values));
    }
    if (Object.keys(saved.dark).length > 0) {
        blocks.push(block(`:root.dark[data-design='aero']:not([data-tuner-factory])`, saved.dark));
    }
    return `/*
 * SAVED TUNER VALUES. Generated from tuned.json by scripts/aero-tuner-store.mjs when you press Save in the dev-only
 * design tuner; edit through the tuner (or edit tuned.json and save again). These override the factory defaults in
 * input.css and light-styles.css; [data-tuner-factory] is set only momentarily by the tuner to read those defaults.
 */

@layer base {
${blocks.join('\n\n')}
}
`;
}

// updates: [{ theme: 'light', style: 'daybreak', values: {...} }, { theme: 'dark', values: {...} }]
// Each update replaces the saved values for that slot.
export async function applyUpdates(updates) {
    if (!Array.isArray(updates)) throw new Error('updates must be an array');
    const saved = await readSaved();
    for (const update of updates) {
        const values = {};
        for (const [name, value] of Object.entries(update.values ?? {})) {
            if (!NAME.test(name) || typeof value !== 'string' || !VALUE.test(value)) {
                throw new Error(`Invalid value for --${name}: ${value}`);
            }
            values[name] = value;
        }
        if (update.theme === 'light') {
            if (!NAME.test(update.style ?? '')) throw new Error(`Invalid style: ${update.style}`);
            if (Object.keys(values).length) saved.light[update.style] = values;
            else delete saved.light[update.style];
        } else if (update.theme === 'dark') {
            saved.dark = values;
        } else {
            throw new Error(`Invalid theme: ${update.theme}`);
        }
    }
    const sortValues = (values) => Object.fromEntries(sortedEntries(values));
    const json = {
        light: Object.fromEntries(sortedEntries(saved.light).map(([style, values]) => [style, sortValues(values)])),
        dark: sortValues(saved.dark),
    };
    await writeFile(JSON_PATH, `${JSON.stringify(json, null, 4)}\n`);
    await writeFile(CSS_PATH, toCss(json));
    return json;
}
