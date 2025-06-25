function openModal(id) {
  document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');

  const res = await fetch('https://ajmcars-vohf.onrender.com/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  document.getElementById('name').textContent = data.name;
  document.getElementById('email').textContent = data.email;
  document.getElementById('phone').textContent = data.phone;
  document.getElementById('role').textContent = data.role;
  document.getElementById('createdAt').textContent = `Member Since: ${new Date(data.createdAt).toDateString()}`;

  document.getElementById('profilePic').src = data.profilePic
    ? `https://ajmcars-vohf.onrender.com${data.profilePic}`
    : 'https://via.placeholder.com/150?text=No+Image';

  // Pre-fill edit form
  const form = document.getElementById('editProfileForm');
  form.name.value = data.name;
  form.email.value = data.email;
  form.phone.value = data.phone;
});

// Edit profile submission
document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('authToken');
  const formData = new FormData(e.target);

  try {
    const res = await fetch('https://ajmcars-vohf.onrender.com/api/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Profile updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => location.reload(), 2000);
    } else {
      const data = await res.json();
      showErrorAlert(data.message || "Failed to update profile.");
    }
  } catch (err) {
    showErrorAlert("Error: " + err.message);
  }
});

// Reset password submission
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('authToken');
  const password = e.target.password.value;

  try {
    const res = await fetch('https://ajmcars-vohf.onrender.com/api/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Password Updated',
        text: 'Password updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      closeModal('resetPasswordModal');
    } else {
      const data = await res.json();
      showErrorAlert(data.message || "Password update failed.");
    }
  } catch (err) {
    showErrorAlert("Error: " + err.message);
  }
});

// SweetAlert2 Notifications
function showErrorAlert(message) {
  Swal.fire({
    icon: 'error',
    title: 'Oops!',
    text: message,
    confirmButtonColor: '#ff6b6b'
  });
}
