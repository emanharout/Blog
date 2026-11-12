// Color theme handling. Loaded as a blocking script in <head> (see RootLayout.astro) so the `dark` class is applied
// before first paint, avoiding a flash of the wrong theme.
//
// A theme *option* is what the user picks and what we persist: 'light', 'dark' or 'system'.
// A theme *class* is what we apply to <html>: only 'dark' is applied; 'system' resolves via prefers-color-scheme.
//
// The theme picker (ColorThemeToggle.astro) is a group of native radios with name="theme" and values matching the
// options below.
(() => {
    const STORAGE_KEY = 'data-theme';
    const OPTIONS = ['light', 'dark', 'system'];
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function readStoredOption() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return OPTIONS.includes(stored) ? stored : 'system';
        } catch {
            return 'system';
        }
    }

    function storeOption(option) {
        try {
            localStorage.setItem(STORAGE_KEY, option);
        } catch {
            // Storage can be unavailable (private mode, blocked site data); the choice just won't persist.
        }
    }

    function applyTheme(option) {
        const isDark = option === 'dark' || (option === 'system' && darkQuery.matches);
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    }

    function syncPicker(option) {
        document.querySelectorAll('input[name="theme"]').forEach((input) => {
            input.checked = input.value === option;
        });
    }

    applyTheme(readStoredOption());

    // Follow OS changes live while 'system' is selected.
    darkQuery.addEventListener('change', () => {
        if (readStoredOption() === 'system') applyTheme('system');
    });

    document.addEventListener('DOMContentLoaded', () => {
        syncPicker(readStoredOption());
        const feedback = document.getElementById('theme-selection-feedback');

        document.querySelectorAll('input[name="theme"]').forEach((input) => {
            input.addEventListener('change', () => {
                storeOption(input.value);
                applyTheme(input.value);
                if (feedback) feedback.textContent = `Theme changed to ${input.dataset.label ?? input.value}`;
            });
        });
    });
})();
