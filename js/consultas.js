async function initConsultas() {
  const tbody = document.getElementById('listaConsultas');
  const form = document.getElementById('formConsulta');

  const carregarConsultas = async () => {
    try {
      const data = await fetchJson(`${API_URL}/consultas`);
      tbody.innerHTML = data.map(c => `
        <tr>
          <td>${c.paciente}</td>
          <td>${c.dentista}</td>
          <td>${c.data}</td>
          <td>${c.hora}</td>
          <td><span class="badge bg-${c.status === 'Realizada' ? 'success' : c.status === 'Cancelada' ? 'danger' : 'warning'}">${c.status}</span></td>
          <td>
            <button onclick="abrirModalEdicao('consulta', ${JSON.stringify(c)})" 
                    class="btn btn-sm btn-outline-primary me-1">Editar</button>
            <button onclick="marcarRealizada(${c.id})" 
                    class="btn btn-sm btn-success me-1">✓ Realizada</button>
            <button onclick="excluirConsulta(${c.id})" 
                    class="btn btn-sm btn-outline-danger">Excluir</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  };

  window.marcarRealizada = async (id) => {
    if (confirm('Marcar consulta como Realizada?')) {
      await fetchJson(`${API_URL}/consultas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Realizada' })
      });
      showToast('Consulta marcada como realizada!', 'success');
      carregarConsultas();
    }
  };

  window.excluirConsulta = async (id) => {
    if (confirm('Excluir esta consulta?')) {
      await fetchJson(`${API_URL}/consultas/${id}`, { method: 'DELETE' });
      showToast('Consulta excluída!', 'success');
      carregarConsultas();
    }
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const paciente = document.getElementById('pacienteConsulta').value.trim();
    const dentista = document.getElementById('dentistaConsulta').value.trim();
    const data = document.getElementById('dataConsulta').value;
    const hora = document.getElementById('horaConsulta').value;
    const status = document.getElementById('statusConsulta').value;

    if (new Date(data) < new Date().setHours(0, 0, 0, 0)) {
      showToast('A data não pode ser no passado!', 'danger');
      return;
    }

    await fetchJson(`${API_URL}/consultas`, {
      method: 'POST',
      body: JSON.stringify({ paciente, dentista, data, hora, status })
    });

    showToast('Consulta agendada com sucesso!', 'success');
    form.reset();
    carregarConsultas();
  };

  adicionarFiltroTabela('buscaConsulta', 'listaConsultas');
  carregarConsultas();
}