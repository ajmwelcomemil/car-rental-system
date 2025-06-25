const API_BASE = 'https://ajmcars-vohf.onrender.com/api';
const vehicleDetailsEl = document.getElementById('vehicleDetails');
const bookingSectionEl = document.getElementById('bookingSection');
const pickupInput = document.getElementById('pickupDate');
const dropoffInput = document.getElementById('dropoffDate');
const totalDaysEl = document.getElementById('totalDays');
const totalPriceEl = document.getElementById('totalPrice');
const confirmBtn = document.getElementById('confirmBtn');

let vehicle = null;

// Get vehicle ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vehicleId = urlParams.get('id');

// Load vehicle details
async function loadVehicleDetails() {
  const token = localStorage.getItem('authToken');

  try {
    const res = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    vehicle = await res.json();

    renderVehicle(vehicle);
    bookingSectionEl.style.display = 'block';
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Failed to Load',
      text: 'Failed to load vehicle details.',
      confirmButtonColor: '#ff6b6b'
    });
  }
}

// Render vehicle card
function renderVehicle(v) {
  vehicleDetailsEl.innerHTML = `
    <img src="https://ajmcars-vohf.onrender.com/uploads/${v.images[0] || 'placeholder.jpg'}" alt="${v.name}">
    <div class="vehicle-info">
      <h2>Brand - ${v.brand} </h2>
      <h2>Name - ${v.name}</h2>
      <p><strong>Type:</strong> ${v.type}</p>
      <p><strong>Fuel:</strong> ${v.fuelType}</p>
      <p><strong>Price Per Day:</strong> ₹${v.pricePerDay}</p>
      <p><strong>Availability:</strong> ${v.availability ? 'Available' : 'Not Available'}</p>
    </div>
  `;
}

// Calculate days and price
function calculateSummary() {
  const pickup = new Date(pickupInput.value);
  const dropoff = new Date(dropoffInput.value);

  if (pickup && dropoff && dropoff > pickup) {
    const diffTime = Math.abs(dropoff - pickup);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const price = days * vehicle.pricePerDay;

    totalDaysEl.textContent = days;
    totalPriceEl.textContent = price;
  } else {
    totalDaysEl.textContent = '0';
    totalPriceEl.textContent = '0';
  }
}

// Confirm booking
confirmBtn.addEventListener('click', async () => {
  const pickupDate = pickupInput.value;
  const dropoffDate = dropoffInput.value;
  const token = localStorage.getItem('authToken');

  // Validations
  if (!pickupDate || !dropoffDate) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Dates',
      text: 'Please select both pickup and drop-off dates.',
      confirmButtonColor: '#ff6b6b'
    });
    return;
  }

  const days = parseInt(totalDaysEl.textContent);
  if (days <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Date Range',
      text: 'Drop-off date must be after pickup date.',
      confirmButtonColor: '#ff6b6b'
    });
    return;
  }

  if (!vehicle || !vehicle._id) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Vehicle Info',
      text: 'Vehicle information is missing.',
      confirmButtonColor: '#ff6b6b'
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: vehicle._id,
        pickupDate,
        dropoffDate
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Booking failed.');
    }

    Swal.fire({
      icon: 'success',
      title: 'Booking Confirmed',
      text: 'Your booking has been successfully created!',
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = 'booking-history.html';
    }, 2000);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Booking Failed',
      text: err.message,
      confirmButtonColor: '#ff6b6b'
    });
  }
});

// Recalculate on date change
pickupInput.addEventListener('change', calculateSummary);
dropoffInput.addEventListener('change', calculateSummary);

// Initial load
loadVehicleDetails();
