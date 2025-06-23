const API = 'https://ajmcars.onrender.com/api/admin/bookings';

function renderBookings(data) {
  const container = document.getElementById('bookingsList');
  container.innerHTML = '';

  if (!data.length) {
    container.innerHTML = '<p class="no-data">No bookings found.</p>';
    return;
  }

  data.forEach(booking => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    const userName = booking.user?.name || '—';
    const userEmail = booking.user?.email || '—';
    const vehicleBrand = booking.vehicle?.brand || '—';
    const vehicleName = booking.vehicle?.name || '—';
    const pickupDate = new Date(booking.pickupDate).toLocaleDateString();
    const dropoffDate = new Date(booking.dropoffDate).toLocaleDateString();
    const bookingStatus = booking.status;

    card.innerHTML = `
      <div class="card-header">
        <h3>Booking ID: <span>${booking._id}</span></h3>
      </div>
      <div class="card-body">
        <p><strong>User:</strong> ${userName} <br> 
        <p><small>Email:${userEmail}</small></p>
        <p><strong>Vehicle:</strong> ${vehicleBrand} ${vehicleName}</p>
        <p><strong>Pickup:</strong> ${pickupDate}</p>
        <p><strong>Drop-off:</strong> ${dropoffDate}</p>
        <p><strong>Status:</strong> 
          <select data-id="${booking._id}" class="status-select">
            ${['Pending', 'Approved', 'In Use', 'Completed', 'Cancelled'].map(status => `
              <option value="${status}" ${bookingStatus === status ? 'selected' : ''}>${status}</option>
            `).join('')}
          </select>
        </p>
      </div>
      <div class="card-footer">
        <button class="btn update-btn" data-action="update" data-id="${booking._id}">Update Status</button>
      </div>
    `;

    // Attach event handler for status update
    card.querySelector('button').addEventListener('click', updateStatus);
    container.appendChild(card);
  });
}

async function fetchAll() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    showErrorToast('You must be logged in as an admin to view bookings.');
    return;
  }

  try {
    const res = await fetch('https://ajmcars.onrender.com/api/admin/bookings', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch bookings');
    }

    renderBookings(data);
  } catch (err) {
    showErrorToast('Error: ' + err.message);
  }
}

async function fetchByUser() {
  const userId = document.getElementById('filterUser').value.trim();
  if (!userId) return showErrorToast('Enter User ID');

  const token = localStorage.getItem('authToken');
  if (!token) {
    showErrorToast('You must be logged in to perform this action.');
    return;
  }

  try {
    const res = await fetch(`${API}/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log('Fetched bookings data:', data);  // Log the data here

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch bookings by user');
    }

    renderBookings(data);
  } catch (err) {
    showErrorToast('Error: ' + err.message);
  }
}

async function fetchByVehicle() {
  const vehicleId = document.getElementById('filterVehicle').value.trim();
  if (!vehicleId) return showErrorToast('Enter Vehicle ID');

  const token = localStorage.getItem('authToken');
  if (!token) {
    showErrorToast('You must be logged in to perform this action.');
    return;
  }

  try {
    const res = await fetch(`${API}/vehicle/${vehicleId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch bookings by vehicle');
    }

    renderBookings(data);
  } catch (err) {
    showErrorToast('Error: ' + err.message);
  }
}

// Update status
async function updateStatus(e) {
  const id = e.target.dataset.id;
  const select = document.querySelector(`select[data-id="${id}"]`);
  const status = select.value;

  const token = localStorage.getItem('authToken');
  if (!token) {
    showErrorToast('You must be logged in to update the status.');
    return;
  }

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Include token in header
      },
      body: JSON.stringify({ status })
    });

    const json = await res.json();

    if (res.ok) {
      showSuccessToast('Status updated');
      select.value = status;  // Update the selected status in the UI
    } else {
      throw new Error(json.message || 'Failed to update status');
    }
  } catch (error) {
    showErrorToast('Error: ' + error.message);
  }
}

// Wire up buttons
document.getElementById('loadAll').onclick = fetchAll;
document.getElementById('loadByUser').onclick = fetchByUser;
document.getElementById('loadByVehicle').onclick = fetchByVehicle;
document.getElementById('loadByStatus').onclick = fetchByStatus;

// Initial load
fetchAll();

async function fetchByStatus() {
  const status = document.getElementById('statusFilter').value.trim();
  const token = localStorage.getItem('authToken');
  if (!token) {
    showErrorToast('You must be logged in as an admin to filter by status.');
    return;
  }

  const url = status ? `${API}?status=${status}` : `${API}`; // Include status filter in the URL if selected

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch bookings by status');
    }

    renderBookings(data);
  } catch (err) {
    showErrorToast('Error: ' + err.message);
  }
}

// Toastify Notifications
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
