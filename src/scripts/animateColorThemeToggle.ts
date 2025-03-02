function addAnimationClassToAllThemeInputs() {
    const lightInputLabel = document.getElementById(`${lightThemeStorageValue}InputLabel`);
    const darkInputLabel = document.getElementById(`${darkThemeStorageValue}InputLabel`);
    const systemInputLabel = document.getElementById(`${systemThemeStorageValue}InputLabel`);
    if (lightInputLabel) {
        lightInputLabel.classList.add('transition', 'duration-200', 'ease-in-out');
    }
    if (darkInputLabel) {
        darkInputLabel.classList.add('transition', 'duration-200', 'ease-in-out');
    }
    if (systemInputLabel) {
        systemInputLabel.classList.add('transition', 'duration-200', 'ease-in-out');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    addAnimationClassToAllThemeInputs();
});