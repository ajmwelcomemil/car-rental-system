const APIF = 'https://ajmcars-vohf.onrender.com/api/vehicles';
const grid = document.getElementById('vehiclesGrid');
const loadAllBtn = document.getElementById('loadAllBtn');

// 1. Load & render all vehicles
async function loadVehicles() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Not Logged In',
      text: 'Please log in to view vehicles.',
      confirmButtonColor: '#ff6b6b'
    });
    grid.innerHTML = `<p class="error">You must be logged in to view vehicles.</p>`;
    return;
  }

  try {
    console.log('Fetching vehicles with token:', token);

    const res = await fetch(APIF, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(`Server Error (${res.status}): ${errMsg}`);
    }

    const list = await res.json();
    renderVehicles(list);

  } catch (error) {
    console.error('Error while loading vehicles:', error);
    grid.innerHTML = `<p class="error">Unable to load vehicles. Please try again later.</p>`;
    Swal.fire({
      icon: 'error',
      title: 'Failed to Load',
      text: `Error: ${error.message}`,
      confirmButtonColor: '#ff6b6b'
    });
  }
}

// 2. Render vehicles
function renderVehicles(vehicles) {
  grid.innerHTML = '';
  if (vehicles.length === 0) {
    grid.innerHTML = `<p>No vehicles found matching the selected filters.</p>`;
  } else {
    vehicles.forEach(v => grid.appendChild(createCard(v)));
  }
}

// 3. Create a vehicle card
function createCard(v) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.type = v.type;
  card.dataset.fuel = v.fuelType;
  card.dataset.available = v.availability;

  card.innerHTML = `
    <img src="https://ajmcars-vohf.onrender.com/uploads/${v.images[0] || 'placeholder.jpg'}" alt="${v.name}">
    <div class="card-content">
      <h3>${v.brand} ${v.name}</h3>
      <p><strong>Price/Day:</strong> ₹${v.pricePerDay}</p>
    </div>
    <div class="card-actions"></div>
  `;

  const actions = card.querySelector('.card-actions');

  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View Details';
  viewBtn.addEventListener('click', () => {
    window.location.href = `vehicle-details.html?id=${v._id}`;
  });
  actions.appendChild(viewBtn);

  return card;
}

// 4. Filter logic
document.getElementById('applyFilters').addEventListener('click', () => {
  const type = document.getElementById('filterType').value.trim();
  const fuel = document.getElementById('filterFuel').value.trim();
  const avail = document.getElementById('filterAvailability').value.trim();

  const token = localStorage.getItem('authToken');
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Not Logged In',
      text: 'Please log in to apply filters.',
      confirmButtonColor: '#ff6b6b'
    });
    return;
  }

  fetch(APIF, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server Error (${res.status})`);
      }
      return res.json();
    })
    .then(vehicles => {
      const filteredVehicles = vehicles.filter(v => {
        const okType = !type || v.type.trim().toLowerCase() === type.toLowerCase();
        const okFuel = !fuel || v.fuelType.trim().toLowerCase() === fuel.toLowerCase();
        const okAvail = !avail || String(v.availability).toLowerCase() === avail.toLowerCase();
        return okType && okFuel && okAvail;
      });

      renderVehicles(filteredVehicles);

      Swal.fire({
        icon: 'success',
        title: 'Filters Applied',
        text: `${filteredVehicles.length} result(s) found`,
        timer: 1500,
        showConfirmButton: false
      });
    })
    .catch(error => {
      console.error('Error applying filters:', error);
      grid.innerHTML = `<p class="error">Unable to apply filters. Please try again later.</p>`;
      Swal.fire({
        icon: 'error',
        title: 'Filter Error',
        text: error.message,
        confirmButtonColor: '#ff6b6b'
      });
    });
});

// 5. Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('filterType').value = '';
  document.getElementById('filterFuel').value = '';
  document.getElementById('filterAvailability').value = '';
  loadVehicles();

  Swal.fire({
    icon: 'info',
    title: 'Filters Cleared',
    timer: 1200,
    showConfirmButton: false
  });
});

// 6. Initial load
loadAllBtn.addEventListener('click', loadVehicles);
loadAllBtn.click();
