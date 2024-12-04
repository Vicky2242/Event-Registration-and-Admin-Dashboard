const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
require('dotenv').config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;  // Amount from the client side
  
  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,  // Razorpay takes amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    });

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error });
  }
});

module.exports = router;
