// ============================================================
//  app.js — точка входа, async инициализация
// ============================================================

const App = (() => {

  let _currentUser = null;

  async function init() {
    try {
      const { user } = await API.getMe();
      _currentUser = user;
    } catch { _currentUser = null; }

    UI.renderHeader(_currentUser);
    await Catalog.renderAll();
    await _updateStats();
    Upload.initDrop();
  }

  function currentUser() { return _currentUser; }
  function isAdmin()     { return _currentUser && _currentUser.role === 'admin'; }

  async function _updateStats() {
    try {
      const s = await API.getStats();
      document.getElementById('cnt-user').textContent = s.stylesCount;
      document.getElementById('cnt-dl').textContent   = s.totalDownloads;
    } catch {}
  }

  function showProfile()  { Profile.render(_currentUser); UI.showPage('profile'); }
  function openUpload()   { Upload.openNew(); }

  async function navigate(page) {
    if (page === 'profile') { Profile.render(_currentUser); }
    if (page === 'admin')   { await Admin.render(); }
    if (page === 'catalog') { await Catalog.renderAll(); }
    UI.showPage(page);
  }

  async function afterLogin(user) {
    _currentUser = user;
    UI.renderHeader(user);
    await Catalog.renderAll();
  }

  async function afterLogout() {
    _currentUser = null;
    UI.renderHeader(null);
    await Catalog.renderAll();
    UI.showPage('catalog');
  }

  async function refreshStats() { await _updateStats(); }

  return { init, currentUser, isAdmin, showProfile, openUpload, navigate,
           afterLogin, afterLogout, refreshStats };
})();

document.addEventListener('DOMContentLoaded', App.init);
