import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();


      if (!response.ok) {
        throw new Error('Login failed');
      }

      if (response.ok) {
        alert('Login successful');
        localStorage.setItem('token', responseData.token); // Save token for future requests
        navigate('/admin'); // Redirect to dashboard
      } else {
        alert(`Login failed: ${responseData.message}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Admin Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div>
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
          Login
        </button>

        <div className='text-center mt-4'>
          Don't have an account?{' '}
          <Link to="/admin/signup"
          className='text-blue-500 hover:underline'>Sign up</Link>
        </div>

      </form>
    </div>
  );
};

export default AdminLogin;
