const APIF = 'https://ajmcars.onrender.com/api/vehicles';
const grid = document.getElementById('vehiclesGrid');
const loadAllBtn = document.getElementById('loadAllBtn');

// 1. Load & render all vehicles
async function loadVehicles() {
  const token = localStorage.getItem('authToken');
  try {
    const res = await fetch(APIF, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load vehicles');
    const list = await res.json();
    renderVehicles(list);
    Toastify({
      text: "Vehicles loaded successfully!",
      duration: 2000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true,
    }).showToast();
  } catch (error) {
    console.error(error);
    grid.innerHTML = `<p class="error">Unable to load vehicles. Please try again later.</p>`;
    Toastify({
      text: `Error: ${error.message}`,
      duration: 4000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true,
    }).showToast();
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
    <img src="https://ajmcars.onrender.com/uploads/${v.images[0] || 'placeholder.jpg'}" alt="${v.name}">
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

// 4. Filter logic with improved fuel type comparison
document.getElementById('applyFilters').addEventListener('click', () => {
  const type = document.getElementById('filterType').value.trim();
  const fuel = document.getElementById('filterFuel').value.trim();
  const avail = document.getElementById('filterAvailability').value.trim();

  fetch(APIF)
  .then(res => res.json())
  .then(vehicles => {
    console.log('All vehicles:', vehicles); // DEBUG
    vehicles.forEach(v => console.log(`Vehicle: ${v.name}, Fuel: ${v.fuelType}`)); // DEBUG

    const filteredVehicles = vehicles.filter(v => {
      const okType = !type || v.type.trim().toLowerCase() === type.toLowerCase();
      const okFuel = !fuel || v.fuelType.trim().toLowerCase() === fuel.toLowerCase();
      const okAvail = !avail || String(v.availability).toLowerCase() === avail.toLowerCase();
      return okType && okFuel && okAvail;
    });

    renderVehicles(filteredVehicles);
    Toastify({
      text: "Filters applied!",
      duration: 2000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true,
    }).showToast();
  })

    .catch(error => {
      console.error(error);
      grid.innerHTML = `<p class="error">Unable to apply filters. Please try again later.</p>`;
      Toastify({
        text: `Filter error: ${error.message}`,
        duration: 4000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true,
      }).showToast();
    });
});

// 5. Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('filterType').value = '';
  document.getElementById('filterFuel').value = '';
  document.getElementById('filterAvailability').value = '';
  loadVehicles();

  Toastify({
    text: "Filters cleared.",
    duration: 2000,
    gravity: "top",
    position: "center",
    backgroundColor: "#2196f3",
    stopOnFocus: true,
  }).showToast();
});

// Initial load
loadAllBtn.addEventListener('click', loadVehicles);
loadAllBtn.click();
