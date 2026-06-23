const BOUQUETS_API = '/api/bouquets';
const ORDERS_API = '/api/orders';
const THEME_KEY = 'flora-admin-theme';
const BOUQUETS_PER_PAGE = 8;

let bouquets = [];
let orders = [];
let deleteTarget = null;
let isLoading = false;
let activeRequest = false;
let uploadStartedAt = 0;
let uploadTimerId = null;
let activeTab = 'bouquets';

const state = {
  query: '',
  filter: 'all',
  sort: 'newest',
  page: 1,
};

const tbody = document.getElementById('bouquets-tbody');
const ordersTbody = document.getElementById('orders-tbody');
const modalOverlay = document.getElementById('modal-overlay');
const deleteOverlay = document.getElementById('delete-overlay');
const photoPreviewOverlay = document.getElementById('photo-preview-overlay');
const photoPreviewImg = document.getElementById('photo-preview-img');
const form = document.getElementById('bouquet-form');
const modalTitle = document.getElementById('modal-title');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const sortSelect = document.getElementById('sort-select');
const tableStatus = document.getElementById('table-status');
const ordersStatus = document.getElementById('orders-status');
const themeToggle = document.getElementById('theme-toggle');
const totalCount = document.getElementById('stat-total');
const bestsellerCount = document.getElementById('stat-bestsellers');
const favoriteCount = document.getElementById('stat-favorites');
const noPhotoCount = document.getElementById('stat-no-photo');
const newOrdersCount = document.getElementById('stat-new-orders');
const uploadProgress = document.getElementById('upload-progress');
const uploadProgressTitle = document.getElementById('upload-progress-title');
const uploadProgressTime = document.getElementById('upload-progress-time');
const uploadProgressText = document.getElementById('upload-progress-text');
const uploadOverlay = document.getElementById('upload-overlay');
const uploadOverlayProgressTitle = document.getElementById('upload-overlay-progress-title');
const uploadOverlayProgressTime = document.getElementById('upload-overlay-progress-time');
const uploadOverlayProgressText = document.getElementById('upload-overlay-progress-text');
const tabButtons = [...document.querySelectorAll('[data-tab]')];
const tabPanels = [...document.querySelectorAll('[data-panel]')];
const addButton = document.getElementById('btn-add');
const refreshButton = document.getElementById('btn-refresh');
const pagination = document.getElementById('bouquets-pagination');
const paginationSummary = document.getElementById('bouquets-pagination-summary');
const paginationPage = document.getElementById('bouquets-pagination-page');
const pagePrevButton = document.getElementById('btn-page-prev');
const pageNextButton = document.getElementById('btn-page-next');

