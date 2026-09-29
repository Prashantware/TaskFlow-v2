Auth.require();
const $ = (id) => document.getElementById(id);
$('logout').onclick = () => Auth.logout();

function flash(el, text, ok) {
  el.textContent = text; el.className = ok ? 'success' : 'error'; el.hidden = false;
}

function fill(u) {
  $('avatar').textContent = initial(u.name);
  $('pname').textContent = u.name;
  $('pemail').textContent = u.email + (u.phone ? '  ·  ' + u.phone : '');
  $('prole').textContent = u.role;
  $('prole').classList.toggle('student', u.role === 'student');
  const extra = u.role === 'student' ? [u.course, u.year, u.college].filter(Boolean).join(' · ') : '';
  $('pbio').textContent = [u.bio, extra].filter(Boolean).join(' — ');
  $('f-name').value = u.name; $('f-phone').value = u.phone || ''; $('f-bio').value = u.bio || '';
  $('student-fields').hidden = u.role !== 'student';
  if (u.role === 'student') { $('f-college').value = u.college || ''; $('f-course').value = u.course || ''; $('f-year').value = u.year || ''; }
}

async function init() {
  const u = await api('/api/auth/me');
  Auth.setUser(u);
  fill(u);
  const tasks = await api('/api/tasks');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const done = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate.slice(0, 10) < today).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  $('s-total').textContent = tasks.length; $('s-done').textContent = done;
  $('s-pending').textContent = tasks.length - done; $('s-overdue').textContent = overdue;
  $('bar').style.width = pct + '%'; $('s-pct').textContent = pct + '% completed';
}

$('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const u = await api('/api/auth/me', { method: 'PUT', body: JSON.stringify({
      name: $('f-name').value, phone: $('f-phone').value, bio: $('f-bio').value,
      college: $('f-college').value, course: $('f-course').value, year: $('f-year').value,
    }) });
    Auth.setUser(u); fill(u); flash($('p-msg'), 'Profile saved ✓', true);
  } catch (err) { flash($('p-msg'), err.message, false); }
});

$('pass-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/api/auth/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword: $('c-pass').value, newPassword: $('n-pass').value }) });
    e.target.reset(); flash($('w-msg'), 'Password updated ✓', true);
  } catch (err) { flash($('w-msg'), err.message, false); }
});

init();
