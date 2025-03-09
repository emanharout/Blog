document.addEventListener('DOMContentLoaded', () => {
    const blogDropdownNavButton = document.getElementById('blog-dropdown-nav-button') as HTMLButtonElement;
    const blogsDropdownMenu = document.getElementById('blogs-dropdown-menu') as HTMLElement;
    const dropdownArrowIcon = document.getElementById('navbar-dropdown-menu-arrow-icon') as HTMLElement;
    let isDropdownMenuOpen = false;

    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const isNavBlogButtonClick = blogDropdownNavButton.contains(target);
        const isDropdownMenuClick = blogsDropdownMenu.contains(target);

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
        blogsDropdownMenu.classList.remove('hidden');
        dropdownArrowIcon.classList.add('rotate-180');
        isDropdownMenuOpen = true;
        blogDropdownNavButton.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
        blogsDropdownMenu.classList.add('hidden');
        dropdownArrowIcon.classList.remove('rotate-180');
        isDropdownMenuOpen = false;
        blogDropdownNavButton.setAttribute("aria-expanded", "false");
    }
});