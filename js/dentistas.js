async function initDentistas() {
  const tbody = document.getElementById('listaDentistas');
  const form = document.getElementById('formDentista');

  const carregarDentistas = async () => {
    try {
      const data = await fetchJson(`${API_URL}/dentistas`);
      tbody.innerHTML = data.map(d => `
        <tr>
          <td>${d.nome}</td>
          <td>${d.cro}</td>
          <td>${d.especialidade || '-'}</td>
          <td>
            <button onclick="abrirModalEdicao('dentista', ${JSON.stringify(d)})" 
                    class="btn btn-sm btn-outline-primary me-1">Editar</button>
            <button onclick="excluirDentista(${d.id})" 
                    class="btn btn-sm btn-outline-danger">Excluir</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Erro ao carregar dentistas:', e);
      showToast('Erro ao carregar lista de dentistas', 'danger');
    }
  };

  window.excluirDentista = async (id) => {
    if (confirm('Deseja realmente excluir este dentista?')) {
      try {
        await fetchJson(`${API_URL}/dentistas/${id}`, { method: 'DELETE' });
        showToast('Dentista excluído com sucesso!', 'success');
        carregarDentistas();
      } catch (err) {
        showToast('Erro ao excluir dentista', 'danger');
      }
    }
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nomeDentista').value.trim();
    const cro = document.getElementById('croDentista').value.trim();
    const especialidade = document.getElementById('especialidade').value.trim();

    if (!nome || !cro) {
      showToast('Nome e CRO são obrigatórios!', 'danger');
      return;
    }

    try {
      await fetchJson(`${API_URL}/dentistas`, {
        method: 'POST',
        body: JSON.stringify({ nome, cro, especialidade })
      });

      showToast('Dentista cadastrado com sucesso!', 'success');
      form.reset();
      carregarDentistas();
    } catch (err) {
      showToast('Erro ao cadastrar dentista. Verifique se o CRO já existe.', 'danger');
    }
  };

  adicionarFiltroTabela('buscaDentista', 'listaDentistas');

  carregarDentistas();
}