window.addEventListener('DOMContentLoaded', function () {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
    }

    const bookingList = document.getElementById('booking-list');
    const loader = document.getElementById('loader');
    const statusFilter = document.getElementById('statusFilter');

    let selectedRating = 0;
    let currentBookingId = null;
    let currentVehicleId = null;

    const reviewModal = document.getElementById('review-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const starContainer = document.getElementById('star-container');
    const stars = starContainer.querySelectorAll('.star');
    const submitReviewBtn = document.getElementById('submit-review');
    const commentBox = document.getElementById('review-comment');

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function fetchBookingHistory(status = 'All') {
        showLoader();
        fetch('https://ajmcars.onrender.com/api/bookings/my', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        })
        .then(response => response.json())
        .then(bookings => {
            hideLoader();
            if (bookings && bookings.length > 0) {
                displayBookings(bookings, status);
            } else {
                bookingList.innerHTML = '<p>No bookings found.</p>';
            }
        })
        .catch(error => {
            hideLoader();
            console.error('Error:', error);
            showErrorToast('An error occurred while fetching bookings.');
        });
    }

    function displayBookings(bookings, filterStatus) {
        bookingList.innerHTML = '';
        bookings.forEach(booking => {
            if (filterStatus !== 'All' && booking.status !== filterStatus) return;

            const bookingItem = document.createElement('div');
            bookingItem.classList.add('booking-item');
            bookingItem.dataset.bookingId = booking._id;

            bookingItem.innerHTML = `
                <p><strong>Vehicle:</strong> ${booking.vehicle.name}</p>
                <p><strong>Pickup:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
                <p><strong>Drop-off:</strong> ${new Date(booking.dropoffDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
            `;

            if (booking.status === 'Pending') {
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel Booking';
                cancelBtn.classList.add('cancel-btn');
                cancelBtn.addEventListener('click', () => {
                    // Show confirmation toast before canceling
                    showCancelConfirmationToast(booking, cancelBtn);
                });
                bookingItem.appendChild(cancelBtn);
            }

            if (booking.status === 'Completed') {
                const invoiceBtn = document.createElement('button');
                invoiceBtn.textContent = 'Download Invoice';
                invoiceBtn.classList.add('download-btn');
                invoiceBtn.addEventListener('click', () => generateInvoice(booking._id));
                bookingItem.appendChild(invoiceBtn);

                if (!booking.reviewed) {
                    const reviewBtn = document.createElement('button');
                    reviewBtn.textContent = 'Leave Review';
                    reviewBtn.classList.add('review-btn');
                    reviewBtn.addEventListener('click', () => {
                        currentBookingId = booking._id;
                        currentVehicleId = booking.vehicle._id; // Store vehicleId for review submission
                        openReviewModal();
                    });
                    bookingItem.appendChild(reviewBtn);
                }
            }

            bookingList.appendChild(bookingItem);
        });
    }

    // Function to show confirmation toast before canceling booking
    function showCancelConfirmationToast(booking, cancelBtn) {
        Toastify({
            text: "Are you sure you want to cancel this booking?",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#ff6b6b",  // Red for cancellation
            stopOnFocus: true,
            onClick: async function () {
                cancelBooking(booking, cancelBtn);
            }
        }).showToast();
    }

    function cancelBooking(booking, cancelBtn) {
        showLoader();
        fetch(`https://ajmcars.onrender.com/api/bookings/cancel/${booking._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            hideLoader();
            if (data.success) {
                showSuccessToast('Booking canceled successfully');
                booking.status = 'Cancelled';
                cancelBtn.style.display = 'none';
                cancelBtn.previousElementSibling.textContent = `Status: ${booking.status}`;
            } else {
                showErrorToast(data.message || 'Failed to cancel booking');
            }
        })
        .catch(error => {
            hideLoader();
            console.error('Error:', error);
            showErrorToast('An error occurred while canceling the booking.');
        });
    }

    function generateInvoice(bookingId) {
        showLoader();
        fetch(`https://ajmcars.onrender.com/api/bookings/${bookingId}/invoice`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to generate invoice');
            return response.blob();
        })
        .then(blob => {
            hideLoader();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `invoice_${bookingId}.pdf`;
            link.click();
        })
        .catch(error => {
            hideLoader();
            console.error('Error:', error);
            showErrorToast('An error occurred while generating the invoice.');
        });
    }

    function openReviewModal() {
        reviewModal.style.display = 'block';
        selectedRating = 0;
        commentBox.value = '';
        stars.forEach(star => star.classList.remove('selected'));
    }

    function closeReviewModal() {
        reviewModal.style.display = 'none';
        currentBookingId = null;
        currentVehicleId = null;
    }

    closeModalBtn.addEventListener('click', closeReviewModal);
    window.addEventListener('click', e => {
        if (e.target === reviewModal) closeReviewModal();
    });

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach(s => s.classList.remove('selected'));
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add('selected');
            }
        });
    });

    submitReviewBtn.addEventListener('click', () => {
        const comment = commentBox.value.trim();
        if (selectedRating === 0 || !comment) {
            showErrorToast('Please provide both a rating and a comment.');
            return;
        }

        // Submit the review for the completed booking
        fetch('https://ajmcars.onrender.com/api/reviews/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ 
                vehicleId: currentVehicleId, // Use current vehicle ID
                rating: selectedRating, 
                comment: comment
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showSuccessToast('Review submitted successfully!');
                closeReviewModal();
                fetchBookingHistory();
            } else {
                showErrorToast(data.message || 'Failed to submit review');
            }
        })
        .catch(err => {
            console.error(err);
            showErrorToast('Error submitting review');
        });
    });

    statusFilter.addEventListener('change', () => {
        fetchBookingHistory(statusFilter.value);
    });

    fetchBookingHistory();
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
