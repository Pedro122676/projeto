async function initDashboard() {
  const tbody = document.getElementById('dashboardConsultas');
  const saldoEl = document.getElementById('saldoFinanceiro');

  if (!tbody) {
    console.warn('Elemento dashboardConsultas não encontrado');
    return;
  }

  try {
    // Carregar consultas de hoje
    const consultas = await fetchJson(`${API_URL}/consultas`);
    const hoje = new Date().toISOString().split('T')[0];

    const hojeConsultas = consultas
      .filter(c => c.data === hoje)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    if (hojeConsultas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            Nenhuma consulta agendada para hoje
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = hojeConsultas.slice(0, 5).map(c => `
        <tr>
          <td>${c.paciente}</td>
          <td>${c.dentista}</td>
          <td>${c.data}</td>
          <td>${c.hora}</td>
          <td>
            <span class="badge bg-${c.status === 'Realizada' ? 'success' : 
                                 c.status === 'Cancelada' ? 'danger' : 'warning'}">
              ${c.status}
            </span>
          </td>
        </tr>
      `).join('');
    }

    // Calcular saldo financeiro
    if (saldoEl) {
      const financeiro = await fetchJson(`${API_URL}/financeiro`);
      
      let receitas = 0;
      let despesas = 0;

      financeiro.forEach(f => {
        const valor = parseFloat(f.valor) || 0;
        if (f.tipo === 'Receita') receitas += valor;
        else if (f.tipo === 'Despesa') despesas += valor;
      });

      const saldo = receitas - despesas;

      saldoEl.textContent = `R$ ${saldo.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;

      saldoEl.className = `display-6 fw-bold ${saldo >= 0 ? 'text-success' : 'text-danger'}`;
    }

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    showToast('Erro ao carregar dados do dashboard. Verifique se o servidor está rodando.', 'danger');

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger py-4">
            Erro ao carregar consultas. Tente novamente mais tarde.
          </td>
        </tr>`;
    }
  }
}