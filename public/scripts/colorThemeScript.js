// ThemeOption is the selectable options (light, dark, system)
// ThemeClass is the class we apply to the HTML DOM (i.e. system maps to either light or dark dynamically, and one
// of those two values gets applied dynamically. 'system' never gets applied as a class).
//
// User can select any ThemeOption as their preference. We persist the ThemeOption.
// We apply to the DOM a ThemeClass mapped from the stored ThemeOption.
// ThemeOption will map from light => light, dark => dark, and system => either light or dark depending on time of day.

const themeStorageKey = 'data-theme';
// EH: WARNING id:'theme constants': 'system' element in this array MUST match values in other files with the same
// warning (search via warning's id).
// EH: WARNING id:theme input labels:  ids of each `label` element in `ColorThemeToggle.astro` is dependent on `lightThemeStorageValue`, darkThemeStorageValue, and `systemThemeStorageValue` , if those change we need to update the ids here. Search warning id to find file that contains the label elements.
const systemThemeStorageValue = 'system';
const lightThemeStorageValue = 'light';
const darkThemeStorageValue = 'dark';
const themeOptionStorageValues = [lightThemeStorageValue, darkThemeStorageValue, systemThemeStorageValue];

const allThemeOptions = themeOptionStorageValues.filter((theme) => theme !== systemThemeStorageValue);

function getStoredThemeOption() {
    let storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === null) {
        storedTheme = systemThemeStorageValue;
        localStorage.setItem(themeStorageKey, systemThemeStorageValue);
    }
    return storedTheme;
}

function mapThemeOptionToValidThemeClassIfNeeded(theme) {
    return theme === systemThemeStorageValue
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    ? darkThemeStorageValue
    : lightThemeStorageValue
    : theme;
}

// Theme class can only be light or dark, 'system' is mapped to one of these values
function getThemeClassToActivate() {
    return mapThemeOptionToValidThemeClassIfNeeded(getStoredThemeOption());
}

function activateThemeClass(themeClassToActivate, doc = document) {
    doc.documentElement.classList.add(themeClassToActivate);
    setActiveThemeInputElementAsSelected(doc);
}

function saveThemeInStorage(theme) {
    localStorage.setItem(themeStorageKey, `${theme}`);
}

function deactivateNonActiveThemes(activatedTheme, doc = document) {
    allThemeOptions
        .filter((theme) => theme !== activatedTheme)
        .forEach((themeToDeselect) => doc.documentElement.classList.remove(themeToDeselect));
    // Deactivate all label's a11y attribute, will activate the only active label later.
    document.querySelectorAll('label.colorThemeLabel').forEach(label => {
        label.setAttribute('aria-checked', 'false');
    });
}

function setActiveThemeInputElementAsSelected(doc = document) {
    const storedTheme = getStoredThemeOption();
    const themeInput = doc.getElementById(storedTheme);
    if (themeInput) themeInput.checked = true;
    // EH: WARNING id:theme input labels
    const labelToMarkChecked = doc.getElementById(`${storedTheme}InputLabel`);
    if (labelToMarkChecked) labelToMarkChecked.setAttribute('aria-checked', 'true');
}

function configureTheme(themeOption = undefined, doc = document) {
    if (themeOption) {
        // Save theme option first so `getThemeClassToActivate()` reads the proper value from storage
        // and maps it to a theme class
        saveThemeInStorage(themeOption);
    }
    const themeClassToActivate = getThemeClassToActivate();
    activateThemeClass(themeClassToActivate, doc);
    deactivateNonActiveThemes(themeClassToActivate, doc);
    setActiveThemeInputElementAsSelected(doc);
}

// Apply theme immediately
configureTheme();

// Handle theme changes
document.addEventListener('DOMContentLoaded', () => {
    // Handle click
    function handleThemeClicked(event) {
        const selectedTheme = event.target.id;
        configureTheme(selectedTheme);
        // Announce the selection for screen readers
        document.getElementById('theme-selection-feedback').textContent = `Theme changed to ${event.target.value}`;
    }
    const themeToggleInputs = document.querySelectorAll('[name="themeToggleInput"]');
    themeToggleInputs.forEach((themeInput) => themeInput.addEventListener('change', handleThemeClicked));
    
    // Must 'check'/make active the theme input control on first page-load
    setActiveThemeInputElementAsSelected();
});