// Behavior for the dev-only design tuner (AeroTuner.astro). Loaded only in development, through a dynamic import
// that the production build removes, so none of this ships.
type Theme = 'light' | 'dark';
type Overrides = Record<Theme, Record<string, string>>;

const root = document.documentElement;
// Experimental light style in use ('default' = Refined Aero). Each style keeps its own tweaks.
const lightStyle = root.dataset.lightStyle ?? 'default';
const STORAGE_KEY = lightStyle === 'default' ? 'aero-tuner' : `aero-tuner:${lightStyle}`;
// Selectors outrank the defaults (including the experimental light styles), and the light one never applies in
// dark mode.
const SELECTORS: Record<Theme, string> = {
    light: "html:root:root[data-design='aero']:not(.dark)",
    dark: "html:root.dark[data-design='aero']",
};

// Hide the tuner inside the side-by-side compare page's previews.
if (window.self !== window.top) document.getElementById('aero-tuner')?.remove();

const panel = document.getElementById('aero-tuner-panel');
const toggle = document.getElementById('aero-tuner-toggle');
const themeLabel = document.getElementById('aero-tuner-theme');
const status = document.getElementById('aero-tuner-status');
const rows = document.querySelectorAll<HTMLElement>('.aero-tuner-row');
const inputs = document.querySelectorAll<HTMLInputElement>('#aero-tuner input[data-knob]');

function load(): { overrides: Overrides; open: boolean } {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        return {
            overrides: { light: saved.overrides?.light ?? {}, dark: saved.overrides?.dark ?? {} },
            open: Boolean(saved.open),
        };
    } catch {
        return { overrides: { light: {}, dark: {} }, open: false };
    }
}

const state = load();

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage unavailable; tweaks just won't survive a reload.
    }
}

const styleEl = document.createElement('style');
styleEl.id = 'aero-tuner-overrides';
document.head.append(styleEl);

function cssFor(theme: Theme, indent = '    '): string {
    const entries = Object.entries(state.overrides[theme]);
    if (entries.length === 0) return '';
    return `${SELECTORS[theme]} {\n${entries.map(([name, value]) => `${indent}--${name}: ${value};`).join('\n')}\n}`;
}

function writeStyles() {
    styleEl.textContent = [cssFor('light'), cssFor('dark')].filter(Boolean).join('\n');
}

const currentTheme = (): Theme => (root.classList.contains('dark') ? 'dark' : 'light');

function format(value: string, unit: string): string {
    if (value.startsWith('#')) return value;
    const n = parseFloat(value);
    if (Number.isNaN(n)) return value;
    return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, '')}${unit}`;
}

// Grey out and disable knobs whose controlling toggle is off.
function updateDependents() {
    rows.forEach((row) => {
        const controller = row.dataset.dependsOn;
        if (!controller) return;
        const toggleInput = document.querySelector<HTMLInputElement>(`#aero-tuner input[data-knob="${controller}"]`);
        const enabled = toggleInput?.checked ?? true;
        row.toggleAttribute('data-disabled', !enabled);
        row.querySelectorAll('input').forEach((input) => {
            input.disabled = !enabled;
        });
    });
}

// Show only the knobs for the current theme and fill them with the live values.
function refresh() {
    const theme = currentTheme();
    if (themeLabel) themeLabel.textContent = theme;
    // Only this mode's options (plus shared ones) are shown; sections with nothing left are hidden too
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
    const computed = getComputedStyle(root);
    inputs.forEach((input) => {
        const name = input.dataset.knob!;
        const value = computed.getPropertyValue(`--${name}`).trim();
        if (input.type === 'checkbox') input.checked = parseFloat(value) >= 0.5;
        else input.value = input.type === 'color' ? value : String(parseFloat(value));
        const output = document.querySelector(`[data-output-for="${name}"]`);
        if (output) output.textContent = format(value, input.dataset.unit ?? '');
    });
    updateDependents();
}

inputs.forEach((input) => {
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
        const name = input.dataset.knob!;
        const value = input.type === 'checkbox' ? (input.checked ? '1' : '0') : `${input.value}${input.dataset.unit ?? ''}`;
        const themes: Theme[] = input.dataset.shared !== undefined ? ['light', 'dark'] : [currentTheme()];
        themes.forEach((theme) => {
            state.overrides[theme][name] = value;
        });
        writeStyles();
        save();
        const output = document.querySelector(`[data-output-for="${name}"]`);
        if (output) output.textContent = format(value, input.dataset.unit ?? '');
        if (input.type === 'checkbox') updateDependents();
    });
});

function setOpen(open: boolean) {
    state.open = open;
    if (panel) panel.hidden = !open;
    toggle?.setAttribute('aria-expanded', String(open));
    save();
    if (open) refresh();
}

toggle?.addEventListener('click', () => setOpen(!state.open));

document.getElementById('aero-tuner-reset')?.addEventListener('click', () => {
    const theme = currentTheme();
    state.overrides[theme] = {};
    // Shared knobs are reset in both modes so they stay in sync
    inputs.forEach((input) => {
        if (input.dataset.shared !== undefined) delete state.overrides[theme === 'light' ? 'dark' : 'light'][input.dataset.knob!];
    });
    writeStyles();
    save();
    refresh();
    if (status) status.textContent = `Reset ${theme} mode to the defaults.`;
});

document.getElementById('aero-tuner-copy')?.addEventListener('click', async () => {
    const blocks = (['light', 'dark'] as Theme[])
        .map((theme) => {
            const css = cssFor(theme);
            return css && `/* ${theme} mode */\n${css}`;
        })
        .filter(Boolean);
    if (blocks.length === 0) {
        if (status) status.textContent = 'Nothing to copy yet: all values are the defaults.';
        return;
    }
    const text = `/* Aero design tuner values (light style: ${lightStyle}) */\n${blocks.join('\n\n')}`;
    try {
        await navigator.clipboard.writeText(text);
        if (status) status.textContent = 'Copied. Paste it to Claude to make these the defaults.';
    } catch {
        console.log(text);
        if (status) status.textContent = "Couldn't copy; the values were printed to the browser console.";
    }
});

// Follow theme switches
new MutationObserver(() => {
    if (state.open) refresh();
}).observe(root, { attributes: true, attributeFilter: ['class'] });

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
setOpen(state.open);

export {};
