let currentEditId = null;
let currentEditType = null;

const modalHTML = `
  <div class="modal fade" id="editModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalTitle"></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="modalBody"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" onclick="salvarEdicao()">Salvar Alterações</button>
        </div>
      </div>
    </div>
  </div>`;

document.body.insertAdjacentHTML('beforeend', modalHTML);
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

function abrirModalEdicao(tipo, item) {
  currentEditType = tipo;
  currentEditId = item.id;

  document.getElementById('modalTitle').textContent = `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;

  let conteudo = '';

  if (tipo === 'consulta') {
    conteudo = `
      <div class="mb-3"><label>Paciente</label><input type="text" id="modalPaciente" class="form-control" value="${item.paciente || ''}"></div>
      <div class="mb-3"><label>Dentista</label><input type="text" id="modalDentista" class="form-control" value="${item.dentista || ''}"></div>
      <div class="row">
        <div class="col-6 mb-3"><label>Data</label><input type="date" id="modalData" class="form-control" value="${item.data || ''}"></div>
        <div class="col-6 mb-3"><label>Hora</label><input type="time" id="modalHora" class="form-control" value="${item.hora || ''}"></div>
      </div>
      <div class="mb-3"><label>Status</label>
        <select id="modalStatus" class="form-select">
          <option value="Agendada" ${item.status === 'Agendada' ? 'selected' : ''}>Agendada</option>
          <option value="Confirmada" ${item.status === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
          <option value="Realizada" ${item.status === 'Realizada' ? 'selected' : ''}>Realizada</option>
          <option value="Cancelada" ${item.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
        </select>
      </div>`;
  } else if (tipo === 'paciente') {
    conteudo = `
      <div class="mb-3"><label>Nome</label><input type="text" id="modalNome" class="form-control" value="${item.nome || ''}"></div>
      <div class="mb-3"><label>CPF</label><input type="text" id="modalCpf" class="form-control" value="${item.cpf || ''}"></div>
      <div class="mb-3"><label>Telefone</label><input type="text" id="modalTelefone" class="form-control" value="${item.telefone || ''}"></div>`;
  } else if (tipo === 'dentista') {
    conteudo = `
      <div class="mb-3"><label>Nome</label><input type="text" id="modalNome" class="form-control" value="${item.nome || ''}"></div>
      <div class="mb-3"><label>CRO</label><input type="text" id="modalCro" class="form-control" value="${item.cro || ''}"></div>
      <div class="mb-3"><label>Especialidade</label><input type="text" id="modalEspecialidade" class="form-control" value="${item.especialidade || ''}"></div>`;
  } else if (tipo === 'estoque') {
    conteudo = `
      <div class="mb-3"><label>Nome do Item</label><input type="text" id="modalNome" class="form-control" value="${item.nome || ''}"></div>
      <div class="mb-3"><label>Quantidade</label><input type="number" id="modalQuantidade" class="form-control" value="${item.quantidade || 0}"></div>
      <div class="mb-3"><label>Estoque Mínimo</label><input type="number" id="modalMinimo" class="form-control" value="${item.minimo || 5}"></div>`;
  }

  document.getElementById('modalBody').innerHTML = conteudo;
  editModal.show();
}

async function salvarEdicao() {
  if (!currentEditType || !currentEditId) return;

  try {
    let body = {};
    const url = `${API_URL}/${currentEditType}s/${currentEditId}`;

    if (currentEditType === 'consulta') {
      body = {
        paciente: document.getElementById('modalPaciente').value.trim(),
        dentista: document.getElementById('modalDentista').value.trim(),
        data: document.getElementById('modalData').value,
        hora: document.getElementById('modalHora').value,
        status: document.getElementById('modalStatus').value
      };
    } else if (currentEditType === 'paciente') {
      body = {
        nome: document.getElementById('modalNome').value.trim(),
        cpf: document.getElementById('modalCpf').value.trim(),
        telefone: document.getElementById('modalTelefone').value.trim()
      };
    } else if (currentEditType === 'dentista') {
      body = {
        nome: document.getElementById('modalNome').value.trim(),
        cro: document.getElementById('modalCro').value.trim(),
        especialidade: document.getElementById('modalEspecialidade').value.trim()
      };
    } else if (currentEditType === 'estoque') {
      body = {
        quantidade: parseInt(document.getElementById('modalQuantidade').value) || 0,
        minimo: parseInt(document.getElementById('modalMinimo').value) || 5
      };
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      showToast(`${currentEditType} atualizado com sucesso!`, 'success');
      // Recarrega a lista da página atual
      const funcName = currentEditType === 'estoque' ? 'initEstoque' : `init${currentEditType.charAt(0).toUpperCase() + currentEditType.slice(1)}s`;
      const initFunc = window[funcName];
      if (typeof initFunc === 'function') initFunc();
    } else {
      const errorData = await res.json();
      showToast(errorData.error || 'Erro ao atualizar', 'danger');
    }

    editModal.hide();
  } catch (err) {
    console.error(err);
    showToast('Erro de conexão', 'danger');
  }
}