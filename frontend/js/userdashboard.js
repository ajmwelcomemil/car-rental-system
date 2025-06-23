const BASE_URL = 'https://ajmcars.onrender.com/api/admin/dashboard';

async function fetchVehicleUsageChartData() {
    try {
        const token = getAuthToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${BASE_URL}/charts/vehicles`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        // ... render chart ...
    } catch (error) {
        console.error("Error fetching vehicle usage chart data:", error);
        showErrorToast("Unauthorized. Please log in.");
    }
}

async function fetchBookingChartData() {
    try {
        const token = getAuthToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${BASE_URL}/charts/bookings`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        // ... render chart ...
    } catch (error) {
        console.error("Error fetching booking chart data:", error);
        showErrorToast("Unauthorized. Please log in.");
    }
}

// Toastify error toast function.
function showErrorToast(message) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true
    }).showToast();
}
