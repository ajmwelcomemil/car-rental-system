document.addEventListener("DOMContentLoaded", function () {
    // Fetch dashboard stats
    fetchDashboardStats();
    // Fetch booking chart data
    fetchBookingChartData();
    // Fetch vehicle usage chart data
    fetchVehicleUsageChartData();
});

// Function to get the JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Function to fetch dashboard stats (total users, bookings, vehicles)
async function fetchDashboardStats() {
    try {
        const response = await fetch('https://ajmcars.onrender.com/api/admin/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`  // Include token in headers
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        // Update dashboard stats on the page
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('total-bookings').textContent = data.totalBookings;
        document.getElementById('total-vehicles').textContent = data.totalVehicles;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        showErrorToast("Unauthorized. Please log in.");
    }
}

// Function to fetch booking chart data
async function fetchBookingChartData() {
    try {
        const response = await fetch('https://ajmcars.onrender.com/api/admin/dashboard/charts/bookings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`  // Include token in headers
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        // Prepare the labels and counts for the chart
        const labels = data.map(item => `Month ${item._id}`);
        const counts = data.map(item => item.count);

        // Create the bookings chart
        const ctx = document.getElementById('bookingsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bookings Over Time',
                    data: counts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }]
            }
        });
    } catch (error) {
        console.error("Error fetching booking chart data:", error);
        showErrorToast("Unauthorized. Please log in.");
    }
}

// Function to fetch vehicle usage chart data
async function fetchVehicleUsageChartData() {
    try {
        const token = getAuthToken(); // Retrieve the token from localStorage
        console.log('Auth Token:', token);  // Log to ensure the token is correctly retrieved

        if (!token) {
            throw new Error('No token found');
        }

        // Make the API request with the Authorization header
        const response = await fetch('https://ajmcars.onrender.com/api/admin/dashboard/charts/vehicles/usage', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Send token in Authorization header
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        console.log('Vehicle Usage Data:', data);  // Log to check the fetched data

        // Prepare the labels and usage counts for the chart
        const labels = data.map(item => item.vehicleName);
        const usageCounts = data.map(item => item.usageCount);

        // Create the vehicle usage chart
        const ctx = document.getElementById('vehicleUsageChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vehicle Usage Stats',
                    data: usageCounts,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            }
        });
    } catch (error) {
        console.error("Error fetching vehicle usage chart data:", error);
        showErrorToast("Unauthorized. Please log in.");
    }
}

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

// Function to get the authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}
