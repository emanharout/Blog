document.addEventListener('DOMContentLoaded', () => {
    const blogDropdownNavButton = document.getElementById('blog-dropdown-nav-button');
    const blogsDropdownMenu = document.getElementById('blogs-dropdown-menu');
    const dropdownArrowIcon = document.getElementById('navbar-dropdown-menu-arrow-icon');
    if (!(blogDropdownNavButton instanceof HTMLButtonElement)) return;
    if (!(blogsDropdownMenu instanceof HTMLElement)) return;
    if (!(dropdownArrowIcon instanceof Element)) return;
    const blogDropdownNavButtonElement = blogDropdownNavButton;
    const blogsDropdownMenuElement = blogsDropdownMenu;
    const dropdownArrowIconElement = dropdownArrowIcon;
    let isDropdownMenuOpen = false;

    document.addEventListener('click', (event) => {
        const target = event.target as Node | null;
        const isNavBlogButtonClick = blogDropdownNavButtonElement.contains(target);
        const isDropdownMenuClick = blogsDropdownMenuElement.contains(target);

        if (isNavBlogButtonClick) {
            if (isDropdownMenuOpen) {
                // Navigate to `/blog` and close dropdown.
                // Occurs when dropdown button is tapped twice consecutively.

                // EH: Blog Nav Route Dependency - Depends on file /blog/[...blog_type]/[...page]
                // When [...blog_type] param is undefined, and page isn't specified, 
                // it defaults to first page, which is mysite.com/blog
                window.location.href = '/blog';
                closeDropdown();
            } else {
                // Open dropdown
                openDropdown();
            }
        } else if (!isDropdownMenuClick) {
            // Close dropdown if the click was outside the menu and button
            closeDropdown();
        }
    });

    function openDropdown() {
        blogsDropdownMenuElement.classList.remove('hidden');
        dropdownArrowIconElement.classList.add('rotate-180');
        isDropdownMenuOpen = true;
        blogDropdownNavButtonElement.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
        blogsDropdownMenuElement.classList.add('hidden');
        dropdownArrowIconElement.classList.remove('rotate-180');
        isDropdownMenuOpen = false;
        blogDropdownNavButtonElement.setAttribute("aria-expanded", "false");
    }
});
