import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      // Optionally, you can log in the user after signing up
      if (response.ok) {
        alert('Signup successful');
      const data = await response.json();
      localStorage.setItem('token', data.token); // Store the token
      navigate('/admin/login'); 
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Admin Signup</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white mt-4 p-2 w-full rounded">
          Signup
        </button>
        
        <div className='text-center mt-4'>
          Already have an account?{' '}
          <Link to="/admin/login"
          className='text-blue-500 hover:underline'>Login</Link>
        </div>

      </form>
    </div>
  );
};

export default AdminSignup;
