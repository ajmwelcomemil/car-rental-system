document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const preloader = document.getElementById('preloader');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submit handler fired');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      Toastify({
        text: "Please fill out both fields.",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    // Show preloader
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    try {
      const response = await fetch('https://ajmcars.onrender.com/api/auth/login', {
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

      Toastify({
        text: "Login successful!",
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: "#4caf50",
        stopOnFocus: true,
      }).showToast();

      setTimeout(() => {
        if (data.role === 'admin') {
          window.location.href = 'admindashboard.html';
        } else {
          window.location.href = 'userdashboard.html';
        }
      }, 2000);

    } catch (error) {
      console.error('Fetch/login error:', error);
      Toastify({
        text: `Login error: ${error.message}`,
        duration: 4000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true,
      }).showToast();

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
