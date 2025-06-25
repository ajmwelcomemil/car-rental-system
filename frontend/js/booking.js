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
  try {
    const res = await fetch(`https://ajmcars-vohf.onrender.com/api/vehicles/${vehicleId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Vehicle not found');
    vehicleData = await res.json();
  } catch (err) {
    showErrorToast('Failed to fetch vehicle details.');
    console.error(err);
  }
}

function calculateBooking() {
  const pickupDate = new Date(pickupDateInput.value);
  const dropoffDate = new Date(dropoffDateInput.value);

  if (pickupDate && dropoffDate && dropoffDate > pickupDate && vehicleData?.pricePerDay) {
    const totalDays = Math.ceil((dropoffDate - pickupDate) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * vehicleData.pricePerDay;

    totalDaysInput.value = totalDays;
    totalAmountInput.value = totalAmount;
  } else {
    totalDaysInput.value = '';
    totalAmountInput.value = '';
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

    try {
      const res = await fetch('https://ajmcars-vohf.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
      });

      if (res.ok) {
        showSuccessToast('Booking Confirmed!');
        setTimeout(() => {
          window.location.href = '/my-bookings.html';
        }, 1500);
      } else {
        const data = await res.json();
        showErrorToast(data.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Network error. Please try again.');
    }
  } else {
    showErrorToast('Please fill in all the details.');
  }
});

// ✅ SweetAlert2 Success Notification
function showSuccessToast(message) {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    timer: 2000,
    showConfirmButton: false
  });
}

// ✅ SweetAlert2 Error Notification
function showErrorToast(message) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#ff6b6b'
  });
}

// Initial data fetch
fetchVehicleDetails();
