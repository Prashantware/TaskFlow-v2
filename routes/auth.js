const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = (u) => { const o = u.toObject(); delete o.password; return o; };
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(e.name === 'ValidationError' ? 400 : 500).json({ error: e.message }));
const str = (v, max) => String(v ?? '').trim().slice(0, max);

// REGISTER
router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role, college, course, year } = req.body;
  if (!str(name, 60)) return res.status(400).json({ error: 'Name is required' });
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ error: 'Enter a valid email' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!['student', 'user'].includes(role)) return res.status(400).json({ error: 'Choose Student or User' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email already registered' });

  const user = await User.create({
    name: str(name, 60), email, role,
    password: await bcrypt.hash(password, 10),
    college: role === 'student' ? str(college, 80) : '',
    course: role === 'student' ? str(course, 80) : '',
    year: role === 'student' ? str(year, 20) : '',
  });
  res.status(201).json({ token: sign(user), user: safe(user) });
}));

// LOGIN
router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: sign(user), user: safe(user) });
}));

// GET PROFILE
router.get('/me', auth, (req, res) => res.json(req.user));

// UPDATE PROFILE (role and email cannot be changed)
router.put('/me', auth, wrap(async (req, res) => {
  const b = req.body;
  const u = req.user;
  if (b.name !== undefined) { if (!str(b.name, 60)) return res.status(400).json({ error: 'Name is required' }); u.name = str(b.name, 60); }
  if (b.bio !== undefined) u.bio = str(b.bio, 200);
  if (b.phone !== undefined) u.phone = str(b.phone, 20);
  if (u.role === 'student') {
    if (b.college !== undefined) u.college = str(b.college, 80);
    if (b.course !== undefined) u.course = str(b.course, 80);
    if (b.year !== undefined) u.year = str(b.year, 20);
  }
  await u.save();
  res.json(u);
}));

// CHANGE PASSWORD
router.put('/me/password', auth, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  const full = await User.findById(req.user._id);
  if (!(await bcrypt.compare(currentPassword || '', full.password))) return res.status(401).json({ error: 'Current password is wrong' });
  full.password = await bcrypt.hash(newPassword, 10);
  await full.save();
  res.json({ message: 'Password updated' });
}));

module.exports = router;
