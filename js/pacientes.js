async function initPacientes() {
  const tbody = document.getElementById('listaPacientes');
  const form = document.getElementById('formPaciente');

  // Máscaras
  const cpfInput = document.getElementById('cpf');
  const telInput = document.getElementById('telefone');
  if (cpfInput) aplicarMascaraCPF(cpfInput);
  if (telInput) aplicarMascaraTelefone(telInput);

  const carregarPacientes = async () => {
    try {
      const data = await fetchJson(`${API_URL}/pacientes`);
      tbody.innerHTML = data.map(p => `
        <tr>
          <td>${p.nome}</td>
          <td>${p.cpf}</td>
          <td>${p.telefone || '-'}</td>
          <td>
            <button onclick="abrirModalEdicao('paciente', ${JSON.stringify(p)})" 
                    class="btn btn-sm btn-outline-primary me-1">Editar</button>
            <button onclick="excluirPaciente(${p.id})" 
                    class="btn btn-sm btn-outline-danger">Excluir</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  };

  window.excluirPaciente = async (id) => {
    if (confirm('Deseja realmente excluir este paciente?')) {
      await fetchJson(`${API_URL}/pacientes/${id}`, { method: 'DELETE' });
      showToast('Paciente excluído com sucesso!', 'success');
      carregarPacientes();
    }
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const telefone = document.getElementById('telefone').value.trim();

    if (!nome || !cpf) {
      showToast('Nome e CPF são obrigatórios!', 'danger');
      return;
    }

    try {
      await fetchJson(`${API_URL}/pacientes`, {
        method: 'POST',
        body: JSON.stringify({ nome, cpf, telefone })
      });
      showToast('Paciente cadastrado com sucesso!', 'success');
      form.reset();
      carregarPacientes();
    } catch (err) {
      showToast('Erro ao cadastrar paciente', 'danger');
    }
  };

  adicionarFiltroTabela('buscaPaciente', 'listaPacientes');
  carregarPacientes();
}
