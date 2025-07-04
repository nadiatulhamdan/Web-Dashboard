const NASA_API_KEY = 'PAiwuCt1wWtG3mPRcdQhaeRMyVPZg2esVAMWzlax';

let marsChartInstance = null;

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
      apodDiv.innerHTML = '<p>Could not load APOD data. Please try a different date or refresh.</p>';
      return;
    }

    let mediaHtml = '';
    if (data.media_type === 'image') {
      mediaHtml = `<img src="${data.url}" alt="${data.title}" class="img-fluid" />`;
    } else if (data.media_type === 'video') {
      mediaHtml = `<iframe src="${data.url}" frameborder="0" allowfullscreen class="w-100" style="height:400px;"></iframe>`;
    } else {
      mediaHtml = '<p>Media not available for this date.</p>';
    }

    apodDiv.innerHTML = `
    <h4 class="apod-dynamic-title mt-3">${data.title}</h4>
    ${mediaHtml}
    <p class="mt-3">${data.explanation}</p>
  `;
  } catch (error) {
    document.getElementById('apod').innerHTML = '<p>Error loading APOD data. Please check your network connection or API key.</p>';
    console.error('APOD Fetch Error:', error);
  }
}

const roverSolRanges = {
  curiosity: [0, 3500],
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
      photosDiv.textContent = `No photos available for ${rover} on sol ${sol}. Try refreshing or selecting a different rover!`;
      if (marsChartInstance) marsChartInstance.destroy();
      return;
    }

    const cameraCounts = {};

    const firstPhotoCameraName = data.photos[0].camera.full_name || data.photos[0].camera.name;
    const photosTitle = document.createElement('h4');
    photosTitle.textContent = `Photos from: ${firstPhotoCameraName}`;
    photosTitle.className = 'mt-3 mars-dynamic-title';
    photosDiv.appendChild(photosTitle);

    const imageWrapper = document.createElement('div');
    imageWrapper.id = 'mars-images-wrapper';
    photosDiv.appendChild(imageWrapper);

    data.photos.slice(0, 4).forEach(photo => {
      const container = document.createElement('div');
      const img = document.createElement('img');
      img.src = photo.img_src;
      img.alt = `Mars photo taken by rover ${photo.rover.name}`;

      container.appendChild(img);
      imageWrapper.appendChild(container);

      const cameraName = photo.camera.name;
      cameraCounts[cameraName] = (cameraCounts[cameraName] || 0) + 1;
    });

    const ctx = document.getElementById('marsChart').getContext('2d');

    ctx.canvas.height = 300; // Set the internal rendering height to 300 pixels
    ctx.canvas.width = ctx.canvas.offsetWidth; // Set width to current rendered width

    if (marsChartInstance) {
      marsChartInstance.destroy();
    }

    marsChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(cameraCounts),
        datasets: [{
          label: 'Number of Photos',
          data: Object.values(cameraCounts),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#AA65E2', '#62D396', '#FF9F40', '#4BC0C0', '#9966FF'
          ],
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Keep this false to allow independent height/width control
        plugins: {
          title: {
            display: true,
            text: 'Camera Usage in Mars Rover Photos',
            color: '#333'
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#333'
            }
          }
        },
        aspectRatio: 1 // For a pie chart, a 1:1 aspect ratio is usually desired
      }
    });

    ctx.canvas.style.height = '300px';
    ctx.canvas.style.width = '100%';

  } catch (error) {
    const photosDiv = document.getElementById('mars-photos');
    photosDiv.textContent = 'Failed to load Mars photos. Please check your network connection or API key.';
    console.error('Mars Photo Fetch Error:', error);
    if (marsChartInstance) marsChartInstance.destroy();
  }
}

function loadAll() {
  fetchAPOD();
  fetchMarsPhotos();
}

window.onload = () => {
  document.getElementById('apod-date').max = new Date().toISOString().split('T')[0];
  loadAll();
};
