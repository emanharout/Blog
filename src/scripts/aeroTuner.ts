// Behavior for the dev-only design tuner (AeroTuner.astro). Loaded only in development, through a dynamic import
// that the production build removes, so none of this ships.
//
// Values come in three layers (see scripts/aero-tuner-store.mjs):
//   factory defaults (the CSS each theme was designed with)
//   < saved values (src/styles/tuned.css, written by Save through the dev server)
//   < working values (unsaved tweaks: an injected <style>, persisted in localStorage per light style).
type Theme = 'light' | 'dark';
type Values = Record<string, string>;
type Overrides = Record<Theme, Values>;
type Saved = { light: Record<string, Values>; dark: Values };

const root = document.documentElement;
// Experimental light style in use ('default' = Refined Aero). Each style keeps its own tweaks.
const lightStyle = root.dataset.lightStyle ?? 'default';
const STORAGE_KEY = lightStyle === 'default' ? 'aero-tuner' : `aero-tuner:${lightStyle}`;
const SAVE_URL = '/__aero-tuner/saved';
// Injected after the site's stylesheets and unlayered, so working values win over saved and factory values; the
// light selector never applies in dark mode.
const SELECTORS: Record<Theme, string> = {
    light: "html:root[data-design='aero']:not(.dark)",
    dark: "html:root.dark[data-design='aero']",
};
// Set on <html> for a moment to read the factory defaults underneath the saved values (see tuned.css).
const FACTORY_ATTRIBUTE = 'data-tuner-factory';

// Hide the tuner inside the side-by-side compare page's previews (they still show your working values).
const inPreview = window.self !== window.top;
if (inPreview) document.getElementById('aero-tuner')?.remove();

const panel = document.getElementById('aero-tuner-panel');
const toggle = document.getElementById('aero-tuner-toggle');
const badge = document.getElementById('aero-tuner-badge');
const themeLabel = document.getElementById('aero-tuner-theme');
const status = document.getElementById('aero-tuner-status');
const unsavedLabel = document.getElementById('aero-tuner-unsaved');
const modeNote = document.getElementById('aero-tuner-mode-note');
const saveButton = document.getElementById('aero-tuner-save') as HTMLButtonElement | null;
const compareButton = document.getElementById('aero-tuner-compare') as HTMLButtonElement | null;
const revertButton = document.getElementById('aero-tuner-revert') as HTMLButtonElement | null;
const tip = document.getElementById('aero-tuner-tip');
const rows = [...document.querySelectorAll<HTMLElement>('.aero-tuner-row')];
const inputs = [...document.querySelectorAll<HTMLInputElement>('#aero-tuner input[data-knob]')];
const knobNames = inputs.map((input) => input.dataset.knob!);
const sharedKnobs = new Set(inputs.filter((input) => input.dataset.shared !== undefined).map((input) => input.dataset.knob!));

// ---------- Working values (localStorage) ----------

function load(): { overrides: Overrides; open: boolean } {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        return {
            overrides: { light: stored.overrides?.light ?? {}, dark: stored.overrides?.dark ?? {} },
            open: Boolean(stored.open),
        };
    } catch {
        return { overrides: { light: {}, dark: {} }, open: false };
    }
}

const state = load();
// Fields temporarily showing their saved value (per mode), and whether the whole page is showing saved values
const flipped: Record<Theme, Set<string>> = { light: new Set(), dark: new Set() };
let showingSaved = false;
let saved: Saved = { light: {}, dark: {} };

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage unavailable; tweaks just won't survive a reload.
    }
}

const styleEl = document.createElement('style');
styleEl.id = 'aero-tuner-overrides';
document.head.append(styleEl);

function cssFor(theme: Theme, values: Values, skip: Set<string> = new Set()): string {
    const entries = Object.entries(values).filter(([name]) => !skip.has(name));
    if (entries.length === 0) return '';
    return `${SELECTORS[theme]} {\n${entries.map(([name, value]) => `    --${name}: ${value};`).join('\n')}\n}`;
}

function writeStyles() {
    styleEl.textContent = (['light', 'dark'] as Theme[])
        .map((theme) => cssFor(theme, state.overrides[theme], flipped[theme]))
        .filter(Boolean)
        .join('\n');
    styleEl.media = showingSaved ? 'not all' : 'all';
}

const currentTheme = (): Theme => (root.classList.contains('dark') ? 'dark' : 'light');
const otherTheme = (theme: Theme): Theme => (theme === 'light' ? 'dark' : 'light');

