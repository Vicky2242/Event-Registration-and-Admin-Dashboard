const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpayInstance.orders.create({ amount: amount * 100, currency: 'INR' });
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Similarly, add the verifyPayment function here
