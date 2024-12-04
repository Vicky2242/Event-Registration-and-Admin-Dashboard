const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const EventRegistration = require('../models/EventRegistration');
const router = express.Router();
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_fX6ZXEAKnFZF3a',
  key_secret: 'MPuu6zi7fA8dzHv9JJCqO9m0'
});

// Admin signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/event-registrations', async (req, res) => {
  try {
    const registrations = await EventRegistration.find(); // Fetch all registrations from the DB
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

router.get('/event-registrations/:id', async (req, res) => {
  try {
    const registration = await EventRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registration' });
  }
});

router.put('/event-registrations/:id', async (req, res) => {
  const { name, email, dob, gender, event } = req.body;

  try {
    const registration = await EventRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Update fields
    registration.name = name || registration.name;
    registration.email = email || registration.email;
    registration.dob = dob || registration.dob;
    registration.gender = gender || registration.gender;
    registration.event = event || registration.event;

    await registration.save();
    res.json({ message: 'Register updated successfully', registration });
  } catch (error) {
    res.status(500).json({ message: 'Error updating registration' });
  }
});

router.delete('/event-registrations/:id', async (req, res) => {
  try {
    const registration = await EventRegistration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json({ message: 'Register deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting registration' });
  }
});

router.post('/register-event', async (req, res) => {
  console.log('Data received at server:', req.body); // Log the received data for debugging
  
  const { name, email, dob, gender, event, price, payment_id, order_id, paymentStatus } = req.body;

  // Check if all required fields are present
  if (!name || !email || !dob || !gender || !event || price === undefined || !paymentStatus) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!dob) missingFields.push('dob');
    if (!gender) missingFields.push('gender');
    if (!event) missingFields.push('event');
    if (price === undefined) missingFields.push('price');
    if (!payment_id) missingFields.push('payment_id');
    if (!order_id) missingFields.push('order_id');

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }
      try {
        // Create a new event registration
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
        
        // Save the registration to the database
        await newRegistration.save();
        
        // Send success response
        res.status(201).json({ message: 'Event registration successful', registration: newRegistration });
      } catch (error) {
        console.error('Error saving event registration:', error);
        res.status(500).json({ message: 'Error registering for event' });
      }
    });

module.exports = router;

