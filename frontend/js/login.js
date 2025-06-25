document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const preloader = document.getElementById('preloader');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submit handler fired');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill out both email and password.',
        confirmButtonColor: '#ff6b6b',
      });
      return;
    }

    // Show preloader
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    try {
      const response = await fetch('https://ajmcars-vohf.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Server responded ${response.status}`);
      }

      const data = await response.json();
      console.log('Response JSON:', data);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${data.name}!`,
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => {
        if (data.role === 'admin') {
          window.location.href = 'admindashboard.html';
        } else {
          window.location.href = 'userdashboard.html';
        }
      }, 2000);

    } catch (error) {
      console.error('Fetch/login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: `Error: ${error.message}`,
        confirmButtonColor: '#ff6b6b',
      });

      // Hide preloader on error
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 300);
    }
  });

  // Hide preloader after full page load
  window.addEventListener("load", () => {
    preloader.style.opacity = "0";
    preloader.style.pointerEvents = "none";
    setTimeout(() => preloader.style.display = "none", 500);
  });
});
