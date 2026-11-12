import type { Page } from 'astro';

// Decides which pagination controls to show for a given page.
// First/last buttons only appear when they'd skip at least one page beyond prev/next.
class PaginationRepository<T> {
    showPagination: boolean;
    currentPageNum: number;

    showFirstPage: boolean;
    firstPageUrl: string | undefined;
    showPreviousPage: boolean;
    prevUrl: string | undefined;

    showNextPage: boolean;
    nextUrl: string | undefined;
    showLastPage: boolean;
    lastPageUrl: string | undefined;

    constructor(page: Page<T>) {
        const pagesBefore = page.currentPage - 1;
        const pagesAfter = page.lastPage - page.currentPage;

        this.showPagination = page.lastPage > 1;
        this.currentPageNum = page.currentPage;

        this.showFirstPage = pagesBefore >= 2;
        this.firstPageUrl = page.url.first;
        this.showPreviousPage = pagesBefore >= 1;
        this.prevUrl = page.url.prev;

        this.showNextPage = pagesAfter >= 1;
        this.nextUrl = page.url.next;
        this.showLastPage = pagesAfter >= 2;
        this.lastPageUrl = page.url.last;
    }
}

export { PaginationRepository };
