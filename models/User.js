const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'user'], default: 'user' },
    bio: { type: String, trim: true, maxlength: 200, default: '' },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    // student-only details
    college: { type: String, trim: true, maxlength: 80, default: '' },
    course: { type: String, trim: true, maxlength: 80, default: '' },
    year: { type: String, trim: true, maxlength: 20, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
