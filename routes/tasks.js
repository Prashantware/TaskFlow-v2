const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const CATEGORIES = {
  student: ['Assignment', 'Exam', 'Project', 'Revision'],
  user: ['Personal', 'Work', 'Shopping', 'Bills'],
};
const PRIORITIES = ['low', 'medium', 'high'];

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) =>
    res.status(['CastError', 'ValidationError'].includes(e.name) ? 400 : 500).json({ error: e.message })
  );

router.use(auth); // every task route needs a logged-in user

// Builds a validated update object; returns { error } if something is invalid
function build(body, role) {
  const out = {};
  if (body.title !== undefined) {
    const t = String(body.title).trim();
    if (!t) return { error: 'Title is required' };
    out.title = t.slice(0, 200);
  }
  if (body.category !== undefined) {
    if (!CATEGORIES[role].includes(body.category)) return { error: 'Invalid category for your account type' };
    out.category = body.category;
  }
  if (body.subject !== undefined) out.subject = role === 'student' ? String(body.subject).trim().slice(0, 80) : '';
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) return { error: 'Invalid priority' };
    out.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (!body.dueDate) out.dueDate = null;
    else {
      const d = new Date(body.dueDate);
      if (isNaN(d)) return { error: 'Invalid due date' };
      out.dueDate = d;
    }
  }
  return { out };
}

router.get('/', wrap(async (req, res) => {
  res.json(await Task.find({ user: req.user._id }).sort({ completed: 1, dueDate: 1, createdAt: -1 }));
}));

router.post('/', wrap(async (req, res) => {
  const role = req.user.role;
  const { out, error } = build({ category: CATEGORIES[role][0], ...req.body }, role);
  if (error) return res.status(400).json({ error });
  if (!out.title) return res.status(400).json({ error: 'Title is required' });
  res.status(201).json(await Task.create({ ...out, user: req.user._id }));
}));

router.put('/:id', wrap(async (req, res) => {
  const { out, error } = build(req.body, req.user.role);
  if (error) return res.status(400).json({ error });
  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, out, { new: true });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}));

router.patch('/:id/toggle', wrap(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.completed = !task.completed;
  await task.save();
  res.json(task);
}));

router.delete('/:id', wrap(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted' });
}));

module.exports = router;
