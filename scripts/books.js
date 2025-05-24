let genreChartInstance = null;
let currentSearchQuery = ''; // To store the last successful search query
let startIndex = 0; // To keep track of the starting index for pagination
const maxResultsPerRequest = 10; // Number of books to fetch per API call

// NEW FUNCTION: Handles keyword selection from the dropdown
function useSelectedKeyword() {
    const keywordSelect = document.getElementById('keywordSelect');
    const searchTermInput = document.getElementById('searchTerm');

    // If a keyword is selected (i.e., not the empty "Or select a keyword..." option)
    if (keywordSelect.value !== "") {
        searchTermInput.value = keywordSelect.value; // Put the selected keyword into the text input
        // You can optionally call searchBooks() here directly if you want the search to trigger automatically
        // as soon as a keyword is selected, instead of requiring a separate click on the search button.
        // If you uncomment the line below, make sure the user understands this behavior.
        // searchBooks();
    }
}


async function searchBooks(loadMore = false) { // Added a 'loadMore' parameter
    // IMPORTANT: Get the query from the text input first, as it might have been set by the dropdown
    const query = document.getElementById('searchTerm').value.trim();
    const container = document.getElementById('books-container');
    const chartSection = document.getElementById('chart-section');

    // NEW: Reset the dropdown after a search to ensure it goes back to "Or select a keyword..."
    // This provides clearer UX: after a search, the dropdown is ready for a new selection.
    const keywordSelect = document.getElementById('keywordSelect');
    if (keywordSelect) { // Check if the element exists to prevent errors
        keywordSelect.value = ""; // Set it back to the default empty option
    }


    if (!loadMore) { // If it's a new search, reset everything
        currentSearchQuery = query;
        startIndex = 0;
        if (!query) {
            container.innerHTML = '<p>Please enter a search term.</p>';
            if (genreChartInstance) genreChartInstance.destroy();
            chartSection.style.display = 'none'; // Keep hidden if no query
            return;
        }
        container.innerHTML = '<p>Loading...</p>';
    } else {
        // If loading more, ensure there's a query and display loading message
        if (!currentSearchQuery) return; // Should not happen if Load More button is correctly displayed
        const loadMoreButton = document.getElementById('loadMoreBtn');
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Loading more...';
            loadMoreButton.disabled = true; // Disable button while loading
        }
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentSearchQuery)}&maxResults=${maxResultsPerRequest}&startIndex=${startIndex}`
        );
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            if (!loadMore) { // Only show "No books found" if it's the very first search
                container.innerHTML = '<p>No books found.</p>';
            } else {
                // If no more items on 'load more', remove the button and display a message
                const loadMoreButton = document.getElementById('loadMoreBtn');
                if (loadMoreButton) {
                    loadMoreButton.remove();
                }
                const noMoreMsg = document.createElement('p');
                noMoreMsg.textContent = 'No more books found.';
                noMoreMsg.style.textAlign = 'center';
                noMoreMsg.style.marginTop = '10px';
                container.appendChild(noMoreMsg);
            }
            if (genreChartInstance) genreChartInstance.destroy();
            chartSection.style.display = 'none'; // Hide chart if no books found at all
            return;
        }

        if (!loadMore) { // Clear container only for new searches
            container.innerHTML = '';
            const bookListDiv = document.createElement('div');
            bookListDiv.classList.add('book-list');
            container.appendChild(bookListDiv); // Append book-list div for new searches
        }

        const bookListDiv = container.querySelector('.book-list') || document.createElement('div');
        if (!container.querySelector('.book-list')) { // Ensure book-list is appended if it doesn't exist
            bookListDiv.classList.add('book-list');
            container.appendChild(bookListDiv);
        }

        // Remove previous "Load More" button if it exists before adding new books
        const existingLoadMoreButton = document.getElementById('loadMoreBtn');
        if (existingLoadMoreButton) {
            existingLoadMoreButton.remove();
        }

        const categoriesCount = {};

        data.items.forEach(item => {
            const book = item.volumeInfo;
            const infoLink = item.volumeInfo.infoLink;

            const div = document.createElement('div');
            div.classList.add('book-item');
            div.dataset.infoLink = infoLink;

            const fullDescription = book.description || 'No description available.';
            const truncatedDescription = fullDescription.length > 200 ? fullDescription.substring(0, 200) + '...' : fullDescription;

            div.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author(s):</strong> ${book.authors ? book.authors.join(', ') : 'Unknown'}</p>
                <img src="${book.imageLinks ? book.imageLinks.thumbnail : 'https://via.placeholder.com/128x190?text=No+Cover'}" alt="Book cover" />
                <p class="book-description">${truncatedDescription}</p>
            `;
            bookListDiv.appendChild(div);

            div.addEventListener('click', () => {
                if (div.dataset.infoLink) {
                    window.open(div.dataset.infoLink, '_blank');
                }
            });

            if (book.categories && Array.isArray(book.categories)) {
                book.categories.forEach(category => {
                    const mainCategory = category.split(' / ')[0].trim();
                    if (mainCategory) {
                        categoriesCount[mainCategory] = (categoriesCount[mainCategory] || 0) + 1;
                    }
                });
            }
        });

        // Append "Load More" button if there are potentially more results
        // We assume there are more results if we got maxResultsPerRequest items
        if (data.items.length === maxResultsPerRequest) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'loadMoreBtn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.onclick = () => searchBooks(true); // Call searchBooks with loadMore = true
            loadMoreBtn.style.marginTop = '20px';
            loadMoreBtn.style.marginBottom = '20px';
            loadMoreBtn.style.width = 'fit-content';
            loadMoreBtn.style.marginLeft = 'auto';
            loadMoreBtn.style.marginRight = 'auto';
            loadMoreBtn.style.display = 'block'; // Make it a block element to center with auto margins
            container.appendChild(loadMoreBtn);
            startIndex += maxResultsPerRequest; // Increment startIndex for the next load
        } else if (loadMore) {
            // If it was a 'load more' request and fewer than maxResultsPerRequest items were returned,
            // it means we've reached the end, so remove the button and add a "no more books" message
            const noMoreMsg = document.createElement('p');
            noMoreMsg.textContent = 'No more books found.';
            noMoreMsg.style.textAlign = 'center';
            noMoreMsg.style.marginTop = '10px';
            container.appendChild(noMoreMsg);
        }


        const genreLabels = Object.keys(categoriesCount);
        const genreData = Object.values(categoriesCount);

        // This is the key change: ensure the chart is only hidden if NO categories are found
        if (genreLabels.length === 0) {
            chartSection.style.display = 'none'; // Hide if no data for chart
            if (genreChartInstance) genreChartInstance.destroy();
            return; // Exit here as no chart can be drawn
        }

        const ctx = document.getElementById('genreChart').getContext('2d');
        if (genreChartInstance) {
            genreChartInstance.destroy();
        }

        genreChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: genreLabels,
                datasets: [{
                    label: 'Number of Books',
                    data: genreData,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#AA65E2', '#62D396', '#FF9F40', '#4BC0C0', '#9966FF',
                        '#FF6384', '#36A2EB', '#FFCE56', '#AA65E2', '#62D396', '#FF9F40', '#4BC0C0', '#9966FF'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Genre Distribution',
                        color: '#333'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333'
                        }
                    }
                },
                aspectRatio: 1
            }
        });

        // This line is now crucial for the initial search to display the chart
        chartSection.style.display = 'block';

    } catch (error) {
        container.innerHTML = '<p>Error fetching books.</p>';
        console.error(error);
        if (genreChartInstance) genreChartInstance.destroy();
        chartSection.style.display = 'none'; // Hide chart on error
    } finally {
        // Re-enable load more button if it was disabled
        const loadMoreButton = document.getElementById('loadMoreBtn');
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Load More';
            loadMoreButton.disabled = false;
        }
    }
}
