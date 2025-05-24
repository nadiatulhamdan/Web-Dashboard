let genreChartInstance = null;

async function searchBooks() {
  const query = document.getElementById('searchTerm').value.trim();
  const container = document.getElementById('books-container');
  const chartSection = document.getElementById('chart-section');

  if (!query) {
    container.innerHTML = '<p>Please enter a search term.</p>';
    if (genreChartInstance) genreChartInstance.destroy();
    chartSection.style.display = 'none';
    return;
  }

  container.innerHTML = '<p>Loading...</p>';
  chartSection.style.display = 'none';

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<p>No books found.</p>';
      if (genreChartInstance) genreChartInstance.destroy();
      chartSection.style.display = 'none';
      return;
    }

    const bookListDiv = document.createElement('div');
    bookListDiv.classList.add('book-list');
    
    const categoriesCount = {};

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
      bookListDiv.appendChild(div);
      
      if (book.categories && Array.isArray(book.categories)) {
        book.categories.forEach(category => {
          const mainCategory = category.split(' / ')[0].trim();
          if (mainCategory) {
            categoriesCount[mainCategory] = (categoriesCount[mainCategory] || 0) + 1;
          }
        });
      }
    });

    container.innerHTML = '';
    container.appendChild(bookListDiv);

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
