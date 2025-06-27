const API = 'https://ajmcars-vohf.onrender.com/api/admin/users';

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
          : `<button class="block" data-id="${u._id}">Block</button>`}
        <button class="edit" data-id="${u._id}">Edit</button>
        <button class="delete" data-id="${u._id}">Delete</button>
      </div>
    `;

    const toggleBtn = isBlocked ? card.querySelector('.unblock') : card.querySelector('.block');
    toggleBtn.onclick = isBlocked ? unblockUser : blockUser;
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
    showErrorToast('Error: ' + err.message);
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
    const users = await res.json();
    if (!res.ok) throw new Error('Failed to fetch users');
    renderUsers(users);
  } catch (err) {
    showErrorToast('Error: ' + err.message);
  }
}

async function blockUser(e) {
  const btn = e.target;
  const id = btn.dataset.id;
  btn.disabled = true;
  btn.textContent = 'Blocking...';

  try {
    const res = await fetch(`${API}/${id}/block`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error((await res.json()).message);

    const card = btn.closest('.card');
    card.querySelector('.info p:nth-child(2)').innerHTML = `<strong>Status:</strong> Blocked`;
    btn.className = 'unblock';
    btn.textContent = 'Unblock';
    btn.onclick = unblockUser;
    showSuccessToast('User blocked');
  } catch (err) {
    showErrorToast('Error: ' + err.message);
    btn.textContent = 'Block';
  } finally {
    btn.disabled = false;
  }
}

async function unblockUser(e) {
  const btn = e.target;
  const id = btn.dataset.id;
  btn.disabled = true;
  btn.textContent = 'Unblocking...';

  try {
    const res = await fetch(`${API}/${id}/unblock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error((await res.json()).message);

    const card = btn.closest('.card');
    card.querySelector('.info p:nth-child(2)').innerHTML = `<strong>Status:</strong> Active`;
    btn.className = 'block';
    btn.textContent = 'Block';
    btn.onclick = blockUser;
    showSuccessToast('User unblocked');
  } catch (err) {
    showErrorToast('Error: ' + err.message);
    btn.textContent = 'Unblock';
  } finally {
    btn.disabled = false;
  }
}

async function deleteUser(e) {
  const id = e.target.dataset.id;

  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error((await res.json()).message);

    e.target.closest('.card').remove(); // Remove from DOM
    showSuccessToast('User deleted');
  } catch (err) {
    showErrorToast('Error: ' + err.message);
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
    showSuccessToast('User updated successfully');
    document.getElementById('editModal').classList.add('hidden');
    loadAll(); // Re-render full list or you can optimize to update one card
  } catch (err) {
    showErrorToast('Error: ' + err.message);
  }
};

// Hooks
document.getElementById('loadAllBtn').onclick = loadAll;
document.getElementById('searchBtn').onclick = searchUsers;
loadAll();
