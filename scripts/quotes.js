async function getQuote() {
  const res = await fetch('https://zenquotes.io/api/random');
  const data = await res.json();

  document.getElementById('quoteText').innerText = `"${data.content}"`;
  document.getElementById('quoteAuthor').innerText = `— ${data.author}`;
}

getQuote();
