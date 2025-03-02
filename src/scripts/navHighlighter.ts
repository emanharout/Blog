// Gets current link and checks its path.
// Based on the path, we match against the corresponding li and add an underline to indicate it is active.
function handleNavigatedToNewPage() {
    let currentPage = window.location.pathname;

    switch (true) {
        case (currentPage === '/'):
            const homeLineItemElement = document.querySelector('#nav-home-item');
            if (homeLineItemElement) {
                _updateActiveNavItem(homeLineItemElement);
            }
            break;
        case currentPage.includes('/blog'): { // Check if '/blog' is contained within currentPage
            const blogLineItemElement = document.querySelector('#nav-blog-item');
            if (blogLineItemElement) {
                _updateActiveNavItem(blogLineItemElement);
            }
            break;
        }
        case (currentPage.indexOf('/about') === 0):
            const aboutLineItemElement = document.querySelector('#nav-about-item');
            if (aboutLineItemElement) {
                _updateActiveNavItem(aboutLineItemElement);
            }
            break;
        case currentPage.includes('/search'): {
            const searchLineItemElement = document.querySelector('#nav-search-item');
            if (searchLineItemElement) {
                _updateActiveNavItem(searchLineItemElement);
            }
            break;
        }
    }
}

// Sets active nav `li` element to immediately have underline (no animation after navigating, instantly applies underline)
// Parameter: The Navigation `li` element to set as active.
function _updateActiveNavItem(navItem: Element) {
    navItem.classList.add('before:w-1/2', 'after:w-1/2', 'before:transition-none', 'after:transition-none');
}

handleNavigatedToNewPage();
