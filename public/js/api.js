// ============================================================
//  api.js — все запросы к серверу (вместо localStorage)
// ============================================================

const API = (() => {

  async function request(method, url, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
    return data;
  }

  // ── Auth ─────────────────────────────────────────────────
  const getMe       = ()           => request('GET',  '/api/auth/me');
  const register    = (u,e,p)      => request('POST', '/api/auth/register', { username:u, email:e, password:p });
  const login       = (u,p)        => request('POST', '/api/auth/login',    { username:u, password:p });
  const logout      = ()           => request('POST', '/api/auth/logout');

  // ── Users ─────────────────────────────────────────────────
  const updateUser  = (id, data)   => request('PATCH',  `/api/users/${id}`, data);
  const deleteUser  = (id)         => request('DELETE', `/api/users/${id}`);
  const getAllUsers  = ()           => request('GET',    '/api/users');

  // ── Styles ────────────────────────────────────────────────
  const getStyles   = ()           => request('GET',    '/api/styles');
  const addStyle    = (data)       => request('POST',   '/api/styles', data);
  const updateStyle = (id, data)   => request('PATCH',  `/api/styles/${id}`, data);
  const deleteStyle = (id)         => request('DELETE', `/api/styles/${id}`);

  // ── Downloads ─────────────────────────────────────────────
  const trackDownloadUser    = (id) => request('POST', `/api/styles/${id}/download`);
  const trackDownloadBuiltin = ()   => request('POST', `/api/download/builtin`);

  // ── Stats ─────────────────────────────────────────────────
  const getStats = () => request('GET', '/api/stats');

  return {
    getMe, register, login, logout,
    updateUser, deleteUser, getAllUsers,
    getStyles, addStyle, updateStyle, deleteStyle,
    trackDownloadUser, trackDownloadBuiltin,
    getStats
  };
})();
