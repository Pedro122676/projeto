async function initDashboard() {
  const tbody = document.getElementById('dashboardConsultas');
  const saldoEl = document.getElementById('saldoFinanceiro');

  if (!tbody) {
    console.warn('Elemento dashboardConsultas não encontrado');
    return;
  }

  try {
    // Carregar consultas próximas (não só de hoje)
    const consultas = await fetchJson(`${API_URL}/consultas`);
    const hoje = new Date();
    
    const proximasConsultas = consultas
      .filter(c => new Date(c.data) >= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()))
      .sort((a, b) => {
        const dateA = new Date(a.data + ' ' + a.hora);
        const dateB = new Date(b.data + ' ' + b.hora);
        return dateA - dateB;
      });

    if (proximasConsultas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            <span>📅 Nenhuma consulta agendada</span><br>
            <small><a href="consultas.html" class="text-decoration-none">Clique para agendar uma</a></small>
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = proximasConsultas.slice(0, 5).map(c => `
        <tr>
          <td>${c.paciente}</td>
          <td>${c.dentista}</td>
          <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
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

    // Calcular saldo financeiro e gráficos
    if (saldoEl) {
      const financeiro = await fetchJson(`${API_URL}/financeiro`);
      
      let receitas = 0;
      let despesas = 0;
      let receitasHoje = 0;
      let receitaSemanal = 0;
      let receitaMensal = 0;

      const hoje_date = new Date();
      const dataHoje = hoje_date.toISOString().split('T')[0];
      const dataUmaSemana = new Date(hoje_date.getTime() - 7*24*60*60*1000).toISOString().split('T')[0];
      const dataMes = new Date(hoje_date.getFullYear(), hoje_date.getMonth(), 1).toISOString().split('T')[0];

      financeiro.forEach(f => {
        const valor = parseFloat(f.valor) || 0;
        if (f.tipo === 'Receita') {
          receitas += valor;
          if (f.data === dataHoje) receitasHoje += valor;
          if (f.data >= dataUmaSemana) receitaSemanal += valor;
          if (f.data >= dataMes) receitaMensal += valor;
        } else if (f.tipo === 'Despesa') {
          despesas += valor;
        }
      });

      const saldo = receitas - despesas;

      saldoEl.textContent = `R$ ${saldo.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;

      saldoEl.className = `display-6 fw-bold ${saldo >= 0 ? 'text-success' : 'text-danger'}`;

      // Atualizar cards de metas
      const metaHoje = 5000; // R$ 5000 por dia
      const metaSemanal = 30000; // R$ 30000 por semana
      const metaMensal = 120000; // R$ 120000 por mês

      const percHoje = ((receitasHoje / metaHoje) * 100).toFixed(1);
      const percSemanal = ((receitaSemanal / metaSemanal) * 100).toFixed(1);
      const percMensal = ((receitaMensal / metaMensal) * 100).toFixed(1);

      const updateMeta = (elId, valor, meta, perc) => {
        const el = document.getElementById(elId);
        if (el) {
          el.innerHTML = `
            <div class="mb-2">
              <strong class="text-success">R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
              <small class="d-block text-muted">de R$ ${meta.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</small>
            </div>
            <div class="progress" style="height: 12px;">
              <div class="progress-bar ${perc >= 100 ? 'bg-success' : perc >= 50 ? 'bg-warning' : 'bg-danger'}" style="width: ${Math.min(perc, 100)}%"></div>
            </div>
            <small class="text-muted d-block mt-2">${Math.round(perc)}% atingido</small>
          `;
        } else {
          console.warn(`Elemento #${elId} não encontrado`);
        }
      };

      updateMeta('metaHoje', receitasHoje, metaHoje, percHoje);
      updateMeta('metaSemanal', receitaSemanal, metaSemanal, percSemanal);
      updateMeta('metaMensal', receitaMensal, metaMensal, percMensal);
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