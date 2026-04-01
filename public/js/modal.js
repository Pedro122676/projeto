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
    conteudo = `...` ; // mantenha o conteúdo que você já tinha
  } else if (tipo === 'paciente') {
    conteudo = `
      <div class="mb-3"><label>Nome</label><input type="text" id="modalNome" class="form-control" value="${item.nome || ''}"></div>
      <div class="mb-3"><label>CPF</label><input type="text" id="modalCpf" class="form-control" value="${item.cpf || ''}"></div>
      <div class="mb-3"><label>Telefone</label><input type="text" id="modalTelefone" class="form-control" value="${item.telefone || ''}"></div>`;
  } 
  // ... faça o mesmo para dentista e estoque

  document.getElementById('modalBody').innerHTML = conteudo;
  editModal.show();
}

async function salvarEdicao() {
  if (!currentEditType || !currentEditId) return;

  try {
    let body = {};
    const url = `${API_URL}/${currentEditType}s/${currentEditId}`;

    // Preencha o body conforme o tipo (igual ao que você tinha)

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      showToast(`${currentEditType} atualizado com sucesso!`, 'success');
      // Recarrega a lista da página atual
      const initFunc = window[`init${currentEditType.charAt(0).toUpperCase() + currentEditType.slice(1)}s`];
      if (typeof initFunc === 'function') initFunc();
    } else {
      showToast('Erro ao atualizar', 'danger');
    }

    editModal.hide();
  } catch (err) {
    console.error(err);
    showToast('Erro de conexão', 'danger');
  }
}