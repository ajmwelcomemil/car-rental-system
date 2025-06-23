const urlParams = new URLSearchParams(window.location.search);
const vehicleId = urlParams.get('vehicleId');
const pickupDateInput = document.getElementById('pickupDate');
const dropoffDateInput = document.getElementById('dropoffDate');
const totalDaysInput = document.getElementById('totalDays');
const totalAmountInput = document.getElementById('totalAmount');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');

// Fetch vehicle data to get price per day
let vehicleData;

async function fetchVehicleDetails() {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`https://ajmcars.onrender.com/api/vehicles/${vehicleId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  vehicleData = await res.json();
}

function calculateBooking() {
  const pickupDate = new Date(pickupDateInput.value);
  const dropoffDate = new Date(dropoffDateInput.value);

  if (pickupDate && dropoffDate && dropoffDate > pickupDate) {
    const totalDays = Math.ceil((dropoffDate - pickupDate) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * vehicleData.pricePerDay;

    totalDaysInput.value = totalDays;
    totalAmountInput.value = totalAmount;
  }
}

pickupDateInput.addEventListener('change', calculateBooking);
dropoffDateInput.addEventListener('change', calculateBooking);

// Confirm booking
confirmBookingBtn.addEventListener('click', async () => {
  const pickupDate = pickupDateInput.value;
  const dropoffDate = dropoffDateInput.value;
  const totalDays = totalDaysInput.value;
  const totalAmount = totalAmountInput.value;

  if (pickupDate && dropoffDate && totalDays && totalAmount) {
    const token = localStorage.getItem('authToken');
    const bookingDetails = {
      vehicleId,
      pickupDate,
      dropoffDate,
      totalDays,
      totalAmount,
    };

    const res = await fetch('https://ajmcars.onrender.com/api/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    });

    if (res.ok) {
      showSuccessToast('Booking Confirmed!');
      window.location.href = '/my-bookings.html'; // Redirect to user's bookings page
    } else {
      showErrorToast('Booking failed. Please try again.');
    }
  } else {
    showErrorToast('Please fill in all the details.');
  }
});

// Function to show a success toast notification
function showSuccessToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: "#4caf50",  // Green for success
    stopOnFocus: true
  }).showToast();
}

// Function to show an error toast notification
function showErrorToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: "#ff6b6b",  // Red for error
    stopOnFocus: true
  }).showToast();
}

// Initial data fetch
fetchVehicleDetails();
