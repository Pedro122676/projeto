// Gráficos do Dashboard
let chartReceitas = null;
let chartStatus = null;

async function initCharts() {
  try {
    // Carregar dados financeiros
    const financeiro = await fetchJson(`${API_URL}/financeiro`);
    
    // Separar receitas por semana e mês
    const hoje = new Date();
    const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    // Últimas 7 dias
    const ultimos7Dias = {};
    for (let i = 6; i >= 0; i--) {
      const data = new Date(dataHoje);
      data.setDate(data.getDate() - i);
      const chave = data.toLocaleDateString('pt-BR', { weekday: 'short' });
      ultimos7Dias[chave] = { receita: 0, despesa: 0 };
    }

    financeiro.forEach(f => {
      const fData = new Date(f.data);
      if (fData >= new Date(dataHoje.getTime() - 7*24*60*60*1000)) {
        const chave = fData.toLocaleDateString('pt-BR', { weekday: 'short' });
        if (ultimos7Dias[chave]) {
          const valor = parseFloat(f.valor) || 0;
          if (f.tipo === 'Receita') ultimos7Dias[chave].receita += valor;
          else ultimos7Dias[chave].despesa += valor;
        }
      }
    });

    // Gráfico de receitas/despesas
    if (document.getElementById('chartReceitasDespesas')) {
      const ctx = document.getElementById('chartReceitasDespesas').getContext('2d');
      
      if (chartReceitas) chartReceitas.destroy();
      
      chartReceitas = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(ultimos7Dias),
          datasets: [
            {
              label: 'Receitas',
              data: Object.values(ultimos7Dias).map(d => d.receita),
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Despesas',
              data: Object.values(ultimos7Dias).map(d => d.despesa),
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return 'R$ ' + value.toLocaleString('pt-BR', {maximumFractionDigits: 0});
                }
              }
            }
          }
        }
      });
    }

    // Gráfico de status de consultas
    const consultas = await fetchJson(`${API_URL}/consultas`);
    const statusCount = {};
    consultas.forEach(c => {
      statusCount[c.status] = (statusCount[c.status] || 0) + 1;
    });

    if (document.getElementById('chartStatus')) {
      const ctxStatus = document.getElementById('chartStatus').getContext('2d');
      
      if (chartStatus) chartStatus.destroy();
      
      chartStatus = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCount),
          datasets: [{
            data: Object.values(statusCount),
            backgroundColor: [
              '#ffc107', // Agendada - amarelo
              '#17a2b8', // Confirmada - azul
              '#28a745', // Realizada - verde
              '#dc3545'  // Cancelada - vermelho
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

  } catch (err) {
    console.error('Erro ao carregar gráficos:', err);
  }
}

// Chamar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'index') {
    setTimeout(() => {
      initCharts();
    }, 500);
  }
});
