const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('consultorioToken') || '';
let productos = [];

const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const reservaForm = document.getElementById('reservaForm');
const pacienteForm = document.getElementById('pacienteForm');
const medicoForm = document.getElementById('medicoForm');
const consultorioForm = document.getElementById('consultorioForm');
const itemsList = document.getElementById('itemsList');
const reservasList = document.getElementById('reservasList');
const consultorioSelect = document.getElementById('consultorioSelect');
const medicoSelect = document.getElementById('medicoSelect');
const pacienteSelect = document.getElementById('pacienteSelect');

function buildAlert(type, message) {
  const div = document.createElement('div');
  div.className = `alert ${type}`;
  div.textContent = message;
  return div;
}

function setAuthState() {
  const isLogged = Boolean(token);
  loginSection.classList.toggle('hidden', isLogged);
  appSection.classList.toggle('hidden', !isLogged);
  logoutBtn.classList.toggle('hidden', !isLogged);
}

function showMessage(type, message, container = document.body) {
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();
  const alert = buildAlert(type, message);
  container.prepend(alert);
}

function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }
    return data;
  });
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

async function loginUser(event) {
  event.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });

    token = data.token;
    localStorage.setItem('consultorioToken', token);
    setAuthState();
    await loadCatalogos();
    await loadReservas();
    await loadProductos();
  } catch (error) {
    showMessage('error', error.message || 'No se pudo iniciar sesión');
  }
}

function logout() {
  token = '';
  localStorage.removeItem('consultorioToken');
  setAuthState();
}

function addMedicineRow(productosDisponibles = productos) {
  const row = document.createElement('div');
  row.className = 'item-row';

  row.innerHTML = `
    <label>
      Medicamento
      <select class="medicine-select">
        <option value="">Selecciona...</option>
        ${productosDisponibles
          .map(
            (p) =>
              `<option value="${p.id_producto}">${p.nombre_comercial} (${p.nombre_generico || 'Sin genérico'}) - stock ${p.stock_total || 0}</option>`
          )
          .join('')}
      </select>
    </label>
    <label>
      Cantidad
      <input type="number" class="medicine-qty" min="1" value="1" />
    </label>
    <label>
      Obs.
      <input type="text" class="medicine-notes" placeholder="Opcional" />
    </label>
    <button type="button" class="danger remove-btn">Quitar</button>
  `;

  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  itemsList.appendChild(row);
}

async function loadProductos() {
  try {
    const data = await apiFetch('/productos');
    productos = data.data || [];
    const selects = document.querySelectorAll('.medicine-select');
    selects.forEach((select) => {
      const current = select.value;
      select.innerHTML = `
        <option value="">Selecciona...</option>
        ${productos
          .map(
            (p) =>
              `<option value="${p.id_producto}">${p.nombre_comercial} (${p.nombre_generico || 'Sin genérico'}) - stock ${p.stock_total || 0}</option>`
          )
          .join('')}
      `;
      if (current) select.value = current;
    });
  } catch (error) {
    console.error('Error cargando medicamentos', error);
  }
}

async function loadCatalogos() {
  try {
    const data = await apiFetch('/reservas/catalogos');
    const { consultorios = [], medicos = [], pacientes = [] } = data.data || {};

    renderSelect(consultorioSelect, consultorios, 'id_consultorio', 'nombre');
    renderSelect(medicoSelect, medicos, 'id_medico', 'nombre_completo');
    renderSelect(pacienteSelect, pacientes, 'id_paciente', 'nombre_completo');
  } catch (error) {
    showMessage('error', error.message || 'No se pudieron cargar los catálogos');
  }
}

function renderSelect(selectEl, items, valueKey, labelKey) {
  selectEl.innerHTML = '<option value="">Selecciona...</option>' +
    items.map((item) => `<option value="${item[valueKey]}">${item[labelKey]}</option>`).join('');
}

