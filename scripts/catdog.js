async function getCat() {
  const imageRes = await fetch('https://api.thecatapi.com/v1/images/search');
  const imageData = await imageRes.json();
  document.getElementById('catImage').src = imageData[0].url;

  const factRes = await fetch('https://catfact.ninja/fact');
  const factData = await factRes.json();
  document.getElementById('catFact').innerText = factData.fact;
}

async function getDog() {
  const imageRes = await fetch('https://dog.ceo/api/breeds/image/random');
  const imageData = await imageRes.json();
  document.getElementById('dogImage').src = imageData.message;

  const factRes = await fetch('https://dog-api.kinduff.com/api/facts');
  const factData = await factRes.json();
  document.getElementById('dogFact').innerText = factData.facts[0];
}

getCat();
getDog();
