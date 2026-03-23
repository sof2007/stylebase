// auth-modal.js
const AuthModal = (() => {
  function switchTab(t) {
    document.getElementById('auth-login').style.display    = t==='login' ? '' : 'none';
    document.getElementById('auth-register').style.display = t==='register' ? '' : 'none';
    document.getElementById('tab-login').classList.toggle('active', t==='login');
    document.getElementById('tab-register').classList.toggle('active', t==='register');
    document.getElementById('auth-modal-title').textContent = t==='login' ? 'Вход' : 'Регистрация';
  }

  async function doLogin() {
    const un  = document.getElementById('login-username').value.trim();
    const pw  = document.getElementById('login-password').value;
    const err = document.getElementById('login-err');
    try {
      const { user } = await API.login(un, pw);
      err.classList.remove('show');
      UI.closeModal('auth-modal');
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
      await App.afterLogin(user);
      UI.toast('✓', `Добро пожаловать, ${user.username}!`);
    } catch(e) {
      err.textContent = e.message; err.classList.add('show');
    }
  }

  async function doRegister() {
    const un  = document.getElementById('reg-username').value.trim();
    const em  = document.getElementById('reg-email').value.trim();
    const pw  = document.getElementById('reg-password').value;
    const pw2 = document.getElementById('reg-password2').value;
    const err = document.getElementById('reg-err');
    if (pw !== pw2) { err.textContent='Пароли не совпадают'; err.classList.add('show'); return; }
    try {
      const { user } = await API.register(un, em, pw);
      err.classList.remove('show');
      UI.closeModal('auth-modal');
      await App.afterLogin(user);
      UI.toast('✓', `Аккаунт создан! Добро пожаловать, ${user.username}!`);
    } catch(e) {
      err.textContent = e.message; err.classList.add('show');
    }
  }

  return { switchTab, doLogin, doRegister };
})();
