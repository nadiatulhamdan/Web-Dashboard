async function searchBooks() {
  const query = document.getElementById('searchTerm').value.trim();
  const container = document.getElementById('books-container');
  if (!query) {
    container.textContent = 'Please enter a search term.';
    return;
  }

  container.textContent = 'Loading...';

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      container.textContent = 'No books found.';
      return;
    }

    container.innerHTML = '';

    data.items.forEach(item => {
      const book = item.volumeInfo;
      const div = document.createElement('div');
      div.classList.add('book-item');
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Author(s):</strong> ${book.authors ? book.authors.join(', ') : 'Unknown'}</p>
        <img src="${book.imageLinks ? book.imageLinks.thumbnail : ''}" alt="Book cover" />
        <p>${book.description ? book.description.substring(0, 200) + '...' : 'No description available.'}</p>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    container.textContent = 'Error fetching books.';
    console.error(error);
  }
}
