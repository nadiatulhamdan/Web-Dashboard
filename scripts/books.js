let genreChartInstance = null;
let currentSearchQuery = ''; // To store the last successful search query
let startIndex = 0; // To keep track of the starting index for pagination
const maxResultsPerRequest = 10; // Number of books to fetch per API call

// NEW FUNCTION: Handles keyword selection from the dropdown
function useSelectedKeyword() {
    const keywordSelect = document.getElementById('keywordSelect');
    const searchTermInput = document.getElementById('searchTerm');

    if (keywordSelect.value !== "") {
        searchTermInput.value = keywordSelect.value;
        // Optionally, uncomment the line below if you want the search to trigger immediately
        // searchBooks();
    }
}

async function searchBooks(loadMore = false) {
    const query = document.getElementById('searchTerm').value.trim();
    const container = document.getElementById('books-container');
    const chartSection = document.getElementById('chart-section');

    // Reset the dropdown after a search
    const keywordSelect = document.getElementById('keywordSelect');
    if (keywordSelect) {
        keywordSelect.value = "";
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
        // IMPORTANT FIX 1: Explicitly show the chart section BEFORE trying to draw the chart
        // This ensures it's visible for the first attempt at chart drawing
        chartSection.style.display = 'block'; 
    } else {
        if (!currentSearchQuery) return;
        const loadMoreButton = document.getElementById('loadMoreBtn');
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Loading more...';
            loadMoreButton.disabled = true;
        }
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentSearchQuery)}&maxResults=${maxResultsPerRequest}&startIndex=${startIndex}`
        );
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            if (!loadMore) {
                container.innerHTML = '<p>No books found.</p>';
            } else {
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

        if (!loadMore) {
            container.innerHTML = '';
            const bookListDiv = document.createElement('div');
            bookListDiv.classList.add('book-list');
            container.appendChild(bookListDiv);
        }

        const bookListDiv = container.querySelector('.book-list') || document.createElement('div');
        if (!container.querySelector('.book-list')) {
            bookListDiv.classList.add('book-list');
            container.appendChild(bookListDiv);
        }

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

        if (data.items.length === maxResultsPerRequest) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'loadMoreBtn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.onclick = () => searchBooks(true);
            loadMoreBtn.style.marginTop = '20px';
            loadMoreBtn.style.marginBottom = '20px';
            loadMoreBtn.style.width = 'fit-content';
            loadMoreBtn.style.marginLeft = 'auto';
            loadMoreBtn.style.marginRight = 'auto';
            loadMoreBtn.style.display = 'block';
            container.appendChild(loadMoreBtn);
            startIndex += maxResultsPerRequest;
        } else if (loadMore) {
            const noMoreMsg = document.createElement('p');
            noMoreMsg.textContent = 'No more books found.';
            noMoreMsg.style.textAlign = 'center';
            noMoreMsg.style.marginTop = '10px';
            container.appendChild(noMoreMsg);
        }

        const genreLabels = Object.keys(categoriesCount);
        const genreData = Object.values(categoriesCount);

        // IMPORTANT FIX 2: Only hide chart if no categories are found AFTER processing all books
        if (genreLabels.length === 0) {
            chartSection.style.display = 'none';
            if (genreChartInstance) genreChartInstance.destroy();
            return;
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

        // Removed the redundant chartSection.style.display = 'block'; from here
        // as it's now handled at the beginning of the new search process.

    } catch (error) {
        container.innerHTML = '<p>Error fetching books.</p>';
        console.error(error);
        if (genreChartInstance) genreChartInstance.destroy();
        chartSection.style.display = 'none'; // Ensure hidden on error
    } finally {
        const loadMoreButton = document.getElementById('loadMoreBtn');
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Load More';
            loadMoreButton.disabled = false;
        }
    }
}
