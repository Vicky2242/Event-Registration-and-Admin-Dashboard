const express = require('express');
const EventRegistration = require('../models/EventRegistration');
const router = express.Router();

// Register for an event
router.post('/', async (req, res) => {  // '/api/register-event' should be in app.js
  const { name, email, dob, gender, event, price, payment_id, order_id, paymentStatus } = req.body;

  if (!name || !email || !dob || !gender || !event || price === undefined || !paymentStatus || !payment_id || !order_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newRegistration = new EventRegistration({
      name,
      email,
      dob,
      gender,
      event,
      price,
      paymentStatus,
      razorpay_payment_id: payment_id,
      razorpay_order_id: order_id
    });
    await newRegistration.save();

    res.status(201).json({ message: 'Event registration successful', registration: newRegistration });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Error registering for event' });
  }
});

// Get all registered users
router.get('/admin/users', async (req, res) => {
  try {
    const users = await EventRegistration.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
