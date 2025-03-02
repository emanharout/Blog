import DOMPurify from 'dompurify';
import Fuse, { type FuseResult } from 'fuse.js';

// TYPES

interface SearchablePostData {
    id: string;
    title: string;
    date: Date;
    body?: string;
}

// PROPERTIES

let SEARCHABLE_DATA: SearchablePostData[] | undefined;
const SEARCH_URL_PARAM_KEY = 'query';
const searchInputElement = document.querySelector('#searchInput') as HTMLInputElement;
const spinnerIcon = document.querySelector('#loadingSpinnerIcon');
let lastSearchResult: FuseResult<SearchablePostData>[] = [];

let FUSE_INSTANCE: Fuse<SearchablePostData>;
const FUSE_OPTIONS = {
    findAllMatches: true,
    includeScore: true,
    shouldSort: true,
    threshold: 0.5,
    // Key `name`'s value must match the data we pass into `Fuse` instances (i.e. any `SearchablePostData` properties,
    // which is an abstraction on blog posts).
    keys: [
        {
            name: 'title',
            weight: 1,
        },
        {
            name: 'body',
            weight: 0.75,
        },
    ],
};

// FUNCTIONS

// On search submission, we route to `/search` and add the `query` URL parameter
function setupOnSearchSubmit_updateURLWithSearchQuery() {
    // EH: Search Path Dependency: the value for `SEARCH_URL_PATH` must match the file name in `src/pages/search.astro`
    const SEARCH_URL_PATH = 'search'
    const form = document.querySelector('#searchForm');
    
    if (form instanceof HTMLFormElement) {
        const htmlFormElement = form as HTMLFormElement;
        htmlFormElement.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(htmlFormElement);
            const presanitizedSearchTerm = formData.get('search')?.toString();
            
            if (presanitizedSearchTerm) {
                const searchTerm = DOMPurify.sanitize(presanitizedSearchTerm);
                if (!searchTerm || searchTerm.length === 0) return;
                const url = new URL(`/${SEARCH_URL_PATH}`, window.location.origin);
                url.searchParams.set(SEARCH_URL_PARAM_KEY, searchTerm);
                window.location.assign(url.toString());
            }
        });
    }
}

// On each page load (which occurs each time the user types a character in the search input),
// we grab the search query from URL parameter, update the UI and execute the search.
function setupOnLoad_updateDocWithSearchURLParam() {
    window.addEventListener('DOMContentLoaded', () => {
        const queryURLParamValue = new URLSearchParams(window.location.search).get(SEARCH_URL_PARAM_KEY) ?? '';
        const sanitizedQueryParamValue = DOMPurify.sanitize(queryURLParamValue);
        executeSearch(sanitizedQueryParamValue);
        updateUIWithSearchQuery(sanitizedQueryParamValue);
        // Set search input text to value found in URL's `query` parameter
        if (searchInputElement) {
            searchInputElement.value = sanitizedQueryParamValue;
            searchInputElement.focus();
        }
    });
}

// Sets up a callback. It is executed each time the user types a character in the search field.
function setupOnSearchInput() {
    searchInputElement.addEventListener('input', () => {
        const searchTerm = DOMPurify.sanitize(searchInputElement.value);
        updateUIWithSearchQuery(searchTerm);
        executeSearch(searchTerm);
        updatePageURLWithSearchQueryParamValue(searchTerm);
    });
}

// HELPER FUNCTIONS

// Updates UI to reflect latest query text.
function updateUIWithSearchQuery(searchQueryText: string) {
    const searchResultListComponent = document.querySelector('#searchResultListComponent');
    const searchResultsList = document.querySelector('#searchResultsList');
    const searchReadout = document.querySelector('#searchReadout');
    if (!searchResultListComponent || !searchResultsList || !searchReadout) return;
    const didEnterQuery = searchQueryText.length > 0;
    
    if (didEnterQuery === false) {
        document.title = searchQueryText = "Eman Harout - Search";
        searchResultListComponent.classList.add('hidden');
        searchResultsList.innerHTML = "";
        searchReadout.textContent = "";
        spinnerIcon?.classList.add('hidden');
    } else {
        document.title = `Eman Harout - Search results for “${searchQueryText}”`
        searchReadout.textContent = `Search results for “${searchQueryText}”`
        searchResultListComponent.classList.remove('hidden');
    }
}

