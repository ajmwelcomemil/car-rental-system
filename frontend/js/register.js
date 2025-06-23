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
      Toastify({
        text: "Passwords do not match!",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true,
      }).showToast();
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      Toastify({
        text: "Password must be at least 8 characters, including one number and one special character.",
        duration: 4000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true,
      }).showToast();
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
          Toastify({
            text: `Welcome, ${data.name}! Please log in.`,
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#4caf50",
            stopOnFocus: true,
          }).showToast();

          setTimeout(() => {
            window.location.href = 'login.html';
          }, 3000);
        } else {
          const errMsg = data.message || data.error || 'Registration failed';
          Toastify({
            text: errMsg,
            duration: 4000,
            gravity: "top",
            position: "center",
            backgroundColor: "#ff6b6b",
            stopOnFocus: true,
          }).showToast();
        }
      })
      .catch(error => {
        console.error('Error:', error);

        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 300);

        Toastify({
          text: "Something went wrong. Check console.",
          duration: 4000,
          gravity: "top",
          position: "center",
          backgroundColor: "#ff6b6b",
          stopOnFocus: true,
        }).showToast();
      });
  });

  window.addEventListener("load", () => {
    preloader.style.opacity = "0";
    preloader.style.pointerEvents = "none";
    setTimeout(() => preloader.style.display = "none", 500);
  });
});
