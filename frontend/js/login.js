document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const preloader = document.getElementById('preloader');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill out both email and password.',
        confirmButtonColor: '#ff6b6b',
      });
      return;
    }

    // ⚡ Show preloader instantly
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    try {
      const response = await fetch('https://ajmcars-vohf.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed.');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);

      // ✅ Instant redirect without waiting 2s
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome, ${data.name}!`,
        timer: 1000,
        showConfirmButton: false
      });

      // ⏱ Replace setTimeout with Swal’s timer
      setTimeout(() => {
        window.location.href = data.role === 'admin' ? 'admindashboard.html' : 'userdashboard.html';
      }, 1000);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message,
        confirmButtonColor: '#ff6b6b',
      });
    } finally {
      // ✅ Always hide preloader
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 300);
    }
  });

  // ⛔ Optional: remove if not needed
  window.addEventListener("load", () => {
    preloader.style.opacity = "0";
    setTimeout(() => preloader.style.display = "none", 300);
  });
});