// Takes user input and uses it to create a new URL for the current page. The new URL includes an updated
// value for the `query` URL parameter, derived from user's search query.
function updatePageURLWithSearchQueryParamValue(searchQueryText: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(SEARCH_URL_PARAM_KEY, searchQueryText);
    window.history.replaceState(null, '', url);
}

// Takes user's search query and executes a search.
async function executeSearch(searchQueryText: string) {
    setupSearchableDataIfNeeded();
    if (!FUSE_INSTANCE) return;
    spinnerIcon?.classList.remove('hidden');
    const searchResult = FUSE_INSTANCE.search(searchQueryText);
    processSearchResult(searchResult);
}

// Takes results and maps them to HTML elements to be displayed. Animates results in.
function processSearchResult(result: FuseResult<SearchablePostData>[]) {
    spinnerIcon?.classList.add('hidden');
    const isSameResultsAsPreviousSearch = (resultsAreEqual(result))
    lastSearchResult = result;
    
    const searchResultsList = document.querySelector('#searchResultsList');
    if (!searchResultsList) return;
    const hasSearchResult = result.length > 0
    
    if (hasSearchResult) {
        if (isSameResultsAsPreviousSearch) return;
        // Add new line items to DOM
        const resultsHTML = generateSearchList(result);
        searchResultsList.innerHTML = resultsHTML;
        
        // Animate hidden line items
        const newLiElements = searchResultsList.querySelectorAll('li');
        requestAnimationFrame(() => {
            newLiElements.forEach((li) => {
                li.classList.add('transition', 'duration-500', 'ease-in-out');
                li.classList.remove('opacity-0', 'translate-y-4');
            });
        });
    } else {
        const searchReadout = document.querySelector('#searchReadout');
        if (searchReadout) {
            searchReadout.textContent = "No results found";
        };
        searchResultsList.innerHTML = "";
    }
}

// Pass in the newest search result to see if it is identical to the previous search result.
function resultsAreEqual(newSearchResult: FuseResult<SearchablePostData>[]): boolean {
    if (lastSearchResult.length !== newSearchResult.length) return false;
    return lastSearchResult.every((item, index) => item.item.id == newSearchResult[index].item.id);
}

// Performs all the work necessary to prepare for a search.
// Ensures we've fetched the JSON to search against and sets up Fuse which is needed prior to search.
async function setupSearchableDataIfNeeded() {
    // We prevent a refetch of all posts' data if it is already stored in SEARCHABLE_DATA
    if (!SEARCHABLE_DATA) {
        SEARCHABLE_DATA = await getSearchableJSONData();
    }
    if (SEARCHABLE_DATA && !FUSE_INSTANCE) {
        FUSE_INSTANCE = new Fuse(SEARCHABLE_DATA, FUSE_OPTIONS);
    }
}

// Gets searchable data in JSON format.
async function getSearchableJSONData(): Promise<SearchablePostData[] | undefined> {
    try {
        const response = await fetch('/search.json');
        if (!response.ok) {
            const errorMessage = 'Something went wrong while executing the search query. Please try again.';
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return undefined
    }
}

// Takes the results of a search and maps it to user-displayable HTML.
function generateSearchList(results: FuseResult<SearchablePostData>[]) {
    return results
    .map((result) => {
        const { id, title, date } = result.item;
        const dateAsDate = new Date(date);
        return `<li class="mt-4 opacity-0 translate-y-4">
                    <a target="_blank" href="/blog/${id}/"
                        class="
                            text-fg-primary-link-2 font-medium hover:text-fg-primary-link-2-hover focus:text-fg-primary-link-2-hover
                        "
                    >${title}
                    </a>
                    <time datetime="${dateAsDate.toISOString()}"
                        class="text-xs text-gray-temp-400 dark:text-gray-temp-300"
                    >
                        ${dateAsDate.toLocaleDateString('en-us', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </time>
                </li>`;
    })
    .join('');
}

export { 
    type SearchablePostData,
    setupOnSearchSubmit_updateURLWithSearchQuery,
    setupOnLoad_updateDocWithSearchURLParam,
    setupOnSearchInput
};