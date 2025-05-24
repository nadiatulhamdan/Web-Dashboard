let genreChartInstance = null; // Declare a variable to hold the Chart.js instance

async function searchBooks() {
  const query = document.getElementById('searchTerm').value.trim();
  const container = document.getElementById('books-container');
  const chartSection = document.getElementById('chart-section'); // Get the chart section element

  if (!query) {
    container.textContent = 'Please enter a search term.';
    // Destroy and hide chart if search term is empty
    if (genreChartInstance) genreChartInstance.destroy();
    chartSection.style.display = 'none';
    return;
  }

  container.textContent = 'Loading...';
  chartSection.style.display = 'none'; // Hide chart while loading

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`); // Increased maxResults for more data
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      container.textContent = 'No books found.';
      // Destroy and hide chart if no books are found
      if (genreChartInstance) genreChartInstance.destroy();
      chartSection.style.display = 'none';
      return;
    }

    container.innerHTML = '';
    const categoriesCount = {}; // Object to store genre counts

    data.items.forEach(item => {
      const book = item.volumeInfo;
      const div = document.createElement('div');
      div.classList.add('book-item');
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Author(s):</strong> ${book.authors ? book.authors.join(', ') : 'Unknown'}</p>
        <img src="${book.imageLinks ? book.imageLinks.thumbnail : 'https://via.placeholder.com/128x190?text=No+Cover'}" alt="Book cover" />
        <p>${book.description ? book.description.substring(0, 200) + '...' : 'No description available.'}</p>
      `;
      container.appendChild(div);

      // --- Collect categories for the chart ---
      if (book.categories && Array.isArray(book.categories)) {
        book.categories.forEach(category => {
          const mainCategory = category.split(' / ')[0].trim(); // Take only the first part if it has subcategories
          if (mainCategory) {
            categoriesCount[mainCategory] = (categoriesCount[mainCategory] || 0) + 1;
          }
        });
      }
    });

    // --- Prepare data for the chart ---
    const genreLabels = Object.keys(categoriesCount);
    const genreData = Object.values(categoriesCount);

    if (genreLabels.length === 0) {
      chartSection.style.display = 'none'; // Hide chart if no genre data
      if (genreChartInstance) genreChartInstance.destroy();
      return;
    }

    // --- Render the Chart ---
    const ctx = document.getElementById('genreChart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (genreChartInstance) {
      genreChartInstance.destroy();
    }

    genreChartInstance = new Chart(ctx, {
      type: 'pie', // Pie chart for genre distribution
      data: {
        labels: genreLabels,
        datasets: [{
          label: 'Number of Books',
          data: genreData,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#AA65E2', '#62D396', '#FF9F40', '#4BC0C0', '#9966FF',
            '#FF6384', '#36A2EB', '#FFCE56', '#AA65E2', '#62D396', '#FF9F40', '#4BC0C0', '#9966FF' // More colors for more genres
          ],
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to respect the container's height
        plugins: {
          title: {
            display: true,
            text: 'Genre Distribution',
            color: '#333' // Chart title color
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#333' // Legend labels color
            }
          }
        },
        aspectRatio: 1 // Keep this for pie charts to ensure it's round
      }
    });

    chartSection.style.display = 'block'; // Show the chart section after it's rendered

  } catch (error) {
    container.textContent = 'Error fetching books.';
    console.error(error);
    // Ensure chart is destroyed and hidden on error
    if (genreChartInstance) genreChartInstance.destroy();
    chartSection.style.display = 'none';
  }
}
