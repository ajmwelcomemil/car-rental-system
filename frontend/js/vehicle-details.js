const API_BASE = 'https://ajmcars.onrender.com/api';
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
    Toastify({
      text: 'Failed to load vehicle details.',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
    console.error(err);
  }
}

// Render vehicle card
function renderVehicle(v) {
  vehicleDetailsEl.innerHTML = `
    <img src="https://ajmcars.onrender.com/uploads/${v.images[0] || 'placeholder.jpg'}" alt="${v.name}">
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
    
    // Check if pickup and dropoff dates are selected
    if (!pickupDate || !dropoffDate) {
      Toastify({
        text: 'Please select both pickup and drop-off dates.',
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true
      }).showToast();
      return;
    }
  
    const days = parseInt(totalDaysEl.textContent);
    
    // Check if drop-off date is after pickup date
    if (days <= 0) {
      Toastify({
        text: 'Drop-off date must be after pickup date.',
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true
      }).showToast();
      return;
    }
  
    // Check if vehicleId exists (ensure vehicle is loaded properly)
    if (!vehicle || !vehicle._id) {
      Toastify({
        text: 'Vehicle information is missing.',
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true
      }).showToast();
      return;
    }
  
    try {
      // Make the API request to create a booking
      const res = await fetch(`${API_BASE}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: vehicle._id,   // ✅ Use vehicleId correctly
          pickupDate,
          dropoffDate
        })
      });
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Booking failed.');
      }
  
      Toastify({
        text: 'Booking confirmed!',
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#4caf50",
        stopOnFocus: true
      }).showToast();
      window.location.href = 'booking-history.html'; // redirect to bookings page
    } catch (err) {
      console.error(err);
      Toastify({
        text: 'Failed to create booking: ' + err.message,
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true
      }).showToast();
    }
  });

// Recalculate on date change
pickupInput.addEventListener('change', calculateSummary);
dropoffInput.addEventListener('change', calculateSummary);

// Initial load
loadVehicleDetails();
