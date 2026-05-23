import { get, post, put, del } from '~/services/api';

/**
 * Creates a fully managed admin table with CRUD, search, and modal.
 *
 * @example
 * // brands.astro
 * import { createAdminTable } from '~/utils/adminTable';
 * createAdminTable({
 *   endpoint: 'brands',
 *   tbodyId: 'brands-tbody',
 *   searchEventId: 'brands-tbody',
 *   modalId: 'brand-modal',
 *   formId: 'brand-form',
 *   createBtnId: 'create-brand-btn',
 *   closeBtnId: 'modal-close',
 *   modalTitleId: 'modal-title',
 *   columns: [
 *     { key: 'id' },
 *     { key: 'name', escape: true },
 *     { key: 'logo_url', render: (val) => val ? `<a href="${val}" target="_blank" class="text-blue-600">Link</a>` : '-' },
 *     { key: 'created_at', render: (val) => new Date(val).toLocaleDateString() },
 *   ],
 *   fields: [
 *     { id: 'brand-name', key: 'name', required: true },
 *     { id: 'brand-logo', key: 'logo_url' },
 *   ],
 *   idField: 'brand-id',
 * });
 */

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, (m) => {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

export function createAdminTable({
  endpoint,         // API endpoint e.g. 'brands'
  tbodyId,          // tbody element id
  modalId,          // modal element id
  formId,           // form element id
  createBtnId,      // create button id
  closeBtnId,       // modal close button id
  modalTitleId,     // modal title element id
  idField,          // hidden id input element id
  columns,          // array of { key, escape?, render? }
  fields,           // array of { id, key, required? }
  colSpan,          // number of table columns (auto-calculated if omitted)
}) {
  let currentEditId = null;
  const span = colSpan ?? columns.length + 1; // +1 for actions column

  async function load() {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="${span}" class="text-center py-4">Loading...</td></tr>`;
    try {
      const response = await get(endpoint);
      const items = response.data || [];
      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${span}" class="text-center py-4">No records found.</td></tr>`;
        return;
      }
      tbody.innerHTML = items.map((item) => {
        const cells = columns.map((col) => {
          const val = item[col.key];
          const rendered = col.render
            ? col.render(val, item)
            : col.escape
              ? escapeHtml(val) || '-'
              : val ?? '-';
          return `<td class="border px-4 py-2">${rendered}</td>`;
        });

        // Build data attributes for edit button from all fields
        const dataAttrs = fields
          .map((f) => `data-${f.key}="${escapeHtml(String(item[f.key] ?? ''))}"`)
          .join(' ');

        return `
          <tr>
            ${cells.join('')}
            <td class="border px-4 py-2">
              <button class="edit-btn text-blue-600 mr-2" data-id="${item.id}" ${dataAttrs}>Edit</button>
              <button class="delete-btn text-red-600" data-id="${item.id}">Delete</button>
            </td>
          </tr>
        `;
      }).join('');

      attachEvents();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="${span}" class="text-center py-4 text-red-600">Error: ${err.message}</td></tr>`;
    }
  }

  function attachEvents() {
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const data = { id: btn.getAttribute('data-id') };
        fields.forEach((f) => { data[f.key] = btn.getAttribute(`data-${f.key}`) || ''; });
        openModal(data);
      });
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete this record?`)) {
          try {
            await del(`${endpoint}/${id}`);
            load();
          } catch (err) {
            alert(err.message);
          }
        }
      });
    });
  }

  function openModal(data = {}) {
    currentEditId = data.id || null;
    const idEl = document.getElementById(idField);
    if (idEl) idEl.value = data.id || '';
    fields.forEach((f) => {
      const el = document.getElementById(f.id);
      if (el) el.value = data[f.key] || '';
    });
    const titleEl = document.getElementById(modalTitleId);
    if (titleEl) titleEl.innerText = currentEditId ? `Edit` : `Add`;
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.remove('hidden'); modal.style.display = 'flex'; }
  }

  function closeModal() {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
    const form = document.getElementById(formId);
    if (form) form.reset();
    currentEditId = null;
  }

  function init() {
    document.getElementById(createBtnId)?.addEventListener('click', () => openModal());
    document.getElementById(closeBtnId)?.addEventListener('click', closeModal);

    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const requiredField = fields.find((f) => f.required);
        const payload = {};
        for (const f of fields) {
          const val = document.getElementById(f.id)?.value.trim();
          if (f.required && !val) { alert(`${f.key} is required`); return; }
          payload[f.key] = val || undefined;
        }
        try {
          if (currentEditId) {
            await put(`${endpoint}/${currentEditId}`, payload);
          } else {
            await post(endpoint, payload);
          }
          closeModal();
          load();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    document.addEventListener('admin:search', (e) => {
      const query = e.detail.query.toLowerCase();
      document.querySelectorAll(`#${tbodyId} tr`).forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    });

    load();
  }

  init();
  document.addEventListener('astro:after-swap', init);
}