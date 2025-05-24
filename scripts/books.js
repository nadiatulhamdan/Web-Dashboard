let genreChartInstance = null;
let currentSearchQuery = ''; // To store the last successful search query
let startIndex = 0; // To keep track of the starting index for pagination
const maxResultsPerRequest = 10; // Number of books to fetch per API call

async function searchBooks(loadMore = false) { // Added a 'loadMore' parameter
  const query = document.getElementById('searchTerm').value.trim();
  const container = document.getElementById('books-container');
  const chartSection = document.getElementById('chart-section');

  if (!loadMore) { // If it's a new search, reset everything
    currentSearchQuery = query;
    startIndex = 0;
    if (!query) {
      container.innerHTML = '<p>Please enter a search term.</p>';
      if (genreChartInstance) genreChartInstance.destroy();
      chartSection.style.display = 'none';
      return;
    }
    container.innerHTML = '<p>Loading...</p>';
    chartSection.style.display = 'none';
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
      chartSection.style.display = 'none';
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

    chartSection.style.display = 'block';

  } catch (error) {
    container.innerHTML = '<p>Error fetching books.</p>';
    console.error(error);
    if (genreChartInstance) genreChartInstance.destroy();
    chartSection.style.display = 'none';
  }
}
