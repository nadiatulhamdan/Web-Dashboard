const NASA_API_KEY = 'PAiwuCt1wWtG3mPRcdQhaeRMyVPZg2esVAMWzlax'; // Replace with your NASA API key if you have one

async function fetchAPOD() {
  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);
    const data = await response.json();

    const apodDiv = document.getElementById('apod');
    apodDiv.innerHTML = `
      <h3>${data.title}</h3>
      <img src="${data.url}" alt="${data.title}" style="max-width: 100%; height: auto;" />
      <p>${data.explanation}</p>
    `;
  } catch (error) {
    document.getElementById('apod').textContent = 'Failed to load Astronomy Picture of the Day.';
    console.error(error);
  }
}

async function fetchMarsPhotos() {
  try {
    const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${NASA_API_KEY}`);
    const data = await response.json();

    const photosDiv = document.getElementById('mars-photos');
    photosDiv.innerHTML = '';

    data.photos.slice(0, 5).forEach(photo => {
      const img = document.createElement('img');
      img.src = photo.img_src;
      img.alt = `Mars photo taken by rover ${photo.rover.name}`;
      img.style = 'width: 150px; margin: 5px;';
      photosDiv.appendChild(img);
    });
  } catch (error) {
    document.getElementById('mars-photos').textContent = 'Failed to load Mars photos.';
    console.error(error);
  }
}

window.onload = () => {
  fetchAPOD();
  fetchMarsPhotos();
};