// ---------- Reading values ----------

// Computed knob values without the working values: the saved values, or with `factory` the factory defaults.
function readBaseline(names: string[], factory = false): Values {
    const media = styleEl.media;
    styleEl.media = 'not all';
    if (factory) root.setAttribute(FACTORY_ATTRIBUTE, '');
    const computed = getComputedStyle(root);
    const values = Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(`--${name}`).trim()]));
    root.removeAttribute(FACTORY_ATTRIBUTE);
    styleEl.media = media;
    return values;
}

function same(a: string | undefined, b: string | undefined): boolean {
    if (a === undefined || b === undefined) return a === b;
    const [x, y] = [parseFloat(a), parseFloat(b)];
    if (!Number.isNaN(x) && !Number.isNaN(y) && !a.startsWith('#')) return Math.abs(x - y) < 1e-6;
    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const isVisible = (name: string) => !rows.find((row) => row.dataset.rowFor === name)?.hidden;

// Visible fields in this mode whose working value differs from the saved one
function unsavedChanges(theme = currentTheme()): Values {
    const baseline = readBaseline(knobNames);
    return Object.fromEntries(
        Object.entries(state.overrides[theme]).filter(([name, value]) => isVisible(name) && !same(value, baseline[name])),
    );
}

function format(value: string, unit: string): string {
    if (value.startsWith('#')) return value;
    const n = parseFloat(value);
    if (Number.isNaN(n)) return value;
    return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, '')}${unit}`;
}

// ---------- Rendering ----------

function refresh() {
    const theme = currentTheme();
    if (themeLabel) themeLabel.textContent = theme;

    // Only this mode's (and this light style's) options are shown; sections with nothing left are hidden too
    const styleScope = lightStyle === 'default' ? 'default' : 'styled';
    rows.forEach((row) => {
        const inTheme = (row.dataset.themes ?? '').split(' ').includes(theme);
        const inStyle = !row.dataset.styles || row.dataset.styles.split(' ').includes(styleScope);
        row.hidden = !(inTheme && inStyle);
    });
    const styleRow = document.getElementById('aero-tuner-style-row');
    if (styleRow) styleRow.hidden = theme !== 'light';
    document.querySelectorAll<HTMLFieldSetElement>('#aero-tuner fieldset').forEach((group) => {
        group.hidden = !group.querySelector('.aero-tuner-row:not([hidden])');
    });

    const changes = unsavedChanges(theme);
    const computed = getComputedStyle(root);
    inputs.forEach((input) => {
        const name = input.dataset.knob!;
        const value = computed.getPropertyValue(`--${name}`).trim();
        if (input.type === 'checkbox') input.checked = parseFloat(value) >= 0.5;
        else input.value = input.type === 'color' ? value : String(parseFloat(value));
        const output = document.querySelector(`[data-output-for="${name}"]`);
        if (output) output.textContent = format(value, input.dataset.unit ?? '');

        const row = rows.find((r) => r.dataset.rowFor === name);
        const changed = name in changes;
        if (!changed) flipped[theme].delete(name);
        row?.toggleAttribute('data-changed', changed);
        row?.querySelector('[data-flip-for]')?.setAttribute('aria-pressed', String(flipped[theme].has(name)));
    });
    updateDisabled();

    const count = Object.keys(changes).length;
    if (unsavedLabel) unsavedLabel.textContent = count ? `${count} unsaved change${count === 1 ? '' : 's'}` : 'No unsaved changes';
    if (badge) {
        badge.hidden = count === 0;
        badge.textContent = String(count);
    }
    if (modeNote) modeNote.textContent = showingSaved ? 'Showing saved values' : '';
    if (saveButton) saveButton.disabled = count === 0 || showingSaved;
    if (revertButton) revertButton.disabled = count === 0;
    if (compareButton) {
        compareButton.disabled = count === 0 && !showingSaved;
        compareButton.setAttribute('aria-pressed', String(showingSaved));
    }
}

// Inputs are disabled while their toggle is off, while the page shows saved values, or while flipped to saved
function updateDisabled() {
    const theme = currentTheme();
    rows.forEach((row) => {
        const controller = row.dataset.dependsOn;
        const controllerOn = controller
            ? (document.querySelector<HTMLInputElement>(`#aero-tuner input[data-knob="${controller}"]`)?.checked ?? true)
            : true;
        row.toggleAttribute('data-disabled', !controllerOn);
        const name = row.dataset.rowFor!;
        row.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
            input.disabled = !controllerOn || showingSaved || flipped[theme].has(name);
        });
        row.querySelectorAll<HTMLButtonElement>('[data-flip-for]').forEach((button) => {
            button.disabled = showingSaved;
        });
    });
}

