const NASA_API_KEY = 'PAiwuCt1wWtG3mPRcdQhaeRMyVPZg2esVAMWzlax';

let marsChartInstance = null; // to store chart instance

async function fetchAPOD() {
  const dateInput = document.getElementById('apod-date');
  const selectedDate = dateInput?.value || '';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}${selectedDate ? `&date=${selectedDate}` : ''}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);
    const dataWrapper = await response.json();
    const data = JSON.parse(dataWrapper.contents);

    const apodDiv = document.getElementById('apod');

    if (!data || !data.url) {
      apodDiv.innerHTML = '<p>Could not load APOD data.</p>';
      return;
    }

    let mediaHtml = '';
    if (data.media_type === 'image') {
      mediaHtml = `<img src="${data.url}" alt="${data.title}" />`;
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
    document.getElementById('apod').innerHTML = 'Could not load APOD data.';
    console.error('APOD Fetch Error:', error);
  }
}

const roverSolRanges = {
  curiosity: [0, 3500],
  opportunity: [0, 5111],
  spirit: [0, 2208],
  perseverance: [0, 1000],
};

async function fetchMarsPhotos() {
  try {
    const rover = document.getElementById('rover-select')?.value || 'curiosity';
    const [minSol, maxSol] = roverSolRanges[rover] || [0, 3500];
    const sol = Math.floor(Math.random() * (maxSol - minSol + 1)) + minSol;

    const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`);
    const data = await response.json();

    const photosDiv = document.getElementById('mars-photos');
    photosDiv.innerHTML = '';

    if (!data.photos || data.photos.length === 0) {
      photosDiv.textContent = 'No photos available for this sol. Try refreshing!';
      return;
    }

    const cameraCounts = {};

    const photoGrid = document.createElement('div');
    photoGrid.style.display = 'flex';
    photoGrid.style.flexWrap = 'wrap';
    photoGrid.style.justifyContent = 'center';
    photoGrid.style.gap = '15px';

    data.photos.slice(0, 5).forEach(photo => {
      const container = document.createElement('div');
      container.style = `
        width: 30%;
        min-width: 150px;
        max-width: 200px;
        text-align: center;
      `;

      const img = document.createElement('img');
      img.src = photo.img_src;
      img.alt = `Mars photo taken by rover ${photo.rover.name}`;
      img.style = 'width: 100%; border-radius: 8px;';

      const caption = document.createElement('p');
      caption.textContent = img.alt;
      caption.style = 'font-size: 12px; margin-top: 5px;';

      container.appendChild(img);
      container.appendChild(caption);
      photoGrid.appendChild(container);

      const cameraName = photo.camera.name;
      cameraCounts[cameraName] = (cameraCounts[cameraName] || 0) + 1;
    });

    photosDiv.appendChild(photoGrid);

    // Update the chart
    const ctx = document.getElementById('marsChart').getContext('2d');
    if (marsChartInstance) marsChartInstance.destroy();

    marsChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(cameraCounts),
        datasets: [{
          label: 'Camera Usage',
          data: Object.values(cameraCounts),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#AA65E2', '#62D396', '#FF9F40'
          ],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Camera Usage in Mars Rover Photos'
          }
        }
      }
    });

  } catch (error) {
    const photosDiv = document.getElementById('mars-photos');
    photosDiv.textContent = 'Failed to load Mars photos.';
    console.error('Mars Photo Fetch Error:', error);
  }
}

function loadAll() {
  fetchAPOD();
  fetchMarsPhotos();
}

window.onload = () => {
  document.getElementById('apod-date').max = new Date().toISOString().split('T')[0];
  loadAll();
  setInterval(loadAll, 10000); // refresh every 10s
};
