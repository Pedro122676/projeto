const API_URL = 'http://localhost:3000/api';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(errorText || `Erro ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    showToast(err.message || 'Erro de conexão com o servidor', 'danger');
    throw err;
  }
}

function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container') || document.body;
  const toastHTML = `
    <div class="toast align-items-center text-white bg-${type}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
  
  container.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = container.lastElementChild;
  const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
  toast.show();

  setTimeout(() => toastEl?.remove(), 6000);
}

function aplicarMascaraCPF(input) {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v.substring(0, 14);
  });
}

function aplicarMascaraTelefone(input) {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 10) {
      v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    e.target.value = v.substring(0, 15);
  });
}

function adicionarFiltroTabela(inputId, tableBodyId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('keyup', () => {
    const filter = input.value.toUpperCase();
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    const rows = tbody.getElementsByTagName('tr');
    for (let row of rows) {
      row.style.display = row.textContent.toUpperCase().includes(filter) ? '' : 'none';
    }
  });
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('btnThemeToggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? '☀️' : '🌙';
}

function loadSavedTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButton();
}