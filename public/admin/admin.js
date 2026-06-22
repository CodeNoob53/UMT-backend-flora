const API = '/api/bouquets';

// ── State ──────────────────────────────────────────────────────────────────
let bouquets = [];
let deleteTarget = null;

// ── DOM refs ───────────────────────────────────────────────────────────────
const tbody        = document.getElementById('bouquets-tbody');
const modalOverlay = document.getElementById('modal-overlay');
const deleteOverlay= document.getElementById('delete-overlay');
const form         = document.getElementById('bouquet-form');
const modalTitle   = document.getElementById('modal-title');
const toast        = document.getElementById('toast');

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = 'toast', 3000);
}

// ── API helpers ────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

// ── Render table ───────────────────────────────────────────────────────────
function renderTable() {
  tbody.innerHTML = bouquets.map(b => `
    <tr data-id="${b.id}">
      <td>
        ${b.photoURL
          ? `<img class="thumb" src="${b.photoURL}" alt="${b.title}">`
          : `<div class="no-photo">🌸</div>`}
      </td>
      <td><strong>${b.title}</strong><br><span style="color:#999">${b.slug ?? ''}</span></td>
      <td>$${b.price}</td>
      <td>${b.orders ?? 0}</td>
      <td><span class="badge ${b.bestseller ? 'badge--yes' : 'badge--no'}">${b.bestseller ? 'Yes' : 'No'}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn--icon btn--outline" data-action="photo" title="Upload photo">📷</button>
          <button class="btn btn--icon btn--outline" data-action="edit"  title="Edit">✏️</button>
          <button class="btn btn--icon btn--danger"  data-action="delete" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Load ───────────────────────────────────────────────────────────────────
async function loadBouquets() {
  try {
    bouquets = await apiFetch(API);
    renderTable();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ── Open / close modal ─────────────────────────────────────────────────────
function openModal(bouquet = null) {
  form.reset();
  document.getElementById('field-id').value = bouquet?.id ?? '';
  modalTitle.textContent = bouquet ? 'Edit Bouquet' : 'Add Bouquet';

  if (bouquet) {
    document.getElementById('field-title').value       = bouquet.title ?? '';
    document.getElementById('field-price').value       = bouquet.price ?? '';
    document.getElementById('field-slug').value        = bouquet.slug ?? '';
    document.getElementById('field-text').value        = bouquet.text ?? '';
    document.getElementById('field-description').value = bouquet.description ?? '';
    document.getElementById('field-alt').value         = bouquet.alt ?? '';
    document.getElementById('field-bestseller').checked= bouquet.bestseller ?? false;
    document.getElementById('field-favorite').checked  = bouquet.favorite ?? false;
  }

  // hide photo field on edit (separate PATCH)
  document.getElementById('photo-row').style.display = bouquet ? 'none' : '';
  modalOverlay.classList.remove('hidden');
}

function closeModal() { modalOverlay.classList.add('hidden'); }

// ── Photo upload ───────────────────────────────────────────────────────────
function openPhotoUpload(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/webp';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      showToast('Uploading & processing…');
      const updated = await apiFetch(`${API}/${id}/photo`, { method: 'PATCH', body: fd });
      bouquets = bouquets.map(b => b.id === updated.id ? updated : b);
      renderTable();
      showToast('Photo updated');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };
  input.click();
}

// ── Submit form ────────────────────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  const id    = document.getElementById('field-id').value;
  const isNew = !id;

  const body = {
    title:       document.getElementById('field-title').value.trim(),
    price:       Number(document.getElementById('field-price').value),
    slug:        document.getElementById('field-slug').value.trim() || undefined,
    text:        document.getElementById('field-text').value.trim() || undefined,
    description: document.getElementById('field-description').value.trim() || undefined,
    alt:         document.getElementById('field-alt').value.trim() || undefined,
    bestseller:  document.getElementById('field-bestseller').checked,
    favorite:    document.getElementById('field-favorite').checked,
  };

  try {
    if (isNew) {
      // create
      const created = await apiFetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // upload photo if selected
      const photoFile = document.getElementById('field-photo').files[0];
      if (photoFile) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        const withPhoto = await apiFetch(`${API}/${created.id}/photo`, { method: 'PATCH', body: fd });
        bouquets = [withPhoto, ...bouquets];
      } else {
        bouquets = [created, ...bouquets];
      }
      showToast('Bouquet created');
    } else {
      const updated = await apiFetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      bouquets = bouquets.map(b => b.id === updated.id ? updated : b);
      showToast('Bouquet updated');
    }

    closeModal();
    renderTable();
  } catch (e) {
    showToast(e.message, 'error');
  }
});

// ── Delete ─────────────────────────────────────────────────────────────────
function openDeleteConfirm(id) {
  deleteTarget = id;
  const b = bouquets.find(b => b.id === id);
  document.getElementById('delete-name').textContent = b?.title ?? '';
  deleteOverlay.classList.remove('hidden');
}

document.getElementById('btn-delete-confirm').addEventListener('click', async () => {
  if (!deleteTarget) return;
  try {
    await apiFetch(`${API}/${deleteTarget}`, { method: 'DELETE' });
    bouquets = bouquets.filter(b => b.id !== deleteTarget);
    renderTable();
    showToast('Bouquet deleted');
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    deleteOverlay.classList.add('hidden');
    deleteTarget = null;
  }
});

// ── Event delegation ───────────────────────────────────────────────────────
tbody.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.closest('tr').dataset.id);
  const action = btn.dataset.action;

  if (action === 'edit')   openModal(bouquets.find(b => b.id === id));
  if (action === 'delete') openDeleteConfirm(id);
  if (action === 'photo')  openPhotoUpload(id);
});

// ── Buttons ────────────────────────────────────────────────────────────────
document.getElementById('btn-add').addEventListener('click', () => openModal());
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('btn-delete-cancel').addEventListener('click', () => {
  deleteOverlay.classList.add('hidden');
  deleteTarget = null;
});
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// ── Init ───────────────────────────────────────────────────────────────────
loadBouquets();
