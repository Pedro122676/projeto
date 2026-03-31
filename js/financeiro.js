async function initFinanceiro() {
  const tbody = document.getElementById('listaFinanceiro');
  const form = document.getElementById('formFinanceiro');

  const carregarFinanceiro = async () => {
    try {
      const data = await fetchJson(`${API_URL}/financeiro`);
      tbody.innerHTML = data.map(f => `
        <tr>
          <td><span class="badge bg-${f.tipo === 'Receita' ? 'success' : 'danger'}">${f.tipo}</span></td>
          <td>${f.descricao}</td>
          <td class="${f.tipo === 'Receita' ? 'text-success' : 'text-danger'} fw-bold">
            R$ ${parseFloat(f.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </td>
          <td>${f.data || '-'}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const tipo = document.getElementById('tipoFinanceiro').value;
    const descricao = document.getElementById('descricaoFinanceiro').value.trim();
    const valor = parseFloat(document.getElementById('valorFinanceiro').value);

    if (!descricao || isNaN(valor)) {
      showToast('Descrição e valor são obrigatórios!', 'danger');
      return;
    }

    await fetchJson(`${API_URL}/financeiro`, {
      method: 'POST',
      body: JSON.stringify({ tipo, descricao, valor })
    });

    showToast('Movimentação registrada com sucesso!', 'success');
    form.reset();
    carregarFinanceiro();
  };

  adicionarFiltroTabela('buscaFinanceiro', 'listaFinanceiro');
  carregarFinanceiro();
}