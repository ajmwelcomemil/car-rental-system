window.addEventListener('DOMContentLoaded', function () {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    window.location.href = 'login.html';
    return;
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

    fetch('https://ajmcars-vohf.onrender.com/api/bookings/my', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            showErrorToast('Session expired. Please login again.');
            localStorage.removeItem('authToken');
            setTimeout(() => window.location.href = 'login.html', 2000);
          } else {
            showErrorToast(`Failed to fetch bookings: ${response.statusText}`);
          }
          throw new Error('Fetch failed');
        }
        return response.json();
      })
      .then(data => {
        hideLoader();
        const bookings = Array.isArray(data) ? data : data.bookings || [];
        if (bookings.length > 0) {
          displayBookings(bookings, status);
        } else {
          bookingList.innerHTML = '<p>No bookings found.</p>';
        }
      })
      .catch(error => {
        hideLoader();
        console.error('Error:', error);
        // Error toast already shown above
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
        <p class="status"><strong>Status:</strong> ${booking.status}</p>
      `;

      if (booking.status === 'Pending') {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel Booking';
        cancelBtn.classList.add('cancel-btn');
        cancelBtn.addEventListener('click', () => {
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
            currentVehicleId = booking.vehicle._id;
            openReviewModal();
          });
          bookingItem.appendChild(reviewBtn);
        }
      }

      bookingList.appendChild(bookingItem);
    });
  }

  function showCancelConfirmationToast(booking, cancelBtn) {
    Swal.fire({
      title: 'Cancel Booking?',
      text: "Are you sure you want to cancel this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelBooking(booking, cancelBtn);
      }
    });
  }

  function cancelBooking(booking, cancelBtn) {
    showLoader();
    fetch(`https://ajmcars-vohf.onrender.com/api/bookings/cancel/${booking._id}`, {
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
          const statusText = cancelBtn.parentElement.querySelector('.status');
          if (statusText) statusText.innerHTML = `<strong>Status:</strong> ${booking.status}`;
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
    fetch(`https://ajmcars-vohf.onrender.com/api/bookings/${bookingId}/invoice`, {
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

    fetch('https://ajmcars-vohf.onrender.com/api/reviews/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        vehicleId: currentVehicleId,
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

// ✅ SweetAlert2 Success Toast
function showSuccessToast(message) {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    timer: 2000,
    showConfirmButton: false
  });
}

// ✅ SweetAlert2 Error Toast
function showErrorToast(message) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#ff6b6b'
  });
}

// ✅ Navbar toggle logic
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobile-menu');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('overlay');
  const closeNav = document.getElementById('closeNav');

  if (toggleBtn && mobileNav && overlay && closeNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.add('active');
      overlay.classList.add('active');
    });

    closeNav.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
});
