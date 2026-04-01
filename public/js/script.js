document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || '';

  // Proteções de login e acesso
  if (typeof bloquearSemLogin === 'function') bloquearSemLogin();
  if (typeof controlarAcesso === 'function') controlarAcesso();

  // Tema
  if (typeof loadSavedTheme === 'function') loadSavedTheme();

  const themeBtn = document.getElementById('btnThemeToggle');
  if (themeBtn && typeof toggleTheme === 'function') {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Inicialização por página
  setTimeout(() => {
    switch (page) {
      case 'index':
        if (typeof initDashboard === 'function') initDashboard();
        break;

      case 'pacientes':
        if (typeof initPacientes === 'function') initPacientes();
        break;

      case 'consultas':
        if (typeof initConsultas === 'function') initConsultas();
        break;

      case 'dentistas':
        if (typeof initDentistas === 'function') initDentistas();
        break;

      case 'estoque':
        if (typeof initEstoque === 'function') initEstoque();
        break;

      case 'financeiro':
        if (typeof initFinanceiro === 'function') initFinanceiro();
        break;

      case 'administrativo':
        if (typeof initAdministrativo === 'function') initAdministrativo();
        break;

      default:
        console.log(`Página "${page}" não possui inicialização específica.`);
    }
  }, 100);
});