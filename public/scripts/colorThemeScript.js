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
}

function setActiveThemeInputElementAsSelected(doc = document) {
    const storedTheme = getStoredThemeOption();
    const themeInput = doc.getElementById(storedTheme);
    if (themeInput) themeInput.checked = true;
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
    }
    const themeToggleInputs = document.querySelectorAll('[name="themeToggleInput"]');
    themeToggleInputs.forEach((themeInput) => themeInput.addEventListener('change', handleThemeClicked));
    
    // Must 'check'/make active the theme input control on first page-load
    setActiveThemeInputElementAsSelected();
});