async function initEstoque() {
  const tbody = document.getElementById('listaEstoque');
  const form = document.getElementById('formEstoque');

  const carregarEstoque = async () => {
    try {
      const data = await fetchJson(`${API_URL}/estoque`);
      tbody.innerHTML = data.map(item => {
        const statusClass = item.quantidade <= item.minimo ? 'danger' : 'success';
        const statusText = item.quantidade <= item.minimo ? 'Baixo' : 'OK';
        return `
          <tr>
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>${item.minimo}</td>
            <td><span class="badge bg-${statusClass}">${statusText}</span></td>
            <td>
              <button onclick="abrirModalEdicao('estoque', ${JSON.stringify(item)})" 
                      class="btn btn-sm btn-outline-primary me-1">Editar</button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Erro ao carregar estoque:', e);
      showToast('Erro ao carregar estoque', 'danger');
    }
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeItem').value.trim();
    const quantidade = parseInt(document.getElementById('quantidadeItem').value) || 0;
    const minimo = parseInt(document.getElementById('minimoItem').value) || 5;

    if (!nome) {
      showToast('Nome do item é obrigatório!', 'danger');
      return;
    }

    try {
      await fetchJson(`${API_URL}/estoque`, {
        method: 'POST',
        body: JSON.stringify({ nome, quantidade, minimo })
      });

      showToast('Item adicionado ao estoque!', 'success');
      form.reset();
      carregarEstoque();
    } catch (err) {
      showToast('Erro ao adicionar item ao estoque', 'danger');
    }
  };

  adicionarFiltroTabela('buscaEstoque', 'listaEstoque');
  carregarEstoque();
}