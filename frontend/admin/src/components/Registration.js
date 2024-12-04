import React, { useState } from 'react';
import axios from 'axios';

const EventRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [eventSelected, setEventSelected] = useState('');
  const [loading, setLoading] = useState(false); 
  const [price, setPrice] = useState(0);
  const [age, setAge] = useState(0);
  const [proofType, setProofType] = useState('');
  const [file, setFile] = useState(null);

  const events = [
    { id: 1, name: 'Music Concert', price: 1500 },
    { id: 2, name: 'Standup Comedy', price: 1300 },
    { id: 3, name: 'Food Court', price: 1700 },
  ];

  const handleEventChange = (e) => {
    const selectedEvent = events.find((event) => event.name === e.target.value);
    if (selectedEvent) {
      setEventSelected(selectedEvent.name);
      setPrice(selectedEvent.price);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const handleDobChange = (e) => {
    const selectedDob = e.target.value;
    setDob(selectedDob);
    const age = calculateAge(selectedDob);
    setAge(age); // Update the age state
  };

  const handleProofTypeChange =(event) => {
    setProofType(event.target.value);
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventSelected) {
      alert('Please select an event');
      return;
    }
  
    if(!proofType || !file){
      alert('Please select a proof type and upload a file');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('dob', dob);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('proofType', proofType);
      formData.append('event', eventSelected);
      formData.append('price', price);
      formData.append('proof', file);  // Append the file
  
      console.log('Event registration data:', formData);
      await handlePayment(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };
  
  const handlePayment = async (formData) => {
    const orderData = { amount: price * 100 }; // Amount is in paise (multiply by 100 for INR)
  
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/create-order', orderData);
      console.log('Order response:', response);
  
      const { id: order_id, amount: order_amount, currency } = response.data;
  
      if (!window.Razorpay) {
        alert('Razorpay SDK is not loaded');
        return;
      }
  
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_fX6ZXEAKnFZF3a',
        amount: order_amount,
        currency,
        name: 'RU Tech',
        description: 'Demo Payment',
        order_id,
        handler: async function (response) {
          alert('Payment Successful!');
  
          const paymentData = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            paymentstatus: 'success',
          };
  
          // Append payment details to formData
          formData.append('payment_id', paymentData.payment_id);
          formData.append('order_id', paymentData.order_id);
          formData.append('paymentstatus', paymentData.paymentstatus);
  
          try {
            console.log('Data being sent to server:', formData);
            await axios.post('http://localhost:8080/api/register-event', formData, {
              headers: {
                'Content-Type': 'multipart/form-data', // Required for file upload
              },
            });
            alert('Registration saved successfully after payment.');
          } catch (error) {
            console.error('Error saving registration after payment:', error);
            alert('Payment successful, but failed to save registration data.');
          }
        },
        prefill: {
          name,
          email,
        },
        theme: { color: '#3399cc' },
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment: ' + error.message);
  
      formData.append('paymentstatus', 'failed');
  
      try {
        await axios.post('http://localhost:8080/api/register-event', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error('Error saving registration data on payment failure:', error);
      }
      setLoading(false);
    }
  };
  

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl mb-6 font-bold text-center">Event Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-gray-700">Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700">Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-gray-700">Date of Birth:</label>
          <input
            type="date"
            value={dob}
            onChange={handleDobChange}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-gray-700">Age:</label>
          <input
            type="number"
            value={age} 
            readOnly 
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-gray-700">Gender:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          >
            <option value="" disabled>Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="event" className="block text-gray-700">Event:</label>
          <select
            value={eventSelected}
            onChange={handleEventChange}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          >
            <option value="" disabled>Select event</option>
            {events.map((event) => (
              <option key={event.id} value={event.name}>
                {event.name} (₹{event.price})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="proof" className="block text-gray-700">Select Proof:</label>
          <select
            value={proofType}
            onChange={handleProofTypeChange}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select Proof</option>
            <option value="aadhaar">Aadhaar</option>
            <option value="pan">PAN</option>
            <option value="driving_license">Driving License</option>
            <option value="passport">Passport</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label htmlFor="upload" className="block text-gray-700">Upload Proof (PDF, DOC, JPEG):</label>
          <input
            type="file"
            accept=".pdf,.doc,.jpeg,.jpg"
            onChange={handleFileChange}
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="price" className="block text-gray-700">Price: ₹{price}</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          {loading ? 'Processing...' : 'Register & Pay'}
        </button>
      </form>
    </div>
  </div>
);
 
};

export default EventRegistration;
