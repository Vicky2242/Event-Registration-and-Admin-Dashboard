const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventRegistrationSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true }, 
  gender: { type: String, required: true },
  event: { type: String, required: true },
  price: { type: Number, required: true },
  payment_id: { type: String, required: true },
  order_id: { type: String, required: true },
  paymentstatus: { type: String, required: true },
  proofType: {type: String, required: true},
  filePath: {type: String, required: true}
});

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);