function setActiveTab(nextTab) {
  activeTab = nextTab === 'orders' ? 'orders' : 'bouquets';

  tabButtons.forEach(button => {
    const isActive = button.dataset.tab === activeTab;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach(panel => {
    panel.hidden = panel.dataset.panel !== activeTab;
  });

  addButton.hidden = activeTab !== 'bouquets';
  refreshButton.textContent = activeTab === 'orders' ? 'Refresh orders' : 'Refresh bouquets';
}

function setBusy(isBusy, message = '') {
  activeRequest = isBusy;
  document.body.classList.toggle('is-busy', isBusy);
  document.querySelectorAll('button, input, select, textarea').forEach(control => {
    if (control.id === 'theme-toggle') return;
    control.disabled = isBusy;
  });

  if (message) setTableStatus(message);
}

function setUploadProgress(isVisible, title = 'Processing photo') {
  const useOverlay = modalOverlay.classList.contains('hidden');
  uploadProgress.hidden = !isVisible;
  uploadOverlay.classList.toggle('hidden', !isVisible || !useOverlay);

  if (!isVisible) {
    window.clearInterval(uploadTimerId);
    uploadTimerId = null;
    uploadStartedAt = 0;
    uploadProgressTime.textContent = '0s';
    uploadOverlayProgressTime.textContent = '0s';
    return;
  }

  uploadStartedAt = Date.now();
  uploadProgressTitle.textContent = title;
  const baseMessage =
    'The backend is uploading the image to Cloudinary. Delivery optimization is handled by Cloudinary. Please keep this window open.';
  uploadOverlayProgressTitle.textContent = title;
  uploadProgressText.textContent = baseMessage;
  uploadOverlayProgressText.textContent = uploadProgressText.textContent;

  const updateElapsed = () => {
    const elapsed = Math.max(0, Math.round((Date.now() - uploadStartedAt) / 1000));
    uploadProgressTime.textContent = `${elapsed}s`;
    uploadOverlayProgressTime.textContent = `${elapsed}s`;

    if (elapsed >= 20) {
      uploadProgressText.textContent =
        'Still working. Large images and Render free tier can take a while, but the Cloudinary upload is still in progress.';
      uploadOverlayProgressText.textContent = uploadProgressText.textContent;
    }
  };

  updateElapsed();
  window.clearInterval(uploadTimerId);
  uploadTimerId = window.setInterval(updateElapsed, 1000);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

function applyTheme(theme) {
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const resolved = theme === 'auto' ? preferred : theme;
  document.documentElement.dataset.theme = resolved;
  themeToggle.value = theme;
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY) || 'auto';
  applyTheme(stored);

  themeToggle.addEventListener('change', () => {
    localStorage.setItem(THEME_KEY, themeToggle.value);
    applyTheme(themeToggle.value);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyTheme('auto');
  });
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

function getFilteredBouquets() {
  const query = state.query.trim().toLowerCase();

  return bouquets
    .filter(bouquet => {
      const matchesQuery = !query || [bouquet.title, bouquet.slug, bouquet.category, bouquet.alt]
        .some(value => String(value ?? '').toLowerCase().includes(query));

      const matchesFilter =
        state.filter === 'all' ||
        (state.filter === 'bestseller' && bouquet.bestseller) ||
        (state.filter === 'favorite' && bouquet.favorite) ||
        (state.filter === 'no-photo' && !bouquet.photoURL);

      return matchesQuery && matchesFilter;
    })
    .sort((a, b) => {
      if (state.sort === 'title') return String(a.title).localeCompare(String(b.title));
      if (state.sort === 'price-low') return Number(a.price) - Number(b.price);
      if (state.sort === 'price-high') return Number(b.price) - Number(a.price);
      if (state.sort === 'orders') return Number(b.orders ?? 0) - Number(a.orders ?? 0);
      return Number(b.id) - Number(a.id);
    });
}

function resetBouquetPage() {
  state.page = 1;
}

function getPaginatedBouquets(items) {
  const pageCount = Math.max(1, Math.ceil(items.length / BOUQUETS_PER_PAGE));
  state.page = Math.min(Math.max(state.page, 1), pageCount);

  const startIndex = (state.page - 1) * BOUQUETS_PER_PAGE;
  return {
    items: items.slice(startIndex, startIndex + BOUQUETS_PER_PAGE),
    pageCount,
    startIndex,
  };
}

function renderPagination(total, pageCount, startIndex, currentCount) {
  pagination.hidden = total <= BOUQUETS_PER_PAGE;

  if (total === 0) {
    paginationSummary.textContent = '';
    paginationPage.textContent = '';
    return;
  }

  const from = startIndex + 1;
  const to = startIndex + currentCount;
  paginationSummary.textContent = `Showing ${from}-${to} of ${total}`;
  paginationPage.textContent = `Page ${state.page} of ${pageCount}`;
  pagePrevButton.disabled = activeRequest || state.page <= 1;
  pageNextButton.disabled = activeRequest || state.page >= pageCount;
}

function updateStats() {
  totalCount.textContent = bouquets.length;
  bestsellerCount.textContent = bouquets.filter(b => b.bestseller).length;
  favoriteCount.textContent = bouquets.filter(b => b.favorite).length;
  noPhotoCount.textContent = bouquets.filter(b => !b.photoURL).length;
  newOrdersCount.textContent = orders.filter(order => order.status === 'new').length;
}

function setTableStatus(message, type = 'muted') {
  tableStatus.textContent = message;
  tableStatus.dataset.type = type;
  tableStatus.hidden = !message;
}

function setOrdersStatus(message, type = 'muted') {
  ordersStatus.textContent = message;
  ordersStatus.dataset.type = type;
  ordersStatus.hidden = !message;
}

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatOrderProduct(order) {
  const title = order.productTitle || (order.productId ? `Product #${order.productId}` : 'Not selected');
  const quantity = Number(order.quantity ?? 1);
  const price = order.productPrice ? `$${Number(order.productPrice).toLocaleString('en-US')}` : '';
  return `${title}${quantity > 1 ? ` x${quantity}` : ''}${price ? ` (${price})` : ''}`;
}

function renderOrders() {
  updateStats();

  if (orders.length === 0) {
    setOrdersStatus('No orders yet.');
    ordersTbody.innerHTML = '';
    return;
  }

  setOrdersStatus('');
  ordersTbody.innerHTML = orders.map(order => `
    <tr data-id="${order.id}">
      <td>
        <strong>${escapeHtml(order.name)}</strong>
        <span class="table-subtext">${escapeHtml(order.phone)}</span>
        <span class="table-subtext">${escapeHtml(order.address || 'No address')}</span>
      </td>
      <td>${escapeHtml(formatOrderProduct(order))}</td>
      <td class="cell-message">${escapeHtml(order.message || 'No message')}</td>
      <td>
        <select class="select select--compact order-status-select" data-order-action="status" ${activeRequest ? 'disabled' : ''}>
          <option value="new" ${order.status === 'new' ? 'selected' : ''}>New</option>
          <option value="processed" ${order.status === 'processed' ? 'selected' : ''}>Processed</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>${escapeHtml(formatDate(order.createdAt))}</td>
      <td>
        <button class="btn btn--icon btn--danger" data-order-action="delete" ${activeRequest ? 'disabled' : ''}>Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderTable() {
  updateStats();

  if (isLoading) {
    setTableStatus('Loading bouquets...');
    tbody.innerHTML = '';
    renderPagination(0, 1, 0, 0);
    return;
  }

  const visibleBouquets = getFilteredBouquets();

  if (visibleBouquets.length === 0) {
    const message = bouquets.length === 0
      ? 'No bouquets yet. Add the first one to start filling the catalog.'
      : 'No bouquets match the current search and filters.';
    setTableStatus(message);
    tbody.innerHTML = '';
    renderPagination(0, 1, 0, 0);
    return;
  }

  const page = getPaginatedBouquets(visibleBouquets);
  setTableStatus('');
  renderPagination(visibleBouquets.length, page.pageCount, page.startIndex, page.items.length);
  tbody.innerHTML = page.items.map(b => {
    const title = escapeHtml(b.title);
    const altText = escapeHtml(b.alt || 'No alt text');
    const price = Number(b.price).toLocaleString('en-US');
    const photo = b.photoURL
      ? `<button class="thumb-button" type="button" data-action="preview" aria-label="Preview ${title}">
          <img class="thumb" src="${escapeHtml(b.photoURL)}" alt="${altText}">
        </button>`
      : '<div class="no-photo" aria-label="No photo">No image</div>';

    return `
      <tr data-id="${b.id}">
        <td>${photo}</td>
        <td>
          <strong>${title}</strong>
          <span class="table-subtext">${altText}</span>
        </td>
        <td>$${price}</td>
        <td>${Number(b.orders ?? 0)}</td>
        <td>
          <span class="badge ${b.bestseller ? 'badge--yes' : 'badge--no'}">${b.bestseller ? 'Yes' : 'No'}</span>
        </td>
        <td>
          <span class="badge ${b.favorite ? 'badge--yes' : 'badge--no'}">${b.favorite ? 'Yes' : 'No'}</span>
        </td>
        <td>
          <div class="actions">
            <button class="btn btn--icon btn--outline" data-action="photo" title="Upload photo" aria-label="Upload photo" ${activeRequest ? 'disabled' : ''}>Photo</button>
            <button class="btn btn--icon btn--outline" data-action="edit" title="Edit" aria-label="Edit" ${activeRequest ? 'disabled' : ''}>Edit</button>
            <button class="btn btn--icon btn--danger" data-action="delete" title="Delete" aria-label="Delete" ${activeRequest ? 'disabled' : ''}>Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadBouquets() {
  isLoading = true;
  renderTable();

  try {
    bouquets = await apiFetch(BOUQUETS_API);
    renderTable();
  } catch (error) {
    setTableStatus(error.message, 'error');
    showToast(error.message, 'error');
  } finally {
    isLoading = false;
    renderTable();
  }
}

async function loadOrders() {
  try {
    orders = await apiFetch(ORDERS_API);
    renderOrders();
  } catch (error) {
    setOrdersStatus(error.message, 'error');
    showToast(error.message, 'error');
  }
}

function openModal(bouquet = null) {
  form.reset();
  document.getElementById('field-id').value = bouquet?.id ?? '';
  modalTitle.textContent = bouquet ? 'Edit bouquet' : 'Add bouquet';

  if (bouquet) {
    document.getElementById('field-title').value = bouquet.title ?? '';
    document.getElementById('field-price').value = bouquet.price ?? '';
    document.getElementById('field-slug').value = bouquet.slug ?? '';
    document.getElementById('field-text').value = bouquet.text ?? '';
    document.getElementById('field-description').value = bouquet.description ?? '';
    document.getElementById('field-alt').value = bouquet.alt ?? '';
    document.getElementById('field-orders').value = bouquet.orders ?? 0;
    document.getElementById('field-bestseller').checked = bouquet.bestseller ?? false;
    document.getElementById('field-favorite').checked = bouquet.favorite ?? false;
  }

  document.getElementById('photo-row').hidden = false;
  modalOverlay.classList.remove('hidden');
  document.getElementById('field-title').focus();
}

function closeModal() {
  if (activeRequest) {
    showToast('Please wait until the current operation finishes.', 'error');
    return;
  }
  modalOverlay.classList.add('hidden');
}

function openPhotoPreview(bouquet) {
  if (!bouquet?.photoURL) return;

  photoPreviewImg.src = bouquet.photoURL;
  photoPreviewImg.alt = bouquet.alt ?? bouquet.title ?? '';
  document.getElementById('photo-preview-title').textContent = bouquet.title ?? 'Bouquet photo';
  photoPreviewOverlay.classList.remove('hidden');
}

function closePhotoPreview() {
  photoPreviewOverlay.classList.add('hidden');
  photoPreviewImg.src = '';
  photoPreviewImg.alt = '';
}

function openPhotoUpload(id) {
  if (activeRequest) {
    showToast('Please wait until the current upload finishes.', 'error');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/webp';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('photo', file);

    try {
      setBusy(true, 'Uploading and processing photo. Please wait...');
      setUploadProgress(true, 'Uploading photo');
      showToast('Uploading and processing photo...');
      const updated = await apiFetch(`${BOUQUETS_API}/${id}/photo`, { method: 'PATCH', body: fd });
      bouquets = bouquets.map(b => b.id === updated.id ? updated : b);
      renderTable();
      showToast('Photo updated');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setUploadProgress(false);
      setBusy(false);
      renderTable();
    }
  };
  input.click();
}

async function uploadSelectedPhoto(id) {
  const photoFile = document.getElementById('field-photo').files[0];
  if (!photoFile) return null;

  const fd = new FormData();
  fd.append('photo', photoFile);

  setTableStatus('Uploading and processing photo. Please wait...');
  setUploadProgress(true, 'Processing selected photo');
  return apiFetch(`${BOUQUETS_API}/${id}/photo`, { method: 'PATCH', body: fd });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (activeRequest) {
    showToast('Please wait until the current operation finishes.', 'error');
    return;
  }

  const id = document.getElementById('field-id').value;
  const isNew = !id;
  const submitButton = document.getElementById('btn-submit');

  const body = {
    title: document.getElementById('field-title').value.trim(),
    price: Number(document.getElementById('field-price').value),
    slug: document.getElementById('field-slug').value.trim() || undefined,
    text: document.getElementById('field-text').value.trim() || undefined,
    description: document.getElementById('field-description').value.trim() || undefined,
    alt: document.getElementById('field-alt').value.trim() || undefined,
    orders: Number(document.getElementById('field-orders').value || 0),
    bestseller: document.getElementById('field-bestseller').checked,
    favorite: document.getElementById('field-favorite').checked,
  };

  submitButton.textContent = isNew ? 'Creating...' : 'Saving...';
  setBusy(true, isNew ? 'Creating bouquet...' : 'Saving bouquet...');

  try {
    const hasSelectedPhoto = Boolean(document.getElementById('field-photo').files[0]);

    if (isNew) {
      const created = await apiFetch(BOUQUETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const withPhoto = await uploadSelectedPhoto(created.id);
      if (withPhoto) {
        bouquets = [withPhoto, ...bouquets];
      } else {
        bouquets = [created, ...bouquets];
      }
      showToast(hasSelectedPhoto ? 'Bouquet created with photo' : 'Bouquet created');
    } else {
      let updated = await apiFetch(`${BOUQUETS_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const withPhoto = await uploadSelectedPhoto(id);
      if (withPhoto) updated = withPhoto;

      bouquets = bouquets.map(b => b.id === updated.id ? updated : b);
      showToast(hasSelectedPhoto ? 'Bouquet and photo updated' : 'Bouquet updated');
    }

    setUploadProgress(false);
    setBusy(false);
    closeModal();
    renderTable();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setUploadProgress(false);
    submitButton.textContent = 'Save';
    setBusy(false);
    renderTable();
  }
});

function openDeleteConfirm(id) {
  deleteTarget = id;
  const bouquet = bouquets.find(b => b.id === id);
  document.getElementById('delete-name').textContent = bouquet?.title ?? '';
  deleteOverlay.classList.remove('hidden');
}

document.getElementById('btn-delete-confirm').addEventListener('click', async () => {
  if (!deleteTarget) return;
  if (activeRequest) {
    showToast('Please wait until the current operation finishes.', 'error');
    return;
  }

  try {
    setBusy(true, 'Deleting bouquet...');
    await apiFetch(`${BOUQUETS_API}/${deleteTarget}`, { method: 'DELETE' });
    bouquets = bouquets.filter(b => b.id !== deleteTarget);
    renderTable();
    showToast('Bouquet deleted');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setBusy(false);
    deleteOverlay.classList.add('hidden');
    deleteTarget = null;
    renderTable();
  }
});

tbody.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const id = Number(button.closest('tr').dataset.id);
  const action = button.dataset.action;

  if (action === 'edit') openModal(bouquets.find(b => b.id === id));
  if (action === 'delete') openDeleteConfirm(id);
  if (action === 'photo') openPhotoUpload(id);
  if (action === 'preview') openPhotoPreview(bouquets.find(b => b.id === id));
});

ordersTbody.addEventListener('change', async event => {
  const select = event.target.closest('[data-order-action="status"]');
  if (!select || activeRequest) return;

  const id = Number(select.closest('tr').dataset.id);

  try {
    setBusy(true, 'Updating order status...');
    const updated = await apiFetch(`${ORDERS_API}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: select.value }),
    });
    orders = orders.map(order => order.id === updated.id ? updated : order);
    renderOrders();
    showToast('Order status updated');
  } catch (error) {
    showToast(error.message, 'error');
    renderOrders();
  } finally {
    setBusy(false);
    renderOrders();
  }
});

ordersTbody.addEventListener('click', async event => {
  const button = event.target.closest('[data-order-action="delete"]');
  if (!button || activeRequest) return;

  const id = Number(button.closest('tr').dataset.id);

  try {
    setBusy(true, 'Deleting order...');
    await apiFetch(`${ORDERS_API}/${id}`, { method: 'DELETE' });
    orders = orders.filter(order => order.id !== id);
    renderOrders();
    showToast('Order deleted');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setBusy(false);
    renderOrders();
  }
});

searchInput.addEventListener('input', event => {
  state.query = event.target.value;
  resetBouquetPage();
  renderTable();
});

filterSelect.addEventListener('change', event => {
  state.filter = event.target.value;
  resetBouquetPage();
  renderTable();
});

sortSelect.addEventListener('change', event => {
  state.sort = event.target.value;
  resetBouquetPage();
  renderTable();
});

pagePrevButton.addEventListener('click', () => {
  state.page -= 1;
  renderTable();
});

pageNextButton.addEventListener('click', () => {
  state.page += 1;
  renderTable();
});

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => setActiveTab(button.dataset.tab));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const lastIndex = tabButtons.length - 1;
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;

    tabButtons[nextIndex].focus();
    setActiveTab(tabButtons[nextIndex].dataset.tab);
  });
});

refreshButton.addEventListener('click', () => {
  if (activeTab === 'orders') {
    loadOrders();
    return;
  }

  loadBouquets();
});
document.getElementById('btn-refresh-orders').addEventListener('click', loadOrders);
addButton.addEventListener('click', () => openModal());
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('photo-preview-close').addEventListener('click', closePhotoPreview);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('btn-delete-cancel').addEventListener('click', () => {
  deleteOverlay.classList.add('hidden');
  deleteTarget = null;
});

modalOverlay.addEventListener('click', event => {
  if (activeRequest) return;
  if (event.target === modalOverlay) closeModal();
});

photoPreviewOverlay.addEventListener('click', event => {
  if (event.target === photoPreviewOverlay) closePhotoPreview();
});

window.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (activeRequest) {
    showToast('Please wait until the current operation finishes.', 'error');
    return;
  }
  closePhotoPreview();
  closeModal();
  deleteOverlay.classList.add('hidden');
});

initTheme();
setActiveTab('bouquets');
loadBouquets();
loadOrders();
