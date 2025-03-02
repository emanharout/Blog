// src/scripts/getCurrentYear.ts

// Get current year (e.g. for use in displaying copyright year)
function getCurrentYear() {
    const yearSpan = document.getElementById("footer-copyright-year");
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear().toString();
    }
}

getCurrentYear();