require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
