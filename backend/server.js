const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const multer = require('multer');
const fs = require('fs');
const path = require('path'); // Ensure this is included
const eventRoutes = require('./routes/event'); 
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const EventRegistration = require('./models/EventRegistration'); // Model for event registrations
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(bodyParser.json());
app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'downloads'); // Ensure 'downloads' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
});

app.use('/downloads', express.static(path.join(__dirname, 'downloads')));


const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// Routes
app.use('/api', eventRoutes); 
app.use('/api/razorpay', paymentRoutes);
app.use('/admin', adminRoutes); 

// Razorpay order creation route
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    if (!amount) return res.status(400).json({ message: 'Amount is required' });
    
    console.log('Creating order for amount:', amount);
    const options = {
      amount: amount * 1, // Amount in the smallest currency unit (paise for INR)
      currency: 'INR',
      payment_capture: 1,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Event registration
app.post('/api/register-event', upload.single('proof'), async (req, res) => {
  const { name, email, dob, age, gender, event, price, payment_id, order_id, paymentstatus, proofType } = req.body;

  // Logging received data for debugging
  console.log('Received data:', req.body);
  console.log('Uploaded file:', req.file);

  // Check if the file is uploaded
  if (!req.file) {
    console.error('File upload failed: No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    // Use EventRegistration model to create a new registration
    const registration = new EventRegistration({
      name,
      email,
      dob,
      age,
      gender,
      event,
      price,
      payment_id,
      order_id,
      paymentstatus,
      proofType,
      filePath: `/downloads/${req.file.filename}`, // Store the path of the uploaded file
    });

    await registration.save(); // Save to MongoDB
    console.log('Registration saved successfully:', registration);
    res.status(201).send({ message: 'Registration saved successfully.' });
  } catch (error) {
    console.error('Error saving registration:', error.message);
    res.status(500).send({ error: 'Failed to save registration.' });
  }
});


// Fetch event registrations for admin
app.get('/admin/event-registrations', async (req, res) => {
  try {
    const registrations = await EventRegistration.find(); 
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event registrations' });
  }
});

// Payment verification route
app.post('/verify-payment', async (req, res) => {
  const { payment_id, order_id, status, ...registrationData } = req.body;

  try {
    // Create a registration entry regardless of payment success or failure
    const registration = new EventRegistration({
      ...registrationData,
      payment_id,
      order_id,
      paymentstatus: status === 'success' ? 'success' : 'failed',
    });

    await registration.save(); // Save to MongoDB

    if (status === 'success') {
      res.status(200).json({ message: 'Payment successful and registered.' });
    } else {
      console.log('Payment failed, but registration recorded.');
      res.status(200).json({ message: 'Payment failed but logged successfully.' });
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/registration', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the "registration" MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Connect to the database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
