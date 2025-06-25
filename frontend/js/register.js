document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const preloader = document.getElementById('preloader');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match!',
        timer: 3000,
        showConfirmButton: false,
        position: 'top'
      });
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters, include one number and one special character.',
        timer: 4000,
        showConfirmButton: false,
        position: 'top'
      });
      return;
    }

    const userData = { name, email, phone, password };

    // Show preloader
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    fetch('https://ajmcars-vohf.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        // Hide preloader
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 300);

        if (data._id) {
          Swal.fire({
            icon: 'success',
            title: `Welcome, ${data.name}!`,
            text: 'Registration successful. Please log in.',
            timer: 3000,
            showConfirmButton: false,
            position: 'top'
          });

          setTimeout(() => {
            window.location.href = 'login.html';
          }, 3000);
        } else {
          const errMsg = data.message || data.error || 'Registration failed';
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: errMsg,
            timer: 4000,
            showConfirmButton: false,
            position: 'top'
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);

        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 300);

        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Something went wrong. Check console.',
          timer: 4000,
          showConfirmButton: false,
          position: 'top'
        });
      });
  });

  window.addEventListener("load", () => {
    preloader.style.opacity = "0";
    preloader.style.pointerEvents = "none";
    setTimeout(() => preloader.style.display = "none", 500);
  });
});
