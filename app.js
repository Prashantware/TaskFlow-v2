Auth.require();
const user = Auth.user();
const CATS = {
  student: ['Assignment', 'Exam', 'Project', 'Revision'],
  user: ['Personal', 'Work', 'Shopping', 'Bills'],
};
const $ = (id) => document.getElementById(id);
const list = $('task-list');
let tasks = [];
let filter = 'all';

// ---- header / role-based form ----
$('avatar').textContent = initial(user.name);
$('uname').textContent = user.name;
$('urole').textContent = user.role;
$('urole').classList.toggle('student', user.role === 'student');
$('greeting').textContent = user.role === 'student'
  ? `Hi ${user.name.split(' ')[0]}, keep your assignments and exams on track 🎓`
  : `Hi ${user.name.split(' ')[0]}, here is your to-do list for today`;
CATS[user.role].forEach((c) => $('t-category').add(new Option(c, c)));
$('t-subject').hidden = user.role !== 'student';
$('logout').onclick = () => Auth.logout();

function showError(m) { $('error').textContent = m; $('error').hidden = !m; }
async function call(url, opts) {
  try { const d = await api(url, opts); showError(''); return d; }
  catch (e) { showError(e.message); throw e; }
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function badge(text, cls) {
  const b = document.createElement('span');
  b.className = 'badge ' + cls;
  b.textContent = text;
  return b;
}

function render() {
  const visible = tasks.filter((t) => filter === 'all' || (filter === 'done' ? t.completed : !t.completed));
  list.innerHTML = '';
  visible.forEach((t) => list.appendChild(createItem(t)));
  $('empty').hidden = visible.length > 0;
  $('counter').textContent = `${tasks.filter((t) => !t.completed).length} of ${tasks.length} left`;
}

function createItem(task) {
  const li = document.createElement('li');
  li.className = `task p-${task.priority}` + (task.completed ? ' done' : '');

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = task.completed;
  check.onchange = async () => { Object.assign(task, await call(`/api/tasks/${task._id}/toggle`, { method: 'PATCH' })); render(); };

  const body = document.createElement('div');
  body.className = 'body';
  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(badge(task.category, 'cat'));
  if (task.subject) meta.append(badge('📘 ' + task.subject, 'subject'));
  meta.append(badge(task.priority, task.priority));
  if (task.dueDate) {
    const d = task.dueDate.slice(0, 10);
    meta.append(badge('Due ' + d, 'due' + (!task.completed && d < today() ? ' overdue' : '')));
  }
  body.append(title, meta);

  const edit = document.createElement('button');
  edit.className = 'icon-btn edit-btn';
  edit.textContent = 'Edit';
  edit.onclick = () => startEdit(li, task, body, edit);

  const del = document.createElement('button');
  del.className = 'icon-btn del-btn';
  del.textContent = 'Delete';
  del.onclick = async () => {
    await call(`/api/tasks/${task._id}`, { method: 'DELETE' });
    tasks = tasks.filter((t) => t._id !== task._id);
    render();
  };

  li.append(check, body, edit, del);
  return li;
}

function startEdit(li, task, body, editBtn) {
  const row = document.createElement('div');
  row.className = 'edit-row';
  const t = document.createElement('input');
  t.value = task.title; t.maxLength = 200;
  const d = document.createElement('input');
  d.type = 'date'; d.value = task.dueDate ? task.dueDate.slice(0, 10) : '';
  d.style.maxWidth = '150px';
  row.append(t, d);
  body.replaceChildren(row);
  t.focus();
  editBtn.textContent = 'Save';
  const save = async () => {
    if (!t.value.trim()) return render();
    Object.assign(task, await call(`/api/tasks/${task._id}`, { method: 'PUT', body: JSON.stringify({ title: t.value, dueDate: d.value }) }));
    render();
  };
  editBtn.onclick = save;
  t.onkeydown = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') render(); };
}

$('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const created = await call('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: $('t-title').value, category: $('t-category').value, priority: $('t-priority').value,
      subject: $('t-subject').value, dueDate: $('t-due').value,
    }),
  });
  tasks.unshift(created);
  e.target.reset();
  render();
});

document.querySelectorAll('.filter').forEach((b) => b.addEventListener('click', () => {
  document.querySelector('.filter.active').classList.remove('active');
  b.classList.add('active');
  filter = b.dataset.filter;
  render();
}));

call('/api/tasks').then((data) => { tasks = data; render(); });