async function loadReservas() {
  try {
    const data = await apiFetch('/reservas');
    const reservas = data.data || [];

    reservasList.innerHTML = '';
    if (!reservas.length) {
      reservasList.innerHTML = '<p>No hay reservas registradas.</p>';
      return;
    }

    reservas.forEach((reserva) => {
      const card = document.createElement('article');
      card.className = 'reserva-card';
      card.innerHTML = `
        <div class="reserva-meta">
          <strong>Reserva #${reserva.id_reserva}</strong>
          <span class="status-badge status-${reserva.estado}">${reserva.estado}</span>
        </div>
        <p><strong>Consultorio:</strong> ${reserva.consultorio_nombre}</p>
        <p><strong>Médico:</strong> ${reserva.medico_nombre}</p>
        <p><strong>Paciente:</strong> ${reserva.paciente_nombre}</p>
        <p><strong>Retiro:</strong> ${formatDateTime(reserva.fecha_hora_retiro)}</p>
      `;
      reservasList.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}

async function createPaciente(event) {
  event.preventDefault();
  const payload = {
    ci: document.getElementById('pacienteCi').value.trim(),
    nombre_completo: document.getElementById('pacienteNombre').value.trim(),
    telefono: document.getElementById('pacienteTelefono').value.trim(),
    email: document.getElementById('pacienteEmail').value.trim(),
    fecha_nacimiento: null,
  };

  try {
    const data = await apiFetch('/reservas/pacientes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showMessage('success', 'Paciente guardado correctamente');
    document.getElementById('pacienteForm').reset();
    await loadCatalogos();
  } catch (error) {
    showMessage('error', error.message || 'No se pudo guardar el paciente');
  }
}

async function createMedico(event) {
  event.preventDefault();
  const payload = {
    nombre_completo: document.getElementById('medicoNombre').value.trim(),
    especialidad: document.getElementById('medicoEspecialidad').value.trim(),
    matricula_profesional: document.getElementById('medicoMatricula').value.trim(),
    telefono: '',
    email: '',
  };

  try {
    await apiFetch('/reservas/medicos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showMessage('success', 'Médico guardado correctamente');
    document.getElementById('medicoForm').reset();
    await loadCatalogos();
  } catch (error) {
    showMessage('error', error.message || 'No se pudo guardar el médico');
  }
}

async function createConsultorio(event) {
  event.preventDefault();
  const payload = {
    nombre: document.getElementById('consultorioNombre').value.trim(),
    direccion: document.getElementById('consultorioDireccion').value.trim(),
    telefono: '',
  };

  try {
    await apiFetch('/reservas/consultorios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showMessage('success', 'Consultorio guardado correctamente');
    document.getElementById('consultorioForm').reset();
    await loadCatalogos();
  } catch (error) {
    showMessage('error', error.message || 'No se pudo guardar el consultorio');
  }
}

async function createReserva(event) {
  event.preventDefault();

  const consultorioId = Number(consultorioSelect.value);
  const medicoId = Number(medicoSelect.value);
  const pacienteId = Number(pacienteSelect.value);
  const fechaRetiro = document.getElementById('fechaRetiro').value;
  const observaciones = document.getElementById('observaciones').value.trim();

  const rows = [...document.querySelectorAll('.item-row')];
  const items = rows.map((row) => {
    const select = row.querySelector('.medicine-select');
    const qty = row.querySelector('.medicine-qty');
    const notes = row.querySelector('.medicine-notes');
    return {
      id_producto: Number(select.value),
      cantidad: Number(qty.value),
      observaciones: notes.value.trim(),
    };
  }).filter((item) => item.id_producto && item.cantidad > 0);

  if (!consultorioId || !medicoId || !pacienteId || !fechaRetiro || !items.length) {
    showMessage('error', 'Debes completar consultorio, médico, paciente, fecha y al menos un medicamento.');
    return;
  }

  try {
    const payload = {
      id_consultorio: consultorioId,
      id_medico: medicoId,
      id_paciente: pacienteId,
      fecha_hora_retiro: new Date(fechaRetiro).toISOString(),
      observaciones,
      items,
    };

    await apiFetch('/reservas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    showMessage('success', 'Reserva creada correctamente.');
    reservaForm.reset();
    itemsList.innerHTML = '';
    addMedicineRow();
    await loadReservas();
  } catch (error) {
    showMessage('error', error.message || 'No se pudo crear la reserva');
  }
}

loginForm.addEventListener('submit', loginUser);
logoutBtn.addEventListener('click', logout);
reservaForm.addEventListener('submit', createReserva);
addItemBtn.addEventListener('click', () => addMedicineRow());
pacienteForm.addEventListener('submit', createPaciente);
medicoForm.addEventListener('submit', createMedico);
consultorioForm.addEventListener('submit', createConsultorio);

setAuthState();
if (token) {
  loadCatalogos();
  loadReservas();
  loadProductos();
} else {
  addMedicineRow();
}