function say(message: string) {
    if (status) status.textContent = message;
}

// ---------- Editing ----------

inputs.forEach((input) => {
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
        const name = input.dataset.knob!;
        const value = input.type === 'checkbox' ? (input.checked ? '1' : '0') : `${input.value}${input.dataset.unit ?? ''}`;
        const theme = currentTheme();
        const themes: Theme[] = sharedKnobs.has(name) ? ['light', 'dark'] : [theme];
        themes.forEach((t) => {
            state.overrides[t][name] = value;
            flipped[t].delete(name);
        });
        writeStyles();
        persist();
        refresh();
    });
});

// Flip one field between its new and saved value
document.querySelectorAll<HTMLButtonElement>('[data-flip-for]').forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const name = button.dataset.flipFor!;
        const set = flipped[currentTheme()];
        if (set.has(name)) set.delete(name);
        else set.add(name);
        writeStyles();
        refresh();
    });
});

// Flip the whole page between new and saved values
function toggleCompare() {
    showingSaved = !showingSaved;
    writeStyles();
    refresh();
    say(showingSaved ? 'Showing your saved values. Press \\ again for your new ones.' : 'Showing your new values.');
}
compareButton?.addEventListener('click', toggleCompare);

document.addEventListener('keydown', (event) => {
    if (event.key !== '\\' || !state.open || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const typing =
        target?.isContentEditable ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        (target?.tagName === 'INPUT' && !['range', 'checkbox', 'color'].includes((target as HTMLInputElement).type));
    if (typing) return;
    event.preventDefault();
    toggleCompare();
});

function clearWorking(theme: Theme, names: string[]) {
    names.forEach((name) => {
        delete state.overrides[theme][name];
        flipped[theme].delete(name);
        if (sharedKnobs.has(name)) {
            delete state.overrides[otherTheme(theme)][name];
            flipped[otherTheme(theme)].delete(name);
        }
    });
}

revertButton?.addEventListener('click', () => {
    const theme = currentTheme();
    clearWorking(theme, Object.keys(state.overrides[theme]));
    showingSaved = false;
    writeStyles();
    persist();
    refresh();
    say(`Reverted ${theme} mode to your saved values.`);
});

document.getElementById('aero-tuner-factory')?.addEventListener('click', () => {
    const theme = currentTheme();
    const visible = knobNames.filter(isVisible);
    const factory = readBaseline(visible, true);
    const baseline = readBaseline(visible);
    let differences = 0;
    visible.forEach((name) => {
        const themes: Theme[] = sharedKnobs.has(name) ? ['light', 'dark'] : [theme];
        themes.forEach((t) => {
            if (same(factory[name], baseline[name])) delete state.overrides[t][name];
            else state.overrides[t][name] = factory[name];
            flipped[t].delete(name);
        });
        if (!same(factory[name], baseline[name])) differences++;
    });
    showingSaved = false;
    writeStyles();
    persist();
    refresh();
    say(
        differences
            ? `Loaded the factory defaults (${differences} differ from your saved values). Save to keep them, or Revert to go back.`
            : 'Your saved values already match the factory defaults.',
    );
});

// Wait until the saved stylesheet (updated by the dev server) shows the new values, so clearing the working values
// doesn't flash back to the old ones.
async function waitForSaved(values: Values, timeout = 4000): Promise<boolean> {
    const names = Object.keys(values);
    const start = performance.now();
    while (performance.now() - start < timeout) {
        const baseline = readBaseline(names);
        if (names.every((name) => same(baseline[name], values[name]))) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
}

saveButton?.addEventListener('click', async () => {
    const theme = currentTheme();
    const changes = unsavedChanges(theme);
    if (Object.keys(changes).length === 0) return;
    const updates: { theme: Theme; style?: string; values: Values }[] = [];
    const slot = (t: Theme) => (t === 'light' ? (saved.light[lightStyle] ?? {}) : saved.dark);
    updates.push({ theme, style: lightStyle, values: { ...slot(theme), ...changes } });
    const sharedChanges = Object.fromEntries(Object.entries(changes).filter(([name]) => sharedKnobs.has(name)));
    if (Object.keys(sharedChanges).length) {
        const other = otherTheme(theme);
        updates.push({ theme: other, style: lightStyle, values: { ...slot(other), ...sharedChanges } });
    }

    saveButton.disabled = true;
    say('Saving…');
    try {
        const response = await fetch(SAVE_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ updates }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? response.statusText);
        saved = result;
        const applied = await waitForSaved(changes);
        clearWorking(theme, Object.keys(changes));
        persist();
        if (!applied) {
            location.reload();
            return;
        }
        writeStyles();
        refresh();
        const count = Object.keys(changes).length;
        say(`Saved ${count} value${count === 1 ? '' : 's'} to src/styles/tuned.css.`);
    } catch (error) {
        say(`Couldn't save: ${error instanceof Error ? error.message : String(error)}`);
        refresh();
    }
});

document.getElementById('aero-tuner-copy')?.addEventListener('click', async () => {
    const blocks = (['light', 'dark'] as Theme[])
        .map((theme) => {
            const css = cssFor(theme, state.overrides[theme]);
            return css && `/* ${theme} mode */\n${css}`;
        })
        .filter(Boolean);
    if (blocks.length === 0) {
        say('Nothing to copy: there are no unsaved values.');
        return;
    }
    const text = `/* Aero design tuner values (light style: ${lightStyle}) */\n${blocks.join('\n\n')}`;
    try {
        await navigator.clipboard.writeText(text);
        say('Copied your unsaved values as CSS.');
    } catch {
        console.log(text);
        say("Couldn't copy; the values were printed to the browser console.");
    }
});

// ---------- Tooltips: shown after a short hover over a field or button ----------

let tipTimer: number | undefined;
let tipTarget: HTMLElement | null = null;

function hideTip() {
    window.clearTimeout(tipTimer);
    tipTarget = null;
    if (tip) tip.hidden = true;
}

function showTip(target: HTMLElement) {
    if (!tip || !panel) return;
    tip.textContent = target.dataset.tip ?? '';
    tip.hidden = false;
    const panelBox = panel.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const tipBox = tip.getBoundingClientRect();
    // Beside the panel when there's room, otherwise just above the field
    if (panelBox.right + 10 + tipBox.width < window.innerWidth) {
        tip.style.left = `${panelBox.right + 10}px`;
        tip.style.top = `${Math.min(Math.max(8, box.top), window.innerHeight - tipBox.height - 8)}px`;
    } else {
        tip.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - tipBox.width - 8))}px`;
        tip.style.top = `${Math.max(8, box.top - tipBox.height - 6)}px`;
    }
}

document.getElementById('aero-tuner')?.addEventListener('pointerover', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-tip]');
    if (target === tipTarget) return;
    hideTip();
    if (!target) return;
    tipTarget = target;
    tipTimer = window.setTimeout(() => showTip(target), 450);
});
document.getElementById('aero-tuner')?.addEventListener('pointerleave', hideTip);
document.getElementById('aero-tuner')?.addEventListener('pointerdown', hideTip);
panel?.addEventListener('scroll', hideTip);

// ---------- Panel, theme and style ----------

function setOpen(open: boolean) {
    state.open = open;
    if (panel) panel.hidden = !open;
    toggle?.setAttribute('aria-expanded', String(open));
    persist();
    if (!open) hideTip();
    refresh();
}

toggle?.addEventListener('click', () => setOpen(!state.open));

// Follow theme switches
new MutationObserver(() => refresh()).observe(root, { attributes: true, attributeFilter: ['class'] });

// Light style picker: remembered for this browser; reloads so every part of the page picks it up.
const stylePicker = document.getElementById('aero-tuner-style') as HTMLSelectElement | null;
if (stylePicker) {
    stylePicker.value = lightStyle;
    stylePicker.addEventListener('change', () => {
        try {
            localStorage.setItem('light-style', stylePicker.value);
        } catch {
            // Storage unavailable
        }
        const url = new URL(location.href);
        url.searchParams.delete('light-style');
        location.href = url.toString();
    });
}

writeStyles();
if (!inPreview) {
    setOpen(state.open);
    fetch(SAVE_URL)
        .then((response) => response.json())
        .then((result: Saved) => {
            saved = { light: result.light ?? {}, dark: result.dark ?? {} };
        })
        .catch(() => say("Couldn't reach the dev server to read saved values; Save may not work."));
}

export {};
