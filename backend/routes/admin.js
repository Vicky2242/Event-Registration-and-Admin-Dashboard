// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Create this model for admin

// Admin Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new Admin({ email, password: hashedPassword });
  await newAdmin.save();
  res.status(201).json({ message: 'Admin created successfully!' });
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  
  if (admin && (await bcrypt.compare(password, admin.password))) {
    const token = jwt.sign({ id: admin._id }, 'your_jwt_secret'); // Use your secret
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
