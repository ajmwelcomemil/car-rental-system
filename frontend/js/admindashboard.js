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
        const response = await fetch('https://ajmcars-vohf.onrender.com/api/admin/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('total-bookings').textContent = data.totalBookings;
        document.getElementById('total-vehicles').textContent = data.totalVehicles;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        showErrorAlert("Unauthorized. Please log in.");
    }
}

// Function to fetch booking chart data
async function fetchBookingChartData() {
    try {
        const response = await fetch('https://ajmcars-vohf.onrender.com/api/admin/dashboard/charts/bookings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        const labels = data.map(item => `Month ${item._id}`);
        const counts = data.map(item => item.count);

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
        showErrorAlert("Unauthorized. Please log in.");
    }
}

// Function to fetch vehicle usage chart data
async function fetchVehicleUsageChartData() {
    try {
        const token = getAuthToken();
        console.log('Auth Token:', token);

        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch('https://ajmcars-vohf.onrender.com/api/admin/dashboard/charts/vehicles/usage', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        console.log('Vehicle Usage Data:', data);

        const labels = data.map(item => item.vehicleName);
        const usageCounts = data.map(item => item.usageCount);

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
        showErrorAlert("Unauthorized. Please log in.");
    }
}

// Function to show a success alert using SweetAlert2
function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        timer: 3000,
        showConfirmButton: false,
        position: 'top'
    });
}

// Function to show an error alert using SweetAlert2
function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        timer: 3000,
        showConfirmButton: false,
        position: 'top'
    });
}
