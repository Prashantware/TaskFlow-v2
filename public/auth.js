// Shared helpers used by every page
const Auth = {
  token: () => localStorage.getItem('token'),
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),
  save(token, user) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); },
  setUser(user) { localStorage.setItem('user', JSON.stringify(user)); },
  logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); location.href = '/login.html'; },
  require() { if (!this.token()) location.href = '/login.html'; },
};

async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token()) headers.Authorization = 'Bearer ' + Auth.token();
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && Auth.token()) Auth.logout();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function initial(name) { return (name || '?').trim().charAt(0).toUpperCase(); }
