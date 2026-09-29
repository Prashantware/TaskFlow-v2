const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
    category: { type: String, required: true },
    subject: { type: String, trim: true, maxlength: 80, default: '' }, // students only
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
