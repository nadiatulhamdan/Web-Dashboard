async function getQuote() {
  const res = await fetch('https://api.quotable.io/random');
  const data = await res.json();

  document.getElementById('quoteText').innerText = `"${data.content}"`;
  document.getElementById('quoteAuthor').innerText = `— ${data.author}`;
}

getQuote();
