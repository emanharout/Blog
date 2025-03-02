import type { Page } from 'astro';

class PaginationRepository<T> {
    private page: Page<T>;

    // Pagination properties
    showPagination: boolean = true;

    currentPageNum: number
    currentPageIsLeftmost: boolean = false;
    currentPageIsRightmost: boolean = false;

    showFirstPage: boolean = false;
    firstPageUrl: string | undefined;
    showPreviousPage: boolean = false;
    prevPageIsLeftmost: boolean = false;
    prevUrl: string | undefined;

    showNextPage: boolean = false;
    nextPageIsRightmost: boolean = false;
    nextUrl: string | undefined;
    showLastPage: boolean = false;
    lastPageUrl: string | undefined;

    constructor(page: Page<T>) {
        this.page = page;
        this.currentPageNum = page.currentPage;
        this.firstPageUrl = page.url.first;
        this.prevUrl = page.url.prev
        this.nextUrl = page.url.next
        this.lastPageUrl = page.url.last

        this.updatePaginationProperties();
    }

    private updatePaginationProperties(): void {
        if (this.page.lastPage === 1) {
            this.showPagination = false;
        } else if (this.page.currentPage >= 3) {
            this.showFirstPage = true;
            this.showPreviousPage = true;
        } else if (this.page.currentPage === 2) {
            this.showPreviousPage = true;
            this.prevPageIsLeftmost = true;
        } else if (this.page.currentPage === 1) {
            this.currentPageIsLeftmost = true;
        }

        const numberOfNextPages = this.page.lastPage - this.page.currentPage;

        if (numberOfNextPages >= 2) {
            this.showNextPage = true;
            this.showLastPage = true;
        } else if (numberOfNextPages === 1) {
            this.showNextPage = true;
            this.nextPageIsRightmost = true;
        } else if (numberOfNextPages === 0) {
            this.currentPageIsRightmost = true;
        }
    }
}

export { 
    PaginationRepository
};