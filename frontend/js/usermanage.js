const API = 'https://ajmcars.onrender.com/api/admin/users';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchUsers(query = '') {
  const url = query ? `${API}?search=${encodeURIComponent(query)}` : API;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

function renderUsers(users) {
  const grid = document.getElementById('usersGrid');
  grid.innerHTML = '';
  users.forEach(u => {
    const card = document.createElement('div');
    card.className = 'card';
    const isBlocked = u.isBlocked;
    card.innerHTML = `
      <h2>${u.name}</h2>
      <div class="info">
        <p><strong>Email:</strong> ${u.email}</p>
        <p><strong>Status:</strong> ${isBlocked ? 'Blocked' : 'Active'}</p>
      </div>
      <div class="actions">
        ${isBlocked
          ? `<button class="unblock" data-id="${u._id}">Unblock</button>`
          : `<button class="block" data-id="${u._id}">Block</button>`
        }
        <button class="edit" data-id="${u._id}">Edit</button>
        <button class="delete" data-id="${u._id}">Delete</button>
      </div>
    `;
    if (isBlocked) {
      card.querySelector('.unblock').onclick = unblockUser;
    } else {
      card.querySelector('.block').onclick = blockUser;
    }
    card.querySelector('.edit').onclick = () => openEditModal(u);
    card.querySelector('.delete').onclick = deleteUser;
    grid.appendChild(card);
  });
}

async function loadAll() {
  try {
    const users = await fetchUsers();
    renderUsers(users);
  } catch (err) {
    Toastify({
      text: 'Error: ' + err.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
  }
}

async function searchUsers() {
  const term = document.getElementById('searchInput').value.trim();
  const blockFilter = document.getElementById('blockFilter').value;
  const query = new URLSearchParams();
  if (term) query.append('search', term);
  if (blockFilter) query.append('isBlocked', blockFilter);
  const url = `${API}?${query.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
    if (res.ok) {
      const users = await res.json();
      renderUsers(users);
    } else {
      Toastify({
        text: 'Error fetching users',
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff6b6b",
        stopOnFocus: true
      }).showToast();
    }
  } catch (err) {
    Toastify({
      text: 'Error: ' + err.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
  }
}

async function blockUser(e) {
  const id = e.target.dataset.id;
  try {
    const res = await fetch(`${API}/${id}/block`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    Toastify({
      text: 'User blocked',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true
    }).showToast();
    loadAll();
  } catch (err) {
    Toastify({
      text: 'Error: ' + err.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
  }
}

async function unblockUser(e) {
  const id = e.target.dataset.id;
  try {
    const res = await fetch(`${API}/${id}/unblock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `Server ${res.status}`);
    Toastify({
      text: 'User unblocked',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true
    }).showToast();
    loadAll();
  } catch (err) {
    Toastify({
      text: 'Error: ' + err.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
  }
}

async function deleteUser(e) {
  if (!confirm('Delete this user?')) return;
  const id = e.target.dataset.id;
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).message);
    Toastify({
      text: 'User deleted',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true
    }).showToast();
    loadAll();
  } catch (err) {
    Toastify({
      text: 'Error: ' + err.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
  }
}

// ===== Edit Modal Logic =====
function openEditModal(user) {
  document.getElementById('editUserId').value = user._id;
  document.getElementById('editName').value = user.name || '';
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editPhone').value = user.phone || '';
  document.getElementById('editRole').value = user.role || '';
  document.getElementById('editIsBlocked').value = user.isBlocked ? 'true' : 'false';
  document.getElementById('editModal').classList.remove('hidden');
}

document.querySelector('.close-btn').onclick = () => {
  document.getElementById('editModal').classList.add('hidden');
};

document.getElementById('editForm').onsubmit = async function (e) {
  e.preventDefault();

  const id = document.getElementById('editUserId').value;
  const data = {
    name: document.getElementById('editName').value.trim(),
    email: document.getElementById('editEmail').value.trim(),
    phone: document.getElementById('editPhone').value.trim(),
    role: document.getElementById('editRole').value.trim(),
    isBlocked: document.getElementById('editIsBlocked').value === 'true'
  };

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    Toastify({
      text: 'User updated successfully',
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true
    }).showToast();
    document.getElementById('editModal').classList.add('hidden');
    loadAll();
  } catch (err) {
    Toastify({
      text: 'Error: ' + err.message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff6b6b",
      stopOnFocus: true
    }).showToast();
  }
};

// Hooks
document.getElementById('loadAllBtn').onclick = loadAll;
document.getElementById('searchBtn').onclick = searchUsers;
loadAll();
