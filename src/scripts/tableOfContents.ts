// Highlights table-of-contents links whose article section is currently on screen.
// `remark-sectionize` wraps each heading and its content in a <section>, so we observe those sections and toggle
// `data-active` on every ToC link (sidebar and inline) that points at the section's heading.
const articleSections = document.querySelectorAll<HTMLElement>('.article-content section');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const id = entry.target.querySelector('h2, h3')?.getAttribute('id');
        if (!id) return;

        const links = document.querySelectorAll<HTMLAnchorElement>(
            `.table-of-content-link[href="#${CSS.escape(id)}"]`,
        );
        links.forEach((link) => link.toggleAttribute('data-active', entry.isIntersecting));
    });
});

articleSections.forEach((section) => observer.observe(section));
