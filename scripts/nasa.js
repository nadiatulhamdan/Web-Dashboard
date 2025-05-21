const NASA_API_KEY = 'PAiwuCt1wWtG3mPRcdQhaeRMyVPZg2esVAMWzlax';

async function fetchAPOD() {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const apodURL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${today}`;
    const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(apodURL)}`;

    const response = await fetch(proxyURL);
    const dataWrapper = await response.json();
    const data = JSON.parse(dataWrapper.contents);

    const apodDiv = document.getElementById('apod');

    if (!data || !data.url) {
      apodDiv.innerHTML = '<p>Could not load APOD data.</p>';
      return;
    }

    let mediaHtml = '';
    if (data.media_type === 'image') {
      mediaHtml = `<img src="${data.url}" alt="${data.title}" style="max-width: 100%; height: auto;" />`;
    } else if (data.media_type === 'video') {
      mediaHtml = `<iframe src="${data.url}" frameborder="0" allowfullscreen style="width:100%; height:400px;"></iframe>`;
    } else {
      mediaHtml = '<p>Media not available</p>';
    }

    apodDiv.innerHTML = `
      <h3>${data.title}</h3>
      ${mediaHtml}
      <p>${data.explanation}</p>
    `;
  } catch (error) {
    document.getElementById('apod').textContent = 'Failed to load Astronomy Picture of the Day.';
    console.error(error);
  }
}

async function fetchMarsPhotos() {
  try {
    const sol = Math.floor(Math.random() * 1000) + 1000;
    const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${NASA_API_KEY}`);
    const data = await response.json();

    const photosDiv = document.getElementById('mars-photos');
    photosDiv.innerHTML = ''; // Clear previous

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
    document.getElementById('mars-photos').textContent = 'Failed to load Mars photos.';
    console.error(error);
  }
}

function loadAll() {
  fetchAPOD();
  fetchMarsPhotos();
}

window.onload = () => {
  loadAll();

  // Refresh every 10 seconds (change to 300000 for 5 mins)
  setInterval(loadAll, 10000);
};
