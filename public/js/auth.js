const usuariosMock = [
  { 
    id: 1, 
    nome: "Admin", 
    email: "admin@odonto.com", 
    senha: "admin", 
    perfil: "admin" 
  },
  { 
    id: 2, 
    nome: "Recepção", 
    email: "recepcao@odonto.com", 
    senha: "recepcao", 
    perfil: "recepcao" 
  },
  { 
    id: 3, 
    nome: "Dentista", 
    email: "dentista@odonto.com", 
    senha: "dentista", 
    perfil: "dentista" 
  }
];

const salvarUsuarioLogado = (usuario) => {
  localStorage.setItem('odonto_usuario', JSON.stringify(usuario));
};

const obterUsuarioLogado = () => {
  const usuario = localStorage.getItem('odonto_usuario');
  return usuario ? JSON.parse(usuario) : null;
};

const logout = () => {
  localStorage.removeItem('odonto_usuario');
  window.location.href = 'login.html';
};

// Bloqueia acesso sem login
function bloquearSemLogin() {
  const usuarioLogado = obterUsuarioLogado();
  const estaNaLogin = window.location.pathname.includes('login.html');

  if (!usuarioLogado && !estaNaLogin) {
    window.location.href = 'login.html';
  }
}

// Controla visibilidade de elementos admin-only
function controlarAcesso() {
  const usuario = obterUsuarioLogado();
  if (!usuario) return;

  // Mostra nome e perfil no navbar
  const infoUsuario = document.getElementById('infoUsuario');
  if (infoUsuario) {
    infoUsuario.textContent = `${usuario.nome} (${usuario.perfil})`;
  }

  // Esconde elementos restritos a admin
  document.querySelectorAll('.admin-only').forEach(el => {
    if (usuario.perfil !== 'admin') {
      el.style.display = 'none';
    }
  });

  // Bloqueia páginas restritas
  const page = document.body.dataset.page;
  const paginasRestritasAdmin = ['administrativo', 'estoque'];

  if (paginasRestritasAdmin.includes(page) && usuario.perfil !== 'admin') {
    alert('Acesso negado! Apenas administradores podem acessar esta página.');
    window.location.href = 'index.html';
  }
}

// Login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value.trim();

      const usuarioEncontrado = usuariosMock.find(u => 
        u.email === email && u.senha === senha
      );

      if (usuarioEncontrado) {
        salvarUsuarioLogado(usuarioEncontrado);
        showToast(`Bem-vindo, ${usuarioEncontrado.nome}!`, 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      } else {
        const mensagemDiv = document.getElementById('loginMensagem');
        if (mensagemDiv) {
          mensagemDiv.innerHTML = `
            <div class="alert alert-danger">
              E-mail ou senha inválidos. Tente novamente.
            </div>
          `;
        } else {
          showToast('E-mail ou senha inválidos!', 'danger');
        }
      }
    };
  }

  // Executa proteções ao carregar qualquer página
  bloquearSemLogin();
  controlarAcesso();
});