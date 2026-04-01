async function initAdministrativo() {
  try {
    const stats = await fetchJson(`${API_URL}/stats`);

    document.getElementById('adminPacientes').textContent = stats.totalPacientes || 0;
    document.getElementById('adminDentistas').textContent = stats.totalDentistas || 0;
    document.getElementById('adminConsultas').textContent = stats.totalConsultas || 0;
    document.getElementById('adminEstoque').textContent = stats.totalEstoque || 0;

    // Consultas por status
    const listaStatus = document.getElementById('listaStatusAdmin');
    listaStatus.innerHTML = stats.consultasPorStatus.map(s => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${s.status}</span>
        <span class="badge bg-primary">${s.quantidade}</span>
      </li>
    `).join('');

    // Alertas de estoque baixo
    const listaBaixo = document.getElementById('listaEstoqueBaixoAdmin');
    if (stats.estoqueBaixo.length === 0) {
      listaBaixo.innerHTML = `<li class="list-group-item text-success">✅ Nenhum alerta de estoque baixo</li>`;
    } else {
      listaBaixo.innerHTML = stats.estoqueBaixo.map(item => `
        <li class="list-group-item text-danger">
          <strong>${item.nome}</strong> — ${item.quantidade} / mínimo ${item.minimo}
        </li>
      `).join('');
    }
  } catch (err) {
    console.error('Erro ao carregar estatísticas administrativas:', err);
    showToast('Erro ao carregar dados administrativos', 'danger');
  }
}