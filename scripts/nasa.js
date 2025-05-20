const NASA_API_KEY = 'PAiwuCt1wWtG3mPRcdQhaeRMyVPZg2esVAMWzlax'; // Your NASA API key

async function fetchAPOD() {
  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${PAiwuCt1wWtG3mPRcdQhaeRMyVPZg2esVAMWzlax}&_=${Date.now()}`);
    const data = await response.json();

    const apodDiv = document.getElementById('apod');
    apodDiv.innerHTML = `
      <h3>${data.title}</h3>
      <img src="${data.url}" alt="${data.title}" style="max-width: 100%; height: auto;" />
      <p>${data.explanation}</p>
    `;
  } catch (error) {
    const apodDiv = document.getElementById('apod');
    apodDiv.textContent = 'Failed to load Astronomy Picture of the Day.';
    console.error(error);
  }
}

async function fetchMarsPhotos() {
  try {
    const sol = Math.floor(Math.random() * 1000) + 1000;
    const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${NASA_API_KEY}&_=${Date.now()}`);
    const data = await response.json();

    const photosDiv = document.getElementById('mars-photos');
    photosDiv.innerHTML = '';  // Clear any existing content

    if (!data.photos || data.photos.length === 0) {
      photosDiv.textContent = 'No photos available for this sol. Try refreshing!';
      return;
    }

    data.photos.slice(0, 5).forEach(photo => {
      const container = document.createElement('div');
      container.style = 'display: inline-block; margin: 5px; text-align: center;';

      const img = document.createElement('img');
      img.src = photo.img_src;
      img.alt = `Mars photo taken by rover ${photo.rover.name}`;
      img.style = 'width: 150px; border-radius: 8px;';

      const caption = document.createElement('p');
      caption.textContent = img.alt;
      caption.style = 'font-size: 12px; max-width: 150px; margin-top: 5px;';

      container.appendChild(img);
      container.appendChild(caption);
      photosDiv.appendChild(container);
    });
  } catch (error) {
    const photosDiv = document.getElementById('mars-photos');
    photosDiv.textContent = 'Failed to load Mars photos.';
    console.error(error);
  }
}


function loadAll() {
  fetchAPOD();
  fetchMarsPhotos();
}

window.onload = () => {
  loadAll();

  // Refresh every 5 minutes (300,000 milliseconds)
  setInterval(loadAll, 5000);
};
