async function initFinanceiro() {
  const tbody = document.getElementById('listaFinanceiro');
  const form = document.getElementById('formFinanceiro');

  const carregarFinanceiro = async () => {
    try {
      const data = await fetchJson(`${API_URL}/financeiro`);
      tbody.innerHTML = data.map(f => {
        const data_formatada = f.data ? new Date(f.data).toLocaleDateString('pt-BR') : '-';
        return `
          <tr style="height: auto;">
            <td class="ps-4">
              <span class="badge bg-${f.tipo === 'Receita' ? 'success' : 'danger'} fs-6 px-3 py-2">
                ${f.tipo}
              </span>
            </td>
            <td class="ps-4 fw-500">
              ${f.descricao}
            </td>
            <td class="ps-4 text-end pe-4">
              <span class="${f.tipo === 'Receita' ? 'text-success' : 'text-danger'} fw-bold" style="font-size: 1.1rem;">
                ${f.tipo === 'Receita' ? '+' : '-'} R$ ${parseFloat(f.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </td>
            <td class="ps-4 text-muted">
              ${data_formatada}
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Erro ao carregar financeiro:', e);
    }
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const tipo = document.getElementById('tipoFinanceiro').value;
    const descricao = document.getElementById('descricaoFinanceiro').value.trim();
    const valor = parseFloat(document.getElementById('valorFinanceiro').value);

    if (!descricao || isNaN(valor) || valor <= 0) {
      showToast('Descrição e valor válido são obrigatórios!', 'danger');
      return;
    }

    try {
      await fetchJson(`${API_URL}/financeiro`, {
        method: 'POST',
        body: JSON.stringify({ tipo, descricao, valor })
      });

      showToast('Movimentação registrada com sucesso!', 'success');
      form.reset();
      carregarFinanceiro();
    } catch (err) {
      showToast('Erro ao registrar movimentação', 'danger');
    }
  };

  adicionarFiltroTabela('buscaFinanceiro', 'listaFinanceiro');
  carregarFinanceiro();
}