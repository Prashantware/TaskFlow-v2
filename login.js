if (Auth.token()) location.href = '/';

const $ = (id) => document.getElementById(id);
const msg = $('msg');
const loginForm = $('login-form');
const regForm = $('register-form');

function show(text) { msg.textContent = text; msg.hidden = !text; }

document.querySelectorAll('.tab').forEach((t) =>
  t.addEventListener('click', () => {
    document.querySelector('.tab.active').classList.remove('active');
    t.classList.add('active');
    const isLogin = t.dataset.tab === 'login';
    loginForm.hidden = !isLogin;
    regForm.hidden = isLogin;
    show('');
  })
);

document.querySelectorAll('input[name=role]').forEach((r) =>
  r.addEventListener('change', () => { $('student-fields').hidden = r.value !== 'student' || !r.checked; })
);

async function submit(url, body) {
  try {
    const data = await api(url, { method: 'POST', body: JSON.stringify(body) });
    Auth.save(data.token, data.user);
    location.href = '/';
  } catch (err) { show(err.message); }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submit('/api/auth/login', { email: $('l-email').value, password: $('l-pass').value });
});

regForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submit('/api/auth/register', {
    role: document.querySelector('input[name=role]:checked').value,
    name: $('r-name').value, email: $('r-email').value, password: $('r-pass').value,
    college: $('r-college').value, course: $('r-course').value, year: $('r-year').value,
  });
});
