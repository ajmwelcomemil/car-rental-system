const API = 'https://ajmcars.onrender.com/api/admin/vehicles';
const APIF = 'https://ajmcars.onrender.com/api/vehicles';
const form = document.getElementById('vehicleForm');
const grid = document.getElementById('vehiclesGrid');
const title = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelEdit');
const addNewBtn = document.getElementById('addNewBtn');
const formSection = document.querySelector('.form-section');
const reviewsSection = document.getElementById('reviewsSection');
const reviewsList = document.getElementById('reviewsList');

let editId = null;

async function loadVehicles() {
  const token = localStorage.getItem('authToken');
  const res = await fetch(APIF, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const list = await res.json();
  grid.innerHTML = '';
  list.forEach(v => grid.appendChild(createCard(v)));
}

function createCard(v) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="https://ajmcars.onrender.com/uploads/${v.images[0] || 'placeholder.jpg'}" alt="${v.name}">
    <div class="card-content">
      <h3>${v.brand} ${v.name}</h3>
      <p><strong>Type:</strong> ${v.type}</p>
      <p><strong>Fuel:</strong> ${v.fuelType}</p>
      <p><strong>Price/Day:</strong> ₹${v.pricePerDay}</p>
      <p><strong>Tags:</strong> ${v.tags.join(', ')}</p>
      <p><strong>Available:</strong> ${v.availability ? 'Yes' : 'No'}</p>
    </div>
    <div class="card-actions">
      <button class="edit" data-id="${v._id}">Edit</button>
      <button class="toggle" data-id="${v._id}">${v.availability ? 'Disable' : 'Enable'}</button>
      <button class="delete" data-id="${v._id}">Delete</button>
      <button class="review" data-id="${v._id}">View Reviews</button>
    </div>
  `;

  card.querySelector('.edit').onclick = () => startEdit(v);
  card.querySelector('.toggle').onclick = () => toggleAvailability(v._id);
  card.querySelector('.delete').onclick = () => deleteVehicle(v._id);
  card.querySelector('.review').onclick = () => showReviews(v._id);
  return card;
}

form.onsubmit = async e => {
  e.preventDefault();
  const data = new FormData(form);
  let url = API, method = 'POST';
  if (editId) {
    url += `/${editId}`;
    method = 'PUT';
  }
  const token = localStorage.getItem('authToken');
  const res = await fetch(url, {
    method,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const json = await res.json();
  if (res.ok) {
    Toastify({
      text: json.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
    }).showToast();
    afterGridAction();
  } else {
    Toastify({
      text: 'Error: ' + json.message,
      duration: 4000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
    }).showToast();
  }
};

function startEdit(v) {
  showAddForm();
  editId = v._id;
  title.textContent = 'Edit Vehicle';
  submitBtn.textContent = 'Update Vehicle';
  form.name.value = v.name || '';
  form.brand.value = v.brand || '';
  form.type.value = v.type || '';
  form.fuelType.value = v.fuelType || '';
  form.pricePerDay.value = v.pricePerDay || '';
  form.tags.value = (v.tags || []).join(',');
}

function showAddForm() {
  resetForm();
  formSection.style.display = 'block';
  cancelBtn.classList.remove('hidden');
}

function resetForm() {
  editId = null;
  title.textContent = 'Add New Vehicle';
  submitBtn.textContent = 'Add Vehicle';
  cancelBtn.classList.add('hidden');
  form.reset();
  formSection.style.display = 'none';
}

function afterGridAction() {
  resetForm();
  loadVehicles();
}

async function toggleAvailability(id) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API}/${id}/availability`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (res.ok) {
    Toastify({
      text: json.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
    }).showToast();
    loadVehicles();
  } else {
    Toastify({
      text: 'Error: ' + json.message,
      duration: 4000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
    }).showToast();
  }
}

async function deleteVehicle(id) {
  if (!window.confirm('Delete this vehicle?')) return;
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (res.ok) {
    Toastify({
      text: json.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
    }).showToast();
    loadVehicles();
  } else {
    Toastify({
      text: 'Error: ' + json.message,
      duration: 4000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
    }).showToast();
  }
}

document.getElementById('loadOneBtn').onclick = async () => {
  let id = document.getElementById('singleId').value.trim();
  if (!id) {
    Toastify({
      text: 'Enter a valid Vehicle ID',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
    }).showToast();
    return;
  }
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${APIF}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    Toastify({
      text: 'Invalid Vehicle ID',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
    }).showToast();
    return;
  }
  const vehicle = await res.json();
  grid.innerHTML = '';
  grid.appendChild(createCard(vehicle));
};

addNewBtn.addEventListener('click', e => {
  e.preventDefault();
  showAddForm();
});

cancelBtn.addEventListener('click', resetForm);

// Load all on start
loadVehicles();

async function showReviews(vehicleId) {
  const res = await fetch(`https://ajmcars.onrender.com/api/reviews/${vehicleId}`);
  const reviews = await res.json();
  reviewsSection.classList.remove('hidden');
  reviewsList.innerHTML = reviews.length === 0 ? '<p>No reviews available.</p>' :
    reviews.map(r => `
      <div class="review-item">
        <p><strong>${r.user?.name || 'Anonymous'}:</strong> ${r.comment}</p>
        <p><em>${r.rating} / 5 stars</em></p>
      </div>
    `).join('');
}